import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { concat, forkJoin, Observable } from 'rxjs';
import { PagingObject } from 'src/app/models/paging-object.model';
import { Track } from 'src/app/models/track.model';
import { PlaylistService } from 'src/app/services/playlist.service';
import { SpotifyService } from 'src/app/services/spotify.service';

@Component({
  selector: 'app-road-trip-playlist',
  templateUrl: './road-trip-playlist.component.html',
  styleUrls: ['./road-trip-playlist.component.css']
})
export class RoadTripPlaylistComponent implements OnInit {

  @ViewChild('playlistName') playlistName: ElementRef;

  tracks: Track[];
  duration: number;

  currPage = 1;
  count = 0;
  refreshing = false;

  constructor(private playlistService: PlaylistService,
              private spotifyService: SpotifyService) {
      this.tracks = [];
      this.duration = 0;
  }

  ngOnInit(): void {
    this.loadPlaylist();
  }
  
  loadPlaylist() {
    this.getAllAlbums().subscribe((res) => {
      for(; this.count < 5; this.count ++) {
        let indices = [];
        for (let f = 0; f < 50; f ++) {
          let indexArtist = Math.floor(Math.random() * res.length);
          let indexAlbum = Math.floor(Math.random() * res[indexArtist].items.length);
          indices.push([indexArtist, indexAlbum]);
        }
        forkJoin(indices.map((a, k) => {
          return this.spotifyService.getAbstractTrack(res[a[0]].items[a[1]])
        })).subscribe(val => {
          let tempTrackIds = [];
          for (let i = 0; i < val.length; i ++) {
            if (this.duration >= this.playlistService.totalDuration) {
              break;
            }
            if ((<PagingObject>val[i]).items !== undefined){
              let indexTrack = Math.floor(Math.random() * (<PagingObject>val[i]).total);
              tempTrackIds.push((<PagingObject>val[i]).items[indexTrack].id);
              this.duration += (<PagingObject>val[i]).items[indexTrack].duration_ms;
            } else {
              tempTrackIds.push((<Track>val[i]).id);
              this.duration += (<Track>val[i]).duration_ms;
            }
          }
          if (this.duration >= this.playlistService.totalDuration && tempTrackIds.length > 0) {
            this.spotifyService.getTracks(tempTrackIds).subscribe(tracks => {
              this.tracks.push(...tracks.tracks);
            });
          }
        });
      }
    });
  }

  refresh() {
    this.tracks = [];
    this.duration = 0;
    this.count = 0;
    this.loadPlaylist();
  }

  getAllAlbums(): Observable<Array<PagingObject>> {
    let art$ = this.playlistService.artists.map((a, index) => {
      return this.spotifyService.getArtistsAlbums(a.id);
    });
    let alb$ = this.playlistService.albums.map((a, index) => {
      return this.spotifyService.getAlbumTracks(a.id)
    });
    return forkJoin([...art$, ...alb$]);
  }

  addPlaylist() {
    if (this.playlistName.nativeElement.value === '') {
      this.playlistName.nativeElement.value = 'Road Trip Playlist';
    }
    this.spotifyService.getUser().subscribe(val => {
      this.spotifyService.createPlaylist(val.id, this.playlistName.nativeElement.value).subscribe((x) => {
        this.spotifyService.addToPlaylist(x.id, this.getTrackIds()).subscribe();
      });
    });
  }

  getTrackIds(): Array<string> {
    let trackIds = [];
    for (let track of this.tracks) {
      trackIds.push(track.id);
    }
    return trackIds;
  }

  removeTrack(index: number) {
    let deleted = this.tracks.splice(index, 1);
    this.duration -= deleted[0].duration_ms;
  }

}
