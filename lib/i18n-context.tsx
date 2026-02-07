'use client'

import * as React from 'react'
import { en } from '@/lib/translations/en'
import { es } from '@/lib/translations/es'

type Language = 'en' | 'es'
type Translations = Record<string, string>

const dictionaries: Record<Language, Translations> = { en, es }

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const I18nContext = React.createContext<I18nContextType | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = React.useState<Language>('en')

  React.useEffect(() => {
    const saved = localStorage.getItem('pevi-lang') as Language | null
    if (saved && (saved === 'en' || saved === 'es')) {
      setLanguageState(saved)
    }
  }, [])

  const setLanguage = React.useCallback((lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('pevi-lang', lang)
  }, [])

  const t = React.useCallback(
    (key: string, params?: Record<string, string | number>) => {
      let value = dictionaries[language][key] || dictionaries.en[key] || key
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          value = value.replace(new RegExp(`{{${k}}}`, 'g'), String(v))
        })
      }
      return value
    },
    [language],
  )

  const ctx = React.useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t])

  return <I18nContext.Provider value={ctx}>{children}</I18nContext.Provider>
}

export function useTranslation() {
  const ctx = React.useContext(I18nContext)
  if (!ctx) throw new Error('useTranslation must be used within LanguageProvider')
  return ctx
}
