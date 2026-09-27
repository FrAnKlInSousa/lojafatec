import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Livro } from '../../models/livro';
import { LivrosService } from '../../services/livros.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private readonly livrosService = inject(LivrosService);
  private readonly route = inject(ActivatedRoute);

  readonly livros = this.livrosService.listar();
  termo = '';

  constructor(){
    this.route.queryParamMap.subscribe((params) => {
      this.termo = params.get('q') ?? '';
    });
  }

  get livrosFiltrados(): Livro[] {
    return this.livrosService.buscar(this.termo);
  }
}
