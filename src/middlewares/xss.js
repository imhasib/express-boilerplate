const { JSDOM } = require("jsdom");
const DOMPurify = require("dompurify");

const window = new JSDOM("").window;
const purify = DOMPurify(window);

const xss = (req, res, next) => {
  if (req.body) {
    req.body = JSON.parse(purify.sanitize(JSON.stringify(req.body)));
  }
  if (req.query) {
    req.query = JSON.parse(purify.sanitize(JSON.stringify(req.query)));
  }
  if (req.params) {
    req.params = JSON.parse(purify.sanitize(JSON.stringify(req.params)));
  }
  next();
};

module.exports = xss;
