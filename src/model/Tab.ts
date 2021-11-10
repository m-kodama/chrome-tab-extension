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

const tabGroupColors = [
  '#BDC1C5',
  '#8ab4f5',
  '#F28B83',
  '#FED56B',
  '#80C998',
  '#FF8BC8',
  '#BE9BDC',
  '#77D9EB',
] as const;
type TabGroupColor = typeof tabGroupColors[number];
