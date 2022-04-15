import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginPageComponent } from './MyComponents/login-page/login-page.component';
import { TaskViewComponent } from './MyComponents/task-view/task-view.component';
import { NewListComponent } from './MyComponents/new-list/new-list.component';
import { NewTaskComponent } from './MyComponents/new-task/new-task.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { WebReqInterceptor } from './web-req.interceptor.service';
import { SignupPageComponent } from './MyComponents/signup-page/signup-page.component';
import { EditListComponent } from './MyComponents/edit-list/edit-list.component';
import { EditTaskComponent } from './MyComponents/edit-task/edit-task.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    TaskViewComponent,
    NewListComponent,
    NewTaskComponent,
    SignupPageComponent,
    EditListComponent,
    EditTaskComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    RouterModule
  ],
  providers: [
    { provide : HTTP_INTERCEPTORS, useClass : WebReqInterceptor, multi: true }
  ],
  bootstrap: [AppComponent],
  schemas : [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
