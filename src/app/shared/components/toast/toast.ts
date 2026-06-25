import { Component, inject } from '@angular/core';
import { NotificationService } from '../../../core/services/notification';

@Component({
  selector: 'app-toast',
  imports: [],
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
})
export class Toast {
  private notification = inject(NotificationService);
  message = this.notification.message;
}
