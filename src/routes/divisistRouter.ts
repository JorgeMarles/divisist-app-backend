import express, { Request } from "express";
import DivisistController from "../controllers/divisistController";
import { CarreraInfo } from "../services/divisistService";
import ErrorResponse from "../util/errorResponse";
import { Pensum } from "../model/allmodels";

const router = express.Router();

interface Request_ci_session {
    ci_session: string
}

router.get("/test", async (_req: Request<{}, any, {}, Request_ci_session>, res) => {
    const controller = new DivisistController();
    const response = await controller.test(_req.query.ci_session!.toString());
    return res.send(response);
});

router.get("/carrera", async (_req: Request<{}, CarreraInfo | ErrorResponse, {}, Request_ci_session>, res) => {
    const controller = new DivisistController();
    try {
        const response = await controller.getCarreraInfo(_req.query.ci_session.toString());
        return res.send(response);
    } catch (error: any) {
        return res.status(500).send({ error: error.toString() });
    }
});

router.get("/pensum", async (_req: Request<{}, Pensum | ErrorResponse, {}, Request_ci_session>, res) => {
    const controller = new DivisistController();
    try {
        const response = await controller.getPensum(_req.query.ci_session.toString());
        return res.send(response);
    } catch (error: any) {
        return res.status(500).send({ error: error.toString() });
    }
});

export default router;
