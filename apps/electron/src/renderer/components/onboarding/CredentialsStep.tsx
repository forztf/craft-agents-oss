/**
 * CredentialsStep - Onboarding step wrapper for API key or OAuth flow
 *
 * Thin wrapper that composes ApiKeyInput or OAuthConnect controls
 * with StepFormLayout for the onboarding wizard context.
 */

import { ExternalLink } from "lucide-react"
import type { ApiSetupMethod } from "./APISetupStep"
import { StepFormLayout, BackButton, ContinueButton } from "./primitives"
import {
  ApiKeyInput,
  type ApiKeyStatus,
  type ApiKeySubmitData,
  OAuthConnect,
  type OAuthStatus,
} from "../apisetup"
import { useTranslation } from "@/contexts/I18nContext"

export type CredentialStatus = ApiKeyStatus | OAuthStatus

interface CredentialsStepProps {
  apiSetupMethod: ApiSetupMethod
  status: CredentialStatus
  errorMessage?: string
  onSubmit: (data: ApiKeySubmitData) => void
  onStartOAuth?: (methodOverride?: ApiSetupMethod) => void
  onBack: () => void
  // Two-step OAuth flow
  isWaitingForCode?: boolean
  onSubmitAuthCode?: (code: string) => void
  onCancelOAuth?: () => void
}

export function CredentialsStep({
  apiSetupMethod,
  status,
  errorMessage,
  onSubmit,
  onStartOAuth,
  onBack,
  isWaitingForCode,
  onSubmitAuthCode,
  onCancelOAuth,
}: CredentialsStepProps) {
  const { t } = useTranslation('components/onboarding/CredentialsStep')
  const { t: tPrimitives } = useTranslation('components/onboarding/primitives')

  const isClaudeOAuth = apiSetupMethod === 'claude_oauth'
  const isChatGptOAuth = apiSetupMethod === 'chatgpt_oauth'
  const isAnthropicApiKey = apiSetupMethod === 'anthropic_api_key'
  const isOpenAiApiKey = apiSetupMethod === 'openai_api_key'
  const isApiKey = isAnthropicApiKey || isOpenAiApiKey

  // --- ChatGPT OAuth flow (native browser OAuth) ---
  if (isChatGptOAuth) {
    return (
      <StepFormLayout
        title={t('Connect ChatGPT')}
        description={t('Use your ChatGPT Plus or Pro subscription to power Codex.')}
        actions={
          <>
            <BackButton onClick={onBack} disabled={status === 'validating'} />
            <ContinueButton
              onClick={() => onStartOAuth?.()}
              className="gap-2"
              loading={status === 'validating'}
              loadingText={t('Connecting...')}
            >
              <ExternalLink className="size-4" />
              {t('Sign in with ChatGPT')}
            </ContinueButton>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-xl bg-foreground-2 p-4 text-sm text-muted-foreground">
            <p>{t('Click the button above to sign in with your OpenAI account. A browser window will open for authentication.')}</p>
          </div>
          {status === 'error' && errorMessage && (
            <div className="rounded-lg bg-destructive/10 text-destructive text-sm p-3">
              {errorMessage}
            </div>
          )}
          {status === 'success' && (
            <div className="rounded-lg bg-success/10 text-success text-sm p-3">
              {t('Connected! Your ChatGPT subscription is ready.')}
            </div>
          )}
        </div>
      </StepFormLayout>
    )
  }

  // --- Claude OAuth flow ---
  if (isClaudeOAuth) {
    // Waiting for authorization code entry
    if (isWaitingForCode) {
      return (
        <StepFormLayout
          title={t('Enter Authorization Code')}
          description={t('Copy the code from the browser page and paste it below.')}
          actions={
            <>
              <BackButton onClick={onCancelOAuth} disabled={status === 'validating'}>{t('Cancel')}</BackButton>
              <ContinueButton
                type="submit"
                form="auth-code-form"
                disabled={false}
                loading={status === 'validating'}
                loadingText={t('Connecting...')}
              />
            </>
          }
        >
          <OAuthConnect
            status={status as OAuthStatus}
            errorMessage={errorMessage}
            isWaitingForCode={true}
            onStartOAuth={onStartOAuth!}
            onSubmitAuthCode={onSubmitAuthCode}
            onCancelOAuth={onCancelOAuth}
          />
        </StepFormLayout>
      )
    }

    return (
      <StepFormLayout
        title={t('Connect Claude Account')}
        description={t('Use your Claude subscription to power multi-agent workflows.')}
        actions={
          <>
            <BackButton onClick={onBack} disabled={status === 'validating'} />
            <ContinueButton
              onClick={() => onStartOAuth?.()}
              className="gap-2"
              loading={status === 'validating'}
              loadingText={t('Connecting...')}
            >
              <ExternalLink className="size-4" />
              {t('Sign in with Claude')}
            </ContinueButton>
          </>
        }
      >
        <OAuthConnect
          status={status as OAuthStatus}
          errorMessage={errorMessage}
          isWaitingForCode={false}
          onStartOAuth={onStartOAuth!}
          onSubmitAuthCode={onSubmitAuthCode}
          onCancelOAuth={onCancelOAuth}
        />
      </StepFormLayout>
    )
  }

  // --- API Key flow ---
  // Determine provider type and description based on selected method
  const providerType = isOpenAiApiKey ? 'openai' : 'anthropic'
  const apiKeyDescription = isOpenAiApiKey
    ? t('Enter your OpenAI API key. Optionally configure OpenRouter or Vercel AI Gateway.')
    : t('Enter your API key. Optionally configure a custom endpoint for OpenRouter, Ollama, or compatible APIs.')

  return (
    <StepFormLayout
      title={t('API Configuration')}
      description={apiKeyDescription}
      actions={
        <>
          <BackButton onClick={onBack} disabled={status === 'validating'} />
          <ContinueButton
            type="submit"
            form="api-key-form"
            disabled={false}
            loading={status === 'validating'}
            loadingText={tPrimitives('Loading...')}
          />
        </>
      }
    >
      <ApiKeyInput
        status={status as ApiKeyStatus}
        errorMessage={errorMessage}
        onSubmit={onSubmit}
        providerType={providerType}
      />
    </StepFormLayout>
  )
}