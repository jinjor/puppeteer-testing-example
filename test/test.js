const puppeteer = require("puppeteer");
const Server = require("./server");
const Accesses = require("./accesses");
const Responses = require("./responses");
const Screenshot = require("./screenshot");
const EditPage = require("./pages/edit");

const port = 3000;
const screenshotDir = "./screenshot";
const publicDir = `${__dirname}/../public`;
const topPage = `http://localhost:${port}`;
const accesses = new Accesses(topPage);
const responses = new Responses(topPage);
const screenshot = new Screenshot(screenshotDir);
const server = new Server();
server.static(publicDir);

const pageClasses = [EditPage];
const common404 = {
  status: 404,
  contentType: "text/plain",
  body: JSON.stringify({
    message: "Sorry, not found!"
  })
};

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
    responses.set404(common404);
  });
  for (let pageClass of pageClasses) {
    const pageName = pageClass.name;
    describe(pageName, function() {
      let thisPage;
      before(async function() {
        thisPage = new pageClass(page);
        await page.goto(`${topPage}/${thisPage.url}`);
        await screenshot.page(page, pageName);
      });
      beforeEach(async function() {
        for (let key in thisPage.requirements) {
          const response = thisPage.requirements[key];
          responses.add("GET", key, response);
        }
        await page.goto(`${topPage}/${thisPage.url}`);
      });
      for (let method of Object.getOwnPropertyNames(pageClass.prototype)) {
        if (method.startsWith("should")) {
          it(method, async () => {
            await thisPage[method](accesses, screenshot);
          });
        }
      }
    });
  }
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
