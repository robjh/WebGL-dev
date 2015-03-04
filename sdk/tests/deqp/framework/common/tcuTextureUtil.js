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

define(['framework/common/tcuTexture'], function(tcuTexture) {

var DE_ASSERT = function(x) {
    if (!x)
        throw new Error('Assert failed');
};

var linearInterpolate = function(t, minVal, maxVal)
{
    return minVal + (maxVal - minVal) * t;
};

var fillWithComponentGradients2D = function(/*const PixelBufferAccess&*/ access, /*const Vec4&*/ minVal, /*const Vec4&*/ maxVal) {
    for (var y = 0; y < access.getHeight(); y++) {
        for (var x = 0; x < access.getWidth(); x++)    {
            var s    = (x + 0.5) / access.getWidth();
            var t    = (y + 0.5) / access.getHeight();

            var r    = linearInterpolate((      s  +       t) *0.5, minVal[0], maxVal[0]);
            var g = linearInterpolate((      s  + (1-t))*0.5, minVal[1], maxVal[1]);
            var b = linearInterpolate(((1-s) +       t) *0.5, minVal[2], maxVal[2]);
            var a = linearInterpolate(((1-s) + (1-t))*0.5, minVal[3], maxVal[3]);

            access.setPixel([r, g, b, a], x, y);
        }
    }
};

var fillWithComponentGradients3D = function(/*const PixelBufferAccess&*/ dst, /*const Vec4&*/ minVal, /*const Vec4&*/ maxVal) {
    for (var z = 0; z < dst.getDepth(); z++) {
        for (var y = 0; y < dst.getHeight(); y++) {
            for (var x = 0; x < dst.getWidth(); x++) {
                var s = (x + 0.5) / dst.getWidth();
                var t = (y + 0.5) / dst.getHeight();
                var p = (z + 0.5) / dst.getDepth();

                var r = linearInterpolate(s,                        minVal[0], maxVal[0]);
                var g = linearInterpolate(t,                        minVal[1], maxVal[1]);
                var b = linearInterpolate(p,                        minVal[2], maxVal[2]);
                var a = linearInterpolate(1 - (s+t+p)/3,    minVal[3], maxVal[3]);
                dst.setPixel([r, g, b, a], x, y, z);
            }
        }
    }
};

var fillWithComponentGradients = function(/*const PixelBufferAccess&*/ access, /*const Vec4&*/ minVal, /*const Vec4&*/ maxVal) {
    if (access.getHeight() == 1 && access.getDepth() == 1)
        fillWithComponentGradients1D(access, minVal, maxVal);
    else if (access.getDepth() == 1)
        fillWithComponentGradients2D(access, minVal, maxVal);
    else
        fillWithComponentGradients3D(access, minVal, maxVal);
};

var TextureFormatInfo = function(valueMin, valueMax, lookupScale, lookupBias) {
    this.valueMin = valueMin;
    this.valueMax = valueMax;
    this.lookupScale = lookupScale;
    this.lookupBias = lookupBias;
};

/*static Vec2*/ var getChannelValueRange = function(/*TextureFormat::ChannelType*/ channelType) {
    var cMin = 0;
    var cMax = 0;

    switch (channelType) {
        // Signed normalized formats.
        case tcuTexture.ChannelType.SNORM_INT8:
        case tcuTexture.ChannelType.SNORM_INT16:                    cMin = -1;            cMax = 1;            break;

        // Unsigned normalized formats.
        case tcuTexture.ChannelType.UNORM_INT8:
        case tcuTexture.ChannelType.UNORM_INT16:
        case tcuTexture.ChannelType.UNORM_SHORT_565:
        case tcuTexture.ChannelType.UNORM_SHORT_4444:
        case tcuTexture.ChannelType.UNORM_INT_101010:
        case tcuTexture.ChannelType.UNORM_INT_1010102_REV:            cMin = 0;            cMax = 1;            break;

        // Misc formats.
        case tcuTexture.ChannelType.SIGNED_INT8:                    cMin = -128;            cMax = 127;            break;
        case tcuTexture.ChannelType.SIGNED_INT16:                    cMin = -32768;        cMax = 32767;        break;
        case tcuTexture.ChannelType.SIGNED_INT32:                    cMin = -2147483648;    cMax = 2147483647;    break;
        case tcuTexture.ChannelType.UNSIGNED_INT8:                    cMin = 0;            cMax = 255;            break;
        case tcuTexture.ChannelType.UNSIGNED_INT16:                    cMin = 0;            cMax = 65535;        break;
        case tcuTexture.ChannelType.UNSIGNED_INT32:                    cMin = 0;            cMax = 4294967295;    break;
        case tcuTexture.ChannelType.HALF_FLOAT:                        cMin = -1e3;            cMax = 1e3;            break;
        case tcuTexture.ChannelType.FLOAT:                            cMin = -1e5;            cMax = 1e5;            break;
        case tcuTexture.ChannelType.UNSIGNED_INT_11F_11F_10F_REV:    cMin = 0;            cMax = 1e4;            break;
        case tcuTexture.ChannelType.UNSIGNED_INT_999_E5_REV:        cMin = 0;            cMax = 1e5;            break;

        default:
            DE_ASSERT(false);
    }

    return [cMin, cMax];
};

/*
 * Creates an array by choosing between 'a' and 'b' based on 'cond' array.
 * @param {Array<boolean>} cond Condtions
 * @return {Array}
 */
var select = function(a, b, cond) {
    var dst = [];
    for (var i = 0; i < cond.length; i++)
        if (cond[i])
            dst.push(a);
        else
            dst.push(b);
    return dst;
};

/*--------------------------------------------------------------------*//*!
 * \brief Get standard parameters for testing texture format
 *
 * Returns TextureFormatInfo that describes good parameters for exercising
 * given TextureFormat. Parameters include value ranges per channel and
 * suitable lookup scaling and bias in order to reduce result back to
 * 0..1 range.
 *//*--------------------------------------------------------------------*/
/*TextureFormatInfo*/ var getTextureFormatInfo = function(/*const TextureFormat&*/ format) {
    // Special cases.
    if (format.isEqual(new tcuTexture.TextureFormat(tcuTexture.ChannelOrder.RGBA, tcuTexture.ChannelType.UNSIGNED_INT_1010102_REV)))
        return new TextureFormatInfo([        0,            0,            0,         0],
                                 [     1023,         1023,         1023,         3],
                                 [1/1023,    1/1023,    1/1023,    1/3],
                                 [        0,            0,            0,         0]);
    else if (format.order == tcuTexture.ChannelOrder.D || format.order == tcuTexture.ChannelOrder.DS)
        return new TextureFormatInfo([0,    0,    0,    0],
                                 [1,    1,    1,    0],
                                 [1,    1,    1,    1],
                                 [0,    0,    0,    0]); // Depth / stencil formats.
    else if (format.isEqual(new tcuTexture.TextureFormat(tcuTexture.ChannelOrder.RGBA, tcuTexture.ChannelType.UNORM_SHORT_5551)))
        return new TextureFormatInfo([0, 0, 0, 0.5],
                                 [1, 1, 1, 1.5],
                                 [1, 1, 1, 1],
                                 [0, 0, 0, 0]);

    var    cRange        = getChannelValueRange(format.type);
    var    chnMask        = null;

    switch (format.order) {
        case tcuTexture.ChannelOrder.R:        chnMask = [true,    false,    false,    false];        break;
        case tcuTexture.ChannelOrder.A:        chnMask = [false,    false,    false,    true];        break;
        case tcuTexture.ChannelOrder.L:        chnMask = [true,    true,    true,    false];        break;
        case tcuTexture.ChannelOrder.LA:        chnMask = [true,    true,    true,    true];        break;
        case tcuTexture.ChannelOrder.RG:        chnMask = [true,    true,    false,    false];        break;
        case tcuTexture.ChannelOrder.RGB:    chnMask = [true,    true,    true,    false];        break;
        case tcuTexture.ChannelOrder.RGBA:    chnMask = [true,    true,    true,    true];        break;
        case tcuTexture.ChannelOrder.sRGB:    chnMask = [true,    true,    true,    false];        break;
        case tcuTexture.ChannelOrder.sRGBA:    chnMask = [true,    true,    true,    true];        break;
        case tcuTexture.ChannelOrder.D:        chnMask = [true,    true,    true,    false];        break;
        case tcuTexture.ChannelOrder.DS:        chnMask = [true,    true,    true,    true];        break;
        default:
            DE_ASSERT(false);
    }

    var    scale    = 1 / (cRange[1] - cRange[0]);
    var    bias    = -cRange[0] * scale;

    return new TextureFormatInfo(select(cRange[0],    0, chnMask),
                             select(cRange[1],    0, chnMask),
                             select(scale,        1, chnMask),
                             select(bias,        0, chnMask));
};

return {
    fillWithComponentGradients: fillWithComponentGradients,
    getTextureFormatInfo: getTextureFormatInfo
};

});