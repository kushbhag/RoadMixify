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
import { AuthGuard } from './guards/auth.guard';
import { NgxPaginationModule } from 'ngx-pagination';
import { PostPlaylistComponent } from './components/post-playlist/post-playlist.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    RoadTripComponent,
    LoginComponent,
    RoadTripPlaylistComponent,
    PostPlaylistComponent,
    HeaderComponent,
    FooterComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgxPaginationModule
  ],
  providers: [
    SpotifyService,
    PlaylistService,
    AuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
