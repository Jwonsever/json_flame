//
// A Prim is a single primitive, part of an array or object.
//
// For arrays: The "a" and the 1 are both prims in ["a",1]
//
// For objects: The prim is the "a" in {"b":"a"}
//
// measurePrim expects its input s to be output of json.stringify(prim)
//
// Returns an int of the length of the prim.
function measurePrim(s, name) {
  var out = {
    name: name,
    value: s.length
  };

  return out;
}

//
// Measure an array, anything that looks like [,,,,]
//
// Each item in an array is represented as its own object by index:
// [o1, o2, o3].
//
// Returns:
// {
// "name": "array",
// "value": 12,
//  "children": [{name: "o1", value: "2"}, {o2...}, {o3...}]
// }
//
function measureArray(s, name, mode) {
  // Clean up whitespace.
  s = JSON.stringify(JSON.parse(s));

  var out = {
    name: name,
    value: s.length,
    children: []
  };

  // Handle empty arrays.
  if (s === "[]") {
    return out;
  }

  let idx = 0;
  let asJson = JSON.parse(s);
  for (let k in asJson) {
    let i = JSON.stringify(asJson[k]);
    if (i.match(/^\{.*\}$/)) {
      out.children.push(measureObject(i, "object_" + idx, mode));
    } else if (i.match(/^\[.*\]$/)) {
      out.children.push(measureArray(i, "array_" + idx, mode));
    } else {
      out.children.push(measurePrim(i, "prim_" + idx));
    }

    idx++;
  }

  return out;
}

//
// Measure an array, anything that looks like [,,,,]
//
// Aggregates object children.  It looks over all of the object children and combines
// any like children of those children.  If there are nested arrays, those elements
// are not aggregated.
//
function measureArrayAggregate(s, name, mode) {
  // Clean up whitespace.
  s = JSON.stringify(JSON.parse(s));

  var out = {
    name: name,
    value: s.length,
    children: []
  };

  // Handle empty arrays.
  if (s === "[]") {
    return out;
  }

  let children = {};

  let idx = 0;
  let asJson = JSON.parse(s);
  for (let k in asJson) {
    let i = JSON.stringify(asJson[k]);
    if (i.match(/^\{.*\}$/)) {
      sibling = measureObject(i, "object_" + idx, mode);
      out.children = mergeChildren(out.children, sibling.children);
    } else if (i.match(/^\[.*\]$/)) {
      out.children.push(measureArrayAggregate(i, "array_" + idx, mode));
    } else {
      out.children.push(measurePrim(i, "prim_" + idx));
    }

    idx++;
  }

  out.children = out.children.concat(Object.values(children));
  return out;
}

// Combines two lists of children
function mergeChildren(c1, c2) {
  if (!c1 || c1.length === 0) {
    return c2;
  }

  if (!c2 || c2.length === 0) {
    return c1;
  }

  // make the ref map.
  let children = {};
  c1.map(item => {
    children[item.name] = item;
  });

  // Add the children
  c2.map(item => {
    if (children[item.name]) {
      let ref = children[item.name];
      ref.value += item.value;
      ref.children = mergeChildren(ref.children, item.children);
      children[item.name] = ref;
    }
  });

  return Object.values(children);
}

// measureObject has 2 options which can be included via the mode param:
// keys (mode = k) -> Keys are included in object lengths.
// arrays (mode = a) -> Arrays are coalesced into one object.
//
// See measure_test.js for examples.
//
// Returns D3 Flame Chart output.
//
// {
// "name": "root",
// "value": 1315,
//  "children": []
// }
//
function measureObject(s, name, mode) {
  if (!mode) {
    mode = "d"; // run in default mode
  }

  // Clean up whitespace.
  s = JSON.stringify(JSON.parse(s));

  var out = {
    name: name,
    value: s.length,
    children: []
  };

  // Handle empty objects.
  if (s === "{}") {
    return out;
  }

  let idx = 0;
  let asJson = JSON.parse(s);
  for (let k in asJson) {
    let i = JSON.stringify(asJson[k]);
    let unf;
    if (i.match(/^\{.*\}$/)) {
      unf = measureObject(i, k.toString(), mode);
    } else if (i.match(/^\[.*\]$/)) {
      if (mode.match("a")) {
        unf = measureArrayAggregate(i, k.toString(), mode);
      } else {
        unf = measureArray(i, k.toString(), mode);
      }
    } else {
      unf = measurePrim(i, k.toString());
    }

    if (mode.match("k")) {
      unf.value += JSON.stringify(k.toString()).length + 1;
    }

    out.children.push(unf);

    idx++;
  }

  return out;
}

module.exports = { measureObject };
