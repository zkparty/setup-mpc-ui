import * as functions from 'firebase-functions';

import firebase from 'firebase/app';
import "firebase/firestore";
import firebaseConfig from './firebaseConfig';

firebase.initializeApp(firebaseConfig);


// export const ContributionWatchdog = functions.firestore
//   .document('ceremonies/{cId}/contributions/{contribId}')
//   .onUpdate((change, context) => { 
//       if (change.after.data().status === 'RUNNING') {
//         const contribId = context.params.contribId;
//         // Start timeout timer
//         functions.logger.info(`contribution status for ${contribId} is now ${change.after.data().status}`);
//         // submit pubsub scheduled task
//       } else if (change.after.data().status === 'COMPLETE') {
//         functions.logger.info(`contribution ${context.params.contribId} is COMPLETE`);

//       }
//       return new Promise((resolve) => {
//         setTimeout(() => {
//           resolve('done');
//         }, 200);
//       });
//    }); 

// This watchdog will look for RUNNING contributions, then 
// check for the most recent activity (using events) for the ceremony.
// Inactive contributions will be marked INVALIDATED, which will allow
// a new contributor to start.
export const TimeoutWatchdog = functions.pubsub.schedule('every 10 minutes').onRun(async (context) => {
  //functions.logger.debug(`pubsub check ${context.eventType}`);
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
          lastSeen = events.docs[0].get('timestamp').seconds;
          functions.logger.debug(`have events ${lastSeen}`);
        };
        const age = (Date.now()/1000 - lastSeen);
        functions.logger.debug(`age ${age} s`);
        if (age > 300) {
          functions.logger.info(`expired contribution ${contrib.id}`);
          await contrib.ref.update({'status': 'INVALIDATED'});
          // add event
          await ceremony.collection('events')
            .add({
              eventType: 'INVALIDATED',
              index: contrib.get('queueIndex'),
              sender: 'WATCHDOG',
              message: `No activity detected for ${age} seconds`,
              timestamp: firebase.firestore.Timestamp.now(),
            });
        }
      }
    });
});