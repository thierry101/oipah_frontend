/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SetPaginationComponent } from "../../reusableComponents/set-pagination/set-pagination.component";
import { PublicService } from 'src/app/services/public-service';
import { listDonors, setPagination, showError, toastShow } from 'src/app/share/shared';
import { SubmitSpinnerComponent } from "../../reusableComponents/submit-spinner/submit-spinner.component";
import { SelectedComponent } from "../../reusableComponents/selected/selected.component";
import { OthersService } from 'src/app/services/others-service';
import { MultiselectComponent } from '../../reusableComponents/multiselect/multiselect.component';
import { SearchListComponent } from "../../reusableComponents/search-list/search-list.component";


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
  imports: [CommonModule, FormsModule, SetPaginationComponent, SubmitSpinnerComponent, SelectedComponent, MultiselectComponent, SearchListComponent],
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
  donorsSelect: Donor[] = [];
  subsidies: Subsidy[] = [];
  idSubsidy!: any

  editingDonor: Donor | null = null;
  typesDonor: any = listDonors
  paginationSub: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };
  errors: any = []
  isSaving: boolean = false
  devise: string = ''
  // ── Propriétés de filtre ──────────────────────────────────
  subsidySearch = '';
  subsidyFilterStatus = '';
  subsidyDateFrom = '';
  subsidyDateTo = '';

  // ── Modal states ──────────────────────────────────────────
  showSubsidyModal = false;
  subsidyEditMode = false;

  // ── Forms ─────────────────────────────────────────────────
  subsidyForm: Partial<Subsidy> = this.emptySubsidyForm();


  private emptySubsidyForm(): Partial<Subsidy> {
    return {
      donorId: '', object: '', amount: 0, advanced_amnt: 0,
      status: 'received', received_date: '',
      reference: '', filiere: '', notes: ''
    };
  }


  ngOnInit(): void {
    // Remplacer par appel API
    this.allFilieres = this.publicService.allSectors
    this.fetchDonors(1)
    this.fetchSubsidies(1)
    this.publicService.getSettingOipah().subscribe({
      next: (res: any) => {
        this.devise = res?.devise
      }
    })
  }


  fetchSubsidies(page: number = 1) {
    this.isLoading = true;
    setPagination((page, term, statutLand, startDate, endDate) => this.otherService.getSubsidies(page, term, statutLand,
      startDate, endDate), page,
      this.subsidySearch,
      (data: any) => {
        this.paginationSub = data;
        this.subsidies = data?.listItems;
        this.isLoading = false;
      },

      this.subsidyDateFrom,
      this.subsidyDateTo,
      this.subsidyFilterStatus,
    );
  }


  filterByStatus() {
    this.fetchSubsidies(1);
  }


  searchSubsidies(term: string) {
    this.subsidySearch = term;
    this.fetchSubsidies(1);
  }


  filterByDate() {
    this.fetchSubsidies(1);
  }


  onPageChangeSubsidies(page: number): void {
    this.fetchSubsidies(page)
  }


  fetchDonors(page: number = 1) { //instead of bind I can call arrow function like (page, term) => this.authService.getRegisterByAdmin(page, term)
    this.isLoading = true;
    setPagination(this.publicService.getDonors.bind(this.publicService), page, this.searchTerm, (data: any) => {
      this.donorsSelect = data?.listItems;
      this.isLoading = false;
    })
  }


  searchDonor(term: string) {
    this.searchTerm = term;
    this.fetchDonors(1);
  }


  selectDonor(donor: any): void {
    if (!donor || !donor.id) return;
    this.searchTerm = donor?.name
    this.subsidyForm.donorId = donor?.id
    this.donorsSelect = []
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
      this.searchTerm = ''
    }

  }


  closeSubsidyModal(): void {
    this.showSubsidyModal = false;
  }


  saveSubsidy(): void {
    this.isSaving = true
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
    this.isSaving = true
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
  getStatusName(status: string): string {
    const map: Record<string, string> = {
      received: 'Reçu',
      pending: 'En attente',
      partial: 'Partiel'
    };
    return map[status] || status;
  }


  clearDonors() {
    this.donorsSelect = []
  }

}

