import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskService } from '../../../services/task.service';
import { ProjectService } from '../../../services/project.service';
import { SprintService } from '../../../services/sprint.service';
import { Project, Sprint, Task, TaskRequest } from '../../../core/models';
import { TaskBoardComponent } from './task-board.component';

import { PRIORITIES, STATUSES, statusMeta, formatDate, isOverdue, priorityMeta, todayIso } from '../../../core/task-meta';

type ViewMode = 'board' | 'list';

/**
 * Görevler çalışma alanı: Pano (Kanban) ve Liste görünümleri, arama/filtre
 * ve oluştur/güncelle/sil (CRUD). Tek veri kaynağı (tasks) her iki görünümü besler.
 *
 * Hiyerarşi: partner → proje → sprint → görev. Görev bir projeye zorunlu,
 * bir sprinte opsiyonel olarak bağlanır (sprint seçilmezse backlog'da kalır).
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
  private readonly projectService = inject(ProjectService);
  private readonly sprintService = inject(SprintService);

  readonly statuses = STATUSES;
  readonly priorities = PRIORITIES;
  readonly statusMeta = statusMeta;
  readonly priorityMeta = priorityMeta;
  readonly formatDate = formatDate;
  private readonly today = todayIso();

  readonly tasks = signal<Task[]>([]);
  readonly projects = signal<Project[]>([]);
  readonly sprints = signal<Sprint[]>([]);
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
  readonly projectFilter = signal<string>('');
  readonly sprintFilter = signal<string>('');

  /** Proje filtresi seçiliyse sprint listesi o projeye daralır. */
  readonly sprintsForFilter = computed(() => {
    const pid = this.projectFilter();
    if (!pid) {
      return this.sprints();
    }
    return this.sprints().filter((s) => String(this.sprintProjectId(s)) === pid);
  });

  readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const sf = this.statusFilter();
    const pf = this.priorityFilter();
    const projF = this.projectFilter();
    const sprF = this.sprintFilter();
    return this.tasks().filter((t) => {
      if (sf && t.status !== sf) return false;
      if (pf && t.priority !== pf) return false;
      if (projF && String(t.projectId) !== projF) return false;
      if (sprF && String(t.sprintId ?? '') !== sprF) return false;
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

  readonly hasActiveFilter = computed(
    () => !!(this.search() || this.statusFilter() || this.priorityFilter() || this.projectFilter() || this.sprintFilter()),
  );

  readonly form = this.fb.nonNullable.group({
    projectId: ['', Validators.required],
    sprintId: [''],
    title: ['', Validators.required],
    description: [''],
    status: ['TODO', Validators.required],
    priority: ['MEDIUM'],
    dueDate: [''],
  });

  /** Formda seçili projeye ait sprintler (sprint seçimi projeye bağlıdır). */
  get formSprints(): Sprint[] {
    const pid = this.form.controls.projectId.value;
    if (!pid) {
      return [];
    }
    return this.sprints().filter((s) => String(this.sprintProjectId(s)) === pid);
  }

  ngOnInit(): void {
    this.load();
    this.projectService.findAll().subscribe({
      next: (data) => this.projects.set(data),
      error: () => this.error.set('Projeler yüklenemedi.'),
    });
    this.sprintService.getAllSprints().subscribe({
      next: (data) => this.sprints.set(data),
      error: () => this.error.set('Sprintler yüklenemedi.'),
    });
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
    this.projectFilter.set('');
    this.sprintFilter.set('');
  }

  onProjectFilterChange(value: string): void {
    this.projectFilter.set(value);
    this.sprintFilter.set(''); // proje değişince sprint seçimi geçersizleşir
  }

  /** Proje seçimi değişince, o projeye ait olmayan sprint seçimi sıfırlanır. */
  onFormProjectChange(): void {
    this.form.controls.sprintId.setValue('');
  }

  overdue(task: Task): boolean {
    return isOverdue(task.dueDate, task.status, this.today);
  }

  /** Backend Tsprint alan adları snake_case gelir (project_id). */
  private sprintProjectId(sprint: Sprint): number {
    return (sprint as any).projectId ?? sprint.project_id;
  }

  // ---- CRUD ----
  openCreate(status: string = 'TODO'): void {
    this.editingId.set(null);
    this.form.reset({
      // Filtrede bir proje seçiliyse yeni görev doğrudan o projeye açılır.
      projectId: this.projectFilter() || String(this.projects()[0]?.id ?? ''),
      sprintId: this.sprintFilter() || '',
      title: '',
      description: '',
      status,
      priority: 'MEDIUM',
      dueDate: '',
    });
    this.panelOpen.set(true);
  }

  openEdit(task: Task): void {
    this.editingId.set(task.id);
    this.form.reset({
      projectId: String(task.projectId ?? ''),
      sprintId: task.sprintId ? String(task.sprintId) : '',
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
      projectId: Number(v.projectId),
      sprintId: v.sprintId ? Number(v.sprintId) : null,
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
      error: (err) => {
        this.saving.set(false);
        this.error.set(err?.error?.message ?? 'Görev kaydedilemedi.');
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
      projectId: task.projectId,
      sprintId: task.sprintId,
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
