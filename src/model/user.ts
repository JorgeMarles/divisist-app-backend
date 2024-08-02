import { ResponseStatus } from "../util/errorResponse";

export interface UserFirestore {
    user: string;
    password: string;
    name: string;
}

export interface UserJWT {
    user: string;
    name: string;
}

export interface UserLoginRequest {
    user: string;
    password: string;
}

export interface UserResponse extends UserJWT {
    status: ResponseStatus
}

export interface AccessTokenResponse {
    accessToken: string;
    user: UserJWT;
    status: ResponseStatus
}