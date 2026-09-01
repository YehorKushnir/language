interface AuthError {
  code?: string
  message?: string
}

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  EMAIL_ALREADY_IN_USE: 'Пользователь с таким email уже существует.',
  FAILED_TO_CREATE_USER: 'Не удалось создать пользователя.',
  INVALID_EMAIL: 'Проверьте формат email.',
  INVALID_EMAIL_OR_PASSWORD: 'Неверный email или пароль.',
  INVALID_PASSWORD: 'Текущий пароль указан неверно.',
  INVALID_TOKEN: 'Ссылка устарела или уже была использована.',
  CREDENTIAL_ACCOUNT_NOT_FOUND:
    'Для аккаунта, созданного через Google, пароль не используется.',
  NETWORK_ERROR: 'Нет соединения с сервером. Проверьте интернет и повторите.',
  OAUTH_PROVIDER_NOT_FOUND: 'Вход через Google пока не настроен на сервере.',
  SOCIAL_ACCOUNT_ALREADY_LINKED:
    'Этот Google-аккаунт уже связан с другим пользователем.',
  FAILED_TO_GET_ACCESS_TOKEN: 'Google не подтвердил вход. Попробуйте ещё раз.',
  FAILED_TO_GET_USER_INFO: 'Не удалось получить данные Google-аккаунта.',
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
