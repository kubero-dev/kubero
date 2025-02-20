import { HttpException, HttpStatus, Injectable, Request } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { KubernetesService } from '../kubernetes/kubernetes.service';
import { ConfigService } from '../config/config.service';
import { AuditService } from '../audit/audit.service';
import { JwtService } from '@nestjs/jwt';
import { checkGithubEnabled, checkOauth2Enabled, checkLocalauthEnabled } from '../config/env/vars';

@Injectable()
export class AuthService {

  constructor(
    private usersService: UsersService,
    private kubectl: KubernetesService,
    private configService: ConfigService,
    private auditService: AuditService,
    private jwtService: JwtService
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && user.password === pass) {
      const { password, ...result } = user;
      return result;
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

  async login(username: string, password: string){
    const user = await this.validateUser(username, password);
    if (!user) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    const u = {
      userID: user.userID,
      username: user.username,
      strategy: 'local'
    }
    
    return {
      access_token: this.jwtService.sign(u),
    };
  }

  async loginOAuth2(username) {
    const user = await this.usersService.findOne(username); //find or create
    const u = {
      userID: user.userID,
      username: user.username,
      strategy: 'github'
    }
    return this.jwtService.sign(u);
    
  }

  async getSession(isAuthenticated): Promise<{ message: any; status: number }> {
    let status = 200;
    
    if (process.env.KUBERO_AUTHENTICATION === 'true') {
      if (!isAuthenticated) {
        return { message: 'Invalid token', status: 401 };
      }
    }


    const message = {
      isAuthenticated: isAuthenticated,
      version: process.env.npm_package_version,
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
      "local": checkLocalauthEnabled(),
      "github": checkGithubEnabled(),
      "oauth2": checkOauth2Enabled()
    }
    return methods
  }

}
