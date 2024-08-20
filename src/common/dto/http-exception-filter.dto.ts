export interface HttpExceptionFilterDto {
  status: number;
  error: string;
  message: string;
  data: object | null;
}

export interface ExceptionDto {
  statusCode: number;
  error: string;
  message: string;
}

export interface ResponseHttpExceptionFilterDto extends HttpExceptionFilterDto {
  timestamp: string;
  path: string;
}
