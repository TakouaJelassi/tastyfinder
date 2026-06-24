import { Injectable } from '@angular/core';
import { AppError } from './app-error';
import { GeneratedRecipeParseError } from '../services/generated-recipe-parser';

@Injectable({ providedIn: 'root' })
export class ErrorMapper {
  fromUnknown(error: unknown): AppError {
    if (error instanceof GeneratedRecipeParseError) {
      return {
        code: 'ai_invalid_response',
        title: 'AI response could not be parsed',
        message: 'Die AI-Antwort konnte nicht sicher gelesen werden. Bitte nochmal generieren.',
        recoverable: true,
      };
    }

    if (error instanceof Error && error.message.toLowerCase().includes('api key')) {
      return {
        code: 'ai_key_missing',
        title: 'AI key missing',
        message: 'Bitte aktiviere AI in der Konfiguration auf dieser Seite.',
        recoverable: true,
      };
    }

    return {
      code: 'unknown',
      title: 'Unexpected error',
      message: 'Es ist ein Fehler aufgetreten. Bitte versuche es nochmal.',
      recoverable: true,
    };
  }
}
