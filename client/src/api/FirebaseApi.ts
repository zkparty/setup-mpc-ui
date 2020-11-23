import { CeremonyEvent } from './../types/ceremony';
import firebase from 'firebase/app';
import "firebase/firestore";

//const serviceAccount = require( 'firebase_skey.json');

export const addCeremonyEvent = async (ceremonyId: string, event: CeremonyEvent) => {
    const db = firebase.firestore();

    try {
        const doc = await db
            .doc(`ceremonies/${ceremonyId}`)
            .collection("events")
            .doc();
        
        await doc.set(event);
        console.log(`added event ${doc.id}`);
    } catch (e) { throw new Error(`Error adding event: ${e.message}`);}
};

