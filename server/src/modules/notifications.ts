import { Audit } from "./audit";
import { Server } from "socket.io";
import { Kubectl } from "./kubectl";
import { IKuberoConfig, INotificationSlack, INotificationWebhook, INotificationDiscord, INotificationConfig} from "../types";


export interface INotification {
    name: string,
    user: string,
    resource: "system" | "app" | "pipeline" | "phase" | "namespace" | "addon" | "settings" | "user" | "events" | "security" | "templates" | "config" | "addons" | "kubernetes" | "unknown",
    action: string,
    severity: "normal" | "info" | "warning" | "critical" | "error" | "unknown",
    message: string,
    phaseName: string,
    pipelineName: string,
    appName: string,
    data?: any
}

export class Notifications {
    
    public kubectl: Kubectl;
    private audit: Audit;
    private _io: Server;
    private config: IKuberoConfig;

    constructor(io: Server, audit: Audit, kubectl: Kubectl) {
        this.kubectl = kubectl;

        this.audit = audit;
        this._io = io;
        
        this.config = {} as IKuberoConfig;
    }

    public setConfig(config: IKuberoConfig) {
        this.config = config;
    }
    
    public send(message: INotification, io: Server) {
        this.sendWebsocketMessage(message, io);
        this.createKubernetesEvent(message);
        this.writeAuditLog(message)

        this.sendAllCustomNotification(this.config.notifications, message);

        /* requires configuration in pipeline and app form 
        if (message.data && message.data.app && message.data.app.notifications) {
            this.sendAllCustomNotification(message.data.app.notifications, message);
        }

        if (message.data && message.data.pipeline && message.data.pipeline.notifications) {
            this.sendAllCustomNotification(message.data.pipeline.notifications, message);
        }
        */
    }
    private sendWebsocketMessage(n: INotification, io: Server) {
        //console.log('sendWebsocketMessage', n); // debug
        io.emit(n.name, n);
    }

    private createKubernetesEvent(n: INotification) {
        this.kubectl.createEvent(
            'Normal', 
            n.action.replace(/^./, str => str.toUpperCase()), 
            n.name, 
            n.message,
        );
    }

    private writeAuditLog(n: INotification) {
        this.audit?.log({
            action: n.action,
            user: n.user,
            severity: n.severity,
            namespace: n.appName+'-'+n.phaseName,
            phase: n.phaseName,
            app: n.appName,
            pipeline: n.pipelineName,
            resource: n.resource,
            message: n.message,
        });
    }

    public sendDelayed(message: INotification, io: Server) {
        setTimeout(() => {
            this.send(message, io);
        }, 1000);
    }

    private sendAllCustomNotification(notifications: INotificationConfig[], message: INotification) {
        if (!notifications) {
            return;
        }
        notifications.forEach(notification => {
            if (notification.enabled && 
                notification.events.includes(message.name) &&
                (notification.pipelines.length == 0 || notification.pipelines.includes('all') || notification.pipelines.includes(message.pipelineName))
                ) {
                this.sendCustomNotification(notification.type, 
                notification.config,
                {
                    name: notification.name,
                    user: message.user,
                    resource: message.resource,
                    action: message.action,
                    severity: message.severity,
                    message: message.message,
                    phaseName: message.phaseName,
                    pipelineName: message.pipelineName,
                    appName: message.appName,
                    data: message.data
                });
            }
        });
    }

    private sendCustomNotification(type: string, config: any, message: INotification) {
        switch (type) {
            case 'slack':
                this.sendSlackNotification(message, config as INotificationSlack);
                break;
            case 'webhook':
                this.sendWebhookNotification(message, config as INotificationWebhook);
                break;
            case 'discord':
                this.sendDiscordNotification(message, config as INotificationDiscord);
                break;
            default:
                console.log('unknown notification type', type);
                break;
        }
    }

    private sendSlackNotification(message: INotification, config: INotificationSlack) {
        // Docs: https://api.slack.com/messaging/webhooks#posting_with_webhooks
        fetch(config.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: message.message,
            })
        })
        .then( res => console.log('Slack notification sent to '+config.url+' with status '+res.status))
        //.then(json => console.log(json));
        .catch( err => console.log('Slack notification failed to '+config.url+' with error '+err))
    }

    private sendWebhookNotification(message: INotification, config: INotificationWebhook) {
        fetch(config.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                secret: config.secret
            })
        })
        .then( res => console.log('Webhook notification sent to '+config.url+' with status '+res.status))
        .catch( err => console.log('Webhook notification failed to '+config.url+' with error '+err))
    }

    private sendDiscordNotification(message: INotification, config: INotificationDiscord) {
        //Docs: https://discord.com/developers/docs/resources/webhook#execute-webhook
        fetch(config.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: message.message,
            })
        })
        .then( res => console.log('Discord notification sent to '+config.url+' with status '+res.status))
        .catch( err => console.log('Discord notification failed to '+config.url+' with error '+err))
    }
}