import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { GpsInputComponent } from "../../reusableComponents/gps-position/gps-position.component";
import { SetPaginationComponent } from "../../reusableComponents/set-pagination/set-pagination.component";
import { departmentCI } from 'src/app/share/departments_ci';


export type ProjectStatus =
  'brouillon' | 'soumis' | 'approuve' | 'en_cours' | 'termine' | 'rejete';

export interface StatusHistory {
  status: ProjectStatus;
  date: string;
  comment: string;
}

export interface Project {
  id: number;
  titre: string;
  reference: string;
  filiere: string;
  typeProjet: string;
  modeExecution: string;
  porteur: string;
  porteurContact: string;
  organisation: string;
  porteurEmail: string;
  departement: string;
  sousPrefecture: string;
  lieuExecution: string;
  gps: string;
  budget: number;
  superficie: number;
  nbEtangs: number;
  dateSoumission: string;
  dateDemarrage: string;
  dateFin: string;
  duree: number;
  description: string;
  objectifs: string;
  status: ProjectStatus;
  statusHistory: StatusHistory[];
}

@Component({
  selector: 'app-project-agri',
  imports: [CommonModule, FormsModule, GpsInputComponent, SetPaginationComponent],
  templateUrl: './project-agri.component.html',
  styleUrl: './project-agri.component.scss',
})
export class ProjectAgriComponent implements OnInit {

  // ── Data ──────────────────────────────────────────────────
  projects:   Project[] = [];
  pagination: any = null;

  departements    = departmentCI;
  sousPrefectures: string[] = [];

  // ── UI state ──────────────────────────────────────────────
  showModal       = false;
  showDetailModal = false;
  showStatusModal = false;
  showDeleteModal = false;
  editMode        = false;

  searchTerm    = '';
  filterStatus  = '';
  filterFiliere = '';
  filterType    = '';

  selectedItem: Project | null = null;
  errors: any = {};

  // Statut modal
  newStatus      = '';
  statusComment  = '';

  // ── Form ──────────────────────────────────────────────────
  form: Partial<Project> = this.emptyForm();

  private emptyForm(): Partial<Project> {
    return {
      titre: '', reference: '', filiere: '', typeProjet: 'Communautaire',
      modeExecution: 'Individuel', porteur: '', porteurContact: '',
      organisation: '', porteurEmail: '', departement: '', sousPrefecture: '',
      lieuExecution: '', gps: '', budget: undefined, superficie: undefined,
      nbEtangs: 0, dateSoumission: '', dateDemarrage: '', dateFin: '',
      duree: undefined, description: '', objectifs: '', status: 'brouillon',
      statusHistory: []
    };
  }

