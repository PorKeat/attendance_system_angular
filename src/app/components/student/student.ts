import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ChangeDetectorRef,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { LucideAngularModule, Plus, Check, X, Pencil, Trash2, Users } from 'lucide-angular';
import { StudentService } from '../../services/student.service';
import { ClassService } from '../../services/class.service';
import gsap from 'gsap';

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './student.html',
})
export class StudentComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly plusIcon = Plus;
  readonly checkIcon = Check;
  readonly xIcon = X;
  readonly pencilIcon = Pencil;
  readonly trashIcon = Trash2;
  readonly usersIcon = Users;

  @ViewChild('headerEl') headerEl!: ElementRef<HTMLElement>;
  @ViewChild('tableEl') tableEl!: ElementRef<HTMLElement>;
  @ViewChild('modalBackdrop') modalBackdrop!: ElementRef<HTMLElement>;
  @ViewChild('modalCard') modalCard!: ElementRef<HTMLElement>;

  students: any[] = [];
  classList: any[] = [];
  filteredClasses: any[] = [];

  classSearch = '';
  classDropOpen = false;

  loading = false;
  error = '';
  success = '';
  showForm = false;
  isEditing = false;
  form: any = { studentid: null, studentname: '', gender: '', classid: null };

  constructor(
    private studentService: StudentService,
    private classService: ClassService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadStudents();
    this.loadClasses();
  }

  ngAfterViewInit(): void {
    this.playPageEntrance();
  }

  ngOnDestroy(): void {
    gsap.killTweensOf(this.headerEl?.nativeElement);
    gsap.killTweensOf(this.tableEl?.nativeElement);
    if (this.tableEl?.nativeElement) {
      gsap.killTweensOf(this.tableEl.nativeElement.querySelectorAll('tbody tr'));
    }
  }

  // ─── Animations ──────────────────────────────────────────────────────────────

  private playPageEntrance(): void {
    gsap.set(this.headerEl.nativeElement, { opacity: 0, y: -24 });
    gsap.to(this.headerEl.nativeElement, {
      y: 0,
      opacity: 1,
      duration: 0.5,
      ease: 'power3.out',
    });
  }

  private animateTableIn(): void {
    const el = this.tableEl?.nativeElement;
    if (!el) return;

    gsap.set(el, { opacity: 0, y: 28 });
    gsap.to(el, { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out', delay: 0.05 });

    const rows = el.querySelectorAll('tbody tr');
    if (rows.length) {
      gsap.set(rows, { opacity: 0, x: -16 });
      gsap.to(rows, {
        x: 0,
        opacity: 1,
        duration: 0.3,
        stagger: 0.06,
        ease: 'power2.out',
        delay: 0.2,
      });
    }
  }

  private animateModalIn(): void {
    setTimeout(() => {
      if (!this.modalBackdrop?.nativeElement || !this.modalCard?.nativeElement) return;
      gsap.set(this.modalBackdrop.nativeElement, { opacity: 0 });
      gsap.set(this.modalCard.nativeElement, { scale: 0.88, opacity: 0, y: 24 });
      gsap.to(this.modalBackdrop.nativeElement, { opacity: 1, duration: 0.3, ease: 'power2.out' });
      gsap.to(this.modalCard.nativeElement, {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: 'back.out(1.6)',
      });
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

  // ─── Data ────────────────────────────────────────────────────────────────────

  loadStudents(): void {
    this.loading = true;
    this.error = '';
    this.studentService
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
          this.students = res.data ?? res;
        },
        error: () => {
          this.error = 'Failed to load students';
        },
      });
  }

  loadClasses(): void {
    this.classService.getAll().subscribe({
      next: (res) => {
        this.classList = res.data ?? res;
        this.filteredClasses = [...this.classList];
      },
      error: () => {
        this.error = 'Failed to load classes';
      },
    });
  }

  // ─── Class search dropdown ────────────────────────────────────────────────────

  filterClasses(): void {
    const q = this.classSearch.toLowerCase();
    this.filteredClasses = this.classList.filter((c) => c.classname.toLowerCase().includes(q));
    this.classDropOpen = true;
  }

  selectClass(cls: any): void {
    this.form.classid = cls.classid;
    this.classSearch = cls.classname;
    this.classDropOpen = false;
  }

  closeDropdown(): void {
    this.classDropOpen = false;
  }

  // ─── CRUD ─────────────────────────────────────────────────────────────────────

  openCreate(): void {
    this.isEditing = false;
    this.form = { studentid: null, studentname: '', gender: '', classid: null };
    this.classSearch = '';
    this.filteredClasses = [...this.classList];
    this.showForm = true;
    this.animateModalIn();
  }

  openEdit(student: any): void {
    this.isEditing = true;
    this.form = {
      studentid: student.studentid,
      studentname: student.studentname,
      gender: student.gender,
      classid: student.classid,
    };
    this.classSearch = student.class?.classname ?? '';
    this.filteredClasses = [...this.classList];
    this.showForm = true;
    this.animateModalIn();
  }

  save(): void {
    this.error = '';
    this.success = '';
    const payload = {
      studentname: this.form.studentname,
      gender: this.form.gender,
      classid: this.form.classid,
    };

    if (this.isEditing) {
      this.studentService.update(this.form.studentid, payload).subscribe({
        next: () => {
          this.success = 'Student updated!';
          this.animateModalOut(() => {
            this.showForm = false;
            this.cdr.detectChanges();
          });
          this.loadStudents();
        },
        error: () => {
          this.error = 'Update failed';
        },
      });
    } else {
      this.studentService.create(payload).subscribe({
        next: () => {
          this.success = 'Student created!';
          this.animateModalOut(() => {
            this.showForm = false;
            this.cdr.detectChanges();
          });
          this.loadStudents();
        },
        error: () => {
          this.error = 'Create failed';
        },
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
      this.classDropOpen = false;
      this.cdr.detectChanges();
    });
  }
}
