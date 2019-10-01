import {Injectable} from '@angular/core';

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

  public hasMessage() {
    return this.data.length !== 0;
  }

  public remove(index: number) {
    this.data = this.data.length != 1 ? this.data.splice(index - 1, 1) : [];
  }

  public clear() {
    this.data = [];
  }

  public startTime(): number {
    return new Date().getTime();
  }

  private spentTime(startTime: number): number {
    return startTime == null ? 0 : new Date().getTime() - startTime;
  }

  public success(message: string) {
    this.set(message, 'success');
  }

  public error(message: string) {
    this.set(message, 'danger');
  }

  public successResponse(startTime: number = null) {
    const message = 'Http success response: 200 OK' + (startTime ? ` in ${this.spentTime(startTime)}ms` : '') + '!';
    this.success(message);
  }

  private setCustomError(err, customError) {
    for (const i of customError) {
      if (err.status !== i.status) continue;
      err.error = i.error;
      return err;
    }
  }

  public errorResponse(err, startTime: number = null, customError = null) {
    if (customError) { err = this.setCustomError(err, customError); }
    const message = 'Http failed response: ' + err.status + (startTime ? ` in ${this.spentTime(startTime)}ms` : '') + '!' + (err.error ? ' ' + err.error : '');
    this.error(message)
  }

  public mismatchParameter(parameter: string) {
    const msg = { type : 'danger', message: "Parameter [" + parameter + "] cannot be found! Please enter valid parameter!!" };
    this.data.push(msg);
  }

  public set(message: string, type: string) {
    this.data.push( { type, message } );
  }
}
