/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { SubmitSpinnerComponent } from "../../reusableComponents/submit-spinner/submit-spinner.component";
import { FormsModule } from '@angular/forms';
import { SetPaginationComponent } from "../../reusableComponents/set-pagination/set-pagination.component";
import { setPagination, showError, toastShow } from 'src/app/share/shared';
import { PublicService } from 'src/app/services/public-service';
import { countries } from 'src/app/share/countries';
import { SearchListComponent } from "../../reusableComponents/search-list/search-list.component";
import { OthersService } from 'src/app/services/others-service';


export interface Donor {
  id: number;
  name: string;
  type_donor: string;
  country: string;
  email: string;
  phone: string;
}

export interface Filiere {
  id: number;
  name: string;
  description: string;
}

interface Tab {
  key: string;
  label: string;
  icon: string;
  disabled: boolean;
}


@Component({
  selector: 'app-project-settings',
  imports: [CommonModule, SubmitSpinnerComponent, FormsModule, SetPaginationComponent, SearchListComponent],
  templateUrl: './project-settings.component.html',
  styleUrl: './project-settings.component.scss',
})


export class ProjectSettingsComponent implements OnInit {

  // ── Onglets ───────────────────────────────────────────────
  activeTab = 'donors';

  tabs: Tab[] = [
    {
      key: 'donors', label: 'Subventionneurs', disabled: false,
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
               <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
               <circle cx="9" cy="7" r="4"/>
               <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
             </svg>`
    },
    {
      key: 'filieres', label: 'Filières', disabled: false,
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
               <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
             </svg>`
    },
    {
      key: 'coming1', label: 'À venir', disabled: true,
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
               <circle cx="12" cy="12" r="10"/>
               <path d="M12 6v6l4 2"/>
             </svg>`
    },
    {
      key: 'coming2', label: 'À venir', disabled: true,
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
               <circle cx="12" cy="12" r="10"/>
               <path d="M12 6v6l4 2"/>
             </svg>`
    },
  ];

  // ── Données ───────────────────────────────────────────────
  donors: Donor[] = [];
  filieres: Filiere[] = [];

  donorPagination: any = null;
  pages: number[] = [];
  isLoading: boolean = false
  idDonor!: any

  // ── Recherche ─────────────────────────────────────────────
  donorSearch = '';
  filiereSearch = '';

  // ── Modals ────────────────────────────────────────────────
  showDonorModal = false;
  showFiliereModal = false;
  showDeleteModal = false;

  editingDonor: Donor | null = null;
  editingFiliere: Filiere | null = null;

  deleteTarget: { name: string } | null = null;
  private deleteType: 'donor' | 'filiere' | null = null;
  private deleteId = 0;

  isSaving = false;

  // ── Erreurs ───────────────────────────────────────────────
  errors: any = {};

  // ── Référentiels ──────────────────────────────────────────
  typesDonor = [
    { value: 'international', name: 'Organisation internationale' },
    { value: 'state', name: 'État / Gouvernement' },
    { value: 'ngo', name: 'ONG' },
    { value: 'private', name: 'Secteur privé' },
    { value: 'other', name: 'Autre' },
  ];

  countries: { value: string; name: string }[] = countries

  // ── Forms ─────────────────────────────────────────────────
  donorForm: Partial<Donor> = this.emptyDonorForm();
  filiereForm: Partial<Filiere> = this.emptyFiliereForm();

  private emptyDonorForm(): Partial<Donor> { return { name: '', type_donor: '', country: '', email: '', phone: '' }; }
  private emptyFiliereForm(): Partial<Filiere> { return { name: '', description: '' }; }

  private publicService = inject(PublicService)
  private othersService = inject(OthersService)

  // ── Init ──────────────────────────────────────────────────
  ngOnInit(): void {
    // Remplacer par appels API
    this.fetchDonors(1)
    this.othersService.getAgricultural().subscribe({
      next: (res: any) => {
        this.filieres = res?.result
      }
    })
  }


  fetchDonors(page: number = 1) { //instead of bind I can call arrow function like (page, term) => this.authService.getRegisterByAdmin(page, term)
    this.isLoading = true;
    setPagination(this.publicService.getDonors.bind(this.publicService), page, this.donorSearch, (data: any) => {
      this.donorPagination = data;
      this.donors = data?.listItems;
      this.isLoading = false;
      this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
    })
  }


  searchDonor(term: string) {
    this.donorSearch = term;
    this.fetchDonors(1);
  }


  onDonorPageChange(page: number): void {
    this.fetchDonors(page)
  }


