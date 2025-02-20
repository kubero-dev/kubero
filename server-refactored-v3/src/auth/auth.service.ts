import { HttpException, HttpStatus, Injectable, Request } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { KubernetesService } from '../kubernetes/kubernetes.service';
import { SettingsService } from '../settings/settings.service';
import { AuditService } from '../audit/audit.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  private methods = {
    "local": true,
    "github": true,
    "oauth2": true
  }

  constructor(
    private usersService: UsersService,
    private kubectl: KubernetesService,
    private settingsService: SettingsService,
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
      buildPipeline: this.settingsService.getBuildpipelineEnabled(),
      templatesEnabled: this.settingsService.getTemplateEnabled(),
      auditEnabled: this.auditService.getAuditEnabled(),
      adminDisabled: this.settingsService.checkAdminDisabled(),
      consoleEnabled: this.settingsService.getConsoleEnabled(),
      metricsEnabled: this.settingsService.getMetricsEnabled(),
      sleepEnabled: this.settingsService.getSleepEnabled(),
    };

    return { message: message, status: status };
  }

  getMethods() {
    return this.methods
  }

}
