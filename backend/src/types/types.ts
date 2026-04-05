import { BloodGroup, Gender, PatientStatus, Role } from "@prisma/client";

export interface userRegister {
    name: string, 
    email : string,
    password : string,
    role?:string
}

export interface PatientRecordModel{
  id          : string ,
  patientId:    string,
  doctorId :    string,
  name       :  string  , 
  age   :Number,
  gender   :    Gender,
  bloodGroup   :BloodGroup,
  ward     :    string,
  diagnosis:    string,
  status       :PatientStatus  ,
  admittedAt :  Date,
  dischargedAt ?:Date,
  patient ?:userModel ,
  doctor  ?:userModel ,
}

export interface userModel {
  id:string  ,
  name:string,
  email:string,  
  role:Role,   
  password :string,
  createdAt:Date, 
  isActive:Boolean ,
  loggedIn:Boolean ,
  patientRecords ?:PatientRecordModel[],
  doctorRecords ?:PatientRecordModel[],
}

declare global {
  namespace Express {
    interface Request {
      user?:userModel;
    }
  }
}