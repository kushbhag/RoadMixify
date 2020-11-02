import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ArtistSearch } from '../models/artist/artist-search.model';
import { CursorPagingObject } from '../models/cursor-paging-object.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {
  user: User;

  constructor(private http: HttpClient) {
    console.log('New Instance Created');
  }

  getCurrentPlayback() {
    if (!this.user) {
      this.user = JSON.parse(localStorage.getItem('user'));
    }
    return this.http.get("https://api.spotify.com/v1/me/player", {
      headers: {
        Authorization: 'Bearer ' + this.user.access_token
      }
    });
  }

  getRecentlyPlayed(): Observable<CursorPagingObject> {
    if (!this.user) {
      this.user = JSON.parse(localStorage.getItem('user'));
    }
    return this.http.get<CursorPagingObject>("https://api.spotify.com/v1/me/player/recently-played", {
      headers: {
        Authorization: 'Bearer ' + this.user.access_token
      }
    });
  }

  pause() {
    return this.http.put("https://api.spotify.com/v1/me/player/pause", {
      headers: {
        Authorization: 'Bearer ' + this.user.access_token
      }
    });
  }

  getTopTracks() {
    console.log(this.user.access_token);
    return this.http.get("https://api.spotify.com/v1/me/top/artists", {
      params: {
        time_range: 'medium_term'
      },
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + this.user.access_token
      }
    });
  }

  // Searches
  searchString (search: string): string {
    return search.split(' ').join('%20');
  }

  searchArtist(search: string, limit: number): Observable<ArtistSearch> {
    if (!this.user) {
      this.user = JSON.parse(localStorage.getItem('user'));
    }
    let url = 'https://api.spotify.com/v1/search?type=artist&limit=' + limit.toString() + '&q=' + this.searchString(search);
    return this.http.get<ArtistSearch>(url, {
      headers: {
        Authorization: 'Bearer ' + this.user.access_token
      }
    });
  }
}
