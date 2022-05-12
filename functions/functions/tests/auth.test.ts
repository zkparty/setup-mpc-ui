//import { testMatrix } from "firebase-functions/v1/testLab";
//import { Wallet} from 'ethers';

const ethers = require('ethers');
const AUTH_MESSAGE = require('../src/types/constants').AUTH_MESSAGE;

it('should match recovered address', async () => {

    // use test private key
    const privKey = '0000000000000000000000000000000000000000000000000000000000000001';
    const wallet = new ethers.Wallet(privKey);
    const ethAddress = wallet.address;
    console.info(`Address: ${ethAddress}`);
    // sign message
    const msg = AUTH_MESSAGE;
    const sig = await wallet.signMessage(msg);
    console.info(`Sig: ${sig}`);

    // ecrecover
    const digest = ethers.utils.hashMessage(msg);
    const recoveredAddr = ethers.utils.recoverAddress(digest, sig);

    // compare addresses
    expect(recoveredAddr).toBe(ethAddress);
});

it('should recover from metamask sig', async () => {
    const account = ethers.utils.getAddress('0x02fc6414a39d69868204f4afe5eea4e148340ec4');
    const sig = '0xb0138431a1fc5971cc1f1c6a14305b31aec9438f91555b3f4e29da2e6ec13b2518787260f3d5e065e0c4c2325d343faa2b3f143a0cab2af63efcc1642c3fe57f1b';

    const digest = ethers.utils.hashMessage(AUTH_MESSAGE);
    const recoveredAddr = ethers.utils.recoverAddress(digest, sig);

    expect(recoveredAddr).toBe(account);
});