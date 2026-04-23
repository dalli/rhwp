import { open, save } from '@tauri-apps/plugin-dialog';
import { readFile, writeFile } from '@tauri-apps/plugin-fs';

export interface FileSystemWritableFileStreamLike {
  write(data: Blob): Promise<void>;
  close(): Promise<void>;
}

export interface FileSystemFileHandleLike {
  kind?: 'file';
  name: string;
  getFile(): Promise<File>;
  createWritable(): Promise<FileSystemWritableFileStreamLike>;
}

export interface FileSystemWindowLike {
  showOpenFilePicker?: (options?: {
    excludeAcceptAllOption?: boolean;
    multiple?: boolean;
    types?: { description: string; accept: Record<string, string[]> }[];
  }) => Promise<FileSystemFileHandleLike[]>;
  showSaveFilePicker?: (options?: {
    suggestedName?: string;
    types?: { description: string; accept: Record<string, string[]> }[];
  }) => Promise<FileSystemFileHandleLike>;
}

export interface FileHandleReadResult {
  name: string;
  bytes: Uint8Array;
}

export interface SaveDocumentOptions {
  blob: Blob;
  suggestedName: string;
  currentHandle: FileSystemFileHandleLike | null;
  windowLike: FileSystemWindowLike;
}

export interface SaveDocumentResult {
  method: 'current-handle' | 'save-picker' | 'fallback';
  handle: FileSystemFileHandleLike | null;
  fileName: string;
}

const HWP_PICKER_TYPES = [{
  description: 'HWP 문서',
  accept: { 'application/x-hwp': ['.hwp', '.hwpx'] },
}];

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

class TauriFileHandle implements FileSystemFileHandleLike {
  kind: 'file' = 'file';
  name: string;
  path: string;

  constructor(path: string) {
    this.path = path;
    this.name = path.split(/[/\\]/).pop() || 'document.hwp';
  }

  async getFile(): Promise<File> {
    const bytes = await readFile(this.path);
    return new File([bytes], this.name, { type: 'application/x-hwp' });
  }

  async createWritable(): Promise<FileSystemWritableFileStreamLike> {
    return {
      write: async (data: Blob) => {
        const bytes = new Uint8Array(await data.arrayBuffer());
        await writeFile(this.path, bytes);
      },
      close: async () => {},
    };
  }
}

async function writeBlobToHandle(handle: FileSystemFileHandleLike, blob: Blob): Promise<void> {
  const writable = await handle.createWritable();
  await writable.write(blob);
  await writable.close();
}

export async function pickOpenFileHandle(windowLike: FileSystemWindowLike): Promise<FileSystemFileHandleLike | null> {
  if (isTauri()) {
    const selected = await open({
      multiple: false,
      filters: [{ name: 'HWP 문서', extensions: ['hwp', 'hwpx'] }]
    });
    if (!selected) return null;
    return new TauriFileHandle(selected as string);
  }

  if (!windowLike.showOpenFilePicker) return null;

  try {
    const handles = await windowLike.showOpenFilePicker({
      excludeAcceptAllOption: true,
      multiple: false,
      types: HWP_PICKER_TYPES,
    });
    return handles[0] ?? null;
  } catch (error) {
    if (isAbortError(error)) return null;
    throw error;
  }
}

export async function readFileFromHandle(handle: FileSystemFileHandleLike): Promise<FileHandleReadResult> {
  const file = await handle.getFile();
  return {
    name: file.name,
    bytes: new Uint8Array(await file.arrayBuffer()),
  };
}

export async function saveDocumentToFileSystem(options: SaveDocumentOptions): Promise<SaveDocumentResult> {
  const { blob, suggestedName, currentHandle, windowLike } = options;

  if (currentHandle) {
    await writeBlobToHandle(currentHandle, blob);
    return {
      method: 'current-handle',
      handle: currentHandle,
      fileName: currentHandle.name,
    };
  }

  if (isTauri()) {
    const savePath = await save({
      defaultPath: suggestedName,
      filters: [{ name: 'HWP 문서', extensions: ['hwp', 'hwpx'] }]
    });
    if (!savePath) {
      throw new DOMException('User cancelled', 'AbortError');
    }
    const handle = new TauriFileHandle(savePath);
    await writeBlobToHandle(handle, blob);
    return {
      method: 'save-picker',
      handle,
      fileName: handle.name,
    };
  }

  if (windowLike.showSaveFilePicker) {
    const handle = await windowLike.showSaveFilePicker({
      suggestedName,
      types: HWP_PICKER_TYPES,
    });
    await writeBlobToHandle(handle, blob);
    return {
      method: 'save-picker',
      handle,
      fileName: handle.name,
    };
  }

  return {
    method: 'fallback',
    handle: null,
    fileName: suggestedName,
  };
}
