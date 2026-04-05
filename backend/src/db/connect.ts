import { prisma } from '../models/prisma.models'

const connectDB = async () =>{
    try {
        await prisma.$connect(); 
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

export default connectDB;