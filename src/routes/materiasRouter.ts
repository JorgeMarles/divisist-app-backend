import express, { Request } from "express";
import FireStoreController from "../controllers/firestoreController";
import { Materia, Pensum } from "../model/allmodels";


const router = express.Router();

router.get("/", async (_req, res) => {
    const controller = new FireStoreController();
    const response = await controller.getAllMaterias();
    return res.send(response);
});

router.get("/:codigo(\\d{7})", async (_req, res) => {
    const controller = new FireStoreController();
    const response = await controller.getMateriaByCodigo(_req.params.codigo);
    if (!response) {
        res.status(404)
    }
    return res.send(response);
});

router.get("/semestre", async (_req, res) => {
    const controller = new FireStoreController();
    const response = await controller.getMateriasGroupBySemestre();
    return res.send(response);
});

router.get("/semestre/:semestre(\\d{1,2})", async (_req, res) => {
    const controller = new FireStoreController();
    const response = await controller.getMateriasOfSemestre(parseInt(_req.params.semestre))
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

export default router;