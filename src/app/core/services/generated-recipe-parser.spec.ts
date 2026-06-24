import { describe, expect, it, beforeEach } from 'vitest';
import { GeneratedRecipeParseError, GeneratedRecipeParser } from './generated-recipe-parser';

const validRecipe = {
  title: 'Tomato Pasta',
  ingredients: ['Pasta', 'Tomatoes'],
  missingIngredients: ['Basil'],
  steps: [{ step: 1, description: 'Cook pasta.', parallel: false, assignedTo: 1 }],
  duration: '25 Min',
  difficulty: 'Einfach',
  cuisine: 'Italienisch',
  diet: 'vegetarian',
  portions: 2,
};

describe('GeneratedRecipeParser', () => {
  let parser: GeneratedRecipeParser;

  beforeEach(() => {
    parser = new GeneratedRecipeParser();
  });

  it('parses recipe arrays from fenced AI responses', () => {
    const recipes = parser.parseRecipeList(
      `Here you go:\n\`\`\`json\n[${JSON.stringify(validRecipe)}]\n\`\`\``,
    );

    expect(recipes).toHaveLength(1);
    expect(recipes[0].title).toBe('Tomato Pasta');
    expect(recipes[0].steps[0].description).toBe('Cook pasta.');
  });

  it('parses one generated recipe object', () => {
    const recipe = parser.parseRecipe(JSON.stringify(validRecipe));

    expect(recipe.ingredients).toEqual(['Pasta', 'Tomatoes']);
    expect(recipe.portions).toBe(2);
  });

  it('throws a structured error when required fields are missing', () => {
    expect(() => parser.parseRecipe('{"title":"Broken"}')).toThrow(GeneratedRecipeParseError);
  });
});
