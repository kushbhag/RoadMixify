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
          
        } else {
          localStorage.removeItem('user');
          this.router.navigate(['/home']);
          // if (this.spotifyService.loggedIn()) {
          //   this.spotifyService.refresh().subscribe(val => {
          //     console.log(val);
          //   });
          // }
        }
        return throwError(error);
      })
    );
  }
}
