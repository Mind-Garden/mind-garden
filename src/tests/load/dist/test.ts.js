'use strict';
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if ((from && typeof from === 'object') || typeof from === 'function') {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
        });
  }
  return to;
};
var __toCommonJS = (mod) =>
  __copyProps(__defProp({}, '__esModule', { value: true }), mod);

// src/tests/load/test.ts
var test_exports = {};
__export(test_exports, {
  config: () => config,
  scenarios: () => scenarios,
});
module.exports = __toCommonJS(test_exports);
var config = {
  target: 'http://localhost:3000',
  phases: [
    {
      duration: 10,
      arrivalRate: 1,
    },
  ],
  engines: {
    playwright: {},
  },
};
var scenarios = [
  {
    engine: 'playwright',
    testFunction: helloWorld,
  },
];
async function helloWorld(page) {
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: 'Get Started' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('load@test.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('loadtest');
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.waitForURL('http://localhost:3000/home');
}
// Annotate the CommonJS export names for ESM import in node:
0 &&
  (module.exports = {
    config,
    scenarios,
  });
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vdGVzdC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgUGFnZSB9IGZyb20gJ0BwbGF5d3JpZ2h0L3Rlc3QnO1xuXG5leHBvcnQgY29uc3QgY29uZmlnID0ge1xuICB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjMwMDAnLFxuICBwaGFzZXM6IFt7XG4gICAgZHVyYXRpb246IDEwLFxuICAgIGFycml2YWxSYXRlOiAxLFxuICB9XSxcbiAgZW5naW5lczoge1xuICAgIHBsYXl3cmlnaHQ6IHt9LFxuICB9LFxufTtcbmV4cG9ydCBjb25zdCBzY2VuYXJpb3MgPSBbXG4gIHtcbiAgICBlbmdpbmU6ICdwbGF5d3JpZ2h0JyxcbiAgICB0ZXN0RnVuY3Rpb246IGhlbGxvV29ybGQsXG4gIH0sXG5dO1xuXG5hc3luYyBmdW5jdGlvbiBoZWxsb1dvcmxkKHBhZ2U6IFBhZ2UpIHtcbiAgICBhd2FpdCBwYWdlLmdvdG8oJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMC8nKTtcbiAgICBhd2FpdCBwYWdlLmdldEJ5Um9sZSgnYnV0dG9uJywgeyBuYW1lOiAnR2V0IFN0YXJ0ZWQnIH0pLmNsaWNrKCk7XG4gICAgYXdhaXQgcGFnZS5nZXRCeVJvbGUoJ3RleHRib3gnLCB7IG5hbWU6ICdFbWFpbCcgfSkuZmlsbCgnbG9hZEB0ZXN0LmNvbScpO1xuICAgIGF3YWl0IHBhZ2UuZ2V0QnlSb2xlKCd0ZXh0Ym94JywgeyBuYW1lOiAnUGFzc3dvcmQnIH0pLmZpbGwoJ2xvYWR0ZXN0Jyk7XG4gICAgYXdhaXQgcGFnZS5nZXRCeVJvbGUoJ2J1dHRvbicsIHsgbmFtZTogJ0xvZyBpbicgfSkuY2xpY2soKTtcblxuICAgIC8vIFdhaXQgZm9yIG5hdmlnYXRpb24gdG8gL2hvbWVcbiAgICBhd2FpdCBwYWdlLndhaXRGb3JVUkwoJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMC9ob21lJyk7XG59XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUVPLElBQU0sU0FBUztBQUFBLEVBQ3BCLFFBQVE7QUFBQSxFQUNSLFFBQVEsQ0FBQztBQUFBLElBQ1AsVUFBVTtBQUFBLElBQ1YsYUFBYTtBQUFBLEVBQ2YsQ0FBQztBQUFBLEVBQ0QsU0FBUztBQUFBLElBQ1AsWUFBWSxDQUFDO0FBQUEsRUFDZjtBQUNGO0FBQ08sSUFBTSxZQUFZO0FBQUEsRUFDdkI7QUFBQSxJQUNFLFFBQVE7QUFBQSxJQUNSLGNBQWM7QUFBQSxFQUNoQjtBQUNGO0FBRUEsZUFBZSxXQUFXLE1BQVk7QUFDbEMsUUFBTSxLQUFLLEtBQUssd0JBQXdCO0FBQ3hDLFFBQU0sS0FBSyxVQUFVLFVBQVUsRUFBRSxNQUFNLGNBQWMsQ0FBQyxFQUFFLE1BQU07QUFDOUQsUUFBTSxLQUFLLFVBQVUsV0FBVyxFQUFFLE1BQU0sUUFBUSxDQUFDLEVBQUUsS0FBSyxlQUFlO0FBQ3ZFLFFBQU0sS0FBSyxVQUFVLFdBQVcsRUFBRSxNQUFNLFdBQVcsQ0FBQyxFQUFFLEtBQUssVUFBVTtBQUNyRSxRQUFNLEtBQUssVUFBVSxVQUFVLEVBQUUsTUFBTSxTQUFTLENBQUMsRUFBRSxNQUFNO0FBR3pELFFBQU0sS0FBSyxXQUFXLDRCQUE0QjtBQUN0RDsiLAogICJuYW1lcyI6IFtdCn0K
