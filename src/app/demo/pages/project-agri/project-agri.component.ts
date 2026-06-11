import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, OnInit } from '@angular/core';
import { SetPaginationComponent } from "../../reusableComponents/set-pagination/set-pagination.component";
import { departmentCI } from 'src/app/share/departments_ci';
import { PublicService } from 'src/app/services/public-service';
import { SelectedComponent } from "../../reusableComponents/selected/selected.component";
import { setPagination, showError, statutProject, toastShow } from 'src/app/share/shared';
import { AuthService } from 'src/app/services/auth-service';
import { MultiselectComponent } from '../../reusableComponents/multiselect/multiselect.component';
import { Subsidy } from '../grantors/grantors.component';
import { ProjectService } from 'src/app/services/project-service';
import { SubmitSpinnerComponent } from "../../reusableComponents/submit-spinner/submit-spinner.component";
import { SearchListComponent } from "../../reusableComponents/search-list/search-list.component";


export interface Project {
  id: number;
  name: string;
  filiere: any;
  plot_land: {
    id: number;
    area: number;
    department: string;
    sub_prefecture: string;
    quater: string;
    gps: string;
    owner_land: any;
  };
  subsidies: number[];
  qty: number;
  project_subsidies: {
    id: number;
    subsidy_name: string;
    amount_used: string;
    amount_before: string;
    amount_after: string;
    subsidy: number;
  }[];
  type_project: string;
  modeExecution: string;
  current_statut: any;
  budget: string;
  cost_per_ha: string;
  submission_date: string;
  start_date: string;
  end_date: string;
  nber_days: number;
  description: string | null;
  purpose: string | null;
  contact: string | null;
}


@Component({
  selector: 'app-project-agri',
  imports: [CommonModule, FormsModule, SetPaginationComponent, SelectedComponent, MultiselectComponent, SubmitSpinnerComponent, SearchListComponent],
  templateUrl: './project-agri.component.html',
  styleUrl: './project-agri.component.scss',
})
export class ProjectAgriComponent implements OnInit {

  private publicService = inject(PublicService);
  private authService = inject(AuthService);
  private projectService = inject(ProjectService);

  allStatuses = statutProject

  allFilieres!: any;
  deleteConfirmWord: string = '';
  listUsers!: any;
  searchTermOwner: string = '';
  parcelles!: any;
  subsidies: Subsidy[] = [];
  searchTermSub: string = '';
  isSaving: boolean = false;
  isLoading: boolean = false;
  searchProject: string = '';
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
  statusHistory: any[] = [];
  parcelle!: any

  selectedItem: Project | null = null;
  errors: any = {};

  // Statut modal
  newStatus = '';
  statusComment = '';

  totalSubvention: number = 0;

  // ── Form ──────────────────────────────────────────────────
  form: Partial<Project> = this.emptyForm();

  private emptyForm(): Partial<Project> {
    return {
      name: '',
      filiere: [],
      plot_land: {
        id: 0,
        area: 0,
        department: '',
        sub_prefecture: '',
        quater: '',
        gps: '',
        owner_land: '',
      },
      type_project: 'Communautaire',
      modeExecution: 'Individuel',
      current_statut: 'soumis',
      budget: '0',
      cost_per_ha: '0',
      subsidies: [],
      project_subsidies: [],
      submission_date: '',
      start_date: '',
      end_date: '',
      nber_days: 0,
      description: '',
      purpose: '',
    };
  }

  ngOnInit(): void {
    this.allFilieres = this.publicService.allSectors;
    this.fetchSubsidies(1);
    this.fetchProjects(1);
  }

  // ── Users ─────────────────────────────────────────────────
  fetchUsers(page: number = 1): void {
    setPagination(this.projectService.getUsersProject.bind(this.projectService), page, this.searchTermOwner, (data: any) => {
      this.listUsers = data?.listItems;
    });
  }

  searchUser(term: string): void {
    this.searchTermOwner = term;
    this.fetchUsers(1);
  }

  selectUser(user: any): void {
    if (!user || !user.id) return;
    this.searchTermOwner = user?.name + ' ' + user?.surname;
    this.form.contact = user?.phone;
    this.listUsers = [];
    this.publicService.getLandsProject(user?.id).subscribe({
      next: (res: any) => {
        this.parcelles = res?.result;
        console.log(this.parcelles)
        if (this.parcelles?.length === 1) {
          const parcell = res?.result[0];
          this.form.plot_land = {
            id: parcell?.id,
            area: parcell?.area,
            department: parcell?.department,
            sub_prefecture: parcell?.sub_prefecture,
            quater: parcell?.quater,
            gps: parcell?.gps,
            owner_land: user?.name + ' ' + user?.surname
          };
          this.sousPrefectures = departmentCI.find(d => d?.value === parcell?.department)?.subPrefectures ?? [];
        } else {
          this.parcelle = 0
          this.form.plot_land = {
            id: 0,
            area: 0,
            department: '',
            sub_prefecture: '',
            quater: '',
            gps: '',
            owner_land: ''
          };
          this.sousPrefectures = []
        }
      },
      error: (err) => {
        this.errors = err.error.errors || {};
        showError(err, err.status, this.errors, err.error, document.getElementById('a'));
      }
    });
  }


