/* eslint-disable @typescript-eslint/no-explicit-any */
import { RouterModule } from '@angular/router';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth-service';
import { roles, setPagination, showError, toastShow } from 'src/app/share/shared';
import { SetPaginationComponent } from "../../reusableComponents/set-pagination/set-pagination.component";
import { SubmitSpinnerComponent } from "../../reusableComponents/submit-spinner/submit-spinner.component";
import { SpinnerComponent } from "../../reusableComponents/spinner/spinner.component";
import { SearchListComponent } from "../../reusableComponents/search-list/search-list.component";

export interface Entrepreneur {
  id: number;
  name: string;
  surname: string;
  phone: string;
  type_doc: string;
  nber_doc: string;
  role: string;
  email: string;
  password?: string;
}

type FiltersType = '' | 'Manioc' | 'Maraîchère' | 'Aquacole';


@Component({
  selector: 'app-users',
  imports: [RouterModule, FormsModule, CommonModule, SetPaginationComponent, SubmitSpinnerComponent, SpinnerComponent, SearchListComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent implements OnInit {

  private authService = inject(AuthService)

  // ── State ─────────────────────────────────────────────────
  showModal = false;
  showPwdModal = false;
  showDeleteModal = false;
  editMode = false;
  searchTerm = '';
  filterFiliere: FiltersType = '';
  selectedItem: Entrepreneur | null = null;
  isLoading: boolean = false
  isSaving: boolean = false
  roles: any = roles
  errors: any = []
  pagination: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };
  pages: number[] = [];
  entrepreneurs: any;
  idUser!: any


  ngOnInit(): void {
    this.authService.getUsers()
    this.fetchUsers(1)
  }


  fetchUsers(page: number = 1) { //instead of bind I can call arrow function like (page, term) => this.authService.getRegisterByAdmin(page, term)
    this.isLoading = true;
    setPagination(this.authService.getUsers.bind(this.authService), page, this.searchTerm, (data: any) => {
      this.pagination = data;
      console.log(data)
      this.entrepreneurs = data?.listItems;
      this.isLoading = false;
      this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
    })
  }


  onPageChange(page: number) {
    this.fetchUsers(page);
  }


  onSearchChange(term: string) {
    this.searchTerm = term;
    this.fetchUsers(1); // reset to first page on search
  }


  // ── Empty form ────────────────────────────────────────────
  emptyForm(): Entrepreneur {
    return {
      id: 0, name: '', surname: '', phone: '', role: '',
      type_doc: '', email: '', password: '', nber_doc: ''
    };
  }

  form: Entrepreneur = this.emptyForm();
  pwdForm = { newPwd: '' };

  // ── Computed ──────────────────────────────────────────────

  // ── Modal : Enrôlement ────────────────────────────────────
  openModal(): void {
    this.editMode = false;
    this.form = this.emptyForm();
    this.showModal = true;
    this.errors = []
  }

  openEditModal(item: Entrepreneur): void {
    this.idUser = item?.id
    this.editMode = true;
    this.form = { ...item };
    this.showModal = true;
    this.errors = []
  }

  closeModal(): void { this.showModal = false; }

  saveEntrepreneur(): void {
    this.isSaving = true
    this.authService.postUsr(this.form).subscribe({
      next: () => {
        this.errors = []
        this.fetchUsers(1)
        toastShow('success', 'Utilisateur créé avec succès')
        this.closeModal();
        this.isSaving = false
      },
      error: (err) => {
        this.errors = err.error.errors || {};
        this.isSaving = false
        showError(err, err.status, this.errors, err.error, document.getElementById('a'));
      }
    })
  }


  saveEditEntrepreneur() {
    this.isSaving = true
    const data = {
      checker: 'infos',
      data: this.form
    }
    this.authService.editUsr(this.idUser, data).subscribe({
      next: () => {
        this.errors = []
        this.fetchUsers(1)
        toastShow('success', 'Utilisateur mis à jour')
        this.closeModal();
        this.isSaving = false
      },
      error: (err) => {
        this.errors = err.error.errors || {};
        this.isSaving = false
        showError(err, err.status, this.errors, err.error, document.getElementById('a'));
      }
    })
  }

  // ── Modal : Mot de passe ──────────────────────────────────
  openPwdModal(item: Entrepreneur): void {
    this.selectedItem = item;
    this.pwdForm = { newPwd: '' };
    this.showPwdModal = true;
    this.idUser = item?.id
  }

  closePwdModal(): void { this.showPwdModal = false; }


  savePassword(): void {
    const data = {
      checker: 'password',
      password: this.pwdForm.newPwd
    }
    this.isSaving = true
    this.authService.editUsr(this.idUser, data).subscribe({
      next: () => {
        this.errors = []
        toastShow('success', 'Mot de passe mis à jour')
        this.closeModal();
        this.isSaving = false
        this.closePwdModal();
      },
      error: (err) => {
        this.errors = err.error.errors || {};
        this.isSaving = false
        showError(err, err.status, this.errors, err.error, document.getElementById('a'));
      }
    })

  }

  // ── Modal : Suppression ───────────────────────────────────
  confirmDelete(item: Entrepreneur): void {
    this.selectedItem = item;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void { this.showDeleteModal = false; }

  deleteEntrepreneur(): void {
    this.authService.deleteUsr(this.selectedItem!.id).subscribe({
      next: ()=>{
        toastShow('success', 'Utilisateur supprimé')
        this.entrepreneurs = this.entrepreneurs.filter((e: any) => e.id !== this.selectedItem!.id);
        this.closeDeleteModal();
      }
    })
  }


  getRoleName(value: string): string {
    const item = this.roles.find((type: any) => type.value === value);
    return item ? item.name : '';
  }



}
