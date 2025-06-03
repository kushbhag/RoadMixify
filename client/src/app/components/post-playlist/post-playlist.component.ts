import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Album } from 'src/app/models/album/album.model';
import { PagingObject } from 'src/app/models/paging-object.model';
import { PlaylistService } from 'src/app/services/playlist.service';

@Component({
  selector: 'app-post-playlist',
  templateUrl: './post-playlist.component.html',
  styleUrls: ['./post-playlist.component.css'],
  imports: [
    RouterModule
  ]
})
export class PostPlaylistComponent implements OnInit {

  constructor(public playlistService: PlaylistService) { }

  ngOnInit(): void {
    this.playlistService.albums = [];
    this.playlistService.artists = [];
    this.playlistService.tracks = [];
    this.playlistService.numOfTracks = '20';
    this.playlistService.timeDuration = [];
    this.playlistService.totalDuration = 0;
    this.playlistService.artistsAlbumFull = new Map<string, Album[]>();
    this.playlistService.artistsAlbum = new Map<string, Album[]>();
    this.playlistService.mixAlbums = new Array<PagingObject>();
  }

}
