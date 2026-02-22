import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    permissions: [
      "tabs",
      "activeTab",
      "storage",
      "alarms",
      "webRequest",
      "webNavigation",
      "declarativeNetRequest",
      "declarativeNetRequestWithHostAccess",
    ],
    host_permissions: ["<all_urls>"],
    action: {
      default_icon: {
        "16": "snwtr.png",
        "32": "snwtr.png",
      },
    },
  },
  webExt: {
    binaries: {
      chrome: "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    },
    chromiumArgs: ["--user-data-dir=./.wxt/chrome-data"],
    disabled: false,
  },
});
