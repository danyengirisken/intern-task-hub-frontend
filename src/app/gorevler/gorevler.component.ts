import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Task, TaskRequest } from '../core/models';
import { TaskService } from './task.service';

interface Option {
  code: string;
  label: string;
}

/**
 * Görevler ekranı: liste + oluştur/güncelle/sil (CRUD).
 */
@Component({
  selector: 'app-gorevler',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './gorevler.component.html',
  styleUrl: './gorevler.component.scss',
})
export class GorevlerComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly taskService = inject(TaskService);

  readonly tasks = signal<Task[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly panelOpen = signal(false);
  readonly editingId = signal<number | null>(null);

  readonly statuses: Option[] = [
    { code: 'TODO', label: 'Yapılacak' },
    { code: 'IN_PROGRESS', label: 'Devam Ediyor' },
    { code: 'DONE', label: 'Tamamlandı' },
  ];
  readonly priorities: Option[] = [
    { code: 'LOW', label: 'Düşük' },
    { code: 'MEDIUM', label: 'Orta' },
    { code: 'HIGH', label: 'Yüksek' },
  ];

  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: [''],
    status: ['TODO', Validators.required],
    priority: ['MEDIUM'],
    dueDate: [''],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.taskService.findAll().subscribe({
      next: (data) => {
        this.tasks.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Görevler yüklenemedi.');
        this.loading.set(false);
      },
    });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ title: '', description: '', status: 'TODO', priority: 'MEDIUM', dueDate: '' });
    this.panelOpen.set(true);
  }

  openEdit(task: Task): void {
    this.editingId.set(task.id);
    this.form.reset({
      title: task.title,
      description: task.description ?? '',
      status: task.status,
      priority: task.priority ?? 'MEDIUM',
      dueDate: task.dueDate ?? '',
    });
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
    const v = this.form.getRawValue();
    const request: TaskRequest = {
      id: this.editingId() ?? undefined,
      title: v.title,
      description: v.description || null,
      status: v.status,
      priority: v.priority || null,
      dueDate: v.dueDate || null,
    };
    this.taskService.save(request).subscribe({
      next: () => {
        this.saving.set(false);
        this.panelOpen.set(false);
        this.load();
      },
      error: () => {
        this.saving.set(false);
        this.error.set('Görev kaydedilemedi.');
      },
    });
  }

  remove(task: Task): void {
    if (!confirm(`"${task.title}" görevi silinsin mi?`)) {
      return;
    }
    this.taskService.delete(task.id).subscribe({
      next: () => this.load(),
      error: () => this.error.set('Görev silinemedi.'),
    });
  }

  statusLabel(code: string): string {
    return this.statuses.find((s) => s.code === code)?.label ?? code;
  }

  priorityLabel(code: string | null): string {
    return this.priorities.find((p) => p.code === code)?.label ?? '-';
  }
}
