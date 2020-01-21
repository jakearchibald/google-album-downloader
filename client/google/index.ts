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
import { getAccessToken } from './login';

interface AuthFetchOptions {
  forceReauth?: boolean;
}

async function authFetch(
  url: string,
  init?: RequestInit,
  { forceReauth = false }: AuthFetchOptions = {},
): Promise<any> {
  const accessToken = await getAccessToken({ forceReauth });
  const fetchInit = {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: 'Bearer ' + accessToken,
    },
  };

  const response = await fetch(url, fetchInit);
  const data = await response.json();

  if (data.error) {
    if (data.error.status === 'UNAUTHENTICATED') {
      // Try again but refresh token
      return authFetch(url, fetchInit, { forceReauth: true });
    }
    throw new Error(data.error.message);
  }

  return data;
}

export interface PhotoAlbumsPage {
  albums: PhotoAlbum[];
  hasNextPage: boolean;
}

export interface PhotoAlbum {
  id: string;
  coverBase: string;
  title: string;
}

async function* getAlbums(): AsyncGenerator<PhotoAlbumsPage, void, never> {
  let nextPageToken = '';

  while (true) {
    const url = new URL('https://photoslibrary.googleapis.com/v1/albums');
    url.searchParams.set('pageSize', '50');
    url.searchParams.set('pageToken', nextPageToken);
    const data = await authFetch(url.href);

    yield {
      hasNextPage: !!data.nextPageToken,
      albums: data.albums.map((album: any) => ({
        id: album.id,
        title: album.title,
        coverBase: album.coverPhotoBaseUrl,
      })),
    };

    if (!data.nextPageToken) return;

    nextPageToken = data.nextPageToken;
  }
}

type AsyncGeneratorYieldType<
  T extends AsyncGenerator<any, any, any>
> = T extends AsyncGenerator<infer R, any, any> ? R : never;

function asyncIterToStreamFunc<
  Func extends (...args: any[]) => Gen,
  Gen extends AsyncGenerator<any, unknown, unknown>
>(
  iterFunc: Func,
  strategy?: QueuingStrategy<AsyncGeneratorYieldType<ReturnType<Func>>>,
): (
  ...args: Parameters<Func>
) => ReadableStream<AsyncGeneratorYieldType<ReturnType<Func>>> {
  let iter: Gen;

  return (...args: Parameters<Func>) =>
    new ReadableStream<AsyncGeneratorYieldType<ReturnType<Func>>>(
      {
        async pull(controller) {
          if (!iter) iter = iterFunc(...args);
          const result = await iter.next();
          if (result.done) {
            controller.close();
          } else {
            controller.enqueue(result.value);
          }
        },
        cancel() {
          iter.return(undefined);
        },
      },
      strategy,
    );
}

export const getAlbumStream = asyncIterToStreamFunc(
  getAlbums,
  new CountQueuingStrategy({ highWaterMark: 2 }),
);
