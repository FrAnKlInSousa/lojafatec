import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';
import { Logo } from './components/logo/logo';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, CommonModule, Logo],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly title = signal('livros');

  get estaLogado(): boolean{
    return this.authService.estaLogado();
  }

  logout(): void{
    this.authService.logout();
    this.router.navigate(['/login'])
  }
}
