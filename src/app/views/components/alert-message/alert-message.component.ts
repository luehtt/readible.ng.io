import { Component, OnInit } from '@angular/core';

import { AlertService } from 'src/app/services/common/alert.service';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html'
})
export class AlertComponent implements OnInit {

  constructor(public service: AlertService) { }

  ngOnInit() {
  }

}
