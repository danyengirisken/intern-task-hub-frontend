import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { Task } from '../core/models';
import { PRIORITIES, STATUSES, formatDate, isOverdue, priorityMeta, statusMeta, todayIso } from '../core/task-meta';
import { TaskService } from '../services/task.service';

/**
 * Genel bakış ekranı: görev istatistikleri, durum dağılımı, öncelik kırılımı
 * ve geciken / yaklaşan görevler. Veriyi TaskService'ten çeker.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly taskService = inject(TaskService);

  readonly user = this.auth.getUser();
  readonly statusMeta = statusMeta;
  readonly priorityMeta = priorityMeta;
  readonly formatDate = formatDate;
  private readonly today = todayIso();

  readonly tasks = signal<Task[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.taskService.findAll().subscribe({
      next: (data) => {
        this.tasks.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Görev verileri yüklenemedi.');
        this.loading.set(false);
      },
    });
  }

  readonly stats = computed(() => {
    const all = this.tasks();
    const done = all.filter((t) => t.status === 'DONE').length;
    return {
      total: all.length,
      todo: all.filter((t) => t.status === 'TODO').length,
      progress: all.filter((t) => t.status === 'IN_PROGRESS').length,
      done,
      overdue: all.filter((t) => isOverdue(t.dueDate, t.status, this.today)).length,
      completion: all.length ? Math.round((done / all.length) * 100) : 0,
    };
  });

  /** Durum dağılımı — yüzde bar için. */
  readonly statusDist = computed(() => {
    const all = this.tasks();
    const total = all.length || 1;
    return STATUSES.map((s) => {
      const count = all.filter((t) => t.status === s.code).length;
      return { ...s, count, pct: Math.round((count / total) * 100) };
    });
  });

  readonly priorityDist = computed(() => {
    const all = this.tasks();
    const total = all.length || 1;
    return PRIORITIES.map((p) => {
      const count = all.filter((t) => t.priority === p.code).length;
      return { ...p, count, pct: Math.round((count / total) * 100) };
    });
  });

  /** Geciken görevler (en yakın tarihli önce). */
  readonly overdueTasks = computed(() =>
    this.tasks()
      .filter((t) => isOverdue(t.dueDate, t.status, this.today))
      .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))
      .slice(0, 5),
  );

  /** Yaklaşan görevler (bugün ve sonrası, tamamlanmamış). */
  readonly upcomingTasks = computed(() =>
    this.tasks()
      .filter((t) => t.status !== 'DONE' && t.dueDate && t.dueDate >= this.today)
      .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))
      .slice(0, 5),
  );
}
