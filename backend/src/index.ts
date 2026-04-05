import dotenv from 'dotenv';
import app from './app'
import config from './utils/config';
import connectDB from './db/connect';
import { runNow } from './script';
import { ApiError } from './utils/api-error';


dotenv.config();

connectDB()
    .then(()=>{
        console.log('connectd to db');
        
        app.listen(config.port, () => {
            console.log(`listening to the port ${config.port}`);
            runNow();
            });
        })
    .catch((err:Error|ApiError)=>{
        console.log(err);
        process.exit(1);
        })