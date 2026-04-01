import { Role } from "@prisma/client";
import { prisma } from "./models/prisma.models.js";
import config from "./utils/config.js";
import bcrypt from 'bcrypt';

export const runNow = async () =>{
    const user = await prisma.user.findUnique({where:{email:config.superAdmin_email}});

    if(!user) {
        let password = await bcrypt.hash(config.superAdmin_password, 8);
        const data = {
            name : config.superAdmin_name,
            email : config.superAdmin_email,
            password, role : Role.SUPERADMIN
        }
        const superAdmin = await prisma.user.create({data:data})
    }
}