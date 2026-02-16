import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

type Language = 'en' | 'zh-CN'

const LEGACY_SIMPLIFIED_CHINESE = String.fromCharCode(0x7b80, 0x4f53, 0x4e2d, 0x6587)

interface I18nContextType {
    language: Language
    setLanguage: (lang: Language) => void
    t: (key: string, namespace?: string, params?: Record<string, string | number>) => string
    isLoading: boolean
}

const I18nContext = createContext<I18nContextType | null>(null)

// Glob import all locales
// E.g. ../../../../../i18n/locales/en/components/app-shell/RightSidebar.json
const localeModules = import.meta.glob('../../../../../i18n/locales/**/*.json', { eager: true })

export function I18nProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>('en')
    const [isLoading, setIsLoading] = useState(true)
    const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({})

    // Load initial language from preferences
    useEffect(() => {
        const loadPreferences = async () => {
            try {
                if (window.electronAPI?.readPreferences) {
                    const result = await window.electronAPI.readPreferences()
                    const prefs = JSON.parse(result.content)
                    if (prefs.language === 'zh-CN' || prefs.language === LEGACY_SIMPLIFIED_CHINESE) {
                        setLanguage('zh-CN')
                    } else {
                        // Default to 'en' or detect system locale if needed
                        setLanguage('en')
                    }
                }
            } catch (e) {
                console.error('Failed to load language preference', e)
            } finally {
                setIsLoading(false)
            }
        }
        loadPreferences()
    }, [])

    // Process translations when language changes or initially
    useEffect(() => {
        const newTranslations: Record<string, Record<string, string>> = {}

        // Iterate over all loaded JSON modules
        for (const path in localeModules) {
            // Path example: ../../../../../i18n/locales/en/components/app-shell/RightSidebar.json
            // We want to extract:
            // 1. Language: "en"
            // 2. Namespace: "components/app-shell/RightSidebar"

            const parts = path.split('/locales/')
            if (parts.length !== 2) continue

            const relativePath = parts[1] // en/components/app-shell/RightSidebar.json
            const langMatch = relativePath.match(/^([^/]+)\/(.+)\.json$/)

            if (langMatch) {
                const fileLang = langMatch[1] // en
                const namespace = langMatch[2] // components/app-shell/RightSidebar

                if (fileLang === language) {
                    // @ts-ignore - We know it's a JSON module
                    const content = localeModules[path].default || localeModules[path]
                    newTranslations[namespace] = content
                }
            }
        }
        setTranslations(newTranslations)
    }, [language])

    const t = (key: string, namespace?: string, params?: Record<string, string | number>) => {
        if (!namespace) return key

        const nsTranslations = translations[namespace]
        let translation = key

        if (nsTranslations && nsTranslations[key]) {
            translation = nsTranslations[key]
        }

        // Replace {{variable}} with actual values
        if (params) {
            Object.keys(params).forEach(paramKey => {
                const placeholder = `{{${paramKey}}}`
                translation = translation.replace(placeholder, String(params[paramKey]))
            })
        }

        return translation
    }

    const handleSetLanguage = async (lang: Language) => {
        setLanguage(lang)
        // Persist to preferences
        try {
            if (window.electronAPI?.readPreferences && window.electronAPI?.writePreferences) {
                const result = await window.electronAPI.readPreferences()
                const prefs = JSON.parse(result.content)
                prefs.language = lang
                await window.electronAPI.writePreferences(JSON.stringify(prefs, null, 2))
            }
        } catch (e) {
            console.error("Failed to save language preference", e)
        }
    }

    return (
        <I18nContext.Provider value={{ language, setLanguage: handleSetLanguage, t, isLoading }}>
            {children}
        </I18nContext.Provider>
    )
}

export function useTranslation(namespace: string) {
    const context = useContext(I18nContext)
    if (!context) {
        throw new Error('useTranslation must be used within an I18nProvider')
    }

    const { t: baseT, language } = context

    return {
        t: (key: string, params?: Record<string, string | number>) => baseT(key, namespace, params),
        language
    }
}

export function useI18n() {
    const context = useContext(I18nContext)
    if (!context) {
        throw new Error('useI18n must be used within an I18nProvider')
    }
    return context
}
