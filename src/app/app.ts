import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/components/navbar/navbar';
import { ApiKeyBanner } from './shared/components/api-key-banner/api-key-banner';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, ApiKeyBanner],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
