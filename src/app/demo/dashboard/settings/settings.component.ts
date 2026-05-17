/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, ElementRef, ViewChild, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PublicService } from 'src/app/services/public-service';
import { showError, toastShow } from 'src/app/share/shared';
import { SubmitSpinnerComponent } from "../../reusableComponents/submit-spinner/submit-spinner.component";
import { environment } from 'src/environments/environment.prod';
import { OthersService } from 'src/app/services/others-service';

export interface OipahAttribute {
  name: string;
  rccm: string;
  niu: string;
  country: string;
  city: string;
  email: string;
  phone: string;
  devise: string;
  itemNber: number;
  logo: string | null;
  updated: Date;
}

interface NavTab {
  key: string;
  label: string;
  icon: string; // SVG string
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, SubmitSpinnerComponent],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  private publicService = inject(PublicService)
  private othersService = inject(OthersService)

  @ViewChild('logoInput') logoInput!: ElementRef<HTMLInputElement>;

  activeTab = 'identity';
  isSaving = false;
  showToast = false;
  toastError = false;
  toastMessage = '';
  logoPreview: string | null = null;
  errors: any = []


  // ── Navigation tabs ───────────────────────────────────────
  tabs: NavTab[] = [
    {
      key: 'identity',
      label: 'Identité',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M8 12h.01M12 12h.01M16 12h.01"/>
            </svg>`
    },
    {
      key: 'contact',
      label: 'Coordonnées',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>`
    },
    {
      key: 'preferences',
      label: 'Préférences',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="6"  x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>`
    }
    // Ajouter d'autres onglets ici selon les besoins
  ];

  // ── Form model ────────────────────────────────────────────
  form: OipahAttribute = this.defaultForm();
  private _original!: OipahAttribute;

  // ── Filières ──
  editingIndex: number | null = null;


  ngOnInit(): void {
    this.publicService.getSettingOipah().subscribe({
      next: (res: any) => {
        this.form = {
          name: res?.name || '',
          rccm: res?.rccm || '',
          niu: res?.niu || '',
          country: res?.country || '',
          city: res?.city || '',
          email: res?.email || '',
          phone: res?.phone || '',
          devise: res?.devise || 'XOF',
          itemNber: res?.itemNber || 15,
          logo: environment.siteUrlMedia + res?.logo || null,
          updated: new Date('2025-03-12T10:30:00')
        };
        this._original = { ...this.form };
      }
    })
  }

  private defaultForm(): OipahAttribute {
    return {
      name: '',
      rccm: '',
      niu: '',
      country: '',
      city: '',
      email: '',
      phone: '',
      devise: 'XOF',
      itemNber: 15,
      logo: null,
      updated: new Date()
    };
  }

  // ── Logo ──────────────────────────────────────────────────
  triggerLogoUpload(): void {
    this.logoInput.nativeElement.click();
  }

  onLogoChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      this.showNotification('Le fichier dépasse la taille maximale de 20 Mo.', true);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.logoPreview = e.target?.result as string;
      const data = {
        checker: 'logo',
        image: e.target?.result
      }
      this.publicService.putSettingOipah(data).subscribe({
        next: () => {
          toastShow("success", "logo mis à jour")
          this.errors = []
        },
        error: (err) => {
          this.errors = err.error.errors || {};
          this.isSaving = false
          showError(err, err.status, this.errors, err.error, document.getElementById('a'));
        }
      })
    };
    reader.readAsDataURL(file);
  }


  // ── Save ──────────────────────────────────────────────────
  saveSettingsIdentity() {
    const data = {
      checker: 'identity',
      oipah: this.form?.name,
      rccm: this.form?.rccm,
      niu: this.form?.niu,
    }
    this.publicService.putSettingOipah(data).subscribe({
      next: () => {
        toastShow("success", "Paramètres mis à jour")
        this.errors = []
      },
      error: (err) => {
        this.errors = err.error.errors || {};
        this.isSaving = false
        showError(err, err.status, this.errors, err.error, document.getElementById('a'));
      }
    })
  }


  saveSettingsContact() {
    const data = {
      checker: 'contact',
      country: this.form?.country,
      city: this.form?.city,
      email: this.form?.email,
      phone: this.form?.phone,
    }
    this.publicService.putSettingOipah(data).subscribe({
      next: () => {
        toastShow("success", "Paramètres mis à jour")
        this.errors = []
      },
      error: (err) => {
        this.errors = err.error.errors || {};
        this.isSaving = false
        showError(err, err.status, this.errors, err.error, document.getElementById('a'));
      }
    })
  }


  saveSettingsPreference() {
    const data = {
      checker: 'preference',
      devise: this.form?.devise,
      itemPerPage: this.form?.itemNber
    }
    this.publicService.putSettingOipah(data).subscribe({
      next: () => {
        toastShow("success", "Paramètres mis à jour")
        this.errors = []
      },
      error: (err) => {
        this.errors = err.error.errors || {};
        this.isSaving = false
        showError(err, err.status, this.errors, err.error, document.getElementById('a'));
      }
    })
  }


  // ── Toast ─────────────────────────────────────────────────
  private toastTimer: any;

  showNotification(message: string, isError = false): void {
    this.toastMessage = message;
    this.toastError = isError;
    this.showToast = true;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { this.showToast = false; }, 3500);
  }
}
