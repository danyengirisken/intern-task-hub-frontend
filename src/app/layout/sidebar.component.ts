import { NgTemplateOutlet } from '@angular/common';
import { Component, EventEmitter, HostBinding, Input, Output, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { buildMenuTree, MenuNode, UserDto } from '../core/models';

/** Menü boşsa kullanılacak varsayılan navigasyon (backend menü göndermezse). */
const FALLBACK_MENU: MenuNode[] = [
  { id: -1, parentId: null, title: 'Dashboard', page: 'dashboard', icon: 'dashboard', menuOrder: 1, children: [] },
  { id: -2, parentId: null, title: 'Görevler', page: 'gorevler', icon: 'checklist', menuOrder: 2, children: [] },
  { id: -3, parentId: null, title: 'Kullanıcılar', page: 'kullanicilar', icon: 'group', menuOrder: 3, children: [] },
];

/**
 * Sol kenar navigasyonu (Jira benzeri). Menüler backend'den (login cevabı) gelir;
 * boşsa varsayılan menü gösterilir. Masaüstünde daraltılabilir (icon-rail),
 * mobilde üstten açılan çekmece olarak çalışır.
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

  readonly user: UserDto | null = this.auth.getUser();

  readonly menuTree: MenuNode[] = (() => {
    const tree = buildMenuTree(this.auth.getMenus());
    return tree.length ? tree : FALLBACK_MENU;
  })();

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
