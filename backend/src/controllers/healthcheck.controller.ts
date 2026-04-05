import { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../utils/api-response";
import { asyncHandeler } from "../utils/async-handler";

const healthcheck = asyncHandeler(async (req:Request, res:Response, next:NextFunction) =>{
    return res.status(200).json(
        new ApiResponse(200 , {message : "server is runnig"})
    );
})

export {healthcheck};