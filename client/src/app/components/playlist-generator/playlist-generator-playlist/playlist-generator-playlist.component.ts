import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Track } from 'src/app/models/track.model';
import { PlaylistService } from 'src/app/services/playlist.service';
import { SpotifyService } from 'src/app/services/spotify.service';

@Component({
  selector: 'app-playlist-generator-playlist',
  templateUrl: './playlist-generator-playlist.component.html',
  styleUrls: ['./playlist-generator-playlist.component.css']
})
export class PlaylistGeneratorPlaylistComponent implements OnInit {

  /* A form element representing the playlist name */
  @ViewChild('playlistName') playlistName: ElementRef;

  tracks = new Array<Track>();
  /* Track the current duration of the playlist */
  duration = 0;
  /* Sorting Direction */
  sortDirection = 'none';

  /* Pagination control parameters */
  currPage = 1;
  itemsPerPage = 10;

  constructor(private playlistService: PlaylistService,
              private spotifyService: SpotifyService) { }

  ngOnInit(): void {
    this.generatePlaylist();
  }

  generatePlaylist(): void {
    let ids = new Array<string> ();
    for (let track of this.playlistService.tracks) {
      ids.push(track.id);
    }
    if (ids.length > 0) {
      this.spotifyService.getRecommendations(ids, this.playlistService.numOfTracks).subscribe(val => {
        this.tracks = val.tracks;
        for (let track of val.tracks) {
          this.duration += track.duration_ms;
        }
      });
    }
  }

  addPlaylist(): void {
    if (this.playlistName.nativeElement.value === '') {
      this.playlistName.nativeElement.value = 'Road Trip Playlist';
    }

    /* Creates the playlist, and adds the songs 100 at a time to it */
    this.spotifyService.getUser().subscribe(val => {
      this.spotifyService.createPlaylist(val.id, this.playlistName.nativeElement.value, this.playlistService.public)
      .subscribe((play) => {
        this.playlistService.playListLink = play.external_urls.spotify;
        let trackIds = this.tracks.map(t => t.id);
        for (let i = 0; i<this.tracks.length; i += 100) {
          let subTracks = trackIds.slice(i, i+100);
          this.spotifyService.addToPlaylist(play.id, subTracks).subscribe();
        }
      });
    });
  }

  removeTrack(index: number): void {
    let deleted = this.tracks.splice(index, 1);
    this.duration -= deleted[0].duration_ms;
  }

  /* Change itemsPerPage */
  setItemsPerPage($event) {
    if ($event.srcElement.value === 'All') {
      this.itemsPerPage = this.tracks.length;
    } else {
      this.itemsPerPage = $event.srcElement.value;
    }
    this.currPage = 1;
  }

}
