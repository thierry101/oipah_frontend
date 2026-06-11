/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService } from 'src/app/services/project-service';
import { setPagination, showError, statutProject, toastShow } from 'src/app/share/shared';
import { SubmitSpinnerComponent } from "../../reusableComponents/submit-spinner/submit-spinner.component";
import { PublicService } from 'src/app/services/public-service';

// --- Interfaces ---
export interface Tab {
  key: string;
  label: string;
  icon: string;
}

export interface TransportCharge {
  id: number;
  label: string;
  amount: number;
  date: Date | null;
}

export interface TransformedItem {
  id: number;
  unit: string;
  name: string;
  qty: number;
  amount: number;
}

@Component({
  selector: 'app-havest-sale',
  imports: [CommonModule, FormsModule, SubmitSpinnerComponent],
  templateUrl: './havest-sale.component.html',
  styleUrl: './havest-sale.component.scss',
})
export class HavestSaleComponent implements OnInit {
  private projectService = inject(ProjectService);
  private publicService = inject(PublicService)

  // --- État de la vue ---
  public isProjectSelected: boolean = false;
  public currentProject: any | null = null;
  public projectSearch: string = '';
  isSavingSales = false;

  // --- Données Mockées (Projets) ---
  public projects: any[] = [];
  vehicles: any[] = [];
  errors: any = []
  isSaving: boolean = false;
  drivers: any[] = [];
  devise: string = ''
  showDeleteChargeModal = false;
  chargeToDelete: any = null;
  chargeToDeleteIndex = -1;
  deleteChargeWord = '';

  // --- Gestion des Onglets ---
  public activeTab: string = 'harvest';

