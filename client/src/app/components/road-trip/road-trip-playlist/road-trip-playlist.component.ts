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

  /* A form element representing the playlist name */
  @ViewChild('playlistName') playlistName: ElementRef;

  /* The actual tracks of the playlist */
  tracks: Track[] = new Array<Track>() ;
  /* Makes a list of all the selected tracks to keep even after the refresh */
  refreshTracks: Track[] = new Array<Track>();
  /* Used to know if a refresh has been triggered to switch the UI */
  refresh = false;
  /* Track the current duration of the playlist */
  duration = 0;

  /* Pagination control parameters */
  currPage = 1;
  itemsPerPage = 10;

  constructor(public playlistService: PlaylistService,
              private spotifyService: SpotifyService) {
  }

  ngOnInit(): void {
    this.loadPlaylist();
  }

  /* Purpose: Gets all of the tracks IDS stores them into an array
                It does all of the randomness in the algorithm, and because we
                don't have all of the images/url's of the tracks I need to
                get them later in to algorithm
  */
  getPlaylistTracks(albumArtistMix: any[]): string[] {
    /* Return object */
    let trackIds = [];
    /* Set is to ensure that the songs aren't duplicated */
    let trackSet = new Set<string>(this.tracks.map(t => t.name));
    let index = 0;
    // Store the track id's for the songs
    while (this.duration < this.playlistService.totalDuration) {
      /* HARDSTOP; Ensures that it doesn't run forever */
      if (index++ > 10000) {
        break;
      }
      /* Random number for choosing an artist or an album */
      let indexMix = Math.floor(Math.random() * albumArtistMix.length);
      /* Random number for selecting the Album (for each artist/album), because each object is an Albums object
          even if there is only one album it wouldn't matter */
      let indexAlbum = Math.floor(Math.random() * albumArtistMix[indexMix].albums.length);
      const album = albumArtistMix[indexMix].albums[indexAlbum];
      
      /* Sometimes album objects just aren't defined for artists who are very new */
      if (album === undefined) {
        continue;
      } else {
        /* The actual index for the track */
        let indexTrack = Math.floor(Math.random() * album.tracks.items.length);
        /* Rejects the song if it is explicit and user does not want explicit */
        if (!this.playlistService.explicit && album.tracks.items[indexTrack].explicit) {
          continue;
        }
        /* Pushes the song onto the array, and adds the duration */
        if (!trackSet.has(album.tracks.items[indexTrack].name)) {
          trackIds.push(album.tracks.items[indexTrack].id);
          this.duration += album.tracks.items[indexTrack].duration_ms;
          trackSet.add(album.tracks.items[indexTrack].name);
        }
      }
    }
    return trackIds;
  }

  /* Returns an Albums[]
     Purpose: Is to organize all of the data into only Albums[] so that it
        is easier to manipulate. It is mostly used the Albums[] objects that
        exist because of the artists
  */
  getAlbumArtistMix(albumsList: (Albums | Albums[])[]): any[] {
    let albumArtistMix = [];
    /* Convert the arrays of length 20 into one array */
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

  /* Once this function is finished running, the playlist will be fully loaded */
  loadPlaylist(): void {
    /* Forkjoins all the albums/artists' albums into an Observable
        The Observable will either be of type Albums | Albums []
        It will be Albums[] because when I am trying to get the tracks/albums
        of an artist, I can only get arrays of 20 at a time
        It will be Albums if I am only getting the individual album
    */ 
    forkJoin(this.playlistService.artistAlbumMix.map((mix) => {
      let albumIds = [];

      /* Check if artist / album has no tracks */
      if (mix.length === 0) {
        return of(new Albums([]));
      }

      /* Go through paging objects to sort them into arrays of 20 (if artist)
            If it is an album, then it will get placed into an Albums type object
            and returned as an Observable */
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

      /* Return the forkjoined version of all the albums of the artist 
            Essentially creates an Observable<Albums[]> */
      return forkJoin(albumIds.map(a => {
        return this.spotifyService.getAlbums(a);
      }));
    })).subscribe((albumsList) => {
      /* Organize data into just Albums[] */
      let albumArtistMix = this.getAlbumArtistMix(albumsList);
      /* Actually get the track IDs into a single array */
      let trackIds = this.getPlaylistTracks(albumArtistMix);

      /* Split the track id's into groups of 50 due to limitations in GET call */
      let subTrackIds = [];
      for (let i = 0; i < trackIds.length; i += 50) {
        subTrackIds.push(trackIds.slice(i, i+50));
      }

      /* Get the Track object for all the track id's */
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

  /* Purpose: Add the playlist to the user's account */
  addPlaylist(): void {
    /* Default the playlist name to Road Trip Playlist */
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

  /* Remove any track from the playlist */
  removeTrack(index: number): void {
    let deleted = this.tracks.splice(index, 1);
    this.duration -= deleted[0].duration_ms;
  }

  /* Refreshes the playlist based on whatever tracks the user selected */
  hardRefresh(): void {
    this.tracks = this.refreshTracks;
    this.refreshTracks = [];
    this.duration = 0;
    for (let t of this.tracks) {
      this.duration += t.duration_ms;
    }
    this.loadPlaylist();
  }

  /* Add any track that the user selected to refreshTracks */
  addToRefresh(e, track: Track): void {
    if (e.currentTarget.checked === true) {
      this.refreshTracks.push(track);
    } else {
      this.refreshTracks = this.refreshTracks.filter(val => val.name !== track.name);
    }
  }

  /* Used in HTML to ensure the checkboxes are false */
  inRefreshList(track: Track): boolean {
    return !!this.refreshTracks.find(val => val.name === track.name);
  }

}
