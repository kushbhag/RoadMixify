import { HttpResponse } from '@angular/common/http';

export class CacheEntry {
    urlWithParams: string;
    response: HttpResponse<any>;
    entryTime: number;
}

export const MAX_CACHE_AGE = 60000;