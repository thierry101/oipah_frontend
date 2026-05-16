/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SetPaginationComponent } from "../../reusableComponents/set-pagination/set-pagination.component";
import { PublicService } from 'src/app/services/public-service';
import { listDonors, setPagination, showError, toastShow } from 'src/app/share/shared';
import { countries } from '../../../share/countries'
import { SubmitSpinnerComponent } from "../../reusableComponents/submit-spinner/submit-spinner.component";
import { SelectedComponent } from "../../reusableComponents/selected/selected.component";
import { OthersService } from 'src/app/services/others-service';
import { MultiselectComponent } from '../../reusableComponents/multiselect/multiselect.component';


export interface Donor {
  id: number;
  name: string;
  type_donor: string;
  country: string;
  email: string;
  phone: string;
}

export interface Subsidy {
  id: number;
  donorId: any;
  grantor: any;
  object: string;
  amount: number;
  advanced_amnt: number;
  status: 'received' | 'pending' | 'partial';
  received_date: string;
  reference: string;
  filiere: any;
  notes: string;
}


@Component({
  selector: 'app-grantors',
  imports: [CommonModule, FormsModule, SetPaginationComponent, SubmitSpinnerComponent, SelectedComponent, MultiselectComponent],
  templateUrl: './grantors.component.html',
  styleUrl: './grantors.component.scss',
})
export class GrantorsComponent implements OnInit {

  private publicService = inject(PublicService)
  private otherService = inject(OthersService)
  allFilieres!: any


  // ── Data ──────────────────────────────────────────────────
  searchTerm: string = ''
  isLoading: boolean = false
  donors: Donor[] = [];
  subsidies: Subsidy[] = [];
  idDonor!: any
  idSubsidy!: any

  selectedDonor: Donor | null = null;
  editingDonor: Donor | null = null;
  typesDonor: any = listDonors
  pagination: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };
  pages: number[] = [];
  paginationSub: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };
  pagesSub: number[] = [];
  errors: any = []
  isSaving: boolean = false
  countries!: any
  devise: string = ''
  // ── Propriétés de filtre ──────────────────────────────────
  subsidySearch = '';
  subsidyFilterStatus = '';
  subsidyDateFrom = '';
  subsidyDateTo = '';

  // ── Modal states ──────────────────────────────────────────
  showDonorModal = false;
  showSubsidyModal = false;
  subsidyEditMode = false;

  // ── Forms ─────────────────────────────────────────────────
  donorForm: Partial<Donor> = this.emptyDonorForm();
  subsidyForm: Partial<Subsidy> = this.emptySubsidyForm();

  private emptyDonorForm(): Partial<Donor> {
    return { name: '', type_donor: '0', country: '0', email: '', phone: '' };
  }

  private emptySubsidyForm(): Partial<Subsidy> {
    return {
      donorId: '', object: '', amount: 0, advanced_amnt: 0,
      status: 'received', received_date: '',
      reference: '', filiere: '', notes: ''
    };
  }


  // ── Détecte si un filtre est actif ────────────────────────
hasActiveFilters(): boolean {
  return !!(
    this.subsidySearch       ||
    this.subsidyFilterStatus ||
    this.subsidyDateFrom     ||
    this.subsidyDateTo
  );
}

  ngOnInit(): void {
    // Remplacer par appel API
    this.allFilieres = this.publicService.allSectors
    this.fetchDonors(1)
    this.countries = countries
    this.fetchSubsidies(1)
    this.publicService.getSettingOipah().subscribe({
      next: (res: any) => {
        this.devise = res?.devise
      }
    })
  }

  // ── Computed ──────────────────────────────────────────────
  get totalAmount(): number {
    return this.subsidies
      .filter(s => s.status === 'received' || s.status === 'partial')
      .reduce((acc, s) => acc + s.amount, 0);
  }

  get pendingCount(): number {
    return this.subsidies.filter(s => s.status === 'pending').length;
  }


  fetchSubsidies(page: number = 1) { //instead of bind I can call arrow function like (page, term) => this.authService.getRegisterByAdmin(page, term)
    this.isLoading = true;
    setPagination(this.otherService.getSubsidies.bind(this.otherService), page, this.searchTerm, (data: any) => {
      this.paginationSub = data;
      console.log(data)
      this.subsidies = data?.listItems;
      this.isLoading = false;
      this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
    },
      // this.filterStatus
    )
  }


  onPageChangeSubsidies(page: number): void {
    this.fetchSubsidies(page)
  }


  onSubsidyFilterChange(): void {
  // Option A — Filtrage côté serveur (recommandé avec pagination)
  // this.loadSubsidies({ page: 1, ...this.getFilterParams() });

  // Option B — Filtrage côté client (si toutes les données sont chargées)
  // Rien à faire ici, filteredSubsidies() est appelé dans le template
}


