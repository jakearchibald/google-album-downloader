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
import { h, FunctionalComponent } from 'preact';

import cssPath from 'css:./styles.css';
import bundleURL, { imports } from 'client-bundle:client/index';

const IndexPage: FunctionalComponent = () => {
  return (
    <html>
      <head>
        <title>Google Photos Album Downloader</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {/* TODO: favicon */}
        <link rel="stylesheet" href={cssPath} />
        <script type="module" src={bundleURL} />
        {imports.map(i => (
          // @ts-ignore https://github.com/preactjs/preact/pull/2068
          <link rel="preload" as="script" href={i} crossOrigin="" />
        ))}
      </head>
      <body>
        <h1>Hello</h1>
      </body>
    </html>
  );
};

export default IndexPage;
