import { Get, Route } from "tsoa";
import { DivisistService } from "../services/divisistService";



@Route("divisist")
export default class DivisistController {
    private divisistService: DivisistService = new DivisistService();

    @Get("/test")
    public async test(): Promise<any> {
        return await this.divisistService.test();
    }
}
