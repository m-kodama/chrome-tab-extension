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
}

export default new TabsHelper();
