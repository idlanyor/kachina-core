# Changelog

## [1.0.0] - 2024-11-09

### Added

#### Media Support
- ✅ `sendImage()` - Send image with caption and options
- ✅ `sendVideo()` - Send video with caption and GIF support
- ✅ `sendAudio()` - Send audio files and voice notes (PTT)
- ✅ `sendDocument()` - Send documents with filename and mimetype
- ✅ `sendSticker()` - Send sticker buffers
- ✅ `sendContact()` - Send contact cards (vCard)
- ✅ `sendLocation()` - Send location coordinates
- ✅ `sendPoll()` - Send polls with multiple options
- ✅ `sendReact()` - Send reactions to messages

#### Sticker Utilities
- ✅ `createSticker()` - Create sticker from image/video buffer
- ✅ `createFullSticker()` - Create full-size sticker
- ✅ `createCroppedSticker()` - Create cropped sticker
- ✅ `createCircleSticker()` - Create circle-shaped sticker
- ✅ `createRoundedSticker()` - Create rounded corner sticker
- ✅ `StickerTypes` - Sticker type constants

#### Dependencies
- ✅ `wa-sticker-formatter` - Sticker creation support
- ✅ `sharp` - Image processing
- ✅ `axios` - HTTP client for media downloads

#### Example Plugins
- ✅ `sticker.js` - Complete sticker creation plugin with all types
- ✅ `toimage.js` - Convert sticker to image
- ✅ `media.js` - Comprehensive media sending examples

#### Documentation
- ✅ `MEDIA_GUIDE.md` - Complete guide for working with media
- ✅ Updated `README.md` with media methods
- ✅ Updated exports in `src/index.js`

### Enhanced

#### Client Class
- Enhanced `sendImage()` with better options handling
- Enhanced `sendVideo()` with GIF playback support
- Enhanced `sendAudio()` with PTT (voice note) support
- Added proper option spreading for all media methods

#### Message Serialization
- Improved media type detection
- Better quoted message handling
- Enhanced download functionality

### Fixed
- Fixed option parameters in send methods
- Improved error handling for media operations

---

## Usage Examples

### Send Image
```javascript
await client.sendImage(jid, buffer, 'Caption', {
    quoted: msg,
    mentions: [jid1]
});
```

### Create Sticker
```javascript
import { createSticker, StickerTypes } from '@kachina-md/core';

const sticker = await createSticker(imageBuffer, {
    pack: 'My Pack',
    author: 'Me',
    type: StickerTypes.FULL
});

await client.sendSticker(jid, sticker);
```

### Send Voice Note
```javascript
await client.sendAudio(jid, buffer, {
    ptt: true,
    mimetype: 'audio/ogg; codecs=opus'
});
```

### Send Poll
```javascript
await client.sendPoll(jid, 'Choose color:', ['Red', 'Blue', 'Green']);
```

See `MEDIA_GUIDE.md` for complete documentation.
