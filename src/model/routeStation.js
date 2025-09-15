import {database} from '../database/connection.js';
import {lastId} from '../validator/funtionRouteValidator.js'
import { validateStationExistsData } from '../validator/funcionStationValidator.js';

export class RouteStationModel
{
    static async createRoute(data)
    {
        try{
            // comporar los datos de llegada mejor lo hago con zod
            let validate =  await validateStationExistsData(data.inicio);
            
            if(validate == null || validate.stopType != "Inicio"){
                return {
                    message: "El id de inicio no es valido ",
                    data: data.inicio,
                    status: 400
                }
            } 


            for(let i = 0; i<data.intermedio.length;i++){
                validate = await validateStationExistsData(data.intermedio[i])
                if(validate==null || validate.stopType !="Intermedia"){
                    return {
                        message: "El id de intermedio no es valido ",
                        index: i,
                        data: data.intermedio[i],
                        status: 400
                    }   
                }
            }
            validate = await validateStationExistsData(data.final)
            if(validate==null|| validate.stopType !="Final")
                {
                    return {
                    message: "El id de final no es valido ",
                    data: data.final,
                    status: 400
                }
            }
            
            
            const routeId = await lastId();
            
            let query = `CREATE (r:ROUTE {routeId: $routeId, startTime: $startTime, endTime: $endTime, routeStatus: $routeStatus}) RETURN r`
            
            const resultQuery = await database.runQuery(query,{
                routeId:routeId,
                startTime: data.horaInicio,
                endTime:data.horaFin,
                routeStatus: 1
            })
            
            if( resultQuery.records.length ===0){
                return{
                    data: null,
                    message: "No es posible crear una ruta por ahora",
                    status: 400
                }
            }
            //Conexción principal
            query =`
                MATCH (r:ROUTE {routeId: $routeId}), (s:Station {stationId: $stationId})
                CREATE (r)-[:rutaInicio]->(s)
            `
            await  database.runQuery(query,{
                routeId: routeId,
                stationId: data.inicio
            })
            query =`
                MATCH (r:ROUTE {routeId: $routeId}), (s:Station {stationId: $stationId})
                CREATE (r)-[:rutaFin]->(s)
            `
            //Conexción ruta final
            await database.runQuery(query,{
                routeId: routeId,
                stationId: data.final
            })
            query = `
                        MATCH (s1:Station {stationId: $station1}), (s2:Station {stationId: $station2})
                        CREATE (s1)-[:rutaIntermedia]->(s2)
                    `
            for(let i = 0; i<data.intermedio.length;i++){
                if(i==0){
                    
                    await database.runQuery(query,{
                        station1:data.inicio,
                        station2:data.intermedio[i]
                    })
                }
                if(i==data.intermedio.length-1){
                    await database.runQuery(query,{
                        station1: data.intermedio[i],
                        station2: data.final
                    })
                }
                if(i<data.intermedio.length-1){
                    await database.runQuery(query,{
                    station1: data.intermedio[i],
                    station2: data.intermedio[i+1]
                })
                }
   
            }
            console.log("                    ")
            console.log("                    ")
            console.log("                    ")
            console.log("                    ")
            console.log("                    ")
            console.log("                    ")
            console.log("LLEGO A ESTA PARTE")
            console.log("                    ")
            console.log("                    ")
            console.log("                    ")
            console.log("                    ")
            console.log("                    ")
            return {
                status: 201,
                message: "Ruta creada",
                data: resultQuery.records[0].get('r').properties
            }
            
        }
        catch(error)
        {
            console.log('Error al crear una runa ', error.message)
            return {
                message: 'Error en la base de datos',
                error:error.message,
                status:500
            }
        }
    }
}