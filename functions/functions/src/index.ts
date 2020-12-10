import * as functions from 'firebase-functions';

// import { Ceremony, CeremonyEvent, CeremonyState, 
//     Contribution, ContributionState, ContributionSummary, 
//     Participant, ParticipantState } from './types/ceremony';
import firebase from 'firebase/app';
import "firebase/firestore";
import firebaseConfig from './firebaseConfig';
//import { jsonToCeremony, jsonToContribution } from './ZKPartyApi';
  
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
// const ceremonyConverter: firebase.firestore.FirestoreDataConverter<Ceremony> = {
//     toFirestore: (c: Ceremony) => {
//       return c;
//     },
//     fromFirestore: (
//       snapshot: firebase.firestore.QueryDocumentSnapshot,
//       options: firebase.firestore.SnapshotOptions): Ceremony => {
//       return jsonToCeremony({id: snapshot.id, ...snapshot.data(options)});
//     }
//   }
  
// const contributionConverter: firebase.firestore.FirestoreDataConverter<ContributionSummary> = {
//     toFirestore: (c: ContributionSummary) => {
//         return c;
//     },
//     fromFirestore: (
//         snapshot: firebase.firestore.QueryDocumentSnapshot,
//         options: firebase.firestore.SnapshotOptions): ContributionSummary => {
//         return jsonToContribution(snapshot.data(options));
//     }
// }

firebase.initializeApp(firebaseConfig);


export const ContributionWatchdog = functions.firestore
  .document('ceremonies/{cId}/contributions/{contribId}')
  .onUpdate((change, context) => { 
      if (change.after.data().status === 'RUNNING') {
        const contribId = context.params.contribId;
        // Start timeout timer
        functions.logger.info(`contribution status for ${contribId} is now ${change.after.data().status}`);
        // submit pubsub scheduled task
      } else if (change.after.data().status === 'COMPLETE') {
        functions.logger.info(`contribution ${context.params.contribId} is COMPLETE`);

      }
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve('done');
        }, 200);
      });
   }); 

export const TimeoutWatchdog = functions.pubsub.schedule('every 3 minutes').onRun(async (context) => {
  functions.logger.debug(`pubsub check ${context.eventType}`);
  const db = firebase.firestore();
  const snap = await db
    .collectionGroup("contributions")
    .where('status', '==', 'RUNNING')
    .get();

    snap.forEach(async contrib => {
      functions.logger.debug(`contribution ${contrib.id} is running`);
      const ceremony = contrib.ref.parent ? contrib.ref.parent.parent : undefined;
      functions.logger.debug(`ceremony id ${ceremony?.id}`);
      if (ceremony) {
        const events = await 
          ceremony
          .collection('events')
          .orderBy('timestamp', 'desc')
          .limit(1)
          .get();
        let lastSeen = 0;
        if (!events.empty) {
          lastSeen = events.docs[0].get('timestamp')/1000;
        };
        functions.logger.debug(`age ${(Date.now() - lastSeen)/1000} s`);
        if ((Date.now() - lastSeen) > 300000) {
          functions.logger.info(`expired contribution ${contrib.id}`);
          await contrib.ref.update({'status': 'INVALIDATED'});
          // add event
        }
      }
    });
    //  } else {
    //    functions.logger.debug('no running contributions');
    //  }
});