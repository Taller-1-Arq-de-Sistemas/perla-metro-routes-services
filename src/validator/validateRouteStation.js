import {z} from 'zod';

const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

const routeStationValidate=z.object({
    routeId: z.number({required_error: "El usuario debe de ingresar una id"}).min(0,{message: "El usuario debe de ingrear un numero positivo"}),
    inicio: z.number({required_error: "El usuario debe de ingresar una id númerica"}).min(0,{message: "El usuario debe de ingrear un numero positivo"}),
    intermedio: z.array(z.number({required_error:"Los valores intermedios deben de ser numericos"}).min(0,{message:"Las id deben de ser número positivos"})),
    fina:z.number({required_error: "El usuario debe de ingresar una id"}).min(0,{message: "El usuario debe de ingrear un numero positivo"}),
    horaInicio: z.string({required_error:"El usuario debe de ingresar una hora"}).regex(timeRegex,{message:"La hora ingresada debe de ser HH:00 (00:00)-(23:59)"}),
    horaFinal: z.string({required_error:"El usuario debe de ingresar una hora"}).regex(timeRegex,{message:"La hora ingresada debe de ser HH:00 (00:00)-(23:59)"}),
    estatus: z.number({required_error: "El usuario debe de ingresar un estado númerico"}).min(0,{message: "El usuario debe de ingrear un numero positivo"}).max(1,{message:"El usuario solo puede registrar número maximo 1"})
}).refine(data=>data.horaInicio<data.horaFinal,{
    message:"La hora de final debe de ser posterior a la hora inicio",
    path:["horaFin"]
}).refine(data=>data.horaInicio =!data.horaFinal,{
    message:"Las horas no puede ser iguales",
    path:["final"]
})

export function validateRouteStation(data){
    return routeStationValidate.safeParse(data);
}
export function validateRouteStationPartial(data)
{
    return routeStationValidate.partial().safeParse(data);
}
