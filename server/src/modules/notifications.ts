import { Audit } from "./audit";
import { Server } from "socket.io";
import { Kubectl } from "./kubectl";
import { IKuberoConfig, INotificationSlack, INotificationWebhook} from "../types";


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

export interface INotificationDiscord {
    url: string;
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
        this.sendAllGlobalCustomNotification(message);
    }
    private sendWebsocketMessage(n: INotification, io: Server) {
        console.log('sendWebsocketMessage', n);
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

    private sendAllGlobalCustomNotification(message: INotification) {
        this.config.notifications.forEach(notification => {
            if (notification.enabled) {
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
        // URL : https://hooks.slack.com/services/XXXXXXXXX/XXXXXXXXX/XXXXXXXXXXXXXXXXXXXXXXXX
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
    }

    private sendWebhookNotification(message: INotification, config: INotificationWebhook) {
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
    }

    private sendDiscordNotification(message: INotification, config: INotificationDiscord) {
        //URL : https://discord.com/api/webhooks/YYYYYYYYY/XXXXXX
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
    }
}