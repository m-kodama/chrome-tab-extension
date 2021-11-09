export interface Tab {
  domain: string;
  url: string;
}

export interface TabGroup {
  tabs: Tab[];
  groupName: string;
  color: string;
}

export interface TabGroups {
  tabGroups: TabGroup[];
}
