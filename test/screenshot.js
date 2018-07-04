const fs = require("fs-extra");

module.exports = class Screenshot {
  constructor(screenshotDir) {
    this.screenshotDir = screenshotDir;
  }
  get pagesDir() {
    return `${this.screenshotDir}/pages`;
  }
  get failuresDir() {
    return `${this.screenshotDir}/failures`;
  }
  get debugDir() {
    return `${this.screenshotDir}/debug`;
  }
  initDirs() {
    fs.emptyDirSync(this.pagesDir);
    fs.emptyDirSync(this.failuresDir);
    fs.emptyDirSync(this.debugDir);
  }
  async page(page, name) {
    await page.screenshot({ path: `${this.pagesDir}/${name}.png` });
  }
  async failure(page, name) {
    await page.screenshot({ path: `${this.failuresDir}/${name}.png` });
  }
  async debug(page, name) {
    await page.screenshot({ path: `${this.debugDir}/${name}.png` });
  }
};
