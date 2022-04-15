import { Component, OnInit, Type } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TaskService } from 'src/app/task.service';

@Component({
  selector: 'app-task-view',
  templateUrl: './task-view.component.html',
  styleUrls: ['./task-view.component.css']
})
export class TaskViewComponent implements OnInit {
  
  lists:any;
  tasks:any;
  selectedListId: any;
  
  constructor(private taskService: TaskService, private route : ActivatedRoute, private router : Router) { }

  ngOnInit(): void {
    
    this.route.params.subscribe(
      (params : Params) => {
        
        // console.log(params.listId);s
        
        if(params.listId){
          this.selectedListId = params.listId;
          this.taskService.getTasks(params.listId).subscribe((tasks : any) => {
            this.tasks = tasks;
          })
        } else {
            this.tasks = undefined;
        }
        
      }
    );
    
    this.taskService.getList().subscribe((list: any) => {
      this.lists = list;
    });
    
  }
  
  onTaskClick(task: any){
    // We want to set the task completed
    return this.taskService.complete(task).subscribe(() => {
      console.log("Completed Successfully");
      task.completed = !task.completed;
    });
  }
  
  OnDeleteClick(){
    this.taskService.deleteList(this.selectedListId).subscribe((res: any) => {
      
      this.router.navigate(['/lists']);
      console.log(res);
    })
  }
  
  TaskDeleteClick(id: string){
    this.taskService.deleteTask(this.selectedListId, id).subscribe((res : any) =>{ 
      // this.router.navigate(['./']);
      this.tasks = this.tasks.filter(val => val._id !== id);
    })  
  }
}
