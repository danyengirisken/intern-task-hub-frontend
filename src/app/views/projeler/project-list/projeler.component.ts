import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ProjectService } from '../../../services/project.service';

@Component({
  selector: 'app-projeler',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './projeler.component.html',
  styleUrl: './projeler.component.scss'
})
export class ProjelerComponent implements OnInit {
  
  projects = signal<any[]>([]); 
  searchTerm = signal<string>(''); 
  
  // YENİ: Ekranda detayı gösterilecek projeyi tutan değişken (Popup için)
  selectedProject = signal<any>(null);

  filteredProjects = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.projects(); 
    
    return this.projects().filter(p => 
      (p.name && p.name.toLowerCase().includes(term)) || 
      (p.code && p.code.toLowerCase().includes(term)) ||
      (p.description && p.description.toLowerCase().includes(term))
    );
  });

  constructor(
    private projectService: ProjectService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.projectService.findAll().subscribe({
      next: (data: any[]) => {
        this.projects.set(data);
      },
      error: (err: any) => console.error('Projeler çekilemedi!', err)
    });
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }

  // YENİ: Popup'ı açar ve seçilen projeyi içine atar
  openModal(project: any): void {
    this.selectedProject.set(project);
  }

  // YENİ: Popup'ı kapatır
  closeModal(): void {
    this.selectedProject.set(null);
  }

  editProject(id: number): void {
    this.router.navigate(['/projeler/duzenle', id]);
  }

  deleteProject(id: number): void {
    if (confirm('Bu projeyi kalıcı olarak silmek istediğinize emin misiniz?')) {
      this.projectService.delete(id).subscribe({
        next: () => this.loadProjects(),
        error: (err: any) => console.error('Silme işlemi başarısız!', err)
      });
    }
  }
}