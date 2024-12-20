import { expect } from "chai";
import sinon from "sinon";
import fs from "fs";
import zlib from "zlib";
import emojiUtils from "../index.js";

describe("Emoji Utilities", () => {
  let mockEmojis;
  let mockPrefix;

  before(async () => {
    // Mock emoji data
    mockEmojis = {
      smile: {
        unicode: "1F600",
        b64: "base64string1",
      },
      heart: {
        unicode: "2764",
        b64: "base64string2",
      },
      star: {
        unicode: "2B50",
        b64: "base64string3",
      },
    };

    mockPrefix = "data:image/png;base64,";

    // Mock file system and zlib
    const mockJsonData = { emojis: mockEmojis, prefix: mockPrefix };
    const mockBuffer = Buffer.from(JSON.stringify(mockJsonData));

    sinon.stub(fs.promises, "readFile").resolves(mockBuffer);
    sinon.stub(zlib, "gunzip").callsFake((buffer, callback) => {
      callback(null, buffer);
    });
  });

  after(() => {
    sinon.restore();
  });

  describe("getEmojiByName", () => {
    it("should return correct base64 string for valid emoji name", async () => {
      const emoji = await emojiUtils.getEmojiByName("grinning-face");
      expect(emoji);
    });

    it("should return null for invalid emoji name", async () => {
      const emoji = await emojiUtils.getEmojiByName("invalid_emoji");
      expect(emoji).to.be.null;
    });

    it("should handle empty string input", async () => {
      const emoji = await emojiUtils.getEmojiByName("");
      expect(emoji).to.be.null;
    });
  });

  describe("getEmojiByUnicode", () => {
    it("should return correct base64 string for valid unicode", async () => {
      const emoji = await emojiUtils.getEmojiByUnicode("U+1F600");
      expect(emoji);
    });

    it("should return null for invalid unicode", async () => {
      const emoji = await emojiUtils.getEmojiByUnicode("INVALID");
      expect(emoji).to.be.null;
    });

    it("should handle empty string input", async () => {
      const emoji = await emojiUtils.getEmojiByUnicode("");
      expect(emoji).to.be.null;
    });
  });

  describe("getAllEmojis", () => {
    it("should return all emoji data", async () => {
      const allEmojis = await emojiUtils.getAllEmojis();
      expect(allEmojis).to.deep.equal(mockEmojis);
    });

    it("should return an object with expected properties", async () => {
      const allEmojis = await emojiUtils.getAllEmojis();
      expect(allEmojis).to.be.an("object");
      expect(Object.keys(allEmojis)).to.be(3960);
    });
  });

  describe("getLengthOfAllEmojis", () => {
    it("should return correct number of emojis", async () => {
      const length = await emojiUtils.getLengthOfAllEmojis();
      expect(length).to.equal(Object.keys(mockEmojis).length);
    });
  });

  describe("Error Handling", () => {
    beforeEach(() => {
      sinon.restore();
    });

    it("should handle file read errors", async () => {
      sinon.stub(fs.promises, "readFile").rejects(new Error("File read error"));

      try {
        await emojiUtils.getEmojiByName("smile");
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).to.include("File read error");
      }
    });

    it("should handle decompression errors", async () => {
      sinon.stub(fs.promises, "readFile").resolves(Buffer.from("test"));
      sinon.stub(zlib, "gunzip").callsFake((buffer, callback) => {
        callback(new Error("Decompression error"));
      });

      try {
        await emojiUtils.getEmojiByName("smile");
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).to.include("Decompression error");
      }
    });

    it("should handle invalid JSON data", async () => {
      sinon.stub(fs.promises, "readFile").resolves(Buffer.from("invalid json"));
      sinon.stub(zlib, "gunzip").callsFake((buffer, callback) => {
        callback(null, buffer);
      });

      try {
        await emojiUtils.getEmojiByName("smile");
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).to.include("JSON");
      }
    });
  });

  describe("Performance", () => {
    it("should handle large number of lookups efficiently", async () => {
      const startTime = process.hrtime();

      const promises = Array(1000)
        .fill()
        .map(() => emojiUtils.getEmojiByName("smile"));

      await Promise.all(promises);

      const [seconds, nanoseconds] = process.hrtime(startTime);
      const totalTime = seconds * 1000 + nanoseconds / 1000000; // Convert to milliseconds

      expect(totalTime).to.be.below(1000); // Should complete within 1 second
    });
  });
});