// ── Réinitialiser tous les filtres ────────────────────────
resetSubsidyFilters(): void {
  this.subsidySearch       = '';
  this.subsidyFilterStatus = '';
  this.subsidyDateFrom     = '';
  this.subsidyDateTo       = '';
  this.onSubsidyFilterChange();
}

  // ── Donor modal ───────────────────────────────────────────
  openDonorModal(donor?: Donor): void {
    this.editingDonor = donor || null;
    if (this.editingDonor) {
      this.idDonor = donor?.id
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

  closeDonorModal(): void {
    this.showDonorModal = false;
    this.editingDonor = null;
    this.errors = {};
  }


  fetchDonors(page: number = 1) { //instead of bind I can call arrow function like (page, term) => this.authService.getRegisterByAdmin(page, term)
    this.isLoading = true;
    setPagination(this.publicService.getDonors.bind(this.publicService), page, this.searchTerm, (data: any) => {
      this.pagination = data;
      this.donors = data?.listItems;
      this.isLoading = false;
      this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
    })
  }


  onPageChange(page: number): void {
    this.fetchDonors(page)
  }


  searchDonor(term: string) {
    this.searchTerm = term;
    this.fetchDonors(1); // or whatever logic you use
  }


  selectDonor(donor: any): void {
    if (!donor || !donor.id) return;
    this.searchTerm = donor?.name
    this.subsidyForm.donorId = donor?.id
    this.donors = []
  }


  saveDonor(): void {
    this.publicService.postDonor(this.donorForm).subscribe({
      next: () => {
        this.closeDonorModal();
        this.fetchDonors(1)
        toastShow('success', "Subventionneur créé")
      },
      error: (err) => {
        this.errors = err.error.errors || {};
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


  getDonorType(value: string): string {
    return this.typesDonor.find((item: any) => item?.value === value)?.name;
  }


  deleteDonor(donor: Donor): void {
    this.publicService.deleteDonor(donor?.id).subscribe({
      next: () => {
        this.donors = this.donors.filter(d => d.id !== donor.id);
        if (this.selectedDonor?.id === donor.id) this.selectedDonor = null;
        toastShow('success', "Subventionneur supprimé")
      },
      error: (err) => {
        this.errors = err.error.errors || {};
        this.isSaving = false
        showError(err, err.status, this.errors, err.error, document.getElementById('a'));
      }
    })
  }


  // ── Subsidy modal ─────────────────────────────────────────
  openSubsidyModal(subsidy?: Subsidy): void {
    this.showSubsidyModal = true;
    this.subsidyEditMode = !!subsidy;
    this.errors = []
    if (this.subsidyEditMode) {
      this.idSubsidy = subsidy?.id
      this.searchTerm = subsidy?.grantor?.name
      const idsSubsidies = subsidy?.filiere.map((item: any) => item.id);
      this.subsidyForm = {
        donorId: subsidy?.grantor?.id,
        object: subsidy?.object,
        amount: subsidy?.amount,
        advanced_amnt: subsidy?.advanced_amnt,
        status: subsidy?.status,
        received_date: subsidy?.received_date,
        reference: subsidy?.reference,
        filiere: idsSubsidies,
        notes: subsidy?.notes
      }
    } else {
      this.subsidyForm = this.emptySubsidyForm();
      this.donors = []
      this.searchTerm = ''
    }

  }


  closeSubsidyModal(): void {
    this.showSubsidyModal = false;
  }


  saveSubsidy(): void {
    this.otherService.postSubsidy(this.subsidyForm).subscribe({
      next: () => {
        this.isSaving = false
        this.fetchSubsidies(1)
        toastShow('success', "Subvention enregistré avec succès")
        this.closeSubsidyModal();
      },
      error: (err) => {
        this.errors = err.error.errors || {};
        console.log(this.errors)
        this.isSaving = false
        showError(err, err.status, this.errors, err.error, document.getElementById('a'));
      }
    })
  }


  saveEditSubsidy() {
    this.otherService.putSubsidy(this.idSubsidy, this.subsidyForm).subscribe({
      next: () => {
        this.isSaving = false
        this.fetchSubsidies(1)
        toastShow('success', "Subvention mise à jou")
        this.closeSubsidyModal();
      },
      error: (err) => {
        this.errors = err.error.errors || {};
        this.isSaving = false
        showError(err, err.status, this.errors, err.error, document.getElementById('a'));
      }
    })
  }


  deleteSubsidy(subsidy: Subsidy): void {
    this.subsidies = this.subsidies.filter(s => s.id !== subsidy.id);
  }

  // ── Helpers ───────────────────────────────────────────────
  getDonorById(id: number): Donor | undefined {
    return this.donors.find(d => d.id === id);
  }


  getStatusName(status: string): string {
    const map: Record<string, string> = {
      received: 'Reçu',
      pending: 'En attente',
      partial: 'Partiel'
    };
    return map[status] || status;
  }


  clearDonors() {
    this.donors = []
  }

}

