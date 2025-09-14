import {database} from '../database/connection.js'
export async function validateStationExists(stationId){
    try{
        const query = 'MATCH (s:Station {stationId: $stationId}) RETURN s'
        
        const result = await database.runQuery(query,{stationId: stationId});
        if(result.records.length>0){
            return true;
        }
        return false;
    }
    catch(error){
        console.log('Error en la validación para encontrar una estación ', error)
        return false;
    }
    
}