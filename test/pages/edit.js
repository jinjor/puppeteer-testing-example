const assert = require("assert");

module.exports = class EditPage {
  constructor(page) {
    this.page = page;
    this.url = "/";
    this.requirements = {
      "/config": {
        status: 200,
        contentType: "text/plain",
        body: JSON.stringify({
          defaultText: "abc"
        })
      }
    };
  }
  async input(text) {
    await this.page.type("#text", text);
  }
  async clear() {
    await this.page.click("#clear");
  }
  async submit() {
    await this.page.click("#submit");
  }
  async ["should send data"](accesses, screenshot) {
    await this.submit();
    assert.equal(accesses.get("POST", "/articles").body.text, "abc");
    await this.page.waitFor(50);
    await screenshot.debug(this.page, "after-submit");
  }
  async ["should send input data"](accesses) {
    await this.clear();
    await this.input("def");
    assert.equal(accesses.get("POST", "/articles"), undefined);
    await this.submit();
    assert.equal(accesses.get("POST", "/articles").body.text, "def");
  }
  // this will fail because validation is not implemented yet.
  async ["should not send invalid data"](accesses) {
    await this.clear();
    await this.submit();
    assert.equal(accesses.get("POST", "/articles"), undefined);
  }
};
