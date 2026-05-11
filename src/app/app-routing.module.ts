// angular import
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Project import
import { AdminLayout } from './theme/layouts/admin-layout/admin-layout.component';
import { GuestLayoutComponent } from './theme/layouts/guest-layout/guest-layout.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayout,
    children: [
      {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./demo/dashboard/default/default.component').then((c) => c.DefaultComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./demo/pages/users/users.component').then((c) => c.UsersComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./demo/dashboard/settings/settings.component').then((c) => c.SettingsComponent)
      },

      {
        path: 'grantors',
        loadComponent: () => import('./demo/pages/grantors/grantors.component').then((c) => c.GrantorsComponent)
      },
      {
        path: 'plot-of-land',
        loadComponent: () => import('./demo/pages/plot-land/plot-land.component').then((c) => c.PlotLandComponent)
      },
    ]
  },
  {
    path: '',
    component: GuestLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () => import('./demo/pages/authentication/auth-login/auth-login.component').then((c) => c.AuthLoginComponent)
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./demo/pages/authentication/auth-register/auth-register.component').then((c) => c.AuthRegisterComponent)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
