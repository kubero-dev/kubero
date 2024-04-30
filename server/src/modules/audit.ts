​import { Database } from 'sqlite3';
import * as fs from 'fs';

export interface AuditEntry {
    user: string,
    severity: "normal" | "info" | "warning" | "critical" | "error" | "unknown",
    action: string,
    resource: 'system' | 'app' | 'pipeline' | 'phase' | 'namespace' | 'addon' | 'settings' | 'user' | 'events' | 'security' | 'templates' | 'config' | 'addons' | 'kubernetes' | 'unknown',
    //resource: string,
    namespace: string,
    phase: string,
    app: string,
    pipeline: string,
    message: string,
}

export class Audit {

    private db: Database | undefined;
    private logmaxbackups: number = 1000;
    private enabled: boolean = true;
    private dbpath: string = './db';

    constructor(dbpath: string = './db', logmaxbackups: number = 1000) {
        if (process.env.KUBERO_AUDIT !== 'true') {
            this.enabled = false;
            return;
        }
        this.dbpath = dbpath;
        this.logmaxbackups = logmaxbackups;
    }

    public async init() {
        if (!this.enabled) {
            return;
        }

        if (!fs.existsSync(this.dbpath)){
            try {
                fs.mkdirSync(this.dbpath);
            } catch (error) {
                console.error(error);
            }
        }
        this.db = new Database(this.dbpath + '/kubero.db', (err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('✅ Enabled audit logging');
            this.createTables();
        });
    }

    private createTables() {
        this.db?.run(`CREATE TABLE IF NOT EXISTS audit (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            user TEXT,
            action TEXT,
            namespace TEXT,
            phase TEXT,
            app TEXT,
            pipeline TEXT,
            resource TEXT,
            message TEXT
        )`, (err) => {
            if (err) {
                console.log(err);
            }
        });
    }

    public logDelayed(entry: AuditEntry, delay: number = 1000) {
        setTimeout(() => {
            this.log(entry);
        }, delay);
    }

    public log(entry: AuditEntry) {
        //console.log("log")
        //console.log(entry)
        if (!this.enabled) {
            return;
        }
        this.db?.run(`INSERT INTO audit (
                user, 
                action, 
                namespace, 
                phase, 
                app, 
                pipeline, 
                resource, 
                message
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
                entry.user, 
                entry.action, 
                entry.namespace, 
                entry.phase, 
                entry.app, 
                entry.pipeline, 
                entry.resource, 
                entry.message
            ], (err) => {
                if (err) {
                    console.log(err);
                }
            }
        );
        
        this.limit(this.logmaxbackups);
    }

    public get(limit: number = 100): Promise<AuditEntry[]> {
        if (!this.enabled) {
            return new Promise((resolve) => {
                resolve([]);
            });
        }
        return new Promise((resolve, reject) => {
            this.db?.all(`SELECT * FROM audit ORDER BY timestamp DESC LIMIT ?`, [limit], (err, rows) => {
                if (err) {
                    reject(err);
                }
                resolve(rows as AuditEntry[]);
            });
        });
    }

    public getFiltered(limit: number = 100, filter: string = ''): Promise<AuditEntry[]> {
        if (!this.enabled) {
            return new Promise((resolve) => {
                resolve([]);
            });
        }
        return new Promise((resolve, reject) => {
            this.db?.all(`SELECT * FROM audit WHERE message LIKE ? ORDER BY timestamp DESC LIMIT ?`, ['%'+filter+'%', limit], (err, rows) => {
                if (err) {
                    reject(err);
                }
                resolve(rows as AuditEntry[]);
            });
        });
    }

    public getAppEntries(pipeline: string, phase: string, app: string, limit: number = 100): Promise<AuditEntry[]> {
        if (!this.enabled) {
            return new Promise((resolve) => {
                resolve([]);
            });
        }
        return new Promise((resolve, reject) => {
            this.db?.all(`SELECT * FROM audit WHERE pipeline = ? AND phase = ? AND app = ? ORDER BY timestamp DESC LIMIT ?`, [pipeline, phase, app, limit], (err, rows) => {
                if (err) {
                    reject(err);
                }
                resolve(rows as AuditEntry[]);
            });
        });
    };

    public getPhaseEntries(phase: string, limit: number = 100): Promise<AuditEntry[]> {
        if (!this.enabled) {
            return new Promise((resolve, reject) => {
                resolve([]);
            });
        }
        return new Promise((resolve, reject) => {
            this.db?.all(`SELECT * FROM audit WHERE phase = ? ORDER BY timestamp DESC LIMIT ?`, [phase, limit], (err, rows) => {
                if (err) {
                    reject(err);
                }
                resolve(rows as AuditEntry[]);
            });
        });
    };

    public getPipelineEntries(pipeline: string, limit: number = 100): Promise<AuditEntry[]> {
        if (!this.enabled) {
            return new Promise((resolve, reject) => {
                resolve([]);
            });
        }
        return new Promise((resolve, reject) => {
            this.db?.all(`SELECT * FROM audit WHERE pipeline = ? ORDER BY timestamp DESC LIMIT ?`, [pipeline, limit], (err, rows) => {
                if (err) {
                    reject(err);
                }
                resolve(rows as AuditEntry[]);
            });
        });
    };

    private flush(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db?.run(`DELETE FROM audit`, (err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
    }

    private close(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db?.close((err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
    }

    public async reset(): Promise<void> {
        if (!this.enabled) {
            return;
        }
        await this.flush();
        await this.close();
        fs.unlinkSync('./db/kubero.db');
        this.db = new Database('./db/kubero.db', (err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Connected to the kubero database.');
        });
        this.createTables();
    }

    // remove the oldest entries from database if the limit is reached
    private limit = (limit: number = 1000) => {
        this.db?.run(`DELETE FROM audit WHERE id IN (SELECT id FROM audit ORDER BY timestamp DESC LIMIT -1 OFFSET ?)`, [limit], (err) => {
            if (err) {
                console.log(err);
            }
        })
    }

    public count(): Promise<number> {
        if (!this.enabled) {
            return new Promise((resolve, reject) => {
                resolve(0);
            });
        }
        return new Promise((resolve, reject) => {
            this.db?.get(`SELECT COUNT(*) as entries FROM audit`, (err, row) => {
                if (err) {
                    reject(err);
                }
                resolve((row as any)['entries'] as number);
            });
        });
    }

    public getAuditEnabled(): boolean {
        return this.enabled;
    }


}