/**
 * Info_StatusBadge
 *
 * Status badge for permission states using Info_Badge.
 */

import * as React from 'react'
import { Info_Badge, type BadgeColor } from './Info_Badge'
import { useTranslation } from '@/contexts/I18nContext'

type PermissionStatus = 'allowed' | 'blocked' | 'requires-permission'

const statusConfig: Record<PermissionStatus, { key: string; color: BadgeColor }> = {
  allowed: { key: 'Allowed', color: 'success' },
  blocked: { key: 'Blocked', color: 'destructive' },
  'requires-permission': { key: 'Ask', color: 'warning' },
}

export interface Info_StatusBadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Status type */
  status?: PermissionStatus | null
  /** Override the default label */
  label?: string
}

export function Info_StatusBadge({
  status,
  label,
  ...props
}: Info_StatusBadgeProps) {
  const { t } = useTranslation('components/info/Info_StatusBadge')

  const key: PermissionStatus = status ?? 'allowed'
  const config: { key: string; color: BadgeColor } = statusConfig[key]
  const displayLabel = label ?? t(config.key)

  return (
    <Info_Badge {...props} color={config.color}>
      {displayLabel}
    </Info_Badge>
  )
}
