import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  Request,
  Type,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { KubernetesService } from '../kubernetes/kubernetes.service';
import { ConfigService } from '../config/config.service';
import { AuditService } from '../audit/audit.service';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

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
    const user = await this.usersService.findOne(username);

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
    } catch (e) {
      return false;
    }
  }

  async login(username: string, password: string) {
    const user = await this.validateUser(username, password);
    if (!user) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    const u = {
      userId: user.userId,
      username: user.username,
      strategy: 'local',
    };

    return {
      access_token: this.jwtService.sign(u),
    };
  }

  async loginOAuth2(username) {
    const user = await this.usersService.findOne(username); //TODO: find or create
    const u = {
      userId: user.userId,
      username: user.username,
      strategy: 'github',
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
