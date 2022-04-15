import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, empty, Observable, Subject, throwError } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WebReqInterceptor implements HttpInterceptor{

  constructor(private authService : AuthService) { }
  
  refreshingAccessToken : boolean;
  
  accessTokenRefreshed : Subject<any> = new Subject();
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      
    req = this.addAuthHeader(req);
    
    // call next() and handle the response
    
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        
        console.log(error);
        
        if(error.status === 401 &&!this.refreshingAccessToken){
          // 401 error => it means we are unauthorised
          
          // refresh the access token
          
          return this.refreshAccessToken().pipe(
            switchMap(() => {
              
              req = this.addAuthHeader(req);
              return next.handle(req);
            }),
            catchError((err : any) => {
              console.log(err);
              this.authService.logout();
              return empty();
            })
          );
        }
        
        return throwError(error);
      })
    );
  }
  
  refreshAccessToken(){
    
    if(this.refreshingAccessToken){
      
      return new Observable(observer => {
        this.accessTokenRefreshed.subscribe(() => {
          // this code will run when access token is refreshed
          observer.next();
          observer.complete();
        })
      })
      
    } else {
      
      // We want to call a method in the auth service to refresh the access token
      this.refreshingAccessToken = true;
      
      return this.authService.getNewAccessToken().pipe(
        tap(() => {
          console.log("Access Token Refreshed!!!")
          this.refreshingAccessToken = false;
          this.accessTokenRefreshed.next('');
        }) 
      )
    }
  }
  
  
  addAuthHeader(req : HttpRequest<any>){
    // get the access token
    const token = this.authService.getAccessToken();
    
    if(token){
      // append the access token to the header
      return req.clone({
        setHeaders:{
          'x-access-token' : token
        }
      })
    }
    
    return req;
  }
  
}
