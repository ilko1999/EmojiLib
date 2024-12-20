# Emoji Library

This library provides a simple way to work with a large collection of emojis in Base64 format. It includes functions to retrieve emojis by their Unicode or name and access the entire emoji dataset.

## Features

- **Retrieve Emoji by Unicode**: Fetch a Base64-encoded emoji using its Unicode representation.
- **Retrieve Emoji by Name**: Fetch a Base64-encoded emoji using its descriptive name.
- **Access All Emojis**: Get the entire emoji dataset in one object. (WIP 🚧)

## Installation

1. Clone the repository or download the source files.
2. Ensure the `utils` folder contains the segmented emoji JSON files:

##### utils/emojisBase64Segment1.json.gz utils/emojisBase64Segment2.json.gz ... utils/emojisBase64Segment8.json.gz

3. Import the library in your project:

```javascript
import emojiUtils from "emoji-lib-4-js";
```

## Usage

The library provides a simple interface for retrieving emojis by their Unicode or name. It also includes a function to access the entire emoji dataset.

### Retrieving Emojis by Unicode

To retrieve an emoji by its Unicode representation, use the `getEmojiByUnicode` function. It takes a single argument, which is the Unicode representation of the emoji. The function returns a Base64-encoded string of the emoji if it is found in the dataset, or `null` if not.

```javascript
const unicode = "U+1F600"; // Unicode representation of the emoji
const name = "grinning-face"; // Descriptive name of the emoji

console.log(await emojiUtils.getEmojiByUnicode(unicode)); // Prints base64 string of the emoji
console.log(await emojiUtils.getEmojiByName(name)); // Prints base64 string of the emoji
```

## Emoji Dataset Structure

The emoji dataset is stored in a JSON object with the following structure:

```json
{
  "grinning-face": {
    unicode: "U+1F600",
    b64: "<string>",
  },
```

Note that the `b64` property contains the Base64-encoded emoji image.

## License
