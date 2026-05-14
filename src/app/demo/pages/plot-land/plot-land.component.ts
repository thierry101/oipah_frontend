/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SetPaginationComponent } from "../../reusableComponents/set-pagination/set-pagination.component";
import { PublicService } from 'src/app/services/public-service';
import { GpsInputComponent } from "../../reusableComponents/gps-position/gps-position.component";
import { departmentCI } from 'src/app/share/departments_ci';
import { SelectedComponent } from "../../reusableComponents/selected/selected.component";
import { setPagination, showError, toastShow } from 'src/app/share/shared';
import { AuthService } from 'src/app/services/auth-service';
import { OthersService } from 'src/app/services/others-service';
import { SearchListComponent } from "../../reusableComponents/search-list/search-list.component";
import { SubmitSpinnerComponent } from "../../reusableComponents/submit-spinner/submit-spinner.component";

export interface Parcelle {
  id: number;
  owner_land: any;
  ownerContact: string;
  department: string;
  sub_prefecture: string;
  quater: string;
  gps: string;
  area: number;
  filiere: any;
  type_ground: string;
  source_water: string;
  land_ownership: string;
  acd_number: string;
  dateAcquisition: string;
  statut_land: 'active' | 'inactive' | 'litige';
  description: string;
}

@Component({
  selector: 'app-plot-land',
  imports: [CommonModule, FormsModule, SetPaginationComponent, GpsInputComponent, SelectedComponent, SearchListComponent, SubmitSpinnerComponent],
  templateUrl: './plot-land.component.html',
  styleUrl: './plot-land.component.scss',
})
export class PlotLandComponent implements OnInit {

  private publicService = inject(PublicService)
  private authService = inject(AuthService)
  private othersService = inject(OthersService)

  allFilieres!: any
  listUsers!: any
  // 2. Propriétés
  departements = departmentCI;
  sousPrefectures: string[] = [];
  role!: string
  searchTermOwner: string = ''
  isSaving: boolean = false
  isLoading: boolean = false
  pages: number[] = [];
  idParcelle!: any

  // ── Data ──────────────────────────────────────────────────
  parcelles: Parcelle[] = [];
  pagination: any = null;

  // ── UI state ──────────────────────────────────────────────
  showModal = false;
  showDetailModal = false;
  showDeleteModal = false;
  editMode = false;

  searchTerm = '';
  filterStatus = '';

  selectedItem: Parcelle | null = null;
  errors: any = {};

  // ── Form ──────────────────────────────────────────────────
  form: Partial<Parcelle> = this.emptyForm();

  private emptyForm(): Partial<Parcelle> {
    return {
      owner_land: null, ownerContact: '',
      department: '', sub_prefecture: '', quater: '', gps: '',
      area: 0, filiere: '', type_ground: '', source_water: '',
      land_ownership: '', acd_number: '', dateAcquisition: '',
      statut_land: 'active', description: ''
    };
  }

  ngOnInit(): void {
    this.fetchPlotLands(1)
    this.publicService.user$
      .subscribe(user => {
        if (user) {
          this.role = user?.role
        }
      });
  }


  onDepartementChange(value: string): void {
    // this.form.sousPrefecture = '';
    this.sousPrefectures = departmentCI.find(d => d.value === value)?.subPrefectures ?? [];
  }


  fetchUsers(page: number = 1) { //instead of bind I can call arrow function like (page, term) => this.authService.getRegisterByAdmin(page, term)
    // this.isLoading = true;
    setPagination(this.authService.getUsers.bind(this.authService), page, this.searchTermOwner, (data: any) => {
      this.pagination = data;
      this.listUsers = data?.listItems;
      // this.isLoading = false;
    })
  }


  searchUser(term: string) {
    this.searchTermOwner = term;
    this.fetchUsers(1); // or whatever logic you use
  }


  fetchPlotLands(page: number = 1) { //instead of bind I can call arrow function like (page, term) => this.authService.getRegisterByAdmin(page, term)
    this.isLoading = true;
    setPagination(this.othersService.getLands.bind(this.othersService), page, this.searchTerm, (data: any) => {
      this.pagination = data;
      this.parcelles = data?.listItems;
      this.isLoading = false;
      this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
    },
      this.filterStatus
    )
  }


