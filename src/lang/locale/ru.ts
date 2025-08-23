// русский
import { Lang } from './en';

const lang: Partial<Lang> = {
  // main.ts
  'Toggle Life in Weeks View': 'Переключить вид Жизнь в Неделях',
  'Open configuration': 'Открыть конфигурацию',
  'Enable Life in Weeks view': 'Включить вид Жизнь в Неделях',
  'Create new Life in Weeks note': 'Создать новую заметку Жизнь в Неделях',
  'Life in Weeks': 'Жизнь в Неделях',

  // LifeinweeksView.tsx
  'I discover the Life in Weeks plugin.': 'Я обнаруживаю плагин Жизнь в Неделях.',
  'It was an *interesting* find.': 'Это было *интересное* открытие.',
  'Early Years': 'Ранние годы',
  'Teens': 'Подростковый возраст',

  // settings.ts
  'Show': 'Показать',
  'As a button in the document header': 'В виде кнопки в заголовке документа',
  'Open Configuration': 'Открыть конфигурацию',
  'Open as markdown': 'Открыть в формате Markdown',

  // ConfigurationModal.ts
  'Starting date': 'Дата начала',
  'Ending year': 'Год окончания',
  'Show birthday': 'Показать день рождения',
  'Birthday': 'День рождения',
  'Birthday display text': 'Текст отображения дня рождения',
  'Use %s for the age placeholder': 'Используйте %s для возраста',
  'Decades text': 'Текст десятилетий',
  'Decade': 'Десятилетие',
  'Submit': 'Отправить',
  // error messages
  'Start date must be in YYYY-MM-DD format.': 'Дата начала должна быть в формате YYYY-MM-DD.',
  'End year must be a valid year.': 'Год окончания должен быть действительным годом.',
  'Birthday must be in MM-DD format.': 'День рождения должен быть в формате MM-DD.',
  'Submit failed:': 'Ошибка отправки:'
};

export default lang;