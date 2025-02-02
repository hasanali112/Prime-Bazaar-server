export interface TErrorResponse {
  success: boolean;
  message: string;
  errorMessages: {
    path: string;
    message: string;
  }[];
  stack?: string;
  statusCode: number;
}
