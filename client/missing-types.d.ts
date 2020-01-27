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
/// <reference path="../missing-types.d.ts" />

type ChooseFileSystemEntriesType = 'open-file' | 'save-file' | 'open-directory';

interface ChooseFileSystemEntriesOptionsAccepts {
  description?: string;
  mimeTypes?: string[];
  extensions?: string[];
}

interface ChooseFileSystemEntriesOptions {
  type?: ChooseFileSystemEntriesType;
  multiple?: boolean;
  accepts?: ChooseFileSystemEntriesOptionsAccepts[];
  excludeAcceptAllOption?: boolean;
}

interface ChooseFileSystemEntriesOptionsMultiple
  extends ChooseFileSystemEntriesOptions {
  multiple: true;
}

interface ChooseFileSystemEntriesOptionsDirectory
  extends ChooseFileSystemEntriesOptions {
  type: 'open-directory';
  multiple?: false;
}

interface ChooseFileSystemEntriesOptionsDirectoryMultiple
  extends ChooseFileSystemEntriesOptions {
  type: 'open-directory';
  multiple: true;
}

interface ChooseFileSystemEntriesOptionsFile
  extends ChooseFileSystemEntriesOptions {
  type?: 'open-file' | 'save-file';
  multiple?: false;
}

interface ChooseFileSystemEntriesOptionsFileMultiple
  extends ChooseFileSystemEntriesOptions {
  type?: 'open-file' | 'save-file';
  multiple: true;
}

interface FileSystemHandlePermissionDescriptor {
  writable?: boolean;
}

interface FileSystemHandle {
  readonly isFile: boolean;
  readonly isDirectory: boolean;
  readonly name: string;

  queryPermission(
    descriptor?: FileSystemHandlePermissionDescriptor,
  ): Promise<PermissionState>;
  requestPermission(
    descriptor?: FileSystemHandlePermissionDescriptor,
  ): Promise<PermissionState>;
}

interface FileSystemCreateWriterOptions {
  keepExistingData?: boolean;
}

interface FileSystemFileHandle extends FileSystemHandle {
  readonly isFile: true;
  readonly isDirectory: false;

  getFile(): File;
  createWriter(
    options?: FileSystemCreateWriterOptions,
  ): Promise<FileSystemWriter>;
}

interface FileSystemGetFileOptions {
  create?: boolean;
}

interface FileSystemGetDirectoryOptions {
  create?: boolean;
}

interface FileSystemRemoveOptions {
  recursive?: boolean;
}

interface FileSystemDirectoryHandle extends FileSystemHandle {
  readonly isFile: false;
  readonly isDirectory: true;

  getFile(
    name: string,
    options?: FileSystemGetFileOptions,
  ): Promise<FileSystemFileHandle>;
  getDirectory(
    name: string,
    options?: FileSystemGetDirectoryOptions,
  ): Promise<FileSystemDirectoryHandle>;
  getEntries(): AsyncIterable<FileSystemDirectoryHandle | FileSystemFileHandle>;
  removeEntry(name: string, options?: FileSystemRemoveOptions): Promise<void>;
}

interface FileSystemWriter {
  write(position: number, data: BufferSource | Blob | string): Promise<void>;
  truncate(size: number): Promise<void>;
  close(): Promise<void>;
}

declare function chooseFileSystemEntries(
  options?: ChooseFileSystemEntriesOptionsFile,
): Promise<FileSystemFileHandle>;
declare function chooseFileSystemEntries(
  options?: ChooseFileSystemEntriesOptionsFileMultiple,
): Promise<FileSystemFileHandle[]>;
declare function chooseFileSystemEntries(
  options?: ChooseFileSystemEntriesOptionsDirectory,
): Promise<FileSystemDirectoryHandle>;
declare function chooseFileSystemEntries(
  options?: ChooseFileSystemEntriesOptionsDirectoryMultiple,
): Promise<FileSystemDirectoryHandle[]>;
declare function chooseFileSystemEntries(
  options?: ChooseFileSystemEntriesOptionsMultiple,
): Promise<Array<FileSystemDirectoryHandle | FileSystemFileHandle>>;
declare function chooseFileSystemEntries(
  options?: ChooseFileSystemEntriesOptions,
): Promise<FileSystemDirectoryHandle | FileSystemFileHandle>;

interface Window {
  chooseFileSystemEntries: typeof chooseFileSystemEntries;
}
