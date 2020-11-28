import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { SpotifyService } from './services/spotify.service';
import { RoadTripComponent } from './components/road-trip/road-trip/road-trip.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'
import { ReactiveFormsModule } from '@angular/forms';
import { RoadTripPlaylistComponent } from './components/road-trip/road-trip-playlist/road-trip-playlist.component';
import { PlaylistService } from './services/playlist.service';
import { AuthGuard } from './guards/auth.guard';
import { NgxPaginationModule } from 'ngx-pagination';
import { PostPlaylistComponent } from './components/post-playlist/post-playlist.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { CacheInterceptor } from './interceptors/cache.interceptor';
import { CacheService } from './services/cache.service';
import { AlbumOnlyPipe } from './pipe/albums.pipe';
import { WelcomeComponent } from './components/home/welcome/welcome.component';
import { SortDirective } from './directives/sort.directive';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    RoadTripComponent,
    RoadTripPlaylistComponent,
    PostPlaylistComponent,
    HeaderComponent,
    FooterComponent,
    AlbumOnlyPipe,
    WelcomeComponent,
    SortDirective
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
    CacheService,
    AuthGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CacheInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
