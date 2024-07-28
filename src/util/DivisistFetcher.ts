import { Pensum, Materia, Clase } from "../model/allmodels";
import { JSDOM } from 'jsdom'


export interface CarreraInfo {
    codigo: string;
    nombre: string;
}

type MateriaInfoRequest = {
    consulta: string;
    codigo: string
}

enum HttpMethod {
    GET = "GET",
    POST = "POST"
}


const diasSemana: { [key: string]: number } = {
    "LUNES": 0,
    "MARTES": 1,
    "MIERCOLES": 2,
    "JUEVES": 3,
    "VIERNES": 4,
    "SABADO": 5,
    "DOMINGO": 6,
}

/**
 * ToDo:
 *  - Refactorizar código
 *  - Integrar el proceso de extracción de materias con ProgressManager
 *  - Implementar la función de cambio
 *  - Enviar el pensum por el socket (?) o hacer que en el frontend cuando el socket envíe un 
 *    ProgressEvents.EXIT hacer la petición a getPensum()?
 *  - Guardar otra colección con los pensums
 */
export default class DivisistFetcher {
    private ci_session: string = "";

    public constructor(ci_session: string){
        this.ci_session = ci_session;
    }

    public async test(): Promise<any> {
        const apiUrl: string = "informacion_academica/pensum";
        return (await this.getJSDOM(apiUrl, HttpMethod.GET));
    }

    private async getJSDOM(endpoint: string, method: HttpMethod, data?: MateriaInfoRequest): Promise<Document> {
        let headers: { [key: string]: string } = {
            'cookie': `ci_session=${this.ci_session}`
        }
        if (method === HttpMethod.POST) {
            headers = { ...headers, 'Content-Type': "application/x-www-form-urlencoded" }
        }
        const response: Response = await fetch(`${process.env.DIVISIST_URL}/${endpoint}`, {
            headers: headers,
            method: method,
            body: method === HttpMethod.POST ? new URLSearchParams(data).toString() : undefined
        });
        if (response.status !== 200) {
            throw new Error(`Fetch ${endpoint}: ${response.statusText} (${response.status})`)
        }
        const jsdomDocument: Document = new JSDOM(await response.text()).window.document;
        return jsdomDocument;
    }

    private getElement(document: Document, querySelector: string): Element | null {
        const element: Element | null = document.querySelector(querySelector);
        return element;
    }

    public async getPensum(): Promise<Pensum> {
        

        const carreraInfo: CarreraInfo = await this.getCarreraInfo();
        const pensum: Pensum = {
            materias: {},
            codigo: carreraInfo.codigo,
            fecha: new Date()
        };
        const pensumEndpoint: string = "informacion_academica/pensum";
        const document: Document = await this.getJSDOM(pensumEndpoint, HttpMethod.GET);
        const querySemestres: string = "#content_completw > div.wrapper > div > section.content > div > div.box-body.no-padding > div > table > tbody"
        const semestresEl: Element | null = this.getElement(document, querySemestres);

        if (!semestresEl) {
            throw new Error(`Element (${querySemestres}) not found at getPensum()`)
        }

        const semestres: HTMLCollection = semestresEl.children;
        let numSemestre = 1;
        for (const semestre of semestres) {
            const materias: Element[] = Array.from(semestre.children).slice(1);
            for (const materia of materias) {
                await this.addMateriaPensum(pensum, materia, numSemestre, carreraInfo);
                await new Promise(res => setTimeout(res, 500))
            }
            numSemestre++;
        }
        return pensum;
    }

    private async addMateriaPensum(pensum: Pensum, materia: Element, numSemestre: number, carreraInfo: CarreraInfo): Promise<void> {

        const titulo = (materia.children[0] as HTMLElement).title;
        const contenido = materia.children[0].innerHTML;

        const [nombre, requisitos]: [string, string[]] = this.getMateriaNombreRequisitos(titulo);
        const [codigo, horas, creditos, isElectiva] = this.getMateriaInfoHorasCreditos(contenido);
        console.log("adding", codigo, "-", nombre);

        const materiaObj: Materia = {
            carrera: carreraInfo.codigo,
            codigo,
            creditos,
            horas,
            isElectiva,
            nombre,
            requisitos,
            semestre: numSemestre,
            grupos: {}
        }
        //llenar materiaObj.grupos
        await this.procesarMateria(materiaObj);
        pensum.materias[codigo] = materiaObj;
    }

