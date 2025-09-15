import { RouteStationController } from "../controller/routeStation.js";
import { Router } from "express";

const routeStationRouter = Router()

routeStationRouter.post('/create',RouteStationController.postRoute)


export default routeStationRouter