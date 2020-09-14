import { Component, OnInit } from '@angular/core';
import { AlertMessageService } from 'src/app/services/common/alert-message.service';


@Component({
  selector: 'app-alert-message',
  templateUrl: './alert-message.component.html'
})
export class AlertMessageComponent implements OnInit {

  constructor(public service: AlertMessageService) { }

  ngOnInit(): void { }
}
