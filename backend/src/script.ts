import { Prisma, Role } from "@prisma/client";
import { prisma } from "./models/prisma.models";
import config from "./utils/config";
import bcrypt from 'bcrypt';

export const runNow = async () =>{
    const user = await prisma.user.findUnique({where:{email:config.superAdmin_email}});

    if(!user) {
        let password:string = await bcrypt.hash(config.superAdmin_password, 8);
        if(config.superAdmin_name && config.superAdmin_email)
        {
            const data: Prisma.UserCreateInput = {
                name : config.superAdmin_name,
                email : config.superAdmin_email,
                password, role : Role.SUPERADMIN
            }
            const superAdmin = await prisma.user.create({data:data})
        }
    }
}