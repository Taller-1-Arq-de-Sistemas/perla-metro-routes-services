import {database} from '../database/connection.js';
import { validateStationExists } from '../validator/funcionStationValidator.js';

export class StationsModel{
    static async createStation(StationsData){
        try{
            if (await validateStationExists(StationsData.stationId)){
            return {
                type:false,
                status: 409,
                message: 'Estación existente',
                data:StationsData
            }
        }
            const query = `CREATE (s:Station {stationId: $stationId, name: $name, address: $address, stopType: $stopType, stationStatus: $stationStatus}) RETURN s `
            const params = {
                stationId: StationsData.stationId,   // antes: StationsData.id
                name: StationsData.name,             // antes: StationsData.nombre
                address: StationsData.address,       // antes: StationsData.ubicacion
                stopType: StationsData.stopType,     // antes: StationsData.tipo
                stationStatus: StationsData.stationStatus // antes: StationsData.estado
            };

            const  result = await database.runQuery(query, params);
            if(result.records.length <= 0){
                return {
                    type:false,
                    status: 400,
                    message: 'No se pudo crear la estación',
                    data:null
                }
            }
            const createStationData = result.records[0].get('s').properties;
            return {
                type:true,
                status: 201,
                message: 'Estación creada',
                data: createStationData
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

            const stations =result.records.map(record => record.get('s').properties);

            return {
                message: stations.length > 0 ? `Se encontraro ${stations.length} estaciones` : "no se encontraron estaciones",
                data: stations,
                status: stations.length > 0 ? 200 : 204 
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