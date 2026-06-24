import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../../core/services/ai';

@Component({
  selector: 'app-api-key-banner',
  imports: [FormsModule],
  templateUrl: './api-key-banner.html',
  styleUrl: './api-key-banner.scss',
})
export class ApiKeyBanner {
  private aiService = inject(AiService);

  keyInput = signal('');
  saved = signal(false);
  hasKey = signal(this.aiService.hasApiKey());

  save(): void {
    const key = this.keyInput().trim();
    if (!key) return;
    this.aiService.setApiKey(key);
    this.keyInput.set('');
    this.hasKey.set(true);
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 3000);
  }

  removeAll(): void {
    this.aiService.removeApiKey();
    this.hasKey.set(false);
  }
}
