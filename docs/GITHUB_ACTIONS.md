# GitHub Actions

This repo now supports:

- native Android builds in GitHub Actions
- manual OTA publishing to Expo Updates / EAS Update

## Workflows

### Android native build

Workflow file: `.github/workflows/android-native.yml`

What it does:

- installs workspace dependencies with `npm ci`
- runs `expo prebuild` for Android inside `apps/expo`
- builds one of:
  - debug APK
  - release APK
  - release AAB
- uploads the built artifact to the GitHub Actions run

Triggers:

- push to `main`
- push to `development`
- manual `workflow_dispatch`

Manual input:

- `build_profile`: `debug-apk`, `release-apk`, or `release-aab`

### Expo OTA update

Workflow file: `.github/workflows/ota-update.yml`

What it does:

- installs workspace dependencies with `npm ci`
- authenticates with Expo using `EXPO_TOKEN`
- runs `eas update` from `apps/expo`

Triggers:

- manual `workflow_dispatch`

Manual inputs:

- `channel`: `preview` or `production`
- `platform`: `all`, `android`, or `ios`
- `message`: update message shown in Expo

## Required GitHub Secrets

### For Android native build

Required for all builds that need app config values:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Required only for signed release builds:

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

Notes:

- `debug-apk` does not require signing secrets.
- `release-apk` and `release-aab` expect a keystore in base64 form.
- To create the base64 value locally:

```bash
base64 -i your-upload-key.keystore | pbcopy
```

### For OTA publishing

- `EXPO_TOKEN`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Create the Expo token at:

- `https://expo.dev/settings/access-tokens`

## Expected flow

### Native Android

1. Push to `main` or `development` to get a debug APK artifact automatically.
2. Use `workflow_dispatch` when you want a release APK or release AAB.
3. Download the artifact from the Actions run page.

### OTA updates

1. Open the `Expo OTA Update` workflow in GitHub Actions.
2. Choose `preview` or `production`.
3. Enter a message.
4. Run the workflow.

## Notes

- This setup keeps Expo / EAS for OTA updates only.
- It does not use EAS Build for native Android binaries.
- iOS native CI is not included yet because signing and macOS runner setup need a separate workflow.
