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
import { promises as fsp } from 'fs';
import { join as joinPath } from 'path';

import { h } from 'preact';

import { renderPage } from './render';
import IndexPage from './pages/index';
import LoginPage from './pages/login';

const toOutput = {
  'index.html': renderPage(<IndexPage />),
  'login/index.html': renderPage(<LoginPage />),
};

Promise.all(
  Object.entries(toOutput).map(async ([path, content]) => {
    const pathParts = ['.build-tmp', 'output', ...path.split('/')];
    await fsp.mkdir(joinPath(...pathParts.slice(0, -1)), { recursive: true });
    const fullPath = joinPath(...pathParts);
    try {
      await fsp.writeFile(fullPath, content, {
        encoding: 'utf8',
      });
    } catch (err) {
      console.error('Failed to write ' + fullPath);
      throw err;
    }
  }),
).catch(err => {
  console.error(err);
  process.exit(1);
});
