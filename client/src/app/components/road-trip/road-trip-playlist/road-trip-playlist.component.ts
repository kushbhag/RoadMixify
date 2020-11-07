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

  constructor(private playlistService: PlaylistService,
              private spotifyService: SpotifyService) {
      this.tracks = [];
      this.trackIds = [];
  }

  ngOnInit(): void {
    this.getAllAlbums().subscribe((res) => {
      console.log(res);
      let indices = [];
      for (let i = 0; i < 10; i ++) {
        let indexArtist = Math.floor(Math.random() * res.length);
        let indexAlbum = Math.floor(Math.random() * res[indexArtist].items.length);
        indices.push([indexArtist, indexAlbum]);
      }
      forkJoin(indices.map((a, i) => {
        return this.spotifyService.getAbstractTrack(res[a[0]].items[a[1]])
      })).subscribe(val => {
        for (let i = 0; i < val.length; i ++) {
          if ((<PagingObject>val[i]).items !== undefined){
            let indexTrack = Math.floor(Math.random() * (<PagingObject>val[i]).total);
            this.trackIds.push((<PagingObject>val[i]).items[indexTrack].id);
          } else {
            this.trackIds.push((<Track>val[i]).id);
          }
        }
        this.spotifyService.getTracks(this.trackIds).subscribe(tracks => {
          this.tracks = tracks.tracks;
        });
      });
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
