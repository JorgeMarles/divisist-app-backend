import express, { Request } from "express";
import PingController from "../controllers/ping";
import FireStoreController from "../controllers/firestoreController";
import { Materia, Pensum } from "../model/allmodels";
import ProgressManager from "../util/progressManager";


const router = express.Router();

router.get("/ping", async (_req, res) => {
  const controller = new PingController();
  const response = await controller.getMessage();
  return res.send(response);
});

router.get("/materias", async (_req, res) => {
  const controller = new FireStoreController();
  const response = await controller.getAllMaterias();
  return res.send(response);
});

router.get("/materias/:codigo(\\d{7})", async (_req, res) => {
  const controller = new FireStoreController();
  const response = await controller.getMateriaByCodigo(_req.params.codigo);
  if(!response){
    res.status(404)
  }
  return res.send(response);
});

router.get("/materias/semestre", async (_req, res) => {
  const controller = new FireStoreController();
  const response = await controller.getMateriasGroupBySemestre();
  return res.send(response);
});

router.get("/materias/semestre/:semestre(\\d{1,2})", async (_req, res) => {
  const controller = new FireStoreController();
  const response = await controller.getMateriasOfSemestre(parseInt(_req.params.semestre))
  return res.send(response);
});

/**
 * //////////////////////////////////////////////////////////
 */

router.post("/materias/add", async (_req: Request<{}, {}, Materia>, res) => {
  const controller = new FireStoreController();
  await controller.addMateria(_req.body);
  return res.send({
    message: 'ok'
  });
});


router.post("/materias/addpensum", async (_req: Request<{}, {}, Pensum>, res) => {
  const controller = new FireStoreController();  
  await controller.addPensum(_req.body);
  return res.send();
});

export default router;
