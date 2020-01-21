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
} from 'client/google/login';
import AlbumPick from '../album-pick';

interface Props {}

interface State {
  isLoggedIn: boolean;
  album?: PhotoAlbum;
}

export default class App extends Component<Props, State> {
  state: State = {
    isLoggedIn: isLoggedIn(),
  };

  private _onLoginChange = (event: LoginChangeEvent) => {
    this.setState({
      isLoggedIn: event.isLoggedIn,
    });
  };

  private _onLoginClick = () => {
    attemptLogin();
  };

  private _onAlbumPick = (album: PhotoAlbum) => {
    this.setState({ album });
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

  render({}: Props, { isLoggedIn, album }: State) {
    return (
      <div>
        <h2>{isLoggedIn ? 'Logged in' : 'Not logged in'}</h2>
        {!isLoggedIn ? (
          <button onClick={this._onLoginClick}>Log in</button>
        ) : !album ? (
          <AlbumPick onPick={this._onAlbumPick} />
        ) : (
          `Picked ${album.title}`
        )}
      </div>
    );
  }
}
