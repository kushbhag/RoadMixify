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
        if (error.error instanceof ErrorEvent) {

        }
        if (error.status === 400 || error.status === 401) {
          if (this.spotifyService.loggedIn()) {
            this.spotifyService.refresh().subscribe(
              val => {
                const user = this.spotifyService.user;
                localStorage.removeItem('user');
                if (val.access_token !== undefined) {
                  user.access_token = val.access_token;
                  localStorage.setItem('user', JSON.stringify(user));
                  this.spotifyService.user = user;
                }
              },
              err => {
                localStorage.removeItem('user');
                this.router.navigate(['/home']);
              }
            );
          }
        } else {
          localStorage.removeItem('user');
          this.router.navigate(['/home']);
        }
        
        return throwError(error);
      })
    );
  }
}
