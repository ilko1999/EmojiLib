import fs from "fs";
import zlib from "zlib";
import { promisify } from "util";

const gunzipAsync = promisify(zlib.gunzip);

async function readCompressedJson(filePath) {
  try {
    const compressedData = await fs.promises.readFile(filePath);
    const decompressedData = await gunzipAsync(compressedData);
    return JSON.parse(decompressedData.toString());
  } catch (err) {
    throw new Error(`Error processing ${filePath}: ${err.message}`);
  }
}

async function loadEmojiData() {
  const segmentPaths = Array.from(
    { length: 8 },
    (_, i) => `./utils/emojisBase64Segment${i + 1}.json.gz`
  );

  try {
    const segments = await Promise.all(
      segmentPaths.map((path) => readCompressedJson(path))
    );

    const segmentedEmojis = segments.reduce(
      (acc, segment) => ({
        ...acc,
        ...segment.emojis,
      }),
      {}
    );

    return {
      emojis: segmentedEmojis,
      prefix: segments[0].prefix,
    };
  } catch (err) {
    throw new Error(`Failed to load emoji data: ${err.message}`);
  }
}

// Initialize the data and maps
let emojisData = null;
let unicodeMap = null;

// Initialization function
async function initialize() {
  if (emojisData === null) {
    const { emojis, prefix } = await loadEmojiData();
    emojisData = { emojis, prefix };
    unicodeMap = new Map(
      Object.entries(emojis).map(([name, data]) => [
        data.unicode,
        { name, ...data },
      ])
    );
  }
  return emojisData;
}

// Individual utility functions
export async function getEmojiByUnicode(unicode) {
  await initialize();
  const emoji = unicodeMap.get(unicode);
  return emoji ? `${emojisData.prefix}${emoji.b64}` : null;
}

export async function getEmojiByName(name) {
  await initialize();
  const emoji = emojisData.emojis[name];
  return emoji ? `${emojisData.prefix}${emoji.b64}` : null;
}

export async function getAllEmojis() {
  await initialize();
  return emojisData.emojis;
}

export async function getLengthOfAllEmojis() {
  await initialize();
  return Object.keys(emojisData.emojis).length;
}

// Default export with all methods
const emojiUtils = {
  getEmojiByUnicode,
  getEmojiByName,
  getAllEmojis,
  getLengthOfAllEmojis,
  initialize, // Expose initialize for those who want to preload data
};

export default emojiUtils;

console.log(await emojiUtils.getLengthOfAllEmojis());
