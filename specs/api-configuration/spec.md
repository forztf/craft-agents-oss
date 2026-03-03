# API Configuration Module Specification

## Document Information

| Property | Value |
|----------|-------|
| Module Name | API Configuration |
| Version | 2.0 |
| Created | 2026-03-03 |
| Spec Format | OpenSpec |

---

## ADDED Requirements

### Requirement: LLM Provider Support
The system SHALL support the following LLM provider types:
- `anthropic` - Anthropic official API (api.anthropic.com)
- `anthropic_compat` - Anthropic format compatible endpoints (OpenRouter, etc.)
- `openai` - OpenAI official API (via Codex)
- `openai_compat` - OpenAI format compatible endpoints (Ollama, OpenRouter, etc.)
- `bedrock` - AWS Bedrock (Claude models)
- `vertex` - Google Vertex AI (Claude models)

> 来源: `packages/shared/src/config/llm-connections.ts`

### Requirement: Provider Model Support
The system SHALL use Anthropic/Claude models for `anthropic`, `bedrock`, and `vertex` providers.
The system SHALL use OpenAI/Codex models for `openai` provider.
The system SHALL require `*_compat` providers to provide an explicit model list.

> 来源: `packages/shared/src/config/llm-connections.ts`

### Requirement: Supported Auth Types
The system SHALL support the following authentication mechanisms:
- `api_key` - Single API key field, fixed known endpoint
- `api_key_with_endpoint` - API key + custom endpoint URL field
- `oauth` - Browser OAuth flow
- `iam_credentials` - AWS style (Access Key + Secret Key + Region)
- `bearer_token` - Bearer token (differs from API key header)
- `service_account_file` - GCP style JSON file upload
- `environment` - Auto-detect from environment variables
- `none` - No authentication required (local models like Ollama)

> 来源: `packages/shared/src/config/llm-connections.ts`

### Requirement: Provider-Auth Combination Validation
The system SHALL only allow valid provider-auth combinations:
- `anthropic` + `api_key` / `oauth`
- `anthropic_compat` + `api_key_with_endpoint`
- `openai` + `api_key` / `oauth`
- `openai_compat` + `api_key_with_endpoint` / `none`
- `bedrock` + `bearer_token` / `iam_credentials` / `environment`
- `vertex` + `oauth` / `service_account_file` / `environment`

> 来源: `packages/shared/src/config/llm-connections.ts`

### Requirement: API Setup Options Display
The system SHALL provide the following options for Anthropic provider:
- Claude Pro/Max (OAuth)
- Anthropic API Key
The system SHALL provide the following options for OpenAI provider:
- Codex·ChatGPT Plus/Pro (OAuth)
- Codex·OpenAI API Key

#### Scenario: User selects Claude Pro/Max
- **WHEN** User clicks "Claude Pro/Max" option in APISetupStep
- **THEN** System SHALL set `apiSetupMethod` to `claude_oauth`
- **THEN** System SHALL display "Connect Claude Account" interface in the next step

> 来源: `apps/electron/src/renderer/components/onboarding/APISetupStep.tsx`

#### Scenario: User selects ChatGPT Plus/Pro
- **WHEN** User clicks "Codex·ChatGPT Plus/Pro" option in APISetupStep
- **THEN** System SHALL set `apiSetupMethod` to `chatgpt_oauth`
- **THEN** System SHALL display "Connect ChatGPT" interface in the next step

> 来源: `apps/electron/src/renderer/components/onboarding/APISetupStep.tsx`

#### Scenario: User selects Anthropic API Key
- **WHEN** User clicks "Anthropic API Key" option in APISetupStep
- **THEN** System SHALL set `apiSetupMethod` to `anthropic_api_key`
- **THEN** System SHALL display ApiKeyInput component in the next step with providerType set to `anthropic`

> 来源: `apps/electron/src/renderer/components/onboarding/APISetupStep.tsx`

#### Scenario: User selects OpenAI API Key
- **WHEN** User clicks "Codex·OpenAI API Key" option in APISetupStep
- **THEN** System SHALL set `apiSetupMethod` to `openai_api_key`
- **THEN** System SHALL display ApiKeyInput component in the next step with providerType set to `openai`

> 来源: `apps/electron/src/renderer/components/onboarding/APISetupStep.tsx`

### Requirement: ApiKey Input Form
The system SHALL provide a password-type API key input field.
The system SHALL provide a show/hide toggle button (eye icon).
The system SHALL display key format hints based on provider type:
- OpenAI: `sk-...`
- Anthropic: `sk-ant-...`
The system SHALL autofocus the input field when it renders.

