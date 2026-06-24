import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/components/navbar/navbar';
import { DemoWorkspaceNotice } from './shared/components/demo-workspace-notice/demo-workspace-notice';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, DemoWorkspaceNotice],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
