export class AppError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "認証が必要です") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "見つかりませんでした") {
    super(message);
    this.name = "NotFoundError";
  }
}

/**
 * Server Action の catch ブロックで使う。
 * 想定内エラーは message をそのまま返し、
 * 想定外エラーはログだけ出して汎用メッセージを返す。
 */
export function toActionMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  console.error("[unexpected error]", error);
  return "予期しないエラーが発生しました";
}
