import { Wallet } from 'ethers';

// to sign using ``` node signMessage.mjs ``` in a terminal
async function signWithPrivateKey() {
  const privateKey = '222a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be01';
  const wallet = new Wallet(privateKey);
  const message = 'I want to participate in the ceremony';
  const signature = await wallet.signMessage(message);
  // Keep in mind the comma after the address value below
  console.log('"address": "%s",', wallet.address)
  console.log('"signature": "%s"', signature)
}

// to sign using Metamask in the dev-tools console of the browser
async function signUsingMetamask(){
  const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
  const account = accounts[0];
  const message = 'I want to participate in the ceremony';
  const signature = await window.ethereum.request({method: 'personal_sign', params: [message, account]});
  console.log('"address": "%s"', account)
  console.log('"signature": "%s"', signature)
}

// Execute
signWithPrivateKey();