    private getMateriaNombreRequisitos(titulo: string): [string, string[]] {
        const infos: string[] = titulo.split("-").map(e => e.trim());
        const nombre: string = infos[0];
        let req: string[] = [];
        if (infos.length > 1) {
            req = infos.slice(1).join(" ").split(" ").slice(1).map(e => e.trim()).filter(el => el !== "" && el !== "Cre:0");
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

    private async procesarMateria(materia: Materia, isEquivalencia: boolean = false): Promise<Materia> {
        const materiaPrincipalEndpoint: string = "consulta/materia";
        const document: Document = await this.getJSDOM(materiaPrincipalEndpoint, HttpMethod.POST, {
            consulta: "1",
            codigo: materia.codigo
        })
        const gruposQuery: string = "#collapse1 > div > div > table > tbody";
        const gruposElement: Element | null = this.getElement(document, gruposQuery);
        const clasesQuery: string = "#collapse2 > div > div > table > tbody";
        const clasesElement: Element | null = this.getElement(document, clasesQuery);
        if (gruposElement && clasesElement) {
            this.addGrupoToMateria(gruposElement, materia);
            this.addClasesAGrupos(clasesElement, materia);
            if (!isEquivalencia) {
                const equivQuery: string = "#collapse3 > div > div > table > tbody";
                const equivElement: Element | null = this.getElement(document, equivQuery);
                if (equivElement) {
                    await this.addEquivalencias(equivElement, materia)
                }
            }
        }
        return materia;
    }

    private async addEquivalencias(equivElement: Element, materia: Materia) {
        const rows = Array.from(equivElement.children).slice(1);
        for (const eqCell of rows) {
            const codigoEquivalencia = eqCell.children[0].innerHTML;
            const materiaBusqueda: Materia = { ...materia, codigo: codigoEquivalencia, grupos: {} }
            const materiaEq = await this.procesarMateria(materiaBusqueda, true);
            materia.grupos = { ...materia.grupos, ...materiaEq.grupos };
        }
    }

    private addClasesAGrupos(clasesElement: Element, materia: Materia) {
        const rowsClases = Array.from(clasesElement.children).slice(1);
        for (const row of rowsClases) {
            const [letraGrupo, nombreDia, horasString, salon] = [0, 1, 2, 3].map(el => row.children[el].innerHTML.trim());
            const grupo = `${materia.codigo}-${letraGrupo}`;
            const dia = diasSemana[nombreDia];
            const [horaInicio, horaFin] = this.getHoras(horasString);
            const clase: Clase = { dia, horaFin, horaInicio, salon }
            materia.grupos[grupo].clases.push(clase);
        }
    }

    private getHoras(horasString: string): [number, number] {
        const horasSplit = horasString.split("-");
        const n: number[] = [0, 1].map(idx => parseInt(horasSplit[idx].split(":")[0]) - 6)
        return [n[0], n[1]];
    }

    private addGrupoToMateria(gruposElement: Element, materia: Materia) {
        const rowsGrupos = Array.from(gruposElement.children).slice(1);
        for (const row of rowsGrupos) {
            const nombre: string = `${materia.codigo}-${row.children[0].innerHTML.trim()}`;
            const maximo: number = parseInt(row.children[1].innerHTML.trim());
            const disponible: number = parseInt(row.children[2].innerHTML.trim());
            const profesor: string = row.children[3].innerHTML.trim();
            materia.grupos[nombre] = { nombre, maximo, disponible, profesor, clases: [] };
        }
    }

    private getCarreraInfoFromDocument(document: Document): CarreraInfo {
        const codigoQuery: string = "#content_completw > div.wrapper > div > section.content > div > div:nth-child(2) > div.col-md-9 > div > table:nth-child(1) > tbody > tr:nth-child(2) > td";
        const codigoElement: Element | null = this.getElement(document, codigoQuery)
        const nombreQuery: string = "#content_completw > div.wrapper > div > section.content > div > div:nth-child(2) > div.col-md-9 > div > table:nth-child(1) > tbody > tr:nth-child(3) > td";
        const nombreElement: Element | null = this.getElement(document, nombreQuery);

        if (!codigoElement) {
            throw new Error(`Element (${codigoElement}) not found at getCarreraInfoFromDocument()`);
        }
        if (!nombreElement) {
            throw new Error(`Element (${nombreElement}) not found at getCarreraInfoFromDocument()`);
        }

        const codigo: string = codigoElement.innerHTML;
        const nombre: string = nombreElement.innerHTML;
        return {
            codigo, nombre
        };
    }

    public async getCarreraInfo(): Promise<CarreraInfo> {
        const carreraInfoEndpoint: string = "estudiante/mi_ufps";
        const document: Document = await this.getJSDOM(carreraInfoEndpoint, HttpMethod.GET);
        return this.getCarreraInfoFromDocument(document);
    }
}