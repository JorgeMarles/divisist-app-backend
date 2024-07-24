import express, { Request } from "express";
import DivisistController from "../controllers/divisistController";

const router = express.Router();

router.get("/test", async (_req, res) => {
    const controller = new DivisistController();
    const response = await controller.test(_req.query.ci_session!.toString());
    return res.send(response);
});

export default router;
