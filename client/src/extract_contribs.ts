import { extractContribs } from './api/FirestoreApi';
import { ContributionSummary } from './types/ceremony';
import firebase from 'firebase/app';
import 'firebase/firestore';

const contribs = extractContribs().then(docs => {
    const cons: firebase.firestore.QuerySnapshot<ContributionSummary>[] = docs;
    const contribDocs = JSON.stringify(docs);


});

