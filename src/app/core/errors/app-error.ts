export type AppErrorCode =
  | 'ai_key_missing'
  | 'ai_empty_response'
  | 'ai_invalid_response'
  | 'network'
  | 'unknown';

export interface AppError {
  code: AppErrorCode;
  title: string;
  message: string;
  recoverable: boolean;
}
