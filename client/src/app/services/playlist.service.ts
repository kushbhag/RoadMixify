import { Injectable } from '@angular/core';
import { Album } from '../models/album/album.model';
import { Artist } from '../models/artist/artist.model';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {

  timeLimit: number;
  artists: Artist[];
  albums: Album[];
  timeDuration = [];
  totalDuration: number;

  constructor() {
    this.artists = [];
    this.albums = [];
  }
}
