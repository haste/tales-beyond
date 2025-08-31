const openOptionsPage = () => chrome.runtime.openOptionsPage();

(chrome.action ?? chrome.browserAction).onClicked.addListener(openOptionsPage);

chrome.runtime.onMessage.addListener((message) => {
  switch (message.action) {
    case "openOptionsPage":
      openOptionsPage();
      break;
    default:
      break;
  }
});
