import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { PlaylistService } from '../services/playlist.service';

@Injectable({
  providedIn: 'root'
})
export class PlaylistGuard implements CanActivate {
  constructor(private playlistService: PlaylistService,
              private router: Router) { }

  canActivate(): boolean {
    if (this.playlistService.albums.length === 0 && this.playlistService.artists.length === 0) {
      this.router.navigate(['home']);
      return false;
    }
    return true;
  }
  
}
