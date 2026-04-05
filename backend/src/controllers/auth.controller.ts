import { Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { prisma } from '../models/prisma.models';
import { asyncHandeler } from '../utils/async-handler';
import {ApiError} from '../utils/api-error';
import {ApiResponse} from '../utils/api-response';
import {generateToken} from '../utils/generateToken';
import { userModel, userRegister } from '../types/types';

export const register = asyncHandeler( async (req:Request<{}, {}, userRegister> ,res : Response) =>{

    let {name , email, password}:userRegister = req.body;

    const exitsUser:userModel|null = await prisma.user.findUnique({
        where : {email}
    })

    if(exitsUser) throw new ApiError(400 , "email already exits");

    password = await bcrypt.hash(password, 8);

    const role = req?.user?.role === Role.SUPERADMIN ? Role.DOCTOR : Role.PATIENT;

    const user = await prisma.user.create({
        data : {name , email, password, role}
    });

    const accessToken:String = generateToken(user);

    return res.status(200).json(new ApiResponse(200, {
        name : user.name , 
        email : user.email , 
        role : user.role , 
        isActive : user.isActive, 
        createdAt : user.createdAt,
        accessToken 
    } , "successfully created"));

});

export const login = asyncHandeler( async (req:Request<{}, {},{email:string, password:string} >, res:Response)=>{

    const { email , password } = req.body;
    
    const user = await prisma.user.findUnique({where:{email}});

    if(!user) throw new ApiError(400, 'user not found');

    const isCorrect = await bcrypt.compare(password , user.password);

    if(!isCorrect) throw new ApiError(400, 'password incorrect');

    const accessToken = generateToken(user);

    return res.status(200).json(new ApiResponse(200, {
        name : user.name , email : user.email , accessToken , role : user.role , isActive : user.isActive, createdAt : user.createdAt
    } , "login in"));
});


export const getDetails = asyncHandeler(async (req:Request, res:Response)=>{

     const user:userModel|undefined = req.user;

    return res.status(200).json(new ApiResponse(200, {
            name : user?.name , email : user?.email , role : user?.role , isActive : user?.isActive, createdAt : user?.createdAt
        }));
})

export const logout = asyncHandeler(async (req:Request, res:Response)=>{
  
    const user:userModel|null = await prisma.user.update({where:{id:req?.user?.id}, data:{loggedIn:false}});

    return res.status(200).json(new ApiResponse(200, {}, "successfully logged out"));
})