  onSearchPloat(term: string) {
    this.searchTerm = term;
    this.fetchPlotLands(1)
  }


  filterPloat() {
    this.fetchPlotLands(1)
  }


  onPageChange(page: number): void {
    this.fetchPlotLands(page)
  }


  selectProduct(user: any): void {
    if (!user || !user.id) return;
    this.searchTermOwner = user?.name + ' ' + user?.surname
    this.form.ownerContact = user?.phone
    this.form.owner_land = user?.id
    this.listUsers = []
  }


  // ── Modal : Enregistrement ────────────────────────────────
  openModal(parcelle?: Parcelle): void {
    this.editMode = !!parcelle;
    this.allFilieres = this.publicService.allSectors
    if (this.editMode) {
      this.idParcelle = parcelle?.id
      this.searchTermOwner = parcelle?.owner_land?.name
      this.onDepartementChange(parcelle?.department || '')
      this.form = {
        // owner_land: any,
        owner_land: parcelle?.owner_land?.id,
        ownerContact: parcelle?.owner_land?.phone,
        department: parcelle?.department,
        sub_prefecture: parcelle?.sub_prefecture,
        quater: parcelle?.quater,
        gps: parcelle?.gps,
        area: parcelle?.area,
        filiere: parcelle?.filiere?.id,
        type_ground: parcelle?.type_ground,
        source_water: parcelle?.source_water,
        land_ownership: parcelle?.land_ownership,
        acd_number: parcelle?.acd_number,
        dateAcquisition: '',
        statut_land: parcelle?.statut_land,
        description: parcelle?.description,
      }
    }
    else {
      this.form = parcelle ? { ...parcelle } : this.emptyForm();
    }

    this.listUsers = []
    this.errors = {};
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.errors = {};
    this.sousPrefectures = [];
    this.form.sub_prefecture = '';
  }

  saveParcelle(): void {
    this.isSaving = true
    this.othersService.postLand(this.form).subscribe({
      next: () => {
        this.isSaving = false
        this.fetchPlotLands(1)
        toastShow('success', "Parcelle créée avec succès")
        this.closeModal();
      },
      error: (err) => {
        this.errors = err.error.errors || {};
        this.isSaving = false
        showError(err, err.status, this.errors, err.error, document.getElementById('a'));
      }
    })
  }


  saveEditParcelle() {
    this.isSaving = true
    console.log(this.form)
    this.othersService.putLand(this.idParcelle, this.form).subscribe({
      next: () => {
        this.isSaving = false
        this.fetchPlotLands(1)
        toastShow('success', "Parcelle mise à jour avec succès")
        this.closeModal();
      },
      error: (err) => {
        this.errors = err.error.errors || {};
        this.isSaving = false
        showError(err, err.status, this.errors, err.error, document.getElementById('a'));
      }
    })
  }

  // ── Modal : Détail ────────────────────────────────────────
  openDetailModal(parcelle: Parcelle): void {
    this.selectedItem = parcelle;
    this.showDetailModal = true;
  }

  closeDetailModal(): void { this.showDetailModal = false; }

  // ── Modal : Suppression ───────────────────────────────────
  confirmDelete(parcelle: Parcelle): void {
    this.selectedItem = parcelle;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void { this.showDeleteModal = false; }

  deleteParcelle(): void {
    if (!this.selectedItem) return;
    this.othersService.deleteLand(this.selectedItem?.id).subscribe({
      next: () => {
        this.parcelles = this.parcelles.filter(p => p.id !== this.selectedItem!.id);
        this.closeDeleteModal();
        toastShow('success', "Parcelle supprimée")
      },
      error: (err) => {
        this.errors = err.error.errors || {};
        this.isSaving = false
        showError(err, err.status, this.errors, err.error, document.getElementById('a'));
      }
    })
  }

  // ── Helpers ───────────────────────────────────────────────
  getStatusName(status: string): string {
    const map: Record<string, string> = {
      active: 'Active',
      inactive: 'Inactive',
      litige: 'En litige'
    };
    return map[status] || status;
  }


  clearUser() {
    this.listUsers = []
  }
}
