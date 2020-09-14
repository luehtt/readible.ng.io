import { Injectable } from '@angular/core';

interface IMessage {
  type: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AlertMessageService {
  data: IMessage[];

  constructor() {
    this.data = [];
  }

  public hasMessage(): boolean {
    return this.data.length !== 0;
  }

  public remove(index: number): void {
    this.data = this.data.length !== 1 ? this.data.splice(index - 1, 1) : [];
  }

  public clear(): void {
    this.data = [];
  }

  public startTime(): number {
    return new Date().getTime();
  }

  private spentTime(startTime: number): number {
    return startTime == null ? 0 : new Date().getTime() - startTime;
  }

  public success(message: string): void {
    this.set(message, 'success');
  }

  public error(message: string): void {
    this.set(message, 'danger');
  }

  public successResponse(startTime: number = null): void {
    const message = 'Http success response: 200 OK' + (startTime ? ` in ${this.spentTime(startTime)}ms` : '') + '!';
    this.success(message);
  }

  private setCustomError(err: any, customError: any[]): any {
    for (const i of customError) {
      if (err.status !== i.status) { continue; }
      err.error = i.error;
      return err;
    }
  }

  public errorResponse(err: any, startTime: number = null, customError = null): void {
    if (customError) { err = this.setCustomError(err, customError); }
    const message = 'Http failed response: ' + err.status + (startTime ? ` in ${this.spentTime(startTime)}ms` : '') + '!' + (err.error ? ' ' + err.error : '');
    this.error(message);
  }

  public mismatchParameter(parameter: string): void {
    const msg = { type : 'danger', message: 'Parameter [' + parameter + '] cannot be found! Please enter valid parameter!!' };
    this.data.push(msg);
  }

  public set(message: string, type: string): void {
    this.data.push( { type, message } );
  }
}
