import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-demo-workspace-notice',
  imports: [RouterLink],
  templateUrl: './demo-workspace-notice.html',
  styleUrl: './demo-workspace-notice.scss',
})
export class DemoWorkspaceNotice {
  authService = inject(AuthService);
}
