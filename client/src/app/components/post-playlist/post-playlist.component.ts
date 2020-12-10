import { Component, OnInit } from '@angular/core';
import { Album } from 'src/app/models/album/album.model';
import { PagingObject } from 'src/app/models/paging-object.model';
import { PlaylistService } from 'src/app/services/playlist.service';

@Component({
  selector: 'app-post-playlist',
  templateUrl: './post-playlist.component.html',
  styleUrls: ['./post-playlist.component.css']
})
export class PostPlaylistComponent implements OnInit {

  constructor(public playlistService: PlaylistService) { }

  ngOnInit(): void {
    this.playlistService.albums = [];
    this.playlistService.artists = [];
    this.playlistService.tracks = [];
    this.playlistService.timeDuration = [];
    this.playlistService.totalDuration = 0;
    this.playlistService.artistsAlbumFull = new Map<string, Album[]>();
    this.playlistService.artistsAlbum = new Map<string, Album[]>();
    this.playlistService.mixAlbums = new Array<PagingObject>();
  }

}
