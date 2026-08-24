import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SprintService } from '../../../services/sprint.service';
import { ProjectService } from '../../../services/project.service';

@Component({
  selector: 'app-sprint-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './sprint-edit.component.html',
  styleUrl: './sprint-edit.component.scss'
})
export class SprintEditComponent implements OnInit {
  sprintForm!: FormGroup;
  projects: any[] = []; 
  saving: boolean = false; 
  sprintId: number | null = null;
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private sprintService: SprintService,
    private projectService: ProjectService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadProjects(); 

    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.sprintId = +idParam;
        this.isEditMode = true;
        this.loadSprintData(this.sprintId); 
      }
    });
  }

  initForm(): void {
    this.sprintForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      projectId: [null, Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      active: [1]
    });
  }

  loadProjects(): void {
    this.projectService.findAll().subscribe({
      next: (data: any) => this.projects = data,
      error: (err: any) => console.error('Projeler çekilirken hata oluştu!', err)
    });
  }

  loadSprintData(id: number): void {
    this.sprintService.getSprintById(id).subscribe({
      next: (sprint: any) => {
        // Backend'den gelen veriler (camelCase veya snake_case) eşleştiriliyor
        this.sprintForm.patchValue({
          name: sprint.name,
          description: sprint.description,
          projectId: sprint.projectId || sprint.project_id, // Her iki ihtimale karşı
          startDate: sprint.startDate || sprint.start_date,
          endDate: sprint.endDate || sprint.end_date,
          active: sprint.active
        });
      },
      error: (err: any) => console.error('Sprint verisi çekilemedi!', err)
    });
  }

  onSubmit(): void {
    if (this.sprintForm.valid) {
      this.saving = true; 
      if (this.isEditMode && this.sprintId) {
        this.sprintService.updateSprint(this.sprintId, this.sprintForm.value).subscribe({
          next: () => this.router.navigate(['/sprintler']),
          error: (err: any) => {
            console.error('Güncellenirken hata oluştu!', err);
            this.saving = false; 
          }
        });
      } else {
        this.sprintService.createSprint(this.sprintForm.value).subscribe({
          next: () => this.router.navigate(['/sprintler']),
          error: (err: any) => {
            console.error('Kaydedilirken hata oluştu!', err);
            this.saving = false; 
          }
        });
      }
    } else {
      this.sprintForm.markAllAsTouched();
    }
  }
}