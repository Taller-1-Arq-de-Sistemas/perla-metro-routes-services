import {database} from '../database/connection.js'

export async function validateRoute(routeId){
    try{
        const query = 'MATCH (r:ROUTE {routeId: $routeId}) RETURN r'
        const result = await database.runQuery(query,{routeId: routeId});
       
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
  
export async function getRoute(routeId) {
    try
    {
        const query =`
            MATCH (r:ROUTE {routeId: $routeId})
            RETURN r
        `
        
        const result = await database.runQuery(query,{routeId: routeId})
        
        if(result.records.length==0){
            console.log('error, no se encontraron datos')
            return null
        }
        
        return result.records[0].get('r').properties
    }
    catch(error)
    {
        console.log('ERROR EN LA BASE DE DATOS ', error.message)
        return null
    }
    
}
export async function lastId() {
    try{
        const query = `
            MATCH (r:ROUTE)
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
export async function getIdRoute(routeId) {
    try{
        let query = `
            MATCH (r:ROUTE {routeId: $routeId}) 
            OPTIONAL MATCH (r)-[:rutaInicio]->(inicio:Station)
            OPTIONAL MATCH (r)-[:rutaFin]->(final:Station)
            OPTIONAL MATCH path = (inicio)-[:rutaIntermedia*]->(final)
            WITH r, inicio, final,
                [node in nodes(path)[1..-1] | node ] as nodosIntermedios
            RETURN r, inicio, final, nodosIntermedios
        `
        const result = await database.runQuery(query, {routeId})

        

        if(result.records.length==0){
            return null
        }
            const routeMap = result.records.map(record => 
                {
                    const rute = record.get('r').properties;
                    const dataMost ={
                        routeId: rute.routeId,
                        startTime: rute.startTime,
                        endTime: rute.endTime
                    }
                    const inicio = record.get('inicio') ? record.get('inicio').properties.stationId : null;
                    const final = record.get('final') ? record.get('final').properties.stationId: null;
                    const intermedia = record.get('nodosIntermedios')  || []
                    const rutaIntermedia = intermedia.map(node => node.properties.stationId);
                    return {
                        rute: dataMost.routeId,
                        estacionInicio : inicio,
                        estacionFinal: final,
                        estacionesIntermedias :rutaIntermedia
                    }

                }
            );
            return routeMap;
    }
    catch(error)
    {
        console.log('Error en la base de datos', error.message)
        return null
    }
    
}
export async function deleteRoute(routeId) {
    try{
         const pathQuery = `
            MATCH (r:ROUTE {routeId: $routeId})-[:rutaInicio]->(inicio:Station)
            MATCH (r)-[:rutaFin]->(final:Station)
            OPTIONAL MATCH path = (inicio)-[:rutaIntermedia*]->(final)
            RETURN [node in nodes(path) | node.stationId] as stations
        `;
        
        const result = await database.runQuery(pathQuery, { routeId });
        
        if (result.records.length > 0) {
            const stations = result.records[0].get('stations') || [];
            
            // 2. Eliminar relaciones rutaIntermedia en secuencia
            for (let i = 0; i < stations.length - 1; i++) {
                await database.runQuery(`
                    MATCH (s1:Station {stationId: $station1})-[r:rutaIntermedia]->(s2:Station {stationId: $station2})
                    DELETE r
                `, {
                    station1: stations[i],
                    station2: stations[i + 1]
                });
            }
        }
        await database.runQuery(`
            MATCH (r:ROUTE {routeId: $routeId})-[rel:rutaInicio|rutaFin]->()
            DELETE rel
        `, { routeId });

        return true;
    }
    catch(error)
    {
        console.log('error al eliminar las rutas ',error.message )
        return false
    }
    
}