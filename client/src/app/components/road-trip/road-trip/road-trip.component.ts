import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { element } from 'protractor';
import { Album } from 'src/app/models/album/album.model';
import { Artist } from 'src/app/models/artist/artist.model';
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
    this.duration.controls['hours'].setValue(this.playlistService.timeDuration[0]);
    this.duration.controls['minutes'].setValue(this.playlistService.timeDuration[1]);
    this.duration.controls['seconds'].setValue(this.playlistService.timeDuration[2]);
  }

  addArtist(artist: Artist) {
    if (artist !== undefined) {
      this.artists.push(artist);
      this.playlistForm.controls['artists'].setValue('');
    }
  }

  addAlbum(album: Album) {
    if (album !== undefined) {
      this.albums.push(album);
      this.playlistForm.controls['albums'].setValue('');
    }
  }

  removeArtist(index: number) {
    this.artists.splice(index, 1);
  }

  removeAlbum(index: number) {
    this.albums.splice(index, 1);
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

    if (timeDuration === 0) {
      this.errorMessage = 'Duration cannot be 0';
    } else if (this.artists.length < 1 && this.albums.length < 1) {
      this.errorMessage = 'Add atleast one artist or album to continue';
    } else if (this.playlistForm.valid){
      this.playlistService.artists = this.artists;
      this.playlistService.albums = this.albums;
      this.playlistService.totalDuration = timeDuration;
      this.router.navigate(['playlist']);
    }
  }

  reset() {
    this.artists = [];
    this.albums = [];
    this.playlistForm.controls['artists'].setValue('');
    this.playlistForm.controls['albums'].setValue('');
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

  fitText(searchField: string, searchColumn: string) {
    if (searchColumn === 'artists') {
      this.playlistForm.controls['artists'].setValue(searchField);
    } else if (searchColumn === 'albums') {
      this.playlistForm.controls['albums'].setValue(searchField);
    }
  }

}
