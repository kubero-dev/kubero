import {
  Injectable,
  Logger,
  NotImplementedException,
  OnApplicationBootstrap,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomBytes, randomUUID } from 'crypto';
import { importJWK, exportJWK, JWK, SignJWT, generateKeyPair } from 'jose';
import { KubernetesService } from '../kubernetes/kubernetes.service';
import { truncate } from 'fs/promises';
import { truncateSync } from 'fs';

interface NameMatchExact {
  kind: 'exact';
  name: string;
}

interface NameMatchAny {
  kind: 'any';
}

type NameMatch = NameMatchExact | NameMatchAny;

type PermissionType = 'repository';

/**
 * This class models a permission that is granted to a RegistryUser.
 */
export class Permission {
  public actions: Set<string>;

  constructor(
    public type: PermissionType,
    public name: NameMatch,
    actions: Set<string> | string[],
  ) {
    this.actions = actions instanceof Set ? actions : new Set(actions);
  }

  toObject() {
    return {
      type: this.type,
      name:
        this.name.kind === 'exact'
          ? { kind: 'exact' as const, name: this.name.name }
          : { kind: 'any' as const },
      actions: Array.from(this.actions),
    };
  }

  equals(other: Permission) {
    if (this.type !== other.type) {
      return false;
    }

    if (this.name.kind !== other.name.kind) {
      return false;
    }

    return (
      Array.from(this.actions.values()).sort() ==
      Array.from(other.actions.values()).sort()
    );
  }

  static fromObject(obj: any): Permission {
    const actions = Array.isArray(obj.actions)
      ? new Set<string>(obj.actions)
      : new Set<string>();

    const name: NameMatch =
      obj.name?.kind === 'exact'
        ? { kind: 'exact', name: obj.name.name }
        : { kind: 'any' };

    return new Permission(obj.type, name, actions);
  }

  static fromObjectArray(objArray: any): Permission[] {
    if (!Array.isArray(objArray)) {
      return [];
    }
    return objArray.map((obj) => Permission.fromObject(obj));
  }
}

/**
 * This class models a Scope that is requested by the registry.
 */
export class RegistryScope {
  constructor(
    public type: string,
    public name: string,
    public actions: Set<string>,
  ) {}

  toObject() {
    return {
      type: this.type,
      name: this.name,
      actions: Array.from(this.actions),
    };
  }

  static fromObject(obj: any): RegistryScope {
    const actions = Array.isArray(obj.actions)
      ? new Set<string>(obj.actions)
      : new Set<string>();
    return new RegistryScope(obj.type, obj.name, actions);
  }

  static fromObjectArray(objArray: any): RegistryScope[] {
    if (!Array.isArray(objArray)) {
      return [];
    }
    return objArray.map((obj) => RegistryScope.fromObject(obj));
  }
}

@Injectable()
export class RegistryService implements OnApplicationBootstrap {
  private readonly logger = new Logger(RegistryService.name);

  private jwk: CryptoKeyPair;

  private registryHostname: string;

  private readonly jwk_algo = 'ES256';

  constructor(
    private prisma: PrismaClient,
    private kubectl: KubernetesService,
  ) {}

  public async onApplicationBootstrap() {
    if (!process.env.KUBERO_BUILD_REGISTRY) {
      return;
    }
    this.registryHostname = process.env.KUBERO_BUILD_REGISTRY;
    await this.maybeProvisionRegistryJwk();
    await this.maybeProvisionPullCredential();
  }

  private async maybeProvisionRegistryJwk() {
    const tryJwk = await this.tryGetRegistryJwkPrivate();
    if (!tryJwk) {
      this.logger.log(
        'Private JWK for registry not found in kubernetes or invalid; generating one',
      );
      this.jwk = await this.provisionRegistryJwkPrivate();
    } else {
      this.jwk = tryJwk;
    }

    if (!(await this.isRegistryJwkPublicValid())) {
      this.logger.log(
        "Public JWK not found in kubernetes, invalid or doesn't match private key; provisioning from privatekey",
      );
      await this.kubectl.upsertSecret('registry-jwt-pubkey', {
        jwk: JSON.stringify(this.jwk.publicKey),
      });
    }
  }

  private jwkPubkeysEqual(keyA, keyB) {
    return (
      keyA.crv === keyB.crv &&
      keyA.kty === keyB.kty &&
      keyA.x === keyB.x &&
      keyA.y === keyB.y
    );
  }

  private async isRegistryJwkPublicValid() {
    let secretJwkPublic = await this.kubectl.getSecret('registry-jwt-pubkey');
    if (!secretJwkPublic || !secretJwkPublic.jwk) {
      return false;
    }

    let jwkPublic = JSON.parse(secretJwkPublic.jwk);
    if (!jwkPublic) {
      return false;
    }
    return this.jwkPubkeysEqual(jwkPublic, this.jwk.publicKey);
  }

