import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/components/navbar/navbar';
import { DemoWorkspaceNotice } from './shared/components/demo-workspace-notice/demo-workspace-notice';
import { Toast } from './shared/components/toast/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, DemoWorkspaceNotice, Toast],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