  public harvestTabs: Tab[] = [
    {
      key: 'harvest',
      label: 'Récolte & Transport',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v7a1 1 0 001 1h1m8-8a1 1 0 00-1 1v7a1 1 0 001 1h1m-8 0h1" /></svg>`
    },
    {
      key: 'costs',
      label: 'Bilan Coûts',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>`
    },
    {
      key: 'sales',
      label: 'Ventes',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
    }
  ];

  // --- Données Récolte ---
  public harvestForm = {
    quantity: null as number | null,
    date: '',
    transportType: '',
    driverName: ''
  };

  searchProject: string = ''
  isLoading: boolean = false;
  pagination: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };

  public transportCharges: TransportCharge[] = [];

  // --- Données Ventes ---
  public salesValidated: boolean = false;
  public salesForm = {
    rawAmount: 0,
    transformedItems: [] as TransformedItem[]
  };

  constructor() { }

  ngOnInit(): void {
    this.fetchProjects(1);
    this.publicService.getSettingOipah().subscribe({
      next: (res: any) => {
        this.devise = res?.devise
      }
    })
  }

  // --- Méthodes de Navigation ---

  fetchProjects(page: number = 1): void {
    this.isLoading = true;
    setPagination(
      (page, term) =>
        this.projectService.getEndedProjects(page, term),
      page,
      this.searchProject,
      (data: any) => {
        this.pagination = data;
        this.projects = data?.listItems;
        this.isLoading = false;
      },
    );
  }

  getStatusName(status: string): string {
    return statutProject.find((s) => s.value === status)?.name || 'Inconnu';
  }

  selectProject(project: any): void {
    this.currentProject = project;
    this.isProjectSelected = true;
    this.projectService.getVehicle().subscribe({
      next: (res: any) => {
        this.vehicles = res?.result
      }
    })

    this.projectService.getDrivers().subscribe({
      next: (res: any) => {
        this.drivers = res?.result
      }
    })

    this.projectService.getFinalizeProject(project?.id).subscribe({
      next: (res: any) => {
        this.harvestForm.quantity = res?.others?.harvest_qty || 0;
        this.harvestForm.date = res?.others?.harvest_date || '';
        this.harvestForm.transportType = res?.others?.vehicle_id || '';
        this.harvestForm.driverName = res?.others?.driver_id || '';
        this.transportCharges = res?.result || [];
        this.getTotalTransportCharges()
      }
    })
  }


  deselectProject(): void {
    this.isProjectSelected = false;
    this.currentProject = null;
    this.activeTab = 'harvest';
    this.resetForms();
  }

  private resetForms(): void {
    this.harvestForm = { quantity: null, date: '', transportType: '', driverName: '' };
    this.transportCharges = [];
    this.salesForm = { rawAmount: 0, transformedItems: [] };
  }

  // --- Méthodes Récolte ---

  saveHarvestStep(): void {
    this.isSaving = true
    const data = {
      checker: 'charge',
      harvest: this.harvestForm,
      transportCharges: this.transportCharges
    }
    this.projectService.postFinalizeProject(this.currentProject?.id, data).subscribe({
      next: () => {
        this.isSaving = false
        toastShow('success', 'Données de récolte et transport enregistrées avec succès !');
        this.errors = []
      },
      error: (err) => {
        this.errors = err.error.errors || {};
        this.isSaving = false
        showError(err, err.status, this.errors, err.error, document.getElementById('a'));
      }
    })
  }


  saveSales(): void {
    this.isSavingSales = true;

    const payload = {
      checker: 'recapSell',
      raw_amount: this.salesForm.rawAmount,
      transformed_items: this.salesForm.transformedItems,
      total: Number(this.currentProject?.budget) + Number(this.getTotalTransformed()),
    };
    this.projectService.postFinalizeProject(this.currentProject?.id, payload).subscribe({
      next: () => {
        this.isSavingSales = false
        toastShow('success', 'Données de ventes enregistrées avec succès !');
        this.errors = []
      },
      error: (err) => {
        this.errors = err.error.errors || {};
        this.isSavingSales = false
        showError(err, err.status, this.errors, err.error, document.getElementById('a'));
      }
    })
  }


  // --- Méthodes Transport & Charges ---

  addTransportCharge(): void {
    const lastCharge = this.transportCharges[this.transportCharges.length - 1];

    if (
      lastCharge &&
      (
        !lastCharge.label?.trim() ||
        lastCharge.amount <= 0 ||
        !lastCharge.date
      )
    ) {
      alert('Bien vouloir remplir tous les champs.');
      return;
    }

    this.transportCharges.push({
      id: 0,
      label: '',
      amount: 0,
      date: null
    });
  }

  openDeleteChargeModal(index: number, idCharge: number): void {
    this.chargeToDeleteIndex = index;
    this.chargeToDelete = idCharge;
    this.deleteChargeWord = '';
    this.showDeleteChargeModal = true;
  }


  confirmDeleteCharge(): void {
    if (this.deleteChargeWord !== 'Supprimer') return;
    this.projectService.delFinalizeProject(this.chargeToDelete).subscribe({
      next: () => {
        this.transportCharges.splice(this.chargeToDeleteIndex, 1);
        this.closeDeleteChargeModal();
        toastShow('success', 'Charge supprimée avec succès !');
      },
      error: (err) => {
        this.errors = err.error.errors || {};
        this.isSaving = false
        showError(err, err.status, this.errors, err.error, document.getElementById('a'));
        if (err.status === 404) {
          this.transportCharges.splice(this.chargeToDeleteIndex, 1);
          this.closeDeleteChargeModal();
        }
      }
    })

  }


  getTotalTransportCharges(): number {
    return this.transportCharges.reduce((total, charge) => total + (Number(charge.amount) || 0), 0);
  }

  // --- Méthodes Ventes ---

  addTransformedItem(): void {
    const items = this.salesForm.transformedItems;
    const lastItem = items[items.length - 1];

    if (
      lastItem &&
      (
        !lastItem.unit?.trim() ||
        !lastItem.name?.trim() ||
        lastItem.qty <= 0 ||
        lastItem.amount <= 0
      )
    ) {
      alert('Bien vouloir remplir tous les champs.');
      return;
    }

    items.push({
      id: Date.now(),
      unit: '',
      name: '',
      qty: 0,
      amount: 0
    });
  }

  removeTransformedItem(id: number): void {
    this.salesForm.transformedItems = this.salesForm.transformedItems.filter(item => item.id !== id);
  }

  getTotalTransformed(): number {
    return this.salesForm.transformedItems.reduce((total, item) => total + (item.amount || 0), 0);
  }


  closeDeleteChargeModal(): void {
    this.showDeleteChargeModal = false;
    this.chargeToDelete = null;
    this.chargeToDeleteIndex = -1;
    this.deleteChargeWord = '';
  }
}
