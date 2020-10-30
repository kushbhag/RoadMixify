import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { SpotifyService } from 'src/app/services/spotify.service';

@Component({
  selector: 'app-road-trip',
  templateUrl: './road-trip.component.html',
  styleUrls: ['./road-trip.component.css']
})
export class RoadTripComponent implements OnInit {

  user: User;

  constructor(private spotifyService: SpotifyService) {
    this.user = this.spotifyService.user;
  }

  ngOnInit(): void {
  }

}
