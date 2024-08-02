import { authenticateTokenMiddleware } from './../middleware/authMiddleware';
import express, { Request , Response} from "express";
import FireStoreController from "../controllers/firestoreController";
import { Materia, Pensum, PensumInfo } from "../model/allmodels";
import ErrorResponse, { ResponseStatus } from "../util/errorResponse";


const router = express.Router();


/**
 * /////////////////////////////
 */

router.post("/addpensum", authenticateTokenMiddleware, async (_req: Request<{}, {}, Pensum>, res: Response) => {
    const controller = new FireStoreController();
    await controller.addPensum(_req.body);
    return res.send();
});

type CarreraQuery = {
    carrera: string
}

router.delete("/deletepensum/:carrera(\\d{3})", authenticateTokenMiddleware, async (_req: Request<CarreraQuery, {}, {}>, res) => {
    const controller = new FireStoreController();
    await controller.deleteAllPensum(_req.params.carrera);
    return res.send();
});

router.get("/pensum/:carrera", async (_req: Request<CarreraQuery, Pensum | ErrorResponse, {}, {}>, res) => {
    const controller = new FireStoreController();
    try {
        const lista: Pensum = await controller.getPensum(_req.params.carrera);
        return res.send(lista);
    } catch (error: any) {
        return res.status(ResponseStatus.INTERNAL_ERROR).send({ error: error.toString(), status: ResponseStatus.INTERNAL_ERROR });
    }
});

export default router;