import { Audit } from "./audit";
import { Server } from "socket.io";
import { Kubectl } from "./kubectl";
import { IKuberoConfig } from "../types";


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
                this.sendCustomNotification(notification.type, {
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

    private sendCustomNotification(type: string, message: INotification) {
        switch (type) {
            case 'slack':
                this.sendSlackNotification(message);
                break;
            case 'webhook':
                this.sendWebhookNotification(message);
                break;
            case 'discord':
                this.sendDiscordNotification(message);
                break;
            default:
                console.log('unknown notification type', type);
                break;
        }
    }

    private sendSlackNotification(message: INotification) {
        console.log('sendSlackNotification', message);
    }

    private sendWebhookNotification(message: INotification) {
        console.log('sendWebhookNotification', message);
    }

    private sendDiscordNotification(message: INotification) {
        console.log('sendDiscordNotification', message);
    }
}