export class ResponseFormat<T> {
  success: boolean = true;
  data: T;
  message?: string = 'Request Success';
  error?: any = 'Unknown Error!';
  status?: number = 200;

  constructor(data?: T, status?: number, message?: string, error?: any) {
    this.status = status;
    this.success = !error;
    this.data = data;
    this.message = message;
    this.error = error;
  }
}
