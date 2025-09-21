import {z} from "zod";


const validateStation = z.object({

    estacionId: z.number({required_error: "El usuario debe de ingresar una id"}).min(0,{message: "El usuario debe de ingrear un numero positivo"}),
    nombre: z.string({required_error:"El usuario debe de ingresar un nombre valido"}).min(1,{message:"El usuario debe de ingresar minimo 1 datos"}),
    direccion: z.string({required_error:"El usuario debe de ingresar una dirección valida"}).min(1,{message:"El usuario debe de ingresar minimo 1 datos"}),
    tipoParada:z.enum(["Inicio", "Intermedia", "Final"],{message:"Se deben de ingresar solo este tipo de paradasd (Inicio, Intermedio, Final)"}),
    estadoEstacion:z.number({required_error: "El usuario debe de ingresar una id"}).min(0,{message: "El usuario debe de ingrear un numero positivo"})

})

const validatePartialUnion = z.union([
    validateStation,
    z.array(validateStation)
]);

export function validateStaionParse(data){
    return validatePartialUnion.safeParse(data);
}
export function validateStaionParsePartial(data)
{
    const partialStation =validateStation.partial();
    const partialUnion =z.union([
        partialStation,
        z.array(partialStation)
    ])
    return partialUnion.safeParse(data);
}