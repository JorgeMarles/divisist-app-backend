import { Get, Query, Route } from "tsoa";
import DivisistService, { CarreraInfo } from "../services/divisistService";
import { Pensum } from "../model/allmodels";



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
    public async getPensum(@Query() ci_session: string): Promise<Pensum> {
        return await this.divisistService.getPensum(ci_session);
    }
}
