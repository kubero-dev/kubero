import express, { Request, Response, NextFunction } from 'express';
import { Auth } from '../modules/auth';
const Router = express.Router();
export const RouterAuth = Router;
export const auth = new Auth();
auth.init();
export const authMiddleware = auth.getAuthMiddleware();

Router.all("/session", (req: Request, res: Response) => {

    let status = 200
    let isAuthenticated = false

    if (auth.authentication === true) {
        isAuthenticated = req.isAuthenticated()
        if (!isAuthenticated) {
            status = 401
        }
    }

    let message = {
        "isAuthenticated": isAuthenticated,
        "version": process.env.npm_package_version,
    }
    res.status(status).send(message)
})

Router.get('/auth/github',
  auth.passport.authenticate('github', { scope: [ 'user:email' ] }));

Router.get('/auth/github/callback',
  auth.passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

Router.get('/auth/oauth2',
  auth.passport.authenticate('oauth2', { scope: [ 'user:email' ] }));

Router.get('/auth/oauth2/callback',
  auth.passport.authenticate('oauth2', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

// Send auth methods to display in the login page
Router.get('/auth/methods', function (req: Request, res: Response, next: NextFunction) {
    res.send(auth.authmethods);
})

// Login user
Router.post('/login', function(req: Request, res: Response, next: NextFunction) {
    auth.passport.authenticate("local", function (err: Error, user: Express.User, info: string) {
        if (err) {
            return next(err);
        }

        if (!user) {
            console.log("login error")
            return res.status(400).send([user, "Cannot log in", info]);
        }

        req.login(user, err => {
            console.log("logged in")
            res.send("Logged in");
        });
    })(req, res, next);
});

// Logout user
Router.get('/logout', authMiddleware, function (req: Request, res: Response, next: NextFunction) {
    req.logout({}, function (err: Error) {
        if (err) {
            return next(err);
        }
        res.send("Logged out");
    } as any);
    console.log("logged out")
    return res.send("logged out");
});
