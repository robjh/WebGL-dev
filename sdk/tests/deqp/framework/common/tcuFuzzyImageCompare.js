/*-------------------------------------------------------------------------
 * drawElements Quality Program OpenGL ES Utilities
 * ------------------------------------------------
 *
 * Copyright 2014 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

define(['framework/delibs/debase/deMath',
        'framework/common/tcuTexture',
        'framework/delibs/debase/deRandom',
        'framework/common/tcuTextureUtil'], function(
            deMath,
            tcuTexture,
            deRandom,
            tcuTextureUtil
            )  {
    'use strict';

    var DE_ASSERT = function(x) {
        if (!x)
            throw new Error('Assert failed');
    };

    var DE_NULL = null;

    /**
     * @constructor
     * @param {integer} maxSampleSkip_
     * @param {integer} minErrThreshold_
     * @param {float} errExp_
     */
    var FuzzyCompareParams = function(maxSampleSkip_, minErrThreshold_, errExp_) {
        this.maxSampleSkip = maxSampleSkip_ == undefined ? 8 : maxSampleSkip_;
        this.minErrThreshold = minErrThreshold_ == undefined ? 4 : minErrThreshold_;
        this.errExp = errExp_ == undefined ? 4.0 : errExp_;
    };

    /**
     * @param {integer} channel
     * @param {deUint32} color
     * @return {deUint8}
     */
    var getChannel = function(channel, color) {
        return color >> (channel*8) & 0xff;
    };

    /**
     * @param {deUint32} color
     * @param {int} channel
     * @param {deUint8} value
     * @return {deUint32}
     */
    var setChannel = function(color, channel, val) {
        // note: original line had an invalid hex number: 0xffu
        return (color & ~(0xff << (8*channel))) | (val << (8*channel));
    };
    /**
     * @param {deUint32} color
     * @return {Array<float>}
     */
    var toFloatVec = function(color) {
        return [getChannel(0, color), getChannel(1, color), getChannel(2, color), getChannel(3, color)];
    };

    /**
     * @param {float} v
     * @return {deUint8}
     */
    var roundToUint8Sat = function(v) {
        return deMath.clamp(v+0.5, 0, 255);
    };

    /**
     * @param {Array<float>} v
     * @return {deUint32}
     */
    var toColor = function(v) {
        return roundToUint8Sat(v[0]) | roundToUint8Sat(v[1]) << 8 | roundToUint8Sat(v[2]) << 16 | roundToUint8Sat(v[3]) << 24;
    };

    /**
     * @param {integer} NumChannels
     * @param {tcuTexture.ConstPixelBufferAccess} src
     * @param {integer} x
     * @param {integer} y
     * @return {deUint32}
     */
    var readUnorm8 = function(NumChannels, src, x, y) {
        /** @type {deUint8} */ var ptr = src.getDataPtr() + src.getRowPitch() * y + x * NumChannels;
        /** @type {deUint32} */ var v = 0;

        for (var c = 0; c < NumChannels; c++)
            v |= ptr[c] << (c * 8);

        if (NumChannels < 4)
            v |= 0xffu << 24;

        return v;
    };

    /**
     * @param {integer} NumChannels
     * @param {tcuTexture.PixelBufferAccess} dst
     * @param {integer} x
     * @param {integer} y
     * @param {deUint32} val
    */
    var writeUnorm8 = function(NumChannels, dst, x, y, val) {
        /** @type {deUint8} */ var ptr = dst.getDataPtr() + dst.getRowPitch() * y + x * NumChannels;

        for (var c = 0; c < NumChannels; c++)
            ptr[c] = getChannel(val, c);
    };

    /**
     * @param {deUint32} pa
     * @param {deUint32} pb
     * @param {integer} minErrThreshold
     * @return {float}
    */
    var compareColoros = function(pa, pb, minErrThreshold) {
        /** @type {integer} */ var r = Math.max(Math.abs(getChannel(0, pa) - getChannel(0, pb)) - minErrThreshold, 0);
        /** @type {integer} */ var g = Math.max(Math.abs(getChannel(1, pa) - getChannel(1, pb)) - minErrThreshold, 0);
        /** @type {integer} */ var b = Math.max(Math.abs(getChannel(2, pa) - getChannel(2, pb)) - minErrThreshold, 0);
        /** @type {integer} */ var a = Math.max(Math.abs(getChannel(3, pa) - getChannel(3, pb)) - minErrThreshold, 0);

        /** @type {float} */ var scale	= 1.0 / (255 - minErrThreshold);
        /** @type {float} */ var sqSum	= (r * r + g * g + b * b + a * a) * (scale * scale);

        return Math.sqrt(sqSum);
    };

    /**
     * @param {integer} NumChannels
     * @param {tcuTexture.ConstPixelBufferAccess} src
     * @param {float} u
     * @param {float} v
     * @return {tcuTexture.ConstPixelBufferAccess}
    */
    var bilinearSample = function(NumChannels, src, u, v) {
        /** @type {integer} */ var w = src.getWidth();
        /** @type {integer} */ var h = src.getHeight();

        /** @type {integer} */ var x0 = Math.floor(u - 0.5);
        /** @type {integer} */ var x1 = x0 + 1;
        /** @type {integer} */ var y0 = Math.floor(v - 0.5);
        /** @type {integer} */ var y1 = y0 + 1;

        /** @type {integer} */ var i0 = deMath.clamp(x0, 0, w - 1);
        /** @type {integer} */ var i1 = deMath.clamp(x1, 0, w - 1);
        /** @type {integer} */ var j0 = deMath.clamp(y0, 0, h - 1);
        /** @type {integer} */ var j1 = deMath.clamp(y1, 0, h - 1);

        /** @type {float} */ var a = (u - 0.5) - Math.floor(u - 0.5);
        /** @type {float} */ var b = (v - 0.5) - Math.floor(v - 0.5);

        /** @type {deUint32} */ var p00	= readUnorm8(NumChannels, src, i0, j0);
        /** @type {deUint32} */ var p10	= readUnorm8(NumChannels, src, i1, j0);
        /** @type {deUint32} */ var p01	= readUnorm8(NumChannels, src, i0, j1);
        /** @type {deUint32} */ var p11	= readUnorm8(NumChannels, src, i1, j1);
        /** @type {deUint32} */ var dst	= 0;

        // Interpolate.
        for (var c = 0; c < NumChannels; c++)
        {
            // getChannel(color, channel) so we have to reverse the arguments from (p00, c) to (c, p00)
            /** @type {float} */ var f = (getChannel(c, p00) * (1.0 - a) * (1.0 - b)) +
                                         (getChannel(c, p10) * (      a) * (1.0 - b)) +
                                         (getChannel(c, p01) * (1.0 - a) * (      b)) +
                                         (getChannel(c, p11) * (      a) * (      b));
            dst = setChannel(dst, c, roundToUint8Sat(f));
        }

        return dst;
    };

    /**
     * @param {integer} DstChannels
     * @param {integer} SrcChannels
     * @param {tcuTexture.PixelBufferAccess} dst
     * @param {tcuTexture.ConstPixelBufferAccess} src
     * @param {integer} shiftX
     * @param {integer} shiftY
     * @param {Array<float>} kernelX
     * @param {Array<float>} kernelY
    */
    var separableConvolve = function (DstChannels, SrcChannels, dst, src, shiftX, shiftY, kernelX, kernelY)
    {
        DE_ASSERT(dst.getWidth() == src.getWidth() && dst.getHeight() == src.getHeight());

        // TODO: implement TextureLevel
        /** @type {TextureLevel} */ var tmp = new TextureLevel(dst.getFormat(), dst.getHeight(), dst.getWidth());
        /** @type {PixelBufferAccess} */ var tmpAccess = tmp.getAccess();

        /** @type {integer} */ var kw = kernelX.size();
        /** @type {integer} */ var kh = kernelY.size();

        // Horizontal pass
        // \note Temporary surface is written in column-wise order

        for (var j = 0; j < src.getHeight(); j++)
        {
            for (var i = 0; i < src.getWidth(); i++)
            {
                /** @type {Array<float>} */ var sum = [0.0, 0.0, 0.0, 0.0];

                for (var kx = 0; kx < kw; kx++)
                {
                    /** @type {float} */ var f = kernelX[kw - kx - 1];
                    /** @type {deUint32} */ var p = readUnorm8(SrcChannels, src, deMath.clamp(i + kx - shiftX, 0, src.getWidth() - 1), j);

                    sum = deMath.add(sum, deMath.multiply(toFloatVec(p), f));
                }

                writeUnorm8(DstChannels, tmpAccess, j, i, toColor(sum));
            }
        }

        // Vertical pass
        for (var j = 0; j < src.getHeight(); j++)
        {
            for (var i = 0; i < src.getWidth(); i++)
            {
                /** @type {Array<float>} */ var sum = [0.0, 0.0, 0.0, 0.0];

                for (var ky = 0; ky < kh; ky++)
                {
                    /** @type {float} */ var f = kernelY[kh - ky - 1];
                    /** @type {deUint32} */ var = readUnorm8(DstChannels, tmpAccess, deMath.clamp(j + ky - shiftY, 0, tmp.getWidth() - 1), i);

                    sum = deMath.add(sum, deMath.multiply(toFloatVec(p), f));
                }

                writeUnorm8(DstChannels, dst, i, j, toColor(sum));
            }
        }
    };

    /**
     * @param {integer} NumChannels
     * @param {FuzzyCompareParams} params
     * @param {deRandom.Random} rnd
     * @param {deUint32 } pixel
     * @param {tcuTexture.ConstPixelBufferAccess} surrface
     * @param {integer} x
     * @param {integer} y
     * @param {Array<float>} kernelY
    */
    var compareToNeighbor = function(NumChannels, params, rnd, pixel, surface, x, y)
    {
        /** @type {float} */ var minErr = +100.0;

        // (x, y) + (0, 0)
        minErr = Math.min(minErr, compareColors(pixel, readUnorm8(NumChannels, surface, x, y), params.minErrThreshold));
        if (minErr == 0.0)
            return minErr;

        // Area around (x, y)
        /** @type {Array<Array<integer>>} */ var s_coords =
        [
            [-1, -1],
            [ 0, -1],
            [+1, -1],
            [-1,  0],
            [+1,  0],
            [-1, +1],
            [ 0, +1],
            [+1, +1]
        ];

        for (var d = 0; d < s_coords.length; d++)
        {
            /** @type {integer} */ var dx = x + s_coords[d][0];
            /** @type {integer} */ var dy = y + s_coords[d][1];

            if (!deMath.deInBounds32(dx, 0, surface.getWidth()) || !deMath.deInBounds32(dy, 0, surface.getHeight()))
                continue;

            minErr = Math.min(minErr, compareColors(pixel, readUnorm8(NumChannels, surface, dx, dy), params.minErrThreshold));
            if (minErr == 0.0)
                return minErr;
        }

        // Random bilinear-interpolated samples around (x, y)
        for (var s = 0; s < 32; s++)
        {
            /** @type {float} */ var dx = x + rnd.getFloat() * 2.0 - 0.5;
            /** @type {float} */ var dy = y + rnd.getFloat() * 2.0 - 0.5;

            /** @type {deUint32} */ var sample = bilinearSample(NumChannels, surface, dx, dy);

            minErr = Math.min(minErr, compareColors(pixel, sample, params.minErrThreshold));
            if (minErr == 0.0)
                return minErr;
        }

        return minErr;
    };

    /**
     * @param {Array<float>} c
     * @return {float}
    */
    var toGrayscale = function(c)
    {
        return 0.2126*c[0] + 0.7152*c[1] + 0.0722*c[2];
    }

    /**
     * @param {tcuTexture.TextureFormat} format
     * @return {boolean}
    */
    var isFormatSupported = function(format)
    {
        return format.type == tcuTexture.ChannelType.UNORM_INT8 && (format.order == tcuTexture.ChannelOrder.RGB || format.order == tcuTexture.ChannelOrder.RGBA);
    }

    /**
     * @param {FuzzyCompareParams} params
     * @param {tcuTexture.ConstPixelBufferAccess} ref
     * @param {tcuTexture.ConstPixelBufferAccess} cmp
     * @param {tcuTexture.PixelBufferAccess} errorMask
     * @return {float}
    */
    float fuzzyCompare (params, ref, cmp, errorMask)
    {
        DE_ASSERT(ref.getWidth() == cmp.getWidth() && ref.getHeight() == cmp.getHeight());
        DE_ASSERT(errorMask.getWidth() == ref.getWidth() && errorMask.getHeight() == ref.getHeight());

        if (!isFormatSupported(ref.getFormat()) || !isFormatSupported(cmp.getFormat()))
            throw new Error("Unsupported format in fuzzy comparison");

        /** @type {integer} */ var width = ref.getWidth();
        /** @type {integer} */ var height = ref.getHeight();
        /** @type {deRandom.Random} */ var rnd (667);

        // Filtered
        /** @type {TextureLevel} */ var refFiltered = new TextureLevel(TextureFormat(tcuTexture.ChannelOrder.RGBA, tcuTexture.ChannelType.UNORM_INT8), width, height);
        /** @type {TextureLevel} */ var cmpFiltered = new TextureLevel(TextureFormat(tcuTexture.ChannelOrder.RGBA, tcuTexture.ChannelType.UNORM_INT8), width, height);

        // Kernel = {0.15, 0.7, 0.15}
        /** @type {Array<float>} */ var kernel = [0, 0, 0];
        kernel[0] = kernel[2] = 0.1; kernel[1]= 0.8;
        /** @type {integer} */ var shift = Math.floor((kernel.length - 1) / 2);

        switch (ref.getFormat().order)
        {
            case tcuTexture.ChannelOrder.RGBA: separableConvolve(4, 4, refFiltered, ref, shift, shift, kernel, kernel); break;
            case tcuTexture.ChannelOrder.RGB: separableConvolve(4, 3, refFiltered, ref, shift, shift, kernel, kernel); break;
            default:
                DE_ASSERT(DE_FALSE);
        }

        switch (cmp.getFormat().order)
        {
            case tcuTexture.ChannelOrder.RGBA: separableConvolve(4, 4, cmpFiltered, cmp, shift, shift, kernel, kernel); break;
            case tcuTexture.ChannelOrder.RGB: separableConvolve(4, 3, cmpFiltered, cmp, shift, shift, kernel, kernel); break;
            default:
                DE_ASSERT(DE_FALSE);
        }

        /** @type {integer} */ var numSamples = 0;
        /** @type {float} */ var errSum = 0.0;

        // Clear error mask to green.
        // TODO: implement clear()
        tcuTextureUtil.clear(errorMask, [0.0, 1.0, 0.0, 1.0]);

        /** @type {ConstPixelBufferAccess} */ var refAccess = refFiltered.getAccess();
        /** @type {ConstPixelBufferAccess} */ var cmpAccess = cmpFiltered.getAccess();

        for (var y = 1; y < height - 1; y++)
        {
            for (var x = 1; x < width - 1; x += params.maxSampleSkip > 0 ? rnd.getInt(0, params.maxSampleSkip) : 1)
            {
                /** @type {float} */ var err = Math.min(
                                       compareToNeighbor(4, params, rnd, readUnorm8(4, refAccess, x, y), cmpAccess, x, y),
                                       compareToNeighbor(4, params, rnd, readUnorm8(4, cmpAccess, x, y), refAccess, x, y));

                err = Math.pow(err, params.errExp);

                errSum += err;
                numSamples += 1;

                // Build error image.
                /** @type {float} */ var red = err * 500.0;
                /** @type {float} */ var luma = toGrayscale(cmp.getPixel(x, y));
                /** @type {float} */ var rF = 0.7 + 0.3 * luma;
                errorMask.setPixel([red * rF, (1.0 - red) * rF, 0.0, 1.0], x, y);
            }
        }

        // Scale error sum based on number of samples taken
        errSum *= ((width - 2) * (height - 2)) / numSamples;

        return errSum;
    }
});