  onParcelleChange() {
    const parcell = this.parcelles.find((d: any) => d?.id === this.parcelle);
    this.form.plot_land = {
      id: parcell?.id,
      area: parcell?.area,
      department: parcell?.department,
      sub_prefecture: parcell?.sub_prefecture,
      quater: parcell?.quater,
      gps: parcell?.gps,
      owner_land: ''
    };
    this.sousPrefectures = departmentCI.find(d => d?.value === parcell?.department)?.subPrefectures ?? [];
  }


  // ── Subsidies ─────────────────────────────────────────────
  fetchSubsidies(page: number = 1): void {
    setPagination(
      (page, term) => this.publicService.getProjectSubsidies(page, term),
      page,
      this.searchTermSub,
      (data: any) => {
        this.subsidies = data?.listItems;
      }
    );
  }


  subsidySelected() {
    if ((this.form.subsidies?.length ?? 0) > 0) {
      this.totalSubvention = this.subsidies
        .filter(item => this.form.subsidies?.includes(item.id))
        .reduce((sum, item) => sum + Number(item.dynamic_amount || 0), 0);
    } else {
      this.totalSubvention = 0;
      return this.totalSubvention;
    }
    return this.totalSubvention;
  }


  getTotalProjectSubsidies(item: any): number {
    return item?.project_subsidies?.reduce(
      (sum: number, s: any) => sum + parseFloat(s.amount_used ?? '0'), 0
    ) ?? 0;
  }

  // ── Projects ──────────────────────────────────────────────
  fetchProjects(page: number = 1): void {
    this.isLoading = true;
    setPagination(
      (page, term, statutLand, startDate, endDate) =>
        this.projectService.getProjects(page, term, statutLand, startDate, endDate),
      page,
      this.searchProject,
      (data: any) => {
        this.pagination = data;
        this.projects = data?.listItems;
        this.isLoading = false;
      },
      this.filterStatus,
      this.filterFiliere,
      this.filterType,
    );
  }


  onSearchProject(term: string): void {
    this.searchProject = term;
    this.fetchProjects(1);
  }


  filterSelect() {
    this.fetchProjects(1);
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

  getDepartementName(value: string): string {
    return departmentCI.find(d => d.value === value)?.name ?? value;
  }


  // ── Modal projet ──────────────────────────────────────────
  openModal(project?: Project): void {
    this.editMode = !!project;
    this.searchTermOwner = project?.plot_land?.owner_land ? `${project.plot_land.owner_land.name} ${project.plot_land.owner_land.surname}` : '';
    this.form = project ? { ...project } : this.emptyForm();
    this.form.contact = project?.plot_land?.owner_land?.phone ?? '';
    this.form.filiere = project?.filiere.map((item: any) => item.id);
    this.form.subsidies = project?.subsidies ?? [];
    this.errors = {};
    this.sousPrefectures = project
      ? (departmentCI.find(d => d.value === project.plot_land?.department)?.subPrefectures ?? [])
      : [];
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.errors = {};
    this.sousPrefectures = [];
  }

  saveProject(): void {
    this.isSaving = true;
    this.projectService.postProject(this.form).subscribe({
      next: () => {
        this.isSaving = false;
        this.fetchProjects(1);
        this.closeModal();
        toastShow('success', 'Projet enregistré avec succès');
      },
      error: (err) => {
        this.errors = err.error.errors || {};
        this.isSaving = false;
        showError(err, err.status, this.errors, err.error, document.getElementById('a'));
      }
    });
  }


  // ── Status modal ──────────────────────────────────────────
  openStatusModal(project: Project): void {
    this.selectedItem = project;
    this.newStatus = '';
    this.statusComment = '';
    this.showStatusModal = true;
    this.projectService.getHistorikProject(project?.id).subscribe({
      next: (res: any) => {
        this.statusHistory = res
      }
    })
  }

  closeStatusModal(): void { this.showStatusModal = false; }


  updateStatus(): void {
    if (!this.selectedItem || !this.newStatus) return;
    const data = { "newStatut": this.newStatus, 'message': this.statusComment };
    this.projectService.putProject(this.selectedItem?.id, data).subscribe({
      next: () => {
        const idx = this.projects.findIndex(p => p.id === this.selectedItem!.id);
        if (idx === -1) return;
        this.projects[idx] = {
          ...this.projects[idx],
          current_statut: this.newStatus,
        };
        this.closeStatusModal();
        toastShow('success', 'Statut mis à jour avec succès');
      },
      error: (err) => {
        this.errors = err.error.errors || {};
        this.isSaving = false;
        showError(err, err.status, this.errors, err.error, document.getElementById('a'));
      }
    })
  }

  // ── Detail modal ──────────────────────────────────────────
  openDetailModal(project: Project): void {
    this.selectedItem = project;
    this.showDetailModal = true;
  }

  closeDetailModal(): void { this.showDetailModal = false; }

  // ── Delete modal ──────────────────────────────────────────
  confirmDelete(project: Project): void {
    this.selectedItem = project;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.deleteConfirmWord = '';
  }

  deleteProject(): void {
    if (!this.selectedItem) return;
    this.projectService.deleteProject(this.selectedItem?.id).subscribe({
      next: () => {
        this.projects = this.projects.filter(p => p.id !== this.selectedItem!.id);
        this.closeDeleteModal();
      },
      error: (err) => {
        this.errors = err.error.errors || {};
        this.isSaving = false;
        showError(err, err.status, this.errors, err.error, document.getElementById('a'));
      }
    });
  }


  // ── Helpers ───────────────────────────────────────────────
  getStatusName(status: string | null): string {
    return this.allStatuses.find(s => s.value === status)?.name || 'Inconnu';
  }
}
