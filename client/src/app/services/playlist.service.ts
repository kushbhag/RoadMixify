import { Injectable } from '@angular/core';
import { Album } from '../models/album/album.model';
import { Albums } from '../models/albums.model';
import { Artist } from '../models/artist/artist.model';
import { PagingObject } from '../models/paging-object.model';
import { Track } from '../models/track.model';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {

  /* Contains the full list of ALL the albums/singles that an artist has */
  artistsAlbumFull: Map<string, Album[]>;
  /* Contains the selected list of albums/singles that the user selected in advanced settings */
  artistsAlbum: Map<string, Album[]>;
  /* Contains the actual list of user selected albums in the albums section of form */
  mixAlbums: Array<PagingObject>;

  /* Are used when the user comes back to the form page, so that we can load up the artists
      and albums into the form. Mainly used for displaying on the form */
  artists: Artist[];
  albums: Album[];
  /* This is used for the playlist generator */
  tracks: Track[];
  numOfTracks = '20';

  /* Is the parameter that is used to hold an array of all the artists' singles/albums while,
        while at the same also holding the single albums that the user inputted.
        The point of this is to organize the data in a way that I can use it when generating the playlist */
  artistAlbumMix = [];
  timeDuration = [];
  totalDuration: number;
  playListLink: string;
  explicit = true;
  public = true;

  constructor() {
    this.artists = [];
    this.albums = [];
    this.tracks = [];
    this.artistsAlbumFull = new Map<string, Album[]>();
    this.artistsAlbum = new Map<string, Album[]>();
    this.mixAlbums = new Array<PagingObject>();
  }
}
