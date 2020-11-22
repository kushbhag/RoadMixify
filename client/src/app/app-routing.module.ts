import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { PostPlaylistComponent } from './components/post-playlist/post-playlist.component';
import { RoadTripPlaylistComponent } from './components/road-trip/road-trip-playlist/road-trip-playlist.component';
import { RoadTripComponent } from './components/road-trip/road-trip/road-trip.component';
import { AuthGuard } from './guards/auth.guard';
import { PlaylistGuard } from './guards/playlist.guard';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'roadtrip', component: RoadTripComponent, canActivate: [AuthGuard] },
  { path: 'playlist', component: RoadTripPlaylistComponent, canActivate: [AuthGuard, PlaylistGuard] },
  { path: 'final', component: PostPlaylistComponent, canActivate: [AuthGuard, PlaylistGuard] },
  { path: '', redirectTo: '/home', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
