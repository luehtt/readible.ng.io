import { environment } from '../../../environments/environment';
import { HubConnection, HubConnectionBuilder } from '@aspnet/signalr';
import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SignalService<T> {
  protected endpoint = environment.serverHub;
  protected hubConnection: HubConnection;

  public connectionEstablished = new EventEmitter<Boolean>();
  public storeDataEmitter = new EventEmitter<T>();
  public updateDataEmitter = new EventEmitter<T>();
  public deleteIdEmitter = new EventEmitter<number>();

  public startConnection(interval: number = 600_000) {
    this.hubConnection = new HubConnectionBuilder().withUrl(this.endpoint + 'orders').build();
    this.hubConnection.serverTimeoutInMilliseconds = interval;
    this.hubConnection.start().then(res => {
      this.connectionEstablished.emit(true);
    })
    .catch(err => {
      this.connectionEstablished.emit(false);
    })

    this.hubConnection.onclose(() => setTimeout(() => this.startConnection(), 1000));
  }

  public mapUrl(url: string, action: string): string {
    return url[0].toUpperCase() + url.substr(1) + action[0].toUpperCase() + action.substr(1);
  }

  public addStoreListener(name: string) {
    this.hubConnection.on(name, res => {
      return this.storeDataEmitter.emit(res);
    });
  }

  public addUpdateListener(name: string) {
    this.hubConnection.on(name, res => {
      return this.updateDataEmitter.emit(res);
    });
  }

  public addDeleteListener(name: string) {
    this.hubConnection.on(name, res => {
      return this.deleteIdEmitter.emit(res);
    });
  }

  public addListeners(routeName: string) {
    this.addStoreListener(this.mapUrl(routeName, 'Store'));
    this.addUpdateListener(this.mapUrl(routeName, 'Update'))
    this.addDeleteListener(this.mapUrl(routeName, 'Delete'))
  }
}
