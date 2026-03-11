import {
  Component,
  OnInit,
  AfterViewInit,
  ChangeDetectorRef,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { LucideAngularModule, Plus, Check, X, Pencil, Trash2, ClipboardList } from 'lucide-angular';
import { AttendanceService } from '../../services/attendance.service';
import { StudentService } from '../../services/student.service';
import { TeacherService } from '../../services/teacher.service';
import { SubjectService } from '../../services/subject.service';
import gsap from 'gsap';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [FormsModule, LucideAngularModule, DatePipe],
  templateUrl: './attendance.html',
})
export class AttendanceComponent implements OnInit, AfterViewInit {
  readonly plusIcon = Plus;
  readonly checkIcon = Check;
  readonly xIcon = X;
  readonly pencilIcon = Pencil;
  readonly trashIcon = Trash2;
  readonly clipboardIcon = ClipboardList;

  @ViewChild('headerEl') headerEl!: ElementRef<HTMLElement>;
  @ViewChild('tableEl') tableEl!: ElementRef<HTMLElement>;
  @ViewChild('modalBackdrop') modalBackdrop!: ElementRef<HTMLElement>;
  @ViewChild('modalCard') modalCard!: ElementRef<HTMLElement>;

  attendances: any[] = [];
  studentList: any[] = [];
  teacherList: any[] = [];
  subjectList: any[] = [];

  // Filtered lists for search
  filteredStudents: any[] = [];
  filteredTeachers: any[] = [];
  filteredSubjects: any[] = [];

  // Search input values
  studentSearch = '';
  teacherSearch = '';
  subjectSearch = '';

  // Dropdown open states
  studentDropOpen = false;
  teacherDropOpen = false;
  subjectDropOpen = false;

  loading = false;
  error = '';
  success = '';
  showForm = false;
  isEditing = false;

  form: any = {
    attendentid: null,
    studentid: null,
    teacherid: null,
    subjectid: null,
    att_date: '',
    att_status: '',
  };

  constructor(
    private attendanceService: AttendanceService,
    private studentService: StudentService,
    private teacherService: TeacherService,
    private subjectService: SubjectService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadAttendances();
    this.loadDropdownData();
  }

  ngAfterViewInit(): void {
    this.playPageEntrance();
  }

  // ─── Load dropdown data ───────────────────────────────────────────────────────

  loadDropdownData(): void {
    this.studentService.getAll().subscribe({
      next: (res) => {
        this.studentList = res.data ?? res;
        this.filteredStudents = [...this.studentList];
      },
    });
    this.teacherService.getAll().subscribe({
      next: (res) => {
        this.teacherList = res.data ?? res;
        this.filteredTeachers = [...this.teacherList];
      },
    });
    this.subjectService.getAll().subscribe({
      next: (res) => {
        this.subjectList = res.data ?? res;
        this.filteredSubjects = [...this.subjectList];
      },
    });
  }

  // ─── Search filters ───────────────────────────────────────────────────────────

  filterStudents(): void {
    const q = this.studentSearch.toLowerCase();
    this.filteredStudents = this.studentList.filter((s) => s.studentname.toLowerCase().includes(q));
    this.studentDropOpen = true;
  }

  filterTeachers(): void {
    const q = this.teacherSearch.toLowerCase();
    this.filteredTeachers = this.teacherList.filter((t) => t.teachername.toLowerCase().includes(q));
    this.teacherDropOpen = true;
  }

  filterSubjects(): void {
    const q = this.subjectSearch.toLowerCase();
    this.filteredSubjects = this.subjectList.filter((s) => s.subjectname.toLowerCase().includes(q));
    this.subjectDropOpen = true;
  }

  // ─── Select from dropdown ────────────────────────────────────────────────────

  selectStudent(student: any): void {
    this.form.studentid = student.studentid;
    this.studentSearch = student.studentname;
    this.studentDropOpen = false;
  }

  selectTeacher(teacher: any): void {
    this.form.teacherid = teacher.teacherid;
    this.teacherSearch = teacher.teachername;
    this.teacherDropOpen = false;
  }

