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
export async function validateStationExistsData(stationId) {
    try{
        const query = `
            MATCH (s: Station {stationId: $stationId})
            RETURN s
            `
        const result = await database.runQuery(query,{
            stationId:stationId
        })
        console.log(result.records[0].get('s').properties)
        if(result.records.length ===0){
            return null
        }
        const data =  result.records[0].get('s').properties;
        
        return result.records[0].get('s').properties;
    }
    catch(error){
        console.log('ERROR, ALGO MAL SALIO', error.message)
        return null
    }
    
}
