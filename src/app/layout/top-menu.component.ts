import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { buildMenuTree, MenuNode, UserDto } from '../core/models';

/**
 * Profesyonel üst menü (navbar).
 * Menüler backend'den (login cevabı) gelir; parentId'ye göre hiyerarşik
 * dropdown olarak render edilir. Yeni ekran = backend'de bir S_MENU satırı.
 */
@Component({
  selector: 'app-top-menu',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './top-menu.component.html',
  styleUrl: './top-menu.component.scss',
})
export class TopMenuComponent {
  private readonly auth = inject(AuthService);

  readonly user: UserDto | null = this.auth.getUser();
  readonly menuTree: MenuNode[] = buildMenuTree(this.auth.getMenus());

  /** Açık olan üst menü id'si (mobil/tık ile açılan dropdown). */
  readonly openId = signal<number | null>(null);
  readonly userOpen = signal(false);

  get initials(): string {
    const name = this.user?.fullName?.trim();
    if (!name) {
      return '?';
    }
    const parts = name.split(/\s+/);
    const first = parts[0]?.charAt(0) ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
    return (first + last).toUpperCase();
  }

  toggleMenu(id: number): void {
    this.openId.update((cur) => (cur === id ? null : id));
    this.userOpen.set(false);
  }

  toggleUser(): void {
    this.userOpen.update((v) => !v);
    this.openId.set(null);
  }

  closeAll(): void {
    this.openId.set(null);
    this.userOpen.set(false);
  }

  logout(): void {
    this.auth.logout();
  }

  /** Menü/kullanıcı alanı dışına tıklanınca açık dropdown'ları kapat. */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.nav-item.has-children') && !target.closest('.user-area')) {
      this.closeAll();
    }
  }
}
