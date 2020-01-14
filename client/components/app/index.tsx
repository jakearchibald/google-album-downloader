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
  tokens,
  target as tokenEventTarget,
  getLoginURL,
  getAlbums,
} from '../../google';

interface Props {}

interface State {
  isLoggedIn: boolean;
}

export default class App extends Component<Props, State> {
  state: State = {
    isLoggedIn: !!tokens,
  };

  private _onTokenChange = () => {
    this.setState({
      isLoggedIn: !!tokens,
    });
  };

  private _onLoginClick = () => {
    open(getLoginURL());
  };

  private async _getAlbumData() {
    const data = await getAlbums();
    console.log(data);
  }

  componentDidMount() {
    tokenEventTarget.addEventListener('tokenschange', this._onTokenChange);
    if (this.state.isLoggedIn) this._getAlbumData();
  }

  componentWillUnmount() {
    tokenEventTarget.removeEventListener('tokenschange', this._onTokenChange);
  }

  componentDidUpdate(_: Props, previousState: State) {
    if (this.state.isLoggedIn && !previousState.isLoggedIn) {
      this._getAlbumData();
    }
  }

  render({}: Props, { isLoggedIn }: State) {
    return (
      <div>
        <h2>{isLoggedIn ? 'Logged in' : 'Not logged in'}</h2>
        {!isLoggedIn && <button onClick={this._onLoginClick}>Log in</button>}
      </div>
    );
  }
}
