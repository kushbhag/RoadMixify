import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { CacheService } from '../services/cache.service';
import { tap } from 'rxjs/operators';

@Injectable()
export class CacheInterceptor implements HttpInterceptor {

  constructor(private cacheService: CacheService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // pass along non-cacheable requests and invalidate cache  
    if(req.method !== 'GET') {  
      // console.log(`Invalidating cache: ${req.method} ${req.urlWithParams}`);  
      this.cacheService.invalidateCache();  
      return next.handle(req);  
    }  
  
    // attempt to retrieve a cached response  
    const cachedResponse: HttpResponse<any> = this.cacheService.get(req.urlWithParams);
  
    // return cached response
    if (cachedResponse) {
      // console.log(`Returning a cached response: ${cachedResponse.urlWithParams}`); 
      // console.log(cachedResponse);
      // console.log(req.urlWithParams);
      return of(cachedResponse);
    }
  
    // send request to server and add response to cache  
    return next.handle(req)
      .pipe(
        tap(event => {
          if (event instanceof HttpResponse) {
            // console.log(`Adding item to cache: ${req.urlWithParams}`);
            this.cacheService.put(req.urlWithParams, event);
          }  
        })  
      );
  }
}
