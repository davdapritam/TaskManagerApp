import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { shareReplay, tap } from 'rxjs/operators';
import { WebRequestService } from './web-request.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private _http: HttpClient, private webService: WebRequestService, private router: Router) { }
  
  login(email : string, password : string){
    
    return this.webService.login(email, password).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>) => {
        // auth tokens will be in the header of this response
        this.setSession(res.body._id, res.headers.get('x-access-token'), res.headers.get('x-refresh-token'));
        console.log("LOGGED IN!");
      })
    )
  }
  
  // SIGNUP
  signup(email : string, password : string){
    
    return this.webService.signup(email, password).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>) => {
        // auth tokens will be in the header of this response
        this.setSession(res.body._id, res.headers.get('x-access-token'), res.headers.get('x-refresh-token'));
        console.log("SuccessFully SignIn and Logged In!");
      })
    )
  }
  
  logout(){
    this.removeSession();
    
    this.router.navigate(['/login']);
  }
  
  getAccessToken(){
    return sessionStorage.getItem('x-access-token');
  }
  
  getRefreshToken(): any{
    return sessionStorage.getItem('x-refresh-token');
  }
  
  getUserId() : any{
    return sessionStorage.getItem('user-id');
  }
  
  setAccessToken(accessToken: string){
    sessionStorage.setItem('x-access-token', accessToken);
  }
  
  private setSession(userId: any, accessToken : any, refreshToken: any){
    sessionStorage.setItem('user-id', userId);
    sessionStorage.setItem('x-access-token', accessToken);
    sessionStorage.setItem('x-refresh-token', refreshToken);
  }
  
  private removeSession(){
    sessionStorage.removeItem('user-id');
    sessionStorage.removeItem('x-access-token');
    sessionStorage.removeItem('x-refresh-token');
  }
  
  
  // GET NEW ACCESS TOKEN
  
  getNewAccessToken(){
    
    return this._http.get(`${this.webService.ROOT_URL}/users/me/access-token`,{
      headers : {
        'x-refresh-token' : this.getRefreshToken(),
        '_id' : this.getUserId()
      },
      observe: 'response'
    }).pipe(
      tap((res : HttpResponse<any>) => {
        this.setAccessToken(res.headers.get('x-access-token') || "{}");
      })
    )
  }
  
}
