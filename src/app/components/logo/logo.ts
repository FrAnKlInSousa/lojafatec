import { AfterViewInit, Component } from '@angular/core';
import { animate, svg } from 'animejs';

@Component({
  selector: 'app-logo',
  templateUrl: './logo.html',
  styleUrl: './logo.css',
})
export class Logo implements AfterViewInit {

  ngAfterViewInit(): void {
    animate(svg.createDrawable('.navbar-logo path'), {
      draw: ['0 0', '0 1'],
      duration: 1200,
      ease: 'inOutQuad',
      loop: true,
      loopDelay: 5000
    });
  }
}
