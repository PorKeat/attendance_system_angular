import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { MainLayoutComponent } from './components/layout/main-layout/main-layout';
import { StudentComponent } from './components/student/student';
import { AttendanceComponent } from './components/attendance/attendance';
import { ClassComponent } from './components/class/class';
import { SubjectComponent } from './components/subject/subject';
import { TeacherComponent } from './components/teacher/teacher';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'student', component: StudentComponent },
      { path: 'attendance', component: AttendanceComponent },
      { path: 'class', component: ClassComponent },
      { path: 'subject', component: SubjectComponent },
      { path: 'teacher', component: TeacherComponent },
      { path: 'students', component: StudentComponent },
    ],
  },
];
