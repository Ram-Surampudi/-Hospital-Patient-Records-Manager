import { NextFunction, Request, Response } from "express";
import { prisma } from "../models/prisma.models";
import { ApiError } from "../utils/api-error";
import { asyncHandeler } from "../utils/async-handler";
import config from "../utils/config";
import jwt from 'jsonwebtoken';
import { Role } from "@prisma/client";


export const verifyJWT = asyncHandeler( async (req:Request , res:Response , next:NextFunction)=>{
    
    const token = req.header("Authorization")?.replace("Bearer ", "") || req.cookies?.acessToken

    if(!token) throw new ApiError(401, "Unauthorized request");

    try {
        const decodeData = jwt.verify(token , config.access_token_secret);

        const user = await prisma.user.findUnique({where : {id: decodeData?._id}});

        if(!user) throw new ApiError(401 , "Invalid acess token");

        if(!user.isActive) throw new ApiError(401, "please activate your account");

        req.user = user;

        next();

    } catch (error) {
        console.log(error);
        throw new ApiError(401 , "acess token expired");
    }

});

export const validatePermissionForAcess = (roles:Role[]) => {
    return asyncHandeler(async (req : Request, res:Response , next:NextFunction)=>{
        if(req.user?.role && !roles.includes(req?.user?.role)) throw new ApiError(400 , 'You have no acess this route');
        next();
    });
}

// export const checkPermission = asyncHandeler(async (req :Request, res:Response, next:NextFunction)=>{

//     const user = req.user;

//     const { role } = req.body;

//     next();

// });