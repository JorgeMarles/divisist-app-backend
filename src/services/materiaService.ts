import { DocumentReference, DocumentSnapshot, QueryDocumentSnapshot, QuerySnapshot, Timestamp } from "@google-cloud/firestore";
import db from "../firestore/firestore";
import { GrupoState, Materia, MateriaState, Pensum, PensumInfo, PensumInfoFirestore } from "../model/allmodels";
import ProgressManager, { ProgressEvents, SocketMessageStatus } from "../util/progressManager";

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
        for (let i = 0; i < semestres.length; ++i) {
            if (!semestres[i]) {
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

    public async addPensum(pensum: Pensum) {
        const pm: ProgressManager = ProgressManager.getInstance();
        const total: number = Object.keys(pensum.materias).length;
        const pensumInfo: PensumInfo = {
            codigo: pensum.codigo,
            fechaCaptura: new Date(pensum.fechaCaptura),
            nombre: pensum.nombre
        }
        console.log(pensumInfo);
        await db.pensums.doc(pensumInfo.codigo).set({ ...pensumInfo, fechaCaptura: Timestamp.fromDate(pensumInfo.fechaCaptura) });
        pm.emitir(ProgressEvents.PROGRESS, {
            total: 1,
            finished: 1,
            message: `Añadiendo pensum de ${pensumInfo.nombre}`,
            date: new Date(),
            status: SocketMessageStatus.OK
        })
        let finished: number = 0;
        for (const codigoMateria in pensum.materias) {
            const materia = pensum.materias[codigoMateria];
            try {
                if (!materia.carrera) materia.carrera = pensum.codigo;
                if (!materia.estado) materia.estado = MateriaState.NOT_CHANGED;
                for (const grupoCod in materia.grupos) {
                    const grupo = materia.grupos[grupoCod];
                    if (!grupo.estado) grupo.estado = GrupoState.NOT_CHANGED;
                }
                await this.addMateria(materia);
                pm.emitir(ProgressEvents.PROGRESS, {
                    total,
                    finished: ++finished,
                    message: `${materia.codigo} - ${materia.nombre}`,
                    date: new Date(),
                    status: SocketMessageStatus.OK
                })
            } catch (error: any) {
                pm.emitir(ProgressEvents.PROGRESS, {
                    total,
                    finished: finished,
                    message: `Error: ${error.toString()}`,
                    date: new Date(),
                    status: SocketMessageStatus.ERROR
                })
            }

        }
        pm.emitir(ProgressEvents.EXIT, {
            date: new Date(),
            message: "Proceso terminado.",
            total,
            finished,
            status: SocketMessageStatus.OK
        })
    }

    public async deletePensum(): Promise<void> {
        (await db.materias.get()).docs.forEach(doc => doc.ref.delete())
    }

    public async getListPensums(): Promise<PensumInfo[]> {
        const documents: QuerySnapshot<PensumInfoFirestore> = await db.pensums.get();
        return documents.docs.map(el => { return { ...el.data(), fechaCaptura: el.data().fechaCaptura.toDate() } });
    }
}