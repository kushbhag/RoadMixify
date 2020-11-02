import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Artist } from 'src/app/models/artist/artist.model';
import { PlayHistory } from 'src/app/models/play-history.model';
import { SpotifyService } from 'src/app/services/spotify.service';

@Component({
  selector: 'app-road-trip',
  templateUrl: './road-trip.component.html',
  styleUrls: ['./road-trip.component.css']
})
export class RoadTripComponent implements OnInit {

  recentlyPlayed: PlayHistory[];
  playlistForm: FormGroup;
  searchResult: Artist[];
  artists: Artist[];


  constructor(private fb: FormBuilder,
              private spotifyService: SpotifyService) {
    this.artists = [];
  }

  addArtist() {
    this.spotifyService.searchArtist(this.playlistForm.get('artists').value, 1).subscribe((val) => {
      console.log(val);
      this.artists.push(val.artists.items[0]);
    });
  }

  removeArtist(index: number) {
    this.artists.splice(index, 1);
  }

  save() {
    console.log(this.artists);
  }

  autofill(s) {
    if (s != ''){
      this.spotifyService.searchArtist(s, 5).subscribe((val) => {
        this.searchResult = val.artists.items;
      });
    } else {
      this.searchResult = [];
    }
  }

  ngOnInit(): void {
    this.playlistForm = this.fb.group({
      artists: ['']
    });
    this.playlistForm.get('artists').valueChanges.subscribe((search) => {
      this.autofill(search);
    });
  }

}
