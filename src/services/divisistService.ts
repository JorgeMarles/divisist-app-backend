import { DOMWindow } from 'jsdom';
import {JSDOM} from 'jsdom'

export interface CarreraInfoResponse {
    codigo: string,
    nombre: string
}

export default class DivisistService {
    public async test(ci_session: string): Promise<any>{
        const apiUrl: string = "informacion_academica/pensum";
        return (await this.getJSDOM(apiUrl,ci_session));
    }

    private async getJSDOM(api_url: string, ci_session: string): Promise<Document> {
        const response = await fetch(`${process.env.DIVISIST_URL}/${api_url}`, {
            headers: {
                cookie: `ci_session=${ci_session}`,
            }
        });
        if(response.status !== 200){
            throw new Error(`Fetching ${api_url}: ${response.statusText} (${response.status})`)
        }
        const jsdomDocument: Document = new JSDOM(await response.text()).window.document;
        return jsdomDocument;
    }

    public async getCarreraInfo(ci_session: string): Promise<CarreraInfoResponse> {
        const carreraInfoEndpoint: string = "estudiante/mi_ufps";
        const document: Document = await this.getJSDOM(carreraInfoEndpoint, ci_session);
        const codigoQuery: string = "#content_completw > div.wrapper > div > section.content > div > div:nth-child(2) > div.col-md-9 > div > table:nth-child(1) > tbody > tr:nth-child(2) > td";
        const codigoElement: Element | null = await document.querySelector(codigoQuery);
        const nombreQuery: string = "#content_completw > div.wrapper > div > section.content > div > div:nth-child(2) > div.col-md-9 > div > table:nth-child(1) > tbody > tr:nth-child(3) > td";
        const nombreElement: Element | null = await document.querySelector(nombreQuery);
        if(!codigoElement){
            throw new Error(`Element not found in getCarreraInfo: codigo Element not found (${codigoQuery})`)
        }
        if(!nombreElement){
            throw new Error(`Element not found in getCarreraInfo: nombre Element not found (${nombreQuery})`)
        }
        const codigo: string = codigoElement.innerHTML;
        const nombre: string = nombreElement.innerHTML;
        return {
            codigo, nombre
        };
    }
}