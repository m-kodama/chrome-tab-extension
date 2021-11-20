/// <reference types="chrome" />

class TabsHelper {
  async getCurrentTab(): Promise<chrome.tabs.Tab> {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
      windowType: 'normal',
    });
    return tab;
  }

  async findByUrl(url: string): Promise<chrome.tabs.Tab[]> {
    // フラグメント識別子(#以降)を削除して検索する
    return await chrome.tabs.query({
      url: url.split('#')[0],
      currentWindow: true,
      windowType: 'normal',
    });
  }

  async create(url: string, active = true): Promise<chrome.tabs.Tab> {
    const properties: chrome.tabs.CreateProperties = {
      url,
      active,
    };
    return chrome.tabs.create(properties);
  }

  async toActive(tabIndex: number): Promise<void> {
    const highlightInfo: chrome.tabs.HighlightInfo = {
      tabs: tabIndex,
    };
    chrome.tabs.highlight(highlightInfo);
  }
}

export default new TabsHelper();
