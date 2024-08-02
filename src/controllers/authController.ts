import AuthService from '../services/authService';
import { ResponseStatus } from '../util/errorResponse';
import { AccessTokenResponse, UserLoginRequest } from './../model/user';
import { Body, Get, Post, Route } from "tsoa";


@Route('auth')
export default class AuthController {
    private authService: AuthService = new AuthService();
    
    @Post('/login')
    public async login(@Body() user: UserLoginRequest): Promise<AccessTokenResponse> {
        return await this.authService.login(user);
    }

}