import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Link } from '@grandgular/link';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  readonly #link = inject(Link)

  constructor() {
    this.#link.addTag({
      rel: 'canonical',
      href: 'https://grandgular.com'
    });
  }
}
