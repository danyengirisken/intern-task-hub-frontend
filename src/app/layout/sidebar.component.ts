import { NgTemplateOutlet } from '@angular/common';
import { Component, EventEmitter, HostBinding, Input, Output, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { buildMenuTree, MenuNode, UserDto } from '../core/models';

/**
 * Sol kenar navigasyonu (Jira benzeri). Menüler backend'den (login cevabı) gelir
 * ve kullanıcının rolünün yetkilerine göre üretilir — burada sabit menü yoktur,
 * aksi hâlde yetkisiz ekranlar da görünürdü. Masaüstünde daraltılabilir
 * (icon-rail), mobilde üstten açılan çekmece olarak çalışır.
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgTemplateOutlet],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  private readonly auth = inject(AuthService);

  @Input() collapsed = false;
  @Input() mobileOpen = false;
  @Output() toggleCollapse = new EventEmitter<void>();
  @Output() closeMobile = new EventEmitter<void>();

  @HostBinding('class.collapsed') get isCollapsed() { return this.collapsed; }
  @HostBinding('class.mobile-open') get isMobileOpen() { return this.mobileOpen; }

  get user(): UserDto | null {
    return this.auth.getUser();
  }

  readonly menuTree: MenuNode[] = buildMenuTree(this.auth.getMenus());

  /** Açık olan alt menü grupları. */
  private readonly expanded = signal<Set<number>>(new Set(this.menuTree.filter((m) => m.children.length).map((m) => m.id)));

  isExpanded = (id: number) => this.expanded().has(id);

  get initials(): string {
    const name = this.user?.fullName?.trim();
    if (!name) return '?';
    const parts = name.split(/\s+/);
    const first = parts[0]?.charAt(0) ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
    return (first + last).toUpperCase();
  }

  readonly userOpen = signal(false);

  toggleGroup(id: number): void {
    this.expanded.update((set) => {
      const next = new Set(set);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  onNavigate(): void {
    this.userOpen.set(false);
    this.closeMobile.emit();
  }

  logout(): void {
    this.auth.logout();
  }
}
