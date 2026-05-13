# Login Methods — Implementation Plan

Adds **Sign in with Google** to the existing email/password auth. Sign in with
Apple is deferred until pre-launch (requires the $99/year Apple Developer
Program and is App Store-mandatory once Google sign-in ships on iOS).

## Locked decisions

1. **Account linking** — auto-link to an existing local account when the social
   provider says `email_verified === true`.
2. **Schema** — single-table approach: add `authProvider` and `providerSub`
   columns directly on `users`. (One sign-in method per user. Migrate to a
   `user_identities` table later if multi-method linking is ever needed.)
3. **Platforms** — mobile only. No web sign-in.
4. **Build tooling** — EAS dev build. Required because the native Google
   sign-in SDK ships native code that Expo Go does not include.
5. **Identifiers**
   - iOS bundle ID: `com.moovier.app`
   - Android package: `com.moovier.app`
   - Display name: `Moovier`
   - Domain: `moovier.com` (owned by user; not required for sign-in but
     conventional for the reverse-DNS bundle ID).
6. **Apple sign-in** — out of scope for this round. Add before App Store
   submission.
7. **Name fallback** — when the provider does not return a name, use the email
   local-part (`me@x.com` → `me`) as `firstName`, empty string as `lastName`.

## Architectural notes

- Backend issues the same JWT shape (`createAccessToken`) for social and local
  logins. Mobile session handling, sliding refresh, and `Bearer` header
  plumbing in `services/backend.ts` need no changes.
- Mobile asks Google's SDK for an **ID token**, ships it to the backend, and
  the backend verifies it against Google's public keys. The mobile app never
  receives any of our user data directly from Google — the backend is the
  single source of truth.
- The backend verifies Google's `aud` claim against an allowlist
  (`GOOGLE_OAUTH_CLIENT_IDS`) of our iOS, Android, and Web client IDs. This is
  what prevents a token issued to some other app from being replayed against
  us.

---

## Phase 1 — Backend ✅ DONE

Independent of the mobile work; testable with curl using a manually minted
Google ID token.

### Database ✅

New migration `migrations/20260505000000-add-social-auth-to-users.js`:

- `ALTER users MODIFY password VARCHAR(255) NULL`
- `ALTER users MODIFY firstName VARCHAR(255) NULL`
- `ALTER users MODIFY lastName VARCHAR(255) NULL`
- `ADD COLUMN authProvider ENUM('local','google','apple') NOT NULL DEFAULT 'local'`
- `ADD COLUMN providerSub VARCHAR(255) NULL`
- `ADD UNIQUE INDEX users_provider_sub (authProvider, providerSub)` — MySQL's
  unique indexes ignore NULL, so existing local rows are unaffected.

The `apple` value is included in the enum now so we don't need another
migration when Apple sign-in is added later.

### Model + types ✅

- `models/User.ts` — add `authProvider` and `providerSub`. Mark `password`,
  `firstName`, `lastName` as nullable in both Sequelize options and the
  `declare` field types.
- `types/models.ts` — update `UserAttributes` to reflect the nullability and
  new fields. Update `UserCreationAttributes` so social-only creates can omit
  `password`.

### Environment ✅

`utils/validateEnv.ts` — add `GOOGLE_OAUTH_CLIENT_IDS` to the required list.
Document the format: comma-separated list of OAuth client IDs (iOS, Android,
Web). The Web client ID is the one mobile sets as `serverClientId`, so it must
be in the allowlist.

### Controller ✅

`controllers/AuthController.ts` — add `auth_google(req, res, next)`:

1. Pull `idToken` from body.
2. Verify using `google-auth-library`:
   ```
   const ticket = await oauthClient.verifyIdToken({
     idToken,
     audience: process.env.GOOGLE_OAUTH_CLIENT_IDS!.split(','),
   });
   const payload = ticket.getPayload();
   ```
3. Reject (`401`) if `payload.email_verified !== true`. Auto-linking is only
   safe with verified emails.
4. Look up by `(authProvider: 'google', providerSub: payload.sub)`. If found,
   issue token and return.
