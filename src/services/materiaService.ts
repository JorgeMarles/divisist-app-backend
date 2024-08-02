import { DocumentReference, DocumentSnapshot, QueryDocumentSnapshot, QuerySnapshot, Timestamp } from "@google-cloud/firestore";
import db from "../firestore/firestore";
import { Grupo, GrupoState, Materia, MateriaState, Pensum, PensumInfo, PensumInfoFirestore } from "../model/allmodels";
import ProgressManager, { ProgressEvents, SocketMessageStatus } from "../util/progressManager";
import ErrorResponse from "../util/errorResponse";

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

    private getNumber(grupo: Grupo): [number, number] {
        let nl: number = 0, nr: number = 0;
        for (const clase of grupo.clases) {
            const from = clase.dia * 16 + clase.horaInicio;
            const to = clase.dia * 16 + clase.horaFin;
            for (let i = from; i <= to; ++i) {
                let idx = i;
                if (idx >= 64) {
                    idx -= 64;
                    nl |= 1 << idx;
                } else {
                    nr |= 1 << idx;
                }
            }
        }
        return [nl, nr];
    }

    public async addPensum(pensum: Pensum) {
        const pm: ProgressManager = ProgressManager.getInstance();

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

        const materias: Materia[] = await this.getAllMaterias();
        const total1: number = materias.length;
        let finished: number = 0;
        //Iteraremos por los grupos y las materias guardados en la db
        for (const materia of materias) {
            try {
                const materiaNueva: Materia | undefined = pensum.materias[materia.codigo];
                if (!materiaNueva) {//Materia no existe en el nuevo pensum
                    materia.estado = MateriaState.DELETED;
                    for (const grupo in materia.grupos) {
                        materia.grupos[grupo].estado = GrupoState.DELETED;
                    }
                } else {//La materia existe en el nuevo pensum
                    materia.estado = MateriaState.NOT_CHANGED;
                    for (const codGrupo in materia.grupos) {//iteramos sobre los grupos de la materia en la db (viejos)
                        const grupoNuevo: Grupo | undefined = materiaNueva.grupos[codGrupo];
                        if (!grupoNuevo) {//Grupo no existe en la nueva materia
                            materia.grupos[codGrupo].estado = GrupoState.DELETED;
                        } else {//El grupo existe en la nueva materia
                            const grupoViejo: Grupo = materia.grupos[codGrupo];
                            const [vl, vr] = this.getNumber(grupoViejo);
                            const [nl, nr] = this.getNumber(grupoNuevo);
                            if (grupoNuevo.profesor === "-") grupoNuevo.profesor = grupoViejo.profesor;
                            if (nl === vl && nr === vr) {
                                grupoNuevo.estado = GrupoState.NOT_CHANGED;
                            } else {
                                grupoNuevo.estado = GrupoState.CHANGED;
                            }
                            materia.grupos[codGrupo] = grupoNuevo;
                        }
                    }
                    for (const codGrupo in materiaNueva.grupos) {
                        if (!(codGrupo in materia.grupos)) {
                            const grupoNuevo: Grupo = materia.grupos[codGrupo];
                            grupoNuevo.estado = GrupoState.CREATED;
                            materia.grupos[codGrupo] = grupoNuevo;
                        }
                    }
                }
                await db.materias.doc(materia.codigo).set(materia);
                delete pensum.materias[materia.codigo];
                pm.emitir(ProgressEvents.PROGRESS, {
                    total: total1,
                    finished: ++finished,
                    message: `${materia.codigo} - ${materia.nombre}`,
                    date: new Date(),
                    status: SocketMessageStatus.OK
                })
            } catch (error: any) {
                pm.emitir(ProgressEvents.PROGRESS, {
                    total: total1,
                    finished: finished,
                    message: `Error: ${error.toString()}`,
                    date: new Date(),
                    status: SocketMessageStatus.ERROR
                })
            }
        }

        finished = 0;
        const total2: number = Object.keys(pensum.materias).length;
        for (const codigoMateria in pensum.materias) {
            const materia: Materia = pensum.materias[codigoMateria];
            materia.estado = MateriaState.CREATED;
            await db.materias.doc(codigoMateria).set(materia);
            pm.emitir(ProgressEvents.PROGRESS, {
                total: total2,
                finished: ++finished,
                message: `${materia.codigo} - ${materia.nombre}`,
                date: new Date(),
                status: SocketMessageStatus.OK
            })
        }


        pm.emitir(ProgressEvents.EXIT, {
            date: new Date(),
            message: "Proceso terminado.",
            data: pensum,
            total: finished,
            finished,
            status: SocketMessageStatus.OK
        })
    }

    public async deletePensum(codigoPensum: string): Promise<void> {
        await db.pensums.doc(codigoPensum).delete();
        (await db.materias.where('carrera', '==', codigoPensum).get()).docs.forEach(doc => doc.ref.delete())

    }

    public async getListPensums(): Promise<PensumInfo[]> {
        const documents: QuerySnapshot<PensumInfoFirestore> = await db.pensums.get();
        return documents.docs.map(el => { return { ...el.data(), fechaCaptura: el.data().fechaCaptura.toDate() } });
    }

    public async getPensum(codigoPensum: string): Promise<Pensum> {
        const pensumIF: PensumInfoFirestore | undefined = (await db.pensums.doc(codigoPensum).get()).data();
        if (!pensumIF) {
            throw "No hay pensum " + codigoPensum;
        }
        const pensum: Pensum = {
            codigo: pensumIF.codigo,
            nombre: pensumIF.nombre,
            fechaCaptura: pensumIF.fechaCaptura.toDate(),
            materias: {}
        }

        const materias: Materia[] = (await db.materias.where('carrera', '==', codigoPensum).get()).docs.map(el => el.data());
        for (const materia of materias) {
            pensum.materias[materia.codigo] = materia;
        }
        return pensum;
    }
}