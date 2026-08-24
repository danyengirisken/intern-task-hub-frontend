import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../../core/auth.service';
import { Partner, ProjectRequest } from '../../../core/models';
import { PartnerService } from '../../../services/partner.service';
import { ProjectService } from '../../../services/project.service';

/**
 * Proje oluşturma / düzenleme.
 *
 * Partner seçimi yalnızca ADMIN'e görünür: sistemi kullanan firmalara (partner)
 * proje açabilmesi için. Diğer kullanıcılarda backend projeyi otomatik olarak
 * oturumdaki kullanıcının partnerine bağlar.
 */
@Component({
  selector: 'app-proje-edit',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './proje-edit.component.html',
  styleUrl: './proje-edit.component.scss',
})
export class ProjeEditComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly projectService = inject(ProjectService);
  private readonly partnerService = inject(PartnerService);
  private readonly auth = inject(AuthService);

  readonly isAdmin = this.auth.isAdmin();

  readonly saving = signal(false);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly editingId = signal<number | null>(null);
  readonly partners = signal<Partner[]>([]);

  readonly form = this.fb.nonNullable.group({
    partnerId: [''],
    name: ['', Validators.required],
    description: [''],
    code: [''],
    // Backend T_PROJECT.active VARCHAR(2): '1' aktif, '0' pasif
    active: ['1'],
    startDate: [''],
    endDate: [''],
  });

  ngOnInit(): void {
    // Partner listesi yalnızca ADMIN'e açıktır (diğerlerinde 403 döner).
    if (this.isAdmin) {
      this.form.controls.partnerId.setValidators(Validators.required);
      this.partnerService.findAll().subscribe({
        next: (partners) => {
          this.partners.set(partners);
          if (!this.form.controls.partnerId.value && partners.length) {
            this.form.controls.partnerId.setValue(String(partners[0].id));
          }
        },
        error: () => this.error.set('Partner listesi yüklenemedi.'),
      });
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const numericId = Number(id);
      this.editingId.set(numericId);
      this.loadProject(numericId);
    }
  }

  loadProject(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.projectService.findById(id).subscribe({
      next: (project) => {
        this.form.patchValue({
          partnerId: String(project.partner_id ?? ''),
          name: project.name,
          description: project.description ?? '',
          code: project.code ?? '',
          active: project.active ?? '1',
          startDate: project.start_date ?? '',
          endDate: project.end_date ?? '',
        });

        this.loading.set(false);
      },
      error: (err) => {
        console.error('Project findById error:', err);
        this.error.set('Proje bilgileri yüklenemedi.');
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

    const request: ProjectRequest = {
      id: this.editingId(),
      // Partner yalnızca ADMIN tarafından gönderilir; backend diğerlerinde yok sayar.
      partnerId: this.isAdmin && value.partnerId ? Number(value.partnerId) : null,
      name: value.name,
      description: value.description || null,
      code: value.code || null,
      // '0' falsy degil; dogrudan gonderilir
      active: value.active,
      startDate: value.startDate ? value.startDate : undefined,
      endDate: value.endDate ? value.endDate : undefined,
    };

    this.projectService.save(request).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/projeler']);
      },
      error: (err) => {
        console.error('Project save error:', err);
        this.saving.set(false);
        this.error.set(err?.error?.message ?? 'Proje kaydedilemedi.');
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/projeler']);
  }
}
