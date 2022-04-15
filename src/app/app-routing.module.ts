import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditListComponent } from './MyComponents/edit-list/edit-list.component';
import { EditTaskComponent } from './MyComponents/edit-task/edit-task.component';
import { LoginPageComponent } from './MyComponents/login-page/login-page.component';
import { NewListComponent } from './MyComponents/new-list/new-list.component';
import { NewTaskComponent } from './MyComponents/new-task/new-task.component';
import { SignupPageComponent } from './MyComponents/signup-page/signup-page.component';
import { TaskViewComponent } from './MyComponents/task-view/task-view.component';

const routes: Routes = [
  
  {path:'', redirectTo:'lists/', pathMatch:'full'},
  {path:'lists', component:TaskViewComponent},
  {path:'edit-list/:listId', component:EditListComponent},
  {path:'lists/:listId/edit-task/:taskId', component:EditTaskComponent},
  {path:'lists/:listId', component:TaskViewComponent},
  {path:'lists/:listId/new-task', component:NewTaskComponent},
  {path:'new-list', component:NewListComponent},
  {path:'login', component:LoginPageComponent},
  {path:'signup', component:SignupPageComponent},
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