> 来源: `apps/electron/src/renderer/components/apisetup/ApiKeyInput.tsx`

### Requirement: Endpoint Preset Selection
The system SHALL render the following presets for Anthropic provider:
- Anthropic (`https://api.anthropic.com`)
- OpenRouter (`https://openrouter.ai/api`)
- Vercel AI Gateway (`https://ai-gateway.vercel.sh`)
- Ollama (`http://localhost:11434`)
- Custom (自定义)
The system SHALL render the following presets for OpenAI provider:
- OpenAI (empty URL, uses default endpoint)
- OpenRouter (`https://openrouter.ai/api/v1`)
- Vercel AI Gateway (`https://ai-gateway.vercel.sh/v1`)
- Custom (自定义)
The system SHALL hide the endpoint URL input field for default provider presets (Anthropic/OpenAI).
The system SHALL display the endpoint URL input field for non-default presets.

> 来源: `apps/electron/src/renderer/components/apisetup/ApiKeyInput.tsx`

### Requirement: Preset Selection Interaction
The system SHALL when user selects a preset from dropdown:
- Update `activePreset` state
- Set corresponding endpoint URL
- Ollama preset: pre-fill model `qwen3-coder`
- OpenRouter/Vercel presets: pre-fill compatible model list
- Custom preset: clear URL and pre-fill compatible model list

#### Scenario: User selects preset
- **WHEN** User selects "OpenRouter" from endpoint preset dropdown
- **THEN** System SHALL update URL to `https://openrouter.ai/api`
- **THEN** System SHALL display endpoint URL input field
- **THEN** System SHALL pre-fill compatible Anthropic model list

> 来源: `apps/electron/src/renderer/components/apisetup/ApiKeyInput.tsx`

### Requirement: Custom Endpoint Input
The system SHALL provide a text input field for endpoint URL.
The system SHALL display placeholder: `https://your-api-endpoint.com`.
The system SHALL automatically match preset based on entered URL.

#### Scenario: User inputs known preset URL
- **WHEN** User enters `https://openrouter.ai/api` in endpoint URL input
- **THEN** System SHALL automatically update selected preset in dropdown to "OpenRouter"
- **THEN** System SHALL keep URL input field visible

> 来源: `apps/electron/src/renderer/components/apisetup/ApiKeyInput.tsx`

### Requirement: Default Model Configuration
The system SHALL display model input field for non-default provider presets.
The system SHALL mark model field as optional or required:
- Empty endpoint URL + default preset: optional (uses provider model routing)
- Non-empty endpoint URL: required
The system SHALL support comma-separated model list input.
The system SHALL trim whitespace from comma-separated values during parsing.

> 来源: `apps/electron/src/renderer/components/apisetup/ApiKeyInput.tsx`

### Requirement: Model Validation
The system SHALL validate on submit:
- If endpoint is valid and not default preset, model list cannot be empty
- When model field is empty, display error: "Default model is required for compatible endpoints."

> 来源: `apps/electron/src/renderer/components/apisetup/ApiKeyInput.tsx`

### Requirement: Model List Parsing
The system SHALL parse comma-separated model string to array of strings.
The system SHALL filter empty string items.
The system SHALL use first model as default model (`connectionDefaultModel`).
The system SHALL use last model for summarization (`getSummarizationModel`).

> 来源: `packages/shared/src/config/llm-connections.ts`

### Requirement: Preset-Specific Help Text
The system SHALL display for OpenRouter:
- "Required for OpenRouter-compatible endpoints."
- Model format: `provider/model-name`
- Link to https://openrouter.ai/models
The system SHALL display for Vercel AI Gateway:
- "Required for Vercel AI Gateway endpoints."
- Model format: `provider/model-name`
- Link to https://vercel.com/docs/ai-gateway
The system SHALL display for Ollama:
- "Use any model pulled via `ollama pull`. No API key required."
The system SHALL display for Custom:
- "Required for custom endpoints. Use the provider-specific model ID."

> 来源: `apps/electron/src/renderer/components/apisetup/ApiKeyInput.tsx`

#### Scenario: Model validation fails
- **WHEN** User submits form and endpoint requires model but model field is empty
- **THEN** System SHALL display red error border on model field
- **THEN** System SHALL display error message: "Default model is required for compatible endpoints."
- **THEN** System SHALL prevent form submission

