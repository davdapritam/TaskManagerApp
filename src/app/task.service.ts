import { Injectable } from '@angular/core';
import { WebRequestService } from './web-request.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private WebReqService : WebRequestService) {  }
  
  // Lists
  getList(){
    return this.WebReqService.get('lists');
  }
  
  createList(title: string){
    // We want to send this created list to the WebrequestService
    return this.WebReqService.post('lists', { title });
  }
  
  updateList(title: string, id: string){
    // We want to send this created list to the WebrequestService
    return this.WebReqService.patch(`lists/${id}`, { title });
  }
  
  deleteList(id: string){
    return this.WebReqService.delete(`lists/${id}`);
  }
  
  // Tasks
  getTasks(listId: string){
    return this.WebReqService.get(`lists/${listId}/tasks`);
  }
  
  createTasks(title: string, listId: string){
    // Send Web Request to the webreqservice to create a task
    return this.WebReqService.post(`lists/${listId}/tasks`, { title });
  }
  
  updateTask(listId: string, taskId: string, title: string){
    return this.WebReqService.patch(`lists/${listId}/tasks/${taskId}`, { title });
  }
  
  deleteTask(listId: string, taskId: string){
    return this.WebReqService.delete(`lists/${listId}/tasks/${taskId}`);
  }
  
  complete(task : any){
    return this.WebReqService.patch(`lists/${task._listId}/tasks/${task._id}` , {
      completed : !task.completed
    });
  }
  
}
