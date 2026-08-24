import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { PartnerRequest } from '../../../core/models';
import { PartnerService } from '../../../services/partner.service';

/**
 * Partner oluşturma / düzenleme ekranı (Sistem Ayarları > Partnerler).
 * Yalnızca ADMIN erişebilir; yetkisiz istekte backend 403 döner.
 */
@Component({
  selector: 'app-partner-edit',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './partner-edit.component.html',
  styleUrl: './partner-edit.component.scss',
})
export class PartnerEditComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly partnerService = inject(PartnerService);

  readonly saving = signal(false);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly editingId = signal<number | null>(null);

  readonly form = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.maxLength(12)]],
    name: ['', [Validators.required, Validators.maxLength(100)]],
    usingLanguage: ['tr'],
    description: [''],
    active: ['1'],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const numericId = Number(id);
      this.editingId.set(numericId);
      this.load(numericId);
    }
  }

  load(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.partnerService.findById(id).subscribe({
      next: (partner) => {
        this.form.patchValue({
          code: partner.code,
          name: partner.name,
          usingLanguage: partner.usingLanguage ?? 'tr',
          description: partner.description ?? '',
          active: partner.active ?? '1',
        });
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(
          err?.status === 403
            ? 'Bu ekranı görüntülemek için yönetici yetkisi gerekiyor.'
            : 'Partner bilgileri yüklenemedi.',
        );
        this.loading.set(false);
      },
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const value = this.form.getRawValue();
    const request: PartnerRequest = {
      id: this.editingId(),
      code: value.code.trim().toUpperCase(),
      name: value.name.trim(),
      usingLanguage: value.usingLanguage || 'tr',
      description: value.description || null,
      active: value.active,
    };

    this.partnerService.save(request).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/partnerler']);
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err?.error?.message ?? 'Partner kaydedilemedi.');
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/partnerler']);
  }
}
