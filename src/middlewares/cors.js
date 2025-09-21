import cors from 'cors'
export const corsMiddleware= ()=>cors({
    origin:(origin,callback)=>{
        const ACCEPTED_ORIGINS = ["*"]
        if(ACCEPTED_ORIGINS.includes(origin)){
            return callback(null,origin)
        }
        if(!origin)
            {
                return callback(null,'*')
            }
        return callback(new Error('Not allowed by CORS'))
    },
    credentials:true,
    methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Amz-Date', 'X-Api-Key', 'X-Amz-Security-Token']

})