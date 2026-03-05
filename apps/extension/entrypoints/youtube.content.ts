export default defineContentScript({
  matches: ["*://www.youtube.com/*"],
  async main(ctx) {
    if (ctx.isValid){
      console.log("YouTube content script is running!");
    }
  },
});
