import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SprintService } from '../../../services/sprint.service';
import { ProjectService } from '../../../services/project.service';

@Component({
  selector: 'app-sprint-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sprint-list.component.html',
  styleUrl: './sprint-list.component.scss'
})
export class SprintListComponent implements OnInit {
  
  sprints = signal<any[]>([]);
  projects = signal<any[]>([]); 
  searchTerm = signal<string>(''); 

  // YENİ: Popup'ta gösterilecek sprinti tutan değişken
  selectedSprint = signal<any>(null);

  filteredSprints = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.sprints(); 
    
    return this.sprints().filter(s => {
      const sprintName = s.name ? s.name.toLowerCase() : '';
      const projectName = this.getProjectName(s.projectId || s.project_id).toLowerCase();
      
      return sprintName.includes(term) || projectName.includes(term);
    });
  });

  constructor(
    private sprintService: SprintService,
    private projectService: ProjectService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProjects(); 
    this.loadSprints();  
  }

  loadProjects(): void {
    this.projectService.findAll().subscribe({
      next: (data: any[]) => this.projects.set(data),
      error: (err: any) => console.error('Projeler çekilemedi!', err)
    });
  }

  loadSprints(): void {
    this.sprintService.getAllSprints().subscribe({
      next: (data: any[]) => this.sprints.set(data),
      error: (err: any) => console.error('Sprintler çekilemedi!', err)
    });
  }

  getProjectName(projectId: number): string {
    const pList = this.projects();
    if (!pList || pList.length === 0) return 'Yükleniyor...';
    const project = pList.find(p => p.id === projectId);
    return project ? project.name : 'Bağlantısız Proje';
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }

  // YENİ: Popup'ı açar
  openModal(sprint: any): void {
    this.selectedSprint.set(sprint);
  }

  // YENİ: Popup'ı kapatır
  closeModal(): void {
    this.selectedSprint.set(null);
  }

  editSprint(id: number): void {
    this.router.navigate(['/sprintler/duzenle', id]);
  }

  deleteSprint(id: number): void {
    if (confirm('Bu sprinti kalıcı olarak silmek istediğinize emin misiniz?')) {
      this.sprintService.deleteSprint(id).subscribe({
        next: () => this.loadSprints(),
        error: (err: any) => console.error('Silme başarısız!', err)
      });
    }
  }
}