import {
  Component,
  OnInit,
  AfterViewInit,
  ChangeDetectorRef,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { LucideAngularModule, Plus, Check, X, Pencil, Trash2, GraduationCap } from 'lucide-angular';
import { TeacherService } from '../../services/teacher.service';
import gsap from 'gsap';

@Component({
  selector: 'app-teacher',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './teacher.html',
})
export class TeacherComponent implements OnInit, AfterViewInit {
  readonly plusIcon = Plus;
  readonly checkIcon = Check;
  readonly xIcon = X;
  readonly pencilIcon = Pencil;
  readonly trashIcon = Trash2;
  readonly graduationIcon = GraduationCap;

  @ViewChild('headerEl') headerEl!: ElementRef<HTMLElement>;
  @ViewChild('tableEl') tableEl!: ElementRef<HTMLElement>;
  @ViewChild('modalBackdrop') modalBackdrop!: ElementRef<HTMLElement>;
  @ViewChild('modalCard') modalCard!: ElementRef<HTMLElement>;

  teachers: any[] = [];
  loading = false;
  error = '';
  success = '';
  showForm = false;
  isEditing = false;
  form: any = { teacherid: null, teachername: '' };

  constructor(
    private teacherService: TeacherService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadTeachers();
  }
  ngAfterViewInit(): void {
    this.playPageEntrance();
  }

  private playPageEntrance(): void {
    gsap.fromTo(
      this.headerEl.nativeElement,
      { y: -24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' },
    );
  }

  private animateTableIn(): void {
    const el = this.tableEl?.nativeElement;
    if (!el) return;
    gsap.fromTo(
      el,
      { y: 28, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out', delay: 0.05 },
    );
    const rows = el.querySelectorAll('tbody tr');
    if (rows.length)
      gsap.fromTo(
        rows,
        { x: -16, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.3, stagger: 0.06, ease: 'power2.out', delay: 0.2 },
      );
  }

  private animateModalIn(): void {
    setTimeout(() => {
      if (!this.modalBackdrop?.nativeElement || !this.modalCard?.nativeElement) return;
      gsap.fromTo(
        this.modalBackdrop.nativeElement,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' },
      );
      gsap.fromTo(
        this.modalCard.nativeElement,
        { scale: 0.88, opacity: 0, y: 24 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.6)' },
      );
    }, 0);
  }

  private animateModalOut(onComplete: () => void): void {
    if (!this.modalBackdrop?.nativeElement || !this.modalCard?.nativeElement) {
      onComplete();
      return;
    }
    gsap.to(this.modalCard.nativeElement, {
      scale: 0.92,
      opacity: 0,
      y: 16,
      duration: 0.25,
      ease: 'power2.in',
    });
    gsap.to(this.modalBackdrop.nativeElement, {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
      onComplete,
    });
  }

  loadTeachers(): void {
    this.loading = true;
    this.error = '';
    this.teacherService
      .getAll()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
          setTimeout(() => this.animateTableIn(), 0);
        }),
      )
      .subscribe({
        next: (res) => {
          this.teachers = res.data ?? res;
        },
        error: () => {
          this.error = 'Failed to load teachers';
        },
      });
  }

  openCreate(): void {
    this.isEditing = false;
    this.form = { teacherid: null, teachername: '' };
    this.showForm = true;
    this.animateModalIn();
  }

  openEdit(teacher: any): void {
    this.isEditing = true;
    this.form = { ...teacher };
    this.showForm = true;
    this.animateModalIn();
  }

  save(): void {
    this.error = '';
    this.success = '';
    const payload = { teachername: this.form.teachername };

    if (this.isEditing) {
      this.teacherService.update(this.form.teacherid, payload).subscribe({
        next: () => {
          this.success = 'Teacher updated!';
          this.animateModalOut(() => {
            this.showForm = false;
            this.cdr.detectChanges();
          });
          this.loadTeachers();
        },
        error: () => {
          this.error = 'Update failed';
        },
      });
    } else {
      this.teacherService.create(payload).subscribe({
        next: () => {
          this.success = 'Teacher created!';
          this.animateModalOut(() => {
            this.showForm = false;
            this.cdr.detectChanges();
          });
          this.loadTeachers();
        },
        error: () => {
          this.error = 'Create failed';
        },
      });
    }
  }

  delete(id: number): void {
    if (!confirm('Delete this teacher?')) return;
    this.teacherService.delete(id).subscribe({
      next: () => {
        this.success = 'Teacher deleted!';
        this.loadTeachers();
      },
      error: () => {
        this.error = 'Delete failed';
      },
    });
  }

  closeForm(): void {
    this.animateModalOut(() => {
      this.showForm = false;
      this.error = '';
      this.success = '';
      this.cdr.detectChanges();
    });
  }
}
