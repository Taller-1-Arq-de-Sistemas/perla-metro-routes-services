import { RouteStationController } from "../controller/routeStation.js";
import { Router } from "express";

const routeStationRouter = Router()

routeStationRouter.post('/create',RouteStationController.postRoute)
routeStationRouter.get('/all',RouteStationController.getAll)
routeStationRouter.put('/delete',RouteStationController.putStatus)
routeStationRouter.get('/unic',RouteStationController.getRouteId)
routeStationRouter.put('/update',RouteStationController.updateRouteId)


export default routeStationRouter