import express, { Request } from "express";
import FireStoreController from "../controllers/firestoreController";
import { Materia, Pensum, PensumInfo } from "../model/allmodels";
import ErrorResponse from "../util/errorResponse";


const router = express.Router();

router.get("/", async (_req, res) => {
    const controller = new FireStoreController();
    const response = await controller.getAllMaterias();
    return res.send(response);
});

type CodigoQuery = {
    codigo: string
}

router.get("/:codigo(\\d{7})", async (_req: Request<CodigoQuery, Materia, {}, {}>, res) => {
    const controller = new FireStoreController();
    const response = await controller.getMateriaByCodigo(_req.params.codigo);
    if (!response) {
        res.status(404)
    }
    return res.send(response ?? undefined);
});

router.get("/semestre", async (_req, res) => {
    const controller = new FireStoreController();
    const response = await controller.getMateriasGroupBySemestre();
    return res.send(response);
});

type SemestreQuery = {
    semestre: number
}

router.get("/semestre/:semestre(\\d{1,2})", async (_req: Request<SemestreQuery, Materia[], {}, {}>, res) => {
    const controller = new FireStoreController();
    const response = await controller.getMateriasOfSemestre(_req.params.semestre)
    return res.send(response);
});

/**
 * /////////////////////////////
 */

router.post("/add", async (_req: Request<{}, {}, Materia>, res) => {
    const controller = new FireStoreController();
    await controller.addMateria(_req.body);
    return res.send({
        message: 'ok'
    });
});


router.post("/addpensum", async (_req: Request<{}, {}, Pensum>, res) => {
    const controller = new FireStoreController();
    await controller.addPensum(_req.body);
    return res.send();
});

type CarreraQuery = {
    carrera: string
}

router.delete("/deletepensum/:carrera(\\d{3})", async (_req: Request<CarreraQuery, {}, {}>, res) => {
    const controller = new FireStoreController();
    await controller.deleteAllPensum(_req.params.carrera);
    return res.send();
});

router.get("/pensums", async (_req: Request<{}, PensumInfo[] | ErrorResponse, {}, {}>, res) => {
    const controller = new FireStoreController();
    try {
        const lista: PensumInfo[] = await controller.getPensumList();
        return res.send(lista);
    } catch (error: any) {
        return res.status(500).send({ error: error.toString() });
    }
});

router.get("/pensum/:carrera", async (_req: Request<CarreraQuery, Pensum | ErrorResponse, {}, {}>, res) => {
    const controller = new FireStoreController();
    try {
        const lista: Pensum = await controller.getPensum(_req.params.carrera);
        return res.send(lista);
    } catch (error: any) {
        return res.status(500).send({ error: error.toString() });
    }
});

export default router;