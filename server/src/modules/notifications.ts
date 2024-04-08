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
    private _io: Server;
    private execStreams: {[key: string]: {websocket: WebSocket, stream: any}} = {};

    constructor(io: Server, audit: Audit, kubectl: Kubectl) {
        this.kubectl = kubectl;

        this.audit = audit;
        this._io = io;

        this._io.on('connection', client => {
            client.on('terminal', (data: any) => {
                //console.log('terminal input', data.data);
                //console.log('ws.OPEN', ws.readyState == ws.OPEN);
                //console.log(ws.url);
                //console.log(ws.eventNames());
                //execStream.write(data.data);
                if (this.execStreams[data.room]) {
                    this.execStreams[data.room].stream.write(data.data);
                }
                //this.execStreams[data.room].stream.write(data.data);
            }
            )}
        );
    }

    public sendWebhook(message: INotification) {
        this.sendWebsocketMessage(message);
        this.createKubernetesEvent(message);
        this.writeAuditLog(message)
    }

    private sendWebsocketMessage(n: INotification) {
        this._io.emit(n.name, n);
    }

    private createKubernetesEvent(n: INotification) {
        this.kubectl.createEvent(
            'Normal', 
            n.action, 
            n.name, 
            n.message,
        );
    }

    private writeAuditLog(n: INotification) {
        this.audit?.log({
            action: n.name,
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