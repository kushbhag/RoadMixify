import { Component, Input, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { SpotifyService } from 'src/app/services/spotify.service';

@Component({
  selector: 'app-road-trip-form',
  templateUrl: './road-trip-form.component.html',
  styleUrls: ['./road-trip-form.component.css']
})
export class RoadTripFormComponent implements OnInit {
  @Input() user: User;


  constructor(private spotifyService: SpotifyService) { }

  ngOnInit(): void {
    console.log(this.user);
  }

}
