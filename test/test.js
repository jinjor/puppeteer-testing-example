const assert = require("assert");
const puppeteer = require("puppeteer");
const fs = require("fs-extra");
const server = require("./server");

const port = 3000;
const screenshotDir = "./screenshot";
const pagesDir = `${screenshotDir}/pages`;
const failuresDir = `${screenshotDir}/failures`;
const debugDir = `${screenshotDir}/debug`;
const publicDir = `${__dirname}/../public`;
const topPage = `http://localhost:${port}`;
const accesses = {};
const responses = {};
fs.emptyDirSync(pagesDir);
fs.emptyDirSync(failuresDir);
fs.emptyDirSync(debugDir);

describe("Pages", function() {
  let browser;
  let page;
  before(async function() {
    this.timeout(5000);
    await server.start(publicDir, port);
    browser = await puppeteer.launch();
    page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on("request", async request => {
      const resourceType = request.resourceType();
      const method = request.method();
      const url = request.url();
      const path = url.split(topPage)[1];
      const key = `${method} ${path}`;
      if (resourceType === "xhr" || resourceType === "other") {
        const body = JSON.parse(request.postData() || "{}");
        accesses[key] = {
          params: {},
          query: {},
          body: body
        };
        const response = responses[key] || {
          status: 404,
          contentType: "text/plain",
          body: JSON.stringify({
            message: "Sorry, not found!"
          })
        };
        request.respond(response);
      } else {
        request.continue();
      }
    });
  });
  beforeEach(async function() {
    for (let key in accesses) {
      delete accesses[key];
    }
    for (let key in responses) {
      delete responses[key];
    }
  });
  describe("Edit page", function() {
    before(async function() {
      await page.goto(topPage);
      const name = "edit";
      const path = `${pagesDir}/${name}.png`;
      await page.screenshot({ path: path });
    });
    beforeEach(async function() {
      responses["GET /config"] = {
        status: 200,
        contentType: "text/plain",
        body: JSON.stringify({
          defaultText: "abc"
        })
      };
      await page.goto(topPage);
    });
    it("should send data", async () => {
      await page.click("#submit");
      assert.equal(accesses["POST /articles"].body.text, "abc");
      await page.waitFor(50);
      await page.screenshot({ path: `${debugDir}/after-submit.png` });
    });
    it("should send input data", async () => {
      await page.click("#clear");
      await page.type("#text", "def");
      assert.equal(accesses["POST /articles"], undefined);
      await page.click("#submit");
      assert.equal(accesses["POST /articles"].body.text, "def");
    });
    // this will fail because validation is not implemented yet.
    it("should not send invalid data", async () => {
      await page.click("#clear");
      await page.click("#submit");
      assert.equal(accesses["POST /articles"], undefined);
    });
  });
  afterEach(async function() {
    if (this.currentTest.state === "failed") {
      const name = this.currentTest.title.replace(/[^0-9a-zA-Z]/g, "_");
      const path = `${failuresDir}/${name}.png`;
      await page.screenshot({ path: path });
    }
  });
  after(async function() {
    if (browser) {
      await browser.close();
    }
    server.close();
  });
});
