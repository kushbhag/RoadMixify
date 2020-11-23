import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { Album } from 'src/app/models/album/album.model';
import { Albums } from 'src/app/models/albums.model';
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

  constructor(public playlistService: PlaylistService,
              private spotifyService: SpotifyService) {
      this.duration = 0;
      this.tracks = [];
      this.refreshTracks = [];
  }

  ngOnInit(): void {
    this.loadPlaylist();
  }

  getPlaylistTracks(albumArtistMix: any[]): string[] {
    let trackIds = [];
    let trackSet = new Set<string>(this.tracks.map(t => t.name));
    let index = 0;
    // Store the track id's for the songs
    while (this.duration < this.playlistService.totalDuration) {
      // To ensure that it doesn't run forever
      if (index++ > 10000) {
        break;
      }
      let indexMix = Math.floor(Math.random() * albumArtistMix.length);
      let indexAlbum = Math.floor(Math.random() * albumArtistMix[indexMix].albums.length);
      const album = albumArtistMix[indexMix].albums[indexAlbum];
      
      if (album === undefined) {
        continue;
      } else {
        let indexTrack = Math.floor(Math.random() * album.tracks.items.length);
        if (!this.playlistService.explicit && album.tracks.items[indexTrack].explicit) {
          continue;
        }
        if (!trackSet.has(album.tracks.items[indexTrack].name)) {
          trackIds.push(album.tracks.items[indexTrack].id);
          this.duration += album.tracks.items[indexTrack].duration_ms;
          trackSet.add(album.tracks.items[indexTrack].name);
        }
      }
    }
    return trackIds;
  }

  getAlbumArtistMix(albumsList: (Albums | Albums[])[]): any[] {
    let albumArtistMix = [];
    // Convert the arrays of length 20 into one array
    for (let i = 0; i < albumsList.length; i ++) {
      if ((<Albums>albumsList[i]).albums === undefined) { // For the artists
        let albums = new Albums([]);
        for (let listOfAlbums of <Albums[]>albumsList[i]) {
          albums.albums.push(...listOfAlbums.albums);
        }
        albumArtistMix[i] = albums;
      } else { // For the albums
        albumArtistMix[i] = albumsList[i];
      }
    }
    return albumArtistMix;
  }

  loadPlaylist(): void {
    // Get all the albums for the corresponding albums and artists
    forkJoin(this.playlistService.artistAlbumMix.map((mix) => {
      let albumIds = [];

      // Check if artist / album has no tracks
      if (mix.length === 0) {
        return of(new Albums([]));
      }

      // Go through paging objects to sort them into arrays of 20 (if artist)
      //  if it is an album, it will simply return
      for (let i = 0; i < mix.length; i += 20) {
        if (mix[i].type === 'album') {
          albumIds.push(mix.slice(i, i+20).map(a => a.id));
        } else if (mix[i].type === 'track') {
          let wrapperAlbum = new Album();
          let wrapperPagingObject = new PagingObject();
          wrapperPagingObject.items = mix;
          wrapperAlbum.tracks = wrapperPagingObject;
          let wrapperAlbums = new Albums([wrapperAlbum]);
          return of (wrapperAlbums);
        }
      }

      // Return the forkjoined version of all the albums of the artist
      return forkJoin(albumIds.map(a => {
        return this.spotifyService.getAlbums(a);
      }));
    })).subscribe((albumsList) => {
      let albumArtistMix = this.getAlbumArtistMix(albumsList);

      let trackIds = this.getPlaylistTracks(albumArtistMix);

      // Split the track id's into groups of 50
      let subTrackIds = [];
      for (let i = 0; i < trackIds.length; i += 50) {
        subTrackIds.push(trackIds.slice(i, i+50));
      }

      // Get the tracks for all the track id's
      forkJoin(subTrackIds.map(ids => {
        return this.spotifyService.getTracks(ids);
      })).subscribe((tracksList) => {
        for (let tracks of tracksList) {
          for (let t of tracks.tracks) {
            this.tracks.push(t);
          }
        }
      });
    })
    this.refresh = false;
  }

  // getAllAlbums(): Observable<Array<PagingObject>> {
  //   let art$ = this.playlistService.artists.map((a, index) => {
  //     return this.spotifyService.getArtistsAlbums(a.id);
  //   });
  //   let alb$ = this.playlistService.albums.map((a, index) => {
  //     return this.spotifyService.getAlbumTracks(a.id)
  //   });
  //   return forkJoin([...art$, ...alb$]);
  // }

  addPlaylist(): void {
    if (this.playlistName.nativeElement.value === '') {
      this.playlistName.nativeElement.value = 'Road Trip Playlist';
    }

    this.spotifyService.getUser().subscribe(val => {
      this.spotifyService.createPlaylist(val.id, this.playlistName.nativeElement.value, this.playlistService.public)
      .subscribe((play) => {
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
