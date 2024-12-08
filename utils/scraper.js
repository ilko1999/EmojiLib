// Import necessary modules
const emojis = JSON.parse(fs.readFileSync("./emoji_list_urls.json", "utf-8"));
import fetch from "node-fetch";
import https from "https";
import fs from "fs";
import sharp from "sharp";

// Configure HTTPS agent to handle certificates
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const RETRY_LIMIT = 3; // Number of retry attempts for failed requests

const prefix = "data:image/png;base64,";

// Function to extract Unicode codes from a URL
function extractUnicodeCodes(url) {
  const regex = /_([0-9a-fA-F-]+)(?=(_|\.))/g;
  const matches = [...url.matchAll(regex)].flatMap((match) =>
    match[1].split("-")
  );
  return matches.map((part) => `U+${part.toUpperCase()}`).join(" ");
}

// Function to fetch an image and convert it to base64
async function getBase64(url) {
  const response = await fetch(url, {
    method: "GET",
    agent: httpsAgent,
  });
  const buffer = await response.arrayBuffer();
  return buffer;
}

// Function to fetch an image and return its buffer with retries
async function fetchWithRetries(url, retries = RETRY_LIMIT) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const response = await fetch(url, {
        method: "GET",
        agent: httpsAgent,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.arrayBuffer();
    } catch (error) {
      if (attempt === retries) {
        console.error(
          `Failed to fetch ${url} after ${retries} attempts:`,
          error
        );
        return null; // Return null instead of throwing
      }
      console.warn(`Retrying ${url} (${attempt}/${retries})...`);
    }
  }
}

// Function to convert emojis to an object containing base64 and Unicode values
async function convertEmojisToBase64(emojiObj) {
  const result = {};

  let index = 0;

  for (const [key, url] of Object.entries(emojiObj)) {
    try {
      console.log(
        `Processing ${++index}/${
          Object.keys(emojiObj).length
        } at time ${new Date().toLocaleTimeString()} for image ${key}...`
      );
      console.log(process.memoryUsage());
      const buffer = await fetchWithRetries(url);

      const compressedBuffer = await sharp(Buffer.from(buffer))
        .resize({ width: 72, height: 72 })
        .toFormat("png", { quality: 80 })
        .toBuffer();

      result[key] = {
        b64: compressedBuffer.toString("base64"),
        unicode: extractUnicodeCodes(url),
      };
    } catch (error) {
      console.error(`Error processing ${key}:`, error);
    }
  }

  return result;
}

// Function to split an object into chunks
function splitObject(obj, chunkSize) {
  const entries = Object.entries(obj);
  const chunks = [];
  for (let i = 0; i < entries.length; i += chunkSize) {
    console.log(i);
    chunks.push(Object.fromEntries(entries.slice(i, i + chunkSize)));
  }
  return chunks;
}

// Main execution function
// Sleep utility
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Updated Main Execution Function
(async () => {
  try {
    const segmentSize = 500; // Number of emojis per segment
    const emojiChunks = splitObject(emojis, segmentSize); // Split into chunks

    for (let i = 6; i < emojiChunks.length; i++) {
      console.log(`Processing segment ${i + 1}/${emojiChunks.length}...`);

      const base64Emojis = await convertEmojisToBase64(emojiChunks[i]);
      const fileName = `emojis_base64_segment_${i + 1}.json`;

      // Save results
      fs.writeFileSync(
        fileName,
        JSON.stringify({ prefix, emojis: base64Emojis }, null, 2)
      );
      console.log(`Segment ${i + 1} written to ${fileName}`);

      // Clear memory and sleep
      console.log("Clearing memory...");
      if (global.gc) {
        global.gc(); // Trigger garbage collection
        console.log("Memory cleared.");
      } else {
        console.warn(
          "Garbage collection is not exposed. Run with --expose-gc."
        );
      }

      console.log("Sleeping for 30 seconds...");
      await sleep(30000); // Sleep for 30 seconds
    }

    console.log("All segments processed successfully.");
  } catch (error) {
    console.error("An error occurred during processing:", error);
  }
})();
