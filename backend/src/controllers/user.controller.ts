import { Request, Response } from "express";
import { asyncHandeler } from "../utils/async-handler";
import { Prisma, Role } from "@prisma/client";
import { prisma } from "../models/prisma.models";
import { userModel, userRegister } from "../types/types";
import { ApiError } from "../utils/api-error";
import { ApiResponse } from "../utils/api-response";


export const listAllUsers = asyncHandeler(async (req:Request , res:Response)=>{

    let users:userModel[]|null = null;

    if(req.user?.role === Role.SUPERADMIN)
    {
        users = await prisma.user.findMany({where:{role:Role.DOCTOR}});
    } else {
        users = await prisma.user.findMany({where:{role:Role.PATIENT}});
    }

    return res.status(200).json(new ApiResponse(200, {users}, "successfully fetched"));
});

export const createAnewAdmin = asyncHandeler(async (req:Request<{}, {},userRegister > , res:Response)=>{

    let {name , email, password, role}:userRegister = req.body;

    let user:userModel|null = null;

    if(req.user?.role === Role.DOCTOR)
    {
        user = await prisma.user.create({data:{name , email, password, role:Role.PATIENT}});
    }
    else if(req.user?.role === Role.SUPERADMIN)
    {
        user = await prisma.user.create({data:{
            name , 
            email, 
            password, 
            role:role===Role.DOCTOR ? Role.DOCTOR :Role.PATIENT
        }});
    }

    return res.status(200).json(new ApiResponse(200, {user}, "successfully created"));
});

export const updateDetails = async (req:Request<{id:string}, {},{email?:string, name?:string} > , res:Response)=>{
    
    const {id} = req.params;

    let data:{name?:string, email?:string} = {};

    if(req.body.email) data["email"] = req.body.email;
    if(req.body.name) data["name"] = req.body.name;

    const user = await prisma.user.findUnique({where:{id}});

    if(!user) throw new ApiError(400, "no user found");

    if((req.user?.role === Role.SUPERADMIN) || (user?.role === Role.PATIENT) )
    {
        const user = await prisma.user.update({data:data, where:{id:id}});

        return res.status(200).json(new ApiResponse(200, {user}, "successfully updated"));
    }
    
    throw new ApiError(400, "You have no acess");
};

export const toggleIsActive = async (req:Request<{id:string}>, res:Response)=>{

    const {id} = req.params;

    const exituser = await prisma.user.findUnique({where:{id}});

    if(!exituser) throw new ApiError(400, 'no user found');

    const user = await prisma.user.update({data:{isActive:!exituser.isActive}, where:{id:id}});

    return res.status(200).json(new ApiResponse(200, {user}, "successfully updated"));
}

export const deleteAdmin = async(req:Request<{id:string}>, res:Response)=>{
    const {id} = req.params;

    const exituser = await prisma.user.findUnique({where:{id}});

    if(!exituser) throw new ApiError(400, 'no user found');

    await prisma.user.delete({where:{id}});

    return res.status(200).json(new ApiResponse(200, {}, "successfully deleted"));
}