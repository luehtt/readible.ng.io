import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { retry } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Common } from '../../common/const';
import { SessionService } from './session.service';
import { HubConnection, HubConnectionBuilder } from '@aspnet/signalr';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  connectionEstablished = new EventEmitter<Boolean>();
  messageReceived = new EventEmitter<string>();

  private connectionIsEstablished = false;
  private connection: HubConnection;

  constructor() {
    this.createConnection();
    this.registerOnServerEvents();
    this.startConnection();
  }

  private createConnection() {
    this.connection = new HubConnectionBuilder().withUrl('https://localhost:44388/hub/orders').build();
  }

  private startConnection(): void {
    this.connection.start().then(() => {
      this.connectionIsEstablished = true;
      console.log('Hub connection started');
      this.connectionEstablished.emit(true);
    }).catch(err => {
      console.log('Error while establishing connection, retrying...');
      setTimeout(function () { this.startConnection(); }, 5000);
    });
  }

  private registerOnServerEvents(): void {
    this.connection.on('MessageReceived', (data: any) => {
      this.messageReceived.emit(data);
    });
  }

}
