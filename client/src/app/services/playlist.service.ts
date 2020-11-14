import { Injectable } from '@angular/core';
import { Album } from '../models/album/album.model';
import { Artist } from '../models/artist/artist.model';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {

  artists: Artist[];
  albums: Album[];
  timeDuration = [];
  totalDuration: number;
  playListLink: string;
  explicit = true;
  public = true;

  constructor() {
    this.artists = [];
    this.albums = [];
  }
}
