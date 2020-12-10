import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { PlaylistGeneratorPlaylistComponent } from './components/playlist-generator/playlist-generator-playlist/playlist-generator-playlist.component';
import { PlaylistGeneratorComponent } from './components/playlist-generator/playlist-generator/playlist-generator.component';
import { PostPlaylistComponent } from './components/post-playlist/post-playlist.component';
import { RoadTripPlaylistComponent } from './components/road-trip/road-trip-playlist/road-trip-playlist.component';
import { RoadTripComponent } from './components/road-trip/road-trip/road-trip.component';
import { AuthGuard } from './guards/auth.guard';
import { PlaylistGuard } from './guards/playlist.guard';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'roadtrip', component: RoadTripComponent, canActivate: [AuthGuard] },
  { path: 'roadtrip/playlist', component: RoadTripPlaylistComponent, canActivate: [AuthGuard, PlaylistGuard] },
  { path: 'final', component: PostPlaylistComponent, canActivate: [AuthGuard, PlaylistGuard] },
  { path: 'generator', component: PlaylistGeneratorComponent, canActivate: [AuthGuard] },
  { path: 'generator/playlist', component: PlaylistGeneratorPlaylistComponent, canActivate: [AuthGuard, PlaylistGuard] },
  { path: '', redirectTo: '/home', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
