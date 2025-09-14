import {dataBase} from '../database/connection.js';
import { validateRoute } from '../validator/funtionRouteValidator.js';

export class RouterStationModel
{
    static async createRoute(data)
    {
        try{
            
            
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