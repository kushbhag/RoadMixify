import { Component, Input, OnInit } from '@angular/core';
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

  tracks: Track[];
  trackIds: string[];
  artists: any;
  duration: number;
  count = 0;

  constructor(private playlistService: PlaylistService,
              private spotifyService: SpotifyService) {
      this.tracks = [];
      this.trackIds = [];
      this.duration = -10000;
  }

  ngOnInit(): void {
    this.loadPlaylist();
    console.log(this.duration);
    console.log(this.playlistService.totalDuration);
  }
  
  loadPlaylist() {
    this.getAllAlbums().subscribe((res) => {
      console.log(this.playlistService.totalDuration);
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
              this.trackIds.push((<PagingObject>val[i]).items[indexTrack].id);
              tempTrackIds.push((<PagingObject>val[i]).items[indexTrack].id);
              this.duration += (<PagingObject>val[i]).items[indexTrack].duration_ms;
            } else {
              this.trackIds.push((<Track>val[i]).id);
              tempTrackIds.push((<Track>val[i]).id);
              this.duration += (<Track>val[i]).duration_ms;
            }
          }
          console.log(this.duration);
          if (this.duration >= this.playlistService.totalDuration && tempTrackIds.length > 0) {
            this.spotifyService.getTracks(tempTrackIds).subscribe(tracks => {
              this.tracks.push(...tracks.tracks);
            });
          }
        });
      }
    });
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
    this.spotifyService.getUser().subscribe(val => {
      this.spotifyService.createPlaylist(val.id).subscribe((x) => {
        this.spotifyService.addToPlaylist(x.id, this.trackIds).subscribe();
      });
    });
  }

}
