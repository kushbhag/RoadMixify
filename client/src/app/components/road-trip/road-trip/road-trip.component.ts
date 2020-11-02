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


  constructor(private fb: FormBuilder,
              private spotifyService: SpotifyService) {
  }

  get artists(): FormArray {
    return this.playlistForm.get('artists') as FormArray;
  }

  buildArtist(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required]
    });
  }

  addArtist() {
    this.artists.push(this.buildArtist());
  }

  deleteArtist(index: number) {
    this.artists.removeAt(index);
  }

  save() {
    console.log(this.playlistForm);
  }

  autofill(e) {
    this.spotifyService.searchArtist(e).subscribe((val) => {
      console.log(val);
      this.searchResult = val.artists.items;
    });
  }

  ngOnInit(): void {
    this.playlistForm = this.fb.group({
      artists: this.fb.array([this.buildArtist()])
    });
    this.spotifyService.getRecentlyPlayed().subscribe((val) => {
      this.recentlyPlayed = val.items;
    });
  }

}
