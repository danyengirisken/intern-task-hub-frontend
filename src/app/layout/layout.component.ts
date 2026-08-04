import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar.component';

/**
 * Korumalı sayfaların ortak çerçevesi: solda sabit sidebar, sağda ekran içeriği.
 * Masaüstünde sidebar daraltılabilir; mobilde hamburger ile açılan çekmece olur.
 */
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <div class="shell">
      <app-sidebar
        [collapsed]="collapsed()"
        [mobileOpen]="mobileOpen()"
        (toggleCollapse)="collapsed.set(!collapsed())"
        (closeMobile)="mobileOpen.set(false)"
      ></app-sidebar>

      @if (mobileOpen()) {
        <div class="backdrop" (click)="mobileOpen.set(false)"></div>
      }

      <div class="main">
        <header class="mobile-bar">
          <button class="icon-btn" type="button" (click)="mobileOpen.set(true)" aria-label="Menü">
            <span class="material-icons">menu</span>
          </button>
          <span class="mb-title">Intern Task Hub</span>
        </header>

        <main class="content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      .shell { display: flex; min-height: 100vh; }
      .main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
      .content { flex: 1; padding: 1.75rem 2rem; max-width: 1400px; width: 100%; margin: 0 auto; }

      .backdrop {
        position: fixed; inset: 0; z-index: 40;
        background: rgba(16, 24, 40, 0.5);
        display: none;
      }

      .mobile-bar {
        display: none;
        align-items: center;
        gap: 0.6rem;
        height: 56px;
        padding: 0 0.75rem;
        background: var(--surface);
        border-bottom: 1px solid var(--border);
        position: sticky; top: 0; z-index: 30;
      }
      .mb-title { font-weight: 700; }

      @media (max-width: 900px) {
        .backdrop { display: block; }
        .mobile-bar { display: flex; }
        .content { padding: 1.1rem 1rem; }
      }
    `,
  ],
})
export class LayoutComponent {
  readonly collapsed = signal(false);
  readonly mobileOpen = signal(false);
}