  selectSubject(subject: any): void {
    this.form.subjectid = subject.subjectid;
    this.subjectSearch = subject.subjectname;
    this.subjectDropOpen = false;
  }

  closeAllDropdowns(): void {
    this.studentDropOpen = false;
    this.teacherDropOpen = false;
    this.subjectDropOpen = false;
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  statusLabel(status: number): string {
    const map: Record<number, string> = { 1: 'Present', 0: 'Absent', 2: 'Late' };
    return map[status] ?? 'Unknown';
  }

  statusStyle(status: number): string {
    if (status === 1)
      return 'background:rgba(52,211,153,0.15);color:#6ee7b7;border:1px solid rgba(52,211,153,0.2)';
    if (status === 0)
      return 'background:rgba(239,68,68,0.15);color:#fca5a5;border:1px solid rgba(239,68,68,0.2)';
    return 'background:rgba(251,191,36,0.15);color:#fde68a;border:1px solid rgba(251,191,36,0.2)';
  }

  // ─── Animations ──────────────────────────────────────────────────────────────

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

  // ─── CRUD ─────────────────────────────────────────────────────────────────────

  loadAttendances(): void {
    this.loading = true;
    this.error = '';
    this.attendanceService
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
          this.attendances = res.data ?? res;
        },
        error: () => {
          this.error = 'Failed to load attendance records';
        },
      });
  }

  openCreate(): void {
    this.isEditing = false;
    this.form = {
      attendentid: null,
      studentid: null,
      teacherid: null,
      subjectid: null,
      att_date: '',
      att_status: '',
    };
    this.studentSearch = '';
    this.teacherSearch = '';
    this.subjectSearch = '';
    this.filteredStudents = [...this.studentList];
    this.filteredTeachers = [...this.teacherList];
    this.filteredSubjects = [...this.subjectList];
    this.showForm = true;
    this.animateModalIn();
  }

  openEdit(record: any): void {
    this.isEditing = true;
    this.form = {
      attendentid: record.attendentid,
      studentid: record.studentid,
      teacherid: record.teacherid,
      subjectid: record.subjectid,
      att_date: record.att_date?.substring(0, 10),
      att_status: record.att_status,
    };
    // Pre-fill search inputs with current names
    this.studentSearch = record.student?.studentname ?? '';
    this.teacherSearch = record.teacher?.teachername ?? '';
    this.subjectSearch = record.subject?.subjectname ?? '';
    this.filteredStudents = [...this.studentList];
    this.filteredTeachers = [...this.teacherList];
    this.filteredSubjects = [...this.subjectList];
    this.showForm = true;
    this.animateModalIn();
  }

  save(): void {
    this.error = '';
    this.success = '';
    const payload = {
      studentid: this.form.studentid,
      teacherid: this.form.teacherid,
      subjectid: this.form.subjectid,
      att_date: this.form.att_date,
      att_status: this.form.att_status,
    };

    if (this.isEditing) {
      this.attendanceService.update(this.form.attendentid, payload).subscribe({
        next: () => {
          this.success = 'Record updated!';
          this.animateModalOut(() => {
            this.showForm = false;
            this.cdr.detectChanges();
          });
          this.loadAttendances();
        },
        error: () => {
          this.error = 'Update failed';
        },
      });
    } else {
      this.attendanceService.create(payload).subscribe({
        next: () => {
          this.success = 'Record created!';
          this.animateModalOut(() => {
            this.showForm = false;
            this.cdr.detectChanges();
          });
          this.loadAttendances();
        },
        error: () => {
          this.error = 'Create failed';
        },
      });
    }
  }

  delete(id: number): void {
    if (!confirm('Delete this attendance record?')) return;
    this.attendanceService.delete(id).subscribe({
      next: () => {
        this.success = 'Record deleted!';
        this.loadAttendances();
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
      this.closeAllDropdowns();
      this.cdr.detectChanges();
    });
  }
}
