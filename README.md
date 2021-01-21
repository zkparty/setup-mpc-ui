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


Copyright ©️ 2021, Stonebell Consulting Pty Ltd

License: ISC

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