  private async tryGetRegistryJwkPrivate(): Promise<null | CryptoKeyPair> {
    let secretJwkPrivate = await this.kubectl.getSecret('registry-jwt-privkey');
    if (!secretJwkPrivate || !secretJwkPrivate.privateKey) {
      return null;
    }
    const jwkPrivateJson = JSON.parse(secretJwkPrivate.privateKey);
    if (!jwkPrivateJson) {
      return null;
    }

    if (!secretJwkPrivate.publicKey) {
      return null;
    }

    const jwkPublicJson = JSON.parse(secretJwkPrivate.publicKey);
    if (!jwkPublicJson) {
      return null;
    }

    return {
      publicKey: jwkPublicJson,
      privateKey: jwkPrivateJson,
    };
  }

  private async provisionRegistryJwkPrivate(): Promise<{
    privateKey: CryptoKey;
    publicKey: CryptoKey;
  }> {
    const generatedKey = await generateKeyPair(this.jwk_algo, {
      extractable: true,
    });
    const exportedPrivateKey = await exportJWK(generatedKey.privateKey);
    const exportedPublicKey = await exportJWK(generatedKey.publicKey);

    this.kubectl.upsertSecret('registry-jwt-privkey', {
      privateKey: JSON.stringify(exportedPrivateKey),
      publicKey: JSON.stringify(exportedPublicKey),
    });

    return generatedKey;
  }

  public async addRegistryUser(
    username: string,
    password: string,
    permissions: Permission[],
  ) {
    // TODO expiration
    await this.prisma.registryUser.create({
      data: {
        username: username,
        password: bcrypt.hashSync(password, 10),
        scope: permissions.map((p) => p.toObject()),
      },
    });
  }

  private randomPassword() {
    return randomBytes(30).toString('base64').substring(0, 30);
  }

  public async makeTemporaryPushCredentialsForImage(
    authorizedImage: string,
  ): Promise<{ username: string; password: string }> {
    const registryUsername = randomUUID();
    const registryPassword = this.randomPassword();
    const permission = new Permission(
      'repository',
      { kind: 'exact', name: authorizedImage },
      new Set(['pull', 'push']),
    );
    this.addRegistryUser(registryUsername, registryPassword, [permission]);

    return {
      username: registryUsername,
      password: registryPassword,
    };
  }

  private parseScope(scope: String) {
    const [ressourceType, ressourceName, ressourceActionStr] = scope.split(':');
    if (!ressourceType || !['repository', 'registry'].includes(ressourceType)) {
      this.logger.debug(
        `parseScope: missing or invalid ressourceType "${ressourceType}"`,
      );
      return null;
    }

    if (!ressourceName || !ressourceActionStr) {
      this.logger.debug(
        `parseScope: missing ressourceName "${ressourceName}" or ressourceActionStr "${ressourceActionStr}`,
      );
      return null;
    }

    const ressourceActions = new Set<string>(ressourceActionStr.split(','));

    return new RegistryScope(ressourceType, ressourceName, ressourceActions);
  }

  private parseRequestedScopes(scope: string | string[]) {
    const requestedScopes = Array.isArray(scope) ? scope : [scope];
    const parsedScopes: Array<RegistryScope> = [];

    for (const scopeStr of requestedScopes) {
      const parsed = this.parseScope(scopeStr);
      if (!parsed) {
        throw new UnauthorizedException('Invalid scope format');
      }
      parsedScopes.push(parsed);
    }

    return parsedScopes;
  }

  /**
   * Find the scopes in requestedScopes that are authorized by the given permissions.
   * @param requestedScopes the scopes to check the permissions against
   * @param permissions the permissions the user has
   * @returns the requestedScopes that are covered by the given permissions
   */
  private findAuthorizedScopes(
    requestedScopes: RegistryScope[],
    permissions: Permission[],
  ): Array<RegistryScope> {
    const grantedScopes: RegistryScope[] = [];

    for (const requestedScope of requestedScopes) {
      // Find matching permission by type and name
      const matchingPermission = permissions.find((permission: Permission) => {
        if (permission.type != requestedScope.type) {
          return false;
        }
        switch (permission.name.kind) {
          case 'any':
            return true;
          case 'exact':
            return requestedScope.name == permission.name.name;
          default:
            throw new NotImplementedException();
        }
      });

      if (!matchingPermission) {
        // Skip scopes that don't have a matching permission
        continue;
      }

      // Compute intersection of actions
      const allowedActions = matchingPermission.actions || [];
      let grantedActions = new Set<string>();
      for (const a of allowedActions) {
        if (requestedScope.actions.has(a)) {
          grantedActions.add(a);
        }
      }

      // Only include scope if at least one action is granted
      if (grantedActions.size > 0) {
        grantedScopes.push(
          new RegistryScope(
            matchingPermission.type,
            // use the name from the requestedScope since the permission may have a match-all for the name
            requestedScope.name,
            grantedActions,
          ),
        );
      }
    }

    return grantedScopes;
  }

