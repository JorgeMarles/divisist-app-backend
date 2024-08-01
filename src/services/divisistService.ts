import DivisistFetcher, { CarreraInfo } from '../util/DivisistFetcher';
import ErrorResponse from '../util/errorResponse';
import ProgressManager, { ProgressEvents, SocketMessageStatus } from '../util/progressManager';
import { Pensum } from './../model/allmodels';


export default class DivisistService {

    public async test(ci_session: string): Promise<any> {
        const fetcher: DivisistFetcher = new DivisistFetcher(ci_session);
        return await fetcher.test();
    }

    public async getCarreraInfo(ci_session: string): Promise<CarreraInfo> {
        const fetcher: DivisistFetcher = new DivisistFetcher(ci_session);
        return await fetcher.getCarreraInfo();
    }

    public async getPensum(ci_session: string, delay?: number): Promise<Pensum | ErrorResponse> {
        try {
            const fetcher: DivisistFetcher = new DivisistFetcher(ci_session, delay);
            const pensum: Pensum = await fetcher.getPensum();
            
            return pensum;
        } catch (error: any) {       
            console.log(error);
                 
            ProgressManager.getInstance().emitir(ProgressEvents.ERROR, {
                finished: 0,
                message: "Ha ocurrido un error obteniendo la información, por favor, verifica que la cookie es válida.",
                status: SocketMessageStatus.ERROR,
                total: 0
            })
            return {
                error: error
            }
        }
    }

}