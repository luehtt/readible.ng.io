import { Component, NgZone, OnInit } from '@angular/core';
import { Order } from 'src/app/models/order';
import { AlertMessageService } from 'src/app/services/common/alert-message.service';
import { SignalRService } from 'src/app/services/common/signalr.service';
import { OrderService } from 'src/app/services/order.service';



@Component({
  selector: 'app-signalr-test',
  templateUrl: './signalr-test.component.html'
})
export class SignalRTestComponent implements OnInit {

  messages: any[] = []

  constructor(private service: OrderService, private signarlService: SignalRService, private alertService: AlertMessageService, private ngZone: NgZone) {
    this.subscribeToEvents();
  }

  ngOnInit(): void {
    this.alertService.clear();
  }

  private subscribeToEvents(): void {  
  
    this.signarlService.messageReceived.subscribe((message: string) => {  
      this.ngZone.run(() => {  
        this.messages.push(message);    
      });  
    });  
  }
}
