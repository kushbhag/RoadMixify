import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { SpotifyService } from '../services/spotify.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private spotifyService: SpotifyService,
              private router: Router) { }

  canActivate(): boolean {
    if (this.spotifyService.loggedIn()) {
      return true;
    } else {
      // window.location.href = 'https://road-mixify-server.herokuapp.com/login';
      this.router.navigate(['/home']);
      return false;
    }
  }


}
