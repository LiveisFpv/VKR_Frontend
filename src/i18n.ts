import { ref } from 'vue'

export type Locale = 'en' | 'ru'

const STORAGE_KEY = 'app.locale'

function loadLocale(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'en' || saved === 'ru') return saved
  } catch {}
  return 'en'
}

export const locale = ref<Locale>(loadLocale())

export function setLocale(next: Locale) {
  locale.value = next
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {}
}

const messages: Record<Locale, Record<string, string>> = {
  en: {
    'nav.addPaper': 'Add Paper',
    'nav.moderation': 'Moderation',
    'nav.adminPanel': 'Admin Panel',
    'nav.newSearch': 'New search',
    'nav.searchChats': 'Search chats',
    'nav.history': 'History',
    'nav.settings': 'Settings',
    'nav.noChats': 'No chats yet. Start a new search.',

    'settings.title': 'Settings',
    'settings.appearance': 'Appearance',
    'settings.dark': 'Dark theme',
    'settings.light': 'Light theme',
    'settings.sidebar': 'Sidebar',
    'settings.hideLeft': 'Hide left panel',
    'settings.language': 'Language',
    'settings.langEnglish': 'English',
    'settings.langRussian': 'Russian',

    'paperAdd.header': 'Add Paper',
    'paperAdd.title': 'Title',
    'paperAdd.abstract': 'Abstract',
    'paperAdd.year': 'Year',
    'paperAdd.pdfSource': 'PDF/Source URL',
    'paperAdd.related': 'Related Papers',
    'paperAdd.referenced': 'Referenced Papers',
    'paperAdd.errNoTitle': 'Please provide a title',
    'paperAdd.okSubmitted': 'Paper submitted for moderation',
    'paperAdd.errSubmit': 'Failed to submit paper (mock/draft)',

    'common.add': 'Add',
    'common.remove': 'Remove',
    'common.submit': 'Submit',
    'common.submitting': 'Submitting…',
    'common.refresh': 'Refresh',
    'common.loading': 'Loading…',
    'common.edit': 'Edit',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.apply': 'Apply',
    'common.delete': 'Delete',

    'admin.title': 'Admin Panel',
    'admin.toModerator': 'Moderator Panel',
    'admin.users': 'Users',
    'admin.noUsers': 'No users',
    'admin.errFetch': 'Failed to fetch users',

    'mod.title': 'Moderator Panel',
    'mod.draftNote': 'Draft version using mock data',
    'mod.status.pending': 'Pending',
    'mod.status.approved': 'Approved',
    'mod.status.rejected': 'Rejected',
    'mod.noItems': 'No papers to moderate',
    'mod.meta.author': 'Author',

    'chat.status.searching': 'Searching...',
    'chat.error.enterQuery': 'Enter a query to search.',
    'chat.error.noResults': 'No results matched your query.',
    'chat.error.failed': 'Search failed. Please try again.',
    'chat.empty': 'Start a new search to see results here.',
    'chat.noResultsForTurn': 'No results captured for this query.',
    'chat.openAccess': 'Open Access',
    'chat.preview.year': 'Year',
    'chat.preview.source': 'Source',
    'chat.link.openPdf': 'Open PDF',
    'chat.link.articlePage': 'Article page',
    'chat.input.search': 'Search',
    'chat.input.searching': 'Searching...',
    'chat.input.blocked': 'Blocked',
    'chat.input.placeholder': 'e.g. interpretable machine learning',
    'chat.blockedNote': 'Search disabled for Admin/Moderator',
    'chat.untitled': 'Untitled paper',
    'chat.noAbstract': 'No abstract available.',

    'auth.login': 'Log in',
    'auth.signup': 'Sign up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.firstname': 'Firstname',
    'auth.lastname': 'Lastname',
    'auth.forgot': 'Forgot Password?',
    'auth.continueGoogle': 'Continue with Google',
    'auth.continueYandex': 'Continue with Yandex',
    'auth.noAccount': "Don't have an account?",
    'auth.haveAccount': 'Already have an account?',
    'auth.createOne': 'Create one',
    'auth.signIn': 'Sign in',

    'notFound.title': '404 - Page Not Found',
    'notFound.desc': 'The page you are looking for does not exist.',
    'notFound.home': 'Go back to Home',

    'footer.copy': '© 2025 LiveisFPV Dev. All rights reserved.',

    'paper.viewTitle': 'Paper View',

    'search.title': 'Search View',
    'search.placeholder': 'This is a placeholder page.',

    'profile.title': 'Your profile',
    'profile.emailConfirmed': 'Email confirmed',
    'profile.locale': 'Locale',
    'profile.roles': 'Roles',
    'profile.form.firstName': 'First name',
    'profile.form.lastName': 'Last name',
    'profile.form.locale': 'Locale (e.g. en, ru)',
    'profile.form.newPassword': 'New password',
    'profile.form.keepBlank': 'Leave blank to keep',
    'profile.btn.cancel': 'Cancel',
    'profile.btn.save': 'Save changes',
    'profile.saving': 'Saving...',
    'profile.btn.edit': 'Edit profile',
    'profile.btn.logout': 'Log out',
    'profile.msg.nothing': 'Nothing to update',
    'profile.msg.updated': 'Profile updated',
    'profile.msg.failed': 'Failed to update profile',
    'common.yes': 'Yes',
    'common.no': 'No',
  },
  ru: {
    'nav.addPaper': 'Добавить статью',
    'nav.moderation': 'Модерация',
    'nav.adminPanel': 'Админ-панель',
    'nav.newSearch': 'Новый поиск',
    'nav.searchChats': 'Поиск по чатам',
    'nav.history': 'История',
    'nav.settings': 'Настройки',
    'nav.noChats': 'Пока нет чатов. Начните новый поиск.',

    'settings.title': 'Настройки',
    'settings.appearance': 'Оформление',
    'settings.dark': 'Тёмная тема',
    'settings.light': 'Светлая тема',
    'settings.sidebar': 'Боковая панель',
    'settings.hideLeft': 'Скрывать левую панель',
    'settings.language': 'Язык',
    'settings.langEnglish': 'Английский',
    'settings.langRussian': 'Русский',

    'paperAdd.header': 'Добавление статьи',
    'paperAdd.title': 'Заголовок',
    'paperAdd.abstract': 'Аннотация',
    'paperAdd.year': 'Год',
    'paperAdd.pdfSource': 'Ссылка на PDF/источник',
    'paperAdd.related': 'Связанные статьи',
    'paperAdd.referenced': 'Ссылаемые статьи',
    'paperAdd.errNoTitle': 'Укажите заголовок статьи',
    'paperAdd.okSubmitted': 'Статья отправлена на модерацию',
    'paperAdd.errSubmit': 'Не удалось отправить статью (мок/черновик)',

    'common.add': 'Добавить',
    'common.remove': 'Удалить',
    'common.submit': 'Отправить',
    'common.submitting': 'Отправка…',
    'common.refresh': 'Обновить',
    'common.loading': 'Загрузка…',
    'common.edit': 'Редактировать',
    'common.cancel': 'Отмена',
    'common.save': 'Сохранить',
    'common.apply': 'Применить',
    'common.delete': 'Удалить',

    'admin.title': 'Панель администратора',
    'admin.toModerator': 'Панель модератора',
    'admin.users': 'Пользователи',
    'admin.noUsers': 'Нет пользователей',
    'admin.errFetch': 'Не удалось получить список пользователей',

    'mod.title': 'Панель модератора',
    'mod.draftNote': 'Черновая версия на мок-данных',
    'mod.status.pending': 'На рассмотрении',
    'mod.status.approved': 'Одобрено',
    'mod.status.rejected': 'Отклонено',
    'mod.noItems': 'Нет статей для модерации',
    'mod.meta.author': 'Автор',

    'chat.status.searching': 'Поиск…',
    'chat.error.enterQuery': 'Введите запрос для поиска.',
    'chat.error.noResults': 'Ничего не найдено по запросу.',
    'chat.error.failed': 'Ошибка поиска. Попробуйте ещё раз.',
    'chat.empty': 'Начните новый поиск, чтобы увидеть результаты.',
    'chat.noResultsForTurn': 'Для этого запроса нет результатов.',
    'chat.openAccess': 'Open Access',
    'chat.preview.year': 'Год',
    'chat.preview.source': 'Источник',
    'chat.link.openPdf': 'Открыть PDF',
    'chat.link.articlePage': 'Страница статьи',
    'chat.input.search': 'Поиск',
    'chat.input.searching': 'Поиск…',
    'chat.input.blocked': 'Заблокировано',
    'chat.input.placeholder': 'например, interpretable machine learning',
    'chat.blockedNote': 'Поиск недоступен для ролей Админ/Модератор',
    'chat.untitled': 'Без названия',
    'chat.noAbstract': 'Нет аннотации.',

    'auth.login': 'Войти',
    'auth.signup': 'Зарегистрироваться',
    'auth.email': 'Email',
    'auth.password': 'Пароль',
    'auth.confirmPassword': 'Подтвердите пароль',
    'auth.firstname': 'Имя',
    'auth.lastname': 'Фамилия',
    'auth.forgot': 'Забыли пароль?',
    'auth.continueGoogle': 'Войти через Google',
    'auth.continueYandex': 'Войти через Яндекс',
    'auth.noAccount': 'Нет аккаунта?',
    'auth.haveAccount': 'Уже есть аккаунт?',
    'auth.createOne': 'Создать',
    'auth.signIn': 'Войти',

    'notFound.title': '404 - Страница не найдена',
    'notFound.desc': 'Страница, которую вы ищете, не существует.',
    'notFound.home': 'Вернуться на главную',

    'footer.copy': '© 2025 LiveisFPV Dev. Все права защищены.',

    'paper.viewTitle': 'Статья',

    'search.title': 'Поиск',
    'search.placeholder': 'Временная страница-заглушка.',

    'profile.title': 'Ваш профиль',
    'profile.emailConfirmed': 'Email подтверждён',
    'profile.locale': 'Язык',
    'profile.roles': 'Роли',
    'profile.form.firstName': 'Имя',
    'profile.form.lastName': 'Фамилия',
    'profile.form.locale': 'Язык (например, en, ru)',
    'profile.form.newPassword': 'Новый пароль',
    'profile.form.keepBlank': 'Оставьте пустым, чтобы не менять',
    'profile.btn.cancel': 'Отмена',
    'profile.btn.save': 'Сохранить изменения',
    'profile.saving': 'Сохранение…',
    'profile.btn.edit': 'Редактировать профиль',
    'profile.btn.logout': 'Выйти',
    'profile.msg.nothing': 'Нечего обновлять',
    'profile.msg.updated': 'Профиль обновлён',
    'profile.msg.failed': 'Не удалось обновить профиль',
    'common.yes': 'Да',
    'common.no': 'Нет',
  },
}

export function t(key: string): string {
  const l = locale.value
  return (messages[l] && messages[l][key]) ?? messages.en[key] ?? key
}

export function useI18n() {
  return { locale, setLocale, t, messages }
}
