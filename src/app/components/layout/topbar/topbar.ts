import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import gsap from 'gsap';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [],
  templateUrl: './topbar.html',
})
export class TopbarComponent implements AfterViewInit {
  @ViewChild('topbarEl') topbarEl!: ElementRef<HTMLElement>;
  @ViewChild('welcomeEl') welcomeEl!: ElementRef<HTMLElement>;
  @ViewChild('bellEl') bellEl!: ElementRef<HTMLElement>;
  @ViewChild('dividerEl') dividerEl!: ElementRef<HTMLElement>;
  @ViewChild('userChipEl') userChipEl!: ElementRef<HTMLElement>;

  user: { username: string; role: string } | null = null;
  today: string = '';

  constructor(private authService: AuthService) {
    this.user = this.authService.getUser();
    this.today = new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }

  ngAfterViewInit(): void {
    this.playEntrance();
  }

  private playEntrance(): void {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Topbar drops down from above
    tl.fromTo(this.topbarEl.nativeElement,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 })

      // Welcome text slides in from left
      .fromTo(this.welcomeEl.nativeElement,
        { x: -16, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4 }, '-=0.25')

      // Bell pops in with scale
      .fromTo(this.bellEl.nativeElement,
        { scale: 0.7, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.8)' }, '-=0.2')

      // Divider fades in
      .fromTo(this.dividerEl.nativeElement,
        { scaleY: 0, opacity: 0 },
        { scaleY: 1, opacity: 1, duration: 0.25 }, '-=0.15')

      // User chip slides in from right
      .fromTo(this.userChipEl.nativeElement,
        { x: 16, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }, '-=0.2');
  }
}