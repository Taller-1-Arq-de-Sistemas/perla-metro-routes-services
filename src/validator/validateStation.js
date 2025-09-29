import {z} from "zod";


const validateStation = z.object({

    ID: z.string({required_error: "El usuario debe de ingresar una id"}).uuid({message:"Valor NO VALIDO"}),
    NameStation: z.string({required_error:"El usuario debe de ingresar un nombre valido"}).min(1,{message:"El usuario debe de ingresar minimo 1 datos"}),
    Location: z.string({required_error:"El usuario debe de ingresar una dirección valida"}).min(1,{message:"El usuario debe de ingresar minimo 1 datos"}),
    Type:z.enum(["Origen", "Intermedia", "Destino"],{message:"Se deben de ingresar solo este tipo de paradasd (Inicio, Intermedio, Final)"}),
    State: z.boolean({required_error: "El usuario debe de ingresar una id"})

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