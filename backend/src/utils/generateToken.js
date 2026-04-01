import jwt from 'jsonwebtoken';
import config from './config.js';

export const generateToken = data =>{

    return jwt.sign(
            {
                _id:data.id,
                email : data.email,
            },
            config.access_token_secret,
            {
                expiresIn : config.access_token_expriy
            }
        );
}