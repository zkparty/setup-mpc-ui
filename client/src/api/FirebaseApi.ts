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

const ceremonyEventListener = async () => {
    const db = firebase.firestore();
    const eventsCollection = db.collectionGroup("events");
    const query = eventsCollection.where('acknowledged', '==', false);
  
    query.onSnapshot(querySnapshot => {
      //console.log(`Ceremony event notified: ${JSON.stringify(querySnapshot)}`);
      querySnapshot.forEach(docSnapshot => {
        var event = docSnapshot.data();
        const ceremony = docSnapshot.ref.parent.parent;
        console.log(`Event: ${JSON.stringify(event)} ceremony Id: ${ceremony?.id}`);
        switch (event.eventType) {
          case 'CIRCUIT_FILE_UPLOAD': {
            break;
          }
          case 'PREPARED': {break;}
          case 'CREATE': {break;}
        }
      });
    }, err => {
      console.log(`Error while listening for ceremony events ${err}`);
    });
  };
  
  