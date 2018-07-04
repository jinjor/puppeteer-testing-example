const assert = require("assert");
const puppeteer = require("puppeteer");
const Server = require("./server");
const Accesses = require("./accesses");
const Responses = require("./responses");
const Screenshot = require("./screenshot");

const port = 3000;
const screenshotDir = "./screenshot";
const publicDir = `${__dirname}/../public`;
const topPage = `http://localhost:${port}`;
const accesses = new Accesses(topPage);
const responses = new Responses(topPage);
const screenshot = new Screenshot(screenshotDir);
const server = new Server();
server.static(publicDir);

describe("Pages", function() {
  let browser;
  let page;
  before(async function() {
    this.timeout(5000);
    await server.start(port);
    browser = await puppeteer.launch();
    screenshot.initDirs();
    page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on("request", async request => {
      const resourceType = request.resourceType();
      if (resourceType === "xhr" || resourceType === "other") {
        accesses.add(request);
        try {
          await request.respond(responses.get(request));
        } catch (e) {
          await request.abort();
        }
      } else {
        await request.continue();
      }
    });
  });
  beforeEach(async function() {
    accesses.reset();
    responses.reset();
    responses.set404({
      status: 404,
      contentType: "text/plain",
      body: JSON.stringify({
        message: "Sorry, not found!"
      })
    });
  });
  describe("Edit page", function() {
    before(async function() {
      await page.goto(topPage);
      await screenshot.page(page, "edit");
    });
    beforeEach(async function() {
      responses.add("GET", "/config", {
        status: 200,
        contentType: "text/plain",
        body: JSON.stringify({
          defaultText: "abc"
        })
      });
      await page.goto(topPage);
    });
    it("should send data", async () => {
      await page.click("#submit");
      assert.equal(accesses.get("POST", "/articles").body.text, "abc");
      await page.waitFor(50);
      await screenshot.debug(page, "after-submit");
    });
    it("should send input data", async () => {
      await page.click("#clear");
      await page.type("#text", "def");
      assert.equal(accesses.get("POST", "/articles"), undefined);
      await page.click("#submit");
      assert.equal(accesses.get("POST", "/articles").body.text, "def");
    });
    // this will fail because validation is not implemented yet.
    it("should not send invalid data", async () => {
      await page.click("#clear");
      await page.click("#submit");
      assert.equal(accesses.get("POST", "/articles"), undefined);
    });
  });
  afterEach(async function() {
    if (this.currentTest.state === "failed") {
      const name = this.currentTest.title.replace(/[^0-9a-zA-Z]/g, "_");
      await screenshot.failure(page, name);
    }
  });
  after(async function() {
    if (browser) {
      await browser.close();
    }
    server.close();
  });
});
