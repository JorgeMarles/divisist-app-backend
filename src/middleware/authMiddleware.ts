import { UserJWT, UserResponse } from './../model/user';
import { NextFunction, Router, Request, Response } from "express";
import ErrorResponse, { ResponseStatus } from "../util/errorResponse";
import AuthService from "../services/authService";

interface AuthenticatedRequest<A,B,C,D> extends Request<A,B,C,D> {
    user?: UserJWT
}

export const authenticateTokenMiddleware = (_req: AuthenticatedRequest<{},ErrorResponse | any,{},{}>, res: Response<ErrorResponse>, next: NextFunction): Response | void => {
    const token: string | undefined = _req.headers['authorization']?.split(' ')[1];    
    if(!token){
        return res.status(ResponseStatus.UNAUTHORIZED).json({
            error: "No se encuentra el token. No está autorizado para hacer esta petición.",
            status: ResponseStatus.UNAUTHORIZED
        })
    }
    const authService: AuthService = new AuthService();
    const middlewareResponse: UserResponse = authService.authTokenMiddleWare(token)
    if(middlewareResponse.status === ResponseStatus.OK){
        _req.user = {
            name: middlewareResponse.name,
            user: middlewareResponse.user
        }
        next();
    }else{        
        return res.status(middlewareResponse.status).send({
            error: "Error al obtener el recurso, el token no es válido o ha habido un error en el servidor",
            status: middlewareResponse.status
        })
    }

}