import express from "express";
import morgan from "morgan";
import neo4j from "neo4j-driver";
import cors from "cors"
import helmet from "helmet";
import dotenv from "dotenv";
import stationRouter from "./router/station.js";
import routeStationRouter from "./router/routeStation.js";
import {initializeDataBase, handleGracefulShutdown} from "./database/connection.js"


dotenv.config();
const app = express();
const PORT = 3000 ;

const driver =neo4j.driver(
    process.env.NEO4J_URI || 'bolt://localhost:7687',
    neo4j.auth.basic(
        process.env.NEO4J_USER || 'neo4j',
        process.env.NEO4J_PASSWORD || 'password123'
    )
);

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use('/api/routeStation',routeStationRouter)
app.use('/api/station',stationRouter)
async function startApp() {
    await initializeDataBase();
    handleGracefulShutdown();
    app.listen(PORT, async()=>{
        console.log(`Servidor ejecutandose en el puerto http://localhost:${PORT}`);
})
    
}

startApp();

export default app;

