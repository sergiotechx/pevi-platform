'use client'

import { useTranslation } from '@/lib/i18n-context'
import { Button } from '@/components/ui/button'

export function LanguageToggle() {
  const { language, setLanguage } = useTranslation()

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 text-xs font-bold"
      onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
      title={language === 'en' ? 'Cambiar a Español' : 'Switch to English'}
    >
      {language === 'en' ? 'ES' : 'EN'}
    </Button>
  )
}
