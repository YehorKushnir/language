interface AuthError {
  code?: string
  message?: string
}

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  EMAIL_ALREADY_IN_USE: 'Пользователь с таким email уже существует.',
  FAILED_TO_CREATE_USER: 'Не удалось создать пользователя.',
  INVALID_EMAIL: 'Проверьте формат email.',
  INVALID_EMAIL_OR_PASSWORD: 'Неверный email или пароль.',
  PASSWORD_TOO_LONG: 'Пароль слишком длинный.',
  PASSWORD_TOO_SHORT: 'Пароль должен содержать не менее 8 символов.',
  USER_ALREADY_EXISTS: 'Пользователь с таким email уже существует.',
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
    'Пользователь с таким email уже существует.',
}

export function authErrorMessage(
  error: AuthError | null,
  fallback: string,
): string {
  if (!error) {
    return fallback
  }

  const localizedMessage = error.code
    ? AUTH_ERROR_MESSAGES[error.code]
    : undefined

  if (localizedMessage) {
    return localizedMessage
  }

  return error.message || fallback
}
