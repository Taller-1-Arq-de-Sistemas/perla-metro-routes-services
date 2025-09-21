import {z} from "zod";


const validateStation = z.object({

    estacionId: z.number({required_error: "El usuario debe de ingresar una id"}).min(0,{message: "El usuario debe de ingrear un numero positivo"}),
    nombre: z.string({required_error:"El usuario debe de ingresar un nombre valido"}).min(0,{message:"El usuario debe de ingresar minimo 0 datos"}),
    direccion: z.string({required_error:"El usuario debe de ingresar una dirección valida"}).min(0,{message:"El usuario debe de ingresar minimo 0 datos"}),
    tipoParada:z.enum("Inicio, Intermedio, Final",{message:"Se deben de ingresar solo este tipo de paradasd (Inicio, Intermedio, Final)"}),
    estadoEstacion:z.number({required_error: "El usuario debe de ingresar una id"}).min(0,{message: "El usuario debe de ingrear un numero positivo"})

})

export function validateStaionParse(data){
    return validateStation.safeParse(data);
}
export function validateStaionParsePartial(data)
{
    return validateStation.partial().safeParse(data);
}