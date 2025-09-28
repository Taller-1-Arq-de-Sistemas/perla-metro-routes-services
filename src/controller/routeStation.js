import { error } from "neo4j-driver";
import { RouteStationModel } from "../model/routeStation.js";
import { validateRouteStation,validateRouteStationPartial } from "../validator/validateRouteStation.js";
import { int32 } from "zod";

export class RouteStationController 
{
    static async postRoute(req,res)
    {
        try{
            const result = validateRouteStationPartial(req.body)
            if(!result.success){
                const errors = result.error.issues.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                    code: err.code
                }));
                return res.status(400).json({
                    message: "Datos invalidos",
                    error:errors
                })
            }
            const dataCreate = await RouteStationModel.createRoute(result.data)

            if(dataCreate.status != 201){
                return res.status(dataCreate.status).json({
                    message: dataCreate.message,
                    data: dataCreate.data
                })
            }
            console.log(dataCreate)
            return res.status(dataCreate.status).json({
                message: dataCreate.message,
                data: dataCreate.data
            })

        }catch(error){
            console.log(error.message)

            return res.status(500).json({
                error: error.message,
                message: "Error en el servidor uwu"
            })
        }
    }
    static async getAll(req,res)
    {
        try{
            const result = await RouteStationModel.getRouteAll();
            if(result.status != 200){
                return res.status(result.status).json(
                    {
                        message:result.message,
                        data:result.data,
                        error: result.error? result.error: ""
                    }
                )
            }
            return res.status(result.status).json({
                message:result.message,
                data: result.data
            })
        }
        catch(error)
        {
            console.log("ERROR EN EL SERVIDOR ", error.message)
            return res.status(500).json({
                message: "Problemas en el servidor",
                error: error.message
            })
        }
    }
    static async putStatus(req,res)
    {
        try{
            const routeId =parseInt(req.params.routeId,10)
            const params ={routeId}
            const validate = validateRouteStationPartial(params)
            
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
            
            const result = await RouteStationModel.putStatus(validate.data)
            if(result != 200){
                return res.status(result.status).json({
                    message: result.message,
                    error: result.error ? result.error : "",
                    data: result.data
                })
            }
            return res.status(result.status).json({
                message: result.message,
                data:result.data
            })
        }
        catch(error)
        {
            console.log('errrrrrrrrrrroooooooooooor ', error.message)
            return res.status(500).json({
                message:'error en el controlador',
                error:error.message
            })
        }
    }
    static async getRouteId(req, res)
    {
        try
        {
            const routeId =parseInt(req.params.routeId,10)
            const params ={routeId}
            const validate = validateRouteStationPartial(params)
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
            
            
            const result=await RouteStationModel.getRouteId(validate.data)

            if(result.status != 200){
                return res.status(result.status).json({
                    message: result.message,
                    data:null,
                    error: result.error ? result.error : ""
                })
            }
            return res.status(result.status).json({
                message: result.message,
                data:result.data,
            })

        }catch(error)
        {
            console.log(error.message + " ERror en el controlador" );
            return res.status(500).json({
                message:"ERROR EN EL CONTROLADOR ",
                data:null,
                error:error.message
            })
        }
    }
    static async updateRouteId(req,res){
        try
        {
            const routeId =parseInt(req.params.routeId,10)
            const params ={routeId,...req.body}
            const validate = validateRouteStationPartial(params)
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
            
            const result =await RouteStationModel.updateRoute(validate.data)
            if(result.status !=200)
                {
                    return res.status(result.status).json(
                        {
                            message:result.message,
                            data: result.data,
                            error: result.error?result.error:""
                        })
                }
            return res.status(result.status).json(
                {
                    message:result.message,
                    data:result.data
                })
        }
        catch(error)
        {
            console.log("ERROR EN EL CONTROLADOR ", error.message)
            return res.status(500).json({
                message: "ERROR EN EL CONTROLADOR",
                error:error.message
            })
        }
    }
} 