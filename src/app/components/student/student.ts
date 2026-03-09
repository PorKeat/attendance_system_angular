import {
  Component, OnInit, AfterViewInit,
  ChangeDetectorRef, ElementRef,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { LucideAngularModule, Plus, Check, X, Pencil, Trash2, Users } from 'lucide-angular';
import { StudentService } from '../../services/student.service';
import gsap from 'gsap';

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './student.html',
})
export class Student implements OnInit, AfterViewInit {
  // ─── Lucide icons ────────────────────────────────────────────────────────────
  readonly plusIcon  = Plus;
  readonly checkIcon = Check;
  readonly xIcon     = X;
  readonly pencilIcon = Pencil;
  readonly trashIcon = Trash2;
  readonly usersIcon = Users;

  // ─── GSAP refs ───────────────────────────────────────────────────────────────
  @ViewChild('headerEl')     headerEl!: ElementRef<HTMLElement>;
  @ViewChild('tableEl')      tableEl!: ElementRef<HTMLElement>;
  @ViewChild('modalBackdrop') modalBackdrop!: ElementRef<HTMLElement>;
  @ViewChild('modalCard')    modalCard!: ElementRef<HTMLElement>;

  // ─── State ───────────────────────────────────────────────────────────────────
  students: any[] = [];
  loading   = false;
  error     = '';
  success   = '';
  showForm  = false;
  isEditing = false;
  form: any = { studentid: null, studentname: '', gender: '', classid: '' };

  constructor(
    private studentService: StudentService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  ngAfterViewInit(): void {
    this.playPageEntrance();
  }

  // ─── Page entrance ───────────────────────────────────────────────────────────

  private playPageEntrance(): void {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo(this.headerEl.nativeElement,
        { y: -24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 });
  }

  // Animate table in after data loads (called after loading = false + cdr)
  private animateTableIn(): void {
    const el = this.tableEl?.nativeElement;
    if (!el) return;
    gsap.fromTo(el,
      { y: 28, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out', delay: 0.05 }
    );

    // Stagger table rows
    const rows = el.querySelectorAll('tbody tr');
    if (rows.length) {
      gsap.fromTo(rows,
        { x: -16, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.3, stagger: 0.06, ease: 'power2.out', delay: 0.2 }
      );
    }
  }

  // ─── Modal animations ────────────────────────────────────────────────────────

  private animateModalIn(): void {
    setTimeout(() => {
      if (!this.modalBackdrop?.nativeElement || !this.modalCard?.nativeElement) return;

      gsap.fromTo(this.modalBackdrop.nativeElement,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
      gsap.fromTo(this.modalCard.nativeElement,
        { scale: 0.88, opacity: 0, y: 24 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.6)' }
      );
    }, 0);
  }

  private animateModalOut(onComplete: () => void): void {
    if (!this.modalBackdrop?.nativeElement || !this.modalCard?.nativeElement) {
      onComplete();
      return;
    }
    gsap.to(this.modalCard.nativeElement, {
      scale: 0.92, opacity: 0, y: 16, duration: 0.25, ease: 'power2.in',
    });
    gsap.to(this.modalBackdrop.nativeElement, {
      opacity: 0, duration: 0.3, ease: 'power2.in',
      onComplete,
    });
  }

  // ─── Data ────────────────────────────────────────────────────────────────────

  loadStudents(): void {
    this.loading = true;
    this.studentService.getAll()
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
        // Animate table in after Angular renders it
        setTimeout(() => this.animateTableIn(), 0);
      }))
      .subscribe({
        next: (res) => { this.students = res.data ?? res; },
        error: (err) => {
          console.error('Error:', err);
          this.error = 'Failed to load students';
        },
      });
  }

  openCreate(): void {
    this.isEditing = false;
    this.form = { studentid: null, studentname: '', gender: '', classid: '' };
    this.showForm = true;
    this.animateModalIn();
  }

  openEdit(student: any): void {
    this.isEditing = true;
    this.form = { ...student };
    this.showForm = true;
    this.animateModalIn();
  }

  save(): void {
    if (this.isEditing) {
      this.studentService.update(this.form.studentid, this.form).subscribe({
        next: () => {
          this.success = 'Student updated!';
          this.animateModalOut(() => { this.showForm = false; this.cdr.detectChanges(); });
          this.loadStudents();
        },
        error: () => (this.error = 'Update failed'),
      });
    } else {
      this.studentService.create(this.form).subscribe({
        next: () => {
          this.success = 'Student created!';
          this.animateModalOut(() => { this.showForm = false; this.cdr.detectChanges(); });
          this.loadStudents();
        },
        error: () => (this.error = 'Create failed'),
      });
    }
  }

  delete(id: number): void {
    if (!confirm('Delete this student?')) return;
    this.studentService.delete(id).subscribe({
      next: () => {
        this.success = 'Student deleted!';
        this.loadStudents();
      },
      error: () => (this.error = 'Delete failed'),
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