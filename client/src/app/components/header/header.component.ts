import { Component, OnInit } from '@angular/core';
import { SpotifyService } from 'src/app/services/spotify.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  imports: [
    RouterModule,
  ]
 })
export class HeaderComponent implements OnInit {

  constructor(public spotifyService: SpotifyService) { }

  ngOnInit(): void {
  }

}
