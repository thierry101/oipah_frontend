/* eslint-disable @typescript-eslint/no-unused-vars */
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, OnInit } from '@angular/core';
import { SetPaginationComponent } from "../../reusableComponents/set-pagination/set-pagination.component";
import { departmentCI } from 'src/app/share/departments_ci';
import { PublicService } from 'src/app/services/public-service';
import { SelectedComponent } from "../../reusableComponents/selected/selected.component";
import { setPagination, showError, toastShow } from 'src/app/share/shared';
import { AuthService } from 'src/app/services/auth-service';
import { MultiselectComponent } from '../../reusableComponents/multiselect/multiselect.component';
import { Subsidy } from '../grantors/grantors.component';
import { ProjectService } from 'src/app/services/project-service';
import { SubmitSpinnerComponent } from "../../reusableComponents/submit-spinner/submit-spinner.component";


export type ProjectStatus =
  'brouillon' | 'soumis' | 'approuve' | 'en_cours' | 'termine' | 'rejete';

export interface StatusHistory {
  status: ProjectStatus;
  date: string;
  comment: string;
}

export interface Project {
  id: number;
  name: string;                  // ← titre
  filiere: { id: number; name: string }[];  // ← tableau d'objets
  plot_land: {
    id: number;
    area: number;
    department: string;
    sub_prefecture: string;
    quater: string;
    gps: string;
    land_ownership: string;
    type_ground: string;
    source_water: string;
    owner_land: number;
    filiere: number;
  };
  subsidies: Subsidy[];          // ← tableau d'objets complets
  type_project: string;          // ← typeProjet
  modeExecution: string;
  current_statut: ProjectStatus; // ← status
  budget: string;                // ← l'API renvoie une string
  cost_per_ha: string;
  submission_date: string;       // ← dateSoumission
  start_date: string;            // ← dateDemarrage
  end_date: string;              // ← dateFin
  nber_days: number;             // ← duree
  description: string | null;
  purpose: string | null;        // ← objectifs
  subventionAmt:number;
}


@Component({
  selector: 'app-project-agri',
  imports: [CommonModule, FormsModule, SetPaginationComponent, SelectedComponent, MultiselectComponent, SubmitSpinnerComponent],
  templateUrl: './project-agri.component.html',
  styleUrl: './project-agri.component.scss',
})
export class ProjectAgriComponent implements OnInit {

  private publicService = inject(PublicService)
  private authService = inject(AuthService)
  private projectService = inject(ProjectService)

  allFilieres!: any
  listUsers!: any
  searchTermOwner: string = ''
  parcelles!: any
  subsidies: Subsidy[] = [];
  searchTermSub: string = ''
  isSaving: boolean = false
  isLoading: boolean = false
  searchProject: string = ''
  pagination: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };

  // ── Data ──────────────────────────────────────────────────
  projects: Project[] = [];

  departements = departmentCI;
  sousPrefectures: string[] = [];

  // ── UI state ──────────────────────────────────────────────
  showModal = false;
  showDetailModal = false;
  showStatusModal = false;
  showDeleteModal = false;
  editMode = false;

  searchTerm = '';
  filterStatus = '';
  filterFiliere = '';
  filterType = '';

  selectedItem: Project | null = null;
  errors: any = {};

  // Statut modal
  newStatus = '';
  statusComment = '';

  // ── Form ──────────────────────────────────────────────────
  form: Partial<Project> = this.emptyForm();

  private emptyForm(): Partial<Project> {
    return {
      name: '',
      filiere: [],
      plot_land: undefined,
      type_project: 'Communautaire',
      modeExecution: 'Individuel',
      current_statut: 'soumis',
      budget: '0',
      cost_per_ha: '0',
      subsidies: [],
      submission_date: '',
      start_date: '',
      end_date: '',
      nber_days: 0,
      description: '',
      purpose: '',
    };
  }

  ngOnInit(): void {
    this.allFilieres = this.publicService.allSectors
    this.fetchSubsidies(1)
    this.fetchProjects(1)
  }


  fetchUsers(page: number = 1) {
    setPagination(this.authService.getUsers.bind(this.authService), page, this.searchTermOwner, (data: any) => {
      this.listUsers = data?.listItems;
    })
  }


  searchUser(term: string) {
    this.searchTermOwner = term;
    this.fetchUsers(1); // or whatever logic you use
  }


