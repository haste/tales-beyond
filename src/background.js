const openOptionsPage = () => chrome.runtime.openOptionsPage();

(chrome.action ?? chrome.browserAction).onClicked.addListener(openOptionsPage);
