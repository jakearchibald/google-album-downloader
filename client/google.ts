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
const tokensKey = 'tokens';

interface Tokens {
  access: string;
  expires: number;
}

/**
 * User's tokens
 */
export let tokens: Tokens | null = null;

function updateLocalTokens() {
  const tokensStr = localStorage[tokensKey];
  if (!tokensStr) {
    tokens = null;
    return;
  }
  tokens = JSON.parse(tokensStr);
}

window.addEventListener('storage', event => {
  if (event.storageArea !== localStorage) return;
  if (event.key !== tokensKey) return;
  updateLocalTokens();
  target.dispatchEvent(new Event('tokenschange'));
});

updateLocalTokens();

/**
 * Event target for 'tokenschange' event.
 */
export const target: TokensEventTarget = new EventTarget();

interface TokensEventTarget extends EventTarget {
  addEventListener(
    type: 'tokenschange',
    listener: (ev: Event) => any,
    options?: boolean | AddEventListenerOptions,
  ): void;
  removeEventListener(
    type: 'tokenschange',
    listener: (ev: Event) => any,
    options?: boolean | EventListenerOptions,
  ): void;
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

export function tokenNeedsRefreshing(): boolean {
  if (!tokens) return false;
  return Date.now() > tokens.expires;
}

/**
 * Get URL to navigate the user to.
 */
export function getLoginURL(): string {
  const codeChallenge = createCodeVerifier();
  sessionStorage.setItem(challengeKey, codeChallenge);
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.search = new URLSearchParams({
    client_id: clientID,
    redirect_uri: location.origin + '/login/',
    response_type: 'token',
    scope: 'https://www.googleapis.com/auth/photoslibrary.readonly',
    state: codeChallenge,
  }).toString();
  return url.href;
}

/**
 * After login, read the hash of the URL to determine login state
 */
export function authUser(): void {
  const data = Object.fromEntries([
    ...new URLSearchParams(location.hash.slice(1)),
  ]);

  if (!data.state || data.state !== sessionStorage.getItem(challengeKey)) {
    throw Error('Invalid state');
  }

  if (!data.access_token) {
    if (!data.error) throw Error('Unknown error');
    const error = new Error(data.error_description);
    error.name = data.error;
    throw error;
  }

  tokens = {
    access: data.access_token,
    expires: Date.now() + Number(data.expires_in),
  };

  target.dispatchEvent(new Event('tokenschange'));
  localStorage[tokensKey] = JSON.stringify(tokens);
}

function apiCall<T extends (...args: any[]) => any>(
  callback: T,
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return async (...args: Parameters<T>) => {
    if (!tokens) throw Error('Not logged in');
    return callback(...args);
  };
}

interface Album {
  id: string;
  coverBase: string;
  title: string;
}

export const getAlbums = apiCall(async () => {
  const albums: Album[] = [];
  let nextPageToken = '';

  while (true) {
    const url = new URL('https://photoslibrary.googleapis.com/v1/albums');
    url.searchParams.set('pageSize', '50');
    url.searchParams.set('pageToken', nextPageToken);
    const response = await fetch(url.href, {
      headers: {
        Authorization: 'Bearer ' + tokens!.access,
      },
    });

    const data = await response.json();

    for (const album of data.albums) {
      albums.push({
        id: album.id,
        title: album.title,
        coverBase: album.coverPhotoBaseUrl,
      });
    }

    if (!data.nextPageToken) {
      return albums;
    }
    nextPageToken = data.nextPageToken;
  }
});
