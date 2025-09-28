import neo4j from "neo4j-driver"

class Neo4j {
    constructor(){
        this.driver = null;
        this.isConnection =false;
    }
    async connect(){
        try{
            this.driver=neo4j.driver(
                'bolt://localhost:7687',
                neo4j.auth.basic(
                    'neo4j',
                    'password123'
                )
            )
            const session =this.driver.session()
            await session.run('RETURN 1')
            await session.close()

            this.isConnection = true;
            console.log("Conexion exitosa");
            return true;
        }
        catch(error){
            console.log('error de conexion ', error  );
            this.isConnection=false;
            return false;
        }
    }
    getSession(){
        if(!this.driver){
            throw new Error('Base de datos no encontrada');

        }
        return this.driver.session();
    }
    async runQuery(query,params={}){
        const session =this.getSession();
        try{
            const result = await session.run(query,params);
            return result;
        }catch(error){
            console.log('error al ejecutar la query ',error);
            throw error
        }finally{
            await session.close()
        }
    }

    async runTransaccional(transaccionalFN){
        const session = this.getSession();
        try{
            const result =await session.executeWrite(transaccionalFN);
            return result;
        }catch(error){
            console.log('Erron en la transacción ', error);
            throw error
        }finally{
            await session.close();
        }
    }
    async close(){
        if(this.driver){
            await this.driver.close()
            this.isConnection = false;
            console.log('Conexión cerrada ');
        }
    }
    isHealthy(){
        return this.isConnection && this.driver !== null;
    }
}
const database =new Neo4j();
export default database;