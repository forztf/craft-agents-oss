import { useActionRegistry } from './registry'
import type { ActionId } from './definitions'
import { useTranslation } from '@/contexts/I18nContext'

/**
 * Get the display string for an action's hotkey.
 *
 * @example
 * const hotkey = useHotkeyLabel('app.newChat') // "⌘N" on Mac
 *
 * @example
 * // In a tooltip
 * <Tooltip content={`New Chat ${useHotkeyLabel('app.newChat')}`}>
 */
export function useHotkeyLabel(actionId: ActionId): string | null {
  const { getHotkeyDisplay } = useActionRegistry()
  return getHotkeyDisplay(actionId)
}

/**
 * Get the action label and hotkey for display.
 * Uses i18n for translating labels and descriptions.
 *
 * @example
 * const { label, hotkey } = useActionLabel('app.newChat')
 * // label: "New Chat" (or translated), hotkey: "⌘N"
 */
export function useActionLabel(actionId: ActionId) {
  const { getAction, getHotkeyDisplay } = useActionRegistry()
  const { t } = useTranslation('actions/definitions')
  const action = getAction(actionId)
  return {
    label: t(action.label),
    description: 'description' in action ? t(action.description as string) : undefined,
    hotkey: getHotkeyDisplay(actionId),
  }
}
