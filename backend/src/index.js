import dotenv from 'dotenv';
import app from './app.js'
import config from './utils/config.js';
import connectDB from './db/connect.js';
import { runNow } from './script.js';


dotenv.config();

connectDB()
    .then(()=>{
        console.log('connectd to db');
        
        app.listen(config.port, () => {
            console.log(`listening to the port ${config.port}`);
            runNow();
            });
        })
    .catch((err)=>{
        console.log(err);
        process.exit(1);
        })