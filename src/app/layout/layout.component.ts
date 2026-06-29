import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopMenuComponent } from './top-menu.component';

/**
 * Korumalı sayfaların ortak çerçevesi: üstte menü, altında ekran içeriği.
 * Tüm ekranlar (dashboard, vb.) bu layout'un router-outlet'i içinde açılır.
 */
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, TopMenuComponent],
  template: `
    <app-top-menu></app-top-menu>
    <main class="app-content">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [
    `
      .app-content {
        max-width: 1280px;
        margin: 0 auto;
        padding: 1.5rem 1.25rem;
      }
    `,
  ],
})
export class LayoutComponent {}
