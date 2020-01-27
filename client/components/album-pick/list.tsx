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
import { h, Component } from 'preact';
import {
  PhotoAlbumsPage,
  PhotoAlbum,
  getAllPhotosFromAlbum,
} from 'client/google';

interface Props {
  hasPreviousPage: boolean;
  albumPage: PhotoAlbumsPage;
  onNext: () => void;
  onPrevious: () => void;
  onPick: (album: PhotoAlbum) => void;
}

interface State {}

export default class AlbumList extends Component<Props, State> {
  private _onNextClick = () => {
    this.props.onNext();
  };

  private _onPreviousClick = () => {
    this.props.onPrevious();
  };

  private _pickListeners = new WeakMap<PhotoAlbum, () => void>();

  private _getPickListener(album: PhotoAlbum): () => void {
    if (!this._pickListeners.has(album)) {
      this._pickListeners.set(album, () => {
        getAllPhotosFromAlbum(album.id).then(data => console.log(data));
        this.props.onPick(album);
      });
    }
    return this._pickListeners.get(album)!;
  }

  render({ albumPage, hasPreviousPage, onPick }: Props) {
    const paging = (
      <div>
        <button disabled={!hasPreviousPage} onClick={this._onPreviousClick}>
          Previous
        </button>
        <button disabled={!albumPage.hasNextPage} onClick={this._onNextClick}>
          Next
        </button>
      </div>
    );

    return (
      <div>
        {paging}
        <ul class="album-list">
          {albumPage.albums.map(album => (
            <li key={album.id}>
              <button
                class="unbutton album-list-button"
                onClick={this._getPickListener(album)}
              >
                <img
                  width="100"
                  height="100"
                  src={album.coverBase + '=w135-h135-c'}
                  srcset={album.coverBase + '=w270-h270-c 2x'}
                  class="album-list-image"
                  alt=""
                ></img>
                <div class="album-list-name">{album.title || 'Unnamed'}</div>
              </button>
            </li>
          ))}
        </ul>
        {paging}
      </div>
    );
  }
}
