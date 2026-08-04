import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Task, TaskRequest } from '../core/models';
import { PRIORITIES, STATUSES, formatDate, isOverdue, priorityMeta, statusMeta, todayIso } from '../core/task-meta';
import { TaskBoardComponent } from './task-board.component';
import { TaskService } from './task.service';

type ViewMode = 'board' | 'list';

/**
 * Görevler çalışma alanı: Pano (Kanban) ve Liste görünümleri, arama/filtre/sıralama
 * ve oluştur/güncelle/sil (CRUD). Tek veri kaynağı (tasks) her iki görünümü besler.
 */
@Component({
  selector: 'app-gorevler',
  standalone: true,
  imports: [ReactiveFormsModule, TaskBoardComponent],
  templateUrl: './gorevler.component.html',
  styleUrl: './gorevler.component.scss',
})
export class GorevlerComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly taskService = inject(TaskService);

  readonly statuses = STATUSES;
  readonly priorities = PRIORITIES;
  readonly statusMeta = statusMeta;
  readonly priorityMeta = priorityMeta;
  readonly formatDate = formatDate;
  private readonly today = todayIso();

  readonly tasks = signal<Task[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly panelOpen = signal(false);
  readonly editingId = signal<number | null>(null);

  // Görünüm & filtreler
  readonly view = signal<ViewMode>('board');
  readonly search = signal('');
  readonly statusFilter = signal<string>('');
  readonly priorityFilter = signal<string>('');

  readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const sf = this.statusFilter();
    const pf = this.priorityFilter();
    return this.tasks().filter((t) => {
      if (sf && t.status !== sf) return false;
      if (pf && t.priority !== pf) return false;
      if (q && !(`${t.title} ${t.description ?? ''}`.toLowerCase().includes(q))) return false;
      return true;
    });
  });

  readonly counts = computed(() => {
    const all = this.tasks();
    return {
      total: all.length,
      done: all.filter((t) => t.status === 'DONE').length,
    };
  });

  readonly hasActiveFilter = computed(() => !!(this.search() || this.statusFilter() || this.priorityFilter()));

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

  setView(v: ViewMode): void {
    this.view.set(v);
  }

  clearFilters(): void {
    this.search.set('');
    this.statusFilter.set('');
    this.priorityFilter.set('');
  }

  overdue(task: Task): boolean {
    return isOverdue(task.dueDate, task.status, this.today);
  }

  // ---- CRUD ----
  openCreate(status: string = 'TODO'): void {
    this.editingId.set(null);
    this.form.reset({ title: '', description: '', status, priority: 'MEDIUM', dueDate: '' });
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
    if (!confirm(`"${task.title}" görevi silinsin mi?`)) return;
    this.taskService.delete(task.id).subscribe({
      next: () => this.tasks.update((list) => list.filter((t) => t.id !== task.id)),
      error: () => this.error.set('Görev silinemedi.'),
    });
  }

  /** Kanban sürükle-bırak: durumu iyimser (optimistic) günceller, backend'e yazar. */
  onStatusChange(evt: { task: Task; status: string }): void {
    const { task, status } = evt;
    const prev = task.status;
    this.tasks.update((list) => list.map((t) => (t.id === task.id ? { ...t, status } : t)));
    const request: TaskRequest = {
      id: task.id,
      title: task.title,
      description: task.description,
      status,
      priority: task.priority,
      dueDate: task.dueDate,
    };
    this.taskService.save(request).subscribe({
      error: () => {
        // Geri al
        this.tasks.update((list) => list.map((t) => (t.id === task.id ? { ...t, status: prev } : t)));
        this.error.set('Durum güncellenemedi.');
      },
    });
  }
}
