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
} 