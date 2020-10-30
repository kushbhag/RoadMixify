import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {
  user: User;

  constructor() {
    console.log('New Instance Created');
  }

  getHashParams() {
    var tempUser = new User();
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
      if (e[1] === 'access_token') {
        tempUser.access_token = decodeURIComponent(e[2]);
      } else if (e[1] === 'refresh_token') {
        tempUser.refresh_token = decodeURIComponent(e[2]);
      }
    }
    return tempUser;
  }
}
