import { Server } from "socket.io";
import http from 'http'
import { Materia, Pensum } from "../model/allmodels";
import FireStoreController from "../controllers/firestoreController";
import { MateriaService } from "../services/materiaService";

interface SocketProgressResponse {
    total: number,
    finished: number,
    descripcion: string,
    date: Date
}

class ProgressManager {
    io: Server;
    isProcessing: boolean = false;
    private static instancia: ProgressManager;

    private constructor(server: http.Server) {
        this.io = new Server(server, {
            cors: {
                origin: "*"
            }
        });
        
        this.io.on('connection', (socket) => {
            console.log('Client connected');

            socket.on('disconnect', () => {
                console.log('Client disconnected');
            });
        });

    }

    public emitir(evento: string, datos: any) {
        this.io.emit(evento, datos)
    }

    public async addRequest(pensum: Pensum): Promise<void> {
        if (this.isProcessing) {
            this.emitir('exit', {
                result: "Error: proceso actualmente en uso"
            })
            return;
        }
        this.isProcessing = true;
        // Simula la ejecución de una tarea larga
        const materiaService = new MateriaService();
        const allMaterias: Materia[] = Object.entries(pensum.materias).map(el => el[1]);
        const total = allMaterias.length;
        let finished = 0;
        for (const materia of allMaterias) {
            await materiaService.addMateria(materia);
            const progress: SocketProgressResponse = {
                total: total,
                finished: ++finished,
                descripcion: `${materia.codigo} - ${materia.nombre}`,
                date: new Date()
            }            
            this.emitir('progress',progress);
        }
        this.isProcessing = false;
        this.emitir('exit', {
            result: "Proceso terminado"
        })
    }

    public static getInstance(): ProgressManager {
        if (!ProgressManager.instancia) {
            throw new Error("El manager de progreso no ha sido inicializado");
        }
        return ProgressManager.instancia;
    }

    public static setInstance(server: http.Server): ProgressManager {
        if (!ProgressManager.instancia) {
            ProgressManager.instancia = new ProgressManager(server);
        }
        return ProgressManager.instancia;
    }
}

export default ProgressManager;