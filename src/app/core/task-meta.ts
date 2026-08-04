/**
 * Görev (task) alanları için paylaşılan meta veriler ve yardımcılar.
 * Dashboard, liste ve Kanban ekranları buradan beslenir; böylece durum/öncelik
 * etiketleri, renkleri ve sırası tek yerden yönetilir.
 */

export interface TaskOption {
  code: string;
  label: string;
  /** Material icon adı. */
  icon: string;
  /** CSS renk tokenı (styles.scss'de tanımlı). */
  color: string;
  /** Yumuşak (soft) arka plan tokenı — çip/etiket zeminleri için. */
  soft: string;
}

/** Kanban kolon sırasını da belirleyen durum listesi. */
export const STATUSES: TaskOption[] = [
  { code: 'TODO', label: 'Yapılacak', icon: 'radio_button_unchecked', color: 'var(--st-todo)', soft: 'var(--st-todo-soft)' },
  { code: 'IN_PROGRESS', label: 'Devam Ediyor', icon: 'timelapse', color: 'var(--st-progress)', soft: 'var(--st-progress-soft)' },
  { code: 'DONE', label: 'Tamamlandı', icon: 'check_circle', color: 'var(--st-done)', soft: 'var(--st-done-soft)' },
];

export const PRIORITIES: TaskOption[] = [
  { code: 'HIGH', label: 'Yüksek', icon: 'keyboard_double_arrow_up', color: 'var(--pr-high)', soft: 'var(--pr-high-soft)' },
  { code: 'MEDIUM', label: 'Orta', icon: 'drag_handle', color: 'var(--pr-medium)', soft: 'var(--pr-medium-soft)' },
  { code: 'LOW', label: 'Düşük', icon: 'keyboard_double_arrow_down', color: 'var(--pr-low)', soft: 'var(--pr-low-soft)' },
];

export function statusMeta(code: string | null | undefined): TaskOption {
  return STATUSES.find((s) => s.code === code) ?? STATUSES[0];
}

export function priorityMeta(code: string | null | undefined): TaskOption | null {
  return PRIORITIES.find((p) => p.code === code) ?? null;
}

/** Görev geçmiş bir tarihe sahipse ve tamamlanmamışsa true. */
export function isOverdue(dueDate: string | null | undefined, status: string, today: string): boolean {
  if (!dueDate || status === 'DONE') {
    return false;
  }
  return dueDate < today;
}

/** yyyy-MM-dd formatında bugünün tarihi (yerel saat). */
export function todayIso(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** ISO tarihi kısa, okunur biçimde gösterir (ör. 3 Tem 2026). */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) {
    return '';
  }
  const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) {
    return iso;
  }
  return `${d} ${months[m - 1]} ${y}`;
}