selectUser(user: any): void {
  if (!user || !user.id) return;
  this.searchTermOwner = user?.name + ' ' + user?.surname;
  this.listUsers = [];
  this.publicService.getLandsProject(user?.id).subscribe({
    next: (res: any) => {
      this.parcelles = res?.result;
      if (this.parcelles?.length === 1) {
        const parcell = res?.result[0];
        this.form.plot_land = {
          id: parcell?.id,
          area: parcell?.area,
          department: parcell?.department,
          sub_prefecture: parcell?.sub_prefecture,
          quater: parcell?.quater,
          gps: parcell?.gps,
          land_ownership: parcell?.land_ownership,
          type_ground: parcell?.type_ground,
          source_water: parcell?.source_water,
          owner_land: user?.id,
          filiere: parcell?.filiere,
        };
        this.sousPrefectures =
          departmentCI.find(d => d.value === parcell?.department)?.subPrefectures ?? [];
      }
    },
    error: (err) => {
      this.errors = err.error.errors || {};
      showError(err, err.status, this.errors, err.error, document.getElementById('a'));
    }
  });
}


  fetchSubsidies(page: number = 1) {
    // this.isLoading = true;
    setPagination((page, term) => this.publicService.getProjectSubsidies(page, term), page, this.searchTermSub,
      (data: any) => {
        this.subsidies = data?.listItems;
      },

    );
  }


  subsidySelected(): void {
    if (this.form.subsidies?.length) {
      // form.subsidies contient les IDs sélectionnés (multiselect)
      const selectedIds = this.form.subsidies as unknown as number[];
      const total = this.subsidies.filter(s => selectedIds.includes(s.id)).reduce((sum, s) => sum + Number(s.dynamic_amount), 0);
      this.form.subventionAmt = total
    }
  }


  fetchProjects(page: number = 1) {
    this.isLoading = true;
    setPagination((page, term, statutLand, startDate, endDate) => this.projectService.getProjects(page, term, statutLand,
      startDate, endDate), page,
      this.searchProject,
      (data: any) => {
        this.pagination = data;
        this.projects = data?.listItems;
        console.log(this.projects)
        this.isLoading = false;
      },

      this.filterStatus,
      this.filterFiliere,
      this.filterType,
    );
  }


  calculateTiming(): void {
    if (this.form.start_date && this.form.end_date) {
      const start = new Date(this.form.start_date);
      const end = new Date(this.form.end_date);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      const diffTime = end.getTime() - start.getTime();
      this.form.nber_days = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    } else {
      this.form.nber_days = 0;
    }
  }


  get coutParHa(): number {
    const budget = parseFloat(this.form.budget ?? '0');
    const superficie = this.form.plot_land?.area ?? 0;
    if (!budget || !superficie) return 0;
    const costHa = Math.round(budget / superficie);
    this.form.cost_per_ha = String(costHa);
    return costHa;
  }

  calcBudget(): void { }


  getDepartementName(value: string): string {
    return departmentCI.find(d => d.value === value)?.name ?? value;
  }

  // ── Modal projet ──────────────────────────────────────────
  openModal(project?: Project): void {
    this.editMode = !!project;
    this.searchTermOwner = '';
    this.form = project ? { ...project } : this.emptyForm();
    this.errors = {};
    this.sousPrefectures = project
      ? (departmentCI.find(d => d.value === project.plot_land?.department)?.subPrefectures ?? [])
      : [];
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; this.errors = {}; this.sousPrefectures = []; }

  saveProject(): void {
    this.isSaving = true
    this.projectService.postProject(this.form).subscribe({
      next: (res: any) => {
        this.isSaving = false
        console.log('Projet enregistré avec succès:', res);
        this.closeModal();
        toastShow('success', "Projet enregistré avec succès")
      },
      error: (err) => {
        this.errors = err.error.errors || {};
        console.log(this.errors)
        this.isSaving = false
        showError(err, err.status, this.errors, err.error, document.getElementById('a'));
      }
    })
  }


  saveEditProject() { }


  // ── Status modal ──────────────────────────────────────────
  openStatusModal(project: Project): void {
    this.selectedItem = project;
    this.newStatus = '';
    this.statusComment = '';
    this.showStatusModal = true;
  }

  closeStatusModal(): void { this.showStatusModal = false; }

  availableStatuses(current: ProjectStatus): { value: string; label: string }[] {
    const transitions: Record<ProjectStatus, ProjectStatus[]> = {
      brouillon: ['soumis'],
      soumis: ['approuve', 'rejete'],
      approuve: ['en_cours', 'rejete'],
      en_cours: ['termine', 'rejete'],
      termine: [],
      rejete: ['soumis'],
    };
    return (transitions[current] ?? []).map(v => ({ value: v, label: this.getStatusName(v) }));
  }

  updateStatus(): void {
    if (!this.selectedItem || !this.newStatus) return;
    const idx = this.projects.findIndex(p => p.id === this.selectedItem!.id);
    if (idx === -1) return;
    this.projects[idx] = {
      ...this.projects[idx],
      current_statut: this.newStatus as ProjectStatus,
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
      soumis: 'Soumis',
      approuve: 'Approuvé',
      en_cours: 'En cours',
      termine: 'Terminé',
      rejete: 'Rejeté',
    };
    return map[status] ?? status;
  }


  getTotalSubsidies(item: Project): number {
    return item?.subsidies?.reduce(
      (sum, s) => sum + parseFloat(JSON.stringify(s.amount) ?? '0'), 0
    ) ?? 0;
  }

  onPageChange(page: number): void { console.log('Page:', page); }
}
