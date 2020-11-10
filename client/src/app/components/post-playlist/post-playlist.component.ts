import { Component, OnInit } from '@angular/core';
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
    this.playlistService.timeDuration = [];
    this.playlistService.totalDuration = 0;
  }

}
