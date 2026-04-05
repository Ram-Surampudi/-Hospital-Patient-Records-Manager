import { Request, Response } from "express";
import { prisma } from "../models/prisma.models";
import { Role } from "@prisma/client";
import { ApiResponse } from "../utils/api-response";
import { ApiError } from "../utils/api-error";



export const getAllPatients = async (req:Request, res:Response)=>{

    const patients = await prisma.user.findMany({where:{role:Role.PATIENT}});

    return res.status(200).json(new ApiResponse(200, {patients},  "Sucessfully fetched patients"));
};

export const getAPatients = async (req:Request<{id:string}, {}, {}>, res:Response)=>{

    const {id} = req.params;

    if(!id) throw new ApiError(400, 'id is required');

    const patient = await prisma.user.findUnique({where:{id}});

    // if()

};


export const registerPatient = async (req:Request<{}, {}, {}>, res:Response)=>{
};


export const getAPatientsDetails = async (req:Request<{}, {}, {}, {ward?:string,status?:string }>, res:Response)=>{
};