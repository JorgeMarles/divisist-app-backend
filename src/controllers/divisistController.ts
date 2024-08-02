import { Get, Query, Route } from "tsoa";
import DivisistService from "../services/divisistService";
import { Pensum } from "../model/allmodels";
import { CarreraInfo } from "../util/DivisistFetcher";
import ErrorResponse, { ResponseStatus } from "../util/errorResponse";
import ProgressManager from "../util/progressManager";



@Route("divisist")
export default class DivisistController {
    private divisistService: DivisistService = new DivisistService();

    @Get("/pensum")
    public async getPensum(@Query() ci_session: string, @Query() delay?: number): Promise<void | ErrorResponse> {
        if(ProgressManager.getInstance().isOccupied()){
            return {
                error: "Server processing another request.",
                status: ResponseStatus.INTERNAL_ERROR
            }
        }
        this.divisistService.getPensum(ci_session,delay);
    }
}
