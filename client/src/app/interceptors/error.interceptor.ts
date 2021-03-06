import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { SpotifyService } from '../services/spotify.service';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private spotifyService: SpotifyService,
              private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler,): Observable<HttpEvent<unknown>> {
    const clone = request.clone();

    return next.handle(request)
    .pipe(
      retry(1),
      catchError((error: HttpErrorResponse) => {
        // if (error.error instanceof ErrorEvent) {

        // }
        if (error.status === 401) { // I removed 400 here?
          if (this.spotifyService.loggedIn()) {
            console.log('Refreshing User Access Token');
            this.spotifyService.refresh().subscribe(
              val => {
                let user = this.spotifyService.user;
                localStorage.removeItem('user');
                if (val.access_token !== undefined) {
                  user.access_token = val.access_token;
                  localStorage.setItem('user', JSON.stringify(user));
                  this.spotifyService.user = user;
                  console.log('Refreshed');
                }
              },
              err => {
                localStorage.removeItem('user');
                this.router.navigate(['/home']);
              }
            );
          }
        } else if (error.status !== 400) { // 400 is just bad request
          console.log('Removing User');
          console.log(error);
          localStorage.removeItem('user');
          this.router.navigate(['/home']);
        }
        
        return throwError(error);
      })
    );
  }
}
