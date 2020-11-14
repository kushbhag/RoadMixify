import { Injectable } from '@angular/core';
import { Album } from '../models/album/album.model';
import { Albums } from '../models/albums.model';
import { Artist } from '../models/artist/artist.model';
import { PagingObject } from '../models/paging-object.model';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {

  artistsAlbumFull: Map<string, Album[]>;
  artistsAlbum: Map<string, Album[]>;
  mixAlbums: Array<PagingObject>;

  artistAlbumMix = [];
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
    this.artistsAlbumFull = new Map<string, Album[]>();
    this.artistsAlbum = new Map<string, Album[]>();
    this.mixAlbums = new Array<PagingObject>();
  }
}
