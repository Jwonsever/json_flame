const m = require("./measure.js");

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

test("Measure Simple Object", () => {
  let simpleObject = { abc: "def", ghi: 5 };
  let expected = {
    name: "root",
    value: 21,
    children: [{ name: "abc", value: 5 }, { name: "ghi", value: 1 }]
  };

  expect(
    m.measureObject(JSON.stringify(simpleObject), "root", "")
  ).toStrictEqual(expected);
});

test("Measure Simple Object In Keys Mode", () => {
  let simpleObject = { abc: "def", ghi: 5 };
  let expected = {
    name: "root",
    value: 21,
    children: [{ name: "abc", value: 11 }, { name: "ghi", value: 7 }]
  };

  expect(
    m.measureObject(JSON.stringify(simpleObject), "root", "k")
  ).toStrictEqual(expected);
});