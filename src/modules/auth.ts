import debug from 'debug';
debug('app:auth')
import { Passport, Authenticator, AuthenticateOptions} from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

type User =  {
    id: number,
    username: string,
    password: string,
}

export class Auth {
    public passport: any;
    private users = [
        {
            id: 1,
            username: "admin",
            password: "admin"
        }
    ]

    constructor() {
        this.passport = new Passport();

        if (process.env.KUBERO_USERS) {
            try {
                const b = Buffer.from(process.env.KUBERO_USERS, 'base64').toString('ascii')
                this.users = JSON.parse(b);
            } catch (error) {
                console.log("ERROR loading local Users");
                debug.log(error);
            }
            debug.log('users', this.users);
        }
    }

    init() {
        this.passport.use(
            'local',
            new LocalStrategy({
                usernameField: "username",
                passwordField: "password"
            }, 
            (username, password, done) => {
                let user = this.users.find((user: User) => {
                return user.username === username && user.password === password
                })
        
                if (user) {
                done(null, user)
                } else {
                done(null, false, { message: 'Incorrect username or password'})
                }
            })
        )
        this.passport.serializeUser((user: User, done: any) => {
            //done(null, user.id)
            done(null, user.id)
        })
        this.passport.deserializeUser((id: number, done: any) => {
            let user = this.users.find((user: User) => {
            return user.id === id
            })
        
            done(null, user)
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