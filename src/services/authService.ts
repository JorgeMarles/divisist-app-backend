import bcrypt from 'bcryptjs';
import { DocumentData, QueryDocumentSnapshot } from "@google-cloud/firestore";
import db from "../firestore/firestore"
import { AccessTokenResponse, UserFirestore, UserJWT, UserLoginRequest, UserResponse } from "../model/user"
import jwt, { JwtPayload } from 'jsonwebtoken'
import ErrorResponse, { ResponseStatus } from '../util/errorResponse';
import { NextFunction } from 'express';



export default class AuthService {
    private SECRET_KEY: string | undefined = process.env.SECRET_KEY

    private async getUser(user: UserLoginRequest): Promise<UserFirestore | undefined> {
        const docs: QueryDocumentSnapshot<UserFirestore, DocumentData>[] = (await db.users.where('user', '==', user.user).get()).docs;
        if (docs.length === 0) return undefined;
        else return docs[0].data();
    }


    public async login(user: UserLoginRequest): Promise<AccessTokenResponse> {
        const userDB: UserFirestore | undefined = await this.getUser(user);
        
        if (!userDB) {
            return {
                accessToken: "",
                status: ResponseStatus.INVALID_CREDENTIALS,
                user: {
                    name: "",
                    user: ""
                }
            };
        }
        if (!bcrypt.compareSync(user.password, userDB.password)) {
            return {
                accessToken: "",
                status: ResponseStatus.INVALID_CREDENTIALS,
                user: {
                    name: "",
                    user: ""
                }
            };
        }
        
        if (!this.SECRET_KEY) {
            return {
                accessToken: "",
                status: ResponseStatus.INTERNAL_ERROR,
                user: {
                    name: "",
                    user: ""
                }
            };
        }
        const userJWT: UserJWT = { name: userDB.name, user: userDB.user}        
        
        const accessToken: string = jwt.sign({ user: userJWT },this.SECRET_KEY, {
            expiresIn: '30d'
        })
        return { accessToken, user: userJWT, status: ResponseStatus.OK }
    }

    public authTokenMiddleWare(token: string): UserResponse {
        if (!this.SECRET_KEY) {
            return {
                name: "",
                user: "",
                status: ResponseStatus.INTERNAL_ERROR
            }
        }
        try {
            const verificationResponse: string | JwtPayload = jwt.verify(token, this.SECRET_KEY);
            if (typeof verificationResponse === 'string') {
                return {
                    name: "",
                    user: "",
                    status: ResponseStatus.INVALID_CREDENTIALS
                }
            }
            const user: UserJWT = verificationResponse.user;

            return { ...user, status: ResponseStatus.OK }
        } catch (error) {
            return {
                name: "",
                user: "",
                status: ResponseStatus.INVALID_CREDENTIALS
            }
        }
    }
}