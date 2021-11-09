import StorageHelper, { StorageType } from '@/helper/StorageHelper';
import { TabGroups } from '@/model/Tab';

class TabRepository {
  private key = 'tab';
  private storageHelper: StorageHelper;

  constructor(storageHelper: StorageHelper) {
    this.storageHelper = storageHelper;
  }

  async fetch(storageType?: StorageType): Promise<TabGroups> {
    return this.storageHelper.load<TabGroups>(this.key, storageType);
  }

  async save(data: TabGroups, storageType?: StorageType): Promise<void> {
    return this.storageHelper.store<TabGroups>(this.key, data, storageType);
  }
}

export default new TabRepository(new StorageHelper());
