# **API Server for Trusted Setup Ceremonies**

The following web server was developed for other developers and teams to use it when building their own client. This application aims to replace the ```functions``` directory that is currently deployed on Firebase and uses Cloud Functions (Lambda functions).

## **Overview**
This API server will be deployed for a specific ceremony. For example:

1. **Ceremony A:** API server would be deployed at [https://aceremony.ethereum.org]()
2. **Ceremony B:** API server would be deployed at [https://bceremony.ethereum.org]()

This means that all the API endpoints would consider a single ceremony per server with multiple contributions, participants and ceremony states.

## **Authentication**
To access and interact with most of the API endpoints, users would need a JWT access token. The authentication process to obtain this token can be performed in two ways:
1. **Login using a wallet:** the client-side application would sign a specific message with a private key and send it to this API ```/participant/login``` endpoint to authenticate. The server would create a user if it does not exist or just send the access JWT token.
2. **Login using Github:** the Login With Github functionality should be implemented on the client-side following the [Firebase guides](https://firebase.google.com/docs/auth/web/github-auth). At the end of the authentication flow between the client application and Github, the client-side would have an access token by executing ```firebase.auth().currentUser.getIdToken()```. The token could be used as an access token to the API server.

## **Run server in development mode**
1. Clone repo: ```git clone https://github.com/zkparty/setup-mpc-ui```
2. Change directory: ```cd app-server```
3. Install dependencies: ```npm install```
4. Set up your configuration in the ```.env``` file
5. Set up your ```firebase_skey.json``` file in the ```/src``` directory
6. Run the development server: ```npm run dev```
7. Use the APIs in ```http://localhost:PORT/```

## **Run server in production mode**
1. Clone repo: ```git clone https://github.com/zkparty/setup-mpc-ui```
2. Change directory: ```cd app-server```
3. Install dependencies: ```npm install```
4. Set up your configuration in the ```.env``` file
5. Set up your ```firebase_skey.json``` file in the ```/src``` directory
6. Install [PM2](https://pm2.keymetrics.io/): ```npm install pm2 -g```
7. Build the project for production: ```npx tsc```
8. Run the production server: ```pm2 start dist/index.js -i 0``` (the *-i 0* flag indicates that app can use all available clusters)
9.  Use the APIs in ```http://localhost:PORT/```

The following commands might be useful for managing PM2-running applications:
1. ```pm2 status```: shows all applications (running or stopped). If app was clusterified then it would show all processes
2. ```pm2 stop [appName | fileName ]```: stops all proccesses related to that specific application
3. ```pm2 delete [appName | fileName ]```: delete all proccesses related to that specific application from PM2