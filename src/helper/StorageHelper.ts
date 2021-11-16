/// <reference types="chrome" />

export type StorageType = 'local' | 'sync';

class StorageHelper {
  async load<T>(
    key: string,
    storageType: StorageType = 'local',
  ): Promise<T | undefined> {
    return new Promise<T | undefined>((resolve, reject) => {
      chrome.storage[storageType].get(key, (result: { [key: string]: T }) => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        resolve(result[key]);
      });
    });
  }

  async store<T>(
    key: string,
    data: T,
    storageType: StorageType = 'local',
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      chrome.storage[storageType].set({ [key]: data }, function () {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        resolve();
      });
    });
  }
}

export default new StorageHelper();
