export interface LanguageInfo {
  code: LanguageType
  name: string
  nativeName: string
}

export type LanguageType =
  | 'en' // English
  | 'fil' // Filipino (standardized Tagalog)
  | 'ceb' // Cebuano/Bisaya
  | 'bcl' // Bikol
  | 'hil' // Hiligaynon/Ilonggo
  | 'ilo' // Ilocano
  | 'krj' // Kinaray-a
  | 'mag' // Maguindanao
  | 'mdh' // Maranao
  | 'pag' // Pangasinan
  | 'pam' // Kapampangan
  | 'tsg' // Tausug
  | 'war' // Waray

export const LANGUAGES: Record<LanguageType, LanguageInfo> = {
  en: { code: 'en', name: 'English', nativeName: 'English' },
  fil: { code: 'fil', name: 'Tagalog', nativeName: 'Filipino/Tagalog' },
  bcl: { code: 'bcl', name: 'Bikol', nativeName: 'Bikol Central' },
  ceb: { code: 'ceb', name: 'Cebuano', nativeName: 'Bisaya/Sinugboanon' },
  hil: { code: 'hil', name: 'Hiligaynon', nativeName: 'Ilonggo' },
  ilo: { code: 'ilo', name: 'Ilocano', nativeName: 'Ilokano' },
  krj: { code: 'krj', name: 'Kinaray-a', nativeName: 'Kinaray-a' },
  mag: { code: 'mag', name: 'Maguindanao', nativeName: 'Maguindanaon' },
  mdh: { code: 'mdh', name: 'Maranao', nativeName: 'Meranaw' },
  pag: { code: 'pag', name: 'Pangasinan', nativeName: 'Pangasinan' },
  pam: { code: 'pam', name: 'Kapampangan', nativeName: 'Kapampangan' },
  tsg: { code: 'tsg', name: 'Tausug', nativeName: 'Bahasa Sūg' },
  war: { code: 'war', name: 'Waray', nativeName: 'Waray-Waray' },
}

export const DEFAULT_LANGUAGE: LanguageType = 'en'
