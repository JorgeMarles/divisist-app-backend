import { Get, Query, Route } from "tsoa";
import DivisistService, { CarreraInfo } from "../services/divisistService";
import { Pensum } from "../model/allmodels";



@Route("divisist")
export default class DivisistController {
    private divisistService: DivisistService = new DivisistService();

    @Get("/test")
    public async test(@Query() ci_session: string): Promise<any> {
        this.divisistService.setCi_Session(ci_session);
        return await this.divisistService.test();
    }

    @Get("/carrera")
    public async getCarreraInfo(@Query() ci_session: string): Promise<CarreraInfo> {
        this.divisistService.setCi_Session(ci_session);
        return await this.divisistService.getCarreraInfo();
    }

    @Get("/pensum")
    public async getPensum(@Query() ci_session: string): Promise<Pensum> {
        this.divisistService.setCi_Session(ci_session);
        return await this.divisistService.getPensum();
    }
}
