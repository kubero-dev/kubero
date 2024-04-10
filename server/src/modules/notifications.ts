import { Audit } from "./audit";
import { Server } from "socket.io";
import { Kubectl } from "./kubectl";


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
    public _io: Server;

    constructor(io: Server, audit: Audit, kubectl: Kubectl) {
        this.kubectl = kubectl;

        this.audit = audit;
        this._io = io;

    }

    public sendOLD(message: INotification) {
        this.sendWebsocketMessageOLD(message);
        this.createKubernetesEvent(message);
        this.writeAuditLog(message)
    }

    private sendWebsocketMessageOLD(n: INotification) {
        console.log('sendWebsocketMessage', n);
        this._io.emit(n.name, n);
    }

    public send(message: INotification, io: Server) {
        this.sendWebsocketMessage(message, io);
        this.createKubernetesEvent(message);
        this.writeAuditLog(message)
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
}