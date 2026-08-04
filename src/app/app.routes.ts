import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { GorevlerComponent } from './gorevler/gorevler.component';
import { LayoutComponent } from './layout/layout.component';
import { LoginComponent } from './login/login.component';
import { PlaceholderComponent } from './shared/placeholder.component';
import { RolAtamaComponent } from './sistem/rol-atama.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  // Korumalı alan: üst menülü layout + ekranlar
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },

      // Görevler modülü (CRUD)
      { path: 'gorevler', component: GorevlerComponent },

      // Sistem Ayarları > Kullanıcılar > Kullanıcılara Rol Atama
      { path: 'sistem/rol-atama', component: RolAtamaComponent },

      // Henüz gerçeklenmemiş örnek ekran (placeholder)
      { path: 'kullanicilar', component: PlaceholderComponent, data: { title: 'Kullanıcılar' } },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