> 来源: `apps/electron/src/renderer/components/apisetup/ApiKeyInput.tsx`

### Requirement: Claude OAuth Two-Step Flow
The system SHALL support the following steps:
1. Click "Sign in with Claude" button to open browser
2. Browser completes authorization, user copies authorization code
3. Enter authorization code in app and complete connection

#### Scenario: Step 1 - Open authorization page
- **WHEN** User clicks "Sign in with Claude" button
- **THEN** System SHALL call `window.electronAPI.startClaudeOAuth()`
- **THEN** System SHALL open Anthropic OAuth authorization page in browser
- **THEN** System SHALL set state to `isWaitingForCode: true`
- **THEN** System SHALL display "Enter Authorization Code" interface
- **THEN** System SHALL display input field: "Paste your authorization code here"

> 来源: `apps/electron/src/renderer/components/onboarding/CredentialsStep.tsx`

#### Scenario: Step 2 - Enter authorization code
- **WHEN** User pastes authorization code in authorization code input and submits
- **THEN** System SHALL call `window.electronAPI.exchangeClaudeCode(code, connectionSlug)`
- **THEN** System SHALL verify authorization code and exchange for access token
- **THEN** System SHALL save token to credential storage
- **THEN** System SHALL set state to `success`
- **THEN** System SHALL navigate to completion step

> 来源: `apps/electron/src/renderer/components/onboarding/CredentialsStep.tsx`

#### Scenario: Cancel OAuth flow
- **WHEN** User clicks "Cancel" while waiting for authorization code
- **THEN** System SHALL call `window.electronAPI.clearClaudeOAuthState()`
- **THEN** System SHALL set `isWaitingForCode: false`
- **THEN** System SHALL return to previous step

> 来源: `apps/electron/src/renderer/components/onboarding/CredentialsStep.tsx`

### Requirement: ChatGPT OAuth Native Flow
The system SHALL support browser native OAuth flow.
The system SHALL automatically capture callback tokens.
The system SHALL not require user to manually enter authorization code.

#### Scenario: ChatGPT OAuth flow
- **WHEN** User clicks "Sign in with ChatGPT" button
- **THEN** System SHALL call `window.electronAPI.startChatGptOAuth(connectionSlug)`
- **THEN** System SHALL open OpenAI OAuth authorization page in browser
- **WHEN** Authorization successful callback received
- **THEN** System SHALL automatically capture tokens
- **THEN** System SHALL save to credential storage
- **THEN** System SHALL complete connection and display success status

> 来源: `apps/electron/src/renderer/components/onboarding/CredentialsStep.tsx`

### Requirement: Connection Status Types
The system SHALL maintain the following statuses:
- `idle` - Initial/idle state
- `validating` - Validating
- `success` - Validation/connection successful
- `error` - Validation/connection failed

> 来源: `apps/electron/src/renderer/components/apisetup/ApiKeyInput.tsx`

### Requirement: Status UI Feedback
The system SHALL when in `validating` status:
- Disable all input controls
- Display loading indicator
- Disable submit button
The system SHALL when in `success` status:
- Display success message
- Navigate to next step (Onboarding) or save configuration (Settings)
The system SHALL when in `error` status:
- Display error message
- Keep input controls editable
- Support multi-language error messages

> 来源: `apps/electron/src/renderer/components/onboarding/CredentialsStep.tsx`

### Requirement: Anthropic Connection Validation
The system SHALL call `window.electronAPI.testApiConnection(apiKey, baseUrl, models)` for validation.
The system SHALL validate:
- API key validity
- Endpoint accessibility
- Model availability
- Tool support

> 来源: `apps/electron/src/renderer/components/apisetup/ApiKeyInput.tsx`

### Requirement: OpenAI Connection Validation
The system SHALL call `window.electronAPI.testOpenAiConnection(apiKey, baseUrl, models)` for validation.
The system SHALL validate:
- API key validity
- `/v1/models` endpoint response
- Model list

> 来源: `apps/electron/src/renderer/components/apisetup/ApiKeyInput.tsx`

### Requirement: Validation Error Handling
The system SHALL when validation fails:
- Set status to `error`
- Display error message returned from server
- Keep input controls editable

> 来源: `apps/electron/src/renderer/components/onboarding/CredentialsStep.tsx`

#### Scenario: API key is invalid
- **WHEN** User submits invalid API key
- **THEN** System SHALL display error message
- **THEN** System SHALL allow user to re-enter

