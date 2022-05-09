import * as functions from 'firebase-functions';
import { DocumentSnapshot } from 'firebase-functions/lib/providers/firestore';

const fbAdmin = require('firebase-admin');

const COMPLETE = "COMPLETE";
const INVALIDATED = "INVALIDATED";
const RUNNING = "RUNNING";
const WAITING = "WAITING";


// This watchdog will look for RUNNING and WAITING contributions, then 
// check for the most recent activity (using events) for the circuit.
// Inactive contributions will be marked INVALIDATED, which will allow
// a new contributor to start.
const TimeoutWatchdog = functions.pubsub.schedule('every 2 minutes').onRun(async (context) => {
  //functions.logger.debug(`pubsub check ${context.eventType}`);
  const db = fbAdmin.firestore();

  const ceremonySnap = await db.collection('ceremonies')
    .where('ceremonyState', '==', RUNNING)
    .get();

  functions.logger.debug(`${ceremonySnap.size} ceremonies running`);

  ceremonySnap.forEach(async (ceremony: DocumentSnapshot) => {
    //functions.logger.debug(` ceremony ${ceremony.id}`);

    // Get last complete contribution. 
    const lastComplete = await ceremony.ref.collection('contributions')
      .orderBy('queueIndex')
      .where('status', 'in', [COMPLETE, INVALIDATED])
      .limitToLast(1)
      .get();
    //functions.logger.debug(`got lastComplete ${lastComplete.size}`);
    
    const lastCompleteIndex = (lastComplete.empty) ? 0 : lastComplete.docs[0].get('queueIndex');
    //functions.logger.debug(` last complete ${lastCompleteIndex} ${ceremony.id}`);

    // Get the next incomplete contribution. Ignore INVALIDATED.
    const nextContrib = await ceremony.ref.collection('contributions')
      .orderBy('queueIndex')
      .where('queueIndex', '>', lastCompleteIndex)
      .where('status', 'in', [RUNNING, WAITING])
      .get();
    if (nextContrib.empty) {
      //functions.logger.debug(`No expiry candidate ${ceremony.id}`);
      return;
    }
    const contrib = nextContrib.docs[0];
    const laterContribsFound: boolean = (nextContrib.size > 1);
    const waiterIndex = contrib.get('queueIndex');

    //functions.logger.debug(`next contrib ${nextContrib.docs[0].get('queueIndex')}`);

    // Check for excess idle time. INVALIDATE if too long.
    const events = await ceremony.ref
      .collection('events')
      .orderBy('timestamp', 'desc')
      .where('index', '==', waiterIndex)
      .limit(1)
      .get();
    let lastSeen = contrib.createTime.toMillis()/1000;
    if (!events.empty) {
      lastSeen = events.docs[0].get('timestamp').seconds;
      //functions.logger.debug(`have events ${lastSeen}`);
    };
    const age = (Date.now()/1000 - lastSeen);
    const status = contrib.get('status');
    functions.logger.debug(`age ${age} s, status ${status}`);

    let expire = false;
    const DEFAULT_MAX_RUNNING_DURATION = 600;
    let expectedDur = DEFAULT_MAX_RUNNING_DURATION; // seconds
    const MAX_WAIT_SECONDS = 60;
    if (status === WAITING) {
      // Expire 3 minutes after due time if anyone else is waiting
      if (age > MAX_WAIT_SECONDS && laterContribsFound) {
        functions.logger.info(`expired waiting contribution ${contrib.id} ${waiterIndex}. ${nextContrib.size} waiting`);
        expire = true;
      }
    } else if (status === RUNNING) {
      // Expire after 10 minutes or calculated expected duration, whichever is greater
      const numConstraints: number | undefined = ceremony.get('numConstraints');
      if (numConstraints) {
        expectedDur = numConstraints / 300;
      }
      expectedDur = Math.max(expectedDur, DEFAULT_MAX_RUNNING_DURATION);
      expire = (age > expectedDur && laterContribsFound);
      if (expire) {
        functions.logger.info(`Expired running contribution ${contrib.id}. Expected duration is ${expectedDur} seconds`);
      }
    }
    if (expire) {
      functions.logger.info(`Invalidating expired contribution ${waiterIndex} for ${ceremony.get('title')}`);
      await contrib.ref.set({'status': INVALIDATED}, { merge: true });
      // add event
      await ceremony.ref.collection('events')
        .add({
          eventType: INVALIDATED,
          index: waiterIndex,
          sender: 'WATCHDOG',
          message: `No activity detected for ${Math.floor(age)} seconds for ${status} contribution. Max ${Math.floor(expectedDur)} secs.`,
          timestamp: fbAdmin.firestore.Timestamp.now(),
        });
    }
  });
  
});

export default TimeoutWatchdog