import { Tab, TabGroup, TabGroupColor } from '@/model/Tab';
import TabRepository from '@/repositories/TabRepository';
import { ref } from 'vue';

export default function useTabStorage(): {
  tabs: import('vue').Ref<{ url: string; title: string; favIconUrl: string }[]>;
  tabGroups: import('vue').Ref<
    {
      tabs: { url: string; title: string; favIconUrl: string }[];
      groupName: string;
      color: TabGroupColor;
    }[]
  >;
  fetchTabStorage: () => Promise<void>;
  saveTabStorage: () => Promise<void>;
} {
  const tabs = ref<Tab[]>([]);
  const tabGroups = ref<TabGroup[]>([]);

  const fetchTabStorage = async () => {
    const tabStorage = await TabRepository.fetch();
    tabs.value = tabStorage?.tabs ?? [];
    tabGroups.value = tabStorage?.tabGroups ?? [];
  };

  const saveTabStorage = async () => {
    await TabRepository.save({
      tabs: tabs.value.map((e) => e),
      tabGroups: tabGroups.value.map((e) => ({
        ...e,
        tabs: e.tabs.map((t) => t),
      })),
    });
  };

  return {
    tabs,
    tabGroups,
    fetchTabStorage,
    saveTabStorage,
  };
}
