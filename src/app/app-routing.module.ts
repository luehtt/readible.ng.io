import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgbDatepickerModule, NgbPaginationModule, NgbRatingModule, NgbTypeaheadModule} from '@ng-bootstrap/ng-bootstrap';

import {DashboardComponent} from 'src/app/views/dashboard/dashboard.component';
import {RoleGuardService} from 'src/app/services/auth/role-guard.service';
import {LoginComponent} from 'src/app/views/auth/login/login.component';
import {AdminComponent} from 'src/app/layouts/admin/admin.component';
import {FrontComponent} from 'src/app/layouts/front/front.component';
import {CustomerCartComponent} from 'src/app/views/users/customer-cart/customer-cart.component';
import {RegisterComponent} from 'src/app/views/auth/register/register.component';
import {BookCategoryListComponent} from 'src/app/views/books/book-category-list/book-category-list.component';
import {AlertComponent} from './layouts/components/alert/alert.component';
import {FormErrorComponent} from './layouts/components/form-error/form-error.component';
import {BookListComponent} from './views/books/book-list/book-list.component';
import {BookDetailComponent} from './views/books/book-detail/book-detail.component';
import {ShopListComponent} from './views/shop/shop-list/shop-list.component';
import {ShopDetailComponent} from './views/shop/shop-detail/shop-detail.component';
import {OrderListComponent} from './views/orders/order-list/order-list.component';
import {OrderDetailComponent} from './views/orders/order-detail/order-detail.component';
import {CustomerListComponent} from './views/customers/customer-list/customer-list.component';
import {CustomerDetailComponent} from './views/customers/customer-detail/customer-detail.component';
import {ManagerDetailComponent} from './views/managers/manager-detail/manager-detail.component';
import {ManagerListComponent} from './views/managers/manager-list/manager-list.component';
import {CustomerOrderDetailComponent} from './views/users/customer-order-detail/customer-order-detail.component';
import {CustomerOrderListComponent} from './views/users/customer-order/customer-order-list.component';
import {OrderStatusComponent} from './layouts/components/order-status/order-status.component';

const routes: Routes = [
  {
    path: '',
    component: FrontComponent,
    children: [
      {path: '', redirectTo: 'shop', pathMatch: 'full'},
      {path: 'login', component: LoginComponent},
      {path: 'register', component: RegisterComponent},
      {path: 'shop', component: ShopListComponent, pathMatch: 'full'},
      {path: 'shop/:id', component: ShopDetailComponent}
    ]
  },

  {
    path: 'admin',
    component: AdminComponent,
    children: [
      {path: 'dashboard', component: DashboardComponent},
      {path: 'books', component: BookListComponent},
      {path: 'books/:id', component: BookDetailComponent, pathMatch: 'full'},
      {path: 'book-categories', component: BookCategoryListComponent},
      {path: 'orders', component: OrderListComponent, pathMatch: 'full'},
      {path: 'orders/:id', component: OrderDetailComponent},
      {path: 'customers', component: CustomerListComponent, pathMatch: 'full'},
      {path: 'customers/:id', component: CustomerDetailComponent},
      {path: 'managers', component: ManagerListComponent, pathMatch: 'full',
        canActivate: [RoleGuardService], data: {expectedRoles: ['ADMIN']}},
      {path: 'managers/:id', component: ManagerDetailComponent,
        canActivate: [RoleGuardService], data: {expectedRoles: ['ADMIN']}},
    ],
    canActivate: [RoleGuardService],
    data: {expectedRoles: ['MANAGER', 'ADMIN']}
  },

  {
    path: 'customer',
    component: FrontComponent,
    children: [
      {path: 'cart', component: CustomerCartComponent},
      {path: 'orders', component: CustomerOrderListComponent, pathMatch: 'full'},
      {path: 'orders/:id', component: CustomerOrderDetailComponent},
    ],
    canActivate: [RoleGuardService], data: {expectedRoles: ['CUSTOMER']}
  },

  {path: '**', redirectTo: 'not-found'}
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes), CommonModule, FormsModule, ReactiveFormsModule,
    NgbRatingModule, NgbPaginationModule, NgbTypeaheadModule, NgbDatepickerModule
  ],
  exports: [RouterModule],
  declarations: [DashboardComponent,
    BookCategoryListComponent, BookListComponent, BookDetailComponent,
    OrderListComponent, OrderDetailComponent,
    CustomerListComponent, CustomerDetailComponent,
    ManagerListComponent, ManagerDetailComponent,
    CustomerCartComponent, CustomerOrderListComponent, CustomerOrderDetailComponent,
    ShopListComponent, ShopDetailComponent,
    LoginComponent, RegisterComponent,
    AdminComponent, FrontComponent,
    AlertComponent, FormErrorComponent, OrderStatusComponent
  ]
})
export class AppRoutingModule {
}
