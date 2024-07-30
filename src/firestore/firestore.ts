import { DocumentData, Firestore, FirestoreDataConverter, PartialWithFieldValue, QueryDocumentSnapshot, WithFieldValue } from '@google-cloud/firestore'
import { Materia, Pensum, PensumInfo, PensumInfoFirestore } from '../model/allmodels';

const firestore = new Firestore({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    keyFilename: './secrets/formal-analyzer-417701-8920f9d83339.json'
})

// This helper function pipes your types through a firestore converter
const converter = <T>() => ({
    toFirestore: (data: PartialWithFieldValue<T>) => data ?? {},
    fromFirestore: (snap: QueryDocumentSnapshot) => snap.data() as T,
});

// This helper function exposes a 'typed' version of firestore().collection(collectionPath)
// Pass it a collectionPath string as the path to the collection in firestore
// Pass it a type argument representing the 'type' (schema) of the docs in the collection
const dataPoint = <T>(collectionPath: string) => firestore.collection(collectionPath).withConverter(converter<T>())

// Construct a database helper object
const db = {
    // list your collections here
    materias: dataPoint<Materia>('materias'),
    pensums: dataPoint<PensumInfoFirestore>('pensums')
}

// export your helper
export { db }
export default db