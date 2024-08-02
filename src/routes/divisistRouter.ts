import { authenticateTokenMiddleware } from './../middleware/authMiddleware';
import express, { Request } from "express";
import DivisistController from "../controllers/divisistController";
import ErrorResponse, { ResponseStatus } from "../util/errorResponse";
import { Pensum } from "../model/allmodels";
import { CarreraInfo } from "../util/DivisistFetcher";

const router = express.Router();

interface Request_ci_session {
    ci_session: string
}

interface RequestDelay {
    delay?: number
}

router.get("/pensum", authenticateTokenMiddleware, async (_req: Request<{}, Pensum | ErrorResponse, {}, Request_ci_session & RequestDelay>, res) => {
    const controller = new DivisistController();
    try {
        await controller.getPensum(_req.query.ci_session.toString());        
        return res.send();
    } catch (error: any) {
        return res.status(ResponseStatus.INTERNAL_ERROR).send({ error: error.toString(), status: ResponseStatus.INTERNAL_ERROR });
    }
});

export default router;
