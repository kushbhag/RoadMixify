import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { SpotifyService } from 'src/app/services/spotify.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private spotifyService: SpotifyService) { }

  ngOnInit(): void {
    var users = this.spotifyService.getHashParams();
    this.spotifyService.user = users;
  }

}
