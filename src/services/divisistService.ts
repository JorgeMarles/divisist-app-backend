import { Materia, Pensum } from './../model/allmodels';
import { DOMWindow } from 'jsdom';
import { JSDOM } from 'jsdom'

export interface CarreraInfo {
    codigo: string;
    nombre: string;
}

interface MateriaPensumInfo {
    codigo: string;
    nombre: string;
    semestre: number;
    carrera: string;
    horas: number;
    creditos: number;
}

export default class DivisistService {
    public async test(ci_session: string): Promise<any> {
        const apiUrl: string = "informacion_academica/pensum";
        return (await this.getJSDOM(apiUrl, ci_session));
    }

    private async getJSDOM(api_url: string, ci_session: string): Promise<Document> {
        const response = await fetch(`${process.env.DIVISIST_URL}/${api_url}`, {
            headers: {
                cookie: `ci_session=${ci_session}`,
            }
        });
        if (response.status !== 200) {
            throw new Error(`Fetching ${api_url}: ${response.statusText} (${response.status})`)
        }
        const jsdomDocument: Document = new JSDOM(await response.text()).window.document;
        return jsdomDocument;
    }

    private getElement(document: Document, querySelector: string): Element {
        const element: Element | null = document.querySelector(querySelector);
        if (!element) {
            throw new Error(`Element not found: ${querySelector}`)
        }
        return element;
    }

    public async getPensum(ci_session: string): Promise<Pensum> {
        const pensum: Pensum = {
            materias: {}
        };

        const carreraInfo: CarreraInfo = await this.getCarreraInfo(ci_session);
        const pensumEndpoint: string = "informacion_academica/pensum";
        const document: Document = await this.getJSDOM(pensumEndpoint, ci_session);
        const querySemestres: string = "#content_completw > div.wrapper > div > section.content > div > div.box-body.no-padding > div > table > tbody"
        const semestres: HTMLCollection = this.getElement(document, querySemestres).children;

        let numSemestre = 1;
        for (const semestre of semestres) {
            const materias: Element[] = Array.from(semestre.children).slice(1);
            for (const materia of materias) {
                const titulo = (materia.children[0] as HTMLElement).title;
                const contenido = materia.children[0].innerHTML;

                const [nombre, requisitos]: [string, string[]] = this.getMateriaNombreRequisitos(titulo);
                const [codigo, horas, creditos, isElectiva] = this.getMateriaInfoHorasCreditos(contenido);

                const materiaObj: Materia = {
                    carrera: carreraInfo.codigo, 
                    codigo, 
                    creditos, 
                    horas, 
                    isElectiva, 
                    nombre, 
                    requisitos, 
                    semestre: numSemestre,
                    grupos:{}
                }
                //llenar materiaObj.grupos
                pensum.materias[codigo] = materiaObj;
            }
            numSemestre++;
        }
        return pensum;
    }

    private getMateriaNombreRequisitos(titulo: string): [string, string[]] {
        const infos: string[] = titulo.split("-").map(e => e.trim());
        const nombre: string = infos[0];
        let req: string[] = [];
        if (infos.length > 1) {
            req = infos.slice(1).join(" ").split(" ").slice(1).map(e => e.trim()).filter(el => el !== "" && el !== "Cre:0");
            //console.log(req);
        }
        return [nombre, req];
    }

    private getMateriaInfoHorasCreditos(contenido: string): [string, number, number, boolean] {
        const infoLimpia = contenido.split(/\s/).filter(el => el !== "").join(" ");
        const isElectiva = infoLimpia.includes("Electiva")
        const regexCodigo = /\d{7}/;
        const regexHoras = /horas:\d+/;
        const regexCreditos = /Cred:\d+/;
        const codigo = regexCodigo.exec(infoLimpia)![0];
        const horas = parseInt(regexHoras.exec(infoLimpia)![0].split(":")[1])
        const creditos = parseInt(regexCreditos.exec(infoLimpia)![0].split(":")[1])
        return [codigo, horas, creditos, isElectiva];
    }

    private async procesarMateriaPrincipal(materia: Materia, ci_session: string): Promise<void> {
        /**
         * Todo: procesarMateria(materia, isEquiv)
         * Cambiar el modo de funcionamiento de ci_session
         * Eliminar el trhow error de getElement
         */
    }

    private getCarreraInfoFromDocument(document: Document): CarreraInfo {
        const codigoQuery: string = "#content_completw > div.wrapper > div > section.content > div > div:nth-child(2) > div.col-md-9 > div > table:nth-child(1) > tbody > tr:nth-child(2) > td";
        const codigoElement: Element = this.getElement(document, codigoQuery)
        const nombreQuery: string = "#content_completw > div.wrapper > div > section.content > div > div:nth-child(2) > div.col-md-9 > div > table:nth-child(1) > tbody > tr:nth-child(3) > td";
        const nombreElement: Element = this.getElement(document, nombreQuery);

        const codigo: string = codigoElement.innerHTML;
        const nombre: string = nombreElement.innerHTML;
        return {
            codigo, nombre
        };
    }

    public async getCarreraInfo(ci_session: string): Promise<CarreraInfo> {
        const carreraInfoEndpoint: string = "estudiante/mi_ufps";
        const document: Document = await this.getJSDOM(carreraInfoEndpoint, ci_session);
        return this.getCarreraInfoFromDocument(document);
    }

}