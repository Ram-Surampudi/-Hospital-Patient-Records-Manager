import { Role } from '@prisma/client';
import { prisma } from '../models/prisma.models.js';
import { asyncHandeler } from '../utils/async-handler.js';
import {ApiError} from '../utils/api-error.js';
import {ApiResponse} from '../utils/api-response.js';
import bcrypt from 'bcrypt'
import {generateToken} from '../utils/generateToken.js';

export const register = asyncHandeler( async (req ,res) =>{

    let {name , email, password} = req.body;

    const exitsUser = await prisma.user.findUnique({
        where : {email}
    })

    if(exitsUser) throw new ApiError(400 , "email already exits");

    password = await bcrypt.hash(password, 8);

    const role = req.user.role === Role.SUPERADMIN ? Role.DOCTOR : Role.PATIENT;

    const user = await prisma.user.create({
        data : {name , email, password, role}
    });

    const accessToken = generateToken(user);

    return res.status(200).json(new ApiResponse(200, {
        name : user.name , 
        email : user.email , 
        accessToken , 
        role : user.role , 
        isActive : user.isActive, 
        createdAt : user.createdAt
    } , "successfully created"));

});

export const login = asyncHandeler( async (req, res)=>{

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


export const getDetails = asyncHandeler(async (req, res)=>{
     const user = req.user;
    return res.status(200).json(new ApiResponse(200, {
            name : user.name , email : user.email , accessToken , role : user.role , isActive : user.isActive, createdAt : user.createdAt
        }));
})

export const logout = asyncHandeler(async (req, res)=>{
  
    const user = await prisma.user.update({where:{id:req.user.id}, data:{loggedIn:false}});

    return res.status(200).json(new ApiResponse(200, {}, "successfully logged out"));
})