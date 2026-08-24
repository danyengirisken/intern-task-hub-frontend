import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { Task } from '../../../core/models';
import { STATUSES, TaskOption, formatDate, isOverdue, priorityMeta, todayIso } from '../../../core/task-meta';

interface Column extends TaskOption {
  tasks: Task[];
}

/**
 * Kanban panosu (sunum bileşeni). Görevleri duruma göre kolonlara ayırır ve
 * sürükle-bırak ile kolon (durum) değiştirmeyi destekler. Veri sahibi üst
 * bileşendir; bu bileşen yalnızca olay yayar.
 */
@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [],
  templateUrl: './task-board.component.html',
  styleUrl: './task-board.component.scss',
})
export class TaskBoardComponent {
  @Input() set tasks(value: Task[]) {
    this._tasks = value ?? [];
  }
  private _tasks: Task[] = [];

  @Output() statusChange = new EventEmitter<{ task: Task; status: string }>();
  @Output() edit = new EventEmitter<Task>();
  @Output() remove = new EventEmitter<Task>();
  @Output() create = new EventEmitter<string>();

  private readonly today = todayIso();
  readonly priorityMeta = priorityMeta;
  readonly formatDate = formatDate;

  /** Sürüklenen görev ve üzerine gelinen kolon (görsel geri bildirim için). */
  private dragging: Task | null = null;
  readonly draggingId = signal<number | null>(null);
  readonly dragOverStatus = signal<string | null>(null);

  get columns(): Column[] {
    return STATUSES.map((s) => ({
      ...s,
      tasks: this._tasks.filter((t) => t.status === s.code),
    }));
  }

  overdue(task: Task): boolean {
    return isOverdue(task.dueDate, task.status, this.today);
  }

  initials(task: Task): string {
    return task.title.trim().charAt(0).toUpperCase() || '#';
  }

  // ---- Sürükle-bırak ----
  onDragStart(task: Task, ev: DragEvent): void {
    this.dragging = task;
    this.draggingId.set(task.id);
    ev.dataTransfer?.setData('text/plain', String(task.id));
    if (ev.dataTransfer) ev.dataTransfer.effectAllowed = 'move';
  }

  onDragEnd(): void {
    this.dragging = null;
    this.draggingId.set(null);
    this.dragOverStatus.set(null);
  }

  onDragOver(ev: DragEvent, status: string): void {
    ev.preventDefault();
    if (ev.dataTransfer) ev.dataTransfer.dropEffect = 'move';
    if (this.dragOverStatus() !== status) this.dragOverStatus.set(status);
  }

  onDragLeaveColumn(status: string): void {
    if (this.dragOverStatus() === status) this.dragOverStatus.set(null);
  }

  onDrop(status: string): void {
    const task = this.dragging;
    this.dragOverStatus.set(null);
    if (task && task.status !== status) {
      this.statusChange.emit({ task, status });
    }
    this.onDragEnd();
  }
}
