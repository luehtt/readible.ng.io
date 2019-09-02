import {Injectable} from '@angular/core';

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

  public clear() {
    this.data = [];
  }

  private spentTime(startTime): number {
    return startTime == null ? 0 : new Date().getTime() - startTime;
  }

  public startTime() {
    return new Date().getTime();
  }

  public success(startTime, method) {
    const a = { type: 'success', message: 'Http success response: 200 ' + method + ' OK! in ' + this.spentTime(startTime) + 'ms' };
    this.data.push(a);
  }

  public failed(err) {
    const a = { type : 'danger', message: err.message, error: err.error };
    this.data.push(a);
  }

  public set(message: string, type: string) {
    const a = { type, message };
    this.data.push(a);
  }
}
