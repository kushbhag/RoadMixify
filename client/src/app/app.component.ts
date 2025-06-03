import { Component } from '@angular/core';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [
    FooterComponent,
    HeaderComponent,
    RouterModule
  ]

})
export class AppComponent {
  
  constructor () {
  }

  title = 'client';
}
