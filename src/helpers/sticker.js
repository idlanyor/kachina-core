import { Sticker, StickerTypes } from 'wa-sticker-formatter';

/**
 * @typedef {Object} StickerOptions
 * @property {string} [pack='Sticker'] - Sticker pack name
 * @property {string} [author='Kachina Bot'] - Sticker author name
 * @property {string} [type] - Sticker type (DEFAULT, FULL, CROPPED, CIRCLE, ROUNDED)
 * @property {Array<string>} [categories=[]] - Sticker categories
 * @property {string} [id=''] - Sticker ID
 * @property {number} [quality=50] - Image quality (1-100)
 * @property {string} [background='transparent'] - Background color
 */

/**
 * Create sticker from image/video buffer
 * @async
 * @param {Buffer|string} buffer - Image or video buffer, or file path/URL
 * @param {StickerOptions} [options={}] - Sticker configuration options
 * @returns {Promise<Buffer>} Sticker buffer ready to send
 * @example
 * const stickerBuffer = await createSticker(imageBuffer, {
 *   pack: 'My Stickers',
 *   author: 'My Bot',
 *   type: StickerTypes.FULL
 * });
 */
export async function createSticker(buffer, options = {}) {
    const sticker = new Sticker(buffer, {
        pack: options.pack || 'Sticker',
        author: options.author || 'Kachina Bot',
        type: options.type || StickerTypes.DEFAULT,
        categories: options.categories || [],
        id: options.id || '',
        quality: options.quality || 50,
        background: options.background || 'transparent'
    });

    return await sticker.toBuffer();
}

/**
 * Create full sticker without cropping (preserves original aspect ratio)
 * @async
 * @param {Buffer|string} buffer - Image or video buffer, or file path/URL
 * @param {StickerOptions} [options={}] - Sticker configuration options
 * @returns {Promise<Buffer>} Full sticker buffer
 * @example
 * const sticker = await createFullSticker(imageBuffer, {
 *   pack: 'My Pack',
 *   author: 'Bot'
 * });
 */
export async function createFullSticker(buffer, options = {}) {
    return await createSticker(buffer, {
        ...options,
        type: StickerTypes.FULL
    });
}

/**
 * Create cropped sticker (1:1 aspect ratio, center-cropped)
 * @async
 * @param {Buffer|string} buffer - Image or video buffer, or file path/URL
 * @param {StickerOptions} [options={}] - Sticker configuration options
 * @returns {Promise<Buffer>} Cropped sticker buffer
 * @example
 * const sticker = await createCroppedSticker(imageBuffer);
 */
export async function createCroppedSticker(buffer, options = {}) {
    return await createSticker(buffer, {
        ...options,
        type: StickerTypes.CROPPED
    });
}

/**
 * Create circle-shaped sticker
 * @async
 * @param {Buffer|string} buffer - Image or video buffer, or file path/URL
 * @param {StickerOptions} [options={}] - Sticker configuration options
 * @returns {Promise<Buffer>} Circle sticker buffer
 * @example
 * const sticker = await createCircleSticker(profilePicBuffer);
 */
export async function createCircleSticker(buffer, options = {}) {
    return await createSticker(buffer, {
        ...options,
        type: StickerTypes.CIRCLE
    });
}

/**
 * Create sticker with rounded corners
 * @async
 * @param {Buffer|string} buffer - Image or video buffer, or file path/URL
 * @param {StickerOptions} [options={}] - Sticker configuration options
 * @returns {Promise<Buffer>} Rounded sticker buffer
 * @example
 * const sticker = await createRoundedSticker(imageBuffer);
 */
export async function createRoundedSticker(buffer, options = {}) {
    return await createSticker(buffer, {
        ...options,
        type: StickerTypes.ROUNDED
    });
}

export { StickerTypes };

export default {
    createSticker,
    createFullSticker,
    createCroppedSticker,
    createCircleSticker,
    createRoundedSticker,
    StickerTypes
};
