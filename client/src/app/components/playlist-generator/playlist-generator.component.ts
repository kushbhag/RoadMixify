import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
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

  searchResult = [];

  constructor(private fb: FormBuilder,
              private spotifyService: SpotifyService,
              public playlistService: PlaylistService) { }

  ngOnInit(): void {
    this.playlistForm = this.fb.group({
      track: ['']
    });
    this.playlistForm.get('track').valueChanges.subscribe((search) => {
      this.autofill(search, 'track');
    });
  }

  generate(): void {
    let ids = new Array<string> ();
    for (let track of this.playlistService.tracks) {
      ids.push(track.id);
    }
    this.spotifyService.getRecommendations(ids).subscribe(val => {
      console.log(val);
    });
  }

  addTrack(track: Track): void {
    this.playlistService.tracks.push(track);
  }

  removeTrack(index: number): void {
    this.playlistService.tracks.splice(index, 1);
  }

  autofill(searchField: string, searchColumn: string) {
    if (searchField === '') {
      this.searchResult = [];
    } else if (searchColumn === 'track') {
      this.spotifyService.searchTrack(searchField, 5).subscribe((val) => {
        console.log(val);
        this.searchResult = val.tracks.items;
      });
    }
  }

}
