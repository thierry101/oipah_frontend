/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SetPaginationComponent } from "../../reusableComponents/set-pagination/set-pagination.component";

export interface Parcelle {
  id: number;
  code: string;
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
  culture: string;
  status: 'active' | 'inactive' | 'litige';
  notes: string;
}

@Component({
  selector: 'app-plot-land',
  imports: [CommonModule, FormsModule, SetPaginationComponent],
  templateUrl: './plot-land.component.html',
  styleUrl: './plot-land.component.scss',
})
export class PlotLandComponent implements OnInit {

  // ── Data ──────────────────────────────────────────────────
  parcelles: Parcelle[] = [];
  pagination: any = null;

  // ── UI state ──────────────────────────────────────────────
  showModal       = false;
  showDetailModal = false;
  showDeleteModal = false;
  editMode        = false;

  searchTerm    = '';
  filterStatus  = '';
  filterFiliere = '';

  selectedItem: Parcelle | null = null;
  errors: any = {};

  // ── Form ──────────────────────────────────────────────────
  form: Partial<Parcelle> = this.emptyForm();

  private emptyForm(): Partial<Parcelle> {
    return {
      code: '', owner: '', ownerContact: '',
      departement: '', sousPrefecture: '', village: '', gps: '',
      superficie: undefined, filiere: '', typeSol: '', sourceEau: '',
      tenureFonciere: '', titreFoncier: '', dateAcquisition: '',
      culture: '', status: 'active', notes: ''
    };
  }

  ngOnInit(): void {
    // Remplacer par appel API
    this.parcelles = [
      {
        id: 1, code: 'PARC-2025-001',
        owner: 'Konaté Ibrahima', ownerContact: '07 01 23 45 67',
        departement: 'Bouaké', sousPrefecture: 'Bouaké', village: 'Niakara',
        gps: '8.1621, -5.4236', superficie: 4.5,
        filiere: 'Manioc', typeSol: 'Latéritique', sourceEau: 'Pluie',
        tenureFonciere: 'proprietaire', titreFoncier: 'TF-2021-00123',
        dateAcquisition: '2021-03-15', culture: 'Manioc',
        status: 'active', notes: 'Parcelle bien irriguée en saison.'
      },
      {
        id: 2, code: 'PARC-2025-002',
        owner: 'Ouattara Fatimata', ownerContact: '05 07 65 43 21',
        departement: 'Abidjan', sousPrefecture: '', village: 'Yopougon',
        gps: '5.3364, -4.0289', superficie: 1.2,
        filiere: 'Maraîchère', typeSol: 'Argileux', sourceEau: 'Irrigation',
        tenureFonciere: 'locataire', titreFoncier: '',
        dateAcquisition: '2023-06-01', culture: 'Tomate, Gombo',
        status: 'active', notes: ''
      },
      {
        id: 3, code: 'PARC-2025-003',
        owner: 'Bah Moussa', ownerContact: '01 01 11 22 33',
        departement: 'San-Pédro', sousPrefecture: 'Grand-Béréby', village: 'Sassandra',
        gps: '4.9519, -6.0881', superficie: 0.8,
        filiere: 'Aquacole', typeSol: 'Hydromorphe', sourceEau: 'Marigot',
        tenureFonciere: 'communautaire', titreFoncier: 'JGT-2020-00789',
        dateAcquisition: '2020-11-20', culture: 'Étangs piscicoles',
        status: 'active', notes: 'Zone inondable en saison des pluies.'
      },
      {
        id: 4, code: 'PARC-2025-004',
        owner: 'Diallo Yaya', ownerContact: '07 55 66 77 88',
        departement: 'Korhogo', sousPrefecture: 'Sinématiali', village: 'Natio Kobadara',
        gps: '9.4578, -5.6312', superficie: 3.0,
        filiere: 'Manioc', typeSol: 'Sableux', sourceEau: 'Puits',
        tenureFonciere: 'metayage', titreFoncier: '',
        dateAcquisition: '2022-01-10', culture: 'Manioc, Igname',
        status: 'litige', notes: 'Litige foncier en cours avec voisinage.'
      },
    ];
  }

  // ── Computed ──────────────────────────────────────────────
  filteredParcelles(): Parcelle[] {
    return this.parcelles.filter(p => {
      const q = this.searchTerm.toLowerCase();
      const matchSearch = !q ||
        p.owner.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.village.toLowerCase().includes(q) ||
        p.departement.toLowerCase().includes(q);
      const matchStatus  = !this.filterStatus  || p.status === this.filterStatus;
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
    this.form     = parcelle ? { ...parcelle } : this.emptyForm();
    this.errors   = {};
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; this.errors = {}; }

  saveParcelle(): void {
    this.errors = {};
    if (!this.form.code?.trim())        { this.errors.code        = 'Le code est obligatoire.';           return; }
    if (!this.form.owner?.trim())       { this.errors.owner       = 'Le propriétaire est obligatoire.';   return; }
    if (!this.form.departement?.trim()) { this.errors.departement = 'Le département est obligatoire.';    return; }
    if (!this.form.village?.trim())     { this.errors.village     = 'Le village est obligatoire.';        return; }
    if (!this.form.filiere)             { this.errors.filiere     = 'La filière est obligatoire.';        return; }
    if (!this.form.superficie || this.form.superficie <= 0) {
      this.errors.superficie = 'La superficie doit être supérieure à 0.'; return;
    }

    if (this.editMode) {
      const idx = this.parcelles.findIndex(p => p.id === (this.form as Parcelle).id);
      if (idx !== -1) this.parcelles[idx] = { ...this.parcelles[idx], ...this.form } as Parcelle;
    } else {
      const id = Math.max(0, ...this.parcelles.map(p => p.id)) + 1;
      this.parcelles = [...this.parcelles, { id, ...this.form } as Parcelle];
    }

    this.closeModal();
  }

  // ── Modal : Détail ────────────────────────────────────────
  openDetailModal(parcelle: Parcelle): void {
    this.selectedItem    = parcelle;
    this.showDetailModal = true;
  }

  closeDetailModal(): void { this.showDetailModal = false; }

  // ── Modal : Suppression ───────────────────────────────────
  confirmDelete(parcelle: Parcelle): void {
    this.selectedItem    = parcelle;
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
      active:   'Active',
      inactive: 'Inactive',
      litige:   'En litige'
    };
    return map[status] || status;
  }

  onPageChange(page: number): void {
    console.log('Page:', page);
  }
}
