import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import gsap from 'gsap';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
})
export class LoginComponent implements AfterViewInit, OnDestroy {
  @ViewChild('loginCard') loginCard!: ElementRef<HTMLElement>;
  @ViewChild('loginTitle') loginTitle!: ElementRef<HTMLElement>;
  @ViewChild('loginBtn') loginBtn!: ElementRef<HTMLButtonElement>;

  username = '';
  password = '';
  rememberMe = false;
  error = '';
  loading = false;

  private animFrameId = 0;

  constructor(private authService: AuthService, private router: Router) {}

  // ─── Lifecycle ───────────────────────────────────────────────────────────────

  ngAfterViewInit(): void {
    this.initStars();
    this.playEntrance();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animFrameId);
  }

  // ─── Twinkling stars ─────────────────────────────────────────────────────────

  private initStars(): void {
    const canvas = document.getElementById('starsCanvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    interface Star { x: number; y: number; r: number; alpha: number; speed: number; }

    const stars: Star[] = Array.from({ length: 160 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight * 0.65,
      r: Math.random() * 1.6 + 0.3,
      alpha: Math.random(),
      speed: Math.random() * 0.008 + 0.003,
    }));

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        s.alpha += s.speed;
        if (s.alpha > 1 || s.alpha < 0) s.speed *= -1;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        const warm = Math.random() > 0.85;
        ctx.fillStyle = `hsla(${warm ? 45 : 0}, 80%, 95%, ${s.alpha})`;
        ctx.fill();
      }
      this.animFrameId = requestAnimationFrame(tick);
    };
    tick();
  }

  // ─── GSAP animations ─────────────────────────────────────────────────────────

  private playEntrance(): void {
    const card = this.loginCard.nativeElement;
    const title = this.loginTitle.nativeElement;
    const fields = card.querySelectorAll('.form-field');

    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .fromTo(card,
        { opacity: 0, y: 50, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.75 })
      .fromTo(title,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.45 }, '-=0.4')
      .fromTo(fields,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.1 }, '-=0.25');
  }

  private shakeCard(): void {
    gsap.fromTo(
      this.loginCard.nativeElement,
      { x: 0 },
      {
        x: 11,
        duration: 0.07,
        ease: 'power1.inOut',
        yoyo: true,
        repeat: 5,
        onComplete: () => { gsap.set(this.loginCard.nativeElement, { x: 0 }); },
      }
    );
  }

  private animateErrorIn(): void {
    setTimeout(() => {
      const el = this.loginCard.nativeElement.querySelector('[\\#errorBanner], .error-banner')
        ?? this.loginCard.nativeElement.querySelector('.text-red-300');
      if (!el) return;
      gsap.fromTo(el,
        { opacity: 0, y: -8, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 },
        { opacity: 1, y: 0, height: 'auto', marginBottom: '1rem', paddingTop: '0.625rem', paddingBottom: '0.625rem', duration: 0.3, ease: 'power2.out' }
      );
    }, 0);
  }

  private animateExit(onComplete: () => void): void {
    gsap.to(this.loginCard.nativeElement, {
      opacity: 0,
      y: -35,
      scale: 0.96,
      duration: 0.45,
      ease: 'power2.in',
      onComplete,
    });
  }

  // ─── Login logic ─────────────────────────────────────────────────────────────

  login(): void {
    gsap.fromTo(this.loginBtn.nativeElement,
      { scale: 1 },
      { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1, ease: 'power1.inOut' }
    );

    this.loading = true;
    this.error = '';

    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.animateExit(() => { this.router.navigate(['/student']); });
      },
      error: () => {
        this.error = 'Invalid username or password';
        this.loading = false;
        this.shakeCard();
        this.animateErrorIn();
      },
    });
  }
}