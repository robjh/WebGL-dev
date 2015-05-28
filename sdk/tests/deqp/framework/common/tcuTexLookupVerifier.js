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
goog.require('framework.common.tcuTextureUtil');
goog.require('framework.common.tcuTexVerifierUtil');



goog.scope(function() {

    var tcuTexLookupVerifier = framework.common.tcuTexLookupVerifier;
    var tcuTexVerifierUtil = framework.common.tcuTexVerifierUtil;
    var tcuTexture = framework.common.tcuTexture;
    var tcuTextureUtil = framework.common.tcuTextureUtil;

    /**
     * @param  {tcuTexLookupVerifier.ColorQuad} dst
     * @param  {tcuTexture.ConstPixelBufferAccess} level
     * @param  {tcuTexture.Sampler} sampler
     * @param  {number} x0
     * @param  {number} x1
     * @param  {number} y0
     * @param  {number} y1
     * @param  {number} z
     */
    tcuTexLookupVerifier.lookupQuad = function(dst, level, sampler, x0, x1, y0, y1, z) {
    	dst.p00	= tcuTexLookupVerifier.lookup(level, sampler, x0, y0, z);
    	dst.p10	= tcuTexLookupVerifier.lookup(level, sampler, x1, y0, z);
    	dst.p01	= tcuTexLookupVerifier.lookup(level, sampler, x0, y1, z);
    	dst.p11	= tcuTexLookupVerifier.lookup(level, sampler, x1, y1, z);
    };

    /**
     * @param  {tcuTexture.ConstPixelBufferAccess} access
     * @param  {tcuTexture.Sampler} sampler
     * @param  {number} i
     * @param  {number} j
     * @param  {number} k
     * @return {Array<number>}
     */
    tcuTexLookupVerifier.lookup = function(access, sampler, i, j, k) {
    	// Specialization for float lookups: sRGB conversion is performed as specified in format.
    	if (coordsInBounds(access, i, j, k)) {
    		/** @type {Array<number>} */ var p = access.getPixel(i, j, k);
    		return isSRGB(access.getFormat()) ? sRGBToLinear(p) : p;
    	}
    	else
    		return sampler.borderColor;
    };

    /**
     * @constructor
     */
    tcuTexLookupVerifier.ColorQuad = function() {
    	/** @type {Array<number>} */ this.p00;		//!< (0, 0)
    	/** @type {Array<number>} */ this.p01;		//!< (1, 0)
    	/** @type {Array<number>} */ this.p10;		//!< (0, 1)
    	/** @type {Array<number>} */ this.p11;		//!< (1, 1)
    };

    /**
     * @constructor
     */
    tcuTexLookupVerifier.ColorLine = function() {
        /** @type {Array<number>} */ this.p0;		//!< 0
        /** @type {Array<number>} */ this.p1;		//!< 1
    };

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

    /**
     * @param {tcuTexture.Sampler} sampler
     * @return {boolean}
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
     * @param {tcuTexture.FilterMode} filterMode
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
    tcuTexLookupVerifier.isLinearSampleResultValid_CoordAsVec2AndInt = function(level, sampler, prec, coord, coordZ, result) {
        /** @type {Array<number>} */ var uBounds = tcuTexVerifierUtil.computeNonNormalizedCoordBounds(sampler.normalizedCoords, level.getWidth(), coord[0], prec.coordBits[0], prec.uvwBits[0]);
        /** @type {Array<number>} */ var vBounds = tcuTexVerifierUtil.computeNonNormalizedCoordBounds(sampler.normalizedCoords, level.getHeight(), coord[1], prec.coordBits[1], prec.uvwBits[1]);

	    // Integer coordinate bounds for (x0,y0) - without wrap mode
        /** @type {number} */ var minI = Math.floor(uBounds[0] - 0.5);
        /** @type {number} */ var maxI = Math.floor(uBounds[1] - 0.5);
        /** @type {number} */ var minJ = Math.floor(vBounds[0] - 0.5);
        /** @type {number} */ var maxJ = Math.floor(vBounds[1] - 0.5);

        /** @type {number} */ var w = level.getWidth();
        /** @type {number} */ var h = level.getHeight();

	    /** @type {tcuTextureUtil.TextureChannelClass} */
        var texClass = tcuTextureUtil.getTextureChannelClass(level.getFormat().type);

        /** @type {number} */
        var searchStep = (texClass == tcuTextureUtil.TextureChannelClass.UNSIGNED_FIXED_POINT) ? tcuTexLookupVerifier.computeBilinearSearchStepForUnorm(prec) :
		      (texClass == tcuTextureUtil.TextureChannelClass.SIGNED_FIXED_POINT) ? tcuTexLookupVerifier.computeBilinearSearchStepForSnorm(prec) :
              0.0; // Step is computed for floating-point quads based on texel values.

	    // \todo [2013-07-03 pyry] This could be optimized by first computing ranges based on wrap mode.

    	for (var j = minJ; j <= maxJ; j++)
		for (var i = minI; i <= maxI; i++) {
			// Wrapped coordinates
            /** @type {number} */ var x0 = tcuTexVerifierUtil.wrap(sampler.wrapS, i  , w);
            /** @type {number} */ var x1 = tcuTexVerifierUtil.wrap(sampler.wrapS, i + 1, w);
            /** @type {number} */ var y0 = tcuTexVerifierUtil.wrap(sampler.wrapT, j  , h);
            /** @type {number} */ var y1 = tcuTexVerifierUtil.wrap(sampler.wrapT, j + 1, h);

			// Bounds for filtering factors
            /** @type {number} */ var minA	= deMath.clamp((uBounds[0] - 0.5) - i, 0.0, 1.0);
            /** @type {number} */ var maxA	= deMath.clamp((uBounds[1] - 0.5) - i, 0.0, 1.0);
            /** @type {number} */ var minB	= deMath.clamp((vBounds[0] - 0.5) - j, 0.0, 1.0);
            /** @type {number} */ var maxB	= deMath.clamp((vBounds[1] - 0.5) - j, 0.0, 1.0);

            /** @type {tcuTexLookupVerifier.ColorQuad} */ var quad;
			lookupQuad(quad, level, sampler, x0, x1, y0, y1, coordZ);

			if (texClass == tcuTextureUtil.TextureChannelClass.FLOATING_POINT)
				searchStep = computeBilinearSearchStepFromFloatQuad(prec, quad);

			if (isBilinearRangeValid(prec, quad, [minA, maxA], [minB, maxB], searchStep, result))
				return true;
		}

    	return false;
    };

    /**
     * @param {tcuTexLookupVerifier.LookupPrecision} prec
     * @return {number}
     */
    tcuTexLookupVerifier.computeBilinearSearchStepForUnorm = function(prec) {
    	assertMsgOptions(deMath.boolAll(deMath.greaterThan(prec.colorThreshold, [0.0, 0.0, 0.0, 0.0])));

    	/** @type {Array<number> */ var stepCount = 1.0 / prec.colorThreshold;
    	/** @type {Array<number> */ var minStep = 1.0 / (stepCount + 1.0);
    	/** @type {number} */ var step = tcuTexLookupVerifier.minComp(minStep);

    	return step;
    };

    /**
     * @param {tcuTexLookupVerifier.LookupPrecision} prec
     * @return {step}
     */
    tcuTexLookupVerifier.computeBilinearSearchStepForSnorm = function(prec) {
    	assertMsgOptions(deMath.boolAll(deMath.greaterThan(prec.colorThreshold, [0.0, 0.0, 0.0, 0.0])));

    	/** @type {Array<number> */ var stepCount = 2.0 / prec.colorThreshold;
    	/** @type {Array<number> */ var minStep = 1.0 / (stepCount + 1.0);
    	/** @type {number} */ var step = tcuTexLookupVerifier.minComp(minStep);

    	return step;
    };

    /**
     * @param  {Array<number>} vec
     * @return {number}
     */
    tcuTexLookupVerifier.minComp = function(vec) {
    	/** @type {number} */ minVal = vec[0];
    	for (var ndx = 1; ndx < Size; ndx++)
    		minVal = Math.min(minVal, vec[ndx]);
    	return minVal;
    };

    /**
     * @param  {Array<number>} vec
     * @return {number}
     */
    tcuTexLookupVerifier.maxComp = function(vec) {
    	/** @type {number} */ maxVal = vec[0];
    	for (var ndx = 1; ndx < Size; ndx++)
    		maxVal = Math.max(maxVal, vec[ndx]);
    	return maxVal;
    };

    /*
     * @param {tcuTexture.ConstPixelBufferAccess} level
     * @param {tcuTexture.Sampler} sampler
     * @param {tcuTexLookupVerifier.LookupPrecision} prec
     * @param {Array<number>} coord vec2
     * @param {number} coordZ int
     * @param {Array<number>} result
     * @return {boolean}
     */
    tcuTexLookupVerifier.isNearestSampleResultValid_CoordAsVec2AndInt = function(level, sampler, prec, coord, coordZ, result) {
        /** @type {Array<Number>} */ var uBounds = tcuTexVerifierUtil.computeNonNormalizedCoordBounds(sampler.normalizedCoords, level.getWidth(),	coord[0], prec.coordBits[0], prec.uvwBits[0]);
        /** @type {Array<Number>} */ var vBounds = tcuTexVerifierUtil.computeNonNormalizedCoordBounds(sampler.normalizedCoords, level.getHeight(),	coord[1], prec.coordBits[1], prec.uvwBits[1]);

        // Integer coordinates - without wrap mode
        /** @type {number} */ var minI = Math.floor(uBounds[0]);
        /** @type {number} */ var maxI = Math.floor(uBounds[1]);
        /** @type {number} */ var minJ = Math.floor(vBounds[0]);
        /** @type {number} */ var maxJ = Math.floor(vBounds[1]);

        // \todo [2013-07-03 pyry] This could be optimized by first computing ranges based on wrap mode.

        for (var j = minJ; j <= maxJ; j++)
    	for (var i = minI; i <= maxI; i++) {
            /** @type {number} */ var x = wrap(sampler.wrapS, i, level.getWidth());
            /** @type {number} */ var y = wrap(sampler.wrapT, j, level.getHeight());
            /** @type {Array<Number>} */ var color = lookup<ScalarType>(level, sampler, x, y, coordZ);

    		if (isColorValid(prec, color, result))
    			return true;
    	}

        return false;
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
