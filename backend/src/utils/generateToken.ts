import jwt from 'jsonwebtoken';
import config from './config';
import { userModel } from '../types/types';

export const generateToken = (data:userModel|null|undefined) =>{

    return jwt.sign(
            {
                _id:data?.id,
                email : data?.email,
            },
            config.access_token_secret,
            {
                expiresIn : config.access_token_expriy
            }
        );
}