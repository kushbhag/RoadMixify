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
    if(req.method !== 'GET'){
      this.cacheService.invalidateCache();
      return next.handle(req);
    }
    if (req.url === 'https://api.spotify.com/v1/recommendations') {
      return next.handle(req);
    }

    // attempt to retrieve a cached response
    const cachedResponse = this.cacheService.get(req);

    // return cached response
    if (cachedResponse !== null) {
      // console.log(`Returning a cached response: ${cachedResponse.urlWithParams}`); 
      // console.log(cachedResponse);
      return of(cachedResponse);
    }

    // send request to server and add response to cache
    return next.handle(req)
      .pipe(
        tap(event => {
          if (event instanceof HttpResponse) {
            // console.log(`Adding item to cache: ${req.urlWithParams}`);
            this.cacheService.put(req, event);
          }
        })
      );
  }
}
