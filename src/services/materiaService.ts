import { DocumentReference, DocumentSnapshot, QueryDocumentSnapshot, QuerySnapshot } from "@google-cloud/firestore";
import db from "../firestore/firestore";
import { Materia, Pensum } from "../model/allmodels";

export class MateriaService {
    public async getMateriaByCodigo(codigoMateria: string): Promise<Materia | null> {
        const document: DocumentSnapshot<Materia> = await db.materias.doc(codigoMateria).get();
        const materia: Materia | undefined = document.data();
        return materia ?? null;
    }

    public async getAllMaterias(): Promise<Materia[]> {
        const documents: QuerySnapshot<Materia> = await db.materias.get();
        return documents.docs.map(el => el.data());
    }

    public async getMateriasGroupBySemestre(): Promise<Materia[][]> {
        const materias: Materia[] = await this.getAllMaterias();
        const semestres: Materia[][] = [];
        for (const materia of materias) {
            if (!semestres[materia.semestre]) {
                semestres[materia.semestre] = [];
            }
            semestres[materia.semestre].push(materia);
        }
        for (let i = 0; i < semestres.length; ++i){
            if (!semestres[i]){
                semestres[i] = [];
            }
        }
        return semestres;
    }

    public async getMateriasOfSemestre(semestre: number): Promise<Materia[]> {
        const documents: QuerySnapshot<Materia> = await db.materias.where('semestre', '==', semestre).get();
        return documents.docs.map(el => el.data());
    }

    public async addMateria(materia: Materia): Promise<void> {
        await db.materias.doc(materia.codigo).set(materia);      
        //await new Promise(resolve => setTimeout(resolve, 2000));
    }

    public async addPensum(pensum: Pensum, wss: WebSocket){
        for(const materia in pensum.materias){
            await this.addMateria(pensum.materias[materia]);
        }
    }
}