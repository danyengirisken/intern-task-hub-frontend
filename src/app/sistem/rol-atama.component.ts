import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RoleItem, UserListItem } from '../core/models';
import { UserService } from './user.service';

/**
 * Kullanıcılara Rol Atama ekranı (Sistem Ayarları > Kullanıcılar).
 * Kullanıcıları listeler; her satırda rol seçilip kaydedilir.
 */
@Component({
  selector: 'app-rol-atama',
  standalone: true,
  imports: [],
  templateUrl: './rol-atama.component.html',
  styleUrl: './rol-atama.component.scss',
})
export class RolAtamaComponent implements OnInit {
  private readonly userService = inject(UserService);

  readonly users = signal<UserListItem[]>([]);
  readonly roles = signal<RoleItem[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly message = signal<string | null>(null);
  readonly savingId = signal<number | null>(null);

  /** userId -> seçili roleId (taslak). */
  private readonly drafts = signal<Record<number, number>>({});

  readonly total = computed(() => this.users().length);

  ngOnInit(): void {
    this.userService.findAllRoles().subscribe({
      next: (roles) => this.roles.set(roles),
      error: () => this.error.set('Roller yüklenemedi.'),
    });
    this.userService.findAllUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.drafts.set(Object.fromEntries(users.map((u) => [u.id, u.roleId])));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Kullanıcılar yüklenemedi.');
        this.loading.set(false);
      },
    });
  }

  draftRole(userId: number): number | undefined {
    return this.drafts()[userId];
  }

  onRoleChange(userId: number, roleId: string): void {
    this.drafts.update((d) => ({ ...d, [userId]: Number(roleId) }));
    this.message.set(null);
  }

  isChanged(user: UserListItem): boolean {
    return this.drafts()[user.id] !== user.roleId;
  }

  save(user: UserListItem): void {
    const roleId = this.drafts()[user.id];
    if (roleId == null || roleId === user.roleId) {
      return;
    }
    this.savingId.set(user.id);
    this.error.set(null);
    this.message.set(null);
    this.userService.assignRole({ userId: user.id, roleId }).subscribe({
      next: (updated) => {
        this.users.update((list) => list.map((u) => (u.id === updated.id ? updated : u)));
        this.savingId.set(null);
        this.message.set(`${updated.fullName} → ${updated.roleName} rolüne atandı.`);
      },
      error: () => {
        this.savingId.set(null);
        this.error.set('Rol atanamadı.');
      },
    });
  }

  initials(name: string): string {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.charAt(0) ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
    return (first + last).toUpperCase() || '?';
  }
}
