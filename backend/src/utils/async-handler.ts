import { NextFunction, Request, Response } from "express";

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

const asyncHandeler = (requestHandler:AsyncHandler) =>{
    return (req : Request, res:Response, next:NextFunction)=>{
        Promise
        .resolve(requestHandler(req, res , next))
        .catch((err)=>next(err));
    }
}

export {asyncHandeler};