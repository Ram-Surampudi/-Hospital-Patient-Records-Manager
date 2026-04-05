import express from 'express';
import cors from 'cors';
import CookieParser from 'cookie-parser'
import config from './utils/config';

import authRoutes from './routes/auth.routes';
import errorHandler from './middlewares/api-error.middleware';
import userRoute from './routes/user.routes';
import helathcheck from './routes/helathcheck.route';

const app = express();

app.use(cors({
    origin : config.origin,
    credentials : true,
    methods : ['GET', 'POST', 'PUT' , 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders : ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.static('public')) 
app.use(CookieParser())
app.use('api/v1/helathcheck', helathcheck);
app.use('/api/v1/auth', authRoutes)
app.use("/api/v1/users", userRoute);
app.use(errorHandler);

export default app;