export interface Dictionary<T> {
    [Key: string]: T;
}

export interface Clase {
    dia: number;
    horaInicio: number;
    horaFin: number;
    salon: string;
}

export interface Grupo {
    nombre: string;
    profesor: string;
    maximo: number;
    disponible: number;
    clases: Clase[];
}

export interface Materia {
    semestre: number;
    carrera: string;
    codigo: string;
    nombre: string;
    horas: number;
    creditos: number;
    requisitos: string[];
    isElectiva: boolean;
    grupos: Dictionary<Grupo>;
}

export interface Pensum {
    materias: Dictionary<Materia>;
    codigo: string;
    fecha: Date;
}