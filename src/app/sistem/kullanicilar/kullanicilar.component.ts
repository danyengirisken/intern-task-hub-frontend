import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth.service';
import { Partner, RoleItem, UserListItem, UserRequest } from '../../core/models';
import { PartnerService } from '../../services/partner.service';
import { UserService } from '../user.service';

/**
 * Kullanıcılar ekranı (Sistem Ayarları > Kullanıcılar) — listeleme + CRUD.
 *
 * Kimin neyi görüp yönettiğini backend belirler:
 *  - ADMIN          : tüm partnerlerin kullanıcıları; kullanıcı açarken partner seçebilir
 *  - CUSTOMER_ADMIN : yalnızca kendi partnerinin kullanıcıları; açtığı kullanıcılar
 *                     otomatik kendi partnerine bağlanır, ADMIN rolünü veremez
 *  - CUSTOMER       : bu ekrana erişemez (403)
 */
@Component({
  selector: 'app-kullanicilar',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './kullanicilar.component.html',
  styleUrl: './kullanicilar.component.scss',
})
export class KullanicilarComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly partnerService = inject(PartnerService);
  private readonly auth = inject(AuthService);

  readonly isAdmin = this.auth.isAdmin();

  readonly users = signal<UserListItem[]>([]);
  readonly roles = signal<RoleItem[]>([]);
  readonly partners = signal<Partner[]>([]);
  readonly searchTerm = signal('');
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly message = signal<string | null>(null);

  readonly panelOpen = signal(false);
  readonly editingId = signal<number | null>(null);

  readonly filteredUsers = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) {
      return this.users();
    }
    return this.users().filter(
      (u) =>
        u.fullName?.toLowerCase().includes(term) ||
        u.username?.toLowerCase().includes(term) ||
        u.roleName?.toLowerCase().includes(term) ||
        u.partnerName?.toLowerCase().includes(term),
    );
  });

  readonly form = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    username: ['', Validators.required],
    password: [''],
    roleId: ['', Validators.required],
    partnerId: [''],
  });

  ngOnInit(): void {
    this.load();

    this.userService.findAllRoles().subscribe({
      next: (roles) => this.roles.set(roles),
      error: () => this.error.set('Roller yüklenemedi.'),
    });

    // Partner listesi yalnızca ADMIN'e açıktır (diğerlerinde 403 döner).
    if (this.isAdmin) {
      this.partnerService.findAll().subscribe({
        next: (partners) => this.partners.set(partners),
        error: () => this.error.set('Partnerler yüklenemedi.'),
      });
    }
  }

  load(): void {
    this.loading.set(true);
    this.userService.findAllUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(
          err?.status === 403
            ? 'Bu ekranı görüntüleme yetkiniz yok.'
            : 'Kullanıcılar yüklenemedi.',
        );
        this.loading.set(false);
      },
    });
  }

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  // ---- CRUD ----
  openCreate(): void {
    this.editingId.set(null);
    this.message.set(null);
    this.error.set(null);
    this.form.reset({
      fullName: '',
      username: '',
      password: '',
      roleId: String(this.roles().find((r) => r.name === 'CUSTOMER')?.id ?? this.roles()[0]?.id ?? ''),
      partnerId: String(this.partners()[0]?.id ?? ''),
    });
    // Yeni kayıtta şifre zorunlu
    this.form.controls.password.setValidators([Validators.required, Validators.minLength(4)]);
    this.form.controls.password.updateValueAndValidity();
    this.panelOpen.set(true);
  }

  openEdit(user: UserListItem): void {
    this.editingId.set(user.id);
    this.message.set(null);
    this.error.set(null);
    this.form.reset({
      fullName: user.fullName,
      username: user.username,
      password: '',
      roleId: String(user.roleId),
      partnerId: String(user.partnerId ?? ''),
    });
    // Güncellemede şifre opsiyonel (boş bırakılırsa değişmez)
    this.form.controls.password.setValidators([Validators.minLength(4)]);
    this.form.controls.password.updateValueAndValidity();
    this.panelOpen.set(true);
  }

  close(): void {
    this.panelOpen.set(false);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.error.set(null);

    const v = this.form.getRawValue();
    const request: UserRequest = {
      id: this.editingId(),
      fullName: v.fullName,
      username: v.username,
      password: v.password || null,
      roleId: Number(v.roleId),
      // Partner seçimi yalnızca ADMIN'de anlamlı; backend diğerlerinde yok sayar.
      partnerId: this.isAdmin && v.partnerId ? Number(v.partnerId) : null,
    };

    this.userService.saveUser(request).subscribe({
      next: (saved) => {
        this.saving.set(false);
        this.panelOpen.set(false);
        this.message.set(`${saved.fullName} kaydedildi.`);
        this.load();
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err?.error?.message ?? 'Kullanıcı kaydedilemedi.');
      },
    });
  }

  remove(user: UserListItem): void {
    if (!confirm(`"${user.fullName}" kullanıcısı silinsin mi?`)) {
      return;
    }
    this.error.set(null);
    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.message.set(`${user.fullName} silindi.`);
        this.load();
      },
      error: (err) => this.error.set(err?.error?.message ?? 'Kullanıcı silinemedi.'),
    });
  }

  initials(name: string): string {
    const parts = (name ?? '').trim().split(/\s+/);
    const first = parts[0]?.charAt(0) ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
    return (first + last).toUpperCase() || '?';
  }

  /** Rol etiketini okunur hâle getirir. */
  roleLabel(roleName: string): string {
    switch (roleName) {
      case 'ADMIN':
        return 'Sistem Yöneticisi';
      case 'CUSTOMER_ADMIN':
        return 'Partner Yöneticisi';
      case 'CUSTOMER':
        return 'Kullanıcı';
      default:
        return roleName;
    }
  }
}
