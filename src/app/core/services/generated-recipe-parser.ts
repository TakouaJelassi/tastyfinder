import { Injectable } from '@angular/core';
import { GeneratedRecipe, RecipeStep } from '../models/generated-recipe.interface';

export class GeneratedRecipeParseError extends Error {
  constructor(
    message: string,
    readonly details: string[] = [],
  ) {
    super(message);
    this.name = 'GeneratedRecipeParseError';
  }
}

@Injectable({ providedIn: 'root' })
export class GeneratedRecipeParser {
  parseRecipeList(raw: string): GeneratedRecipe[] {
    const parsed = this.parseJson(raw, 'array');
    if (!Array.isArray(parsed)) {
      throw new GeneratedRecipeParseError('AI response is not a recipe list.');
    }

    const recipes = parsed.map((item, index) => this.toRecipe(item, index));
    if (recipes.length === 0) {
      throw new GeneratedRecipeParseError('AI response did not contain any recipes.');
    }

    return recipes;
  }

  parseRecipe(raw: string): GeneratedRecipe {
    const parsed = this.parseJson(raw, 'object');
    if (!this.isRecord(parsed)) {
      throw new GeneratedRecipeParseError('AI response is not a recipe object.');
    }

    return this.toRecipe(parsed, 0);
  }

  private parseJson(raw: string, expected: 'array' | 'object'): unknown {
    const candidate = this.extractJson(raw, expected);
    try {
      return JSON.parse(candidate);
    } catch (error) {
      throw new GeneratedRecipeParseError('AI response contains invalid JSON.', [
        error instanceof Error ? error.message : 'Unknown JSON parse error.',
      ]);
    }
  }

  private extractJson(raw: string, expected: 'array' | 'object'): string {
    const cleaned = raw
      .replace(/```(?:json)?/gi, '')
      .replace(/```/g, '')
      .trim();

    const startToken = expected === 'array' ? '[' : '{';
    const endToken = expected === 'array' ? ']' : '}';
    const start = cleaned.indexOf(startToken);
    const end = cleaned.lastIndexOf(endToken);

    if (start === -1 || end === -1 || end <= start) {
      throw new GeneratedRecipeParseError('AI response did not include JSON content.');
    }

    return cleaned.slice(start, end + 1);
  }

  private toRecipe(value: unknown, index: number): GeneratedRecipe {
    if (!this.isRecord(value)) {
      throw new GeneratedRecipeParseError(`Recipe ${index + 1} is not an object.`);
    }

    const missing = this.validate(value, index);
    if (missing.length) {
      throw new GeneratedRecipeParseError(`Recipe ${index + 1} is missing required fields.`, missing);
    }

    return {
      title: String(value['title']).trim(),
      ingredients: this.toStringList(value['ingredients']),
      missingIngredients: this.toStringList(value['missingIngredients']),
      steps: this.toSteps(value['steps']),
      duration: String(value['duration']).trim(),
      difficulty: String(value['difficulty']).trim(),
      cuisine: String(value['cuisine']).trim(),
      diet: String(value['diet']).trim(),
      portions: Number(value['portions']),
    };
  }

  private validate(value: Record<string, unknown>, index: number): string[] {
    const prefix = `recipes[${index}]`;
    const errors: string[] = [];

    if (!this.hasText(value['title'])) errors.push(`${prefix}.title must be a non-empty string`);
    if (!this.isStringArray(value['ingredients'])) errors.push(`${prefix}.ingredients must be a string array`);
    if (!Array.isArray(value['missingIngredients'])) {
      errors.push(`${prefix}.missingIngredients must be an array`);
    }
    if (!Array.isArray(value['steps'])) errors.push(`${prefix}.steps must be an array`);
    if (!this.hasText(value['duration'])) errors.push(`${prefix}.duration must be a non-empty string`);
    if (!this.hasText(value['difficulty'])) errors.push(`${prefix}.difficulty must be a non-empty string`);
    if (!this.hasText(value['cuisine'])) errors.push(`${prefix}.cuisine must be a non-empty string`);
    if (!this.hasText(value['diet'])) errors.push(`${prefix}.diet must be a non-empty string`);
    if (!Number.isFinite(Number(value['portions']))) errors.push(`${prefix}.portions must be a number`);

    return errors;
  }

  private toSteps(value: unknown): RecipeStep[] {
    if (!Array.isArray(value)) return [];

    return value
      .filter((step): step is Record<string, unknown> => this.isRecord(step))
      .map((step, index) => ({
        step: Number.isFinite(Number(step['step'])) ? Number(step['step']) : index + 1,
        description: this.hasText(step['description']) ? String(step['description']).trim() : '',
        parallel: Boolean(step['parallel']),
        assignedTo: Number.isFinite(Number(step['assignedTo'])) ? Number(step['assignedTo']) : undefined,
      }))
      .filter((step) => step.description);
  }

  private toStringList(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  private isStringArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every((item) => this.hasText(item));
  }

  private hasText(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}
