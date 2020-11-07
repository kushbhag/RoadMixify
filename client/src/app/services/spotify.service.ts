import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AlbumSearch } from '../models/album/album-search.model';
import { Album } from '../models/album/album.model';
import { ArtistSearch } from '../models/artist/artist-search.model';
import { CursorPagingObject } from '../models/cursor-paging-object.model';
import { PagingObject } from '../models/paging-object.model';
import { Playlist } from '../models/playlist.model';
import { Track } from '../models/track.model';
import { Tracks } from '../models/tracks.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {
  user: User;

  constructor(private http: HttpClient) {
  }

  loggedIn() {
    return !!localStorage.getItem('user');
  }

  // getCurrentPlayback() {
  //   if (!this.user) {
  //     this.user = JSON.parse(localStorage.getItem('user'));
  //   }
  //   return this.http.get("https://api.spotify.com/v1/me/player", {
  //     headers: {
  //       Authorization: 'Bearer ' + this.user.access_token
  //     }
  //   });
  // }

  // getRecentlyPlayed(): Observable<CursorPagingObject> {
  //   if (!this.user) {
  //     this.user = JSON.parse(localStorage.getItem('user'));
  //   }
  //   return this.http.get<CursorPagingObject>("https://api.spotify.com/v1/me/player/recently-played", {
  //     headers: {
  //       Authorization: 'Bearer ' + this.user.access_token
  //     }
  //   });
  // }

  // Post
  createPlaylist(id: string): Observable<Playlist> {
    return this.http.post<Playlist>("https://api.spotify.com/v1/users/"+id+"/playlists", {
      "name": 'test'
    },
    {
      headers: {
        Authorization: 'Bearer ' + this.user.access_token,
        "Content-Type": 'application/json'
      }
    });
  }

  addToPlaylist(playlistId: string, trackIds: string[]) {
    let fullQuery: string = '';
    for (let i = 0; i < trackIds.length; i ++) {
      fullQuery += 'spotify:track:' + trackIds[i];
      if (i + 1 < trackIds.length) {
        fullQuery += ',';
      }
    }
    return this.http.post("https://api.spotify.com/v1/playlists/"+playlistId+"/tracks", 
    {
    },
    {
      params: {
        uris: fullQuery
      },
      headers: {
        Authorization: 'Bearer ' + this.user.access_token
      }
    });
  }

  // Get all artist's albums/tracks
  getArtistsAlbums(id: string): Observable<PagingObject> {
    return this.http.get<PagingObject>("https://api.spotify.com/v1/artists/"+id+"/albums", {
      params: {
        include_groups: 'album,single',
        country: 'CA',
        limit: '50'
      },
      headers: {
        Authorization: 'Bearer ' + this.user.access_token
      }
    });
  }

  // Creating playlist will either send in a album type or a track id
  getAbstractTrack(item: Album | Track) {
    if (item.type === 'album') {
      return this.getAlbumTracks(item.id);
    } else {
      return this.getTrack(item.id);
    }
  } 

  getAlbumTracks(id: string): Observable<PagingObject> {
    return this.http.get<PagingObject> ("https://api.spotify.com/v1/albums/"+id+"/tracks", {
      params: {
        limit: '50',
        market: 'CA'
      },
      headers: {
        Authorization: 'Bearer ' + this.user.access_token
      }
    });
  }

  getTracks(ids: string[]): Observable<Tracks> {
    let fullQuery: string = '';
    for (let i = 0; i < ids.length; i ++) {
      fullQuery += ids[i];
      if (i + 1 < ids.length) {
        fullQuery += ',';
      }
    }
    return this.http.get<Tracks>("https://api.spotify.com/v1/tracks/", {
      params: {
        ids: fullQuery,
        market: 'CA'
      },
      headers: {
        Authorization: 'Bearer ' + this.user.access_token
      }
    });
  }

  getTrack(id: string): Observable<Track> {
    return this.http.get<Track>("https://api.spotify.com/v1/tracks/"+id, {
      params: {
        market: 'CA'
      },
      headers: {
        Authorization: 'Bearer ' + this.user.access_token
      }
    });
  }

  getUser(): Observable<User> {
    return this.http.get<User>("https://api.spotify.com/v1/me", {
      headers: {
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

  searchAlbum(search: string, limit: number): Observable<AlbumSearch> {
    if (!this.user) {
      this.user = JSON.parse(localStorage.getItem('user'));
    }
    let url = 'https://api.spotify.com/v1/search?type=album&limit=' + limit.toString() + '&q=' + this.searchString(search);
    return this.http.get<AlbumSearch>(url, {
      headers: {
        Authorization: 'Bearer ' + this.user.access_token
      }
    });
  }
}
