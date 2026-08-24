import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ProjectRequest } from '../../../core/models';
import { ProjectService } from '../../../services/project.service';

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

  readonly saving = signal(false);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly editingId = signal<number | null>(null);

  readonly form = this.fb.nonNullable.group({
    // partnerId buradan kaldırıldı
    name: ['', Validators.required],
    description: [''],
    code: [''],
    active: [1],
    startDate: [''],
    endDate: [''],
  });

  ngOnInit(): void {
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
          // partnerId buradan kaldırıldı
          name: project.name,
          description: project.description ?? '',
          code: project.code ?? '',
          active: project.active ?? 1,
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
      // partnerId artık backend'de otomatik atanacağı için istekten (request) çıkarıldı
      name: value.name,
      description: value.description || null,
      code: value.code || null,
      active: value.active || null,
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
        this.error.set('Proje kaydedilemedi.');
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/projeler']);
  }
}