import { getFirestore } from 'firebase-admin/firestore';
import { Ceremony } from '../models/ceremony';

export async function getCeremony(id: string): Promise<Ceremony> {
    const db = getFirestore();
    const raw = await db.collection('ceremonies').doc(id).get();
    const data = raw.data() as Ceremony;
    return data;
}