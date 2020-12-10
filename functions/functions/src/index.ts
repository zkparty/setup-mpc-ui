import * as functions from 'firebase-functions';
import { Ceremony, CeremonyEvent, CeremonyState, 
    Contribution, ContributionState, ContributionSummary, 
    Participant, ParticipantState } from './types/ceremony';
import firebase from 'firebase/app';
import "firebase/firestore";
import { jsonToCeremony, jsonToContribution } from './ZKPartyApi';
  
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
const ceremonyConverter: firebase.firestore.FirestoreDataConverter<Ceremony> = {
    toFirestore: (c: Ceremony) => {
      return c;
    },
    fromFirestore: (
      snapshot: firebase.firestore.QueryDocumentSnapshot,
      options: firebase.firestore.SnapshotOptions): Ceremony => {
      return jsonToCeremony({id: snapshot.id, ...snapshot.data(options)});
    }
  }
  
const contributionConverter: firebase.firestore.FirestoreDataConverter<ContributionSummary> = {
    toFirestore: (c: ContributionSummary) => {
        return c;
    },
    fromFirestore: (
        snapshot: firebase.firestore.QueryDocumentSnapshot,
        options: firebase.firestore.SnapshotOptions): ContributionSummary => {
        return jsonToContribution(snapshot.data(options));
    }
}

export const ContributionWatchdog = functions.firestore
  .document('ceremonies/{cId}/contributions/{contribId}')
  .onUpdate((change, context) => { 
      if (change.after().status === 'RUNNING') {
        const contribId = context.params.contribId;
        // Start timeout timer

      } else if (change.after().status === 'COMPLETE') {
        
      }
   }); 