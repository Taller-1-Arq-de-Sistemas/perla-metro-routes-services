import { RouteStationController } from "../controller/routeStation.js";
import { Router } from "express";

const routeStationRouter = Router()

routeStationRouter.post('/create',RouteStationController.postRoute)
routeStationRouter.get('/all',RouteStationController.getAll)
routeStationRouter.put('/delete/:routeId',RouteStationController.putStatus)
routeStationRouter.get('/unic/:routeId',RouteStationController.getRouteId)
routeStationRouter.put('/update/:routeId',RouteStationController.updateRouteId)


export default routeStationRouter