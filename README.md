## Trusted Setup Phase 2 MPC

This repo has a suite of components for browser-based trusted setup ceremonies. 

### client
The client application is a node.js app to facilitate ceremony setup, monitoring, and contribution. 

Contribution computation is performed in the browser. The computation code
is compiled to WASM, based on [this repo](https://github.com/glamperd/phase2-bn254)

### functions
A node.js application providing code to be deployed as Firebase functions. These functions provide housekeeping services.

### server
A node.js application to provide server-side operations. The majority of server interaction is done by Firebase directly. A few operations, such as preparing circuit files, require server operations.

### Firebase back-end
Firebase provides these service:
* Authentication
* Database
* Storage - circuit files and contribution files
* Functions - periodically invoked operations
* Hosting - host for the client app

