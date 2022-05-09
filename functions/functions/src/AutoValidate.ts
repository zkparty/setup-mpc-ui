import * as functions from 'firebase-functions';

const fbAdmin = require('firebase-admin');


// Temporary function to auto-validate
const cctId: string = '8DGQ3FOGk4Msx8hNncti';

const AutoValidate = functions.firestore
  .document(`ceremonies/${cctId}/events/{eventId}`)
  .onCreate(async (snapshot, context) => {
    const event: any = snapshot.data();
    if (event.eventType === 'PARAMS_UPLOADED') {
      // create new event to automatically mark as verified
      const db = fbAdmin.firestore();
      await db.collection(`ceremonies/${cctId}/events`).add({
        index: event.index,
        eventType: 'VERIFIED',
        message: 'Auto-verified',
        sender: 'FUNCTION',
        timestamp: fbAdmin.firestore.Timestamp.now(),
      });
    }
  });

export default AutoValidate;