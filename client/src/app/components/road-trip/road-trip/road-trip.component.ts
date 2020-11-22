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

  /* Search results when typing an artist in */
  searchResultArtist: Artist[];
  searchResultAlbum: Album[];

  constructor(private fb: FormBuilder,
              public playlistService: PlaylistService,
              private spotifyService: SpotifyService,
              private router: Router) {
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

    this.playlistForm.controls['explicit'].setValue(this.playlistService.explicit);
    this.playlistForm.controls['public'].setValue(this.playlistService.public);
    this.duration.controls['hours'].setValue(this.playlistService.timeDuration[0]);
    this.duration.controls['minutes'].setValue(this.playlistService.timeDuration[1]);
    this.duration.controls['seconds'].setValue(this.playlistService.timeDuration[2]);
  }

  /* User adding artist to form */
  addArtist(artist: Artist) {
    if (artist !== undefined) {
      if (!this.playlistService.artistsAlbumFull.has(artist.name)) {
        this.playlistService.artists.push(artist);
        /* Get all of the artist's albums/singles and store the information */
        this.spotifyService.getArtistsAlbums(artist.id).subscribe(album => {
          this.playlistService.artistsAlbumFull.set(artist.name, album.items);
          this.playlistService.artistsAlbum.set(artist.name, album.items);
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
        this.playlistService.mixAlbums.push(tracks);
      });
      this.playlistService.albums.push(album);
      this.playlistForm.controls['albums'].setValue('');
    }
  }

  /* Self-explanatory removing artists/albums from form */
  removeArtist(index: number) {
    let del = this.playlistService.artists.splice(index, 1);
    this.playlistService.artistsAlbumFull.delete(del[0].name);
    this.playlistService.artistsAlbum.delete(del[0].name);
  }
  removeAlbum(index: number) {
    this.playlistService.albums.splice(index, 1);
    this.playlistService.mixAlbums.splice(index, 1);
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
    } else if (this.playlistService.artists.length < 1 && this.playlistService.albums.length < 1) {
      this.errorMessage = 'Add atleast one artist or album to continue';
    } else if (this.playlistForm.valid){
      /* Storing the values of the artists, albums, and totalDuration in playlistService */
      this.playlistService.artists = this.playlistService.artists;
      this.playlistService.albums = this.playlistService.albums;
      this.playlistService.totalDuration = timeDuration;

      /* Setting the artistAlbumMix to be an empty array in case something changed */
      this.playlistService.artistAlbumMix = [];

      /* This will parse through all the artist's albums/singles that we have set,
            while making sure it doesn't select any album that was deselected in the advanced settings */
      this.playlistService.artistsAlbum.forEach((val, key, map) => {
        /* Separtating the albums from the singles to increase priority of albums */
        let onlyArtistAlbum = val.filter(alb => alb.album_group === 'album');
        let onlyArtistSingle = val.filter(alb => alb.album_group !== 'album');
        this.playlistService.artistAlbumMix.push(onlyArtistAlbum);
        this.playlistService.artistAlbumMix.push(onlyArtistSingle);
      });

      /* Adding the actual individual albums that the user added to artistAlbumMix */
      this.playlistService.artistAlbumMix.push(...this.playlistService.mixAlbums.map(pobject => pobject.items));

      /* Place the information inside playlistService */
      this.playlistService.artistsAlbum = this.playlistService.artistsAlbum;
      this.playlistService.artistsAlbumFull = this.playlistService.artistsAlbumFull;

      this.router.navigate(['playlist']);
    }
  }

  /* Reset form self-explanatory */
  reset() {
    this.playlistService.artists = [];
    this.playlistService.albums = [];
    this.playlistService.artistsAlbum = new Map<string, Album[]>();
    this.playlistService.artistsAlbumFull = new Map<string, Album[]>();
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
      let albums = this.playlistService.artistsAlbum.get(artist);
      albums = albums.filter(alb => alb.name !== album)
      this.playlistService.artistsAlbum.set(artist, albums);
    } else {
      this.playlistService.artistsAlbum.get(artist).push(...this.playlistService.artistsAlbumFull.get(artist).filter(albums => albums.name === album));
    }
  }

  /* Is used for the advanced settings checkbox when a user comes back to the form.
        It will check if the album was selected or not */
  selected(artist: string, album: string) {
    let albs = this.playlistService.artistsAlbum.get(artist);
    return albs.find(a => a.name === album) ? true : false;
  }

  /* Select/Deselect all the artist's albums in the advanced section */
  selectAll(artist: string) {
    this.playlistService.artistsAlbum.set(artist, this.playlistService.artistsAlbumFull.get(artist));
  }
  deSelectAll(artist: string) {
    this.playlistService.artistsAlbum.set(artist, this.playlistService.artistsAlbumFull.get(artist).filter(a => a.album_group === 'single'));
  }
}
