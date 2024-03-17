import express, { Request, Response, NextFunction } from 'express';
import { Auth } from '../modules/auth';
const Router = express.Router();
export const RouterAuth = Router;
export const auth = new Auth();
auth.init();
export const authMiddleware = auth.getAuthMiddleware();

Router.all("/session", (req: Request, res: Response) => {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Get the session status'

    let status = 200
    let isAuthenticated = false
    let templatesEnabled = true

    if (auth.authentication === true) {
        isAuthenticated = req.isAuthenticated()
        if (!isAuthenticated) {
            status = 401
        }
    }

    let buildPipeline = false
    if ( process.env.KUBERO_BUILD_REGISTRY != undefined ) {
        buildPipeline = true
    } 


    templatesEnabled = true

    let message = {
        "isAuthenticated": isAuthenticated,
        "version": process.env.npm_package_version,
        "kubernetesVersion": req.app.locals.kubero.getKubernetesVersion(),
        "buildPipeline": buildPipeline,
        "templatesEnabled": req.app.locals.kubero.getTemplateEnabled(),
        "auditEnabled": req.app.locals.audit.getAuditEnabled(),
        "adminDisabled": req.app.locals.kubero.getAdminDisabled(),
        "consoleEnabled": req.app.locals.kubero.getConsoleEnabled(),
    }
    res.status(status).send(message)
})

Router.get('/auth/github',
// #swagger.tags = ['UI']
  // #swagger.summary = 'Authenticate with github'
  auth.passport.authenticate('github', { scope: [ 'user:email' ] }));

Router.get('/auth/github/callback',
  // #swagger.tags = ['UI']
  // #swagger.summary = 'Github Authentication Callback'
  auth.passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.cookie('kubero.websocketToken', process.env.KUBERO_WS_TOKEN);
    res.redirect('/');
  });

Router.get('/auth/oauth2',
  // #swagger.tags = ['UI']
  // #swagger.summary = 'Authenticate with oauth2'
  auth.passport.authenticate('oauth2'));

Router.get('/auth/oauth2/callback',
  // #swagger.tags = ['UI']
  // #swagger.summary = 'Oauth2 Authentication Callback'
  auth.passport.authenticate('oauth2', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.cookie('kubero.websocketToken', process.env.KUBERO_WS_TOKEN);
    res.redirect('/');
  });

// Send auth methods to display in the login page
Router.get('/auth/methods', function (req: Request, res: Response, next: NextFunction) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Get the available authentication methods'
    res.send(auth.authmethods);
})

// Login user
Router.post('/login', function(req: Request, res: Response, next: NextFunction) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Login with username and password'
    auth.passport.authenticate("local", function (err: Error, user: Express.User, info: string) {
        if (err) {
            return next(err);
        }

        if (!user) {
            console.log("login error")
            return res.status(400).send([user, "Cannot log in", info]);
        }

        req.login(user, err => {
            if (err) {
                return next(err);
            }
            res.cookie('kubero.websocketToken', process.env.KUBERO_WS_TOKEN);
            console.log("logged in")
            res.send("Logged in");
        });
    })(req, res, next);
});

// Logout user
Router.get('/logout', authMiddleware, function (req: Request, res: Response, next: NextFunction) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Logout and destroy the session'
    req.logout({}, function (err: Error) {
        if (err) {
            return next(err);
        }
        res.send("Logged out");
    } as any);
    console.log("logged out")
    return res.send("logged out");
});
