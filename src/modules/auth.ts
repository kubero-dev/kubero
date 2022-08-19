import debug from 'debug';
debug('app:auth')
import { Passport, Authenticator, AuthenticateOptions} from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GitHubStrategy } from 'passport-github2';

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
    }
    private users = []

    constructor() {
        this.passport = new Passport();

        (process.env.KUBERO_USERS) ? this.authmethods.local = true : this.authmethods.local = false;

        (process.env.GITHUB_CLIENT_ID && 
         process.env.GITHUB_CLIENT_SECRET && 
         process.env.GITHUB_CLIENT_CALLBACKURL ) ? this.authmethods.github = true : this.authmethods.github = false;
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
            debug.log('users', this.users);

            this.passport.use(
                'local',
                new LocalStrategy({
                    usernameField: "username",
                    passwordField: "password"
                }, 
                (username, password, done) => {
                    let profile: any = this.users.find((u: any) => {
                    return u.username === username && u.password === password
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
                function(accessToken: string, refreshToken: string, profile: any, done: any) {
                    console.log(profile);
                    // TODO Check if User is in requred github Organisatio. Rquires a extra call to github API.
                    const user: User = {
                        method: 'github',
                        id: profile.id,
                        username: profile.username,
                    }

                    done(null, user);
                })
            );
        }

        this.passport.serializeUser((user: User, done: any) => {
            console.log(user)
            done(null, user)
        })

        this.passport.deserializeUser((authUser: any, done: any) => {
            console.log(authUser)

            // try to deserialize user from local environment
            let user: User | undefined = undefined; 
            
            if (authUser.method === 'local') {
                user = this.users.find((user: User) => {
                return user.id === authUser.id
                })

                if (user) {
                    console.log("deserialize local user", user);
                    done(null, user)
                }
            }

            if (authUser.method === 'github') {
                done(null, authUser);
            }
            
        })
    }
}

/*

export let passport = new Passport();

if (process.env.KUBERO_USERS) {
    let users: User[] = [];
    try {
        const b = Buffer.from(process.env.KUBERO_USERS, 'base64').toString('ascii')
        users = JSON.parse(b);
    } catch (error) {
        console.log("ERROR loading local Users");
        debug.log(error);
    }
    debug.log(`users`, users);

    passport.use(
        'local',
        new LocalStrategy(
        {
            usernameField: "username",
            passwordField: "password"
        },
        (username, password, done) => {
            let user: User | undefined = users.find((user: User) => {
            return user.username === username && user.password === password
            })
    
            if (user) {
            done(null, user)
            } else {
            done(null, false, { message: 'Incorrect username or password'})
            }
        }
        )
    )
    passport.serializeUser((user: any, done) => {
        //done(null, user.id)
        done(null, user.id)
    })
    passport.deserializeUser((id, done) => {
        let user = users.find((user: User) => {
        return user.id === id
        })
    
        done(null, user)
    })
}
/**/ 