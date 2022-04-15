import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class WebRequestService {
  
  readonly ROOT_URL;

  constructor(private _http: HttpClient) { 
    this.ROOT_URL = 'http://localhost:3000';
   }
   
   get(uri: string){
     return this._http.get(`${this.ROOT_URL}/${uri}`);
   }
   
   post(uri: string, payload: Object){
     return this._http.post(`${this.ROOT_URL}/${uri}`, payload);
   }
   
   patch(uri: string, payload: Object){
     return this._http.patch(`${this.ROOT_URL}/${uri}`, payload);
   }
   
   delete(uri: string){
     return this._http.delete(`${this.ROOT_URL}/${uri}`);
   }
   
   login(email: string, password : string){
     return this._http.post(`${this.ROOT_URL}/users/login`, {
       email,
       password
     },{ observe : 'response'});
   }
   
  //  SignUP
   signup(email: string, password : string){
     return this._http.post(`${this.ROOT_URL}/users`, {
       email,
       password
     },{ observe : 'response'});
   }
}
