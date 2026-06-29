import { describe, expect, it } from 'vitest';
import { PromptBuilder } from './prompt-builder';

describe('PromptBuilder', () => {
  const builder = new PromptBuilder();

  it('builds recipe list prompts with preferences and strict JSON instructions', () => {
    const prompt = builder.buildRecipeListPrompt('tomatoes, pasta', {
      portions: 4,
      time: 'quick',
      cuisine: 'Italienisch',
      diet: 'vegetarian',
      helpers: 2,
    });

    expect(prompt).toContain('tomatoes, pasta');
    expect(prompt).toContain('Servings: 4');
    expect(prompt).toContain('up to 20 min');
    expect(prompt).toContain('valid JSON array');
  });

  it('builds single recipe prompts for chat fallback', () => {
    const prompt = builder.buildChatRecipePrompt('quick dinner with rice');

    expect(prompt).toContain('quick dinner with rice');
    expect(prompt).toContain('valid JSON object');
    expect(prompt).toContain('"title"');
  });
});
