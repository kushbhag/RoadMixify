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

  /* The actual playlist form */
  playlistForm: FormGroup;

  /* Error message in case the user doesn't put proper duration */
  errorMessage = '';

  /* Contains the full list of ALL the albums/singles that an artist has */
  artistsAlbumFull = new Map<string, Album[]>();
  /* Contains the selected list of albums/singles that the user selected in advanced settings */
  artistsAlbum = new Map<string, Album[]>();
  /* Contains the actual list of user selected albums in the albums section of form */
  mixAlbums = new Array<PagingObject>();

  /* Are used when the user comes back to the form page, so that we can load up the artists
      and albums into the form. Mainly used for displaying on the form */
  artists: Artist[];
  albums: Album[];

  /* Search results when typing an artist in */
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

    /* Subscribe to the value change of the artist and album form fields so that
       I can have autofill whenever they type something */
    this.playlistForm.get('artists').valueChanges.subscribe((search) => {
      this.autofill(search, 'artist');
    });
    this.playlistForm.get('albums').valueChanges.subscribe((search) => {
      this.autofill(search, 'album');
    });

    /* Auto fill the form in case the user comes back to the form 
        this includes filling in data like mixAlbums, artistsAlbum and artistsAlbumFull
    */
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

  /* User adding artist to form */
  addArtist(artist: Artist) {
    if (artist !== undefined) {
      if (!this.artistsAlbumFull.has(artist.name)) {
        this.artists.push(artist);
        /* Get all of the artist's albums/singles and store the information */
        this.spotifyService.getArtistsAlbums(artist.id).subscribe(album => {
          this.artistsAlbumFull.set(artist.name, album.items);
          this.artistsAlbum.set(artist.name, album.items);
        });
      }
      this.playlistForm.controls['artists'].setValue('');
    }
  }

  /* User adding single album to form */
  addAlbum(album: Album) {
    if (album !== undefined) {
      /* Get the album's tracks */
      this.spotifyService.getAlbumTracks(album.id).subscribe(tracks => {
        this.mixAlbums.push(tracks);
      });
      this.albums.push(album);
      this.playlistForm.controls['albums'].setValue('');
    }
  }

  /* Self-explanatory removing artists/albums from form */
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
    /* Calculates the total duration of the road trip in ms */
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

    /* Stores the single values of the time in playlistService.timeDuration[i] */
    this.playlistService.timeDuration[0] = this.duration.controls['hours'].value;
    this.playlistService.timeDuration[1] = this.duration.controls['minutes'].value;
    this.playlistService.timeDuration[2] = this.duration.controls['seconds'].value;

    /* Setting explicit and public information */
    this.playlistService.explicit = this.playlistForm.controls['explicit'].value;
    this.playlistService.public = this.playlistForm.controls['public'].value;

    if (timeDuration === 0) {
      this.errorMessage = 'Duration cannot be 0';
    } else if (this.artists.length < 1 && this.albums.length < 1) {
      this.errorMessage = 'Add atleast one artist or album to continue';
    } else if (this.playlistForm.valid){
      /* Storing the values of the artists, albums, and totalDuration in playlistService */
      this.playlistService.artists = this.artists;
      this.playlistService.albums = this.albums;
      this.playlistService.totalDuration = timeDuration;

      /* Setting the artistAlbumMix to be an empty array in case something changed */
      this.playlistService.artistAlbumMix = [];

      /* This will parse through all the artist's albums/singles that we have set,
            while making sure it doesn't select any album that was deselected in the advanced settings */
      this.artistsAlbum.forEach((val, key, map) => {
        /* Separtating the albums from the singles to increase priority of albums */
        let onlyArtistAlbum = val.filter(alb => alb.album_group === 'album');
        let onlyArtistSingle = val.filter(alb => alb.album_group !== 'album');
        this.playlistService.artistAlbumMix.push(onlyArtistAlbum);
        this.playlistService.artistAlbumMix.push(onlyArtistSingle);
      });

      /* Adding the actual individual albums that the user added to artistAlbumMix */
      this.playlistService.artistAlbumMix.push(...this.mixAlbums.map(pobject => pobject.items));

      /* Place the information inside playlistService */
      this.playlistService.artistsAlbum = this.artistsAlbum;
      this.playlistService.artistsAlbumFull = this.artistsAlbumFull;
      this.playlistService.mixAlbums = this.mixAlbums;

      this.router.navigate(['playlist']);
    }
  }

  /* Reset form self-explanatory */
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

  /* Autofill the artist/album name by providing the user a list of potential matches */
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

  /* Within advanced settings, when a user selects/deselects an artist's album it will
      call this function to add/remove information from artistsAlbum */
  refreshMix($event, artist: string, album: string) {
    if ($event.currentTarget.checked === false) {
      let albums = this.artistsAlbum.get(artist);
      albums = albums.filter(alb => alb.name !== album)
      this.artistsAlbum.set(artist, albums);
    } else {
      this.artistsAlbum.get(artist).push(...this.artistsAlbumFull.get(artist).filter(albums => albums.name === album));
    }
  }

}
