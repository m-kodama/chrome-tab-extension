export interface Tab {
  domain: string;
  url: string;
  title: string;
}

export interface TabGroup {
  tabs: Tab[];
  groupName: string;
  color: TabGroupColor;
}

const tabGroupColors = ['#8ab4f5'] as const;
type TabGroupColor = typeof tabGroupColors[number];
