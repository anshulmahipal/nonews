# GitHub Actions

This repo now supports:

- native Android builds in GitHub Actions
- manual OTA publishing to Expo Updates / EAS Update

## Workflows

### Android native build

Workflow file: `.github/workflows/android-native.yml`

What it does:

- installs workspace dependencies with `npm install`
- installs and caches Gradle on the runner before the Android build
- computes `ANDROID_VERSION_CODE` automatically as `1000000 + github.run_number`
- runs Expo Android prebuild inside `apps/expo` unless you skip it manually
- builds a signed release AAB while skipping `lintVital*` tasks on CI
- uploads the built AAB as a GitHub Actions artifact

Triggers:

- push to `main`
- push to `development`
- push to `release/**`
- only when the push touches `apps/expo/**`, `packages/**`, root package files, or the workflow file
- manual `workflow_dispatch`

Manual input:

- `skip_expo_prebuild`: skip Expo prebuild only if `apps/expo/android` is already committed

### Expo OTA update

Workflow file: `.github/workflows/ota-update.yml`

What it does:

- installs workspace dependencies with `npm install`
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

Required for the current Android workflow:

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

Notes:

- The current workflow builds a signed release AAB, so the keystore secrets must be present.
- GitHub Actions auto-increments Android `versionCode` using `1000000 + github.run_number`.
- GitHub Actions installs Gradle before the build and caches it across runs, which reduces wrapper download flakiness on CI.
- The workflow also rewrites the generated Android wrapper timeout to `60000ms` after Expo prebuild, so wrapper-based fallback paths are less likely to fail on slow networks.
- If Google Play already has a higher `versionCode` than this sequence, increase `ANDROID_VERSION_CODE_BASE` in `.github/workflows/android-native.yml`.
- Local builds default to Android `versionCode` `1` unless you set `ANDROID_VERSION_CODE` in your shell before building.
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

1. Push to `main`, `development`, or `release/**` to trigger an Android build automatically.
2. Make sure the push includes a file under `apps/expo/**`, `packages/**`, `package.json`, `package-lock.json`, `.npmrc`, or `.github/workflows/android-native.yml`.
3. Use `workflow_dispatch` when you want to run it manually or skip Expo prebuild.
4. Download the release AAB artifact from the Actions run page.

### OTA updates

1. Open the `Expo OTA Update` workflow in GitHub Actions.
2. Choose `preview` or `production`.
3. Enter a message.
4. Run the workflow.

## Notes

- This setup keeps Expo / EAS for OTA updates only.
- It does not use EAS Build for native Android binaries.
- iOS native CI is not included yet because signing and macOS runner setup need a separate workflow.
