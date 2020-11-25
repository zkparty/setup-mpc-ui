import { Ceremony, CeremonyEvent } from './../types/ceremony';
import firebase from 'firebase/app';
import "firebase/firestore";
import { jsonToCeremony } from './ZKPartyApi';

//const serviceAccount = require( 'firebase_skey.json');
export async function addCeremony(ceremony: Ceremony) {
    const db = firebase.firestore();
    try {
      const doc = await db.collection("ceremonies").add(ceremony);
  
      console.log(`new ceremony added with id ${doc.id}`)
      return doc.id;
    } catch (e) {
      throw new Error(`error adding ceremony data to firebase: ${e}`);
    }
};
  
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

export const ceremonyEventListener = async (ceremonyId: string | undefined, callback: (e: any) => void) => {
    const db = firebase.firestore();
    const query = db.collectionGroup("events");
    //const query = eventsCollection.where(, '==', ceremonyId);
  
    query.onSnapshot(querySnapshot => {
      //console.log(`Ceremony event notified: ${JSON.stringify(querySnapshot)}`);
      querySnapshot.forEach(docSnapshot => {
        var event = docSnapshot.data();
        const ceremony = docSnapshot.ref.parent.parent;
        console.log(`Event: ${JSON.stringify(event)} ceremony Id: ${ceremony?.id}`);
        if (ceremony?.id === ceremonyId) {
            switch (event.eventType) {
                case 'PREPARED': {break;}
                case 'STATUS_UPDATE': {
                    callback(event);
                    break;
                }
            }
        }
      });
    }, err => {
      console.log(`Error while listening for ceremony events ${err}`);
    });
};
  
export const ceremonyListener = async (callback: (c: Ceremony) => void) => {
    const db = firebase.firestore();
    const query = db.collectionGroup("ceremonies");
  
    query.onSnapshot(querySnapshot => {
      //console.log(`Ceremony event notified: ${JSON.stringify(querySnapshot)}`);
      querySnapshot.forEach(docSnapshot => {
        var ceremony = docSnapshot.data();
        console.log(`Ceremony: ${docSnapshot.id}`);
        callback(jsonToCeremony({id: docSnapshot.id, ...ceremony}));
      });
    }, err => {
      console.log(`Error while listening for ceremony changes ${err}`);
    });
};
  