import { HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CacheEntry, MAX_CACHE_AGE } from '../classes/cache-entry';

@Injectable({
  providedIn: 'root'
})
export class CacheService {

  cache = new Map<string, CacheEntry>();
  private requests: any = { };

  constructor() { }

  put(req: HttpRequest<any>, res: HttpResponse<any>): void {
    const entry: CacheEntry = { urlWithParams: req.urlWithParams, response: res, entryTime: Date.now()};
    this.cache.set(req.urlWithParams, entry);
    this.deleteExpiredCache();
  }

  get(req: HttpRequest<any>): HttpResponse<any> | null {
    const entry = this.cache.get(req.urlWithParams);
    if (!entry) {
      return null;
    }
    const isExpired = (Date.now() - entry.entryTime) > MAX_CACHE_AGE;
    return isExpired ? null : entry.response;
  }

  invalidateCache(): void {
    this.requests = new Map<string, CacheEntry>();
  }

  private deleteExpiredCache(): void {
    this.cache.forEach(entry => {
      if ((Date.now() - entry.entryTime) > MAX_CACHE_AGE) {
        this.cache.delete(entry.urlWithParams);
      }
    });
  }

}
