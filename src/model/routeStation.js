import {database} from '../database/connection.js';
import {deleteRoute, getIdRoute, getRoute, lastId } from '../repository/funtionRouteValidator.js'
import {  validateStationExistsData } from '../repository/funcionStationValidator.js';

export class RouteStationModel
{
    static async createRoute(data)
    {
        try{
            let validate =  await validateStationExistsData(data.inicio);
            
            if(validate == null ){
                return {
                    message: "El id de inicio no es valido ",
                    data: data.inicio,
                    status: 400
                }
            } 


            for(let i = 0; i<data.intermedio.length;i++){
                validate = await validateStationExistsData(data.intermedio[i])
                if(validate==null ){
                    return {
                        message: "El id de intermedio no es valido ",
                        index: i,
                        data: data.intermedio[i],
                        status: 400
                    }   
                }
            }
            
            validate = await validateStationExistsData(data.final)
            if(validate==null)
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
    static async getRouteAll(){
        try{
            let query = `
            MATCH (r:ROUTE {routeStatus: 1}) 
            OPTIONAL MATCH (r)-[:rutaInicio]->(inicio:Station)
            OPTIONAL MATCH (r)-[:rutaFin]->(final:Station)
            OPTIONAL MATCH path = (inicio)-[:rutaIntermedia*]->(final)
            WITH DISTINCT r, inicio, final,
                 CASE
                   WHEN inicio IS NOT NULL AND final IS NOT NULL
                   THEN [(inicio)-[:rutaIntermedia*]->(final) | nodes(path)[1..-1]][0]
                   ELSE []        
                  END as nodosIntermedios          
            RETURN r, inicio, final, nodosIntermedios`
            const result = await database.runQuery(query);
            if(result.records.length==0){
                return {
                    status:404,
                    message:"Datos inexistentes",
                    data:null
                }
            }
            const routeMap = result.records.map(record => 
                {
                    const rute = record.get('r').properties;
                    const dataMost ={
                        routeId: rute.routeId,
                        startTime: rute.startTime,
                        endTime: rute.endTime
                    }
                    const inicio = record.get('inicio') ? record.get('inicio').properties : null;
                    const final = record.get('final') ? record.get('final').properties: null;
                    const intermedia = record.get('nodosIntermedios')  || []
                    const rutaIntermedia = intermedia.map(node => ({
                        stationId: node.properties.stationId,
                        name: node.properties.name,
                        address: node.properties.address,
                        stopType: node.properties.stopType,
                    }));
                    return {
                        rute: dataMost,
                        estacionInicio : inicio,
                        estacionFinal: final,
                        estacionesIntermedias :rutaIntermedia
                    }

                });
                
            return {
                status:200,
                data: routeMap,
                message: "Datos encontrados"
            }
        }catch(error){
            console.log("error en la base de datos ", error.message);
            return {
                status:403,
                data: null,
                message: "Error inesperado en la solicitud",
                error: error.message
            }
        }

    }
    static async putStatus(data){
        try{
            console.log(data.routeId)
            const validate = await getRoute(data.routeId)
            if(validate ==null){
                return {
                    message: "La ruta enviada no existe",
                    data:null,
                    status: 404
                }
            }
            const query=`
                MATCH (r:ROUTE {routeId :$routeId})
                SET r.routeStatus = $routeStatus
                RETURN r
            `
            const result = await database.runQuery(query,
                {
                    routeId: data.routeId,
                    routeStatus: validate.routeStatus == 1 ? 0 : 1
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
        }  
        catch(error)
        {
            console.log('Error en la base de datos', error.message)
            return {
                message: "Error en la base de datos",
                error: error.message,
                data:null
            }
        }

    }
    static async getRouteId(data){
        try{
            let query = `
                MATCH (r:ROUTE {routeId: $routeId,routeStatus: 1}) 
                OPTIONAL MATCH (r)-[:rutaInicio]->(inicio:Station)
                OPTIONAL MATCH (r)-[:rutaFin]->(final:Station)
                OPTIONAL MATCH path = (inicio)-[:rutaIntermedia*]->(final)
                WITH DISTINCT r, inicio, final,
                     CASE
                       WHEN inicio IS NOT NULL AND final IS NOT NULL
                       THEN [(inicio)-[:rutaIntermedia*]->(final) | nodes(path)[1..-1]][0]
                       ELSE []        
                     END as nodosIntermedios 
                RETURN r, inicio, final, nodosIntermedios
            `
            const result = await database.runQuery(query, {routeId:data.routeId})
            if(result.records.length==0){
                return {
                    status:404,
                    message:"Datos inexistentes",
                    data:null
                }
            }
            const routeMap = result.records.map(record => 
                {
                    const rute = record.get('r').properties;
                    const dataMost ={
                        routeId: rute.routeId,
                        startTime: rute.startTime,
                        endTime: rute.endTime
                    }
                    const inicio = record.get('inicio') ? record.get('inicio').properties : null;
                    const final = record.get('final') ? record.get('final').properties: null;
                    const intermedia = record.get('nodosIntermedios')  || []
                    const rutaIntermedia = intermedia.map(node => ({
                        stationId: node.properties.stationId,
                        name: node.properties.name,
                        address: node.properties.address,
                        stopType: node.properties.stopType,
                    }));
                    return {
                        rute: dataMost,
                        estacionInicio : inicio,
                        estacionFinal: final,
                        estacionesIntermedias :rutaIntermedia
                    }

                }
            );
            return {
                status:200,
                data: routeMap,
                message: "Datos encontrados"
            }
        }
        catch(error){
            console.log(error.message)
            return {
                message: "Error en el modulo",
                error:error.message,
                data:null,
                status:500
            }
        }
    }
    static async updateRoute(data){
        try{
            const lostData = await getIdRoute(data.routeId);
            if(!lostData){
                return {
                    message: "No existe la ruta",
                    status:404,
                    data:null
                }
            }

            const finalData ={
                routeId: data.routeId,
                inicio: (data.inicio|| lostData[0].estacionInicio) ,
                final: data.final || lostData[0].estacionFinal,
                intermedio: data.intermedio|| lostData[0].estacionesIntermedias
            }
            console.log(finalData)
           
            await deleteRoute(data.routeId)
            
            let query =`
                MATCH (r:ROUTE {routeId: $routeId}), (s:Station {stationId: $stationId})
                CREATE (r)-[:rutaInicio]->(s)
            `
            await  database.runQuery(query,{
                routeId: data.routeId,
                stationId: finalData.inicio
            })
            query =`
                MATCH (r:ROUTE {routeId: $routeId}), (s:Station {stationId: $stationId})
                CREATE (r)-[:rutaFin]->(s)
            `
            //Conexción ruta final
            await database.runQuery(query,{
                routeId: data.routeId,
                stationId: finalData.final
            })
            query = `
                        MATCH (s1:Station {stationId: $station1}), (s2:Station {stationId: $station2})
                        CREATE (s1)-[:rutaIntermedia]->(s2)
                    `
            for(let i = 0; i<finalData.intermedio.length;i++){
                if(i==0){
                    
                    await database.runQuery(query,{
                        station1:finalData.inicio,
                        station2:finalData.intermedio[i]
                    })
                }
                if(i==finalData.intermedio.length-1){
                    await database.runQuery(query,{
                        station1: finalData.intermedio[i],
                        station2: finalData.final
                    })
                }
                if(i<finalData.intermedio.length-1){
                    await database.runQuery(query,{
                    station1: finalData.intermedio[i],
                    station2: finalData.intermedio[i+1]
                })
                }
   
            }
            const setClaus =[]
            const params={routeId:data.routeId};
            
            if(data.horaInicio){
                setClaus.push('r.startTime = $startTime')
                params.startTime = data.horaInicio
            }
            if(data.horaFin){
                setClaus.push('r.endTime = $endTime')
                params.endTime = data.horaFin
            }
            if(data.estatus){
                setClaus.push('r.routeStatus = $routeStatus')
                params.routeStatus = data.estatus
            }
            if(setClaus.length>0){
                query = `
                    MATCH (r:ROUTE {routeId: $routeId})
                    SET ${setClaus.join(', ')}
                    RETURN r
                `
                await database.runQuery(query,params)
            }
            return {
                status: 200,
                message: "Ruta actualizada exitosamente",
                data: {
                    routeId: data.routeId,
                    datosActualizados: {...finalData, ...params}
                }
            };
        }
        catch(error)
        {
            console.log("ERROR EN EL MODELO ", error.message)
            return{
                message:"ERROR EN EL MODELO",
                error:error.message,
                status:500,
                data:null
            }
        }
    }
}