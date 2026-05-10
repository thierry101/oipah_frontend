import { inject } from '@angular/core';
// angular import
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// project import
import { SpinnerComponent } from './theme/shared/components/spinner/spinner.component';
import { PublicService } from './services/public-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [RouterOutlet, SpinnerComponent]
})
export class AppComponent implements OnInit {
  // public props
  title = 'mantis-free-version';

  private publicService = inject(PublicService)

  ngOnInit(): void {
    this.publicService.getUser().subscribe();
  }
}
