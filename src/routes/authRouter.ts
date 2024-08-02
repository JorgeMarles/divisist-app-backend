import express, { Request, Response } from 'express';
import db from '../firestore/firestore';
import bcrypt from 'bcryptjs'
import { AccessTokenResponse, UserLoginRequest } from '../model/user';
import AuthController from '../controllers/authController';
import ErrorResponse, { ResponseStatus } from '../util/errorResponse';


const router = express.Router();

router.post("/login", async (_req: Request<{}, AccessTokenResponse | ErrorResponse, UserLoginRequest, {}>, res) => {
    const controller: AuthController = new AuthController();
    const response: AccessTokenResponse = await controller.login(_req.body);
    if (response.status === ResponseStatus.OK) {
        return res.status(ResponseStatus.OK).send(response)
    }else{
        return res.status(response.status).send({
            error: "Ha ocurrido un error iniciando sesión",
            status: response.status 
        })
    }
})


export default router