# Server API for Trusted Setup Ceremonies

The following web server was developed for other developers and teams to use it when building their own client. This application aims to replace the ```functions``` directory that is currently deployed on Firebase and uses Cloud Functions (Lambda functions).

## Overview
This API server will be deployed for a specific ceremony. For example:

1. **Ceremony A:** API server would be deployed at [https://aceremony.ethereum.org]()
2. **Ceremony B:** API server would be deployed at [https://bceremony.ethereum.org]()

This means that all the API endpoints would consider a single ceremony per server with multiple contributions, participants and ceremony states.

## Run the server
1. Clone repo: ```git clone https://github.com/zkparty/setup-mpc-ui```
2. Change directory: ```cd app-server```
3. Install dependencies: ```npm install```
4. Set up your configuration in the ```.env``` file
5. Run the development server: ```npm run dev```
6. Use the APIs in ```http://localhost:PORT/```