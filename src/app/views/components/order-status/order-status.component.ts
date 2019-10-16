import {Component, Input, OnInit} from '@angular/core';
import {OrderStatus} from '../../../models/order';

@Component({
  selector: 'app-order-status',
  templateUrl: './order-status.component.html'
})
export class OrderStatusComponent implements OnInit {
  @Input() input: OrderStatus;

  constructor() { }

  ngOnInit() {

  }

}
