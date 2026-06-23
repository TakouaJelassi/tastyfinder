import { Component, inject, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AiService } from '../../core/services/ai';
import { RecipeService } from '../../core/services/recipe';
import { FirestoreService } from '../../core/services/firestore';
import { ChatMessage } from '../../core/models/chat.interface';
import { RecipePreview } from '../../core/models/recipe.interface';
import { GeneratedRecipe } from '../../core/models/generated-recipe.interface';
import { onImageError } from '../../shared/image-fallback';

interface ChatTurn extends ChatMessage {
  recipes?: RecipePreview[];
  generated?: GeneratedRecipe;
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
  private firestoreService = inject(FirestoreService);
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

      if (recipes.length > 0) {
        const reply = await this.buildReply(text, recipes);
        this.addMessage('bot', reply, recipes.slice(0, 6));
      } else if (this.aiService.hasApiKey()) {
        const generated = await this.generateRecipe(text);
        if (generated) {
          this.addMessage(
            'bot',
            `In der Sammlung war nichts Passendes — ich habe dir ein neues Rezept erstellt: „${generated.title}"`,
            undefined,
            generated,
          );
        } else {
          this.addMessage(
            'bot',
            'Ich konnte gerade kein Rezept erstellen. Formuliere es bitte etwas anders.',
          );
        }
      } else {
        this.addMessage(
          'bot',
          'Dazu habe ich kein Rezept in der Sammlung. Mit einem Groq API Key (oben) erstelle ich dir gerne ein neues Rezept.',
        );
      }
    } catch {
      this.addMessage('bot', 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
    }

    this.thinking.set(false);
  }

  openRecipe(id: string): void {
    this.router.navigate(['/recipe', id]);
  }

  async addGeneratedToShopping(recipe: GeneratedRecipe): Promise<void> {
    await this.firestoreService.addShoppingItems(recipe.ingredients);
    this.addMessage('bot', `✓ Zutaten für „${recipe.title}" wurden zur Einkaufsliste hinzugefügt.`);
  }

  /** Generiert per Groq ein einzelnes Rezept aus der freien Anfrage. */
  private async generateRecipe(query: string): Promise<GeneratedRecipe | null> {
    const prompt = `Du bist ein Profi-Koch. Erstelle EIN Rezept passend zu dieser Anfrage: "${query}".
Antworte NUR mit einem validen JSON-Objekt ohne Markdown, genau in diesem Format:
{
  "title": "Rezeptname",
  "ingredients": ["Zutat 1", "Zutat 2"],
  "missingIngredients": [],
  "steps": [{ "step": 1, "description": "Schritt", "parallel": false, "assignedTo": 1 }],
  "duration": "30 Min",
  "difficulty": "Einfach",
  "cuisine": "Italienisch",
  "diet": "none",
  "portions": 2
}`;
    try {
      const raw = await this.aiService.generateRaw(prompt);
      const cleaned = raw.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned) as GeneratedRecipe;
      if (!parsed?.title || !Array.isArray(parsed.ingredients)) return null;
      return parsed;
    } catch {
      return null;
    }
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

  private addMessage(
    sender: 'user' | 'bot',
    text: string,
    recipes?: RecipePreview[],
    generated?: GeneratedRecipe,
  ): void {
    this.messages.update((msgs) => [
      ...msgs,
      { sender, text, timestamp: new Date(), recipes, generated },
    ]);
  }

  private scrollToBottom(): void {
    try {
      this.messageList.nativeElement.scrollTop = this.messageList.nativeElement.scrollHeight;
    } catch {
      /* ignore */
    }
  }
}
