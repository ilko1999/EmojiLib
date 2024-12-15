import fs from "fs";
import zlib from "zlib";

// function compressFile(inputPath, outputPath) {
//   const input = fs.createReadStream(inputPath);
//   const output = fs.createWriteStream(outputPath);
//   const gzip = zlib.createGzip();

//   input.pipe(gzip).pipe(output);

//   output.on("finish", () => {
//     console.log(`File compressed: ${outputPath}`);
//   });
// }

function readCompressedJson(filePath) {
  return new Promise((resolve, reject) => {
    const gunzip = zlib.createGunzip();
    const input = fs.createReadStream(filePath);
    let jsonString = "";

    input
      .pipe(gunzip)
      .on("data", (chunk) => {
        jsonString += chunk.toString();
      })
      .on("end", () => {
        try {
          const jsonData = JSON.parse(jsonString); // Parse JSON
          resolve(jsonData);
        } catch (err) {
          reject(new Error("Error parsing JSON: " + err.message));
        }
      })
      .on("error", reject);
  });
}

const emj1 = await readCompressedJson("./utils/emojisBase64Segment1.json.gz");
const emj2 = await readCompressedJson("./utils/emojisBase64Segment2.json.gz");
const emj3 = await readCompressedJson("./utils/emojisBase64Segment3.json.gz");
const emj4 = await readCompressedJson("./utils/emojisBase64Segment4.json.gz");
const emj5 = await readCompressedJson("./utils/emojisBase64Segment5.json.gz");
const emj6 = await readCompressedJson("./utils/emojisBase64Segment6.json.gz");
const emj7 = await readCompressedJson("./utils/emojisBase64Segment7.json.gz");
const emj8 = await readCompressedJson("./utils/emojisBase64Segment8.json.gz");

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

// const unicode = "U+1F600";
// const name = "grinning-face";

// console.log(emojiFuncs.getEmojiByUnicode(unicode)); // Prints base64 string of the emoji
// console.log(emojiFuncs.getEmojiByName(name)); // Prints base64 string of the emoji
