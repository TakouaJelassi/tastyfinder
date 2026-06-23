import { Component, inject, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AiService } from '../../core/services/ai';
import { RecipeService } from '../../core/services/recipe';
import { ChatMessage } from '../../core/models/chat.interface';
import { RecipePreview } from '../../core/models/recipe.interface';
import { onImageError } from '../../shared/image-fallback';

interface ChatTurn extends ChatMessage {
  recipes?: RecipePreview[];
}

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
  thinking = signal(false);
  onImageError = onImageError;
  messages = signal<ChatTurn[]>([
    {
      sender: 'bot',
      text: '👋 Hallo! Ich helfe dir, das passende Rezept zu finden. Schreib mir, welche Zutaten du hast oder worauf du Lust hast.',
      timestamp: new Date(),
    },
  ]);

  readonly quickPrompts = [
    'Ich habe Hähnchen und Tomaten',
    'Etwas Vegetarisches',
    'Italienisch',
    'Eine Suppe',
  ];

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  sendQuick(prompt: string): void {
    this.userInput.set(prompt);
    this.send();
  }

  async send(): Promise<void> {
    const text = this.userInput().trim();
    if (!text || this.thinking()) return;

    this.addMessage('user', text);
    this.userInput.set('');
    this.thinking.set(true);

    try {
      const recipes = await this.search(text);
      const reply = await this.buildReply(text, recipes);
      this.addMessage('bot', reply, recipes.slice(0, 6));
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

  /** Erzeugt die Bot-Antwort: mit Groq eine natürliche Antwort, sonst eine Vorlage. */
  private async buildReply(query: string, recipes: RecipePreview[]): Promise<string> {
    if (recipes.length === 0) {
      return 'Dazu habe ich leider kein passendes Rezept gefunden. Versuche es mit anderen Zutaten, einer Küche (z. B. „italienisch") oder „vegetarisch".';
    }

    const names = recipes
      .slice(0, 3)
      .map((r) => r.title)
      .join(', ');

    if (this.aiService.hasApiKey()) {
      try {
        const prompt = `Du bist ein freundlicher Koch-Assistent. Der Nutzer schrieb: "${query}". Ich schlage diese Rezepte vor: ${names}. Antworte in EINEM kurzen, freundlichen deutschen Satz, der zu den Vorschlägen hinführt. Keine Aufzählung, kein Markdown.`;
        const aiText = await this.aiService.generateRaw(prompt);
        if (aiText?.trim()) return aiText.trim();
      } catch {
        /* Fallback unten */
      }
    }

    return `Ich habe ${recipes.length} passende ${recipes.length === 1 ? 'Rezept' : 'Rezepte'} für dich gefunden:`;
  }

  private search(text: string): Promise<RecipePreview[]> {
    return new Promise((resolve) => {
      this.recipeService.searchSmart(text).subscribe(resolve);
    });
  }

  private addMessage(sender: 'user' | 'bot', text: string, recipes?: RecipePreview[]): void {
    this.messages.update((msgs) => [...msgs, { sender, text, timestamp: new Date(), recipes }]);
  }

  private scrollToBottom(): void {
    try {
      this.messageList.nativeElement.scrollTop = this.messageList.nativeElement.scrollHeight;
    } catch {
      /* ignore */
    }
  }
}
