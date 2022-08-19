import passport from 'passport';
import {config as dotEnvConfig} from 'dotenv';
import express, { Request, Response } from 'express';
import { Strategy as GitHubStrategy} from 'passport-github2';
import { loginParticipantWithAddress, authenticateParticipant } from '../controllers/participant';
import { LoginRequest } from '../models/request';

dotEnvConfig();

const PORT = process.env.PORT;
const DOMAIN = process.env.DOMAIN;
const GITHUB_CLIENT_ID: string = process.env.GITHUB_CLIENT_ID!;
const GITHUB_CLIENT_SECRET: string = process.env.GITHUB_CLIENT_SECRET!;

passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: `http://${DOMAIN}:${PORT}/login/github/callback`
  },
  function(accessToken: any, refreshToken: any, profile: any, done: any) {
    // asynchronous verification, for effect...
    process.nextTick( () => {
      return done(null, profile);
    });
  }
));

const router = express.Router();
router.use(passport.initialize());

/**
 * @api {post} /participant/login/address Log in as a ceremony participant
 * @apiName loginParticipant
 * @apiGroup Participant
 * @apiDescription Every ceremony's participant needs to be logged in to
 * avoid sybil attacks (multiple accounts).
 * @apiBody {String} title="A Test Ceremony"
 * @apiBody {String} description="This is a test for API development"
 * @apiSuccess {String} token
 * @apiSuccess {String} message
 * @apiSuccess {Number} code
 * @apiError {String} message
 * @apiError {Number} code
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 OK
 *  {
 *    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjB4NUNhNTY1NjlENUNDNTA4MmMzOWEyYTAzMWEwYzYzMTQzMTYzOGI5NyIsImlhdCI6MTUxNjIzOTAyMn0.I8BXaPkl65vjwYpL7Xf3uDBhPusunGMb90pfCE7BxL8",
 *    "message": "User logged in",
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

router.get('/login/github', passport.authenticate('github', { scope: [ 'user:email' ] }), (req: Request, res: Response) => {});

router.get('/login/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req: Request, res: Response) => {
    // TODO
    const githubUser = req.user;
    res.send(githubUser);
});


// TODO: /queue/join route
router.get('/queue/join', authenticateParticipant, async (req: Request, res: Response) => {
    res.json('Hello');
});

export{router};

