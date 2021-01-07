import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { SpotifyService } from 'src/app/services/spotify.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  loggingIn = false;
  constructor(public spotifyService: SpotifyService) { }

  ngOnInit(): void {
    if (!this.spotifyService.loggedIn()) {
      this.getHashParams();
    }
  }

  getHashParams(): void{
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
    localStorage.removeItem('user');
    if (tempUser.access_token !== undefined) {
      localStorage.setItem('user', JSON.stringify(tempUser));
      this.spotifyService.user = tempUser;
    }
  }

  login(): void {
    this.loggingIn = true;
    window.location.href = 'https://road-mixify-server.herokuapp.com/login';
  }

}
