/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SetPaginationComponent } from "../../reusableComponents/set-pagination/set-pagination.component";
import { PublicService } from 'src/app/services/public-service';
import { listDonors, setPagination, showError, toastShow } from 'src/app/share/shared';
import { countries } from '../../../share/countries'


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
  donorId: number;
  object: string;
  amount: number;
  status: 'received' | 'pending' | 'partial';
  receivedDate: string;
  expiryDate: string;
  reference: string;
  filiere: string;
  notes: string;
}


@Component({
  selector: 'app-grantors',
  imports: [CommonModule, FormsModule, SetPaginationComponent],
  templateUrl: './grantors.component.html',
  styleUrl: './grantors.component.scss',
})
export class GrantorsComponent implements OnInit {

  private publicService = inject(PublicService)

  // ── Data ──────────────────────────────────────────────────
  searchTerm: string = ''
  isLoading: boolean = false
  donors: Donor[] = [];
  subsidies: Subsidy[] = [];

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
  errors: any = []
  isSaving: boolean = false
  countries!: any

  // ── Modal states ──────────────────────────────────────────
  showDonorModal = false;
  showSubsidyModal = false;
  subsidyEditMode = false;

  // ── Errors ────────────────────────────────────────────────
  subsidyErrors: any = {};

  // ── Forms ─────────────────────────────────────────────────
  donorForm: Partial<Donor> = this.emptyDonorForm();
  subsidyForm: Partial<Subsidy> = this.emptySubsidyForm();

  private emptyDonorForm(): Partial<Donor> {
    return { name: '', type_donor: '', country: '', email: '', phone: '' };
  }

  private emptySubsidyForm(): Partial<Subsidy> {
    return {
      donorId: undefined, object: '', amount: 0,
      status: 'received', receivedDate: '', expiryDate: '',
      reference: '', filiere: '', notes: ''
    };
  }

  ngOnInit(): void {
    // Remplacer par appel API
    this.fetchDonors(1)
    this.countries = countries
    this.subsidies = [
      { id: 1, donorId: 1, object: 'Financement campagne manioc 2025', amount: 15000000, status: 'received', receivedDate: '2025-01-15', expiryDate: '2025-12-31', reference: 'WB-2025-001', filiere: 'Manioc', notes: '' },
      { id: 2, donorId: 2, object: 'Programme maraîchage durable', amount: 8500000, status: 'partial', receivedDate: '2025-02-10', expiryDate: '2026-02-10', reference: 'EU-2025-042', filiere: 'Maraîchère', notes: 'Tranche 1/2 reçue' },
      { id: 3, donorId: 3, object: 'Appui développement aquaculture', amount: 5000000, status: 'pending', receivedDate: '', expiryDate: '', reference: 'CI-2025-003', filiere: 'Aquacole', notes: '' },
    ];
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

  // ── Donor modal ───────────────────────────────────────────
  openDonorModal(donor?: Donor): void {
    this.editingDonor = donor || null;
    this.donorForm = donor ? { ...donor } : this.emptyDonorForm();
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
      console.log("the data is ", data)
      this.donors = data?.listItems;
      console.log(this.donors)
      this.isLoading = false;
      this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
    })
  }


  onPageChange(page: number): void {
    this.fetchDonors(page)
  }


  saveDonor(): void {
    this.errors = {};

    this.publicService.postDonor(this.donorForm).subscribe({
      next: (res: any) => {
        console.log(res)
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


  getDonorType(value: string): string {
    return this.typesDonor.find((item: any) => item?.value === value)?.name;
  }


  deleteDonor(donor: Donor): void {
    this.donors = this.donors.filter(d => d.id !== donor.id);
    if (this.selectedDonor?.id === donor.id) this.selectedDonor = null;
  }

  // ── Subsidy modal ─────────────────────────────────────────
  openSubsidyModal(subsidy?: Subsidy): void {
    this.subsidyEditMode = !!subsidy;
    this.subsidyForm = subsidy ? { ...subsidy } : this.emptySubsidyForm();
    this.subsidyErrors = {};
    this.showSubsidyModal = true;
  }

  closeSubsidyModal(): void {
    this.showSubsidyModal = false;
    this.subsidyErrors = {};
  }

  saveSubsidy(): void {
    this.subsidyErrors = {};

    if (!this.subsidyForm.donorId) {
      this.subsidyErrors.donorId = 'Sélectionnez un subventionneur.'; return;
    }
    if (!this.subsidyForm.object?.trim()) {
      this.subsidyErrors.object = "L'objet est obligatoire."; return;
    }
    if (!this.subsidyForm.amount || this.subsidyForm.amount <= 0) {
      this.subsidyErrors.amount = 'Le montant doit être supérieur à 0.'; return;
    }
    if (!this.subsidyForm.receivedDate && this.subsidyForm.status === 'received') {
      this.subsidyErrors.receivedDate = 'La date de réception est obligatoire.'; return;
    }

    if (this.subsidyEditMode) {
      const idx = this.subsidies.findIndex(s => s.id === (this.subsidyForm as Subsidy).id);
      if (idx !== -1) this.subsidies[idx] = { ...this.subsidies[idx], ...this.subsidyForm } as Subsidy;
    } else {
      const id = Math.max(0, ...this.subsidies.map(s => s.id)) + 1;
      this.subsidies = [...this.subsidies, { id, ...this.subsidyForm } as Subsidy];
    }

    this.closeSubsidyModal();
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

}
