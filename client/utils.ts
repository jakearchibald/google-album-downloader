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

/**
 * Returns a new function that ensures that all calls to func are queued.
 *
 * @param func
 */
export function queueCalls<T extends (...args: any[]) => any>(
  func: T,
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let lastCall: Promise<void> = Promise.resolve();

  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return new Promise((resolve, reject) => {
      lastCall = lastCall
        .catch(() => {})
        .then(() => {
          const returnPromise = func(...args);
          returnPromise.then(resolve, reject);
          return returnPromise;
        });
    });
  };
}