5. Else look up by `email`. If found and `authProvider === 'local'`, stamp
   `authProvider = 'google'` and `providerSub = payload.sub` and save. If found
   and `authProvider === 'google'` but with a different `sub`, reject — should
   not happen in practice but indicates an account inconsistency.
6. Else create:
   ```
   {
     email: payload.email,
     firstName: payload.given_name || payload.email.split('@')[0],
     lastName:  payload.family_name || '',
     authProvider: 'google',
     providerSub:  payload.sub,
     password: null,
   }
   ```
7. `createAccessToken(user)`, set the `access-token` cookie identically to
   `/login`, return `{ accessToken }`.

### Validator + route ✅

- `middlewares/validators.ts` — `googleAuthValidator`:
  `body('idToken').isString().notEmpty()`. Export it.
- `routes/Auth.ts`:
  ```
  router.post('/auth/google', loginLimiter, googleAuthValidator, AuthController.auth_google);
  ```
  Reusing `loginLimiter` is intentional — same risk profile as `/login`.

### Dependency ✅

`package.json` — add `google-auth-library` (Google's official Node verifier;
handles JWKS rotation and signature checks).

### Swagger ✅

Regenerate `swagger-output.json` via `npm run swagger`. Add the standard
`#swagger.tags = ['Auth']` block above the new route.

### Manual test ✅

```
curl -X POST http://localhost:5001/auth/google \
  -H 'Content-Type: application/json' \
  -d '{"idToken":"<token from Google OAuth Playground or test mobile build>"}'
```

Expected: `200 { accessToken: '...' }` and the cookie set in the response.

---

## Phase 2 — Mobile prerequisites ✅ DONE

One-time setup. Blocks Phase 3.

### Google Cloud Console ✅

1. Create a new project (e.g. `moovier`).
2. APIs & Services → OAuth consent screen → External, fill in app name
   (`Moovier`), support email, developer contact.
3. Credentials → Create OAuth client ID, three times:
   - **iOS** — bundle ID `com.moovier.app`. Save the iOS client ID and the
     reversed client ID (URL scheme).
   - **Android** — package `com.moovier.app` + SHA-1 fingerprint. Get the
     SHA-1 from `eas credentials` after the first dev build, or from
     `~/.android/debug.keystore` for local dev.
   - **Web** — no platform-specific config needed; this is the
     `serverClientId` mobile passes to the SDK and what the backend verifies
     `aud` against.
4. Stash all three client IDs. The backend env gets all three
   comma-separated; the mobile env gets only the Web one.

### `app.json` ✅

```jsonc
{
  "expo": {
    "name": "Moovier",
    "slug": "reviews", // unchanged for now; can rename later
    "scheme": "moovier", // optional rename from "reviews"
    "ios": {
      "bundleIdentifier": "com.moovier.app",
      "supportsTablet": true,
      "config": { "usesNonExemptEncryption": false },
    },
    "android": {
      "package": "com.moovier.app",
      "adaptiveIcon": {
        /* unchanged */
      },
    },
    "plugins": [
      "expo-router",
      "expo-secure-store",
      "expo-font",
      "expo-web-browser",
      ["@react-native-google-signin/google-signin", { "iosUrlScheme": "<reversed iOS client ID>" }],
    ],
  },
}
```

### Dependency ✅

```
npx expo install @react-native-google-signin/google-signin
```

### EAS dev build ✅ (iOS as Simulator build; Android as device build)

1. `npm i -g eas-cli` (if not installed) and `eas login`.
2. `eas init` to associate the project.
3. `eas build --profile development --platform ios` and `--platform android`.
4. Install the resulting `.ipa` / `.apk` on the dev device. From here on,
   `expo start` opens it via the dev client instead of Expo Go.
5. Run `eas credentials` once Android is built to grab the SHA-1, then update
   the Android OAuth client in Google Cloud Console with that fingerprint.

> **Reminder — Android SHA-1.** Right after the first EAS Android build
> completes, run `eas credentials` → grab the SHA1 fingerprint → paste it into
> the Android OAuth client in Google Cloud Console (APIs & Services →
> Credentials → your Android client → "SHA-1 certificate fingerprint"). Android
> sign-in will not work until this is done.

