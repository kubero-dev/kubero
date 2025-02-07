import { Injectable, Request } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { KubernetesService } from '../kubernetes/kubernetes.service';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private kubectl: KubernetesService,
    private settingsService: SettingsService
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && user.password === pass) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  getSession(req: Request,): { message: any, status: number } {

    let isAuthenticated = false
    let status = 200
/*
    if (auth.authentication === true) {
        isAuthenticated = req.isAuthenticated()
        if (!isAuthenticated) {
            status = 401
        }
    }
*/

    let message = {
        "isAuthenticated": isAuthenticated,
        "version": process.env.npm_package_version,
        "kubernetesVersion": this.kubectl.getKubeVersion(),
        "operatorVersion": this.kubectl.getOperatorVersion(),
        "buildPipeline": this.settingsService.getBuildpipelineEnabled(),
        "templatesEnabled": this.settingsService.getTemplateEnabled(),
        //"auditEnabled": req.app.locals.audit.getAuditEnabled(),
        "adminDisabled": this.settingsService.checkAdminDisabled(),
        "consoleEnabled": this.settingsService.getConsoleEnabled(),
        "metricsEnabled": this.settingsService.getMetricsEnabled(),
        "sleepEnabled": this.settingsService.getSleepEnabled(),
    }

    return { message: message, status: status }
  }
}