  ngOnInit(): void {
    this.projects = [
      {
        id: 1,
        titre: 'Développement culture manioc à Bouaké',
        reference: 'PROJ-2025-001',
        filiere: 'Manioc', typeProjet: 'Communautaire', modeExecution: 'Groupement',
        porteur: 'Konaté Ibrahima', porteurContact: '07 01 23 45 67',
        organisation: 'COOP Agri Nord', porteurEmail: 'konate@coop.ci',
        departement: 'bouake', sousPrefecture: 'Bouaké-Ville',
        lieuExecution: 'Niakara', gps: '8.1621, -5.4236',
        budget: 2500000, superficie: 5, nbEtangs: 0,
        dateSoumission: '2025-01-10', dateDemarrage: '2025-03-01', dateFin: '2025-12-31', duree: 10,
        description: 'Projet de culture intensive du manioc en zone centre.',
        objectifs: 'Atteindre 15 tonnes/ha à la récolte.',
        status: 'en_cours',
        statusHistory: [
          { status: 'brouillon', date: '2025-01-05', comment: '' },
          { status: 'soumis',    date: '2025-01-10', comment: 'Soumission initiale' },
          { status: 'approuve',  date: '2025-01-20', comment: 'Validé par le comité' },
          { status: 'en_cours',  date: '2025-03-01', comment: 'Démarrage effectif' },
        ]
      },
      {
        id: 2,
        titre: 'Programme maraîchage durable Yopougon',
        reference: 'PROJ-2025-002',
        filiere: 'Maraîchère', typeProjet: 'Individuel', modeExecution: 'Individuel',
        porteur: 'Ouattara Fatimata', porteurContact: '05 07 65 43 21',
        organisation: '', porteurEmail: '',
        departement: 'abidjan', sousPrefecture: 'Anyama',
        lieuExecution: 'Yopougon', gps: '5.3364, -4.0289',
        budget: 800000, superficie: 1.2, nbEtangs: 0,
        dateSoumission: '2025-02-01', dateDemarrage: '', dateFin: '', duree: 6,
        description: 'Culture de légumes feuilles avec système d\'irrigation goutte-à-goutte.',
        objectifs: 'Production hebdomadaire de 500kg de légumes.',
        status: 'soumis',
        statusHistory: [
          { status: 'brouillon', date: '2025-01-28', comment: '' },
          { status: 'soumis',    date: '2025-02-01', comment: '' },
        ]
      },
      {
        id: 3,
        titre: 'Appui pisciculture Sassandra',
        reference: 'PROJ-2025-003',
        filiere: 'Aquacole', typeProjet: 'Communautaire', modeExecution: 'Groupement',
        porteur: 'Bah Moussa', porteurContact: '01 01 11 22 33',
        organisation: 'Pisciculture du Sud', porteurEmail: 'bah@pisci.ci',
        departement: 'san-pedro', sousPrefecture: 'Grand-Béréby',
        lieuExecution: 'Sassandra', gps: '4.9519, -6.0881',
        budget: 5000000, superficie: 0.8, nbEtangs: 4,
        dateSoumission: '2024-12-01', dateDemarrage: '', dateFin: '', duree: 12,
        description: 'Construction de 4 étangs piscicoles et formation des producteurs.',
        objectifs: 'Production annuelle de 2 tonnes de tilapia.',
        status: 'rejete',
        statusHistory: [
          { status: 'brouillon', date: '2024-11-20', comment: '' },
          { status: 'soumis',    date: '2024-12-01', comment: '' },
          { status: 'rejete',    date: '2024-12-20', comment: 'Budget insuffisamment justifié.' },
        ]
      },
    ];
  }

  // ── Computed ──────────────────────────────────────────────
  filteredProjects(): Project[] {
    return this.projects.filter(p => {
      const q = this.searchTerm.toLowerCase();
      const matchSearch = !q ||
        p.titre.toLowerCase().includes(q) ||
        p.porteur.toLowerCase().includes(q) ||
        p.filiere.toLowerCase().includes(q) ||
        p.reference.toLowerCase().includes(q);
      const matchStatus  = !this.filterStatus  || p.status   === this.filterStatus;
      const matchFiliere = !this.filterFiliere || p.filiere  === this.filterFiliere;
      const matchType    = !this.filterType    || p.typeProjet === this.filterType;
      return matchSearch && matchStatus && matchFiliere && matchType;
    });
  }

  countByStatus(status: ProjectStatus): number {
    return this.projects.filter(p => p.status === status).length;
  }

  get coutParHa(): number {
    if (!this.form.budget || !this.form.superficie || this.form.superficie === 0) return 0;
    return Math.round(this.form.budget / this.form.superficie);
  }

  calcBudget(): void {}

  // ── Département / Sous-préfecture ─────────────────────────
  onDepartementChange(value: string): void {
    this.form.sousPrefecture = '';
    this.sousPrefectures = value
      ? (departmentCI.find(d => d.value === value)?.subPrefectures ?? [])
      : [];
  }

  getDepartementName(value: string): string {
    return departmentCI.find(d => d.value === value)?.name ?? value;
  }

  // ── Modal projet ──────────────────────────────────────────
  openModal(project?: Project): void {
    this.editMode = !!project;
    this.form     = project ? { ...project, statusHistory: [...(project.statusHistory ?? [])] } : this.emptyForm();
    this.errors   = {};
    this.sousPrefectures = project
      ? (departmentCI.find(d => d.value === project.departement)?.subPrefectures ?? [])
      : [];
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; this.errors = {}; this.sousPrefectures = []; }

