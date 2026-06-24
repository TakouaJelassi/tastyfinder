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
    expect(prompt).toContain('Portionen: 4');
    expect(prompt).toContain('bis 20 Min');
    expect(prompt).toContain('validen JSON Array');
  });

  it('builds single recipe prompts for chat fallback', () => {
    const prompt = builder.buildChatRecipePrompt('quick dinner with rice');

    expect(prompt).toContain('quick dinner with rice');
    expect(prompt).toContain('validen JSON-Objekt');
    expect(prompt).toContain('"title"');
  });
});
