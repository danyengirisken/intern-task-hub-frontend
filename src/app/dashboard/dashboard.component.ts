import { Component, inject } from '@angular/core';
import { AuthService } from '../core/auth.service';

/**
 * Giriş yapan kullanıcının bilgilerini gösteren dashboard ekranı.
 * Üst menü ve çıkış işlemleri LayoutComponent tarafından sağlanır.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly auth = inject(AuthService);

  readonly user = this.auth.getUser();
}
