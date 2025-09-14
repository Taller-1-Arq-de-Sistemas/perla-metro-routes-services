import database from './neo4j.js';

export const initializeDataBase = async ()=>{
    try{
        const connected = await database.connect();
        if(!connected){
            console.log('No se realizop la conexión')
            process.exit(1)
        }
        return database;
    }catch(error){
        console.log('Error al conectar con la db ', error)
        process.exit(1)
    }
}

export const handleGracefulShutdown = ()=>{
    process.on('SIGINT', async () =>{
        console.log('Cerrando aplicación ')
        await database.close()
        process.exit(0);
    })
    process.on('SIGTERM', async () => {
        console.log('🛑 Cerrando aplicación...');
        await database.close();
        process.exit(0);
    });
}
export {database};