import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { SpotifyService } from './services/spotify.service';
import { RoadTripComponent } from './components/road-trip/road-trip/road-trip.component';
import { LoginComponent } from './components/login/login.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http'
import { ReactiveFormsModule } from '@angular/forms';
import { RoadTripPlaylistComponent } from './components/road-trip/road-trip-playlist/road-trip-playlist.component';
import { PlaylistService } from './services/playlist.service';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    RoadTripComponent,
    LoginComponent,
    RoadTripPlaylistComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [
    SpotifyService,
    PlaylistService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
