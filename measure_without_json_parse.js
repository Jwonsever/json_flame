// TODO: This does not work for all json objects.  It will trip over any strings
// with special characters, particularly {}[]", characters.   I need a "safe split"
// function to safely escape those things.
//
// It may be completely  broken, I gave up fixing it halfway through.  The goal is to
// accurately measure the spaces that get trimmed out when using JSON.parse and JSON.stringify.

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
function measureArray(s, name) {
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

  for (let i = startIndex; i < s.length; i++) {
    // Array of Arrays
    if (s.charAt(i) === "[") {
      type = "array";
      child = measureArray(s.substring(i, s.length - 1), "array_" + iterator);
      out.children.push(child);
      i += closingBracket(s.substring(i, s.length - 1));
      iterator++;
    }
    // Array of Objects
    if (s.charAt(i) === "{") {
      type = "object";
      var child = measureObject(
        s.substring(i, s.length - 1),
        "object_" + iterator
      );
      out.children.push(child);
      i += child.value;
      iterator++;
    }
    // Array of Primitives
    if ((s.charAt(i) === "," || s.charAt(i) === "]") && type === "primative") {
      var child = {
        name: "primitive" + iterator,
        value: i - startIndex
      };
      out.children.push(child);
      startIndex = i;
      iterator++;
    }
    // End of Array
    if (s.charAt(i) === "]") {
      out.value = i + 1;
      return out;
    }
  }

  return out;
}

function closingBracket(s) {
  var net = 1;
  for (let i = 1; i < s.length; i++) {
    if (s.charAt(i) === "[") {
      net++;
    }
    if (s.charAt(i) === "]") {
      net--;
    }
    if (net === 0) {
      return i + 1;
    }
  }
}

// measureObject has 3 modes:
// default (mode = d) -> Keys are not included in object lengths.
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

  // We know it starts with a {
  for (let i = s.indexOf("{") + 1; i < s.length; i++) {
    if (s.charAt(i) === '"' && quoteIndex === -1) {
      quoteIndex = i;
    } else if (s.charAt(i) === '"' && quoteIndex > 0 && endQuoteIndex === -1) {
      endQuoteIndex = i;
    } else if (s.charAt(i) === ":" && endQuoteIndex > 0 && colonIndex === -1) {
      // Mark the colon for the start of normal objects
      colonIndex = i;
    }

    // Once we have the prefix, we know what we have.
    if (s.charAt(i) === "[" && endQuoteIndex > 0) {
      // I'm an array, its like an object
      var child = measureArray(
        s.substring(i, s.length - 1),
        s.substring(quoteIndex + 1, endQuoteIndex)
      );
      out.children.push(child);

      // skip over the arrays length
      c = closingBracket(s.substring(i, s.length - 1));
      i += c;

      // Clear the quotes for the next object
      quoteIndex = -1;
      endQuoteIndex = -1;
      colonIndex = -1;
    }
    if (s.charAt(i) === "{" && endQuoteIndex > 0) {
      var child = measure(
        s.substring(i, s.length - 1),
        s.substring(quoteIndex + 1, endQuoteIndex)
      );
      out.children.push(child);
      i += child.value;

      // Clear the quotes for the next object
      quoteIndex = -1;
      endQuoteIndex = -1;
      colonIndex = -1;
    }

    // This was just a primitive, it took up the space after :
    if ((s.charAt(i) === "," || s.charAt(i) === "}") && endQuoteIndex > 0) {
      var child = {
        name: s.substring(quoteIndex + 1, endQuoteIndex),
        value: i - colonIndex
      };
      out.children.push(child);

      // Clear the quotes for the next object
      quoteIndex = -1;
      endQuoteIndex = -1;
      colonIndex = -1;
    }

    //Hit the end.
    if (s.charAt(i) === "}") {
      out.value = i + 1;
      return out;
    }
  }

  return out;
}

module.exports = { measureObject };
