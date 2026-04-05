import dotenv from 'dotenv';

dotenv.config();

const config = {
    debug : false,
    origin : process.env.ORIGIN,
    port : process.env.PORT || 8000,
    access_token_secret : process.env.ACESS_TOKEN_SECRET,
    access_token_expriy : process.env.ACESS_TOKEN_EXPRIY,
    superAdmin_name: process.env.SUPERADMIN_NAME,
    superAdmin_password : process.env.SUPERADMIN_PASSWORD,
    superAdmin_email : process.env.SUPERADMIN_EMAIL
}

export default config;