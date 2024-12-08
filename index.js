import fs from "fs";

const emj1 = JSON.parse(
  fs.readFileSync("./utils/emojisBase64Segment1.json", "utf-8")
);
const emj2 = JSON.parse(
  fs.readFileSync("./utils/emojisBase64Segment2.json", "utf-8")
);
const emj3 = JSON.parse(
  fs.readFileSync("./utils/emojisBase64Segment3.json", "utf-8")
);
const emj4 = JSON.parse(
  fs.readFileSync("./utils/emojisBase64Segment4.json", "utf-8")
);
const emj5 = JSON.parse(
  fs.readFileSync("./utils/emojisBase64Segment5.json", "utf-8")
);
const emj6 = JSON.parse(
  fs.readFileSync("./utils/emojisBase64Segment6.json", "utf-8")
);
const emj7 = JSON.parse(
  fs.readFileSync("./utils/emojisBase64Segment7.json", "utf-8")
);
const emj8 = JSON.parse(
  fs.readFileSync("./utils/emojisBase64Segment8.json", "utf-8")
);

const segmentedEmojis = {
  ...emj1.emojis,
  ...emj2.emojis,
  ...emj3.emojis,
  ...emj4.emojis,
  ...emj5.emojis,
  ...emj6.emojis,
  ...emj7.emojis,
  ...emj8.emojis,
};

const prefix = emj1.prefix;

const emojiFuncs = {
  // Function to get base64 of emoji by Unicode
  getEmojiByUnicode(unicode) {
    for (const [key, value] of Object.entries(segmentedEmojis)) {
      if (value.unicode === unicode) {
        return `${prefix}${value.b64}`;
      }
    }
    return null; // Return null if not found
  },

  // Function to get base64 of emoji by name
  getEmojiByName(name) {
    if (segmentedEmojis[name]) {
      return `${prefix}${segmentedEmojis[name].b64}`;
    }
    return null; // Return null if not found
  },
  getAllEmojis() {
    return segmentedEmojis;
  },
};

export default emojiFuncs;

const unicode = "U+1F600";
const name = "grinning-face";

console.log(emojiFuncs.getEmojiByUnicode(unicode)); // Prints base64 string of the emoji
console.log(emojiFuncs.getEmojiByName(name)); // Prints base64 string of the emoji
