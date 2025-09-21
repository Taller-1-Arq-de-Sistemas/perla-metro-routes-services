import { StationsModel } from "../model/station.js";
import { error } from "neo4j-driver";
import {validateStaionParse, validateStaionParsePartial} from "../validator/validateStation.js"

export class StationController 
{
    static async postStation(req,res){
        try{
            const validate = validateStaionParsePartial(req.body)
            const errors = validate.error.issues.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                    code: err.code
                }));
            if(!validate.success){
                return res.status(400).json({
                    message: "Datos invalidos",
                    error:errors
                })
            }
            
            const result = await StationsModel.createStation(validate.data);
            if(!result.type){
                return res.status(result.status).json(
                    {
                        message:result.message,
                        data:result.data,
                        error: result.error? error.error: ""
                    }
                )
            }
            return res.status(result.status).json(
                {
                    message: result.message,
                    data:result.data
                }
            )
        }catch(error){
            return res.status(500).json({message:'Error en el servidor '+ error,
                error: error
            })
        }
    }
    static async getAllStation(req,res){
        try{
            const resulte = await StationsModel.getAll();
            if(resulte.status ===500){
                return res.status(resulte.status).json({
                    message: resulte.message,
                    error: resulte.error
                })
            }
            return res.status(resulte.status).json({
                message:resulte.message,
                data:resulte.data,
            })
        }catch(error){
            console.log('Error en la petición o solicitud ', error.message)
            return res.status(500).json({
                message: "Error en la petición",
                error: error.message
            })
        }
    }
}