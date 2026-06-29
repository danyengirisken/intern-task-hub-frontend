import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/**
 * Henüz geliştirilmemiş ekranlar için yer tutucu.
 * Menüden gelen başlık route data'sından okunur. Gerçek ekran hazır olunca
 * ilgili route bu component yerine kendi component'ine bağlanır.
 */
@Component({
  selector: 'app-placeholder',
  standalone: true,
  imports: [],
  template: `
    <div class="placeholder">
      <span class="material-icons">construction</span>
      <h1>{{ title }}</h1>
      <p>Bu ekran yapım aşamasında.</p>
    </div>
  `,
  styles: [
    `
      .placeholder {
        background: #fff;
        border: 1px dashed #cbd5e1;
        border-radius: 14px;
        padding: 3rem 2rem;
        text-align: center;
        color: #475569;
      }
      .material-icons {
        font-size: 48px;
        color: #94a3b8;
      }
      h1 {
        margin: 0.75rem 0 0.25rem;
        color: #0f172a;
      }
    `,
  ],
})
export class PlaceholderComponent {
  private readonly route = inject(ActivatedRoute);
  readonly title: string = this.route.snapshot.data['title'] ?? 'Ekran';
}
