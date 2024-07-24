

export class DivisistService {
    public async test(ci_session: string): Promise<any>{
        const response = await fetch(`${process.env.DIVISIST_URL}/informacion_academica/pensum`, {
            headers: {
                cookie: `ci_session=${ci_session}`,
            }
        });
        return await response.text();
    }
}