  saveProject(forceStatus?: ProjectStatus): void {
    this.errors = {};
    if (!this.form.titre?.trim())        { this.errors.titre        = 'Le titre est obligatoire.';          return; }
    if (!this.form.filiere)              { this.errors.filiere      = 'La filière est obligatoire.';        return; }
    if (!this.form.porteur?.trim())      { this.errors.porteur      = 'Le porteur est obligatoire.';        return; }
    if (!this.form.departement)          { this.errors.departement  = 'Le département est obligatoire.';    return; }
    if (!this.form.lieuExecution?.trim()){ this.errors.lieuExecution = 'Le lieu est obligatoire.';          return; }
    if (!this.form.budget || this.form.budget <= 0) { this.errors.budget = 'Le budget est obligatoire.';   return; }
    if (!this.form.superficie || this.form.superficie <= 0) { this.errors.superficie = 'La superficie est obligatoire.'; return; }

    if (forceStatus) this.form.status = forceStatus;

    if (this.editMode) {
      const idx = this.projects.findIndex(p => p.id === (this.form as Project).id);
      if (idx !== -1) this.projects[idx] = { ...this.projects[idx], ...this.form } as Project;
    } else {
      const id = Math.max(0, ...this.projects.map(p => p.id)) + 1;
      const ref = this.form.reference?.trim() || `PROJ-${new Date().getFullYear()}-${String(id).padStart(3,'0')}`;
      const history: StatusHistory[] = [{ status: this.form.status as ProjectStatus, date: new Date().toISOString().split('T')[0], comment: '' }];
      this.projects = [...this.projects, { id, ...this.form, reference: ref, statusHistory: history } as Project];
    }
    this.closeModal();
  }

  // ── Status modal ──────────────────────────────────────────
  openStatusModal(project: Project): void {
    this.selectedItem  = project;
    this.newStatus     = '';
    this.statusComment = '';
    this.showStatusModal = true;
  }

  closeStatusModal(): void { this.showStatusModal = false; }

  availableStatuses(current: ProjectStatus): { value: string; label: string }[] {
    const transitions: Record<ProjectStatus, ProjectStatus[]> = {
      brouillon: ['soumis'],
      soumis:    ['approuve', 'rejete'],
      approuve:  ['en_cours', 'rejete'],
      en_cours:  ['termine', 'rejete'],
      termine:   [],
      rejete:    ['soumis'],
    };
    return (transitions[current] ?? []).map(v => ({ value: v, label: this.getStatusName(v) }));
  }

  updateStatus(): void {
    if (!this.selectedItem || !this.newStatus) return;
    const idx = this.projects.findIndex(p => p.id === this.selectedItem!.id);
    if (idx === -1) return;

    const entry: StatusHistory = {
      status:  this.newStatus as ProjectStatus,
      date:    new Date().toISOString().split('T')[0],
      comment: this.statusComment
    };

    this.projects[idx] = {
      ...this.projects[idx],
      status: this.newStatus as ProjectStatus,
      statusHistory: [...(this.projects[idx].statusHistory ?? []), entry]
    };

    this.closeStatusModal();
  }

  // ── Detail modal ──────────────────────────────────────────
  openDetailModal(project: Project): void { this.selectedItem = project; this.showDetailModal = true; }
  closeDetailModal(): void { this.showDetailModal = false; }

  // ── Delete modal ──────────────────────────────────────────
  confirmDelete(project: Project): void { this.selectedItem = project; this.showDeleteModal = true; }
  closeDeleteModal(): void { this.showDeleteModal = false; }

  deleteProject(): void {
    if (!this.selectedItem) return;
    this.projects = this.projects.filter(p => p.id !== this.selectedItem!.id);
    this.closeDeleteModal();
  }

  // ── Helpers ───────────────────────────────────────────────
  getStatusName(status: string): string {
    const map: Record<string, string> = {
      brouillon: 'Brouillon',
      soumis:    'Soumis',
      approuve:  'Approuvé',
      en_cours:  'En cours',
      termine:   'Terminé',
      rejete:    'Rejeté',
    };
    return map[status] ?? status;
  }

  onPageChange(page: number): void { console.log('Page:', page); }
}
