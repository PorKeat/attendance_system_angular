import { Component, AfterViewInit, ElementRef, ViewChild, QueryList, ViewChildren } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import {
  GraduationCap,
  Users,
  ClipboardList,
  School,
  BookOpen,
  UserRoundCheck,
  LogOut,
} from 'lucide-angular';
import { AuthService } from '../../../services/auth.service';
import gsap from 'gsap';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './sidebar.html',
})
export class SidebarComponent implements AfterViewInit {
  @ViewChild('sidebarEl') sidebarEl!: ElementRef<HTMLElement>;
  @ViewChild('brandEl') brandEl!: ElementRef<HTMLElement>;
  @ViewChild('menuLabel') menuLabel!: ElementRef<HTMLElement>;
  @ViewChildren('navItem') navItems!: QueryList<ElementRef>;
  @ViewChild('logoutEl') logoutEl!: ElementRef<HTMLElement>;

  readonly graduationCap = GraduationCap;
  readonly users = Users;
  readonly clipboardList = ClipboardList;
  readonly school = School;
  readonly bookOpen = BookOpen;
  readonly userRoundCheck = UserRoundCheck;
  readonly logOut = LogOut;

  constructor(private authService: AuthService) {}

  ngAfterViewInit(): void {
    this.playEntrance();
  }

  private playEntrance(): void {
    const sidebar = this.sidebarEl.nativeElement;
    const brand = this.brandEl.nativeElement;
    const label = this.menuLabel.nativeElement;
    const navEls = this.navItems.map(r => r.nativeElement);
    const logout = this.logoutEl.nativeElement;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Sidebar slides in from left
    tl.fromTo(sidebar,
        { x: -80, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.55 })

      // Brand fades down
      .fromTo(brand,
        { y: -16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4 }, '-=0.25')

      // Menu label fades in
      .fromTo(label,
        { x: -12, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.3 }, '-=0.1')

      // Nav items stagger in from left
      .fromTo(navEls,
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.35, stagger: 0.08 }, '-=0.1')

      // Logout slides up
      .fromTo(logout,
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35 }, '-=0.1');
  }

  logout(): void {
    // Animate out then logout
    gsap.to(this.sidebarEl.nativeElement, {
      x: -80,
      opacity: 0,
      duration: 0.35,
      ease: 'power2.in',
      onComplete: () => { this.authService.logout(); },
    });
  }
}