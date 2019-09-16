const m = require("../measure.js");

test("Measure Empty Object", () => {
  let emptyObject = {};
  let expected = {
    name: "root",
    value: 2,
    children: []
  };

  expect(
    m.measureObject(JSON.stringify(emptyObject), "root", "")
  ).toStrictEqual(expected);
});
