import { Component, inject, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AiService } from '../../core/services/ai';
import { RecipeService } from '../../core/services/recipe';
import { ShoppingStore } from '../../core/stores/shopping.store';
import { GeneratedRecipeParser } from '../../core/services/generated-recipe-parser';
import { PromptBuilder } from '../../core/services/prompt-builder';
import { ChatMessage } from '../../core/models/chat.interface';
import { RecipePreview } from '../../core/models/recipe.interface';
import { GeneratedRecipe } from '../../core/models/generated-recipe.interface';
import { onImageError } from '../../shared/image-fallback';
import { ApiKeyBanner } from '../../shared/components/api-key-banner/api-key-banner';
import { Icon } from '../../shared/components/icon/icon';

interface ChatTurn extends ChatMessage {
  recipes?: RecipePreview[];
  generated?: GeneratedRecipe;
}

@Component({
  selector: 'app-chatbot',
  imports: [FormsModule, ApiKeyBanner, Icon],
  templateUrl: './chatbot.html',
  styleUrl: './chatbot.scss',
})
export class Chatbot implements AfterViewChecked {
  @ViewChild('messageList') messageList!: ElementRef;

  private aiService = inject(AiService);
  private recipeService = inject(RecipeService);
  private shoppingStore = inject(ShoppingStore);
  private recipeParser = inject(GeneratedRecipeParser);
  private promptBuilder = inject(PromptBuilder);
  private router = inject(Router);

  userInput = signal('');
  thinking = signal(false);
  onImageError = onImageError;
  messages = signal<ChatTurn[]>([
    {
      sender: 'bot',
      text: "Hi! I can help you find the perfect recipe. Tell me what ingredients you have or what you're in the mood for.",
      timestamp: new Date(),
    },
  ]);

  readonly quickPrompts = [
    'I have chicken and tomatoes',
    'Something vegetarian',
    'Italian cuisine',
    'A hearty soup',
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
      } else if (await this.aiService.hasAiAccess()) {
        const generated = await this.generateRecipe(text);
        if (generated) {
          this.addMessage(
            'bot',
            `No match in collection — I created a new recipe for you: "${generated.title}"`,
            undefined,
            generated,
          );
        } else {
          this.addMessage(
            'bot',
            "I couldn't create a recipe right now. Please try rephrasing.",
          );
        }
      } else {
        this.addMessage(
          'bot',
          'No recipe found in the collection. Enable AI to generate a custom one.',
        );
      }
    } catch {
      this.addMessage('bot', 'An error occurred. Please try again.');
    }

    this.thinking.set(false);
  }

  openRecipe(id: string): void {
    this.router.navigate(['/recipe', id]);
  }

  async addGeneratedToShopping(recipe: GeneratedRecipe): Promise<void> {
    await this.shoppingStore.add(recipe.ingredients);
    this.addMessage('bot', `Zutaten für „${recipe.title}" wurden zur Einkaufsliste hinzugefügt.`);
  }

  private async generateRecipe(query: string): Promise<GeneratedRecipe | null> {
    const prompt = this.promptBuilder.buildChatRecipePrompt(query);
    try {
      const raw = await this.aiService.generateRaw(prompt);
      return this.recipeParser.parseRecipe(raw);
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

  private async buildReply(query: string, recipes: RecipePreview[]): Promise<string> {
    if (recipes.length === 0) {
      return "Sorry, I couldn't find a matching recipe. Try other ingredients, a cuisine (e.g. Italian) or vegetarian.";
    }

    const names = recipes
      .slice(0, 3)
      .map((r) => r.title)
      .join(', ');

    if (await this.aiService.hasAiAccess()) {
      try {
        const prompt = `You are a friendly cooking assistant. The user asked: "${query}". I suggest these recipes: ${names}. Reply in ONE short friendly English sentence leading into the suggestions. No bullet points, no markdown.`;
        const aiText = await this.aiService.generateRaw(prompt);
        if (aiText?.trim()) return aiText.trim();
      } catch {
        /* Fallback unten */
      }
    }

    return `I found ${recipes.length} matching ${recipes.length === 1 ? 'recipe' : 'recipes'} for you:`;
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
