import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { Partner } from '../../../core/models';
import { PartnerService } from '../../../services/partner.service';

/**
 * Partner listesi (Sistem Ayarları > Partnerler). Yalnızca ADMIN erişebilir.
 * Partner, kullanıcıların ve projelerin bağlı olduğu tenant'tır.
 */
@Component({
  selector: 'app-partnerler',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './partnerler.component.html',
  styleUrl: './partnerler.component.scss',
})
export class PartnerlerComponent implements OnInit {
  private readonly partnerService = inject(PartnerService);
  private readonly router = inject(Router);

  readonly partners = signal<Partner[]>([]);
  readonly searchTerm = signal('');
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  /** Detay popup'ında gösterilen partner. */
  readonly selectedPartner = signal<Partner | null>(null);

  readonly filteredPartners = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) {
      return this.partners();
    }
    return this.partners().filter(
      (p) =>
        p.name?.toLowerCase().includes(term) ||
        p.code?.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term),
    );
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.partnerService.findAll().subscribe({
      next: (data) => {
        this.partners.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(
          err?.status === 403
            ? 'Bu ekranı görüntülemek için yönetici yetkisi gerekiyor.'
            : 'Partnerler yüklenemedi.',
        );
        this.loading.set(false);
      },
    });
  }

  isActive(partner: Partner): boolean {
    return partner.active === '1';
  }

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  openModal(partner: Partner): void {
    this.selectedPartner.set(partner);
  }

  closeModal(): void {
    this.selectedPartner.set(null);
  }

  editPartner(id: number): void {
    this.router.navigate(['/partnerler/duzenle', id]);
  }

  deletePartner(partner: Partner): void {
    if (!confirm(`"${partner.name}" partneri kalıcı olarak silinsin mi?`)) {
      return;
    }
    this.error.set(null);
    this.partnerService.delete(partner.id).subscribe({
      next: () => this.load(),
      error: (err) => this.error.set(err?.error?.message ?? 'Partner silinemedi.'),
    });
  }
}
