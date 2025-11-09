import { Sticker, StickerTypes } from 'wa-sticker-formatter';

/**
 * Create sticker from image/video buffer
 * @param {Buffer} buffer - Image or video buffer
 * @param {Object} options - Sticker options
 * @returns {Promise<Buffer>} Sticker buffer
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
 * Create full sticker (no crop)
 */
export async function createFullSticker(buffer, options = {}) {
    return await createSticker(buffer, {
        ...options,
        type: StickerTypes.FULL
    });
}

/**
 * Create cropped sticker
 */
export async function createCroppedSticker(buffer, options = {}) {
    return await createSticker(buffer, {
        ...options,
        type: StickerTypes.CROPPED
    });
}

/**
 * Create circle sticker
 */
export async function createCircleSticker(buffer, options = {}) {
    return await createSticker(buffer, {
        ...options,
        type: StickerTypes.CIRCLE
    });
}

/**
 * Create rounded sticker
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
