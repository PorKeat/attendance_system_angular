import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { MainLayoutComponent } from './components/layout/main-layout/main-layout';
import { Student } from './components/student/student';
import { Attendance } from './components/attendance/attendance';
import { Class } from './components/class/class';
import { Subject } from './components/subject/subject';
import { Teacher } from './components/teacher/teacher';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'student', component: Student },
      { path: 'attendance', component: Attendance },
      { path: 'class', component: Class },
      { path: 'subject', component: Subject },
      { path: 'teacher', component: Teacher },
      { path: 'students', component: Student },
    ],
  },
];
