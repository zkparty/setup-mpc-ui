import passport from 'passport';
import session from 'express-session';
import {config as dotEnvConfig} from 'dotenv';
import express, { Request, Response } from 'express';
import { Strategy as GitHubStrategy} from 'passport-github2';
import { loginParticipantWithAddress, loginParticipantWithGithub } from '../controllers/participant';
import { GithubUserProfile, LoginRequest } from '../models/request';


dotEnvConfig();

const PORT = process.env.PORT;
const DOMAIN = process.env.DOMAIN;
const GITHUB_CLIENT_ID: string = process.env.GITHUB_CLIENT_ID!;
const COOKIE_SESSION_SECRET = process.env.COOKIE_SESSION_SECRET!;
const GITHUB_CLIENT_SECRET: string = process.env.GITHUB_CLIENT_SECRET!;

passport.serializeUser(function(user: any, done: (err: any, id?: unknown) => void) {
  done(null, user);
});

passport.deserializeUser(function(obj: any, done: (err: any, id?: unknown) => void) {
  done(null, obj);
});

passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: `http://${DOMAIN}:${PORT}/participant/login/github/callback`
  },
  function(accessToken: any, refreshToken: any, profile: any, done: any) {
    // asynchronous verification, for effect...
    process.nextTick( () => {
      return done(null, profile);
    });
  }
));

const router = express.Router();
router.use(session({ secret: COOKIE_SESSION_SECRET, resave: false, saveUninitialized: false }));
router.use(passport.initialize());

/**
 * @api {post} /participant/login/address Log in as a ceremony participant using a public address
 * @apiName loginParticipantWithAddress
 * @apiGroup Participant
 * @apiDescription Every ceremony's participant needs to be logged in to
 * avoid sybil attacks (multiple accounts). The signature contains a shared message
 * and the address attribute is compared to the recovered address of the signature to authenticate
 * @apiBody {String} address="0xfAce669798EbFA92Ec1e47Adc86b1eA213F564bD"
 * @apiBody {String} signature="0x0b89b638bcb4dc234507bcc426ac2324bbb5e3c17ad68545a05c4d39f6e83a4c631a6a30e3af78c8f70c50dc797be24f660e622896e1c5456999507286c938541b"
 * @apiSuccess {String} token
 * @apiSuccess {String} message
 * @apiSuccess {Number} code
 * @apiError {String} message
 * @apiError {Number} code
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 OK
 *  {
 *    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjB4NUNhNTY1NjlENUNDNTA4MmMzOWEyYTAzMWEwYzYzMTQzMTYzOGI5NyIsImlhdCI6MTUxNjIzOTAyMn0.I8BXaPkl65vjwYpL7Xf3uDBhPusunGMb90pfCE7BxL8",
 *    "message": "Participant logged in",
 *    "code": 0
 *  }
 * @apiErrorExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "message": "Address is too new"
 *   "code": -1
 * }
 */
router.post('/login/address', async (req: Request, res: Response) => {
    const loginRequest = req.body as LoginRequest;
    const result = await loginParticipantWithAddress(loginRequest);
    res.json(result);
});

/**
 * @api {get} /participant/login/github Log in as a ceremony participant using a Github profile
 * @apiName loginParticipantWithGithub
 * @apiGroup Participant
 * @apiDescription Every ceremony's participant needs to be logged in to
 * avoid sybil attacks (multiple accounts). This route allows participants
 * to login using a Github account. Calling this URL in a browser would redirect
 * to Github for authorization and if approved, it would redirect back to the API callback route
 * @apiSuccess {String} token
 * @apiSuccess {String} message
 * @apiSuccess {Number} code
 * @apiError {String} message
 * @apiError {Number} code
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 OK
 *  {
 *    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjB4NUNhNTY1NjlENUNDNTA4MmMzOWEyYTAzMWEwYzYzMTQzMTYzOGI5NyIsImlhdCI6MTUxNjIzOTAyMn0.I8BXaPkl65vjwYpL7Xf3uDBhPusunGMb90pfCE7BxL8",
 *    "message": "Participant logged in",
 *    "code": 0
 *  }
 * @apiErrorExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "message": "Github profile created after minimum creation time"
 *   "code": -1
 * }
 */
router.get('/login/github', passport.authenticate('github', { scope: [ 'user:email' ] }), (_req: Request, _res: Response) => {});

/**
 * @api {get} /participant/login/github/callback API callback after Github authorization
 * @apiName GithubCallbackRoute
 * @apiGroup Participant
 * @apiDescription This route is used internally. The user calls the login with Github route,
 * authorizes the request in github.com and then it is redirected to this route for login or user creation.
 * @apiSampleRequest off
 */
router.get('/login/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), async (req: Request, res: Response) => {
    const githubUser = req.user! as GithubUserProfile;
    const result = await loginParticipantWithGithub(githubUser);
    res.send(result);
});

export{router};

