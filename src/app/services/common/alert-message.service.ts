import {Injectable} from '@angular/core';
import {ErrorMessage} from '../../common/const';

interface CustomMessage {
  type: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AlertMessageService {
  data: CustomMessage[];

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

  private spentTime(startTime): number {
    return startTime == null ? 0 : new Date().getTime() - startTime;
  }

  public startTime() {
    return new Date().getTime();
  }

  public success(startTime, method: string) {
    const msg = { type: 'success', message: 'Http success response: 200 ' + method + ' OK! in ' + this.spentTime(startTime) + 'ms' };
    this.data.push(msg);
  }

  public failed(err) {
    const msg = { type : 'danger', message: err.message, error: err.error };
    this.data.push(msg);
  }

  public notFound(parameter: string) {
    const msg = { type : 'danger', message: "Parameter [" + parameter + "] cannot be found! Please enter valid parameter!!" };
    this.data.push(msg);
  }

  public set(message: string, type: string) {
    const msg = { type, message };
    this.data.push(msg);
  }
}
