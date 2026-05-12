/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SetPaginationComponent } from "../../reusableComponents/set-pagination/set-pagination.component";
import { PublicService } from 'src/app/services/public-service';
import { GpsInputComponent } from "../../reusableComponents/gps-position/gps-position.component";
import { departmentCI } from 'src/app/share/departments_ci';
import { SelectedComponent } from "../../reusableComponents/selected/selected.component";
import { setPagination, showError } from 'src/app/share/shared';
import { AuthService } from 'src/app/services/auth-service';
import { OthersService } from 'src/app/services/others-service';

export interface Parcelle {
  id: number;
  owner: string;
  ownerContact: string;
  departement: string;
  sousPrefecture: string;
  village: string;
  gps: string;
  superficie: number;
  filiere: string;
  typeSol: string;
  sourceEau: string;
  tenureFonciere: string;
  titreFoncier: string;
  dateAcquisition: string;
  status: 'active' | 'inactive' | 'litige';
  notes: string;
}

@Component({
  selector: 'app-plot-land',
  imports: [CommonModule, FormsModule, SetPaginationComponent, GpsInputComponent, SelectedComponent],
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
  filterFiliere = '';

  selectedItem: Parcelle | null = null;
  errors: any = {};

  // ── Form ──────────────────────────────────────────────────
  form: Partial<Parcelle> = this.emptyForm();

  private emptyForm(): Partial<Parcelle> {
    return {
      owner: '', ownerContact: '',
      departement: '', sousPrefecture: '', village: '', gps: '',
      superficie: 0, filiere: '', typeSol: '', sourceEau: '',
      tenureFonciere: '', titreFoncier: '', dateAcquisition: '',
      status: 'active', notes: ''
    };
  }

  ngOnInit(): void {
    this.allFilieres = this.publicService.allSectors
    this.publicService.user$
      .subscribe(user => {
        if (user) {
          this.role = user?.role
        }
      });

    this.parcelles = [
      {
        id: 1,
        owner: 'Konaté Ibrahima', ownerContact: '07 01 23 45 67',
        departement: 'Bouaké', sousPrefecture: 'Bouaké', village: 'Niakara',
        gps: '8.1621, -5.4236', superficie: 4.5,
        filiere: 'Manioc', typeSol: 'Latéritique', sourceEau: 'Pluie',
        tenureFonciere: 'proprietaire', titreFoncier: 'TF-2021-00123',
        dateAcquisition: '2021-03-15',
        status: 'active', notes: 'Parcelle bien irriguée en saison.'
      },
      {
        id: 2,
        owner: 'Ouattara Fatimata', ownerContact: '05 07 65 43 21',
        departement: 'Abidjan', sousPrefecture: '', village: 'Yopougon',
        gps: '5.3364, -4.0289', superficie: 1.2,
        filiere: 'Maraîchère', typeSol: 'Argileux', sourceEau: 'Irrigation',
        tenureFonciere: 'locataire', titreFoncier: '',
        dateAcquisition: '2023-06-01',
        status: 'active', notes: ''
      },
      {
        id: 3,
        owner: 'Bah Moussa', ownerContact: '01 01 11 22 33',
        departement: 'San-Pédro', sousPrefecture: 'Grand-Béréby', village: 'Sassandra',
        gps: '4.9519, -6.0881', superficie: 0.8,
        filiere: 'Aquacole', typeSol: 'Hydromorphe', sourceEau: 'Marigot',
        tenureFonciere: 'communautaire', titreFoncier: 'JGT-2020-00789',
        dateAcquisition: '2020-11-20',
        status: 'active', notes: 'Zone inondable en saison des pluies.'
      },
      {
        id: 4,
        owner: 'Diallo Yaya', ownerContact: '07 55 66 77 88',
        departement: 'Korhogo', sousPrefecture: 'Sinématiali', village: 'Natio Kobadara',
        gps: '9.4578, -5.6312', superficie: 3.0,
        filiere: 'Manioc', typeSol: 'Sableux', sourceEau: 'Puits',
        tenureFonciere: 'metayage', titreFoncier: '',
        dateAcquisition: '2022-01-10',
        status: 'litige', notes: 'Litige foncier en cours avec voisinage.'
      },
    ];
  }


  onDepartementChange(value: string): void {
    this.form.sousPrefecture = '';
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


  selectProduct(user: any): void {
    if (!user || !user.id) return;
    this.searchTermOwner = user?.name + ' ' + user?.surname
    this.form.ownerContact = user?.phone
    this.form.owner = user?.id
    this.listUsers = []
  }


  // ── Computed ──────────────────────────────────────────────
  filteredParcelles(): Parcelle[] {
    return this.parcelles.filter(p => {
      const q = this.searchTerm.toLowerCase();
      const matchSearch = !q ||
        p.owner.toLowerCase().includes(q) ||
        p.village.toLowerCase().includes(q) ||
        p.departement.toLowerCase().includes(q);
      const matchStatus = !this.filterStatus || p.status === this.filterStatus;
      const matchFiliere = !this.filterFiliere || p.filiere === this.filterFiliere;
      return matchSearch && matchStatus && matchFiliere;
    });
  }

  get totalSuperficie(): number {
    return this.parcelles.reduce((acc, p) => acc + (p.superficie || 0), 0);
  }

  countByStatus(status: string): number {
    return this.parcelles.filter(p => p.status === status).length;
  }

  get uniqueOwners(): number {
    return new Set(this.parcelles.map(p => p.owner)).size;
  }

  // ── Modal : Enregistrement ────────────────────────────────
  openModal(parcelle?: Parcelle): void {
    this.editMode = !!parcelle;
    this.form = parcelle ? { ...parcelle } : this.emptyForm();
    this.listUsers = []
    this.errors = {};
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.errors = {};
    this.sousPrefectures = [];
    this.form.sousPrefecture = '';
  }

  saveParcelle(): void {
    this.errors = {};
    this.isSaving = true
    this.othersService.postLand(this.form).subscribe({
      next: (res: any) => {
        console.log(res)
        this.isSaving = false
        this.closeModal();
      },
      error: (err) => {
        this.errors = err.error.errors || {};
        console.log(this.errors)
        this.isSaving = false
        showError(err, err.status, this.errors, err.error, document.getElementById('a'));
      }
    })
    // if (!this.form.code?.trim()) { this.errors.code = 'Le code est obligatoire.'; return; }
    // if (!this.form.owner?.trim()) { this.errors.owner = 'Le propriétaire est obligatoire.'; return; }
    // if (!this.form.departement?.trim()) { this.errors.departement = 'Le département est obligatoire.'; return; }
    // if (!this.form.village?.trim()) { this.errors.village = 'Le village est obligatoire.'; return; }
    // if (!this.form.filiere) { this.errors.filiere = 'La filière est obligatoire.'; return; }
    // if (!this.form.superficie || this.form.superficie <= 0) {
    //   this.errors.superficie = 'La superficie doit être supérieure à 0.'; return;
    // }

    // if (this.editMode) {
    //   const idx = this.parcelles.findIndex(p => p.id === (this.form as Parcelle).id);
    //   if (idx !== -1) this.parcelles[idx] = { ...this.parcelles[idx], ...this.form } as Parcelle;
    // } else {
    //   const id = Math.max(0, ...this.parcelles.map(p => p.id)) + 1;
    //   this.parcelles = [...this.parcelles, { id, ...this.form } as Parcelle];
    // }

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
    this.parcelles = this.parcelles.filter(p => p.id !== this.selectedItem!.id);
    this.closeDeleteModal();
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

  onPageChange(page: number): void {
    console.log('Page:', page);
  }


  clearUser() {
    this.listUsers = []
  }
}
