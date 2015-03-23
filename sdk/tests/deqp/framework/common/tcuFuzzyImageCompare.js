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
        'framework/delibs/debase/deRandom'], function(
            deMath,
            tcuTexture,
            deRandom
            )  {
    'use strict';

    var DE_ASSERT = function(x) {
        if (!x)
            throw new Error('Assert failed');
    };


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
        // TODO: implement
        /*
        const deUint8*	ptr	= (const deUint8*)src.getDataPtr() + src.getRowPitch()*y + x*NumChannels;
        deUint32		v	= 0;

        for (int c = 0; c < NumChannels; c++)
            v |= ptr[c] << (c*8);

        if (NumChannels < 4)
            v |= 0xffu << 24;

        return v;
        */
    };

    /**
     * @param {integer} NumChannels
     * @param {tcuTexture.PixelBufferAccess} dst
     * @param {integer} x
     * @param {integer} y
     * @param {deUint32} val
    */
    var writeUnorm8 = function(NumChannels, dst, x, y, val) {
        // TODO: implement
        // deUint8* ptr = (deUint8*)dst.getDataPtr() + dst.getRowPitch()*y + x*NumChannels;
        //
        // for (int c = 0; c < NumChannels; c++)
        //     ptr[c] = getChannel(val, c);
    };

    /**
     * @param {deUint32} pa
     * @param {deUint32} pb
     * @param {integer} minErrThreshold
     * @return {float}
    */
    var compareColoros = function(pa, pb, minErrThreshold) {
        // TODO: implement
        // int r = de::max<int>(de::abs((int)getChannel<0>(pa) - (int)getChannel<0>(pb)) - minErrThreshold, 0);
        // int g = de::max<int>(de::abs((int)getChannel<1>(pa) - (int)getChannel<1>(pb)) - minErrThreshold, 0);
        // int b = de::max<int>(de::abs((int)getChannel<2>(pa) - (int)getChannel<2>(pb)) - minErrThreshold, 0);
        // int a = de::max<int>(de::abs((int)getChannel<3>(pa) - (int)getChannel<3>(pb)) - minErrThreshold, 0);
        //
        // float scale	= 1.0f/(255-minErrThreshold);
        // float sqSum	= (float)(r*r + g*g + b*b + a*a) * (scale*scale);
        //
        // return deFloatSqrt(sqSum);
    };

    /**
     * @param {integer} NumChannels
     * @param {tcuTexture.ConstPixelBufferAccess} src
     * @param {float} u
     * @param {float} v
     * @return {tcuTexture.ConstPixelBufferAccess}
    */
    var bilinearSample = function(NumChannels, src, u, v) {
        // TODO: implement
        // int w = src.getWidth();
        // int h = src.getHeight();
        //
        // int x0 = deFloorFloatToInt32(u-0.5f);
        // int x1 = x0+1;
        // int y0 = deFloorFloatToInt32(v-0.5f);
        // int y1 = y0+1;
        //
        // int i0 = de::clamp(x0, 0, w-1);
        // int i1 = de::clamp(x1, 0, w-1);
        // int j0 = de::clamp(y0, 0, h-1);
        // int j1 = de::clamp(y1, 0, h-1);
        //
        // float a = deFloatFrac(u-0.5f);
        // float b = deFloatFrac(v-0.5f);
        //
        // deUint32 p00	= readUnorm8<NumChannels>(src, i0, j0);
        // deUint32 p10	= readUnorm8<NumChannels>(src, i1, j0);
        // deUint32 p01	= readUnorm8<NumChannels>(src, i0, j1);
        // deUint32 p11	= readUnorm8<NumChannels>(src, i1, j1);
        // deUint32 dst	= 0;
        //
        // // Interpolate.
        // for (int c = 0; c < NumChannels; c++)
        // {
        //     float f = (getChannel(p00, c)*(1.0f-a)*(1.0f-b)) +
        //               (getChannel(p10, c)*(     a)*(1.0f-b)) +
        //               (getChannel(p01, c)*(1.0f-a)*(     b)) +
        //               (getChannel(p11, c)*(     a)*(     b));
        //     dst = setChannel(dst, c, roundToUint8Sat(f));
        // }
        //
        // return dst;
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
        // TODO: implement
        // DE_ASSERT(dst.getWidth() == src.getWidth() && dst.getHeight() == src.getHeight());
        //
        // TextureLevel		tmp			(dst.getFormat(), dst.getHeight(), dst.getWidth());
        // PixelBufferAccess	tmpAccess	= tmp.getAccess();
        //
        // int kw = (int)kernelX.size();
        // int kh = (int)kernelY.size();
        //
        // // Horizontal pass
        // // \note Temporary surface is written in column-wise order
        // for (int j = 0; j < src.getHeight(); j++)
        // {
        //     for (int i = 0; i < src.getWidth(); i++)
        //     {
        //         Vec4 sum(0);
        //
        //         for (int kx = 0; kx < kw; kx++)
        //         {
        //             float		f = kernelX[kw-kx-1];
        //             deUint32	p = readUnorm8<SrcChannels>(src, de::clamp(i+kx-shiftX, 0, src.getWidth()-1), j);
        //
        //             sum += toFloatVec(p)*f;
        //         }
        //
        //         writeUnorm8<DstChannels>(tmpAccess, j, i, toColor(sum));
        //     }
        // }
        //
        // // Vertical pass
        // for (int j = 0; j < src.getHeight(); j++)
        // {
        //     for (int i = 0; i < src.getWidth(); i++)
        //     {
        //         Vec4 sum(0.0f);
        //
        //         for (int ky = 0; ky < kh; ky++)
        //         {
        //             float		f = kernelY[kh-ky-1];
        //             deUint32	p = readUnorm8<DstChannels>(tmpAccess, de::clamp(j+ky-shiftY, 0, tmp.getWidth()-1), i);
        //
        //             sum += toFloatVec(p)*f;
        //         }
        //
        //         writeUnorm8<DstChannels>(dst, i, j, toColor(sum));
        //     }
        // }
    }

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
        // TODO: implement
        // float minErr = +100.f;
        //
        // // (x, y) + (0, 0)
        // minErr = deFloatMin(minErr, compareColors(pixel, readUnorm8<NumChannels>(surface, x, y), params.minErrThreshold));
        // if (minErr == 0.0f)
        //     return minErr;
        //
        // // Area around (x, y)
        // static const int s_coords[][2] =
        // {
        //     {-1, -1},
        //     { 0, -1},
        //     {+1, -1},
        //     {-1,  0},
        //     {+1,  0},
        //     {-1, +1},
        //     { 0, +1},
        //     {+1, +1}
        // };
        //
        // for (int d = 0; d < (int)DE_LENGTH_OF_ARRAY(s_coords); d++)
        // {
        //     int dx = x + s_coords[d][0];
        //     int dy = y + s_coords[d][1];
        //
        //     if (!deInBounds32(dx, 0, surface.getWidth()) || !deInBounds32(dy, 0, surface.getHeight()))
        //         continue;
        //
        //     minErr = deFloatMin(minErr, compareColors(pixel, readUnorm8<NumChannels>(surface, dx, dy), params.minErrThreshold));
        //     if (minErr == 0.0f)
        //         return minErr;
        // }
        //
        // // Random bilinear-interpolated samples around (x, y)
        // for (int s = 0; s < 32; s++)
        // {
        //     float dx = (float)x + rnd.getFloat()*2.0f - 0.5f;
        //     float dy = (float)y + rnd.getFloat()*2.0f - 0.5f;
        //
        //     deUint32 sample = bilinearSample<NumChannels>(surface, dx, dy);
        //
        //     minErr = deFloatMin(minErr, compareColors(pixel, sample, params.minErrThreshold));
        //     if (minErr == 0.0f)
        //         return minErr;
        // }
        //
        // return minErr;
    }

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
        // TODO: implement
        //return format.type == TextureFormat::UNORM_INT8 && (format.order == TextureFormat::RGB || format.order == TextureFormat::RGBA);
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
        // TODO: implement
        // DE_ASSERT(ref.getWidth() == cmp.getWidth() && ref.getHeight() == cmp.getHeight());
        // DE_ASSERT(errorMask.getWidth() == ref.getWidth() && errorMask.getHeight() == ref.getHeight());
        //
        // if (!isFormatSupported(ref.getFormat()) || !isFormatSupported(cmp.getFormat()))
        //     throw InternalError("Unsupported format in fuzzy comparison", DE_NULL, __FILE__, __LINE__);
        //
        // int			width	= ref.getWidth();
        // int			height	= ref.getHeight();
        // de::Random	rnd		(667);
        //
        // // Filtered
        // TextureLevel refFiltered(TextureFormat(TextureFormat::RGBA, TextureFormat::UNORM_INT8), width, height);
        // TextureLevel cmpFiltered(TextureFormat(TextureFormat::RGBA, TextureFormat::UNORM_INT8), width, height);
        //
        // // Kernel = {0.15, 0.7, 0.15}
        // vector<float> kernel(3);
        // kernel[0] = kernel[2] = 0.1f; kernel[1]= 0.8f;
        // int shift = (int)(kernel.size() - 1) / 2;
        //
        // switch (ref.getFormat().order)
        // {
        //     case TextureFormat::RGBA:	separableConvolve<4, 4>(refFiltered, ref, shift, shift, kernel, kernel);	break;
        //     case TextureFormat::RGB:	separableConvolve<4, 3>(refFiltered, ref, shift, shift, kernel, kernel);	break;
        //     default:
        //         DE_ASSERT(DE_FALSE);
        // }
        //
        // switch (cmp.getFormat().order)
        // {
        //     case TextureFormat::RGBA:	separableConvolve<4, 4>(cmpFiltered, cmp, shift, shift, kernel, kernel);	break;
        //     case TextureFormat::RGB:	separableConvolve<4, 3>(cmpFiltered, cmp, shift, shift, kernel, kernel);	break;
        //     default:
        //         DE_ASSERT(DE_FALSE);
        // }
        //
        // int		numSamples	= 0;
        // float	errSum		= 0.0f;
        //
        // // Clear error mask to green.
        // clear(errorMask, Vec4(0.0f, 1.0f, 0.0f, 1.0f));
        //
        // ConstPixelBufferAccess refAccess = refFiltered.getAccess();
        // ConstPixelBufferAccess cmpAccess = cmpFiltered.getAccess();
        //
        // for (int y = 1; y < height-1; y++)
        // {
        //     for (int x = 1; x < width-1; x += params.maxSampleSkip > 0 ? (int)rnd.getInt(0, params.maxSampleSkip) : 1)
        //     {
        //         float err = deFloatMin(compareToNeighbor<4>(params, rnd, readUnorm8<4>(refAccess, x, y), cmpAccess, x, y),
        //                                compareToNeighbor<4>(params, rnd, readUnorm8<4>(cmpAccess, x, y), refAccess, x, y));
        //
        //         err = deFloatPow(err, params.errExp);
        //
        //         errSum		+= err;
        //         numSamples	+= 1;
        //
        //         // Build error image.
        //         float	red		= err * 500.0f;
        //         float	luma	= toGrayscale(cmp.getPixel(x, y));
        //         float	rF		= 0.7f + 0.3f*luma;
        //         errorMask.setPixel(Vec4(red*rF, (1.0f-red)*rF, 0.0f, 1.0f), x, y);
        //     }
        // }
        //
        // // Scale error sum based on number of samples taken
        // errSum *= (float)((width-2) * (height-2)) / (float)numSamples;
        //
        // return errSum;
    }
};
