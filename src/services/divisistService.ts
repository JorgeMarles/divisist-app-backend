import DivisistFetcher, { CarreraInfo } from '../util/DivisistFetcher';
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

    public async getPensum(ci_session: string, delay?: number): Promise<Pensum> {
        const fetcher: DivisistFetcher = new DivisistFetcher(ci_session, delay);
        return await fetcher.getPensum();
    }

}