import { defineConfig } from "wxt";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    permissions: ["tabs"],
    host_permissions: ["http://localhost:4200/*"],
    icons: {
      "16": "icon/16.png",
      "32": "icon/32.png",
      "48": "icon/48.png",
      "96": "icon/96.png",
      "128": "icon/128.png",
    },
    action: {
      default_icon: {
        "16": "icon/16.png",
        "32": "icon/32.png",
        "48": "icon/48.png",
        "128": "icon/128.png",
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
