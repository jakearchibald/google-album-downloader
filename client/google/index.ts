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
import { getAccessToken, logout } from './login';

async function authFetch(url: string, init?: RequestInit): Promise<any> {
  const accessToken = await getAccessToken();
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
      logout();
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

interface GetAlbumsOptions {
  pageSize?: number;
}

async function* getAlbums({
  pageSize = 10,
}: GetAlbumsOptions = {}): AsyncGenerator<PhotoAlbumsPage, void, never> {
  let nextPageToken = '';

  while (true) {
    const url = new URL('https://photoslibrary.googleapis.com/v1/albums');
    url.searchParams.set('pageSize', pageSize.toString());
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

export interface UserInfo {
  name: string;
  avatarBase: string;
}

export async function getUserInfo(): Promise<UserInfo> {
  const data = await authFetch(
    'https://www.googleapis.com/oauth2/v1/userinfo?alt=json',
  );
  return {
    name: data.name,
    avatarBase: data.picture,
  };
}

interface Photo {
  urlBase: string;
  id: string;
  filename: string;
}

export async function getAllPhotosFromAlbum(albumId: string): Promise<Photo[]> {
  const allPhotos: Photo[] = [];
  let nextPageToken = '';

  while (true) {
    const url = 'https://photoslibrary.googleapis.com/v1/mediaItems:search';
    const body = new URLSearchParams({
      albumId,
      pageSize: '100',
      pageToken: nextPageToken,
    });
    const data = await authFetch(url, { method: 'POST', body });

    for (const item of data.mediaItems) {
      allPhotos.push({
        urlBase: item.baseUrl,
        id: item.id,
        filename: item.filename,
      });
    }

    if (!data.nextPageToken) return allPhotos;

    nextPageToken = data.nextPageToken;
  }
}
