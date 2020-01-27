/**
 * Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const clientID =
  '873414564284-qp6hqgj43g5uea4oac5gs7fkr5ih538e.apps.googleusercontent.com';
const challengeKey = 'last-code-challenge';
const tokenKey = 'token';

interface Token {
  access: string;
  expires: number;
}

let loggedIn: boolean = false;

export function isLoggedIn(): boolean {
  return loggedIn;
}

/**
 * User's login tokens. May have expired
 */
let token: Token | undefined = undefined;

interface LoginEventTarget extends EventTarget {
  addEventListener(
    type: 'loginstatechange',
    listener: (ev: LoginChangeEvent) => any,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: string,
    listener: (ev: Event) => any,
    options?: boolean | AddEventListenerOptions,
  ): void;
  removeEventListener(
    type: 'loginstatechange',
    listener: (ev: LoginChangeEvent) => any,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: string,
    listener: (ev: Event) => any,
    options?: boolean | EventListenerOptions,
  ): void;
}

/**
 * Event target for 'tokenschange' event.
 */
export const target = new EventTarget() as LoginEventTarget;

export class LoginChangeEvent extends Event {
  constructor(public isLoggedIn: boolean) {
    super('loginstatechange');
  }
}

function refreshLocalState() {
  if (!token) return;
  if (Date.now() > token.expires) {
    setToken(undefined);
  }
}

/**
 * Get an access token. If the current token as expired, it'll try to refresh it.
 * If the token refreshing is rejected (user has removed permission) the user is logged out.
 *
 * @param options
 */
export async function getAccessToken(): Promise<string> {
  await refreshLocalState();
  if (!token) throw Error('Not logged in');
  return token.access;
}

/**
 * Creates an 128 char random string for verifying the login flow.
 */
function createCodeVerifier(): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  return Array.from(
    { length: 128 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join('');
}

interface LoginURLOptions {
  silent?: boolean;
}

/**
 * Get URL to navigate the user to.
 */
function getLoginURL({ silent = false }: LoginURLOptions = {}): string {
  const codeChallenge = createCodeVerifier();
  sessionStorage.setItem(challengeKey, codeChallenge);
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', clientID);
  url.searchParams.set('redirect_uri', location.origin + '/login/');
  url.searchParams.set('response_type', 'token');
  url.searchParams.set(
    'scope',
    'https://www.googleapis.com/auth/photoslibrary.readonly openid profile',
  );
  url.searchParams.set('state', codeChallenge);
  if (silent) url.searchParams.set('prompt', 'none');
  return url.href;
}

/**
 * Wait for a login window or iframe to finish redirects.
 */
function awaitLoginWindow(): Promise<void> {
  return new Promise((resolve, reject) => {
    const onmessage = (event: MessageEvent) => {
      if (event.data !== 'login-redirected') return;
      cleanup();
      resolve();
    };

    const cleanup = () => {
      removeEventListener('message', onmessage);
    };

    addEventListener('message', onmessage);
    // TODO: how to detect error here? Load events are not enough.
    // Ugh, I wish we had CORS for logins.
  });
}

/**
 * Read oauth state from window URL.
 *
 * @param win
 */
function getTokenFromOAuthWindow(win: Window): Token | undefined {
  const data = Object.fromEntries([
    ...new URLSearchParams(win.location.hash.slice(1)),
  ]);

  if (!data.state || data.state !== sessionStorage.getItem(challengeKey)) {
    throw Error('Invalid state');
  }

  if (!data.access_token) {
    console.error('login error', data);
    return;
  }

  return {
    access: data.access_token,
    expires: Date.now() + Number(data.expires_in) * 1000,
  };
}

/**
 * Launch a window to perform login.
 */
export async function attemptLogin() {
  const win = open(getLoginURL())!;
  await awaitLoginWindow();
  setToken(getTokenFromOAuthWindow(win));
}

export function logout() {
  setToken(undefined);
}

function updateLocalState() {
  const tokensStr = localStorage[tokenKey];
  token = tokensStr ? JSON.parse(tokensStr) : undefined;

  const newLoggedInState = !!token;
  if (newLoggedInState === loggedIn) return;
  loggedIn = newLoggedInState;
  target.dispatchEvent(new LoginChangeEvent(newLoggedInState));
}

function setToken(token: Token | undefined) {
  localStorage[tokenKey] = token ? JSON.stringify(token) : '';
  updateLocalState();
}

window.addEventListener('storage', event => {
  if (event.storageArea !== localStorage) return;
  if (event.key !== tokenKey) return;
  updateLocalState();
});

updateLocalState();
refreshLocalState();
