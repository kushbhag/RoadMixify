import { Injectable } from '@angular/core';
import { Album } from '../models/album.model';
import { Artist } from '../models/artist/artist.model';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {

  timeLimit: number;
  artists: Artist[];

  constructor() {
    this.artists = [];
  }
}
