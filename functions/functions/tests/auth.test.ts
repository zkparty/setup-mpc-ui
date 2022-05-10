//import { testMatrix } from "firebase-functions/v1/testLab";
//import { Wallet} from 'ethers';

const ethers = require('ethers');

it('should match recovered address', async () => {

    // use test private key
    const privKey = '0000000000000000000000000000000000000000000000000000000000000001';
    const wallet = new ethers.Wallet(privKey);
    const ethAddress = wallet.address;
    console.info(`Address: ${ethAddress}`);
    // sign message
    const msg = 'ZKParty sign-in';
    const sig = await wallet.signMessage(msg);
    console.info(`Sig: ${sig}`);

    // ecrecover
    const digest = ethers.utils.hashMessage(msg);
    const recoveredAddr = ethers.utils.recoverAddress(digest, sig);

    // compare addresses
    expect(recoveredAddr).toBe(ethAddress);
});