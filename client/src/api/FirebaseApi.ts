import admin from 'firebase-admin';
import { CeremonyEvent } from './../types/ceremony';

const serviceAccount = require( './../../server/firebase_skey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://trustedsetup-a86f4.firebaseio.com"
});
  
const db = admin.firestore();

export const addCeremonyEvent = async (event: CeremonyEvent) => {
    const doc = await db
      .collection("ceremonyEvents")
      .add(event);
};

