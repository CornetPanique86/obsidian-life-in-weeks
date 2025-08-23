import en, { Lang } from "./locale/en";
import fr from "./locale/fr";
import ru from "./locale/ru";


const localeMap: { [k: string]: Partial<Lang> } = {
  en,
  fr,
  ru
};

const lang = window.localStorage.getItem('language');
const locale = localeMap[lang || 'en'];

export function t(str: keyof typeof en): string {
  if (!locale) {
    console.error('Error: kanban locale not found', lang);
  }

  return (locale && locale[str]) || en[str];
}