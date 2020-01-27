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
import { getAlbumStream, PhotoAlbumsPage, PhotoAlbum } from '../../google';
import AlbumList from './list';

interface Props {
  onPick: (album: PhotoAlbum | undefined) => void;
  pickedAlbum: PhotoAlbum | undefined;
}

interface State {
  page: number;
  albumPages: PhotoAlbumsPage[];
}

export default class AlbumPick extends Component<Props, State> {
  private _albumReader = getAlbumStream().getReader();

  state: State = {
    page: 0,
    albumPages: [],
  };

  constructor(props: Props) {
    super(props);
    this._pullPage();
  }

  private async _pullPage() {
    const { done, value } = await this._albumReader.read();
    if (done) return;

    this.setState(state => ({
      albumPages: [...state.albumPages, value],
    }));
  }

  private _onNext = () => {
    this.setState(state => {
      const nextPage = state.page + 1;
      if (!(nextPage in state.albumPages)) this._pullPage();
      return { page: nextPage };
    });
  };

  private _onPrevious = () => {
    this.setState(state => ({
      page: state.page - 1,
    }));
  };

  private _onUnpick = () => {
    this.props.onPick(undefined);
  };

  componentWillUnmount() {
    this._albumReader.cancel();
  }

  render({ onPick, pickedAlbum }: Props, { albumPages, page }: State) {
    const albumPage = albumPages[page];

    return (
      <div>
        {pickedAlbum ? (
          <p>
            Picked "{pickedAlbum.title}".{' '}
            <button onClick={this._onUnpick}>Change</button>
          </p>
        ) : !albumPage ? (
          <div>Loading</div>
        ) : (
          <AlbumList
            albumPage={albumPage}
            hasPreviousPage={page !== 0}
            onNext={this._onNext}
            onPrevious={this._onPrevious}
            onPick={onPick}
          />
        )}
      </div>
    );
  }
}
