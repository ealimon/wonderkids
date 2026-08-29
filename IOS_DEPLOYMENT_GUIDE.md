# App Store Connect & Cloud Build Guide

This repository is configured to build the native iOS app and upload it directly to **App Store Connect** / **TestFlight** using GitHub Actions (Cloud macOS Runners).

## Required GitHub Repository Secrets

To enable automatic cloud builds, add these 3 secrets to your GitHub repository (**Settings > Secrets and variables > Actions > New repository secret**):

1. `APP_STORE_CONNECT_KEY_ID`:
   - The Key ID from your App Store Connect API Key (e.g. `2X9R4ABCD2`).

2. `APP_STORE_CONNECT_ISSUER_ID`:
   - The Issuer ID UUID found at the top of the **Keys / Integrations** page in App Store Connect (e.g. `57246542-96fe-1a63-e053-0824d011072a`).

3. `APP_STORE_CONNECT_KEY_P8`:
   - The complete text contents of the downloaded `AuthKey_XXXXXX.p8` private key file (open the file in Notepad / TextEdit and copy all text including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`).

---

## App Store Details Summary
- **App Name**: Storybook Education (WonderKids Adventure Portal)
- **Bundle ID**: `com.limon.storybookeducation`
- **Platforms**: iOS (iPadOS / iPhone)
- **Pricing & Kids Category**: Made for Kids (Ages 5 and under / 6–8)