> **iOS Simulator vs. device.** The current `development` profile in `eas.json`
> builds for iOS Simulator (`"simulator": true`) because the Apple Developer
> Program ($99/year) is not yet purchased. A `development-device` profile is
> reserved for physical-device builds once the program is active. Google
> sign-in works fine in the simulator, so this is not blocking Phase 3.

---

## Phase 3 — Mobile integration ✅ DONE

### API client ✅

`apis/auth.ts` — add:

```ts
export const googleSignIn = async (idToken: string): Promise<{ accessToken: string }> => {
  return await backend.post('/auth/google', { idToken });
};
```

### Google SDK config ✅

New file `services/googleAuth.ts`:

```ts
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  offlineAccess: false,
});
```

Import it once at the top of `app/_layout.tsx` so it runs at startup.

> **Why `iosClientId` is required.** The Expo plugin's `iosUrlScheme`
> registers the URL callback in `Info.plist`, but the iOS SDK still needs
> the iOS client ID explicitly to know which OAuth client to use at runtime.
> Without it, the SDK throws "GoogleService-Info.plist was not found and
> iosClientId was not provided." On Android no analogous parameter is needed
> — Google Play Services resolves the Android client by looking up
> `(packageName, SHA-1)`.

### Auth context ✅

`contexts/AuthContext.tsx`:

