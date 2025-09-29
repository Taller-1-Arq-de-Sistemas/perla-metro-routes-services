import { StationsModel } from "../model/station.js";
import { error, resultTransformers } from "neo4j-driver";
import {validateStaionParse,validateStaionParsePartial} from "../validator/validateStation.js"
import { response } from "express";

export class StationController 
{
    static async postStation(req,res){
        try{
            
            const validate = validateStaionParse(req.body)
            
            if(!validate.success){
                const errors = validate.error.issues.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                    code: err.code
                }));
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
    static async patchStation(req,res){
        try{
            const params ={...req.params,...req.body}
            const validate = validateStaionParsePartial(params)
            console.log(validate.success)
            if(!validate.success){
                const errors = validate.error.issues.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                    code: err.code
                }));
                return res.status(400).json({
                    message: "Datos invalidos",
                    error:errors
                })
            }
            
            const respose = await StationsModel.pachtStation(params);
            console.log(respose)
            if(respose.status !==200)
                {
                    return res.status(respose.status).json({
                        message: respose.message,
                        data:respose.data,
                        error: respose.error
                    })
                }
            return res.status(respose.status).json({
                message:respose.message,
                data:respose.data
            })
        }catch(error)
        {
            console.log('Error en el controlador ', error.message);
            return res.status(500).json({message:"ERROR en el controlador", data:[], error:error.message})
        }
    }
    static async deleteStation(req,res){
        try{
            const params ={...req.params}
            console.log(params)
            const validate = validateStaionParsePartial(params)
            
            if(!validate.success){
                const errors = validate.error.issues.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                    code: err.code
                }));
                return res.status(400).json({
                    message: "Datos invalidos",
                    error:errors
                })
            }
            const result = await StationsModel.softDelete(validate.data);
            if(result.status !==200){
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
            console.log('Error en la petición o solicitud ', error.message)
            return res.status(500).json({
                message: "Error en la petición",
                error: error.message
            })
        }
    }
}