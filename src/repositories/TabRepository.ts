import StorageHelper, { StorageType } from '@/helper/StorageHelper';
import { Tab, TabGroup } from '@/model/Tab';

export interface TabStorage {
  tabs: Tab[];
  tabGroups: TabGroup[];
}

class TabRepository {
  private key = 'tab';

  async fetch(storageType?: StorageType): Promise<TabStorage | undefined> {
    return StorageHelper.load<TabStorage>(this.key, storageType);
  }

  async save(data: TabStorage, storageType?: StorageType): Promise<void> {
    return StorageHelper.store<TabStorage>(this.key, data, storageType);
  }
}

export default new TabRepository();
