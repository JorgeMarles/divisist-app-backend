import DivisistFetcher, { CarreraInfo } from '../util/DivisistFetcher';
import ProgressManager from '../util/progressManager';
import { Clase, Materia, Pensum } from './../model/allmodels';
import { DOMWindow } from 'jsdom';


export default class DivisistService {

    public async test(ci_session: string): Promise<any> {
        const fetcher: DivisistFetcher = new DivisistFetcher(ci_session);
        return await fetcher.test();
    }

    public async getCarreraInfo(ci_session: string): Promise<CarreraInfo> {
        const fetcher: DivisistFetcher = new DivisistFetcher(ci_session);
        return await fetcher.getCarreraInfo();
    }

    public isOccupied(): boolean {
        const pm: ProgressManager = ProgressManager.getInstance();
        return pm.isOccupied();
    }

    public async getPensum(ci_session: string): Promise<Pensum> {
        const fetcher: DivisistFetcher = new DivisistFetcher(ci_session);
        return await fetcher.getPensum();
    }

}