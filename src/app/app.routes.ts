import { Routes } from '@angular/router';

import { authGuard } from './core/auth.guard';
import { menuGuard } from './core/menu.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LayoutComponent } from './layout/layout.component';
import { LoginComponent } from './login/login.component';
import { KullanicilarComponent } from './sistem/kullanicilar/kullanicilar.component';
import { RolAtamaComponent } from './sistem/rol-atama.component';
import { ProjelerComponent } from './views/projeler/project-list/projeler.component';
import { ProjeEditComponent } from './views/projeler/project-edit/proje-edit.component';
import { GorevlerComponent } from './views/gorevler/gorevler-list-edit/gorevler.component';
import { SprintListComponent } from './views/sprintler/sprint-list/sprint-list.component';
import { SprintEditComponent } from './views/sprintler/sprint-edit/sprint-edit.component';
import { PartnerlerComponent } from './views/partnerler/partner-list/partnerler.component';
import { PartnerEditComponent } from './views/partnerler/partner-edit/partner-edit.component';

/**
 * Korumalı ekranlar LayoutComponent altında toplanır:
 *  - authGuard : oturum var mı?
 *  - menuGuard : adres, kullanıcının menüsündeki (yetkili olduğu) sayfalardan biri mi?
 *
 * Menü ağacı S_MENU'dan gelir; buradaki path'ler S_MENU.page değerleriyle eşleşmelidir.
 */
export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    // Kayıt Ol rotası authGuard'a takılmaması için children dışına alındı
    path: 'register',
    loadComponent: () => import('./register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard, menuGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent
      },

      // Çalışma Alanı
      {
        path: 'projeler',
        component: ProjelerComponent,
        data: { title: 'Projeler' }
      },
      {
        path: 'projeler/yeni',
        component: ProjeEditComponent,
        data: { title: 'Yeni Proje' }
      },
      {
        path: 'projeler/duzenle/:id',
        component: ProjeEditComponent,
        data: { title: 'Proje Düzenle' }
      },
      {
        path: 'gorevler',
        component: GorevlerComponent,
        data: { title: 'Görevler' }
      },
      { path: 'sprintler', component: SprintListComponent, data: { title: 'Sprintler' } },
      { path: 'sprintler/yeni', component: SprintEditComponent, data: { title: 'Yeni Sprint' } },
      { path: 'sprintler/duzenle/:id', component: SprintEditComponent, data: { title: 'Sprint Düzenle' } },

      // Sistem Ayarları (ADMIN / Partner Yöneticisi)
      {
        path: 'sistem/kullanicilar',
        component: KullanicilarComponent,
        data: { title: 'Kullanıcılar' }
      },
      {
        path: 'sistem/rol-atama',
        component: RolAtamaComponent,
        data: { title: 'Kullanıcılara Rol Atama' }
      },

      // Partnerler (yalnızca ADMIN)
      {
        path: 'partnerler',
        component: PartnerlerComponent,
        data: { title: 'Partnerler' }
      },
      {
        path: 'partnerler/yeni',
        component: PartnerEditComponent,
        data: { title: 'Yeni Partner' }
      },
      {
        path: 'partnerler/duzenle/:id',
        component: PartnerEditComponent,
        data: { title: 'Partner Düzenle' }
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
