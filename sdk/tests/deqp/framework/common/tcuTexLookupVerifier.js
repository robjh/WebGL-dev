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
goog.provide('framework.common.tcuTexLookupVerifier');
goog.require('framework.common.tcuTexture');
goog.require('framework.common.tcuTexVerifierUtil');



goog.scope(function() {

    var tcuTexLookupVerifier = framework.common.tcuTexLookupVerifier;
    var tcuTexVerifierUtil = framework.common.tcuTexVerifierUtil;
    var tcuTexture = framework.common.tcuTexture;

    /**
     * Generic lookup precision parameters
     * @constructor
     */
    tcuTexLookupVerifier.LookupPrecision = function() {
        /** @type {Array<number>} */ this.coordBits = [22, 22, 22];
        /** @type {Array<number>} */ this.uvwBits = [16, 16, 16];
        /** @type {Array<number>} */ this.colorThreshold = [0.0, 0.0, 0.0, 0.0];
        /** @type {Array<boolean>} */ this.colorMask = [true, true, true, true];
    };

    /**
     * Lod computation precision parameters
     * @constructor
     */
    tcuTexLookupVerifier.LodPrecision = function() {
        /** @type {number} */ this.derivateBits = 22;
        /** @type {number} */ this.lodBits = 16;

    };

    /**
     * @param {Array<number>} bits
     * @return {Array<number>}
     */
    tcuTexLookupVerifier.computeFixedPointThreshold = function(bits) {
        return tcuTexVerifierUtil.computeFixedPointError(bits);
    };

    /**
    * @param {number} dudx
    * @param {number} dvdx
    * @param {number} dwdx
    * @param {number} dudy
    * @param {number} dvdy
    * @param {number} dwdy
    * @param {tcuTexLookupVerifier.LodPrecision} prec
    * @return {Array<number>}
    */
    tcuTexLookupVerifier.computeLodBoundsFromDerivates = function(dudx, dvdx, dwdx, dudy, dvdy, dwdy, prec) {
        /** @type {number} */ var mu = Math.max(Math.abs(dudx), Math.abs(dudy));
        /** @type {number} */ var mv = Math.max(Math.abs(dvdx), Math.abs(dvdy));
        /** @type {number} */ var mw = Math.max(Math.abs(dwdx), Math.abs(dwdy));
        /** @type {number} */ var minDBound = Math.max(Math.max(mu, mv), mw);
        /** @type {number} */ var maxDBound = mu + mv + mw;
        /** @type {number} */ var minDErr = tcuTexVerifierUtil.computeFloatingPointError(minDBound, prec.derivateBits);
        /** @type {number} */ var maxDErr = tcuTexVerifierUtil.computeFloatingPointError(maxDBound, prec.derivateBits);
        /** @type {number} */ var minLod = Math.log2(minDBound - minDErr);
        /** @type {number} */ var maxLod = Math.log2(maxDBound + maxDErr);
        /** @type {number} */ var lodErr = tcuTexVerifierUtil.computeFixedPointErrorNumber(prec.lodBits);

        assertMsgOptions(minLod <= maxLod, 'Error: minLoad < maxLod', false, true);
        return [minLod - lodErr, maxLod + lodErr];
    };

    /**
    * @param {number} dudx
    * @param {number} dvdx
    * @param {number} dudy
    * @param {number} dvdy
    * @param {tcuTexLookupVerifier.LodPrecision} prec
    * @return {Array<number>}
    */
    tcuTexLookupVerifier.computeLodBoundsFromDerivatesUV = function(dudx, dvdx, dudy, dvdy, prec) {
        return tcuTexLookupVerifier.computeLodBoundsFromDerivates(dudx, dvdx, 0.0, dudy, dvdy, 0.0, prec);
    };

    /**
     * @param {number} dudx
     * @param {number} dudy
     * @param {tcuTexLookupVerifier.LodPrecision} prec
     * @return {Array<number>}
     */
    tcuTexLookupVerifier.computeLodBoundsFromDerivatesU = function(dudx, dudy, prec) {
        return tcuTexLookupVerifier.computeLodBoundsFromDerivates(dudx, 0.0, 0.0, dudy, 0.0, 0.0, prec);
    };

    /**
     *
     */
    tcuTexLookupVerifier.clampLodBounds = function() {
        throw new Error('Not implemented. TODO: implement');
    };

    /*
     * @param {tcuTexture.Sampler} sampler
     * @param {boolean}
     */
    tcuTexLookupVerifier.isSamplerSupported = function(sampler) {
        return sampler.compare == tcuTexture.CompareMode.COMPAREMODE_NONE &&
            tcuTexVerifierUtil.isWrapModeSupported(sampler.wrapS) &&
            tcuTexVerifierUtil.isWrapModeSupported(sampler.wrapT) &&
            tcuTexVerifierUtil.isWrapModeSupported(sampler.wrapR);
    };

    /**
     * @param {tcuTexture.ConstPixelBufferAccess} level
     * @param {tcuTexture.Sampler} sampler
     * @param {tcuTexture.FilterMode.FilterMode} filterMode
     * @param {tcuTexLookupVerifier.LookupPrecision} prec
     * @param {Array<number>} coord vec2
     * @param {number} coordZ int
     * @param {Array<number>} result
     * @return {boolean}
     */
    tcuTexLookupVerifier.isLevelSampleResultValid_CoordAsVec2AndInt = function(level, sampler, filterMode, prec, coord, coordZ, result) {
        if (filterMode == tcuTexture.FilterMode.LINEAR)
      	    return tcuTexLookupVerifier.isLinearSampleResultValid_CoordAsVec2AndInt(level, sampler, prec, coord, coordZ, result);
      	else
      	    return tcuTexLookupVerifier.isNearestSampleResultValid_CoordAsVec2AndInt(level, sampler, prec, coord, coordZ, result);
    };

    /**
     * @param {tcuTexture.ConstPixelBufferAccess} level
     * @param {tcuTexture.Sampler} sampler
     * @param {tcuTexLookupVerifier.LookupPrecision} prec
     * @param {Array<number>} coord vec2
     * @param {number} coordZ int
     * @param {Array<number>} result
     * @return {boolean}
     */
    tcuTexLookupVerifier.isLinearSampleResultValid_CoordAsVec2AndInt = function() {
        const Vec2					uBounds			= computeNonNormalizedCoordBounds(sampler.normalizedCoords, level.getWidth(),	coord.x(), prec.coordBits.x(), prec.uvwBits.x());
	const Vec2					vBounds			= computeNonNormalizedCoordBounds(sampler.normalizedCoords, level.getHeight(),	coord.y(), prec.coordBits.y(), prec.uvwBits.y());

	// Integer coordinate bounds for (x0,y0) - without wrap mode
	const int					minI			= deFloorFloatToInt32(uBounds.x()-0.5f);
	const int					maxI			= deFloorFloatToInt32(uBounds.y()-0.5f);
	const int					minJ			= deFloorFloatToInt32(vBounds.x()-0.5f);
	const int					maxJ			= deFloorFloatToInt32(vBounds.y()-0.5f);

	const int					w				= level.getWidth();
	const int					h				= level.getHeight();

	const TextureChannelClass	texClass		= getTextureChannelClass(level.getFormat().type);
	float						searchStep		= texClass == TEXTURECHANNELCLASS_UNSIGNED_FIXED_POINT	? computeBilinearSearchStepForUnorm(prec) :
												  texClass == TEXTURECHANNELCLASS_SIGNED_FIXED_POINT	? computeBilinearSearchStepForSnorm(prec) :
												  0.0f; // Step is computed for floating-point quads based on texel values.

	// \todo [2013-07-03 pyry] This could be optimized by first computing ranges based on wrap mode.

	for (int j = minJ; j <= maxJ; j++)
	{
		for (int i = minI; i <= maxI; i++)
		{
			// Wrapped coordinates
			const int	x0		= wrap(sampler.wrapS, i  , w);
			const int	x1		= wrap(sampler.wrapS, i+1, w);
			const int	y0		= wrap(sampler.wrapT, j  , h);
			const int	y1		= wrap(sampler.wrapT, j+1, h);

			// Bounds for filtering factors
			const float	minA	= de::clamp((uBounds.x()-0.5f)-float(i), 0.0f, 1.0f);
			const float	maxA	= de::clamp((uBounds.y()-0.5f)-float(i), 0.0f, 1.0f);
			const float	minB	= de::clamp((vBounds.x()-0.5f)-float(j), 0.0f, 1.0f);
			const float	maxB	= de::clamp((vBounds.y()-0.5f)-float(j), 0.0f, 1.0f);

			ColorQuad quad;
			lookupQuad(quad, level, sampler, x0, x1, y0, y1, coordZ);

			if (texClass == TEXTURECHANNELCLASS_FLOATING_POINT)
				searchStep = computeBilinearSearchStepFromFloatQuad(prec, quad);

			if (isBilinearRangeValid(prec, quad, Vec2(minA, maxA), Vec2(minB, maxB), searchStep, result))
				return true;
		}
	}

	return false;
    };

    /**
     *
     */
    tcuTexLookupVerifier.isNearestSampleResultValid_CoordAsVec2AndInt = function() {
    };

    /**
    * @param {tcuTexture.Texture2DView} texture
    * @param {tcuTexture.Sampler} sampler
    * @param {tcuTexLookupVerifier.LookupPrecision} prec
    * @param {Array<number>} coord
    * @param {Array<number>} lodBounds
    * @param {Array<number>} result
     * @return {boolean}
     */
    tcuTexLookupVerifier.isLookupResultValid2DView = function(texture, sampler, prec, coord, lodBounds, result) {
        /** @type {number} */ var minLod = lodBounds[0];
        /** @type {number} */ var maxLod = lodBounds[1];
        /** @type {boolean} */ var canBeMagnified = minLod <= sampler.lodThreshold;
        /** @type {boolean} */ var canBeMinified = maxLod > sampler.lodThreshold;

    	assertMsgOptions(tcuTexLookupVerifier.isSamplerSupported(sampler), 'Sampler not supported.', false, true);

    	if (canBeMagnified)
    		if (tcuTexLookupVerifier.isLevelSampleResultValid(texture.getLevel(0), sampler, sampler.magFilter, prec, coord, 0, result))
    			return true;

    	if (canBeMinified) {
            /** @type {boolean} */ var isNearestMipmap = tcuTexLookupVerifier.isNearestMipmapFilter(sampler.minFilter);
            /** @type {boolean} */ var isLinearMipmap = tcuTexLookupVerifier.isLinearMipmapFilter(sampler.minFilter);
            /** @type {number} */ var minTexLevel = 0;
            /** @type {number} */ var maxTexLevel = texture.getNumLevels() - 1;
            /** @type {number} */ var minLevel;
            /** @type {number} */ var maxLevel;
            assertMsgOptions(minTexLevel <= maxTexLevel, 'Error: minTexLevel > maxTexLevel', false, true);

    		if (isLinearMipmap && minTexLevel < maxTexLevel) {
                minLevel = deMath.clamp(Math.floor(minLod), minTexLevel, maxTexLevel - 1);
                maxLevel = deMath.clamp(Math.floor(maxLod), minTexLevel, maxTexLevel - 1);

                assertMsgOptions(minLevel <= maxLevel, 'Error: minLevel > maxLevel', false, true);

    			for (var level = minLevel; level <= maxLevel; level++) {
                    /** @type {number} */ var minF = deMath.clamp(minLod - level, 0.0, 1.0);
                    /** @type {number} */ var maxF = deMath.clamp(maxLod - level, 0.0, 1.0);

    				if (tcuTexLookupVerifier.isMipmapLinearSampleResultValid(texture.getLevel(level), texture.getLevel(level+1), sampler, tcuTexVerifierUti.getLevelFilter(sampler.minFilter), prec, coord, 0, Vec2(minF, maxF), result))
    					return true;
    			}
    		}
    		else if (isNearestMipmap) {
    			// \note The accurate formula for nearest mipmapping is level = ceil(lod + 0.5) - 1 but Khronos has made
    			//		 decision to allow floor(lod + 0.5) as well.
    			minLevel = deMath.clamp(Math.ceil(minLod + 0.5) - 1, minTexLevel, maxTexLevel);
    			maxLevel = deMath.clamp(Math.floor(maxLod + 0.5), minTexLevel, maxTexLevel);

                assertMsgOptions(minLevel <= maxLevel, 'Error: minLevel > maxLevel', false, true);

    			for (var level = minLevel; level <= maxLevel; level++)
    				if (tcuTexLookupVerifier.isLevelSampleResultValid(texture.getLevel(level), sampler, tcuTexVerifierUti.getLevelFilter(sampler.minFilter), prec, coord, 0, result))
    					return true;
    		}
    		else
    			if (tcuTexLookupVerifier.isLevelSampleResultValid(texture.getLevel(0), sampler, sampler.minFilter, prec, coord, 0, result))
    				return true;
    	}

    	return false;
    };

});
