import { Injectable, Request } from '@nestjs/common';
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

  private JWT_SECRET: string = 'CHANGEME'; 

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

  async login(user: any){ //TODO: use a type for user
    console.log("user: ", user)
    const payload = { username: user.username, sub: user.userId };
    console.log("payload: ", payload)
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  getSession(req: Request): { message: any; status: number } {
    const isAuthenticated = false;
    const status = 200;
    /*
    if (auth.authentication === true) {
        isAuthenticated = req.isAuthenticated()
        if (!isAuthenticated) {
            status = 401
        }
    }
*/

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
