import { Body, Controller, Delete, Get, Path, Post, Query, Route } from "tsoa";
import { Request } from "express";
import db from "../firestore/firestore";
import { Materia, Pensum } from "../model/allmodels";
import { DocumentReference, QuerySnapshot } from "@google-cloud/firestore";
import { MateriaService } from "../services/materiaService";
import ProgressManager from "../util/progressManager";



@Route("materias")
export default class FireStoreController extends Controller {
    private materiaService = new MateriaService();

    @Get("/{codigo}")
    public async getMateriaByCodigo(@Path() codigo: string): Promise<Materia | null> {    
        const result: Materia | null = await this.materiaService.getMateriaByCodigo(codigo);
        if(result){
            return result;
        }else{
            this.setStatus(404);
            return null;
        }
    }
    
    @Get("/")
    public async getAllMaterias(): Promise<Materia[]> {
        return this.materiaService.getAllMaterias();
    }

    @Get("/semestres")
    public async getMateriasGroupBySemestre(): Promise<Materia[][]> {
        return this.materiaService.getMateriasGroupBySemestre();
    }

    @Get("/semestres/{semestre}")
    public async getMateriasOfSemestre(@Path() semestre: number): Promise<Materia[]> {
        return this.materiaService.getMateriasOfSemestre(semestre);
    }

    @Post("/add")
    public async addMateria(@Body() materia: Materia): Promise<void> {
        await this.materiaService.addMateria(materia);
    }

    @Post("/addpensum")
    public async addPensum(@Body() pensum: Pensum): Promise<void> {
        const progressManager: ProgressManager = ProgressManager.getInstance();
        progressManager.addRequest(pensum); //no tiene await a propósito, de tenerlo, esperaría a que todas las materias se añadieran
    }

    @Delete("/deletepensum")
    public async deleteAllPensum(): Promise<void> {
        await this.materiaService.deletePensum()
    }
}