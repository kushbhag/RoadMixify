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

  ngOnInit(): void {
    this.playlistForm = this.fb.group({
      duration: ['', Validators.required],
      artists: [''],
      albums: ['']
    });
    this.playlistForm.get('artists').valueChanges.subscribe((search) => {
      this.autofill(search, 'artist');
    });
    this.playlistForm.get('albums').valueChanges.subscribe((search) => {
      this.autofill(search, 'album');
    });
  }

  addArtist() {
    const find = this.searchResultArtist.find(element => element.name === this.playlistForm.get('artists').value);
    if (find !== undefined) {
      this.artists.push(find);
    } else {
      this.spotifyService.searchArtist(this.playlistForm.get('artists').value, 1).subscribe((val) => {
        this.artists.push(val.artists.items[0]);
      });
    }
  }

  addAlbum() {
    const find = this.searchResultAlbum.find(element => element.name === this.playlistForm.get('albums').value);
    if (find !== undefined) {
      this.albums.push(find);
    } else {
      this.spotifyService.searchAlbum(this.playlistForm.get('albums').value, 1).subscribe((val) => {
        this.albums.push(val.albums.items[0]);
      });
    }
  }

  removeArtist(index: number) {
    this.artists.splice(index, 1);
  }

  removeAlbum(index: number) {
    this.albums.splice(index, 1);
  }

  save() {
    this.playlistService.artists = this.artists;
    this.playlistService.albums = this.albums;
    this.router.navigate(['playlist']);
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

}
