import {database} from '../database/connection.js';
import { validateStationExists } from '../validator/funcionStationValidator.js';

export class StationsModel{
    static async createStation(StationsData){
        try{
            const isArray = Array.isArray(StationsData)

            const stationDataGet = isArray ? StationsData : [ StationsData ]
            
            for (let i = 0; i < stationDataGet.length;i++){
                const validate = await validateStationExists(stationDataGet[i].stationId)
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
                const query = `CREATE (s:Station {stationId: $stationId, name: $name, address: $address, stopType: $stopType, stationStatus: $stationStatus}) RETURN s `
                const params = {
                    stationId: stationDataGet[i].stationId,   
                    name: stationDataGet[i].name,             
                    address: stationDataGet[i].address,       
                    stopType: stationDataGet[i].stopType,     
                    stationStatus: stationDataGet[i].stationStatus 
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
}