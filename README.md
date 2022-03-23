## Trusted Setup Phase 2 MPC

This repo has a suite of components for browser-based trusted setup ceremonies. 

### client
The client application is a node.js app to facilitate ceremony setup, monitoring, and contribution. 

Contribution computation is performed in the browser. The computation code
is compiled to WASM, based on [this repo](https://github.com/glamperd/phase2-bn254), a fork of [Kobi Gurkan's phase 2 computation module](https://github.com/kobigurk/phase2-bn254) with these changes:
* For the WASM build, return the result hash to the caller.
* Also for the WASM build: Progress is reported by invoking a callback.
* Corrected errors in progress report count totals. 

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

-----------

## Verifying the ceremony files
At the completion of the ceremony, the project team will perform some finalisation tasks on the contribution files, after which they will be ready for use in production. Several files will be made available for public download. These will include:
* The phase 1 powers-of-tau files that were used in the ceremony preparation. 
* The circuit `r1cs` files, one for each circuit.
* The final `zkey` file, one for each circuit.

Also, the following information will be published:
* The Ethereum block number used as a finalisation beacon.
* The full list of circuits, including the name of the `r1cs` file, and the name of the powers-of-tau file used.

Verification is done using `snarkjs`. Installation instructions can be found [here](https://github.com/iden3/snarkjs). You'll need node.js installed, and commands will be be run from the command line. 

To verify a circuit's `zkey` file, you'll need to download the files mentioned above. Use the ```snarkjs zkey verify``` command. It takes three parameters:
* the `r1cs` file name
* the phase 1 file name
* the `zkey` file name

For example, take a circuit named `zk_transaction_4_4.r1cs`. It required the `pot17_final.ptau` powers-of-tau file, and it's finalised `zkey` file is `zk_transaction_4_4_final.zkey`. This command will display the verification transcript:

```snarkjs zkv zk_transaction_4_4.r1cs pot17_final.tau zk_transaction_4_4_final.zkey```

This will display something like the following:
```
[INFO]  snarkJS: Reading r1cs
[INFO]  snarkJS: Reading tauG1
[INFO]  snarkJS: Reading tauG2
[INFO]  snarkJS: Reading alphatauG1
[INFO]  snarkJS: Reading betatauG1
[INFO]  snarkJS: Circuit hash: 
		076f1880 a5eac5da bdf69911 90d3cba4
		a05c9a64 11b81325 d61ffd75 7e5e2425
		03650143 0a4b09eb e0e3c94f 2359360b
		56c4fda6 f1b8456d c4ed2586 da0fe730
[INFO]  snarkJS: Circuit Hash: 
		076f1880 a5eac5da bdf69911 90d3cba4
		a05c9a64 11b81325 d61ffd75 7e5e2425
		03650143 0a4b09eb e0e3c94f 2359360b
		56c4fda6 f1b8456d c4ed2586 da0fe730
[INFO]  snarkJS: -------------------------
[INFO]  snarkJS: contribution #53 :
		d06556ad 60ad3817 487ef848 7b6eda17
		6f25f7c1 9d3a66a5 4772676f 3fc2b252
		a051080b f94f4310 d89e3844 6d12c3ee
		bdb6c5cf 339cbfda 53c6e402 d8f48484
[INFO]  snarkJS: Beacon generator: b93b8a8d53b32b9faf257b794f678707a6f8f0d0e1bdecaacdb104ad0ff16802
[INFO]  snarkJS: Beacon iterations Exp: 10
[INFO]  snarkJS: -------------------------
[INFO]  snarkJS: contribution #52 stonebell-au (102):
		72dc45c9 67b725fe b6ca6e3c 0ccb4f75
		561d8e81 608f7838 3cb4fc79 792b9583
		f872f70d a359c8c2 97ecde0d f582b135
		9d400820 ee719798 762dfd0e 35060770
...(intermediate contribution hashes removed for brevity)...
[INFO]  snarkJS: contribution #2 betty_1992 (4):
		b3deda54 9d7508a2 8426c6b7 14f7e845
		e3129503 95879a4e d3d1f6a3 03e60c9f
		415ef0d2 65161711 cb5ecc7e 20141c91
		5b1f5ff4 4360b17f 780ba8a4 855b1849
[INFO]  snarkJS: -------------------------
[INFO]  snarkJS: contribution #1 johnny555 (1):
		686cd69d d94cf412 1f146290 d6b69170
		000dd6eb cd459c51 5196a427 3250d593
		5395377a 1992b08f bb3259ef 891503d7
		65d774e5 887f73f3 c44df749 e1667320
[INFO]  snarkJS: -------------------------
[INFO]  snarkJS: ZKey Ok!
```
Things to note from the transcript:
* Contributions are reported from latest to earliest. The first contribution reported is from the beacon. It is followed by participant contributions in reverse order.
* The hexadecimal string under 'Beacon generator' must match the hash of the Ethereum block used to generate the beacon. This can be compared using a block explorer, such as [etherscan](https://etherscan.io). 
* If you made a contribution yourself and noted your hash for this circuit, verify it by locating your contribution, using your GitHub user name.
* Other contributors' hashes can be verified using their public attestations. 
  * For those that tweeted their attestation, the tweet will link to a GitHub gist that contains the hashes for all circuits. 
  * Otherwise, the gist can be located using their GitHub name, as reported in the transcript. 


--------

Copyright ©️ 2022, Stonebell Consulting Pty Ltd

License: ISC

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
