import * as functions from 'firebase-functions';
import { DocumentSnapshot } from 'firebase-functions/lib/providers/firestore';

const fbAdmin = require('firebase-admin');

const RUNNING = "RUNNING";
const PRESELECTION = "PRESELECTION";


// Look for ceremonies that have been prepared and have a start time prior to 
// now, but aren't yet RUNNING. This will kick them off.
const CeremonyStarter = functions.pubsub.schedule('every 30 minutes').onRun(async (context) => {
  const db = fbAdmin.firestore();
  const snap = await db
    .collection("ceremonies")
    .where('ceremonyState', '==', PRESELECTION)
    .where('startTime', '<=', fbAdmin.firestore.Timestamp.now())
    .get();

  snap.forEach(async (ceremony: DocumentSnapshot) => {
      functions.logger.debug(`ceremony ${ceremony.id} is ready to start`);
      await ceremony.ref.set({'ceremonyState': RUNNING}, { merge: true });
      // add event
      await ceremony.ref.collection('events')
        .add({
            eventType: 'SET_RUNNING',
            sender: 'WATCHDOG',
            message: `Ceremony started`,
            timestamp: fbAdmin.firestore.Timestamp.now(),
          });
  });
});

export default CeremonyStarter;