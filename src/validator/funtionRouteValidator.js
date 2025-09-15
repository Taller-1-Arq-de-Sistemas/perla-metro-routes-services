import {database} from '../database/connection.js'

export async function validateRoute(routeId){
    try{
        const query = 'MATCH (r:route {routeId: $routeId}) RETURN r'
        const result = await database.runQuery(query,{routeId: routeId});
        const lastid = await lastId()
       
        if(result.records.length<0){
            console.log('No existen datos')
            return false
        }
        return true
    }
    catch(error)
    {
        console.log("Error en la validación de ruta ", error.message)
        return false;
    }
}
  
export async function lastId() {
    try{
        const query = `
            MATCH (r:route)
            RETURN r.routeId as lastId
            ORDER BY r.routeId DESC
            LIMIT 1
        `
        const result = await database.runQuery(query);
        if(result.records.length ===0){
            console.log('No se encontraron datos')
            return 0
        }
        let nextId = result.records[0].get('lastId');
        nextId = Number(nextId);
        return nextId + 1;
    }catch(error){
        console.log('Error al encontrar la ultima route para el autoincement', error.message);
        return -1;
    }
    
}