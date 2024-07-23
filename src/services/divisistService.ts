

export class DivisistService {
    public async test(): Promise<any>{
        const x = `http://divisist2.ufps.edu.co`
        const response = await fetch(x);
        return await response.text();
    }
}