> 来源: `apps/electron/src/renderer/components/onboarding/CredentialsStep.tsx`

### Requirement: Form Data Collection
The system SHALL collect the following on submit:
- `apiKey` - trimmed string
- `baseUrl` - optional endpoint URL (omitted for default preset)
- `connectionDefaultModel` - first model
- `models` - model string array

> 来源: `apps/electron/src/renderer/components/apisetup/ApiKeyInput.tsx`

### Requirement: Empty Endpoint Handling
The system SHALL when endpoint URL is empty and is default preset:
- Not pass `baseUrl` (uses provider default)
- Set `isDefault: true`

> 来源: `apps/electron/src/renderer/components/apisetup/ApiKeyInput.tsx`

### Requirement: Model List Submission
The system SHALL when model list is non-empty:
- Pass complete `models` array
- Pass first model as `connectionDefaultModel`

> 来源: `apps/electron/src/renderer/components/apisetup/ApiKeyInput.tsx`

#### Scenario: Submit complete configuration
- **WHEN** User fills in Anthropic API Key + OpenRouter URL + model list
- **THEN** System SHALL call `onSubmit({ apiKey, baseUrl, connectionDefaultModel, models })`
- **THEN** Parent component SHALL execute validation and save configuration

> 来源: `apps/electron/src/renderer/components/apisetup/ApiKeyInput.tsx`

### Requirement: LlmConnection Interface
The system SHALL use the following connection structure:

```typescript
interface LlmConnection {
  slug: string;                    // URL-safe identifier
  name: string;                    // Display name
  providerType: LlmProviderType;    // Provider type
  baseUrl?: string;                // Custom base URL
  authType: LlmAuthType;           // Authentication mechanism
  models?: Array<ModelDefinition | string>;  // Model list
  defaultModel?: string;           // Default model ID
  codexPath?: string;              // Codex binary path (OpenAI)
  awsRegion?: string;              // AWS region (Bedrock)
  gcpProjectId?: string;           // GCP project ID (Vertex)
  gcpRegion?: string;              // GCP region (Vertex)
  createdAt: number;               // Creation timestamp
  lastUsedAt?: number;             // Last used timestamp
}
```

> 来源: `packages/shared/src/config/llm-connections.ts`

### Requirement: LlmConnectionWithStatus Extension
The system SHALL support connection with authentication status:

```typescript
interface LlmConnectionWithStatus extends LlmConnection {
  isAuthenticated: boolean;        // Whether authenticated
  authError?: string;              // Authentication error message
  isDefault?: boolean;             // Whether global default
}
```

> 来源: `packages/shared/src/config/llm-connections.ts`

### Requirement: Connection Selection Priority
The system SHALL use the following priority to resolve session connection:
1. Session explicit connection (`session.llmConnection`)
2. Workspace default override (`workspace.defaultLlmConnection`)
3. Global default (connection's `isDefault` flag)
4. First available connection

> 来源: `packages/shared/src/config/llm-connections.ts`

### Requirement: Invalid Connection Detection
The system SHALL when session's explicit connection is deleted:
- Mark session as "connection unavailable"
- Display prompt message

> 来源: `packages/shared/src/config/llm-connections.ts`

### Requirement: Credential Key Format
The system SHALL use format: `llm::{slug}::{credentialType}`.
The system SHALL support the following credential types:
- `api_key` - API key or bearer token
- `oauth_token` - OAuth tokens (access, refresh, expiry)

> 来源: `packages/shared/src/config/llm-connections.ts`

### Requirement: Auth Type to Credential Storage Mapping
The system SHALL map as follows:
- `api_key` / `api_key_with_endpoint` / `bearer_token` → `api_key`
- `oauth` → `oauth_token`
- `iam_credentials` → `iam_credentials`
- `service_account_file` → `service_account`
- `environment` / `none` → `null`

> 来源: `packages/shared/src/config/llm-connections.ts`

### Requirement: Multi-Language Support
The system SHALL support multi-language for all user-visible text.
The system SHALL use translation key namespaces:
- `components/apisetup/ApiKeyInput`
- `components/apisetup/OAuthConnect`
- `components/onboarding/APISetupStep`
- `components/onboarding/CredentialsStep`

> 来源: `apps/electron/src/renderer/components/apisetup/ApiKeyInput.tsx`

---

## MODIFIED Requirements

No modified requirements.

---

## REMOVED Requirements

No removed requirements.
