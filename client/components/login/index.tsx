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

import { attemptLogin } from 'client/google/login';
import { getUserInfo, UserInfo } from 'client/google';

interface Props {
  isLoggedIn: boolean;
  onLogOut: () => void;
}

interface State {
  userDetails?: UserInfo;
}

export default class Login extends Component<Props, State> {
  private _userInfoPromise: Promise<UserInfo> | undefined;

  state: State = {
    userDetails: undefined,
  };

  constructor(props: Props) {
    super(props);
    if (props.isLoggedIn) this._fetchUserInfo();
  }

  private async _fetchUserInfo() {
    if (this._userInfoPromise) return;
    this._userInfoPromise = getUserInfo();
    this.setState({
      userDetails: await this._userInfoPromise,
    });
  }

  componentDidUpdate(prevProps: Props) {
    if (!prevProps.isLoggedIn && this.props.isLoggedIn) {
      this._fetchUserInfo();
    }
  }

  private _onLoginClick = () => {
    attemptLogin();
  };

  render({ isLoggedIn, onLogOut }: Props, { userDetails }: State) {
    return (
      <div>
        {!isLoggedIn ? (
          <button onClick={this._onLoginClick}>Log in</button>
        ) : (
          <div>
            <button onClick={onLogOut}>Log out</button> Logged in as:{' '}
            {userDetails ? userDetails.name : 'Loading'}
          </div>
        )}
      </div>
    );
  }
}
