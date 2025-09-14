import { success } from "zod";
import { StationsModel } from "../model/station.js";

export class StationController 
{
    static async postStation(req,res){
        try{
            const data = req.body;
            
            const array =Array.isArray(data);
            const stationData = array?data:[req.body];
            if(stationData.length === 0){
                return res.status(400).json({message:'datos no enviados'});
            }
            const results = [];
            const errors = [];
            for(let i = 0; i< stationData.length ; i++){
                const stationDataCreate =stationData[i];
                //validaciones
                try
                {
                  const result = await StationsModel.createStation(stationDataCreate);
                  if(result.status==409){
                    errors.push({
                        index:i,
                        data:result.data,
                        error: result.message
                    })
                  }
                  else if(!result.type){
                    results.push({
                        index:i,
                        status: true,
                        data: result.data
                    });
                  } 
                  else{
                    errors.push({
                        index:i,
                        data:result.data,
                        error: result.error
                    })
                  }
                }catch(error){
                    errors.push({
                        index:i,
                        data: stationData.data,
                        error: error.message
                    })
                }
            }


            const processTotal = results.length + errors.length;
            const exitsError = errors.length >0;
            const existsResults = results.length>0;

            let statusCode;
            let message;


            if(existsResults && !exitsError){
                statusCode = 201
                message= `${results.length} estaciones creadas exitosamente`;
            }
            else if(existsResults && exitsError){
                statusCode =207
                message= `${errors.length} estaciones creadas y ${exitsError.length} estaciones no creadas`;
            }
            else{
                statusCode = 400
                message = "No se creo ninguna estación"
            }

            const response={
                status: existsResults,
                message,
                processTotal,
                totalProcess : processTotal,
                errorCount: exitsError.length,
                data:{
                    created: results,
                    error: errors
                }
            }
            if(!array && results.length === 1){
                return res.status(201).json({
                    status: true,
                    message: "Estación creada",
                    data: results[0].data
                })
            }
            if(!array && errors.length === 1){
                return res.status(400).json({
                    status: false,
                    message: errors[0].message || "Dato ya creado",
                    data: null
                })
            }
            return res.status(statusCode).json(response)
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