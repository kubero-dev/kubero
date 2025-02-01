import { Injectable } from '@nestjs/common';

@Injectable()
export class CommonService {
    getSession(): any {

/*
        let session = {
            "isAuthenticated": isAuthenticated,
            "version": process.env.npm_package_version,
            "kubernetesVersion": req.app.locals.kubero.getKubernetesVersion(),
            "operatorVersion": req.app.locals.kubero.getOperatorVersion(),
            "buildPipeline": req.app.locals.kubero.getBuildpipelineEnabled(),
            "templatesEnabled": req.app.locals.kubero.getTemplateEnabled(),
            "auditEnabled": req.app.locals.audit.getAuditEnabled(),
            "adminDisabled": req.app.locals.kubero.getAdminDisabled(),
            "consoleEnabled": req.app.locals.kubero.getConsoleEnabled(),
            "metricsEnabled": req.app.locals.kubero.getMetricsEnabled(),
            "sleepEnabled": req.app.locals.kubero.getSleepEnabled(),
        }
*/
        let session = {
            "isAuthenticated": false,
        }
        return session;
    }
}
