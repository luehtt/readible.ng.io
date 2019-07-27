import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  data: any[];

  constructor() {
    this.data = [];
  }

  public add(type: string, message: string) {
    this.data.push({ type, message });
    this.clearSuccess();
  }

  public set(type: string, message: string) {
    this.clear();
    this.add(type, message);
  }

  public clear() {
    this.data = [];
  }

  public failed(err) {
    const message = { type : 'danger', message: err.message, error: err.error };
    this.data.push(message);
  }

  private spentTime(startTime): number {
    return startTime == null ? 0 : new Date().getTime() - startTime;
  }

  public initTime() {
    return new Date().getTime();
  }

  public success(startTime, method) {
    const message = {
      type: 'success',
      message: 'Http success response: 200 OK! Method: ' + method + ' in ' + this.spentTime(startTime) + 'ms'
    };
    this.set(message.type, message.message);
  }

  public clearSuccess() {
    this.data = this.data.filter(x => x.type !== 'success');
  }

}
