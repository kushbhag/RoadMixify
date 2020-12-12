import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Track } from 'src/app/models/track.model';
import { PlaylistService } from 'src/app/services/playlist.service';
import { SpotifyService } from 'src/app/services/spotify.service';

@Component({
  selector: 'app-playlist-generator',
  templateUrl: './playlist-generator.component.html',
  styleUrls: ['./playlist-generator.component.css']
})
export class PlaylistGeneratorComponent implements OnInit {
  /* Playlist form for the tracks */
  playlistForm: FormGroup;

  /* Error message in case the user inputs too many tracks */
  errorMessage = '';

  searchResult = [];

  constructor(private fb: FormBuilder,
              private spotifyService: SpotifyService,
              public playlistService: PlaylistService,
              private router: Router) { }

  ngOnInit(): void {
    this.playlistForm = this.fb.group({
      track: ['']
    });
    this.playlistForm.get('track').valueChanges.subscribe((search) => {
      this.autofill(search, 'track');
    });
  }

  generate(): void {
    if (this.playlistService.tracks.length > 5) {
      this.errorMessage = 'Sorry, you can only input a maximum of 5 tracks';
    } else if (this.playlistService.tracks.length === 0) {
      this.errorMessage = 'Please input atleast one track';
    } else {
      this.router.navigate(['generator/playlist']);
    }
  }

  addTrack(track: Track): void {
    if (this.playlistService.tracks.find(t => t.name === track.name) === undefined) {
      this.playlistService.tracks.push(track);
    }
    this.playlistForm.controls['track'].setValue('');
  }

  removeTrack(index: number): void {
    this.playlistService.tracks.splice(index, 1);
  }

  autofill(searchField: string, searchColumn: string) {
    if (searchField === '') {
      this.searchResult = [];
    } else if (searchColumn === 'track') {
      this.spotifyService.searchTrack(searchField, 5).subscribe((val) => {
        this.searchResult = val.tracks.items;
      });
    }
  }

  reset(): void {
    this.playlistService.tracks = [];
  }

  setNumberOfSongs($event): void {
    this.playlistService.numOfTracks = $event.srcElement.value;
  }
}