- Add `onGoogleLogin` to `AuthContextProps`.
- Implement (v16 of the SDK returns a discriminated union, use the
  `isSuccessResponse` type guard rather than destructuring `idToken`
  directly — the plan's original snippet was written for v13):
  ```ts
  const googleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (!isSuccessResponse(response)) return; // user cancelled
      const idToken = response.data.idToken;
      if (!idToken) throw new Error('No ID token returned by Google');
      const res = await googleSignInRequest(idToken);
      setAuthState({ accessToken: res.accessToken, isLoggedIn: true });
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.accessToken}`;
      await SecureStore.setItemAsync(ACCESS_TOKEN, res.accessToken);
      router.replace('/home');
    } catch (error) {
      Alert.alert('', getErrorMessage(error));
    }
  };
  ```
- Wire into the provider value as `onGoogleLogin: googleLogin`.
- Also call `GoogleSignin.signOut()` inside `logout()` so the next sign-in
  re-prompts the account chooser.

### UI ✅

`app/(auth)/login.tsx` and `app/(auth)/register.tsx` — add a
"Continue with Google" button below the Continue to Login button, calling
`onGoogleLogin`. Use Google's branding-compliant button (their logo + colors;
the SDK ships a built-in `<GoogleSigninButton />` that satisfies their
guidelines).

### Env ✅

Mobile `.env`:

```
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=<the Web client ID from Google Cloud Console>
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=<the iOS client ID from Google Cloud Console>
```

Backend `.env`:

```
GOOGLE_OAUTH_CLIENT_IDS=<iosClientId>,<androidClientId>,<webClientId>
```

> **Watch out for swapped client IDs.** "Web application" vs "iOS" vs
> "Android" client types are not visually obvious from the client ID string
> itself — verify each one's **Type** in Google Cloud Console → Credentials.
> The wrong assignment surfaces as `DEVELOPER_ERROR (10)` on Android and
> "Custom scheme URIs are not allowed for 'WEB' client type" on iOS.

---

## Phase 4 — Pre-launch (Apple Developer Program + Apple sign-in + iOS device builds)

Deferred until pre-launch. Triggered by the decision to ship on the App Store.
The single $99/year Apple Developer Program purchase unlocks all of the
following.

### Apple Developer Program ($99/year)

Buy at https://developer.apple.com/programs/. Activation takes anywhere from
a few minutes to ~24 hours. Until it's active, none of the below works.

### iOS device builds (currently Simulator-only)

`eas.json` already has a `development-device` profile reserved for this
(see Phase 2). Once the Apple Developer Program is active:

1. Register the dev device's UDID with EAS:
   `eas device:create`
2. Build with the device profile:
   `eas build --profile development-device --platform ios`
3. EAS provisions the certificate + profile automatically and signs the
   `.ipa` for installation on the registered device.
4. Use this profile going forward when testing on a physical iPhone instead
   of the simulator. The `development` (Simulator) profile remains useful
   for fast local iteration.

### Apple sign-in (App Store requirement)

App Store policy: if Google sign-in is offered on iOS, **Sign in with Apple
must be offered too**. This is enforced at App Store review; missing it is
a rejection reason.

Mirror the Google flow:

1. **Apple Developer Portal** — enable the "Sign in with Apple" capability
   on the App ID `com.moovier.app`. For non-iOS targets later, create a
   Service ID.
2. **Backend**
   - Add `apple-signin-auth` (or equivalent) to `package.json`.
   - Add `auth_apple(req, res, next)` in `controllers/AuthController.ts`,
     mirroring `auth_google`: verify the Apple identity token, gate on
     `email_verified`, look up by `(authProvider: 'apple', providerSub)`,
     auto-link if a local account with the same email exists, otherwise
     create. The `apple` enum value is already in the schema (Phase 1),
     so no migration is needed.
   - Add `appleAuthValidator` and `POST /auth/apple` reusing `loginLimiter`.
   - Regenerate swagger.
3. **Mobile**
   - Install `expo-apple-authentication`.
   - Add the `expo-apple-authentication` plugin to `app.json`.
   - Add `services/appleAuth.ts` (analog to `services/googleAuth.ts`).
   - Add `onAppleLogin` to `AuthContext`, mirroring `onGoogleLogin`.
   - Add Apple's branded button on `app/(auth)/login.tsx` and
     `app/(auth)/register.tsx` next to the Google button. iOS-only — gate
     the render on `Platform.OS === 'ios'`.
   - Rebuild the iOS dev client (`expo-apple-authentication` ships native
     code).

### Name handling for Apple

Apple returns the user's name **only on the first sign-in** for a given
Apple ID — subsequent sign-ins omit it. Stash the name on first sign-in,
fall back to the locked email-local-part rule (Phase 1 decision #7) when
absent.

### Test plan additions for Apple

- New user via Apple sign-in → row created with `authProvider='apple'`,
  `providerSub` set, `password=null`.
- Existing local user, same email → auto-linked to `apple`.
- Returning Apple user → no duplicate row.
- Sign in via Apple twice in a row → first time has name, second time does
  not (verify name persists from first sign-in).
- App Store review checklist: Apple button visible alongside Google button
  on iOS; both flows produce a logged-in session.

---

## Test plan

- **Backend unit/integration** ✅
  - ✅ New user via Google sign-in → row created with
    `authProvider='google'`, `providerSub` set, `password=null`.
  - ✅ Existing local user, same email → row updated to `authProvider='google'`,
    `providerSub` stamped; `password` left intact.
  - ✅ Returning Google user → looked up by `(provider, sub)`, no duplicate row.
  - ✅ Token with bad `aud` → `401`.
  - ✅ Token with `email_verified=false` → `401` (covered by validator; not
    exercised live since Gmail accounts default to verified).
- **Mobile end-to-end (on dev build)** ✅ (both iOS Simulator and Android device)
  - ✅ Fresh install → tap Google button → granted → lands on `/home`.
  - ✅ Kill and relaunch → still logged in (token persisted in SecureStore).
  - ✅ Logout → returns to login screen, Google session cleared
    (`GoogleSignin.signOut()` in `logout()`).
  - ✅ Sign in via Google with the same email as a previously password-registered
    account → lands on the same account, prior reviews visible.

## Rollout order

1. ✅ Phase 1 backend (deploy + run migration).
2. ✅ Phase 2 prerequisites (Google Cloud Console + EAS dev build).
3. ✅ Phase 3 mobile integration.
4. ☐ Phase 4 pre-launch: Apple Developer Program + iOS device builds
   (`development-device` profile) + Apple sign-in. All gated on the single
   $99/year purchase.
