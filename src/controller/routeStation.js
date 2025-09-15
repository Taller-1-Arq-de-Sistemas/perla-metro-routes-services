import { RouteStationModel } from "../model/routeStation.js";

export class RouteStationController 
{
    static async postRoute(req,res)
    {
        try{
            const dataBody =  req.body

            const dataCreate = await RouteStationModel.createRoute(dataBody)

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
} 