import { Routes } from '@angular/router';

import { authGuard } from './core/auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LayoutComponent } from './layout/layout.component';
import { LoginComponent } from './login/login.component';
import { PlaceholderComponent } from './shared/placeholder.component';
import { RolAtamaComponent } from './sistem/rol-atama.component';
import { ProjelerComponent } from './views/projeler/project-list/projeler.component';
import { ProjeEditComponent } from './views/projeler/project-edit/proje-edit.component';
import { GorevlerComponent } from './views/gorevler/gorevler-list-edit/gorevler.component';
import { SprintListComponent } from './views/sprintler/sprint-list/sprint-list.component';
import { SprintEditComponent } from './views/sprintler/sprint-edit/sprint-edit.component';


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
    canActivate: [authGuard],
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
      {
        path: 'gorevler',
        component: GorevlerComponent
      },
      {
        path: 'sistem/rol-atama',
        component: RolAtamaComponent
      },
      {
        path: 'kullanicilar',
        component: PlaceholderComponent,
        data: { title: 'Kullanıcılar' }
      },
      {
        path: 'projeler',
        component: ProjelerComponent,
        data: { title: 'Projeler' }
      },
      
      { path: 'sprintler', component: SprintListComponent },


      { path: 'sprintler', component: SprintListComponent },


      { path: 'sprintler/yeni', component: SprintEditComponent },


      { path: 'sprintler/duzenle/:id', component: SprintEditComponent },

      { path: 'projeler/yeni', component: ProjeEditComponent },
      { path: 'projeler/duzenle/:id', component: ProjeEditComponent },
      
      { path: 'sprintler', component: SprintListComponent },
      { path: 'sprintler/yeni', component: SprintEditComponent },
      { path: 'sprintler/duzenle/:id', component: SprintEditComponent },


      {
        path: 'projeler/edit',
        component: ProjeEditComponent,
        data: { title: 'Yeni Proje' }
      },


      {
        path: 'projeler/edit/:id',
        component: ProjeEditComponent,
        data: { title: 'Proje Düzenle' }
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];