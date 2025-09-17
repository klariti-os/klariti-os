chrome.action.onClicked.addListener(() => {
    const url = "https://klariti-os.vercel.app/"; 
    chrome.tabs.create({ url });
  });
  