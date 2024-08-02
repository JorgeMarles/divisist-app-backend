import { Body, Controller, Delete, Get, Path, Post, Query, Route } from "tsoa";
import { Request } from "express";
import db from "../firestore/firestore";
import { Materia, Pensum, PensumInfo } from "../model/allmodels";
import { DocumentReference, QuerySnapshot } from "@google-cloud/firestore";
import { MateriaService } from "../services/materiaService";
import ProgressManager from "../util/progressManager";
import ErrorResponse, { ResponseStatus } from "../util/errorResponse";
import { authenticateTokenMiddleware } from "../middleware/authMiddleware";



@Route("materias")
export default class FireStoreController extends Controller {
    private materiaService = new MateriaService();
    
    @Post("/addpensum")
    public async addPensum(@Body() pensum: Pensum): Promise<void | ErrorResponse> {
        if(ProgressManager.getInstance().isOccupied()){
            return {
                error: "Server processing another request.",
                status: ResponseStatus.INTERNAL_ERROR
            }
        }
        this.materiaService.addPensum(pensum);
    }

    @Delete("/deletepensum/{carrera}")
    public async deleteAllPensum(@Path() carrera: string): Promise<void> {
        await this.materiaService.deletePensum(carrera)
    }

    @Get("/pensum/{carrera}")
    public async getPensum(@Path() carrera: string): Promise<Pensum>{
        return await this.materiaService.getPensum(carrera);
    }
}