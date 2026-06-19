import { Component, inject, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AiService } from '../../core/services/ai';
import { RecipeService } from '../../core/services/recipe';
import { ChatMessage } from '../../core/models/chat.interface';
import { RecipePreview } from '../../core/models/recipe.interface';

@Component({
  selector: 'app-chatbot',
  imports: [FormsModule],
  templateUrl: './chatbot.html',
  styleUrl: './chatbot.scss',
})
export class Chatbot implements AfterViewChecked {
  @ViewChild('messageList') messageList!: ElementRef;

  private aiService = inject(AiService);
  private recipeService = inject(RecipeService);
  private router = inject(Router);

  userInput = signal('');
  messages = signal<ChatMessage[]>([
    { sender: 'bot', text: '👋 Hallo! Ich helfe dir Rezepte zu finden. Schreib z.B. "Ich habe Hühnchen und Tomaten" oder "Was kann ich heute kochen?"', timestamp: new Date() }
  ]);
  results = signal<RecipePreview[]>([]);
  thinking = signal(false);

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  async send(): Promise<void> {
    const text = this.userInput().trim();
    if (!text || this.thinking()) return;

    this.addMessage('user', text);
    this.userInput.set('');
    this.thinking.set(true);
    this.results.set([]);

    if (!this.aiService.hasApiKey()) {
      this.addMessage('bot', '⚠️ Bitte zuerst einen Gemini API Key oben eingeben.');
      this.thinking.set(false);
      return;
    }

    try {
      const englishIngredients = await this.aiService.extractEnglishIngredients(text);

      const firstIngredient = englishIngredients?.split(',')[0]?.trim();

      if (!firstIngredient) {
        this.addMessage('bot', 'Ich konnte keine Zutaten erkennen. Versuche z.B. "Ich habe Hühnchen und Tomaten".');
        this.thinking.set(false);
        return;
      }

      const meals = await this.searchByIngredient(firstIngredient);

      if (meals.length > 0) {
        this.addMessage('bot', `Mit "${firstIngredient}" habe ich ${meals.length} Rezepte gefunden:`);
        this.results.set(meals.slice(0, 8));
      } else {
        const byName = await this.searchByName(firstIngredient);
        if (byName.length > 0) {
          this.addMessage('bot', `${byName.length} Rezepte gefunden:`);
          this.results.set(byName.slice(0, 8));
        } else {
          this.addMessage('bot', `Keine Rezepte mit "${firstIngredient}" gefunden. Versuche andere Zutaten.`);
        }
      }
    } catch {
      this.addMessage('bot', 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
    }

    this.thinking.set(false);
  }

  openRecipe(id: string): void {
    this.router.navigate(['/recipe', id]);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  private addMessage(sender: 'user' | 'bot', text: string): void {
    this.messages.update(msgs => [...msgs, { sender, text, timestamp: new Date() }]);
  }

  private searchByName(name: string): Promise<RecipePreview[]> {
    return new Promise(resolve => {
      this.recipeService.searchByName(name).subscribe(resolve);
    });
  }

  private searchByIngredient(ingredient: string): Promise<RecipePreview[]> {
    return new Promise(resolve => {
      this.recipeService.searchByIngredient(ingredient).subscribe(resolve);
    });
  }

  private scrollToBottom(): void {
    try {
      this.messageList.nativeElement.scrollTop = this.messageList.nativeElement.scrollHeight;
    } catch { /* ignore */ }
  }
}
