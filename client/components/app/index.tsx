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
import { PhotoAlbum } from 'client/google';
import {
  target as loginEventTarget,
  isLoggedIn,
  LoginChangeEvent,
  attemptLogin,
  logout,
} from 'client/google/login';
import AlbumPick from '../album-pick';
import Login from '../login';
import DirPick from '../dir-pick';

interface Props {}

interface State {
  isLoggedIn: boolean;
  album?: PhotoAlbum;
  dirHandle?: FileSystemDirectoryHandle;
}

export default class App extends Component<Props, State> {
  state: State = {
    isLoggedIn: isLoggedIn(),
    album: undefined,
    dirHandle: undefined,
  };

  private _onLoginChange = (event: LoginChangeEvent) => {
    this.setState({
      isLoggedIn: event.isLoggedIn,
    });
  };

  private _onLogoutClick = () => {
    logout();
  };

  private _onAlbumPick = (album: PhotoAlbum | undefined) => {
    this.setState({ album });
  };

  private _onDirPick = (dirHandle: FileSystemDirectoryHandle) => {
    this.setState({ dirHandle });
  };

  componentDidMount() {
    loginEventTarget.addEventListener('loginstatechange', this._onLoginChange);
  }

  componentWillUnmount() {
    loginEventTarget.removeEventListener(
      'loginstatechange',
      this._onLoginChange,
    );
  }

  render({}: Props, { isLoggedIn, album, dirHandle }: State) {
    return (
      <div>
        <h2>Log in</h2>
        <Login isLoggedIn={isLoggedIn} onLogOut={this._onLogoutClick} />
        <h2>Pick album</h2>
        {!isLoggedIn ? (
          <p>Log in first</p>
        ) : (
          <AlbumPick onPick={this._onAlbumPick} pickedAlbum={album} />
        )}
        <h2>Pick a directory</h2>
        <p>Ideally this be exclusively for photos from this album.</p>
        <DirPick dirHandle={dirHandle} onPick={this._onDirPick} />
      </div>
    );
  }
}
