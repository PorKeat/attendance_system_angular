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
import { LucideAngularModule, Plus, Check, X, Pencil, Trash2, School } from 'lucide-angular';
import { ClassService } from '../../services/class.service';
import gsap from 'gsap';

@Component({
  selector: 'app-class',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './class.html',
})
export class ClassComponent implements OnInit, AfterViewInit {
  readonly plusIcon = Plus;
  readonly checkIcon = Check;
  readonly xIcon = X;
  readonly pencilIcon = Pencil;
  readonly trashIcon = Trash2;
  readonly schoolIcon = School;

  @ViewChild('headerEl') headerEl!: ElementRef<HTMLElement>;
  @ViewChild('tableEl') tableEl!: ElementRef<HTMLElement>;
  @ViewChild('modalBackdrop') modalBackdrop!: ElementRef<HTMLElement>;
  @ViewChild('modalCard') modalCard!: ElementRef<HTMLElement>;

  classes: any[] = [];
  loading = false;
  error = '';
  success = '';
  showForm = false;
  isEditing = false;
  form: any = { classid: null, classname: '' };

  constructor(
    private classService: ClassService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadClasses();
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

  loadClasses(): void {
    this.loading = true;
    this.error = '';
    this.classService
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
          this.classes = res.data ?? res;
        },
        error: () => {
          this.error = 'Failed to load classes';
        },
      });
  }

  openCreate(): void {
    this.isEditing = false;
    this.form = { classid: null, classname: '' };
    this.showForm = true;
    this.animateModalIn();
  }

  openEdit(cls: any): void {
    this.isEditing = true;
    this.form = { ...cls };
    this.showForm = true;
    this.animateModalIn();
  }

  save(): void {
    this.error = '';
    this.success = '';
    const payload = { classname: this.form.classname };

    if (this.isEditing) {
      this.classService.update(this.form.classid, payload).subscribe({
        next: () => {
          this.success = 'Class updated!';
          this.animateModalOut(() => {
            this.showForm = false;
            this.cdr.detectChanges();
          });
          this.loadClasses();
        },
        error: () => {
          this.error = 'Update failed';
        },
      });
    } else {
      this.classService.create(payload).subscribe({
        next: () => {
          this.success = 'Class created!';
          this.animateModalOut(() => {
            this.showForm = false;
            this.cdr.detectChanges();
          });
          this.loadClasses();
        },
        error: () => {
          this.error = 'Create failed';
        },
      });
    }
  }

  delete(id: number): void {
    if (!confirm('Delete this class?')) return;
    this.classService.delete(id).subscribe({
      next: () => {
        this.success = 'Class deleted!';
        this.loadClasses();
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
