import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { StudentService } from '../../services/student.service';

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './student.html',
})
export class Student implements OnInit {
  students: any[] = [];
  loading = false;
  error = '';
  success = '';

  showForm = false;
  isEditing = false;
  form: any = { studentid: null, studentname: '', gender: '', classid: '' };

  constructor(
    private studentService: StudentService,
    private cdr: ChangeDetectorRef, // ← add this
  ) {}

  ngOnInit() {
    this.loadStudents();
  }

  loadStudents() {
    this.loading = true;
    this.studentService
      .getAll()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges(); // ← force update
        }),
      )
      .subscribe({
        next: (res) => {
          this.students = res.data ?? res;
        },
        error: (err) => {
          console.error('Error:', err);
          this.error = 'Failed to load students';
        },
      });
  }

  openCreate() {
    this.isEditing = false;
    this.form = { studentid: null, studentname: '', gender: '', classid: '' };
    this.showForm = true;
  }

  openEdit(student: any) {
    this.isEditing = true;
    this.form = { ...student };
    this.showForm = true;
  }

  save() {
    if (this.isEditing) {
      this.studentService.update(this.form.studentid, this.form).subscribe({
        next: () => {
          this.success = 'Student updated!';
          this.showForm = false;
          this.loadStudents();
        },
        error: () => (this.error = 'Update failed'),
      });
    } else {
      this.studentService.create(this.form).subscribe({
        next: () => {
          this.success = 'Student created!';
          this.showForm = false;
          this.loadStudents();
        },
        error: () => (this.error = 'Create failed'),
      });
    }
  }

  delete(id: number) {
    if (!confirm('Delete this student?')) return;
    this.studentService.delete(id).subscribe({
      next: () => {
        this.success = 'Student deleted!';
        this.loadStudents();
      },
      error: () => (this.error = 'Delete failed'),
    });
  }

  closeForm() {
    this.showForm = false;
    this.error = '';
    this.success = '';
  }
}