  async generateToken(
    username: string,
    password: string,
    service: string,
    scope: string | string[],
  ): Promise<string> {
    if (service !== this.registryHostname) {
      this.logger.verbose(
        `invalid service: ${service} != ${this.registryHostname}`,
      );
      throw new UnauthorizedException('Invalid service');
    }

    const registryUser = await this.verifyPassword(username, password);
    if (!registryUser) {
      this.logger.verbose(`invalid credentials: ${registryUser}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const parsedScopes = this.parseRequestedScopes(scope);

    const allowedScopes = Permission.fromObjectArray(registryUser.scope);

    const grantedScopes = this.findAuthorizedScopes(
      parsedScopes,
      allowedScopes,
    );

    return this.signJwt(username, grantedScopes);
  }

  private async signJwt(subjectName: string, grantedScopes: RegistryScope[]) {
    const jwtprivkeystr = JSON.parse(
      process.env.KUBERO_REGISTRY_JWT_KEY_PRIVATE || '{}',
    );
    const jwtprivkey = await importJWK(jwtprivkeystr, this.jwk_algo);

    var token = await new SignJWT({
      access: grantedScopes.map((scope) => scope.toObject()),
    })
      .setProtectedHeader({ alg: this.jwk_algo, kid: '0' })
      .setIssuedAt()
      .setIssuer('todo.kubero.dev') // TODO
      .setSubject(subjectName)
      .setAudience(this.registryHostname)
      .setExpirationTime('3h') // TODO clamp to user expiration
      .sign(jwtprivkey);

    return token;
  }

  private async verifyPassword(username: string, password: string) {
    const registryUser = await this.prisma.registryUser.findFirst({
      where: { username: username },
    });

    if (!registryUser) {
      return null;
    }
    const isUserExpired =
      registryUser.expiresAt && registryUser.expiresAt < new Date();
    if (isUserExpired) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      registryUser.password,
    );
    if (!isPasswordValid) {
      return null;
    }

    return registryUser;
  }

  private async isPullCredentialValid() {
    const pullCredentials = await this.kubectl.getSecret('registry-login');

    if (
      !pullCredentials ||
      !pullCredentials.username ||
      !pullCredentials.password ||
      !pullCredentials['.dockerconfigjson']
    ) {
      return false;
    }

    const pullUser = await this.verifyPassword(
      pullCredentials.username,
      pullCredentials.password,
    );
    if (!pullUser) {
      return false;
    }

    if (!Array.isArray(pullUser.scope) || !pullUser.scope.length) {
      return false;
    }

    const permission = Permission.fromObject(pullUser.scope[0]);
    if (
      !permission ||
      !permission.equals(
        new Permission(
          'repository',
          { kind: 'any' },
          new Set<string>(['pull']),
        ),
      )
    ) {
      return false;
    }

    const dockerconfig = JSON.parse(pullCredentials['.dockerconfigjson']);
    if (
      !dockerconfig ||
      !dockerconfig.auths ||
      typeof dockerconfig.auths !== 'object'
    ) {
      return false;
    }

    if (!dockerconfig.auths[this.registryHostname]) {
      return false;
    }

    const auth = dockerconfig.auths[this.registryHostname].auth;
    const expectedAuth = this.encodeCredentialsDockerAuthConfig(
      pullCredentials.username,
      pullCredentials.password,
    );
    return auth === expectedAuth;
  }

  private encodeCredentialsDockerAuthConfig(
    username: string,
    password: string,
  ) {
    const authString = `${username}:${password}`;
    return Buffer.from(authString).toString('base64');
  }

  private makeDockerAuthConfig(username: string, password: string) {
    return {
      auths: {
        [this.registryHostname]: {
          auth: this.encodeCredentialsDockerAuthConfig(username, password),
        },
      },
    };
  }

  private async maybeProvisionPullCredential() {
    if (await this.isPullCredentialValid()) {
      return;
    }

    this.logger.log(
      'No pull credentials for kubernetes found or credentials invalid, creating.',
    );

    const password = this.randomPassword();
    const username = `k8s-pull-${randomUUID()}`;
    const permission = new Permission(
      'repository',
      { kind: 'any' },
      new Set<string>(['pull']),
    );
    this.addRegistryUser(username, password, [permission]);

    const secret = {
      username,
      password,
      '.dockerconfigjson': JSON.stringify(
        this.makeDockerAuthConfig(username, password),
      ),
    };

    await this.kubectl.upsertSecret('registry-login', secret);
  }
}
