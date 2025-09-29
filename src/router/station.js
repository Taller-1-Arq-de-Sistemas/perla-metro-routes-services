import{StationController} from '../controller/station.js'
import { Router } from 'express'

const stationRouter = Router();

stationRouter.post('/create',StationController.postStation)
stationRouter.get('/all', StationController.getAllStation)
stationRouter.put('/update/:ID',StationController.patchStation)
stationRouter.put('/delete/:ID',StationController.deleteStation)

export default stationRouter;