import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { PagingObject } from 'src/app/models/paging-object.model';
import { Track } from 'src/app/models/track.model';
import { Tracks } from 'src/app/models/tracks.model';
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
  refreshTracks: Track[];
  duration: number;

  currPage = 1;
  counts = [1,2,3,4,5,6,7,8,9,10]
  refresh = false;

  constructor(private playlistService: PlaylistService,
              private spotifyService: SpotifyService) {
      this.refreshTracks = [];
  }

  ngOnInit(): void {
    this.loadPlaylist();
  }

  // Get all the albums's tracks 50 requests per artist
  // Now I can figure out randomness

  loadPlaylist(): void {
    this.duration = 0;
    this.tracks = [];
    this.getAllAlbums().subscribe((res) => {
      forkJoin(res.map((albs) => {
        // let indices = [];
        // for (let f = 0; f < 50; f ++) {
        //   let indexArtist = Math.floor(Math.random() * res.length);
        //   let indexAlbum = Math.floor(Math.random() * res[indexArtist].items.length);
        //   indices.push([indexArtist, indexAlbum]);
        // }
        return forkJoin(albs.items.map((a) => {
          return this.spotifyService.getAbstractTrack(a);
        }));
      })).subscribe((val) => {
        let trackIds = [];
        let trackSet = new Set<string>();
        let index = 0;
        while (this.duration < this.playlistService.totalDuration) {
          if (index++ > 10000) {
            break;
          }
          let indexArtist = Math.floor(Math.random() * val.length);
          let indexAlbum = Math.floor(Math.random() * val[indexArtist].length);
          const album = val[indexArtist][indexAlbum];
          if (album === undefined) {
            continue;
          } else if ((<PagingObject>album).items !== undefined) {
            let indexTrack = Math.floor(Math.random() * (<PagingObject>album).items.length);
            if (!trackSet.has((<PagingObject>album).items[indexTrack].name)) {
              trackIds.push((<PagingObject>album).items[indexTrack].id);
              this.duration += (<PagingObject>album).items[indexTrack].duration_ms;
              trackSet.add((<PagingObject>album).items[indexTrack].name);
            }
          } else {
            if (!trackSet.has((<Track>album).name)) {
              trackIds.push((<Track>album).id);
              this.duration += (<Track>album).duration_ms;
              trackSet.add((<Track>album).name);
            }
          }
        }
        // let s = [];
        // for (let i = 0; i < trackIds.length; i *= 50) {
        //   s.push(trackIds.s)
        // }
        let subTrackIds = [];
        for (let i = 0; i < trackIds.length; i += 50) {
          subTrackIds.push(trackIds.slice(i, i+50));
        }
        forkJoin(subTrackIds.map(ids => {
          return this.spotifyService.getTracks(ids);
        })).subscribe((tracksList) => {
          for (let tracks of tracksList) {
            for (let t of tracks.tracks) {
              this.tracks.push(t);
            }
          }
        });
        // console.log(this.tracks);
        // forkJoin(val.map((arr, index) =>{
        //   let tempTrackIds = [];
        //   for (let i = 0; i < arr.length; i ++) {
        //     if (arr[i] === undefined) {
        //       continue;
        //     } else if ((<PagingObject>arr[i]).items !== undefined){
        //       let indexTrack = Math.floor(Math.random() * (<PagingObject>arr[i]).items.length);
        //       tempTrackIds.push((<PagingObject>arr[i]).items[indexTrack].id);
        //     } else {
        //       tempTrackIds.push((<Track>arr[i]).id);;
        //     }
        //   }
        //   if (tempTrackIds.length > 0){
        //     return this.spotifyService.getTracks(tempTrackIds);
        //   } else {
        //     const temp = new Tracks();
        //     temp.tracks = [];
        //     return of(temp);
        //   }
        // })).subscribe((tracksList) => {
        //   let trackSet = new Set<string>();
        //   for (let i = 0; i < tracksList.length; i ++) {
        //     for (let track of tracksList[i].tracks){
        //       if (this.duration >= this.playlistService.totalDuration) {
        //         break;
        //       } else {
        //         if (!trackSet.has(track.name)) {
        //           this.duration += track.duration_ms;
        //           trackSet.add(track.name);
        //           this.tracks.push(track);
        //         }
        //       }
        //     }
        //   }
        // })
      })
    });
    this.refresh = false;
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

  addPlaylist(): void {
    if (this.playlistName.nativeElement.value === '') {
      this.playlistName.nativeElement.value = 'Road Trip Playlist';
    }
    this.spotifyService.getUser().subscribe(val => {
      this.spotifyService.createPlaylist(val.id, this.playlistName.nativeElement.value).subscribe((play) => {
        this.playlistService.playListLink = play.external_urls.spotify;
        let trackIds = this.getTrackIds();
        for (let i = 0; i<this.tracks.length; i += 100) {
          let subTracks = trackIds.slice(i, i+100);
          this.spotifyService.addToPlaylist(play.id, subTracks).subscribe();
        }
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

  removeTrack(index: number): void {
    let deleted = this.tracks.splice(index, 1);
    this.duration -= deleted[0].duration_ms;
  }

  hardRefresh(): void {
    this.tracks = this.refreshTracks;
    this.refreshTracks = [];
    this.duration = 0;
    for (let t of this.tracks) {
      this.duration += t.duration_ms;
    }
    this.loadPlaylist();
  }

  addToRefresh(e, track: Track): void {
    if (e.currentTarget.checked === true) {
      this.refreshTracks.push(track);
    } else {
      this.refreshTracks = this.refreshTracks.filter(val => val.name !== track.name);
    }
  }

  inRefreshList(track: Track): boolean {
    return !!this.refreshTracks.find(val => val.name === track.name);
  }

}
