import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TaskService } from 'src/app/task.service';

@Component({
  selector: 'app-edit-list',
  templateUrl: './edit-list.component.html',
  styleUrls: ['./edit-list.component.css']
})
export class EditListComponent implements OnInit {

  constructor(private route: ActivatedRoute, private taskService: TaskService, private router: Router) { }

  listId: string;
  
  ngOnInit(): void {
    
    this.route.params.subscribe(
      
      (params : Params) => {
        this.listId = params.listId;
      }
    )
  }
  
  
  editList(title: string){
    
    this.taskService.updateList(title, this.listId).subscribe((res: HttpResponse<any>) =>{
      
      if(res.status === 200){
        
        this.router.navigate(['/lists', this.listId]);
      }
    });
  }
  
}
