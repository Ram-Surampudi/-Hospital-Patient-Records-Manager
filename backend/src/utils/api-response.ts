class ApiResponse {
    statusCode;
    data;
    message;
    sucess;
    constructor(statusCode:number, data:unknown, message:string = "success") {
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.sucess = statusCode < 400
    }
}

export {ApiResponse};