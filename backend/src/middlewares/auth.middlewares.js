import { prisma } from "../models/prisma.models.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandeler } from "../utils/async-handler.js";
import config from "../utils/config.js";
import jwt from 'jsonwebtoken';


export const verifyJWT = asyncHandeler( async (req , res , next)=>{
    
    const token = req.header("Authorization")?.replace("Bearer ", "") || req.cookies?.acessToken

    if(!token) throw new ApiError(401, "Unauthorized request");

    try {
        const decodeData = jwt.verify(token , config.access_token_secret);

        const user = await prisma.user.findUnique({where : {id: decodeData._id}});

        if(!user) throw new ApiError(401 , "Invalid acess token");

        if(!user.isActive) throw new ApiError(401, "please activate your account");

        req.user = user;

        next();

    } catch (error) {
        console.log(error);
        throw new ApiError(401 , "acess token expired");
    }

});