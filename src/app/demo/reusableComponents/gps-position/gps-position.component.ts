import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';


export type GpsStatus = 'idle' | 'loading' | 'ok' | 'error';

@Component({
  selector: 'app-gps-position',
  imports: [CommonModule],
  templateUrl: './gps-position.component.html',
  styleUrl: './gps-position.component.scss',
})


export class GpsInputComponent implements OnInit {

  /** Valeur GPS actuelle (passée depuis le parent via ngModel ou binding) */
  @Input()  value  = '';

  /** Émet la nouvelle valeur GPS vers le parent */
  @Output() valueChange = new EventEmitter<string>();

  status:   GpsStatus = 'idle';
  errorMsg  = '';

  ngOnInit(): void {
    // Si une valeur est déjà fournie par le parent, afficher comme ok
    if (this.value?.trim()) {
      this.status = 'ok';
    }
  }

  detect(): void {
    if (!navigator.geolocation) {
      this.status   = 'error';
      this.errorMsg = 'La géolocalisation n\'est pas supportée par ce navigateur.';
      return;
    }

    this.status   = 'loading';
    this.errorMsg = '';

    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        const coords = `${lat}, ${lng}`;

        this.value  = coords;
        this.status = 'ok';
        this.valueChange.emit(coords);
      },
      (error: GeolocationPositionError) => {
        this.status = 'error';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            this.errorMsg = 'Permission refusée. Autorisez la localisation dans votre navigateur.';
            break;
          case error.POSITION_UNAVAILABLE:
            this.errorMsg = 'Position indisponible. Vérifiez votre connexion.';
            break;
          case error.TIMEOUT:
            this.errorMsg = 'Délai dépassé. Réessayez.';
            break;
          default:
            this.errorMsg = 'Erreur de géolocalisation. Réessayez.';
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }

  /** Permet au parent de réinitialiser le composant */
  reset(): void {
    this.value    = '';
    this.status   = 'idle';
    this.errorMsg = '';
    this.valueChange.emit('');
  }
}
