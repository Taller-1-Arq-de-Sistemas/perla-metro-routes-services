import { error } from 'neo4j-driver';
import {database} from '../database/connection.js';
import { validateStationExists,validateStationExistsData } from '../repository/funcionStationValidator.js';

export class StationsModel{
    static async createStation(StationsData){
        try{
            const isArray = Array.isArray(StationsData)

            const stationDataGet = isArray ? StationsData : [ StationsData ]
            
            for (let i = 0; i < stationDataGet.length;i++){
                const validate = await validateStationExists(stationDataGet[i].ID)
                if(validate){
                    return {
                        type:false,
                        status:409,
                        data: stationDataGet[i],
                        message: "Dato no valido"
                    }
                }
            }
            
            const content = []
            for (let i = 0; i < stationDataGet.length;i++){
                const query = `CREATE (s:Station {stationId: $stationId, name: $name , address: $address, stopType: $stopType, stationStatus: $stationStatus}) RETURN s `
                const params = {
                    stationId: stationDataGet[i].ID,   
                    name: stationDataGet[i].NameStation,             
                    address: stationDataGet[i].Location,       
                    stopType: stationDataGet[i].Type,     
                    stationStatus: true
                };
                const result = await database.runQuery(query, params);
                if(result.records.length <= 0){
                    return {
                        type:false,
                        status: 400,
                        message: 'No se pudo crear la estación',
                        data: stationDataGet[i]
                    }
                }
                content.push(result.records[0].get("s").properties)
            }
            return {
                type:true,
                status: 201,
                message: 'Estación creada',
                data: content
            }
        }catch(error){
            console.log('Error al crear estación ', error)
            return {
                type:false,
                status: 500,
                message: 'ERROR, no se creo la estación ',
                error: error,
                data: []
            }
        }
    }
    
    static async getAll(){
        try{
            const query = `
                MATCH (s:Station)
                RETURN s
                ORDER BY s.stationId ASC
            `
            const result = await database.runQuery(query);
            if(result.records.length===0){
                return {
                    status:404,
                    data:null,
                    message:"No se encontraron datos"
                }
            }
            const stations =result.records.map(record => record.get('s').properties)
            return {
                message: `se encontraron ${stations.length} estaciones`,
                data: stations,
                status:  200
            }
        }catch(error){
            console.log("Holaa debe de existir un error medio extraño en esta parte pero miralo -----> ", error.message)
            return {
                message:'Error en la base de datos',
                data: [],
                error: error.message,
                status: 500
            }
        }
    }
    static async pachtStation(data)
    {
        try{
            const validate = await validateStationExists(data.ID);
            if(!validate){
                return {
                    type:false,
                    status:404,
                    data: stationDataGet[i],
                    message: "Dato no existe"
                }
            }
            
            const setClaus =[]
            const params={stationId:data.ID};

            if(data.NameStation){
                setClaus.push('s.name = $name')
                params.name =data.NameStation; 
            }
            if(data.Location){
                setClaus.push('s.address = $address')
                params.address =data.Location; 
            }
            if(data.Type){
                setClaus.push('s.stopType = $stopType')
                params.stopType =data.Type; 
            }
            

            if(setClaus.length>0){
                const query = `
                    MATCH (s:Station {stationId: $stationId})
                    SET ${setClaus.join(', ')}
                    RETURN s
                `
                await database.runQuery(query,params)
            }
            return {
                status: 200,
                message: "Ruta actualizada exitosamente",
                data: {
                    datosActualizados: params
                }
            };
        }catch
        {
            console.log("error en el modelo de estacion, patchStation ",error.message);
            return {
                message:'Error en la base de datos',
                data: [],
                error: error.message,
                status: 500
            }
        }
    }
    static async softDelete(data){
        try{
            const validate = await validateStationExistsData(data.ID)
            if(validate ==null){
                return {
                    message: "La ruta enviada no existe",
                    data:null,
                    status: 404
                }
            }
            console.log(validate)
            const query=`
                MATCH (r:Station {stationId :$stationId})
                SET r.stationStatus = $stationStatus
                RETURN r
            `
            const result = await database.runQuery(query,
                {
                    stationId: data.ID,
                    stationStatus: validate.stationStatus == true ? false : true
                }
            )
            if(result.records.length === 0){
                return {
                    status:400,
                    message:"ERROR AL ACUTALIZAR",
                    data:null
                }
            }
            return {
                status:200,
                message: "ruta eliminada",
                data:result.records[0].get('r').properties
            }

        }catch(Error){
            console.log("Error en el modelo ", error.message);
            return {
                message:'Error en la base de datos',
                data: [],
                error: error.message,
                status: 500
            }
        }
    }
}