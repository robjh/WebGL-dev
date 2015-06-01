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

'use strict';
goog.provide('framework.common.tcuTexCompareVerifier');
goog.require('framework.common.tcuTexture');
goog.require('framework.delibs.debase.deMath');
goog.require('framework.common.tcuTextureUtil');

goog.scope(function() {

var tcuTexCompareVerifier = framework.common.tcuTexCompareVerifier;
var tcuTexture = framework.common.tcuTexture;
var deMath = framework.delibs.debase.deMath;
var tcuTextureUtil = framework.common.tcuTextureUtil;

/**
 * \brief Texture compare (shadow) lookup precision parameters.
 * @constructor
 * @struct
 * @param {Array<number>=} coordBits
 * @param {Array<number>=} uvwBits
 * @param {number=} pcfBits
 * @param {number=} referenceBits
 * @param {number=} resultBits
 */
tcuTexCompareVerifier.TexComparePrecision = function(coordBits, uvwBits, pcfBits, referenceBits, resultBits) {
    this.coordBits = coordBits === undefined ? [22, 22, 22] : coordBits;
    this.uvwBits = uvwBits === undefined ? [22, 22, 22] : uvwBits;
    this.pcfBits = pcfBits === undefined ? 16 : pcfBits;
    this.referenceBits = referenceBits === undefined ? 16 : referenceBits;
    this.resultBits = resultBits === undefined ? 16 : resultBits;
};

/** 
 * @constructor
 * @struct
 */
tcuTexCompareVerifier.CmpResultSet = function() {
    this.isTrue = false;
    this.isFalse = false;
};

/**
 * @param {tcuTexture.CompareMode} compareMode
 * @param {number} cmpValue_
 * @param {number} cmpReference_
 * @param {number} referenceBits
 * @param {boolean} isFixedPoint
 * @return {tcuTexCompareVerifier.CmpResultSet}
 */
tcuTexCompareVerifier.execCompare = function(compareMode,
                                 cmpValue_,
                                 cmpReference_,
                                 referenceBits,
                                 isFixedPoint) {
    var clampValues     = isFixedPoint; // if comparing against a floating point texture, ref (and value) is not clamped
    var cmpValue        = (clampValues) ? (deMath.clamp(cmpValue_, 0, 1)) : (cmpValue_);
    var cmpReference    = (clampValues) ? (deMath.clamp(cmpReference_, 0, 1)) : (cmpReference_);
    var err             = computeFixedPointError(referenceBits);
    var res = new tcuTexCompareVerifier.CmpResultSet();

    switch (compareMode)
    {
        case tcuTexture.CompareMode.COMPAREMODE_LESS:
            res.isTrue  = cmpReference-err < cmpValue;
            res.isFalse = cmpReference+err >= cmpValue;
            break;

        case tcuTexture.CompareMode.COMPAREMODE_LESS_OR_EQUAL:
            res.isTrue  = cmpReference-err <= cmpValue;
            res.isFalse = cmpReference+err > cmpValue;
            break;

        case tcuTexture.CompareMode.COMPAREMODE_GREATER:
            res.isTrue  = cmpReference+err > cmpValue;
            res.isFalse = cmpReference-err <= cmpValue;
            break;

        case tcuTexture.CompareMode.COMPAREMODE_GREATER_OR_EQUAL:
            res.isTrue  = cmpReference+err >= cmpValue;
            res.isFalse = cmpReference-err < cmpValue;
            break;

        case tcuTexture.CompareMode.COMPAREMODE_EQUAL:
            res.isTrue  = deMath.inRange(cmpValue, cmpReference-err, cmpReference+err);
            res.isFalse = err != 0.0f || cmpValue != cmpReference;
            break;

        case tcuTexture.CompareMode.COMPAREMODE_NOT_EQUAL:
            res.isTrue  = err != 0.0f || cmpValue != cmpReference;
            res.isFalse = deMath.inRange(cmpValue, cmpReference-err, cmpReference+err);
            break;

        case tcuTexture.CompareMode.COMPAREMODE_ALWAYS:
            res.isTrue  = true;
            break;

        case tcuTexture.CompareMode.COMPAREMODE_NEVER:
            res.isFalse = true;
            break;

        default:
            DE_ASSERT(false);
    }

    assertMsgOptions(res.isTrue || res.isFalse, 'Both tests failed!', false, true);
    return res;
}
/**
 * @param {tcuTexture.TextureFormat} format
 * @return {boolean}
 */
tcuTexCompareVerifier.isFixedPointDepthTextureFormat = function(format)
{
    var channelClass = tcuTextureUtil.getTextureChannelClass(format.type);

    if (format.order == tcuTexture.ChannelOrder.D)
    {
        // depth internal formats cannot be non-normalized integers
        return channelClass != tcuTextureUtil.TextureChannelClass.FLOATING_POINT;
    }
    else if (format.order == tcuTexture.ChannelOrder.DS)
    {
        // combined formats have no single channel class, detect format manually
        switch (format.type)
        {
            case tcuTexture.ChannelType.FLOAT_UNSIGNED_INT_24_8_REV:   return false;
            case tcuTexture.ChannelType.UNSIGNED_INT_24_8:             return true;

            default:
                throw new Error('Invalid texture format: ' + format);
        }
    }

    return false;
};

/**
 * @param {tcuTexture.CompareMode} compareMode
 * @param {tcuTexCompareVerifier.TexComparePrecision} prec
 * @param {Array<number>} depths vec4
 * @param {Array<number>} xBounds vec2
 * @param {Array<number>} yBounds vec2
 * @param {number} cmpReference
 * @param {number} result
 * @param {boolean} isFixedPointDepth
 * @return {boolean}
 */
tcuTexCompareVerifier.isBilinearPCFCompareValid = function(compareMode,
                                    prec,
                                    depths,
                                    xBounds,
                                    yBounds,
                                    cmpReference,
                                    result,
                                    isFixedPointDepth) {
};

/**
 * @param {tcuTexture.CompareMode} compareMode
 * @param {tcuTexCompareVerifier.TexComparePrecision} prec
 * @param {Array<number>} depths vec4
 * @param {Array<number>} xBounds vec2
 * @param {Array<number>} yBounds vec2
 * @param {number} cmpReference
 * @param {number} result
 * @param {boolean} isFixedPointDepth
 * @return {boolean}
 */
tcuTexCompareVerifier.isBilinearPCFCompareValid = function(compareMode,
                                    prec,
                                    depths,
                                    xBounds,
                                    yBounds,
                                    cmpReference,
                                    result,
                                    isFixedPointDepth) {
    assertMsgOptions(0.0 <= xBounds.x() && xBounds.x() <= xBounds.y() && xBounds.y() <= 1.0, 'x coordinate out of bounds', false, true);
    assertMsgOptions(0.0 <= yBounds.x() && yBounds.x() <= yBounds.y() && yBounds.y() <= 1.0, 'y coordinate out of bounds', false, true);
    assertMsgOptions(prec.pcfBits > 0, 'PCF bits must be > 0', false, true);

    vard0          = depths[0];
    vard1          = depths[1];
    vard2          = depths[2];
    vard3          = depths[3];

    var cmp0 = execCompare(compareMode, d0, cmpReference, prec.referenceBits, isFixedPointDepth);
    var cmp1 = execCompare(compareMode, d1, cmpReference, prec.referenceBits, isFixedPointDepth);
    var cmp2 = execCompare(compareMode, d2, cmpReference, prec.referenceBits, isFixedPointDepth);
    var cmp3 = execCompare(compareMode, d3, cmpReference, prec.referenceBits, isFixedPointDepth);

    const deUint32      isTrue      = (deUint32(cmp0.isTrue)<<0)
                                    | (deUint32(cmp1.isTrue)<<1)
                                    | (deUint32(cmp2.isTrue)<<2)
                                    | (deUint32(cmp3.isTrue)<<3);
    const deUint32      isFalse     = (deUint32(cmp0.isFalse)<<0)
                                    | (deUint32(cmp1.isFalse)<<1)
                                    | (deUint32(cmp2.isFalse)<<2)
                                    | (deUint32(cmp3.isFalse)<<3);

    // Interpolation parameters
    const float         x0          = xBounds.x();
    const float         x1          = xBounds.y();
    const float         y0          = yBounds.x();
    const float         y1          = yBounds.y();

    // Error parameters
    const float         pcfErr      = computeFixedPointError(prec.pcfBits);
    const float         resErr      = computeFixedPointError(prec.resultBits);
    const float         totalErr    = pcfErr+resErr;

    // Iterate over all valid combinations.
    // \note It is not enough to compute minmax over all possible result sets, as ranges may
    //       not necessarily overlap, i.e. there are gaps between valid ranges.
    for (deUint32 comb = 0; comb < (1<<4); comb++)
    {
        // Filter out invalid combinations:
        //  1) True bit is set in comb but not in isTrue => sample can not be true
        //  2) True bit is NOT set in comb and not in isFalse => sample can not be false
        if (((comb & isTrue) | (~comb & isFalse)) != (1<<4)-1)
            continue;

        const BVec4     cmpTrue     = extractBVec4(comb, 0);
        const Vec4      refVal      = select(Vec4(1.0f), Vec4(0.0f), cmpTrue);

        const float     v0          = bilinearInterpolate(refVal, x0, y0);
        const float     v1          = bilinearInterpolate(refVal, x1, y0);
        const float     v2          = bilinearInterpolate(refVal, x0, y1);
        const float     v3          = bilinearInterpolate(refVal, x1, y1);
        const float     minV        = de::min(v0, de::min(v1, de::min(v2, v3)));
        const float     maxV        = de::max(v0, de::max(v1, de::max(v2, v3)));
        const float     minR        = minV-totalErr;
        const float     maxR        = maxV+totalErr;

        if (de::inRange(result, minR, maxR))
            return true;
    }

    return false;
};

/**
 * @param {tcuTexture.CompareMode} compareMode
 * @param {tcuTexCompareVerifier.TexComparePrecision} prec
 * @param {Array<number>} depths vec4
 * @param {number} cmpReference
 * @param {number} result
 * @param {boolean} isFixedPointDepth
 * @return {boolean}
 */
tcuTexCompareVerifier.isBilinearAnyCompareValid = function(compareMode,
                                    prec,
                                    depths,
                                    cmpReference,
                                    result,
                                    isFixedPointDepth) {
    /* TODO: implement */
};

/**
 * @param {tcuTexture.ConstPixelBufferAccess} level
 * @param {tcuTexture.Sampler} sampler
 * @param {tcuTexCompareVerifier.TexComparePrecision} prec
 * @param {Array<number>} coord vec2 texture coordinates
 * @param {number} coordZ
 * @param {number} cmpReference
 * @param {number} result
 * @return {boolean}
 */
tcuTexCompareVerifier.isLinearCompareResultValid = function(level,
                                       sampler,
                                       prec,
                                       coord,
                                       coordZ,
                                       cmpReference,
                                       result) {
    var isFixedPointDepth   = tcuTexCompareVerifier.isFixedPointDepthTextureFormat(level.getFormat());
    var uBounds             = tcuTexVerifierUtil.computeNonNormalizedCoordBounds(sampler.normalizedCoords, level.getWidth(),   coord.x(), prec.coordBits.x(), prec.uvwBits.x());
    var vBounds             = tcuTexVerifierUtil.computeNonNormalizedCoordBounds(sampler.normalizedCoords, level.getHeight(),  coord.y(), prec.coordBits.y(), prec.uvwBits.y());

    // Integer coordinate bounds for (x0,y0) - without wrap mode
    var minI        = Math.floor(uBounds.x()-0.5);
    var maxI        = Math.floor(uBounds.y()-0.5);
    var minJ        = Math.floor(vBounds.x()-0.5);
    var maxJ        = Math.floor(vBounds.y()-0.5);

    var w           = level.getWidth();
    var h           = level.getHeight();

    // \todo [2013-07-03 pyry] This could be optimized by first computing ranges based on wrap mode.

    for (var j = minJ; j <= maxJ; j++)
    {
        for (var i = minI; i <= maxI; i++)
        {
            // Wrapped coordinates
            var x0      = tcuTexVerifierUtil.wrap(sampler.wrapS, i  , w);
            var x1      = tcuTexVerifierUtil.wrap(sampler.wrapS, i+1, w);
            var y0      = tcuTexVerifierUtil.wrap(sampler.wrapT, j  , h);
            var y1      = tcuTexVerifierUtil.wrap(sampler.wrapT, j+1, h);

            // Bounds for filtering factors
            var minA    = deMath.clamp((uBounds.x()-0.5) - i, 0, 1);
            var maxA    = deMath.clamp((uBounds.y()-0.5) - i, 0, 1);
            var minB    = deMath.clamp((vBounds.x()-0.5) - j, 0, 1);
            var maxB    = deMath.clamp((vBounds.y()-0.5) - j, 0, 1);

            var depths = [
                level.getPixDepth(x0, y0, coordZ),
                level.getPixDepth(x1, y0, coordZ),
                level.getPixDepth(x0, y1, coordZ),
                level.getPixDepth(x1, y1, coordZ)
                ];

            if (tcuTexCompareVerifier.isBilinearCompareValid(sampler.compare, prec, depths, Vec2(minA, maxA), Vec2(minB, maxB), cmpReference, result, isFixedPointDepth))
                return true;
        }
    }

    return false;
};

/**
 * @param {tcuTexture.ConstPixelBufferAccess} level
 * @param {tcuTexture.Sampler} sampler
 * @param {tcuTexCompareVerifier.TexComparePrecision} prec
 * @param {Array<number>} coord vec2 texture coordinates
 * @param {number} coordZ
 * @param {number} cmpReference
 * @param {number} result
 * @return {boolean}
 */
tcuTexCompareVerifier.isNearestCompareResultValid = function(level,
                                       sampler,
                                       prec,
                                       coord,
                                       coordZ,
                                       cmpReference,
                                       result) {
    /* TODO: implement */
};

/**
 * @param {tcuTexture.ConstPixelBufferAccess} level
 * @param {tcuTexture.Sampler} sampler
 * @param {tcuTexture.FilterMode} filterMode
 * @param {tcuTexCompareVerifier.TexComparePrecision} prec
 * @param {Array<number>} coord vec2 texture coordinates
 * @param {number} coordZ
 * @param {number} cmpReference
 * @param {number} result
 * @return {boolean}
 */
tcuTexCompareVerifier.isLevelCompareResultValid = function(level,
                                       sampler,
                                       filterMode,
                                       prec,
                                       coord,
                                       coordZ,
                                       cmpReference,
                                       result) {
    if (filterMode == tcuTexture.FilterMode.LINEAR)
        return tcuTexCompareVerifier.isLinearCompareResultValid(level, sampler, prec, coord, coordZ, cmpReference, result);
    else
        return tcuTexCompareVerifier.isNearestCompareResultValid(level, sampler, prec, coord, coordZ, cmpReference, result);
};


/**
 * @param {tcuTexture.Texture2DView} texture
 * @param {tcuTexture.Sampler} sampler
 * @param {tcuTexCompareVerifier.TexComparePrecision} prec
 * @param {Array<number>} coord vec2 texture coordinates
 * @param {Array<number>} lodBounds vec2 level-of-detail bounds
 * @param {number} cmpReference
 * @param {number} result
 * @return {boolean}
 */
tcuTexCompareVerifier.isTexCompareResultValid2D = function(texture, sampler, prec, coord, lodBounds, cmpReference, result) {
    var minLod = lodBounds[0];
    var maxLod = lodBounds[1];
    var canBeMagnified = minLod <= sampler.lodThreshold;
    var canBeMinified = maxLod > sampler.lodThreshold;

    if (canBeMagnified) {
        if (tcuTexCompareVerifier.isLevelCompareResultValid(texture.getLevel(0), sampler, sampler.magFilter, prec, coord, 0, cmpReference, result))
            return true;
    }

    if (canBeMinified) {
        var isNearestMipmap = isNearestMipmapFilter(sampler.minFilter);
        var isLinearMipmap = isLinearMipmapFilter(sampler.minFilter);
        var minTexLevel = 0;
        var maxTexLevel = texture.getNumLevels() - 1;

        assertMsgOptions(minTexLevel < maxTexLevel, 'Invalid texture levels.', false, true);

        if (isLinearMipmap) {
            var minLevel = deMath.clamp(Math.floor(minLod), minTexLevel, maxTexLevel - 1);
            var maxLevel = deMath.clamp(Math.floor(maxLod), minTexLevel, maxTexLevel - 1);

            assertMsgOptions(minLevel <= maxLevel, 'Invalid texture levels.', false, true);

            for (var level = minLevel; level <= maxLevel; level++) {
                var minF = deMath.clamp(minLod - level, 0, 1);
                var maxF = deMath.clamp(maxLod - level, 0, 1);

                if (isMipmapLinearCompareResultValid(texture.getLevel(level), texture.getLevel(level + 1), sampler, getLevelFilter(sampler.minFilter), prec, coord, 0, [minF, maxF], cmpReference, result))
                    return true;
            }
        } else if (isNearestMipmap) {
            // \note The accurate formula for nearest mipmapping is level = ceil(lod + 0.5) - 1 but Khronos has made
            //       decision to allow floor(lod + 0.5) as well.
            var minLevel = deMath.clamp(Math.ceil(minLod + 0.5) - 1, minTexLevel, maxTexLevel);
            var maxLevel = deMath.clamp(Math.floor(maxLod + 0.5), minTexLevel, maxTexLevel);

            assertMsgOptions(minLevel <= maxLevel, 'Invalid texture levels.', false, true);

            for (var level = minLevel; level <= maxLevel; level++) {
                if (isLevelCompareResultValid(texture.getLevel(level), sampler, getLevelFilter(sampler.minFilter), prec, coord, 0, cmpReference, result))
                    return true;
            }
        } else{
            if (isLevelCompareResultValid(texture.getLevel(0), sampler, sampler.minFilter, prec, coord, 0, cmpReference, result))
                return true;
        }
    }

    return false;
};

});