  // ── Donor modal ───────────────────────────────────────────
  openDonorModal(donor?: Donor): void {
    this.editingDonor = donor || null;
    this.idDonor = donor?.id
    if (this.editingDonor) {
      this.donorForm = {
        name: donor?.name || '',
        country: donor?.country || '0',
        email: donor?.email || '',
        phone: donor?.phone || '',
        type_donor: donor?.type_donor || '0'
      }
    }
    this.errors = {};
    this.showDonorModal = true;
  }

  closeDonorModal(): void { this.showDonorModal = false; this.editingDonor = null; }


  saveDonor(): void {
    this.publicService.postDonor(this.donorForm).subscribe({
      next: () => {
        this.closeDonorModal();
        this.fetchDonors(1)
        toastShow('success', "Subventionneur créé")
      },
      error: (err) => {
        this.errors = err.error.errors || {};
        console.log(this.errors)
        this.isSaving = false
        showError(err, err.status, this.errors, err.error, document.getElementById('a'));
      }
    })
  }


  saveEditDonor() {
    this.publicService.putDonor(this.idDonor, this.donorForm).subscribe({
      next: () => {
        this.closeDonorModal();
        this.fetchDonors(1)
        toastShow('success', "Subventionneur mis à jour")
      },
      error: (err) => {
        this.errors = err.error.errors || {};
        this.isSaving = false
        showError(err, err.status, this.errors, err.error, document.getElementById('a'));
      }
    })
  }


  // ── Filiere modal ─────────────────────────────────────────
  openFiliereModal(filiere?: Filiere): void {
    this.editingFiliere = filiere ?? null;
    this.filiereForm = filiere ? { ...filiere } : this.emptyFiliereForm();
    this.errors = [];
    this.showFiliereModal = true;
  }

  closeFiliereModal(): void { this.showFiliereModal = false; this.editingFiliere = null; }


  saveFiliere(): void {
    this.othersService.postAgricultural(this.filiereForm).subscribe({
      next: (res: any) => {
        this.filieres.unshift(res?.result)
        this.closeFiliereModal();
        toastShow('success', 'Filière créée avec succès')

      },
      error: (err) => {
        this.errors = err.error.errors || {};
        this.isSaving = false
        showError(err, err.status, this.errors, err.error, document.getElementById('a'));
      }
    })

  }


  saveEditFiliere() {
    this.othersService.putAgricultural(this.filiereForm?.id, this.filiereForm).subscribe({
      next: (res: any) => {
        this.filieres = this.filieres.filter((e: any) => e.id !== this.filiereForm?.id);
        this.filieres.unshift(res?.result)
        this.closeFiliereModal();
        toastShow('success', 'Filière mis à jour avec succès')

      },
      error: (err) => {
        this.errors = err.error.errors || {};
        this.isSaving = false
        showError(err, err.status, this.errors, err.error, document.getElementById('a'));
      }
    })
  }


  // ── Delete modal ──────────────────────────────────────────
  confirmDeleteDonor(donor: Donor): void {
    this.deleteTarget = { name: donor.name };
    this.deleteType = 'donor';
    this.deleteId = donor.id;
    this.showDeleteModal = true;
  }

  confirmDeleteFiliere(filiere: Filiere): void {
    this.deleteTarget = { name: filiere.name };
    this.deleteType = 'filiere';
    this.deleteId = filiere.id;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void { this.showDeleteModal = false; this.deleteTarget = null; }


  confirmDelete(): void {
    if (this.deleteType === 'donor') {
      this.donors = this.donors.filter(d => d.id !== this.deleteId);

      this.publicService.deleteDonor(this.deleteId).subscribe({
        next: () => {
          this.fetchDonors(1)
          toastShow('success', "Subventionneur supprimé")
        },
        error: (err) => {
          this.errors = err.error.errors || {};
          this.isSaving = false
          showError(err, err.status, this.errors, err.error, document.getElementById('a'));
        }
      })
    } else if (this.deleteType === 'filiere') {
      this.othersService.deleteAgricultural(this.deleteId).subscribe({
        next: () => {
          this.filieres = this.filieres.filter((e: any) => e.id !== this.deleteId);
          this.closeFiliereModal();
          toastShow('success', 'Filière supprimée avec succès')

        },
        error: (err) => {
          this.errors = err.error.errors || {};
          this.isSaving = false
          showError(err, err.status, this.errors, err.error, document.getElementById('a'));
        }
      })
    }
    this.closeDeleteModal();
  }


  // ── Helpers ───────────────────────────────────────────────
  getDonorTypeName(type: string): string {
    return this.typesDonor.find(t => t.value === type)?.name ?? type;
  }

}
