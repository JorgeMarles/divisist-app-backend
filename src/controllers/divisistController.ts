import { Get, Query, Route } from "tsoa";
import DivisistService from "../services/divisistService";
import { Pensum } from "../model/allmodels";
import { CarreraInfo } from "../util/DivisistFetcher";
import ErrorResponse from "../util/errorResponse";
import ProgressManager from "../util/progressManager";



@Route("divisist")
export default class DivisistController {
    private divisistService: DivisistService = new DivisistService();

    @Get("/test")
    public async test(@Query() ci_session: string): Promise<any> {
        return await this.divisistService.test(ci_session);
    }

    @Get("/carrera")
    public async getCarreraInfo(@Query() ci_session: string): Promise<CarreraInfo> {
        return await this.divisistService.getCarreraInfo(ci_session);
    }

    @Get("/pensum")
    public async getPensum(@Query() ci_session: string, @Query() delay?: number): Promise<void | ErrorResponse> {
        if(ProgressManager.getInstance().isOccupied()){
            return {
                error: "Server processing another request."
            }
        }
        this.divisistService.getPensum(ci_session);
    }
}
