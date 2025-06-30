import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { KubernetesService } from '../kubernetes/kubernetes.service';
import { ConfigService } from '../config/config.service';
import { AuditService } from '../audit/audit.service';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { IUser } from './auth.interface';
import axios from 'axios';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private kubectl: KubernetesService,
    private configService: ConfigService,
    private auditService: AuditService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneFull(username);

    if (user) {
      if (process.env.KUBERO_SESSION_KEY === undefined) {
        this.logger.error('KUBERO_SESSION_KEY is not defined');
        throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      }

      // DEPRECATED in v3.0.0: sha256 is considered insecure hashing. Kept for backward compatibility
      const password = crypto
        .createHmac('sha256', process.env.KUBERO_SESSION_KEY)
        .update(pass)
        .digest('hex');

      if (user.password === undefined) {
        this.logger.warn(
          `User ${username} does not have a password set. Please set a password for the user.`,
        );
        return null;
      }

      const passwordMatch = await bcrypt.compare(pass, user.password);
      //if (passwordMatch) {
      if (user.password === password || passwordMatch) {
        const { password, ...result } = user;
        return result;
      }
    }
    return null;
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const decoded = this.jwtService.verify(token);
      return true;
    } catch (_error) {
      return false;
    }
  }

  async login(username: string, password: string) {
    const user = await this.validateUser(username, password);
    if (!user) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    // Defines the user object to be signed in the JWT
    // Add more fields if needed
    const u = {
      userId: user.id,
      username: user.username,
      role: user.role ? user.role.name : 'none',
      userGroups: user.userGroups ? user.userGroups.map((g) => g.name) : [],
      strategy: 'local',
    };

    return {
      access_token: this.jwtService.sign(u),
    };
  }

  async loginOAuth2(reqUser: any) {
    const username = reqUser.username || reqUser.email || reqUser.id;
    const email = reqUser.emails[0]?.value || reqUser.email || 'undefined@kubero.dev';
    const provider = reqUser.provider || 'oauth2';

    // extract image data from url 
    const image = reqUser.photos ? reqUser.photos[0]?.value : null;
    
    if (!username) {
      throw new HttpException('Username or email not found in OAuth2 user data', HttpStatus.BAD_REQUEST);
    }

    const user = await this.usersService.findOneOrCreate(username, email, provider, image) as any;
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const u = {
      userId: user.id,
      username: user.username,
      role: user.role ? user.role.name : 'none',
      userGroups: user.userGroups ? user.userGroups.map((g) => g.name) : [],
      strategy: 'oauth2',
    };
    return this.jwtService.sign(u);
  }

  async getSession(isAuthenticated): Promise<{ message: any; status: number }> {
    const status = 200;

    const message = {
      isAuthenticated: isAuthenticated,
      version: this.configService.getKuberoUIVersion(),
      kubernetesVersion: this.kubectl.getKubernetesVersion(),
      operatorVersion: this.kubectl.getOperatorVersion(),
      buildPipeline: this.configService.getBuildpipelineEnabled(),
      templatesEnabled: this.configService.getTemplateEnabled(),
      auditEnabled: this.auditService.getAuditEnabled(),
      adminDisabled: this.configService.checkAdminDisabled(),
      consoleEnabled: this.configService.getConsoleEnabled(),
      metricsEnabled: this.configService.getMetricsEnabled(),
      sleepEnabled: this.configService.getSleepEnabled(),
    };

    return { message: message, status: status };
  }

  getMethods(): { local: boolean; github: boolean; oauth2: boolean } {
    const methods = {
      local: ConfigService.getLocalauthEnabled(),
      github: ConfigService.getGithubEnabled(),
      oauth2: ConfigService.getOauth2Enabled(),
    };
    return methods;
  }
}
