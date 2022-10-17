import debug from 'debug';
debug('app:auth')
import { Passport, Authenticator, AuthenticateOptions} from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import { Request, Response, NextFunction } from 'express';

import * as crypto from "crypto"
import axios from 'axios';

type User =  {
    id: number,
    method: string,
    username: string,
}

export class Auth {
    public passport: any;
    public authmethods = {
        local: false,
        github: false,
        oauth2: false,
    }
    public authentication: boolean;
    private users = []

    constructor() {
        this.passport = new Passport();

        (process.env.KUBERO_USERS) ? this.authmethods.local = true : this.authmethods.local = false;

        (process.env.GITHUB_CLIENT_ID &&
         process.env.GITHUB_CLIENT_SECRET &&
         process.env.GITHUB_CLIENT_CALLBACKURL ) ? this.authmethods.github = true : this.authmethods.github = false;

        (process.env.OAUTO2_CLIENT_NAME &&
         process.env.OAUTO2_CLIENT_AUTH_URL &&
         process.env.OAUTO2_CLIENT_TOKEN_URL &&
         process.env.OAUTH2_CLIENT_ID &&
         process.env.OAUTH2_CLIENT_SECRET &&
         process.env.OAUTH2_CLIENT_CALLBACKURL ) ? this.authmethods.oauth2 = true : this.authmethods.oauth2 = false;

        this.authentication = false;
        if (this.authmethods.local || this.authmethods.github || this.authmethods.oauth2) {
            this.authentication = true;
        }
    }

    init() {

        if (this.authmethods.local) {
            console.log("initialize Local Auth");

            try {
                const b = Buffer.from(process.env.KUBERO_USERS as string, 'base64').toString('ascii')
                this.users = JSON.parse(b);
            } catch (error) {
                console.log("ERROR loading local Users");
                debug.log(error);
            }
            debug.debug('loaded users: ' + JSON.stringify(this.users));

            this.passport.use(
                'local',
                new LocalStrategy({
                    usernameField: "username",
                    passwordField: "password"
                },
                (username, password, done) => {
                    let profile: any = this.users.find((u: any) => {
                        if (u.insecure) {
                            return u.username === username && u.password === password
                        } else if (!u.insecure && process.env.KUBER_SESSION_KEY) {
                            return u.username === username && u.password === crypto.createHmac('sha256', process.env.KUBER_SESSION_KEY).update(password).digest('hex')
                        }
                    })

                    if (profile) {
                        const user: User = {
                            method: 'local',
                            id: profile.id,
                            username: profile.username,
                        }
                        done(null, user)
                    } else {
                        done(null, false, { message: 'Incorrect username or password'})
                    }
                })
            )
        }

        if (this.authmethods.github) {
            console.log("initialize Github Auth");
            this.passport.use(
                'github',
                new GitHubStrategy({
                    clientID: process.env.GITHUB_CLIENT_ID as string,
                    clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
                    callbackURL: process.env.GITHUB_CLIENT_CALLBACKURL as string
                },
                async function(accessToken: string, refreshToken: string, profile: any, done: any) {
                    debug.debug( JSON.stringify(profile));

                    const orgas = await axios.get(profile._json.organizations_url)

                    //const orgAllowd = process.env.GITHUB_ORG || false
                    const org = orgas.data.find((o: any) => {
                        return o.login === process.env.GITHUB_CLIENT_ORG
                    } )

                    if (org) {
                        const user: User = {
                            method: 'github',
                            id: profile.id,
                            username: profile.username,
                        }

                        done(null, user);
                    } else {
                        console.log(profile.username+' is not in allowd organisation '+process.env.GITHUB_CLIENT_ORG)
                        done(null, false, { message: 'Not in allowd organisation'})
                    }
                })
            );
        }

        if (this.authmethods.oauth2) {
            this.passport.use(new OAuth2Strategy({
                authorizationURL: process.env.OAUTO2_CLIENT_AUTH_URL as string,
                tokenURL: process.env.OAUTO2_CLIENT_TOKEN_URL as string,
                clientID: process.env.OAUTH2_CLIENT_ID as string,
                clientSecret: process.env.OAUTH2_CLIENT_SECRET as string,
                callbackURL: process.env.OAUTH2_CLIENT_CALLBACKURL as string
            },
            function(accessToken: string, refreshToken: string, profile: any, done: any) {
                debug.debug( JSON.stringify(profile));

                const user: User = {
                    method: 'oauth2',
                    id: profile.id,
                    username: profile.username,
                }

                /*
                User.findOrCreate({ exampleId: profile.id }, function (err, user) {
                return done(null, user);
                });
                */
                done(null, user);
            }
            ));
        }

        this.passport.serializeUser((user: User, done: any) => {
            debug.debug(JSON.stringify(user))
            done(null, user)
        })

        this.passport.deserializeUser((authUser: any, done: any) => {
            debug.debug(JSON.stringify(authUser))

            // try to deserialize user from local environment
            let user: User | undefined = undefined;

            if (authUser.method === 'local') {
                user = this.users.find((user: User) => {
                return user.id === authUser.id
                })

                if (user) {
                    debug.debug("deserialize local user : "+ JSON.stringify(user));
                    done(null, user)
                }
            }

            if (authUser.method === 'github') {
                done(null, authUser);
            }

            if (authUser.method === 'oauth2') {
                done(null, authUser);
            }

        })
    }

    public authMiddleware(req: Request, res: Response, next: NextFunction) {
        if (!req.isAuthenticated()) {
            debug.debug("not authenticated")
            res.status(401).send('You are not authenticated')
        } else {
            debug.debug("authenticated")
            return next()
        }
    }

    private noAuthMiddleware(req: Request, res: Response, next: NextFunction) {
        return next()
    }

    public getAuthMiddleware() {
        if (this.authentication === true) {
            return this.authMiddleware;
        } else {
            // skip middleware if no users defined
            return this.noAuthMiddleware;
        }
    }
}