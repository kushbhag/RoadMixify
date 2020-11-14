import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { element } from 'protractor';
import { Album } from 'src/app/models/album/album.model';
import { Artist } from 'src/app/models/artist/artist.model';
import { PagingObject } from 'src/app/models/paging-object.model';
import { PlayHistory } from 'src/app/models/play-history.model';
import { PlaylistService } from 'src/app/services/playlist.service';
import { SpotifyService } from 'src/app/services/spotify.service';

@Component({
  selector: 'app-road-trip',
  templateUrl: './road-trip.component.html',
  styleUrls: ['./road-trip.component.css']
})
export class RoadTripComponent implements OnInit {

  recentlyPlayed: PlayHistory[];
  playlistForm: FormGroup;
  errorMessage = '';

  artistsAlbumFull = new Map<string, Album[]>();
  artistsAlbum = new Map<string, Album[]>();
  mixAlbums = new Array<PagingObject>();

  artists: Artist[];
  albums: Album[];
  searchResultArtist: Artist[];
  searchResultAlbum: Album[];

  constructor(private fb: FormBuilder,
              private playlistService: PlaylistService,
              private spotifyService: SpotifyService,
              private router: Router) {
    this.artists = [];
    this.albums = [];
  }

  get duration(): FormGroup {
    return this.playlistForm.get('duration') as FormGroup;
  }

  ngOnInit(): void {
    this.playlistForm = this.fb.group({
      artists: [''],
      albums: [''],
      explicit: true,
      public: true,
      duration: this.fb.group({
        hours: ['', [Validators.max(23), Validators.min(0)]],
        minutes: ['', [Validators.max(59), Validators.min(0)]],
        seconds: ['', [Validators.max(59), Validators.min(0)]]
      })
    });
    this.playlistForm.get('artists').valueChanges.subscribe((search) => {
      this.autofill(search, 'artist');
    });
    this.playlistForm.get('albums').valueChanges.subscribe((search) => {
      this.autofill(search, 'album');
    });

    if (this.playlistService.artists.length > 0) {
      this.artists = this.playlistService.artists;
    }
    if (this.playlistService.albums.length > 0) {
      this.albums = this.playlistService.albums;
    }
    this.mixAlbums = this.playlistService.mixAlbums;
    this.artistsAlbum = this.playlistService.artistsAlbum;
    this.artistsAlbumFull = this.playlistService.artistsAlbumFull;

    this.playlistForm.controls['explicit'].setValue(this.playlistService.explicit);
    this.playlistForm.controls['public'].setValue(this.playlistService.public);
    this.duration.controls['hours'].setValue(this.playlistService.timeDuration[0]);
    this.duration.controls['minutes'].setValue(this.playlistService.timeDuration[1]);
    this.duration.controls['seconds'].setValue(this.playlistService.timeDuration[2]);
  }

  addArtist(artist: Artist) {
    if (artist !== undefined) {
      if (!this.artistsAlbumFull.has(artist.name)) {
        this.artists.push(artist);
        this.spotifyService.getArtistsAlbums(artist.id).subscribe(album => {
          this.artistsAlbumFull.set(artist.name, album.items);
          this.artistsAlbum.set(artist.name, album.items);
        });
      }
      this.playlistForm.controls['artists'].setValue('');
    }
  }

  addAlbum(album: Album) {
    if (album !== undefined) {
      this.spotifyService.getAlbumTracks(album.id).subscribe(tracks => {
        this.mixAlbums.push(tracks);
      });
      this.albums.push(album);
      this.playlistForm.controls['albums'].setValue('');
    }
  }

  removeArtist(index: number) {
    let del = this.artists.splice(index, 1);
    this.artistsAlbumFull.delete(del[0].name);
    this.artistsAlbum.delete(del[0].name);
  }

  removeAlbum(index: number) {
    this.albums.splice(index, 1);
    this.mixAlbums.splice(index, 1);
  }

  save() {
    let timeDuration = 0;
    if (Number(this.duration.controls['hours'].value)) {
      timeDuration += Number(this.duration.controls['hours'].value) * 3600000;
    }
    if (Number(this.duration.controls['minutes'].value)) {
      timeDuration += Number(this.duration.controls['minutes'].value) * 60000;
    }
    if (Number(this.duration.controls['seconds'].value)) {
      timeDuration += Number(this.duration.controls['seconds'].value) * 1000;
    }
    this.playlistService.timeDuration[0] = this.duration.controls['hours'].value;
    this.playlistService.timeDuration[1] = this.duration.controls['minutes'].value;
    this.playlistService.timeDuration[2] = this.duration.controls['seconds'].value;

    this.playlistService.explicit = this.playlistForm.controls['explicit'].value;
    this.playlistService.public = this.playlistForm.controls['public'].value;

    if (timeDuration === 0) {
      this.errorMessage = 'Duration cannot be 0';
    } else if (this.artists.length < 1 && this.albums.length < 1) {
      this.errorMessage = 'Add atleast one artist or album to continue';
    } else if (this.playlistForm.valid){
      this.playlistService.artists = this.artists;
      this.playlistService.albums = this.albums;
      this.playlistService.totalDuration = timeDuration;

      this.playlistService.artistAlbumMix = [];
      this.artistsAlbum.forEach((val, key, map) => {
        let albums = [];
        albums.push(...val);
        this.playlistService.artistAlbumMix.push(albums);
      });
      this.playlistService.artistAlbumMix.push(...this.mixAlbums.map(po => po.items));

      this.playlistService.artistsAlbum = this.artistsAlbum;
      this.playlistService.artistsAlbumFull = this.artistsAlbumFull;
      this.playlistService.mixAlbums = this.mixAlbums;

      console.log(this.playlistService.artistAlbumMix);
      this.router.navigate(['playlist']);
    }
  }

  reset() {
    this.artists = [];
    this.albums = [];
    this.artistsAlbum = new Map<string, Album[]>();
    this.artistsAlbumFull = new Map<string, Album[]>();
    this.playlistForm.controls['artists'].setValue('');
    this.playlistForm.controls['albums'].setValue('');
    this.playlistForm.controls['explicit'].setValue(true);
    this.playlistForm.controls['public'].setValue(true);
    this.duration.controls['hours'].setValue('');
    this.duration.controls['minutes'].setValue('');
    this.duration.controls['seconds'].setValue('');
  }

  autofill(searchField: string, searchColumn: string) {
    if (searchField === '') {
      if (searchColumn === 'artist') this.searchResultArtist = [];
      else this.searchResultAlbum = [];
    } else if (searchColumn === 'artist') {
      this.spotifyService.searchArtist(searchField, 5).subscribe((val) => {
        this.searchResultArtist = val.artists.items;
      });
    } else if (searchColumn === 'album') {
      this.spotifyService.searchAlbum(searchField, 5).subscribe((val) => {
        this.searchResultAlbum = val.albums.items;
      });
    }
  }

  refreshMix($event, artist: string, album: string) {
    if ($event.currentTarget.checked === false) {
      let albums = this.artistsAlbum.get(artist);
      albums = albums.filter(alb => alb.name !== album)
      this.artistsAlbum.set(artist, albums);
    } else {
      this.artistsAlbum.get(artist).push(...this.artistsAlbumFull.get(artist).filter(albums => albums.name === album));
    }
    console.log(this.artistsAlbum);
  }

}
