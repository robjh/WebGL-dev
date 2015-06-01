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
goog.provide('framework.common.tcuTexLookupVerifier_c');

goog.scope(function() {

	var tcuTexLookupVerifier = framework.common.tcuTexLookupVerifier_c;

// #include "tcuTexLookupVerifier.hpp"
// #include "tcuTexVerifierUtil.hpp"
// #include "tcuVectorUtil.hpp"
// #include "tcuTextureUtil.hpp"
// #include "deMath.h"
// #include "tcuDefs.hpp"
// #include "tcuTexture.hpp"

	/** @typedef {(tcuTexLookupVerifier.LookupPrecision|tcuTexLookupVerifier.IntLookupPrecision)} */
	tcuTexLookupVerifier.PrecType;

	/**
     * Generic lookup precision parameters
     * @typeructor
     */
    tcuTexLookupVerifier.LookupPrecision = function() {
        /** @type {Array<number>} */ this.coordBits = [22, 22, 22];
        /** @type {Array<number>} */ this.uvwBits = [16, 16, 16];
        /** @type {Array<number>} */ this.colorThreshold = [0.0, 0.0, 0.0, 0.0];
        /** @type {Array<boolean>} */ this.colorMask = [true, true, true, true];
    };

	/**
     * @typeructor
     */
    tcuTexLookupVerifier.IntLookupPrecision = function() {
        /** @type {Array<number>} */ this.coordBits = [22, 22, 22];
        /** @type {Array<number>} */ this.uvwBits = [16, 16, 16];
        /** @type {Array<number>} */ this.colorThreshold = [0, 0, 0, 0];
        /** @type {Array<boolean>} */ this.colorMask = [true, true, true, true];
    };

	/**
	 * Lod computation precision parameters
	 * @typeructor
	 */
	tcuTexLookupVerifier.LodPrecision = function() {
		/** @type {number} */ this.derivateBits = 22;
		/** @type {number} */ this.lodBits = 16;
	};

	/**
	 * @enum {number}
	 */
	tcuTexLookupVerifier.TexLookupScaleMode = {
		MINIFY: 0,
		MAGNIFY: 1
	};

	// Generic utilities

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

	// Color read & compare utilities

	/**
	 * @param {tcuTexture.ConstPixelBufferAccess} access
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 * @return {boolean}
	 */
	tcuTexLookupVerifier.coordsInBounds = function(access, x, y, z) {
		return deMath.deInBounds32(x, 0, access.getWidth()) && deMath.deInBounds32(y, 0, access.getHeight()) && deMath.deInBounds32(z, 0, access.getDepth());
	};

	/**
     * @param  {tcuTexture.TextureFormat} format
     * @return {boolean}
     */
    tcuTexLookupVerifier.isSRGB = function(format) {
        return format.order == tcuTexture.ChannelOrder.sRGB || format.order == tcuTexture.ChannelOrder.sRGBA;
    };

	/**
     * @param  {tcuTexture.ConstPixelBufferAccess} access
     * @param  {tcuTexture.Sampler} sampler
     * @param  {number} i
     * @param  {number} j
     * @param  {number} k
     * @return {Array<number>}
     */
    tcuTexLookupVerifier.lookupScalar = function(access, sampler, i, j, k) {
        throw new Error('Not implemented. TODO: implement.');
    	// if (coordsInBounds(access, i, j, k))
    	// 	return access.getPixelT<ScalarType>(i, j, k);
    	// else
    	// 	return sampler.borderColor.cast<ScalarType>();
    };

	/**
     * @param  {tcuTexture.ConstPixelBufferAccess} access
     * @param  {tcuTexture.Sampler} sampler
     * @param  {number} i
     * @param  {number} j
     * @param  {number} k
     * @return {Array<number>}
     */
    tcuTexLookupVerifier.lookupFloat = function(access, sampler, i, j, k) {
    	// Specialization for float lookups: sRGB conversion is performed as specified in format.
    	if (tcuTexLookupVerifier.coordsInBounds(access, i, j, k)) {
    		/** @type {Array<number>} */ var p = access.getPixel(i, j, k);
    		return tcuTexLookupVerifier.isSRGB(access.getFormat()) ? tcuTextureUtil.sRGBToLinear(p) : p;
    	}
    	else
    		return sampler.borderColor;
    };
	/**
	 * @param {tcuTexLookupVerifier.PrecType} prec
	 * @param {Array<number>} ref
	 * @param {Array<number>} result
	 * @return {boolean}
	 */
	tcuTexLookupVerifier.isColorValid = function(prec, ref, result) {
		return deMath.boolAll(
			deMath.logicalOrBool(
				deMath.lessThanEqual(deMath.absDiff(ref, result), prec.colorThreshold),
				deMath.logicalNotBool(prec.colorMask)));
	};

	/**
     * @typeructor
     */
    tcuTexLookupVerifier.ColorQuad = function() {
    	/** @type {Array<number>} */ this.p00;		//!< (0, 0)
    	/** @type {Array<number>} */ this.p01;		//!< (1, 0)
    	/** @type {Array<number>} */ this.p10;		//!< (0, 1)
    	/** @type {Array<number>} */ this.p11;		//!< (1, 1)
    };

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
    	dst.p00	= tcuTexLookupVerifier.lookupFloat(level, sampler, x0, y0, z);
    	dst.p10	= tcuTexLookupVerifier.lookupFloat(level, sampler, x1, y0, z);
    	dst.p01	= tcuTexLookupVerifier.lookupFloat(level, sampler, x0, y1, z);
    	dst.p11	= tcuTexLookupVerifier.lookupFloat(level, sampler, x1, y1, z);
    };

	/**
     * @typeructor
     */
    tcuTexLookupVerifier.ColorLine = function() {
        /** @type {Array<number>} */ this.p0;		//!< 0
        /** @type {Array<number>} */ this.p1;		//!< 1
    };

	/**
	 * @param  {tcuTexLookupVerifier.ColorLine} dst
	 * @param  {tcuTexture.ConstPixelBufferAccess} level
	 * @param  {tcuTexture.Sampler} sampler
	 * @param  {number} x0
	 * @param  {number} x1
	 * @param  {number} y
	 */
	tcuTexLookupVerifier.lookupLine = function(dst, level, sampler, x0, x1, y) {
		dst.p0 = lookupFloat(level, sampler, x0, y, 0);
		dst.p1 = lookupFloat(level, sampler, x1, y, 0);
	};

	/**
     * @param  {Array<number>} vec
     * @return {number}
     */
    tcuTexLookupVerifier.minComp = function(vec) {
    	/** @type {number} */ var minVal = vec[0];
    	for (var ndx = 1; ndx < vec.length; ndx++)
    		minVal = Math.min(minVal, vec[ndx]);
    	return minVal;
    };

    /**
     * @param  {Array<number>} vec
     * @return {number}
     */
    tcuTexLookupVerifier.maxComp = function(vec) {
    	/** @type {number} */ var maxVal = vec[0];
    	for (var ndx = 1; ndx < vec.length; ndx++)
    		maxVal = Math.max(maxVal, vec[ndx]);
    	return maxVal;
    };

	/**
	 * @param  {tcuTexLookupVerifier.LookupPrecision} prec
	 * @param  {tcuTexLookupVerifier.ColorLine} line
	 * @return {number}
	 */
	tcuTexLookupVerifier.computeBilinearSearchStepFromFloatLine = function(prec, line) {
		assertMsgOptions(deMath.boolAll(deMath.greaterThan(prec.colorThreshold, [0.0, 0.0, 0.0, 0.0])), '', false, true);

		/** @type {number} */ var maxSteps = 1<<16;
		/** @type {Array<number>} */ var d = deMath.absDiff(line.p1, line.p0);
		/** @type {Array<number>} */ var stepCount = deMath.divide([d, d, d, d], prec.colorThreshold);
		/** @type {Array<number>} */
		var minStep = deMath.divide([1.0, 1.0, 1.0, 1.0], deMath.add(stepCount, [1.0, 1.0, 1.0, 1.0]));
		/** @type {number} */ var step = deMath.max(tcuTexLookupVerifier.minComp(minStep), 1.0 / maxSteps);

		return step;
	};

	/**
	 * @param  {tcuTexLookupVerifier.LookupPrecision} prec
	 * @param  {tcuTexLookupVerifier.ColorQuad} quad
	 * @return {number}
	 */
	tcuTexLookupVerifier.computeBilinearSearchStepFromFloatQuad = function(prec, quad) {
		assertMsgOptions(deMath.boolAll(deMath.greaterThan(prec.colorThreshold, [0.0, 0.0, 0.0, 0.0])), '', false, true);

		/** @type {number} */ var maxSteps	= 1<<16;
		/** @type {Array<number>} */ var d0 = deMath.absDiff(quad.p10, quad.p00);
		/** @type {Array<number>} */ var d1 = deMath.absDiff(quad.p01, quad.p00);
		/** @type {Array<number>} */ var d2 = deMath.absDiff(quad.p11, quad.p10);
		/** @type {Array<number>} */ var d3 = deMath.absDiff(quad.p11, quad.p01);
		/** @type {Array<number>} */ var maxD = deMath.max(d0, deMath.max(d1, deMath.max(d2, d3)));
		/** @type {Array<number>} */ var stepCount	= deMath.divide(maxD, prec.colorThreshold);
		/** @type {Array<number>} */ var minStep = deMath.divide([1.0, 1.0, 1.0, 1.0], deMath.add(stepCount, [1.0, 1.0, 1.0, 1.0]));
		/** @type {number} */ var step = Math.max(tcuTexLookupVerifier.minComp(minStep), 1.0 / maxSteps);

		return step;
	};

	/**
	 * @param {tcuTexLookupVerifier.LookupPrecision} prec
	 * @return {number}
	 */
	tcuTexLookupVerifier.computeBilinearSearchStepForUnorm = function(prec) {
		assertMsgOptions(deMath.boolAll(deMath.greaterThan(prec.colorThreshold, [0.0, 0.0, 0.0, 0.0])), '', false, true);

		/** @type {Array<number>} */ var stepCount = deMath.divide([1.0, 1.0, 1.0, 1.0], prec.colorThreshold);
		/** @type {Array<number>} */ var minStep = deMath.divide([1.0, 1.0, 1.0, 1.0], (deMath.add(stepCount, [1.0, 1.0, 1.0, 1.0])));
		/** @type {number} */ var step = tcuTexLookupVerifier.minComp(minStep);

		return step;
	};

	/**
     * @param {tcuTexLookupVerifier.LookupPrecision} prec
     * @return {number}
     */
    tcuTexLookupVerifier.computeBilinearSearchStepForSnorm = function(prec) {
    	assertMsgOptions(deMath.boolAll(deMath.greaterThan(prec.colorThreshold, [0.0, 0.0, 0.0, 0.0])), '', false, true);

    	/** @type {Array<number>} */ var stepCount = deMath.divide([2.0, 2.0, 2.0, 2.0], prec.colorThreshold);
    	/** @type {Array<number>} */ var minStep = deMath.divide([1.0, 1.0, 1.0, 1.0], deMath.add(stepCount, [1.0, 1.0, 1.0, 1.0]));
    	/** @type {number} */ var step = tcuTexLookupVerifier.minComp(minStep);

    	return step;
    };

	/**
	 * @param  {tcuTexLookupVerifier.ColorLine} line
	 * @return {Array<number>}
	 */
	tcuTexLookupVerifier.minLine = function(line) {
		var min = deMath.min;
		return min(line.p0, line.p1);
	};

	/**
	* @param  {tcuTexLookupVerifier.ColorLine} line
	* @return {Array<number>}
	*/
	tcuTexLookupVerifier.maxLine = function(line) {
		var max = deMath.max;
		return max(line.p0, line.p1);
	};

	/**
	* @param  {tcuTexLookupVerifier.ColorQuad} quad
	* @return {Array<number>}
	*/
	tcuTexLookupVerifier.minQuad = function(quad) {
		var min = deMath.min;
		return min(quad.p00, min(quad.p10, min(quad.p01, quad.p11)));
	};

	/**
	* @param  {tcuTexLookupVerifier.ColorQuad} quad
	* @return {Array<number>}
	*/
	tcuTexLookupVerifier.maxQuad = function(quad) {
		var max = deMath.max;
		return max(quad.p00, max(quad.p10, max(quad.p01, quad.p11)));
	};

	/**
	 * @param {tcuTexLookupVerifier.LookupPrecision} prec
	 * @param {tcuTexLookupVerifier.ColorQuad} quad
	 * @param {Array<number>} result
	 * @return {boolean}
	 */
	tcuTexLookupVerifier.isInColorBounds_1Quad = function(prec, quad, result) {
		var quadMin = tcuTexLookupVerifier.minQuad;
		var quadMax = tcuTexLookupVerifier.maxQuad;
		/** @type {Array<number>} */ var minVal = deMath.subtract(quadMin(quad), prec.colorThreshold);
		/** @type {Array<number>} */ var maxVal = deMath.add(quadMax(quad), prec.colorThreshold);
		return deMath.boolAll(
			deMath.logicalOrBool(
				deMath.logicalAndBool(
					deMath.greaterThanEqual(result, minVal),
					deMath.lessThanEqual(result, maxVal)),
				deMath.logicalNotBool(prec.colorMask)));
	};

	/**
	 * @param {tcuTexLookupVerifier.LookupPrecision} prec
	 * @param {tcuTexLookupVerifier.ColorQuad} quad0
	 * @param {tcuTexLookupVerifier.ColorQuad} quad1
	 * @param {Array<number>} result
	 * @return {boolean}
	 */
	tcuTexLookupVerifier.isInColorBounds_2Quad = function(prec, quad0, quad1, result) {
		var min = deMath.min;
		var max = deMath.max;
		var quadMin = tcuTexLookupVerifier.minQuad;
		var quadMax = tcuTexLookupVerifier.maxQuad;
		/** @type {Array<number>} */ var minVal = deMath.subtract(min(quadMin(quad0), quadMin(quad1)), prec.colorThreshold);
		/** @type {Array<number>} */ var maxVal = deMath.add(max(quadMax(quad0), quadMax(quad1)), prec.colorThreshold);
		return deMath.boolAll(
			deMath.logicalOrBool(
				deMath.logicalAndBool(
					deMath.greaterThanEqual(result, minVal),
					deMath.lessThanEqual(result, maxVal)),
				deMath.logicalNotBool(prec.colorMask)));
	};

	/**
	 * @param {tcuTexLookupVerifier.LookupPrecision} prec
	 * @param {tcuTexLookupVerifier.ColorLine} line0
	 * @param {tcuTexLookupVerifier.ColorLine} line1
	 * @param {Array<number>} result
	 * @return {boolean}
	 */
	tcuTexLookupVerifier.isInColorBounds_2Line = function(prec, line0, line1, result) {
		var min = deMath.min;
		var max = deMath.max;
		var lineMin = tcuTexLookupVerifier.minLine;
		var lineMax = tcuTexLookupVerifier.maxLine;
		/** @type {Array<number>} */ var minVal = deMath.subtract(min(lineMin(line0), lineMin(line1)), prec.colorThreshold);
		/** @type {Array<number>} */ var maxVal = deMath.add(max(lineMax(line0), lineMax(line1)), prec.colorThreshold);
		return deMath.boolAll(
			deMath.logicalOrBool(
				deMath.logicalAndBool(
					deMath.greaterThanEqual(result, minVal),
					deMath.lessThanEqual(result, maxVal)),
				deMath.logicalNotBool(prec.colorMask)));
	};

	/**
	* @param {tcuTexLookupVerifier.LookupPrecision} prec
	* @param {tcuTexLookupVerifier.ColorQuad} quad00
	* @param {tcuTexLookupVerifier.ColorQuad} quad01
	* @param {tcuTexLookupVerifier.ColorQuad} quad10
	* @param {tcuTexLookupVerifier.ColorQuad} quad11
	* @param {Array<number>} result
	* @return {boolean}
	*/
	tcuTexLookupVerifier.isInColorBounds_4Quad = function(prec, quad00, quad01, quad10, quad11, result) {
		var min = deMath.min;
		var max = deMath.max;
		var quadMin = tcuTexLookupVerifier.minQuad;
		var quadMax = tcuTexLookupVerifier.maxQuad;
		/** @type {Array<number>} */ var minVal = deMath.subtract(min(quadMin(quad00), min(quadMin(quad01), min(quadMin(quad10), quadMin(quad11)))), prec.colorThreshold);
		/** @type {Array<number>} */ var maxVal = deMath.add(max(quadMax(quad00), max(quadMax(quad01), max(quadMax(quad10), quadMax(quad11)))), prec.colorThreshold);
		return deMath.boolAll(
			deMath.logicalOrBool(
				deMath.logicalAndBool(
					deMath.greaterThanEqual(result, minVal),
					deMath.lessThanEqual(result, maxVal)),
				deMath.logicalNotBool(prec.colorMask)));
	};

	// Range search utilities

	/**
	 * @param {tcuTexLookupVerifier.LookupPrecision} prec
	 * @param {Array<number>} c0
	 * @param {Array<number>} c1
	 * @param {Array<number>} fBounds
	 * @param {Array<number>} result
	 * @return {boolean}
	 */
	tcuTexLookupVerifier.isLinearRangeValid = function(prec, c0, c1, fBounds, result) {
		// This is basically line segment - AABB test. Valid interpolation line is checked
		// against result AABB constructed by applying threshold.

		/** @type {Array<number>} */ var i0 = deMath.add(deMath.scale(c0, (1.0 - fBounds[0])), deMath.scale(c1, fBounds[0]));
		/** @type {Array<number>} */ var i1 = deMath.add(deMath.scale(c0, (1.0 - fBounds[1])), deMath.scale(c1, fBounds[1]));
		/** @type {Array<number>} */ var rMin = deMath.subtract(result, prec.colorThreshold);
		/** @type {Array<number>} */ var rMax = deMath.add(result, prec.colorThreshold);
		/** @type {boolean} */ var allIntersect	= true;

		// Algorithm: For each component check whether segment endpoints are inside, or intersect with slab.
		// If all intersect or are inside, line segment intersects the whole 4D AABB.
		for (var compNdx = 0; compNdx < 4; compNdx++) {
			if (!prec.colorMask[compNdx])
				continue;

			// Signs for both bounds: false = left, true = right.
			/** @type {boolean} */ var sMin0 = i0[compNdx] >= rMin[compNdx];
			/** @type {boolean} */ var sMin1 = i1[compNdx] >= rMin[compNdx];
			/** @type {boolean} */ var sMax0 = i0[compNdx] > rMax[compNdx];
			/** @type {boolean} */ var sMax1 = i1[compNdx] > rMax[compNdx];

			// If all signs are equal, line segment is outside bounds.
			if (sMin0 == sMin1 && sMin1 == sMax0 && sMax0 == sMax1) {
				allIntersect = false;
				break;
			}
		}

		return allIntersect;
	};

	/**
	 * @param {tcuTexLookupVerifier.LookupPrecision} prec
	 * @param {tcuTexLookupVerifier.ColorQuad} quad
	 * @param {Array<number>} xBounds
	 * @param {Array<number>} yBounds
	 * @param {number} searchStep
	 * @param {Array<number>} result
	 * @return {boolean}
	*/
	tcuTexLookupVerifier.isBilinearRangeValid = function(prec, quad, xBounds, yBounds, searchStep, result) {
		assertMsgOptions(xBounds[0] <= xBounds[1], '', false, true);
		assertMsgOptions(yBounds[0] <= yBounds[1], '', false, true);

		if (!tcuTexLookupVerifier.isInColorBounds_1Quad(prec, quad, result))
			return false;

		for (var x = xBounds[0]; x < xBounds[1] + searchStep; x += searchStep) {
			/** @type {number} */ var a = Math.min(x, xBounds[1]);
			/** @type {Array<number>} */ var c0 = deMath.add(deMath.scale(quad.p00, (1.0 - a)), deMath.scale(quad.p10, a));
			/** @type {Array<number>} */ var c1 = deMath.add(deMath.scale(quad.p01, (1.0 - a)), deMath.scale(quad.p11, a));

			if (tcuTexLookupVerifier.isLinearRangeValid(prec, c0, c1, yBounds, result))
				return true;
		}

		return false;
	};

	/**
	* @param {tcuTexLookupVerifier.LookupPrecision} prec
	* @param {tcuTexLookupVerifier.ColorQuad} quad0
	* @param {tcuTexLookupVerifier.ColorQuad} quad1
	* @param {Array<number>} xBounds
	* @param {Array<number>} yBounds
	* @param {Array<number>} zBounds
	* @param {number} searchStep
	* @param {Array<number>} result
	* @return {boolean}
	*/
	tcuTexLookupVerifier.isTrilinearRangeValid = function(prec, quad0, quad1, xBounds, yBounds, zBounds, searchStep, result) {
		assertMsgOptions(xBounds[0] <= xBounds[1], '', false, true);
		assertMsgOptions(yBounds[0] <= yBounds[1], '', false, true);
		assertMsgOptions(zBounds[0] <= zBounds[1], '', false, true);

		if (!tcuTexLookupVerifier.isInColorBounds_2Quad(prec, quad0, quad1, result))
			return false;

		for (var x = xBounds[0]; x < xBounds[1] + searchStep; x += searchStep) {
			for (var y = yBounds[0]; y < yBounds[1] + searchStep; y += searchStep) {
				/** @type {number} */ var a = Math.min(x, xBounds[1]);
				/** @type {number} */ var b = Math.min(y, yBounds[1]);
				/** @type {Array<number>} */
				var c0 = deMath.add(
							deMath.add(
								deMath.add(
									deMath.scale(quad0.p00, (1.0 - a) * (1.0 - b)),
									deMath.scale(quad0.p10, a * (1.0 - b))),
								deMath.scale(quad0.p01, (1.0 - a) * b)),
							deMath.scale(quad0.p11, a * b));
				/** @type {Array<number>} */
				var c1 = deMath.add(
							deMath.add(
								deMath.add(
									deMath.scale(quad1.p00, (1.0 - a) * (1.0 - b)),
									deMath.scale(quad1.p10, a * (1.0 - b))),
								deMath.scale(quad1.p01, (1.0 - a) * b)),
							deMath.scale(quad1.p11, a * b));

				if (tcuTexLookupVerifier.isLinearRangeValid(prec, c0, c1, zBounds, result))
					return true;
			}
		}

		return false;
	};

	/**
	* @param {tcuTexLookupVerifier.LookupPrecision} prec
	* @param {tcuTexLookupVerifier.ColorLIne} line0
	* @param {tcuTexLookupVerifier.ColorLIne} line1
	* @param {Array<number>} xBounds0
	* @param {Array<number>} xBounds1
	* @param {Array<number>} zBounds
	* @param {number} searchStep
	* @param {Array<number>} result
	* @return {boolean}
	*/
	tcuTexLookupVerifier.is1DTrilinearFilterResultValid = function(prec, line0, line1, xBounds0, xBounds1, zBounds, searchStep, result) {
		assertMsgOptions(xBounds0[0] <= xBounds0[1], '', false, true);
		assertMsgOptions(xBounds1[0] <= xBounds1[1], '', false, true);

		if (!tcuTexLookupVerifier.isInColorBounds_2Line(prec, line0, line1, result))
			return false;

		for (var x0 = xBounds0[0]; x0 < xBounds0[1] + searchStep; x0 += searchStep) {
			/** @type {number} */ var a0 = Math.min(x0, xBounds0[1]);
			/** @type {Array<number>} */ var c0 = deMath.add(deMath.scale(line0.p0, (1.0 - a0)), deMath.scale(line0.p1, a0));

			for (var x1 = xBounds1[0]; x1 <= xBounds1[1]; x1 += searchStep) {
				/** @type {number} */ var a1 = Math.min(x1, xBounds1[1]);
				/** @type {Array<number>} */ var c1 = deMath.add(deMath.scale(line1.p0, (1.0 - a1)), deMath.scale(line1.p1, a1));

				if (tcuTexLookupVerifier.isLinearRangeValid(prec, c0, c1, zBounds, result))
					return true;
			}
		}

		return false;
	};

	/**
	* @param {tcuTexLookupVerifier.LookupPrecision} prec
	* @param {tcuTexLookupVerifier.ColorQuad} quad0
	* @param {tcuTexLookupVerifier.ColorQuad} quad1
	* @param {Array<number>} xBounds0
	* @param {Array<number>} yBounds0
	* @param {Array<number>} xBounds1
	* @param {Array<number>} yBounds1
	* @param {Array<number>} zBounds
	* @param {number} searchStep
	* @param {Array<number>} result
	* @return {boolean}
	*/
	tcuTexLookupVerifier.is2DTrilinearFilterResultValid = function(prec, quad0, quad1, xBounds0, yBounds0, xBounds1, yBounds1, zBounds, searchStep, result) {
		assertMsgOptions(xBounds0[0] <= xBounds0[1], '', false, true);
		assertMsgOptions(yBounds0[0] <= yBounds0[1], '', false, true);
		assertMsgOptions(xBounds1[0] <= xBounds1[1], '', false, true);
		assertMsgOptions(yBounds1[0] <= yBounds1[1], '', false, true);

		if (!tcuTexLookupVerifier.isInColorBounds_2Quad(prec, quad0, quad1, result))
			return false;

		for (var x0 = xBounds0[0]; x0 < xBounds0[1] + searchStep; x0 += searchStep) {
			for (var y0 = yBounds0[0]; y0 < yBounds0[1] + searchStep; y0 += searchStep) {
				/** @type {number} */ var a0 = Math.min(x0, xBounds0[1]);
				/** @type {number} */ var b0 = Math.min(y0, yBounds0[1]);
				/** @type {Array<number>} */
				var c0 = deMath.add(
							deMath.add(
								deMath.add(
									deMath.scale(quad0.p00, (1.0 - a0) * (1.0 - b0)),
									deMath.scale(quad0.p10, a0 * (1.0 - b0))),
								deMath.scale(quad0.p01, (1.0 - a0) * b0)),
							deMath.scale(quad0.p11, a0 * b0));

				for (float x1 = xBounds1[0]; x1 <= xBounds1[1]; x1 += searchStep) {
					for (float y1 = yBounds1[0]; y1 <= yBounds1[1]; y1 += searchStep) {
						/** @type {number} */ var a1 = Math.min(x1, xBounds1[1]);
						/** @type {number} */ var b1 = Math.min(y1, yBounds1[1]);
						/** @type {Array<number>} */
						var c1 = deMath.add(
									deMath.add(
										deMath.add(
											deMath.scale(quad1.p00, (1.0 - a1) * (1.0 - b1)),
											deMath.scale(quad1.p10, a1 * (1.0 - b1))),
										deMath.scale(quad1.p01, (1.0 - a1) * b1)),
									deMath.scale(quad1.p11, a1 * b1));

						if (tcuTexLookupVerifier.isLinearRangeValid(prec, c0, c1, zBounds, result))
							return true;
					}
				}
			}
		}

		return false;
	};

	/**
	* @param {tcuTexLookupVerifier.LookupPrecision} prec
	* @param {tcuTexLookupVerifier.ColorQuad} quad00
	* @param {tcuTexLookupVerifier.ColorQuad} quad01
	* @param {tcuTexLookupVerifier.ColorQuad} quad10
	* @param {tcuTexLookupVerifier.ColorQuad} quad11
	* @param {Array<number>} xBounds0
	* @param {Array<number>} yBounds0
	* @param {Array<number>} zBounds0
	* @param {Array<number>} xBounds1
	* @param {Array<number>} yBounds1
	* @param {Array<number>} zBounds1
	* @param {Array<number>} wBounds
	* @param {number} searchStep
	* @param {Array<number>} result
	* @return {boolean}
	*/
	tcuTexLookupVerifier.is3DTrilinearFilterResultValid = function(prec, quad00, quad01, quad10, quad11, xBounds0, yBounds0, zBounds0, xBounds1, yBounds1, zBounds1, wBounds, searchStep, result) {
		assertMsgOptions(xBounds0[0] <= xBounds0[1], '', false, true);
		assertMsgOptions(yBounds0[0] <= yBounds0[1], '', false, true);
		assertMsgOptions(zBounds0[0] <= zBounds0[1], '', false, true);
		assertMsgOptions(xBounds1[0] <= xBounds1[1], '', false, true);
		assertMsgOptions(yBounds1[0] <= yBounds1[1], '', false, true);
		assertMsgOptions(zBounds1[0] <= zBounds1[1], '', false, true);

		if (!tcuTexLookupVerifier.isInColorBounds_4Quad(prec, quad00, quad01, quad10, quad11, result))
			return false;

		for (var x0 = xBounds0[0]; x0 < xBounds0[1] + searchStep; x0 += searchStep) {
			for (var y0 = yBounds0[0]; y0 < yBounds0[1] + searchStep; y0 += searchStep) {
				/** @type {number} */ var a0 = Math.min(x0, xBounds0[1]);
				/** @type {number} */ var b0 = Math.min(y0, yBounds0[1]);
				/** @type {Array<number>} */
				var c00 = deMath.add(
							deMath.add(
								deMath.add(
									deMath.scale(quad00.p00, (1.0 - a0) * (1.0 - b0)),
									deMath.scale(quad00.p10, a0 * (1.0 - b0))),
								deMath.scale(quad00.p01, (1.0 - a0) * b0)),
							deMath.scale(quad00.p11, a0 * b0));
				/** @type {Array<number>} */
				var c01 = deMath.add(
							deMath.add(
								deMath.add(
									deMath.scale(quad01.p00, (1.0 - a0) * (1.0 - b0)),
									deMath.scale(quad01.p10, a0 * (1.0 - b0))),
								deMath.scale(quad01.p01, (1.0 - a0) * b0)),
							deMath.scale(quad01.p11, a0 * b0));

				for (var z0 = zBounds0[0]; z0 < zBounds0[1] + searchStep; z0 += searchStep) {
					/** @type {number} */ var c0 = Math.min(z0, zBounds0[1]);
					/** @type {Array<number>} */ var cz0 = deMath.add(deMath.scale(c00, (1.0 - c0)), deMath.scale(c01, c0));

					for (var x1 = xBounds1[0]; x1 < xBounds1[1] + searchStep; x1 += searchStep) {
						for (var y1 = yBounds1[0]; y1 < yBounds1[1] + searchStep; y1 += searchStep) {
							/** @type {number} */ var a1 = Math.min(x1, xBounds1[1]);
							/** @type {number} */ var b1 = Math.min(y1, yBounds1[1]);
							/** @type {Array<number>} */
							var c10 = deMath.add(
										deMath.add(
											deMath.add(
												deMath.scale(quad10.p00, (1.0 - a1) * (1.0 - b1)),
												deMath.scale(quad10.p10, a1*(1.0-b1))),
											deMath.scale(quad10.p01, (1.0-a1)*b1)),
										deMath.scale(quad10.p11, a1*b1));
							/** @type {Array<number>} */
							var c11 = deMath.add(
										deMath.add(
											deMath.add(
												deMath.scale(quad11.p00, (1.0 - a1) * (1.0 - b1)),
												deMath.scale(quad11.p10, a1*(1.0-b1))),
											deMath.scale(quad11.p01, (1.0-a1)*b1)),
										deMath.scale(quad11.p11, a1*b1));

							for (var z1 = zBounds1[0]; z1 < zBounds1[1] + searchStep; z1 += searchStep) {
								/** @type {number} */ var c1 = Math.min(z1, zBounds1[1]);
								/** @type {Array<number>} */
								var cz1 = deMath.add(deMath.scale(c10, (1.0 - c1)), deMath.scale(c11, c1));

								if (tcuTexLookupVerifier.isLinearRangeValid(prec, cz0, cz1, wBounds, result))
									return true;
							}
						}
					}
				}
			}
		}

		return false;
	};

// template<typename PrecType, typename ScalarType>

	/**
	 * @param {tcuTexture.ConstPixelBufferAccess} level
	 * @param {tcuTexture.Sampler} sampler
	 * @param {tcuTexLookupVerifier.PrecType} prec
	 * @param {number} coordX
	 * @param {number} coordY
	 * @param {Array<number>} result
	 * @return {boolean}
	 */
	tcuTexLookupVerifier.isNearestSampleResultValid_CoordXYAsNumber = function(level, sampler, prec, coordX, coordY, result) {
		assertMsgOptions(level.getDepth() == 1, '', false, true);

		/** @type {Array<number>} */
		var uBounds = tcuTexVerifierUtil.computeNonNormalizedCoordBounds(
			sampler.normalizedCoords, level.getWidth(), coordX, prec.coordBits[0], prec.uvwBits[0]);

		/** @type {number} */ var minI = Math.floor(uBounds[0]);
		/** @type {number} */ var maxI = Math.floor(uBounds[1]);

		for (var i = minI; i <= maxI; i++) {
			/** @type {number} */ var x = tcuTexVerifierUtil.wrap(sampler.wrapS, i, level.getWidth());
			/** @type {Array<number>} */ var color	= tcuTexLookupVerifier.lookupScalar(level, sampler, x, coordY, 0);

			if (tcuTexLookupVerifier.isColorValid(prec, color, result))
				return true;
		}

		return false;
	};

	/**
     * @param {tcuTexture.ConstPixelBufferAccess} level
     * @param {tcuTexture.Sampler} sampler
     * @param {tcuTexLookupVerifier.PrecType} prec
     * @param {Array<number>} coord vec2
     * @param {number} coordZ int
     * @param {Array<number>} result
     * @return {boolean}
     */
    tcuTexLookupVerifier.isNearestSampleResultValid_CoordAsVec2AndInt = function(level, sampler, prec, coord, coordZ, result) {
        /** @type {Array<number>} */
		var uBounds = tcuTexVerifierUtil.computeNonNormalizedCoordBounds(
			sampler.normalizedCoords, level.getWidth(), coord[0], prec.coordBits[0], prec.uvwBits[0]);
        /** @type {Array<number>} */
		var vBounds = tcuTexVerifierUtil.computeNonNormalizedCoordBounds(
			sampler.normalizedCoords, level.getHeight(), coord[1], prec.coordBits[1], prec.uvwBits[1]);

        // Integer coordinates - without wrap mode
        /** @type {number} */ var minI = Math.floor(uBounds[0]);
        /** @type {number} */ var maxI = Math.floor(uBounds[1]);
        /** @type {number} */ var minJ = Math.floor(vBounds[0]);
        /** @type {number} */ var maxJ = Math.floor(vBounds[1]);

        // \todo [2013-07-03 pyry] This could be optimized by first computing ranges based on wrap mode.

        for (var j = minJ; j <= maxJ; j++)
    	for (var i = minI; i <= maxI; i++) {
            /** @type {number} */ var x = tcuTexVerifierUtil.wrap(sampler.wrapS, i, level.getWidth());
            /** @type {number} */ var y = tcuTexVerifierUtil.wrap(sampler.wrapT, j, level.getHeight());
            /** @type {Array<number>} */ var colorScalar = tcuTexLookupVerifier.lookupScalar(level, sampler, x, y, coordZ);

    		if (isColorValid(prec, color, result))
    			return true;
    	}

        return false;
    };

	/**
	* @param {tcuTexture.ConstPixelBufferAccess} level
	* @param {tcuTexture.Sampler} sampler
	* @param {tcuTexLookupVerifier.PrecType} prec
	* @param {Array<number>} coord vec3
	* @param {Array<number>} result
	* @return {boolean}
	*/
	tcuTexLookupVerifier.isNearestSampleResultValid_CoordAsVec3 = function(level, sampler, prec, coord, result) {
		/** @type {Array<number>} */
		var uBounds = tcuTexVerifierUtil.computeNonNormalizedCoordBounds(
			sampler.normalizedCoords, level.getWidth(), coord[0], prec.coordBits[0], prec.uvwBits[0]);
		/** @type {Array<number>} */
		var vBounds = tcuTexVerifierUtil.computeNonNormalizedCoordBounds(
			sampler.normalizedCoords, level.getHeight(), coord[1], prec.coordBits[1], prec.uvwBits[1]);
		/** @type {Array<number>} */
		var wBounds = tcuTexVerifierUtil.computeNonNormalizedCoordBounds(
			sampler.normalizedCoords, level.getDepth(), coord[2], prec.coordBits[2], prec.uvwBits[2]);

		// Integer coordinates - without wrap mode
		/** @type {number} */ var minI = Math.floor(uBounds[0]);
		/** @type {number} */ var maxI = Math.floor(uBounds[1]);
		/** @type {number} */ var minJ = Math.floor(vBounds[0]);
		/** @type {number} */ var maxJ = Math.floor(vBounds[1]);
		/** @type {number} */ var minK = Math.floor(wBounds[0]);
		/** @type {number} */ var maxK = Math.floor(wBounds[1]);

		// \todo [2013-07-03 pyry] This could be optimized by first computing ranges based on wrap mode.

		for (var k = minK; k <= maxK; k++) {
			for (var j = minJ; j <= maxJ; j++) {
				for (var i = minI; i <= maxI; i++) {
					/** @type {number} */ var x = tcuTexVerifierUtil.wrap(sampler.wrapS, i, level.getWidth());
					/** @type {number} */ var y = tcuTexVerifierUtil.wrap(sampler.wrapT, j, level.getHeight());
					/** @type {number} */ var z = tcuTexVerifierUtil.wrap(sampler.wrapR, k, level.getDepth());
					/** @type {Array<number>} */ var color= tcuTexLookupVerifier.lookupScalar(level, sampler, x, y, z);

					if (tcuTexLookupVerifier.isColorValid(prec, color, result))
						return true;
				}
			}
		}

		return false;
	};


	/**
	* @param {tcuTexture.ConstPixelBufferAccess} level
	* @param {tcuTexture.Sampler} sampler
	* @param {tcuTexLookupVerifier.PrecType} prec
	* @param {number} coordX
	* @param {number} coordY
	* @param {Array<number>} result
	* @return {boolean}
	*/
	tcuTexLookupVerifier.isLinearSampleResultValid_CoordXYAsNumber = function(level, sampler, prec, coordX, coordY, result) {
		/** @type {Array<number>} */ var uBounds			= tcuTexVerifierUtil.computeNonNormalizedCoordBounds(sampler.normalizedCoords, level.getWidth(), coordX, prec.coordBits[0], prec.uvwBits[0]);

		/** @type {number} */ var minI = Math.floor(uBounds[0]-0.5);
		/** @type {number} */ var maxI = Math.floor(uBounds[1]-0.5);

		/** @type {number} */ var w = level.getWidth();

		for (int i = minI; i <= maxI; i++) {
			// Wrapped coordinates
			/** @type {number} */ var x0 = tcuTexVerifierUtil.wrap(sampler.wrapS, i, w);
			/** @type {number} */ var x1 = tcuTexVerifierUtil.wrap(sampler.wrapS, i + 1, w);

			// Bounds for filtering factors
			/** @type {number} */ var minA	= deMath.clamp((uBounds[0] - 0.5) - i, 0.0, 1.0);
			/** @type {number} */ var maxA	= deMath.clamp((uBounds[1] - 0.5) - i, 0.0, 1.0);

			/** @type {Array<number>} */ var colorA	= tcuTexLookupVerifier.lookupFloat(level, sampler, x0, coordY, 0);
			/** @type {Array<number>} */ var colorB	= tcuTexLookupVerifier.lookupFloat(level, sampler, x1, coordY, 0);

			if (tcuTexLookupVerifier.isLinearRangeValid(prec, colorA, colorB, Vec2(minA, maxA), result))
				return true;
		}

		return false;
	};


	/**
     * @param {tcuTexture.ConstPixelBufferAccess} level
     * @param {tcuTexture.Sampler} sampler
     * @param {tcuTexLookupVerifier.PrecType} prec
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
            /** @type {number} */ var x0 = tcuTexVerifierUtil.wrap(sampler.wrapS, i, w);
            /** @type {number} */ var x1 = tcuTexVerifierUtil.wrap(sampler.wrapS, i + 1, w);
            /** @type {number} */ var y0 = tcuTexVerifierUtil.wrap(sampler.wrapT, j, h);
            /** @type {number} */ var y1 = tcuTexVerifierUtil.wrap(sampler.wrapT, j + 1, h);

			// Bounds for filtering factors
            /** @type {number} */ var minA	= deMath.clamp((uBounds[0] - 0.5) - i, 0.0, 1.0);
            /** @type {number} */ var maxA	= deMath.clamp((uBounds[1] - 0.5) - i, 0.0, 1.0);
            /** @type {number} */ var minB	= deMath.clamp((vBounds[0] - 0.5) - j, 0.0, 1.0);
            /** @type {number} */ var maxB	= deMath.clamp((vBounds[1] - 0.5) - j, 0.0, 1.0);

            /** @type {tcuTexLookupVerifier.ColorQuad} */ var quad;
            tcuTexLookupVerifier.lookupQuad(quad, level, sampler, x0, x1, y0, y1, coordZ);

			if (texClass == tcuTextureUtil.TextureChannelClass.FLOATING_POINT)
				searchStep = tcuTexLookupVerifier.computeBilinearSearchStepFromFloatQuad(prec, quad);

			if (tcuTexLookupVerifier.isBilinearRangeValid(prec, quad, [minA, maxA], [minB, maxB], searchStep, result))
				return true;
		}

    	return false;
	};

	/**
	* @param {tcuTexture.ConstPixelBufferAccess} level
	* @param {tcuTexture.Sampler} sampler
	* @param {tcuTexLookupVerifier.PrecType} prec
	* @param {Array<number>} coord vec3
	* @param {Array<number>} result
	* @return {boolean}
	*/
	tcuTexLookupVerifier.isLinearSampleResultValid_CoordAsVec3 = function(level, sampler, prec, coord, result) {
		/** @type {Array<number>} */
		var uBounds = tcuTexVerifierUtil.computeNonNormalizedCoordBounds(
			sampler.normalizedCoords, level.getWidth(), coord[0], prec.coordBits[0], prec.uvwBits[0]);
		/** @type {Array<number>} */
		var vBounds = tcuTexVerifierUtil.computeNonNormalizedCoordBounds(
			sampler.normalizedCoords, level.getHeight(), coord[1], prec.coordBits[1], prec.uvwBits[1]);
		/** @type {Array<number>} */
		var wBounds = tcuTexVerifierUtil.computeNonNormalizedCoordBounds(
			sampler.normalizedCoords, level.getDepth(), coord[2], prec.coordBits[2], prec.uvwBits[2]);

		// Integer coordinate bounds for (x0,y0) - without wrap mode
		/** @type {number} */ var minI = Math.floor(uBounds[0] - 0.5);
		/** @type {number} */ var maxI = Math.floor(uBounds[1] - 0.5);
		/** @type {number} */ var minJ = Math.floor(vBounds[0] - 0.5);
		/** @type {number} */ var maxJ = Math.floor(vBounds[1] - 0.5);
		/** @type {number} */ var minK = Math.floor(wBounds[0] - 0.5);
		/** @type {number} */ var maxK = Math.floor(wBounds[1] - 0.5);

		/** @type {number} */ var w = level.getWidth();
		/** @type {number} */ var h = level.getHeight();
		/** @type {number} */ var d = level.getDepth();

		/** @type {tcuTextureUtil.TextureChannelClass} */
		var texClass = tcuTextureUtil.getTextureChannelClass(level.getFormat().type);
		/** @type {number} */
		var searchStep = (texClass == tcuTextureUtil.TextureChannelClass.UNSIGNED_FIXED_POINT) ? tcuTexLookupVerifier.computeBilinearSearchStepForUnorm(prec) :
						 (texClass == tcuTextureUtil.TextureChannelClass.SIGNED_FIXED_POINT) ? tcuTexLookupVerifier.computeBilinearSearchStepForSnorm(prec) :
						 0.0; // Step is computed for floating-point quads based on texel values.

		// \todo [2013-07-03 pyry] This could be optimized by first computing ranges based on wrap mode.

		for (var k = minK; k <= maxK; k++) {
			for (var j = minJ; j <= maxJ; j++) {
				for (var i = minI; i <= maxI; i++) {
					// Wrapped coordinates
					/** @type {number} */ var x0 = tcuTexVerifierUtil.wrap(sampler.wrapS, i, w);
					/** @type {number} */ var x1 = tcuTexVerifierUtil.wrap(sampler.wrapS, i + 1, w);
					/** @type {number} */ var y0 = tcuTexVerifierUtil.wrap(sampler.wrapT, j, h);
					/** @type {number} */ var y1 = tcuTexVerifierUtil.wrap(sampler.wrapT, j + 1, h);
					/** @type {number} */ var z0 = tcuTexVerifierUtil.wrap(sampler.wrapR, k, d);
					/** @type {number} */ var z1 = tcuTexVerifierUtil.wrap(sampler.wrapR, k + 1, d);

					// Bounds for filtering factors
					/** @type {number} */ var minA = deMath.clamp((uBounds[0] - 0.5) - i, 0.0, 1.0);
					/** @type {number} */ var maxA = deMath.clamp((uBounds[1] - 0.5) - i, 0.0, 1.0);
					/** @type {number} */ var minB = deMath.clamp((vBounds[0] - 0.5) - j, 0.0, 1.0);
					/** @type {number} */ var maxB = deMath.clamp((vBounds[1] - 0.5) - j, 0.0, 1.0);
					/** @type {number} */ var minC = deMath.clamp((wBounds[0] - 0.5) - k, 0.0, 1.0);
					/** @type {number} */ var maxC = deMath.clamp((wBounds[1] - 0.5) - k, 0.0, 1.0);

					/** @type {tcuTexLookupVerifier.ColorQuad} */ var quad0;
					/** @type {tcuTexLookupVerifier.ColorQuad} */ var quad1;
					tcuTexLookupVerifier.lookupQuad(quad0, level, sampler, x0, x1, y0, y1, z0);
					tcuTexLookupVerifier.lookupQuad(quad1, level, sampler, x0, x1, y0, y1, z1);

					if (texClass == tcuTextureUtil.TextureChannelClass.FLOATING_POINT)
						searchStep = Math.min(tcuTexLookupVerifier.computeBilinearSearchStepFromFloatQuad(prec, quad0), tcuTexLookupVerifier.computeBilinearSearchStepFromFloatQuad(prec, quad1));

					if (tcuTexLookupVerifier.isTrilinearRangeValid(prec, quad0, quad1, [minA, maxA], [minB, maxB], [minC, maxC], searchStep, result))
						return true;
				}
			}
		}

		return false;
	};

	/**
	* @param {tcuTexture.ConstPixelBufferAccess} level0
	* @param {tcuTexture.ConstPixelBufferAccess} level1
	* @param {tcuTexture.Sampler} sampler
	* @param {tcuTexLookupVerifier.PrecType} prec
	* @param {number} coord
	* @param {number} coordY
	* @param {Array<number>} fBounds
	* @param {Array<number>} result
	* @return {boolean}
	*/
	tcuTexLookupVerifier.isNearestMipmapLinearSampleResultValid_CoordXYAsNumber = function(level0, level1, sampler, prec, coord, coordY, fBounds, result) {
		/** @type {number} */ var w0 = level0.getWidth();
		/** @type {number} */ var w1 = level1.getWidth();

		/** @type {Array<number>} */
		var uBounds0 = tcuTexVerifierUtil.computeNonNormalizedCoordBounds(
			sampler.normalizedCoords, w0, coord, prec.coordBits[0], prec.uvwBits[0]);
		/** @type {Array<number>} */
		var uBounds1 = tcuTexVerifierUtil.computeNonNormalizedCoordBounds(
			sampler.normalizedCoords, w1, coord, prec.coordBits[0], prec.uvwBits[0]);

		// Integer coordinates - without wrap mode
		/** @type {number} */ var minI0 = Math.floor(uBounds0[0]);
		/** @type {number} */ var maxI0 = Math.floor(uBounds0[1]);
		/** @type {number} */ var minI1 = Math.floor(uBounds1[0]);
		/** @type {number} */ var maxI1 = Math.floor(uBounds1[1]);

		for (var i0 = minI0; i0 <= maxI0; i0++) {
			for (var i1 = minI1; i1 <= maxI1; i1++) {
				/** @type {Array<number>} */
				var c0 = tcuTexLookupVerifier.lookupFloat(level0, sampler, tcuTexVerifierUtil.wrap(sampler.wrapS, i0, w0), coordY, 0);
				/** @type {Array<number>} */
				var c1 = tcuTexLookupVerifier.lookupFloat(level1, sampler, tcuTexVerifierUtil.wrap(sampler.wrapS, i1, w1), coordY, 0);

				if (tcuTexLookupVerifier.isLinearRangeValid(prec, c0, c1, fBounds, result))
					return true;
			}
		}

		return false;
	};


	/**
	* @param {tcuTexture.ConstPixelBufferAccess} level0
	* @param {tcuTexture.ConstPixelBufferAccess} level1
	* @param {tcuTexture.Sampler} sampler
	* @param {tcuTexLookupVerifier.PrecType} prec
	* @param {Array<number>} coord
	* @param {number} coordZ
	* @param {Array<number>} fBounds
	* @param {Array<number>} result
	* @return {boolean}
	*/
	tcuTexLookupVerifier.isNearestMipmapLinearSampleResultValid_CoordAsVec2AndInt = function(level0, level1, sampler, prec, coord, coordZ, fBounds, result) {
		/** @type {number} */ var w0 = level0.getWidth();
		/** @type {number} */ var w1 = level1.getWidth();
		/** @type {number} */ var h0 = level0.getHeight();
		/** @type {number} */ var h1 = level1.getHeight();

		/** @type {Array<number>} */
		var uBounds0 = tcuTexVerifierUtil.computeNonNormalizedCoordBounds(
			sampler.normalizedCoords, w0, coord[0], prec.coordBits[0], prec.uvwBits[0]);
		/** @type {Array<number>} */
		var uBounds1 = tcuTexVerifierUtil.computeNonNormalizedCoordBounds(
			sampler.normalizedCoords, w1, coord[0], prec.coordBits[0], prec.uvwBits[0]);
		/** @type {Array<number>} */
		var vBounds0 = tcuTexVerifierUtil.computeNonNormalizedCoordBounds(
			sampler.normalizedCoords, h0, coord[1], prec.coordBits[1], prec.uvwBits[1]);
		/** @type {Array<number>} */
		var vBounds1 = tcuTexVerifierUtil.computeNonNormalizedCoordBounds(
			sampler.normalizedCoords, h1, coord[1], prec.coordBits[1], prec.uvwBits[1]);

		// Integer coordinates - without wrap mode
		/** @type {number} */ var minI0 = Math.floor(uBounds0[0]);
		/** @type {number} */ var maxI0 = Math.floor(uBounds0[1]);
		/** @type {number} */ var minI1 = Math.floor(uBounds1[0]);
		/** @type {number} */ var maxI1 = Math.floor(uBounds1[1]);
		/** @type {number} */ var minJ0 = Math.floor(vBounds0[0]);
		/** @type {number} */ var maxJ0 = Math.floor(vBounds0[1]);
		/** @type {number} */ var minJ1 = Math.floor(vBounds1[0]);
		/** @type {number} */ var maxJ1 = Math.floor(vBounds1[1]);

		for (var j0 = minJ0; j0 <= maxJ0; j0++) {
			for (var i0 = minI0; i0 <= maxI0; i0++) {
				for (var j1 = minJ1; j1 <= maxJ1; j1++) {
					for (var i1 = minI1; i1 <= maxI1; i1++) {
						/** @type {Array<number>} */ var c0 = tcuTexLookupVerifier.lookupFloat(level0, sampler, tcuTexVerifierUtil.wrap(sampler.wrapS, i0, w0), tcuTexVerifierUtil.wrap(sampler.wrapT, j0, h0), coordZ);
						/** @type {Array<number>} */ var c1 = tcuTexLookupVerifier.lookupFloat(level1, sampler, tcuTexVerifierUtil.wrap(sampler.wrapS, i1, w1), tcuTexVerifierUtil.wrap(sampler.wrapT, j1, h1), coordZ);

						if (tcuTexLookupVerifier.isLinearRangeValid(prec, c0, c1, fBounds, result))
							return true;
					}
				}
			}
		}

		return false;
	};

	/**
	* @param {tcuTexture.ConstPixelBufferAccess} level0
	* @param {tcuTexture.ConstPixelBufferAccess} level1
	* @param {tcuTexture.Sampler} sampler
	* @param {tcuTexLookupVerifier.PrecType} prec
	* @param {Array<number>} coord
	* @param {Array<number>} fBounds
	* @param {Array<number>} result
	* @return {boolean}
	*/
	tcuTexLookupVerifier.isNearestMipmapLinearSampleResultValid_CoordAsVec3 = function(level0, level1, sampler, prec, coord, fBounds, result) {
		/** @type {number} */ var w0 = level0.getWidth();
		/** @type {number} */ var w1 = level1.getWidth();
		/** @type {number} */ var h0 = level0.getHeight();
		/** @type {number} */ var h1 = level1.getHeight();
		/** @type {number} */ var d0 = level0.getDepth();
		/** @type {number} */ var d1 = level1.getDepth();

		/** @type {Array<number>} */
		var uBounds0 = tcuTexVerifierUtil.computeNonNormalizedCoordBounds(
			sampler.normalizedCoords, w0, coord[0], prec.coordBits[0], prec.uvwBits[0]);
		/** @type {Array<number>} */
		var uBounds1 = tcuTexVerifierUtil.computeNonNormalizedCoordBounds(
			sampler.normalizedCoords, w1, coord[0], prec.coordBits[0], prec.uvwBits[0]);
		/** @type {Array<number>} */
		var vBounds0 = tcuTexVerifierUtil.computeNonNormalizedCoordBounds(
			sampler.normalizedCoords, h0, coord[1], prec.coordBits[1], prec.uvwBits[1]);
		/** @type {Array<number>} */
		var vBounds1 = tcuTexVerifierUtil.computeNonNormalizedCoordBounds(
			sampler.normalizedCoords, h1, coord[1], prec.coordBits[1], prec.uvwBits[1]);
		/** @type {Array<number>} */
		var wBounds0 = tcuTexVerifierUtil.computeNonNormalizedCoordBounds(
			sampler.normalizedCoords, d0, coord[2], prec.coordBits[2], prec.uvwBits[2]);
		/** @type {Array<number>} */
		var wBounds1 = tcuTexVerifierUtil.computeNonNormalizedCoordBounds(
			sampler.normalizedCoords, d1, coord[2], prec.coordBits[2], prec.uvwBits[2]);

		// Integer coordinates - without wrap mode
		/** @type {number} */ var minI0 = Math.floor(uBounds0[0]);
		/** @type {number} */ var maxI0 = Math.floor(uBounds0[1]);
		/** @type {number} */ var minI1 = Math.floor(uBounds1[0]);
		/** @type {number} */ var maxI1 = Math.floor(uBounds1[1]);
		/** @type {number} */ var minJ0 = Math.floor(vBounds0[0]);
		/** @type {number} */ var maxJ0 = Math.floor(vBounds0[1]);
		/** @type {number} */ var minJ1 = Math.floor(vBounds1[0]);
		/** @type {number} */ var maxJ1 = Math.floor(vBounds1[1]);
		/** @type {number} */ var minK0 = Math.floor(wBounds0[0]);
		/** @type {number} */ var maxK0 = Math.floor(wBounds0[1]);
		/** @type {number} */ var minK1 = Math.floor(wBounds1[0]);
		/** @type {number} */ var maxK1 = Math.floor(wBounds1[1]);

		for (var k0 = minK0; k0 <= maxK0; k0++) {
			for (var j0 = minJ0; j0 <= maxJ0; j0++) {
				for (var i0 = minI0; i0 <= maxI0; i0++) {
					for (var k1 = minK1; k1 <= maxK1; k1++) {
						for (var j1 = minJ1; j1 <= maxJ1; j1++) {
							for (var i1 = minI1; i1 <= maxI1; i1++) {
								/** @type {Array<number>} */ var c0 = tcuTexLookupVerifier.lookupFloat(level0, sampler, tcuTexVerifierUtil.wrap(sampler.wrapS, i0, w0), tcuTexVerifierUtil.wrap(sampler.wrapT, j0, h0), tcuTexVerifierUtil.wrap(sampler.wrapR, k0, d0));
								/** @type {Array<number>} */ var c1 = tcuTexLookupVerifier.lookupFloat(level1, sampler, tcuTexVerifierUtil.wrap(sampler.wrapS, i1, w1), tcuTexVerifierUtil.wrap(sampler.wrapT, j1, h1), tcuTexVerifierUtil.wrap(sampler.wrapR, k1, d1));

								if (tcuTexLookupVerifier.isLinearRangeValid(prec, c0, c1, fBounds, result))
									return true;
							}
						}
					}
				}
			}
		}

		return false;
	};

	/**
	* @param {tcuTexture.ConstPixelBufferAccess} level0
	* @param {tcuTexture.ConstPixelBufferAccess} level1
	* @param {tcuTexture.Sampler} sampler
	* @param {tcuTexLookupVerifier.PrecType} prec
	* @param {number} coordX
	* @param {number} coordY
	* @param {Array<number>} fBounds
	* @param {Array<number>} result
	* @return {boolean}
	*/
	tcuTexLookupVerifier.isLinearMipmapLinearSampleResultValid_CoordXYAsNumber = function(level0, level1, sampler, prec, coordX, coordY, fBounds, result) {
		// \todo [2013-07-04 pyry] This is strictly not correct as coordinates between levels should be dependent.
		//						   Right now this allows pairing any two valid bilinear quads.

		/** @type {number} */ var w0 = level0.getWidth();
		/** @type {number} */ var w1 = level1.getWidth();

		/** @type {Array<number>} */ var uBounds0 = tcuTexVerifierUtil.computeNonNormalizedCoordBounds(sampler.normalizedCoords, w0,	coordX, prec.coordBits[0], prec.uvwBits[0]);
		/** @type {Array<number>} */ var uBounds1 = tcuTexVerifierUtil.computeNonNormalizedCoordBounds(sampler.normalizedCoords, w1,	coordX, prec.coordBits[0], prec.uvwBits[0]);

		// Integer coordinates - without wrap mode
		/** @type {number} */ var minI0 = Math.floor(uBounds0[0]-0.5);
		/** @type {number} */ var maxI0 = Math.floor(uBounds0[1]-0.5);
		/** @type {number} */ var minI1 = Math.floor(uBounds1[0]-0.5);
		/** @type {number} */ var maxI1 = Math.floor(uBounds1[1]-0.5);

		/** @type {tcuTextureUtil.TextureChannelClass} */
		var texClass = tcuTextureUtil.getTextureChannelClass(level0.getFormat().type);
		/** @type {number} */ var cSearchStep = (texClass == tcuTextureUtil.TextureChannelClass.UNSIGNED_FIXED_POINT) ? tcuTexLookupVerifier.computeBilinearSearchStepForUnorm(prec) :
											    (texClass == tcuTextureUtil.TextureChannelClass.SIGNED_FIXED_POINT) ? tcuTexLookupVerifier.computeBilinearSearchStepForSnorm(prec) :
												0.0; // Step is computed for floating-point quads based on texel values.

		/** @type {number} */ var x0;
		/** @type {number} */ var x1;

		for (var i0 = minI0; i0 <= maxI0; i0++) {
			/** @type {tcuTexLookupVerifier.ColorLine} */ var line0;
			/** @type {number} */ var searchStep0;

			x0 = tcuTexVerifierUtil.wrap(sampler.wrapS, i0, w0);
			x1 = tcuTexVerifierUtil.wrap(sampler.wrapS, i0+1, w0);
			tcuTexLookupVerifier.lookupLine(line0, level0, sampler, x0, x1, coordY);

			if (texClass == tcuTextureUtil.TextureChannelClass.FLOATING_POINT)
				searchStep0 = tcuTexLookupVerifier.computeBilinearSearchStepFromFloatLine(prec, line0);
			else
				searchStep0 = cSearchStep;


			/** @type {number} */ var minA0	= deMath.clamp((uBounds0[0] - 0.5) - i0, 0.0, 1.0);
			/** @type {number} */ var maxA0	= deMath.clamp((uBounds0[1] - 0.5) - i0, 0.0, 1.0);

			for (var i1 = minI1; i1 <= maxI1; i1++) {
				/** @type {tcuTexLookupVerifier.ColorLine} */ var line1;
				/** @type {number} */ var searchStep1;


				x0 = tcuTexVerifierUtil.wrap(sampler.wrapS, i1, w1);
				x1 = tcuTexVerifierUtil.wrap(sampler.wrapS, i1+1, w1);
				tcuTexLookupVerifier.lookupLine(line1, level1, sampler, x0, x1, coordY);

				if (texClass == tcuTextureUtil.TextureChannelClass.FLOATING_POINT)
					searchStep1 = computeBilinearSearchStepFromFloatLine(prec, line1);
				else
					searchStep1 = cSearchStep;


				/** @type {number} */ var minA1	= deMath.clamp((uBounds1[0] - 0.5) - i1, 0.0, 1.0);
				/** @type {number} */ var maxA1	= deMath.clamp((uBounds1[1] - 0.5) - i1, 0.0, 1.0);

				if (tcuTexLookupVerifier.is1DTrilinearFilterResultValid(prec, line0, line1, [minA0, maxA0], [minA1, maxA1], fBounds, Math.min(searchStep0, searchStep1), result))
					return true;
			}
		}

		return false;
	};

	/**
	* @param {tcuTexture.ConstPixelBufferAccess} level0
	* @param {tcuTexture.ConstPixelBufferAccess} level1
	* @param {tcuTexture.Sampler} sampler
	* @param {tcuTexLookupVerifier.PrecType} prec
	* @param {Array<number>} coord
	* @param {number} coordZ
	* @param {Array<number>} fBounds
	* @param {Array<number>} result
	* @return {boolean}
	*/
	tcuTexLookupVerifier.isLinearMipmapLinearSampleResultValid_CoordAsVec2AndInt = function(level0, level1, sampler, prec, coord, coordZ, fBounds, result) {
		// \todo [2013-07-04 pyry] This is strictly not correct as coordinates between levels should be dependent.
		//						   Right now this allows pairing any two valid bilinear quads.

		/** @type {number} */ var w0 = level0.getWidth();
		/** @type {number} */ var w1 = level1.getWidth();
		/** @type {number} */ var h0 = level0.getHeight();
		/** @type {number} */ var h1 = level1.getHeight();

		/** @type {Array<number>} */
		var uBounds0 = tcuTexVerifierUtil.computeNonNormalizedCoordBounds(
			sampler.normalizedCoords, w0, coord[0], prec.coordBits[0], prec.uvwBits[0]);
		/** @type {Array<number>} */
		var uBounds1 = tcuTexVerifierUtil.computeNonNormalizedCoordBounds(
			sampler.normalizedCoords, w1, coord[0], prec.coordBits[0], prec.uvwBits[0]);
		/** @type {Array<number>} */
		var vBounds0 = tcuTexVerifierUtil.computeNonNormalizedCoordBounds(
			sampler.normalizedCoords, h0, coord[1], prec.coordBits[1], prec.uvwBits[1]);
		/** @type {Array<number>} */
		var vBounds1 = tcuTexVerifierUtil.computeNonNormalizedCoordBounds(
			sampler.normalizedCoords, h1, coord[1], prec.coordBits[1], prec.uvwBits[1]);

		// Integer coordinates - without wrap mode
		/** @type {number} */ var minI0 = Math.floor(uBounds0[0] - 0.5);
		/** @type {number} */ var maxI0 = Math.floor(uBounds0[1] - 0.5);
		/** @type {number} */ var minI1 = Math.floor(uBounds1[0] - 0.5);
		/** @type {number} */ var maxI1 = Math.floor(uBounds1[1] - 0.5);
		/** @type {number} */ var minJ0 = Math.floor(vBounds0[0] - 0.5);
		/** @type {number} */ var maxJ0 = Math.floor(vBounds0[1] - 0.5);
		/** @type {number} */ var minJ1 = Math.floor(vBounds1[0] - 0.5);
		/** @type {number} */ var maxJ1 = Math.floor(vBounds1[1] - 0.5);

		/** @type {tcuTextureUtil.TextureChannelClass} */
		var texClass = tcuTextureUtil.getTextureChannelClass(level0.getFormat().type);
		/** @type {number} */ var cSearchStep = (texClass == tcuTextureUtil.TextureChannelClass.UNSIGNED_FIXED_POINT) ? tcuTexLookupVerifier.computeBilinearSearchStepForUnorm(prec) :
												(texClass == tcuTextureUtil.TextureChannelClass.SIGNED_FIXED_POINT) ? tcuTexLookupVerifier.computeBilinearSearchStepForSnorm(prec) :
												0.0; // Step is computed for floating-point quads based on texel values.

		/** @type {number} */ var x0
		/** @type {number} */ var x1
		/** @type {number} */ var y0
		/** @type {number} */ var y1

		for (var j0 = minJ0; j0 <= maxJ0; j0++) {
			for (var i0 = minI0; i0 <= maxI0; i0++) {
				/** @type {tcuTexLookupVerifier.ColorQuad} */ var quad0;
				/** @type {number} */ var searchStep0;

				x0 = tcuTexVerifierUtil.wrap(sampler.wrapS, i0, w0);
				x1 = tcuTexVerifierUtil.wrap(sampler.wrapS, i0 + 1, w0);
				y0 = tcuTexVerifierUtil.wrap(sampler.wrapT, j0, h0);
				y1 = tcuTexVerifierUtil.wrap(sampler.wrapT, j0 + 1, h0);
				tcuTexLookupVerifier.lookupQuad(quad0, level0, sampler, x0, x1, y0, y1, coordZ);

				if (texClass == tcuTextureUtil.TextureChannelClass.FLOATING_POINT)
					searchStep0 = tcuTexLookupVerifier.computeBilinearSearchStepFromFloatQuad(prec, quad0);
				else
					searchStep0 = cSearchStep;

				/** @type {number} */ var minA0	= deMath.clamp((uBounds0[0] - 0.5) - i0, 0.0, 1.0);
				/** @type {number} */ var maxA0	= deMath.clamp((uBounds0[1] - 0.5) - i0, 0.0, 1.0);
				/** @type {number} */ var minB0	= deMath.clamp((vBounds0[0] - 0.5) - j0, 0.0, 1.0);
				/** @type {number} */ var maxB0	= deMath.clamp((vBounds0[1] - 0.5) - j0, 0.0, 1.0);

				for (var j1 = minJ1; j1 <= maxJ1; j1++) {
					for (var i1 = minI1; i1 <= maxI1; i1++) {
						/** @type {tcuTexLookupVerifier.ColorQuad} */ var quad1;
						/** @type {number} */ var searchStep1;

						x0 = tcuTexVerifierUtil.wrap(sampler.wrapS, i1, w1);
						x1 = tcuTexVerifierUtil.wrap(sampler.wrapS, i1 + 1, w1);
						y0 = tcuTexVerifierUtil.wrap(sampler.wrapT, j1, h1);
						y1 = tcuTexVerifierUtil.wrap(sampler.wrapT, j1 + 1, h1);
						tcuTexLookupVerifier.lookupQuad(quad1, level1, sampler, x0, x1, y0, y1, coordZ);

						if (texClass == tcuTextureUtil.TextureChannelClass.FLOATING_POINT)
							searchStep1 = tcuTexLookupVerifier.computeBilinearSearchStepFromFloatQuad(prec, quad1);
						else
							searchStep1 = cSearchStep;

						/** @type {number} */ var minA1	= deMath.clamp((uBounds1[0] - 0.5) - i1, 0.0, 1.0);
						/** @type {number} */ var maxA1	= deMath.clamp((uBounds1[1] - 0.5) - i1, 0.0, 1.0);
						/** @type {number} */ var minB1	= deMath.clamp((vBounds1[0] - 0.5) - j1, 0.0, 1.0);
						/** @type {number} */ var maxB1	= deMath.clamp((vBounds1[1] - 0.5) - j1, 0.0, 1.0);

						if (tcuTexLookupVerifier.is2DTrilinearFilterResultValid(prec, quad0, quad1, [minA0, maxA0], [minB0, maxB0], [minA1, maxA1], [minB1, maxB1],
														   fBounds, Math.min(searchStep0, searchStep1), result))
							return true;
					}
				}
			}
		}

		return false;
	};

	/**
	* @param {tcuTexture.ConstPixelBufferAccess} level0
	* @param {tcuTexture.ConstPixelBufferAccess} level1
	* @param {tcuTexture.Sampler} sampler
	* @param {tcuTexLookupVerifier.PrecType} prec
	* @param {Array<number>} coord
	* @param {Array<number>} fBounds
	* @param {Array<number>} result
	* @return {boolean}
	*/
	tcuTexLookupVerifier.isLinearMipmapLinearSampleResultValid_CoordAsVec3 = function(level0, level1, sampler, prec, coord, fBounds, result) {
		// \todo [2013-07-04 pyry] This is strictly not correct as coordinates between levels should be dependent.
		//						   Right now this allows pairing any two valid bilinear quads.

		/** @type {number} */ var w0 = level0.getWidth();
		/** @type {number} */ var w1 = level1.getWidth();
		/** @type {number} */ var h0 = level0.getHeight();
		/** @type {number} */ var h1 = level1.getHeight();
		/** @type {number} */ var d0 = level0.getDepth();
		/** @type {number} */ var d1 = level1.getDepth();

		/** @type {Array<number>} */
		var uBounds0 = tcuTexVerifierUtil.computeNonNormalizedCoordBounds(
			sampler.normalizedCoords, w0, coord[0], prec.coordBits[0], prec.uvwBits[0]);
		/** @type {Array<number>} */
		var uBounds1 = tcuTexVerifierUtil.computeNonNormalizedCoordBounds(
			sampler.normalizedCoords, w1, coord[0], prec.coordBits[0], prec.uvwBits[0]);
		/** @type {Array<number>} */
		var vBounds0 = tcuTexVerifierUtil.computeNonNormalizedCoordBounds(
			sampler.normalizedCoords, h0, coord[1], prec.coordBits[1], prec.uvwBits[1]);
		/** @type {Array<number>} */
		var vBounds1 = tcuTexVerifierUtil.computeNonNormalizedCoordBounds(
			sampler.normalizedCoords, h1, coord[1], prec.coordBits[1], prec.uvwBits[1]);
		/** @type {Array<number>} */
		var wBounds0 = tcuTexVerifierUtil.computeNonNormalizedCoordBounds(
			sampler.normalizedCoords, d0, coord[2], prec.coordBits[2], prec.uvwBits[2]);
		/** @type {Array<number>} */
		var wBounds1 = tcuTexVerifierUtil.computeNonNormalizedCoordBounds(
			sampler.normalizedCoords, d1, coord[2], prec.coordBits[2], prec.uvwBits[2]);

		// Integer coordinates - without wrap mode
		/** @type {number} */ var minI0 = Math.floor(uBounds0[0]-0.5);
		/** @type {number} */ var maxI0 = Math.floor(uBounds0[1]-0.5);
		/** @type {number} */ var minI1 = Math.floor(uBounds1[0]-0.5);
		/** @type {number} */ var maxI1 = Math.floor(uBounds1[1]-0.5);
		/** @type {number} */ var minJ0 = Math.floor(vBounds0[0]-0.5);
		/** @type {number} */ var maxJ0 = Math.floor(vBounds0[1]-0.5);
		/** @type {number} */ var minJ1 = Math.floor(vBounds1[0]-0.5);
		/** @type {number} */ var maxJ1 = Math.floor(vBounds1[1]-0.5);
		/** @type {number} */ var minK0 = Math.floor(wBounds0[0]-0.5);
		/** @type {number} */ var maxK0 = Math.floor(wBounds0[1]-0.5);
		/** @type {number} */ var minK1 = Math.floor(wBounds1[0]-0.5);
		/** @type {number} */ var maxK1 = Math.floor(wBounds1[1]-0.5);

		/** @type {tcuTextureUtil.TextureChannelClass} */
		var texClass = tcuTextureUtil.getTextureChannelClass(level0.getFormat().type);
		/** @type {number} */ var cSearchStep = texClass == tcuTextureUtil.TextureChannelClass.UNSIGNED_FIXED_POINT	? computeBilinearSearchStepForUnorm(prec) :
												texClass == tcuTextureUtil.TextureChannelClass.SIGNED_FIXED_POINT	? computeBilinearSearchStepForSnorm(prec) :
												0.0; // Step is computed for floating-point quads based on texel values.

		/** @type {number} */ var x0;
		/** @type {number} */ var x1;
		/** @type {number} */ var y0;
		/** @type {number} */ var y1;
		/** @type {number} */ var z0;
		/** @type {number} */ var z1;

		for (var k0 = minK0; k0 <= maxK0; k0++) {
			for (var j0 = minJ0; j0 <= maxJ0; j0++) {
				for (var i0 = minI0; i0 <= maxI0; i0++) {
					/** @type {tcuTexLookupVerifier.ColorQuad} */ var quad00;
					/** @type {tcuTexLookupVerifier.ColorQuad} */ var quad01;
					/** @type {number} */ var searchStep0;

					x0 = tcuTexVerifierUtil.wrap(sampler.wrapS, i0, w0);
					x1 = tcuTexVerifierUtil.wrap(sampler.wrapS, i0+1, w0);
					y0 = tcuTexVerifierUtil.wrap(sampler.wrapT, j0, h0);
					y1 = tcuTexVerifierUtil.wrap(sampler.wrapT, j0+1, h0);
					z0 = tcuTexVerifierUtil.wrap(sampler.wrapR, k0, d0);
					z1 = tcuTexVerifierUtil.wrap(sampler.wrapR, k0+1, d0);
					tcuTexLookupVerifier.lookupQuad(quad00, level0, sampler, x0, x1, y0, y1, z0);
					tcuTexLookupVerifier.lookupQuad(quad01, level0, sampler, x0, x1, y0, y1, z1);

					if (texClass == tcuTextureUtil.TextureChannelClass.FLOATING_POINT)
						searchStep0 = Math.min(tcuTexLookupVerifier.computeBilinearSearchStepFromFloatQuad(prec, quad00), tcuTexLookupVerifier.computeBilinearSearchStepFromFloatQuad(prec, quad01));
					else
						searchStep0 = cSearchStep;

					/** @type {number} */ var minA0 = deMath.clamp((uBounds0[0]-0.5)-float(i0), 0.0, 1.0);
					/** @type {number} */ var maxA0 = deMath.clamp((uBounds0[1]-0.5)-float(i0), 0.0, 1.0);
					/** @type {number} */ var minB0 = deMath.clamp((vBounds0[0]-0.5)-float(j0), 0.0, 1.0);
					/** @type {number} */ var maxB0 = deMath.clamp((vBounds0[1]-0.5)-float(j0), 0.0, 1.0);
					/** @type {number} */ var minC0 = deMath.clamp((wBounds0[0]-0.5)-float(k0), 0.0, 1.0);
					/** @type {number} */ var maxC0 = deMath.clamp((wBounds0[1]-0.5)-float(k0), 0.0, 1.0);

					for (var k1 = minK1; k1 <= maxK1; k1++) {
						for (var j1 = minJ1; j1 <= maxJ1; j1++) {
							for (var i1 = minI1; i1 <= maxI1; i1++) {
								/** @type {tcuTexLookupVerifier.ColorQuad} */ var quad10;
								/** @type {tcuTexLookupVerifier.ColorQuad} */ var quad11;
								/** @type {number} */ var searchStep1;

								x0 = tcuTexVerifierUtil.wrap(sampler.wrapS, i1, w1);
								x1 = tcuTexVerifierUtil.wrap(sampler.wrapS, i1 + 1, w1);
								y0 = tcuTexVerifierUtil.wrap(sampler.wrapT, j1, h1);
								y1 = tcuTexVerifierUtil.wrap(sampler.wrapT, j1 + 1, h1);
								z0 = tcuTexVerifierUtil.wrap(sampler.wrapR, k1, d1);
								z1 = tcuTexVerifierUtil.wrap(sampler.wrapR, k1 + 1, d1);
								tcuTexLookupVerifier.lookupQuad(quad10, level1, sampler, x0, x1, y0, y1, z0);
								tcuTexLookupVerifier.lookupQuad(quad11, level1, sampler, x0, x1, y0, y1, z1);

								if (texClass == tcuTextureUtil.TextureChannelClass.FLOATING_POINT)
									searchStep1 = Math.min(tcuTexLookupVerifier.computeBilinearSearchStepFromFloatQuad(prec, quad10), tcuTexLookupVerifier.computeBilinearSearchStepFromFloatQuad(prec, quad11));
								else
									searchStep1 = cSearchStep;

								/** @type {number} */ var minA1 = deMath.clamp((uBounds1[0] - 0.5) - i1, 0.0, 1.0);
								/** @type {number} */ var maxA1 = deMath.clamp((uBounds1[1] - 0.5) - i1, 0.0, 1.0);
								/** @type {number} */ var minB1 = deMath.clamp((vBounds1[0] - 0.5) - j1, 0.0, 1.0);
								/** @type {number} */ var maxB1 = deMath.clamp((vBounds1[1] - 0.5) - j1, 0.0, 1.0);
								/** @type {number} */ var minC1 = deMath.clamp((wBounds1[0] - 0.5) - k1, 0.0, 1.0);
								/** @type {number} */ var maxC1 = deMath.clamp((wBounds1[1] - 0.5) - k1, 0.0, 1.0);

								if (tcuTexLookupVerifier.is3DTrilinearFilterResultValid(
									prec, quad00, quad01, quad10, quad11,
									[minA0, maxA0], [minB0, maxB0], [minC0, maxC0],
									[minA1, maxA1], [minB1, maxB1], [minC1, maxC1],
									fBounds, Math.min(searchStep0, searchStep1), result))
									return true;
							}
						}
					}
				}
			}
		}

		return false;
	};


	/**
	* @param {tcuTexture.ConstPixelBufferAccess} level
	* @param {tcuTexture.Sampler} sampler
	* @param {tcuTexture.FilterMode} filterMode
	* @param {tcuTexLookupVerifier.PrecType} prec
	* @param {number} coordX
	* @param {number} coordY
	* @param {Array<number>} result
	* @return {boolean}
	*/
	tcuTexLookupVerifier.isLevelSampleResultValid_CoordXYAsNumber = function(level, sampler, filterMode, prec, coordX, coordY, result) {
		if (filterMode == tcuTexture.FilterMode.LINEAR)
			return tcuTexLookupVerifier.isLinearSampleResultValid_CoordXYAsNumber(level, sampler, prec, coordX, coordY, result);
		else
			return tcuTexLookupVerifier.isNearestSampleResultValid_CoordXYAsNumber(level, sampler, prec, coordX, coordY, result);
	};


	/**
	* @param {tcuTexture.ConstPixelBufferAccess} level
	* @param {tcuTexture.Sampler} sampler
	* @param {tcuTexture.FilterMode} filterMode
	* @param {tcuTexLookupVerifier.PrecType} prec
	* @param {Array<number>} coord
	* @param {number} coordZ
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
	* @param {tcuTexture.FilterMode} filterMode
	* @param {tcuTexLookupVerifier.PrecType} prec
	* @param {Array<number>} coord
	* @param {Array<number>} result
	* @return {boolean}
	*/
	tcuTexLookupVerifier.isLevelSampleResultValid_CoordAsVec3 = function(level, sampler, filterMode, prec, coord, result) {
		if (filterMode == tcuTexture.FilterMode.LINEAR)
			return tcuTexLookupVerifier.isLinearSampleResultValid_CoordAsVec3(level, sampler, prec, coord, result);
		else
			return tcuTexLookupVerifier.isNearestSampleResultValid_CoordAsVec3(level, sampler, prec, coord, result);
	};


	/**
	* @param {tcuTexture.ConstPixelBufferAccess} level0
	* @param {tcuTexture.ConstPixelBufferAccess} level1
	* @param {tcuTexture.Sampler} sampler
	* @param {tcuTexture.FilterMode} levelFilter
	* @param {tcuTexLookupVerifier.PrecType} prec
	* @param {number} coordX
	* @param {number} coordY
	* @param {Array<number>} fBounds
	* @param {Array<number>} result
	* @return {boolean}
	*/
	tcuTexLookupVerifier.isMipmapLinearSampleResultValid_CoordXYAsNumber = function(level0, level1, sampler, levelFilter, prec, coordX, coordY, fBounds, result) {
		if (levelFilter == tcuTexture.FilterMode.LINEAR)
			return tcuTexLookupVerifier.isLinearMipmapLinearSampleResultValid_CoordXYAsNumber(level0, level1, sampler, prec, coordX, coordY, fBounds, result);
		else
			return tcuTexLookupVerifier.isNearestMipmapLinearSampleResultValid_CoordXYAsNumber(level0, level1, sampler, prec, coordX, coordY, fBounds, result);
	};

	/**
	* @param {tcuTexture.ConstPixelBufferAccess} level0
	* @param {tcuTexture.ConstPixelBufferAccess} level1
	* @param {tcuTexture.Sampler} sampler
	* @param {tcuTexture.FilterMode} levelFilter
	* @param {tcuTexLookupVerifier.PrecType} prec
	* @param {Array<number>} coord
	* @param {number} coordZ
	* @param {Array<number>} fBounds
	* @param {Array<number>} result
	* @return {boolean}
	*/
	tcuTexLookupVerifier.isMipmapLinearSampleResultValid_CoordAsVec2AndInt = function(level0, level1, sampler, levelFilter, prec, coord, coordZ, fBounds, result) {
		if (levelFilter == tcuTexture.FilterMode.LINEAR)
			return tcuTexLookupVerifier.isLinearMipmapLinearSampleResultValid_CoordAsVec2AndInt(level0, level1, sampler, prec, coord, coordZ, fBounds, result);
		else
			return tcuTexLookupVerifier.isNearestMipmapLinearSampleResultValid_CoordAsVec2AndInt(level0, level1, sampler, prec, coord, coordZ, fBounds, result);
	};

	/**
	* @param {tcuTexture.ConstPixelBufferAccess} level0
	* @param {tcuTexture.ConstPixelBufferAccess} level1
	* @param {tcuTexture.Sampler} sampler
	* @param {tcuTexture.FilterMode} levelFilter
	* @param {tcuTexLookupVerifier.PrecType} prec
	* @param {Array<number>} coord
	* @param {Array<number>} fBounds
	* @param {Array<number>} result
	* @return {boolean}
	*/
	tcuTexLookupVerifier.isMipmapLinearSampleResultValid_CoordAsVec3 = function(level0, level1, sampler, levelFilter, prec, coord, fBounds, result) {
		if (levelFilter == tcuTexture.FilterMode.LINEAR)
			return tcuTexLookupVerifier.isLinearMipmapLinearSampleResultValid_CoordAsVec3(level0, level1, sampler, prec, coord, fBounds, result);
		else
			return tcuTexLookupVerifier.isNearestMipmapLinearSampleResultValid_CoordAsVec3(level0, level1, sampler, prec, coord, fBounds, result);
	};

	/**
	 * @param  {tcuTexture.Texture2DView} texture
	 * @param  {tcuTexture.Sampler} sampler
	 * @param  {tcuTexLookupVerifier.LookupPrecision} prec
	 * @param  {Array<number>} coord
	 * @param  {Array<number>} lodBounds
	 * @param  {Array<number>} result
	 * @return {boolean}
	 */
	tcuTexLookupVerifier.isLookupResultValid_Texture2DView = function(texture, sampler, prec, coord, lodBounds, result) {
		/** @type {number} */ var minLod = lodBounds[0];
		/** @type {number} */ var maxLod = lodBounds[1];
		/** @type {boolean} */ var canBeMagnified = minLod <= sampler.lodThreshold;
		/** @type {boolean} */ var canBeMinified = maxLod > sampler.lodThreshold;

		assertMsgOptions(isSamplerSupported(sampler), '', false, true);

		/** @type {number} */ var minLevel;
		/** @type {number} */ var maxLevel;

		if (canBeMagnified)
			if (tcuTexLookupVerifier.isLevelSampleResultValid_CoordAsVec2AndInt(texture.getLevel(0), sampler, sampler.magFilter, prec, coord, 0, result))
				return true;


		if (canBeMinified) {
			/** @type {boolean} */ var isNearestMipmap = tcuTexVerifierUtil.isNearestMipmapFilter(sampler.minFilter);
			/** @type {boolean} */ var isLinearMipmap = tcuTexVerifierUtil.isLinearMipmapFilter(sampler.minFilter);
			/** @type {number} */ var minTexLevel = 0;
			/** @type {number} */ var maxTexLevel = texture.getNumLevels() - 1;

			assertMsgOptions(minTexLevel <= maxTexLevel, '', false, true);

			if (isLinearMipmap && minTexLevel < maxTexLevel) {
				minLevel = deMath.clamp(Math.floor(minLod), minTexLevel, maxTexLevel - 1);
				maxLevel = deMath.clamp(Math.floor(maxLod), minTexLevel, maxTexLevel - 1);

				assertMsgOptions(minLevel <= maxLevel, '', false, true);

				for (var level = minLevel; level <= maxLevel; level++) {
					/** @type {number} */ var minF = deMath.clamp(minLod - level, 0.0, 1.0);
					/** @type {number} */ var maxF = deMath.clamp(maxLod - level, 0.0, 1.0);

					if (tcuTexLookupVerifier.isMipmapLinearSampleResultValid_CoordAsVec2AndInt(texture.getLevel(level), texture.getLevel(level + 1), sampler, tcuTexVerifierUtil.getLevelFilter(sampler.minFilter), prec, coord, 0, [minF, maxF], result))
						return true;
				}
			}
			else if (isNearestMipmap) {
				// \note The accurate formula for nearest mipmapping is level = ceil(lod + 0.5) - 1 but Khronos has made
				//		 decision to allow floor(lod + 0.5) as well.
				minLevel = deMath.clamp(Math.ceil(minLod + 0.5) - 1, minTexLevel, maxTexLevel);
				maxLevel = deMath.clamp(Math.floor(maxLod + 0.5), minTexLevel, maxTexLevel);

				assertMsgOptions(minLevel <= maxLevel, '', false, true);

				for (var level = minLevel; level <= maxLevel; level++) {
					if (tcuTexLookupVerifier.isLevelSampleResultValid_CoordAsVec2AndInt(texture.getLevel(level), sampler, tcuTexVerifierUtil.getLevelFilter(sampler.minFilter), prec, coord, 0, result))
						return true;
				}
			}
			else {
				if (tcuTexLookupVerifier.isLevelSampleResultValid_CoordAsVec2AndInt(texture.getLevel(0), sampler, sampler.minFilter, prec, coord, 0, result))
					return true;
			}
		}

		return false;
	};

	/**
	 * @param  {tcuTexture.TextureCubeView} texture
	 * @param  {tcuTexture.Sampler} sampler
	 * @param  {tcuTexLookupVerifier.LookupPrecision} prec
	 * @param  {Array<number>} coord
	 * @param  {Array<number>} lodBounds
	 * @param  {Array<number>} result
	 * @return {boolean}
	 */
	tcuTexLookupVerifier.isLookupResultValid_TextureCubeView = function(texture, sampler, prec, coord, lodBounds, const result) {
		/** @type {number} */ var numPossibleFaces = 0;
		/** @type {tcuTexture.CubeFace} */ var possibleFaces[6];

		assertMsgOptions(isSamplerSupported(sampler), '', false, true);

		tcuTexVerifierUtil.getPossibleCubeFaces(coord, prec.coordBits, possibleFaces, numPossibleFaces);
		/** @type {number} */ var minLevel;
		/** @type {number} */ var maxLevel;

		if (numPossibleFaces == 0)
			return true; // Result is undefined.

		for (var tryFaceNdx = 0; tryFaceNdx < numPossibleFaces; tryFaceNdx++) {
			/** @ype {tcuTexture.CubeFaceCoords} */
			var faceCoords = new tcuTexture.CubeFaceCoords(possibleFaces[tryFaceNdx], tcuTexture.projectToFace(possibleFaces[tryFaceNdx], coord));
			/** @type {number} */ var minLod = lodBounds[0];
			/** @type {number} */ var maxLod = lodBounds[1];
			/** @type {boolean} */ var canBeMagnified = minLod <= sampler.lodThreshold;
			/** @type {boolean} */ var canBeMinified = maxLod > sampler.lodThreshold;

			if (canBeMagnified) {
				/** @ype {tcuTexture.ConstPixelBufferAccess} */ var faces[CUBEFACE_LAST];
				tcuTexLookupVerifier.getCubeLevelFaces(texture, 0, faces);

				if (tcuTexLookupVerifier.isCubeLevelSampleResultValid(faces, sampler, sampler.magFilter, prec, faceCoords, result))
					return true;
			}

			if (canBeMinified) {
				/** @type {boolean} */ var isNearestMipmap = tcuTexVerifierUtil.isNearestMipmapFilter(sampler.minFilter);
				/** @type {boolean} */ var isLinearMipmap = tcuTexVerifierUtil.isLinearMipmapFilter(sampler.minFilter);
				/** @type {number} */ var minTexLevel = 0;
				/** @type {number} */ var maxTexLevel = texture.getNumLevels() - 1;

				assertMsgOptions(minTexLevel <= maxTexLevel, '', false, true);

				if (isLinearMipmap && minTexLevel < maxTexLevel) {
					minLevel = deMath.clamp(Math.floor(minLod), minTexLevel, maxTexLevel - 1);
					maxLevel = deMath.clamp(Math.floor(maxLod), minTexLevel, maxTexLevel - 1);

					assertMsgOptions(minLevel <= maxLevel, '', false, true);

					for (var levelNdx = minLevel; levelNdx <= maxLevel; levelNdx++) {
						/** @type {number} */ var minF = deMath.clamp(minLod - levelNdx, 0.0, 1.0);
						/** @type {number} */ var maxF = deMath.clamp(maxLod - levelNdx, 0.0, 1.0);

						/** @ype {tcuTexture.ConstPixelBufferAccess} */ var faces0[6];
						/** @ype {tcuTexture.ConstPixelBufferAccess} */ var faces1[6];

						tcuTexLookupVerifier.getCubeLevelFaces(texture, levelNdx, faces0);
						tcuTexLookupVerifier.getCubeLevelFaces(texture, levelNdx + 1, faces1);

						if (tcuTexLookupVerifier.isCubeMipmapLinearSampleResultValid(faces0, faces1, sampler, tcuTexVerifierUtil.getLevelFilter(sampler.minFilter), prec, faceCoords, [minF, maxF], result))
							return true;
					}
				}
				else if (isNearestMipmap) {
					// \note The accurate formula for nearest mipmapping is level = ceil(lod + 0.5) - 1 but Khronos has made
					//		 decision to allow floor(lod + 0.5) as well.
					minLevel = deMath.clamp(Math.ceil(minLod + 0.5) - 1, minTexLevel, maxTexLevel);
					maxLevel = deMath.clamp(Math.floor(maxLod + 0.5), minTexLevel, maxTexLevel);

					assertMsgOptions(minLevel <= maxLevel, '', false, true);

					for (var levelNdx = minLevel; levelNdx <= maxLevel; levelNdx++) {
						/** @ype {tcuTexture.ConstPixelBufferAccess} */ var faces[6];
						tcuTexLookupVerifier.getCubeLevelFaces(texture, levelNdx, faces);

						if (tcuTexLookupVerifier.isCubeLevelSampleResultValid(faces, sampler, tcuTexVerifierUtil.getLevelFilter(sampler.minFilter), prec, faceCoords, result))
							return true;
					}
				}
				else {
					/** @ype {tcuTexture.ConstPixelBufferAccess} */ var faces[CUBEFACE_LAST];
					tcuTexLookupVerifier.getCubeLevelFaces(texture, 0, faces);

					if (tcuTexLookupVerifier.isCubeLevelSampleResultValid(faces, sampler, sampler.minFilter, prec, faceCoords, result))
						return true;
				}
			}
		}

		return false;
	};

	/**
	 * @param  {tcuTexture.Texture2DArrayView} texture
	 * @param  {tcuTexture.Sampler} sampler
	 * @param  {tcuTexLookupVerifier.LookupPrecision} prec
	 * @param  {Array<number>} coord
	 * @param  {Array<number>} lodBounds
	 * @param  {Array<number>} result
	 * @return {boolean}
	 */
	tcuTexLookupVerifier.isLookupResultValid_Texture2DArrayView = function(texture, sampler, prec, coord, lodBounds, result) {
		/** @type {Array<number>} */ var layerRange = tcuTexLookupVerifier.computeLayerRange(texture.getNumLayers(), prec.coordBits[2], coord[2]);
		/** @type {Array<number>} */ var coordXY = deMath..swizzle(coord, [0,1]);
		/** @type {number} */ var minLod = lodBounds[0];
		/** @type {number} */ var maxLod = lodBounds[1];
		/** @type {boolean} */ var canBeMagnified = minLod <= sampler.lodThreshold;
		/** @type {boolean} */ var canBeMinified = maxLod > sampler.lodThreshold;

		assertMsgOptions(isSamplerSupported(sampler), '', false, true);
		/** @type {number} */ var minLevel;
		/** @type {number} */ var maxLevel;

		for (var layer = layerRange[0]; layer <= layerRange[1]; layer++) {
			if (canBeMagnified) {
				if (tcuTexLookupVerifier.isLevelSampleResultValid_CoordAsVec2AndInt(texture.getLevel(0), sampler, sampler.magFilter, prec, coordXY, layer, result))
					return true;
			}

			if (canBeMinified) {
				/** @type {boolean} */ var isNearestMipmap = tcuTexVerifierUtil.isNearestMipmapFilter(sampler.minFilter);
				/** @type {boolean} */ var isLinearMipmap = tcuTexVerifierUtil.isLinearMipmapFilter(sampler.minFilter);
				/** @type {number} */ var minTexLevel = 0;
				/** @type {number} */ var maxTexLevel = texture.getNumLevels() - 1;

				assertMsgOptions(minTexLevel <= maxTexLevel, '', false, true);

				if (isLinearMipmap && minTexLevel < maxTexLevel) {
					minLevel = deMath.clamp(Math.Floor(minLod), minTexLevel, maxTexLevel - 1);
					maxLevel = deMath.clamp(Math.Floor(maxLod), minTexLevel, maxTexLevel - 1);

					assertMsgOptions(minLevel <= maxLevel, '', false, true);

					for (var level = minLevel; level <= maxLevel; level++) {
						/** @type {number} */ var minF = deMath.clamp(minLod - level, 0.0, 1.0);
						/** @type {number} */ var maxF = deMath.clamp(maxLod - level, 0.0, 1.0);

						if (tcuTexLookupVerifier.isMipmapLinearSampleResultValid_CoordAsVec2AndInt(texture.getLevel(level), texture.getLevel(level + 1), sampler, tcuTexVerifierUtil.getLevelFilter(sampler.minFilter), prec, coordXY, layer, [minF, maxF], result))
							return true;
					}
				}
				else if (isNearestMipmap) {
					// \note The accurate formula for nearest mipmapping is level = ceil(lod + 0.5) - 1 but Khronos has made
					//		 decision to allow floor(lod + 0.5) as well.
					minLevel = deMath.clamp(Math.ceil(minLod + 0.5) - 1, minTexLevel, maxTexLevel);
					maxLevel = deMath.clamp(Math.floor(maxLod + 0.5), minTexLevel, maxTexLevel);

					assertMsgOptions(minLevel <= maxLevel, '', false, true);

					for (var level = minLevel; level <= maxLevel; level++) {
						if (tcuTexLookupVerifier.isLevelSampleResultValid_CoordAsVec2AndInt(texture.getLevel(level), sampler, tcuTexVerifierUtil.getLevelFilter(sampler.minFilter), prec, coordXY, layer, result))
							return true;
					}
				}
				else {
					if (tcuTexLookupVerifier.isLevelSampleResultValid_CoordAsVec2AndInt(texture.getLevel(0), sampler, sampler.minFilter, prec, coordXY, layer, result))
						return true;
				}
			}
		}

		return false;
	};

	/**
	 * @param  {tcuTexture.Texture3DView} texture
	 * @param  {tcuTexture.Sampler} sampler
	 * @param  {tcuTexLookupVerifier.LookupPrecision} prec
	 * @param  {Array<number>} coord
	 * @param  {Array<number>} lodBounds
	 * @param  {Array<number>} result
	 * @return {boolean}
	 */
	tcuTexLookupVerifier.isLookupResultValid = function(texture, sampler, prec, coord, lodBounds, result) {
		/** @type {number} */ var minLod = lodBounds[0];
		/** @type {number} */ var maxLod = lodBounds[1];
		/** @type {boolean} */ var canBeMagnified = minLod <= sampler.lodThreshold;
		/** @type {boolean} */ var canBeMinified = maxLod > sampler.lodThreshold;

		assertMsgOptions(isSamplerSupported(sampler), '', false, true);

		/** @type {number} */ var minLevel;
		/** @type {number} */ var maxLevel;

		if (canBeMagnified)
			if (tcuTexLookupVerifier.isLevelSampleResultValid_CoordAsVec3(texture.getLevel(0), sampler, sampler.magFilter, prec, coord, result))
				return true;


		if (canBeMinified) {
			/** @type {boolean} */ var isNearestMipmap = tcuTexVerifierUtil.isNearestMipmapFilter(sampler.minFilter);
			/** @type {boolean} */ var isLinearMipmap = tcuTexVerifierUtil.isLinearMipmapFilter(sampler.minFilter);
			/** @type {number} */ var minTexLevel = 0;
			/** @type {number} */ var maxTexLevel = texture.getNumLevels() - 1;

			assertMsgOptions(minTexLevel <= maxTexLevel, '', false, true);

			if (isLinearMipmap && minTexLevel < maxTexLevel) {
				minLevel = deMath.clamp(Math.floor(minLod), minTexLevel, maxTexLevel - 1);
				maxLevel = deMath.clamp(Math.floor(maxLod), minTexLevel, maxTexLevel - 1);

				assertMsgOptions(minLevel <= maxLevel, '', false, true);

				for (var level = minLevel; level <= maxLevel; level++) {
					/** @type {number} */ var minF = deMath.clamp(minLod - level, 0.0, 1.0);
					/** @type {number} */ var maxF = deMath.clamp(maxLod - level, 0.0, 1.0);

					if (tcuTexLookupVerifier.isMipmapLinearSampleResultValid_CoordAsVec3(texture.getLevel(level), texture.getLevel(level + 1), sampler, tcuTexVerifierUtil.getLevelFilter(sampler.minFilter), prec, coord, [minF, maxF], result))
						return true;
				}
			}
			else if (isNearestMipmap) {
				// \note The accurate formula for nearest mipmapping is level = ceil(lod + 0.5) - 1 but Khronos has made
				//		 decision to allow floor(lod + 0.5) as well.
				minLevel = deMath.clamp(Math.ceil(minLod + 0.5) - 1, minTexLevel, maxTexLevel);
				maxLevel = deMath.clamp(Math.floor(maxLod + 0.5), minTexLevel, maxTexLevel);

				assertMsgOptions(minLevel <= maxLevel, '', false, true);

				for (var level = minLevel; level <= maxLevel; level++) {
					if (tcuTexLookupVerifier.isLevelSampleResultValid_CoordAsVec3(texture.getLevel(level), sampler, tcuTexVerifierUtil.getLevelFilter(sampler.minFilter), prec, coord, result))
						return true;
				}
			}
			else {
				if (tcuTexLookupVerifier.isLevelSampleResultValid_CoordAsVec3(texture.getLevel(0), sampler, sampler.minFilter, prec, coord, result))
					return true;
			}
		}

		return false;
	};


	/**
	 * @param  {tcuTexture.Texture1DView} texture
	 * @param  {tcuTexture.Sampler} sampler
	 * @param  {tcuTexLookupVerifier.LookupPrecision} prec
	 * @param  {number} coord
	 * @param  {Array<number>} lodBounds
	 * @param  {Array<number>} result
	 * @return {boolean}
	 */
	tcuTexLookupVerifier.isLookupResultValid_Texture1DView (texture, sampler, prec, coord, lodBounds, result) {
		throw new Error("Not implemented. TODO: implement.");
	};

	/**
	 * @param  {tcuTexture.Texture1DArrayView} texture
	 * @param  {tcuTexture.Sampler} sampler
	 * @param  {tcuTexLookupVerifier.LookupPrecision} prec
	 * @param  {Array<number>} coord
	 * @param  {Array<number>} lodBounds
	 * @param  {Array<number>} result
	 * @return {boolean}
	 */
	tcuTexLookupVerifier.isLookupResultValid_Texture1DArrayView (texture, sampler, prec, coord, lodBounds, result) {
		throw new Error("Not implemented. TODO: implement.");
	};

	/**
	 * @param  {tcuTexture.TextureCubeArrayView} texture
	 * @param  {tcuTexture.Sampler} sampler
	 * @param  {tcuTexLookupVerifier.LookupPrecision} prec
	 * @param  {Array<number>} coordBits
	 * @param  {Array<number>} coord
	 * @param  {Array<number>} lodBounds
	 * @param  {Array<number>} result
	 * @return {boolean}
	 */
	tcuTexLookupVerifier.isLookupResultValid_TextureCubeArrayView (texture, sampler, prec, coordBits, coord, lodBounds, result) {
		throw new Error("Not implemented. TODO: implement.");
	};

//
// static bool isSeamlessLinearSampleResultValid (const /** @ype {tcuTexture.ConstPixelBufferAccess} */ var (&faces)[CUBEFACE_LAST],
// 											   const Sampler&				sampler,
// 											   const LookupPrecision&		prec,
// 											   const CubeFaceFloatCoords&	coords,
// 											   const Vec4&					result)
// {
// 	const int					size			= faces[coords.face].getWidth();
//
// 	/** @type {Array<number>} */ var					uBounds			= tcuTexVerifierUtil.computeNonNormalizedCoordBounds(sampler.normalizedCoords, size, coords.s, prec.coordBits[0], prec.uvwBits[0]);
// 	/** @type {Array<number>} */ var					vBounds			= tcuTexVerifierUtil.computeNonNormalizedCoordBounds(sampler.normalizedCoords, size, coords.t, prec.coordBits[1], prec.uvwBits[1]);
//
// 	// Integer coordinate bounds for (x0,y0) - without wrap mode
// 	const int					minI			= Math.floor(uBounds[0]-0.5);
// 	const int					maxI			= Math.floor(uBounds[1]-0.5);
// 	const int					minJ			= Math.floor(vBounds[0]-0.5);
// 	const int					maxJ			= Math.floor(vBounds[1]-0.5);
//
// 	/** @type {tcuTextureUtil.TextureChannelClass} */	texClass		= getTextureChannelClass(faces[coords.face].getFormat().type);
// 	float						searchStep		= texClass == tcuTextureUtil.TextureChannelClass.UNSIGNED_FIXED_POINT	? computeBilinearSearchStepForUnorm(prec) :
// 												  texClass == tcuTextureUtil.TextureChannelClass.SIGNED_FIXED_POINT	? computeBilinearSearchStepForSnorm(prec) :
// 												  0.0; // Step is computed for floating-point quads based on texel values.
//
// 	for (int j = minJ; j <= maxJ; j++)
// 	{
// 		for (int i = minI; i <= maxI; i++)
// 		{
// 			const CubeFaceIntCoords	c00	= remapCubeEdgeCoords(CubeFaceIntCoords(coords.face, IVec2(i+0, j+0)), size);
// 			const CubeFaceIntCoords	c10	= remapCubeEdgeCoords(CubeFaceIntCoords(coords.face, IVec2(i+1, j+0)), size);
// 			const CubeFaceIntCoords	c01	= remapCubeEdgeCoords(CubeFaceIntCoords(coords.face, IVec2(i+0, j+1)), size);
// 			const CubeFaceIntCoords	c11	= remapCubeEdgeCoords(CubeFaceIntCoords(coords.face, IVec2(i+1, j+1)), size);
//
// 			// If any of samples is out of both edges, implementations can do pretty much anything according to spec.
// 			// \todo [2013-07-08 pyry] Test the special case where all corner pixels have exactly the same color.
// 			if (c00.face == CUBEFACE_LAST || c01.face == CUBEFACE_LAST || c10.face == CUBEFACE_LAST || c11.face == CUBEFACE_LAST)
// 				return true;
//
// 			// Bounds for filtering factors
// 			const float	minA	= deMath.clamp((uBounds[0]-0.5)-float(i), 0.0, 1.0);
// 			const float	maxA	= deMath.clamp((uBounds[1]-0.5)-float(i), 0.0, 1.0);
// 			const float	minB	= deMath.clamp((vBounds[0]-0.5)-float(j), 0.0, 1.0);
// 			const float	maxB	= deMath.clamp((vBounds[1]-0.5)-float(j), 0.0, 1.0);
//
// 			ColorQuad quad;
// 			quad.p00 = tcuTexLookupVerifier.lookupFloat(faces[c00.face], sampler, c00.s, c00.t, 0);
// 			quad.p10 = tcuTexLookupVerifier.lookupFloat(faces[c10.face], sampler, c10.s, c10.t, 0);
// 			quad.p01 = tcuTexLookupVerifier.lookupFloat(faces[c01.face], sampler, c01.s, c01.t, 0);
// 			quad.p11 = tcuTexLookupVerifier.lookupFloat(faces[c11.face], sampler, c11.s, c11.t, 0);
//
// 			if (texClass == tcuTextureUtil.TextureChannelClass.FLOATING_POINT)
// 				searchStep = computeBilinearSearchStepFromFloatQuad(prec, quad);
//
// 			if (isBilinearRangeValid(prec, quad, Vec2(minA, maxA), Vec2(minB, maxB), searchStep, result))
// 				return true;
// 		}
// 	}
//
// 	return false;
// }
//
// static bool isSeamplessLinearMipmapLinearSampleResultValid (const ConstPixelBufferAccess	(&faces0)[CUBEFACE_LAST],
// 															const ConstPixelBufferAccess	(&faces1)[CUBEFACE_LAST],
// 															const Sampler&					sampler,
// 															const LookupPrecision&			prec,
// 															const CubeFaceFloatCoords&		coords,
// 															/** @type {Array<number>} */ var&						fBounds,
// 															const Vec4&						result)
// {
// 	// \todo [2013-07-04 pyry] This is strictly not correct as coordinates between levels should be dependent.
// 	//						   Right now this allows pairing any two valid bilinear quads.
//
// 	const int					size0			= faces0[coords.face].getWidth();
// 	const int					size1			= faces1[coords.face].getWidth();
//
// 	/** @type {Array<number>} */ var					uBounds0		= tcuTexVerifierUtil.computeNonNormalizedCoordBounds(sampler.normalizedCoords, size0,	coords.s, prec.coordBits[0], prec.uvwBits[0]);
// 	/** @type {Array<number>} */ var					uBounds1		= tcuTexVerifierUtil.computeNonNormalizedCoordBounds(sampler.normalizedCoords, size1,	coords.s, prec.coordBits[0], prec.uvwBits[0]);
// 	/** @type {Array<number>} */ var					vBounds0		= tcuTexVerifierUtil.computeNonNormalizedCoordBounds(sampler.normalizedCoords, size0,	coords.t, prec.coordBits[1], prec.uvwBits[1]);
// 	/** @type {Array<number>} */ var					vBounds1		= tcuTexVerifierUtil.computeNonNormalizedCoordBounds(sampler.normalizedCoords, size1,	coords.t, prec.coordBits[1], prec.uvwBits[1]);
//
// 	// Integer coordinates - without wrap mode
// 	const int					minI0			= Math.floor(uBounds0[0]-0.5);
// 	const int					maxI0			= Math.floor(uBounds0[1]-0.5);
// 	const int					minI1			= Math.floor(uBounds1[0]-0.5);
// 	const int					maxI1			= Math.floor(uBounds1[1]-0.5);
// 	const int					minJ0			= Math.floor(vBounds0[0]-0.5);
// 	const int					maxJ0			= Math.floor(vBounds0[1]-0.5);
// 	const int					minJ1			= Math.floor(vBounds1[0]-0.5);
// 	const int					maxJ1			= Math.floor(vBounds1[1]-0.5);
//
// 	/** @type {tcuTextureUtil.TextureChannelClass} */	texClass		= getTextureChannelClass(faces0[coords.face].getFormat().type);
// 	const float					cSearchStep		= texClass == tcuTextureUtil.TextureChannelClass.UNSIGNED_FIXED_POINT	? computeBilinearSearchStepForUnorm(prec) :
// 												  texClass == tcuTextureUtil.TextureChannelClass.SIGNED_FIXED_POINT	? computeBilinearSearchStepForSnorm(prec) :
// 												  0.0; // Step is computed for floating-point quads based on texel values.
//
// 	for (int j0 = minJ0; j0 <= maxJ0; j0++)
// 	{
// 		for (int i0 = minI0; i0 <= maxI0; i0++)
// 		{
// 			ColorQuad	quad0;
// 			float		searchStep0;
//
// 			{
// 				const CubeFaceIntCoords	c00	= remapCubeEdgeCoords(CubeFaceIntCoords(coords.face, IVec2(i0+0, j0+0)), size0);
// 				const CubeFaceIntCoords	c10	= remapCubeEdgeCoords(CubeFaceIntCoords(coords.face, IVec2(i0+1, j0+0)), size0);
// 				const CubeFaceIntCoords	c01	= remapCubeEdgeCoords(CubeFaceIntCoords(coords.face, IVec2(i0+0, j0+1)), size0);
// 				const CubeFaceIntCoords	c11	= remapCubeEdgeCoords(CubeFaceIntCoords(coords.face, IVec2(i0+1, j0+1)), size0);
//
// 				// If any of samples is out of both edges, implementations can do pretty much anything according to spec.
// 				// \todo [2013-07-08 pyry] Test the special case where all corner pixels have exactly the same color.
// 				if (c00.face == CUBEFACE_LAST || c01.face == CUBEFACE_LAST || c10.face == CUBEFACE_LAST || c11.face == CUBEFACE_LAST)
// 					return true;
//
// 				quad0.p00 = tcuTexLookupVerifier.lookupFloat(faces0[c00.face], sampler, c00.s, c00.t, 0);
// 				quad0.p10 = tcuTexLookupVerifier.lookupFloat(faces0[c10.face], sampler, c10.s, c10.t, 0);
// 				quad0.p01 = tcuTexLookupVerifier.lookupFloat(faces0[c01.face], sampler, c01.s, c01.t, 0);
// 				quad0.p11 = tcuTexLookupVerifier.lookupFloat(faces0[c11.face], sampler, c11.s, c11.t, 0);
//
// 				if (texClass == tcuTextureUtil.TextureChannelClass.FLOATING_POINT)
// 					searchStep0 = computeBilinearSearchStepFromFloatQuad(prec, quad0);
// 				else
// 					searchStep0 = cSearchStep;
// 			}
//
// 			const float	minA0	= deMath.clamp((uBounds0[0]-0.5)-float(i0), 0.0, 1.0);
// 			const float	maxA0	= deMath.clamp((uBounds0[1]-0.5)-float(i0), 0.0, 1.0);
// 			const float	minB0	= deMath.clamp((vBounds0[0]-0.5)-float(j0), 0.0, 1.0);
// 			const float	maxB0	= deMath.clamp((vBounds0[1]-0.5)-float(j0), 0.0, 1.0);
//
// 			for (int j1 = minJ1; j1 <= maxJ1; j1++)
// 			{
// 				for (int i1 = minI1; i1 <= maxI1; i1++)
// 				{
// 					ColorQuad	quad1;
// 					float		searchStep1;
//
// 					{
// 						const CubeFaceIntCoords	c00	= remapCubeEdgeCoords(CubeFaceIntCoords(coords.face, IVec2(i1+0, j1+0)), size1);
// 						const CubeFaceIntCoords	c10	= remapCubeEdgeCoords(CubeFaceIntCoords(coords.face, IVec2(i1+1, j1+0)), size1);
// 						const CubeFaceIntCoords	c01	= remapCubeEdgeCoords(CubeFaceIntCoords(coords.face, IVec2(i1+0, j1+1)), size1);
// 						const CubeFaceIntCoords	c11	= remapCubeEdgeCoords(CubeFaceIntCoords(coords.face, IVec2(i1+1, j1+1)), size1);
//
// 						if (c00.face == CUBEFACE_LAST || c01.face == CUBEFACE_LAST || c10.face == CUBEFACE_LAST || c11.face == CUBEFACE_LAST)
// 							return true;
//
// 						quad1.p00 = tcuTexLookupVerifier.lookupFloat(faces1[c00.face], sampler, c00.s, c00.t, 0);
// 						quad1.p10 = tcuTexLookupVerifier.lookupFloat(faces1[c10.face], sampler, c10.s, c10.t, 0);
// 						quad1.p01 = tcuTexLookupVerifier.lookupFloat(faces1[c01.face], sampler, c01.s, c01.t, 0);
// 						quad1.p11 = tcuTexLookupVerifier.lookupFloat(faces1[c11.face], sampler, c11.s, c11.t, 0);
//
// 						if (texClass == tcuTextureUtil.TextureChannelClass.FLOATING_POINT)
// 							searchStep1 = computeBilinearSearchStepFromFloatQuad(prec, quad1);
// 						else
// 							searchStep1 = cSearchStep;
// 					}
//
// 					const float	minA1	= deMath.clamp((uBounds1[0]-0.5)-float(i1), 0.0, 1.0);
// 					const float	maxA1	= deMath.clamp((uBounds1[1]-0.5)-float(i1), 0.0, 1.0);
// 					const float	minB1	= deMath.clamp((vBounds1[0]-0.5)-float(j1), 0.0, 1.0);
// 					const float	maxB1	= deMath.clamp((vBounds1[1]-0.5)-float(j1), 0.0, 1.0);
//
// 					if (is2DTrilinearFilterResultValid(prec, quad0, quad1, Vec2(minA0, maxA0), Vec2(minB0, maxB0), Vec2(minA1, maxA1), Vec2(minB1, maxB1),
// 													   fBounds, de::min(searchStep0, searchStep1), result))
// 						return true;
// 				}
// 			}
// 		}
// 	}
//
// 	return false;
// }
//
// static bool isCubeLevelSampleResultValid (const ConstPixelBufferAccess		(&level)[CUBEFACE_LAST],
// 										  const Sampler&					sampler,
// 										  const Sampler::FilterMode			filterMode,
// 										  const LookupPrecision&			prec,
// 										  const CubeFaceFloatCoords&		coords,
// 										  const Vec4&						result)
// {
// 	if (filterMode == tcuTexture.FilterMode.LINEAR)
// 	{
// 		if (sampler.seamlessCubeMap)
// 			return isSeamlessLinearSampleResultValid(level, sampler, prec, coords, result);
// 		else
// 			return isLinearSampleResultValid(level[coords.face], sampler, prec, Vec2(coords.s, coords.t), 0, result);
// 	}
// 	else
// 		return isNearestSampleResultValid(level[coords.face], sampler, prec, Vec2(coords.s, coords.t), 0, result);
// }
//
// static bool isCubeMipmapLinearSampleResultValid (const ConstPixelBufferAccess	(&faces0)[CUBEFACE_LAST],
// 												const ConstPixelBufferAccess	(&faces1)[CUBEFACE_LAST],
// 												 const Sampler&					sampler,
// 												 const Sampler::FilterMode		levelFilter,
// 												 const LookupPrecision&			prec,
// 												 const CubeFaceFloatCoords&		coords,
// 												 /** @type {Array<number>} */ var&					fBounds,
// 												 const Vec4&					result)
// {
// 	if (levelFilter == tcuTexture.FilterMode.LINEAR)
// 	{
// 		if (sampler.seamlessCubeMap)
// 			return isSeamplessLinearMipmapLinearSampleResultValid(faces0, faces1, sampler, prec, coords, fBounds, result);
// 		else
// 			return isLinearMipmapLinearSampleResultValid(faces0[coords.face], faces1[coords.face], sampler, prec, Vec2(coords.s, coords.t), 0, fBounds, result);
// 	}
// 	else
// 		return isNearestMipmapLinearSampleResultValid(faces0[coords.face], faces1[coords.face], sampler, prec, Vec2(coords.s, coords.t), 0, fBounds, result);
// }
//
// static void getCubeLevelFaces (const TextureCubeView& texture, const int levelNdx, /** @ype {tcuTexture.ConstPixelBufferAccess} */ var (&out)[CUBEFACE_LAST])
// {
// 	for (int faceNdx = 0; faceNdx < CUBEFACE_LAST; faceNdx++)
// 		out[faceNdx] = texture.getLevelFace(levelNdx, (CubeFace)faceNdx);
// }
//

//
// static inline IVec2 computeLayerRange (int numLayers, int numCoordBits, float layerCoord)
// {
// 	const float	err		= computeFloatingPointError(layerCoord, numCoordBits);
// 	const int	minL	= Math.floor(layerCoord - err + 0.5);		// Round down
// 	const int	maxL	= Math.ceil(layerCoord + err + 0.5) - 1;	// Round up
//
// 	DE_ASSERT(minL <= maxL);
//
// 	return IVec2(deMath.clamp(minL, 0, numLayers-1), deMath.clamp(maxL, 0, numLayers-1));
// }
//

//

//
// static void getCubeArrayLevelFaces (const TextureCubeArrayView& texture, const int levelNdx, const int layerNdx, /** @ype {tcuTexture.ConstPixelBufferAccess} */ var (&out)[CUBEFACE_LAST])
// {
// 	const ConstPixelBufferAccess&	level		= texture.getLevel(levelNdx);
// 	const int						layerDepth	= layerNdx * 6;
//
// 	for (int faceNdx = 0; faceNdx < CUBEFACE_LAST; faceNdx++)
// 	{
// 		const CubeFace face = (CubeFace)faceNdx;
// 		out[faceNdx] = getSubregion(level, 0, 0, layerDepth + getCubeArrayFaceIndex(face), level.getWidth(), level.getHeight(), 1);
// 	}
// }
//

//
// Vec4 computeFixedPointThreshold (const IVec4& bits)
// {
// 	return computeFixedPointError(bits);
// }
//
// Vec4 computeFloatingPointThreshold (const IVec4& bits, const Vec4& value)
// {
// 	return computeFloatingPointError(value, bits);
// }
//
// Vec2 computeLodBoundsFromDerivates (const float dudx, const float dvdx, const float dwdx, const float dudy, const float dvdy, const float dwdy, const LodPrecision& prec)
// {
// 	const float		mu			= de::max(deFloatAbs(dudx), deFloatAbs(dudy));
// 	const float		mv			= de::max(deFloatAbs(dvdx), deFloatAbs(dvdy));
// 	const float		mw			= de::max(deFloatAbs(dwdx), deFloatAbs(dwdy));
// 	const float		minDBound	= de::max(de::max(mu, mv), mw);
// 	const float		maxDBound	= mu + mv + mw;
// 	const float		minDErr		= computeFloatingPointError(minDBound, prec.derivateBits);
// 	const float		maxDErr		= computeFloatingPointError(maxDBound, prec.derivateBits);
// 	const float		minLod		= deFloatLog2(minDBound-minDErr);
// 	const float		maxLod		= deFloatLog2(maxDBound+maxDErr);
// 	const float		lodErr		= computeFixedPointError(prec.lodBits);
//
// 	DE_ASSERT(minLod <= maxLod);
// 	return Vec2(minLod-lodErr, maxLod+lodErr);
// }
//
// Vec2 computeLodBoundsFromDerivates (const float dudx, const float dvdx, const float dudy, const float dvdy, const LodPrecision& prec)
// {
// 	return computeLodBoundsFromDerivates(dudx, dvdx, 0.0, dudy, dvdy, 0.0, prec);
// }
//
// Vec2 computeLodBoundsFromDerivates (const float dudx, const float dudy, const LodPrecision& prec)
// {
// 	return computeLodBoundsFromDerivates(dudx, 0.0, 0.0, dudy, 0.0, 0.0, prec);
// }
//
// Vec2 computeCubeLodBoundsFromDerivates (const Vec3& coord, const Vec3& coordDx, const Vec3& coordDy, const int faceSize, const LodPrecision& prec)
// {
// 	const bool			allowBrokenEdgeDerivate		= false;
// 	const CubeFace		face						= selectCubeFace(coord);
// 	int					maNdx						= 0;
// 	int					sNdx						= 0;
// 	int					tNdx						= 0;
//
// 	// \note Derivate signs don't matter when computing lod
// 	switch (face)
// 	{
// 		case CUBEFACE_NEGATIVE_X:
// 		case CUBEFACE_POSITIVE_X: maNdx = 0; sNdx = 2; tNdx = 1; break;
// 		case CUBEFACE_NEGATIVE_Y:
// 		case CUBEFACE_POSITIVE_Y: maNdx = 1; sNdx = 0; tNdx = 2; break;
// 		case CUBEFACE_NEGATIVE_Z:
// 		case CUBEFACE_POSITIVE_Z: maNdx = 2; sNdx = 0; tNdx = 1; break;
// 		default:
// 			DE_ASSERT(DE_FALSE);
// 	}
//
// 	{
// 		const float		sc		= coord[sNdx];
// 		const float		tc		= coord[tNdx];
// 		const float		ma		= de::abs(coord[maNdx]);
// 		const float		scdx	= coordDx[sNdx];
// 		const float		tcdx	= coordDx[tNdx];
// 		const float		madx	= de::abs(coordDx[maNdx]);
// 		const float		scdy	= coordDy[sNdx];
// 		const float		tcdy	= coordDy[tNdx];
// 		const float		mady	= de::abs(coordDy[maNdx]);
// 		const float		dudx	= float(faceSize) * 0.5 * (scdx*ma - sc*madx) / (ma*ma);
// 		const float		dvdx	= float(faceSize) * 0.5 * (tcdx*ma - tc*madx) / (ma*ma);
// 		const float		dudy	= float(faceSize) * 0.5 * (scdy*ma - sc*mady) / (ma*ma);
// 		const float		dvdy	= float(faceSize) * 0.5 * (tcdy*ma - tc*mady) / (ma*ma);
// 		/** @type {Array<number>} */ var		bounds	= computeLodBoundsFromDerivates(dudx, dvdx, dudy, dvdy, prec);
//
// 		// Implementations may compute derivate from projected (s, t) resulting in incorrect values at edges.
// 		if (allowBrokenEdgeDerivate)
// 		{
// 			const Vec3			dxErr		= computeFloatingPointError(coordDx, IVec3(prec.derivateBits));
// 			const Vec3			dyErr		= computeFloatingPointError(coordDy, IVec3(prec.derivateBits));
// 			const Vec3			xoffs		= abs(coordDx) + dxErr;
// 			const Vec3			yoffs		= abs(coordDy) + dyErr;
//
// 			if (selectCubeFace(coord + xoffs) != face ||
// 				selectCubeFace(coord - xoffs) != face ||
// 				selectCubeFace(coord + yoffs) != face ||
// 				selectCubeFace(coord - yoffs) != face)
// 			{
// 				return Vec2(bounds[0], 1000.0);
// 			}
// 		}
//
// 		return bounds;
// 	}
// }
//
// Vec2 clampLodBounds (/** @type {Array<number>} */ var& lodBounds, /** @type {Array<number>} */ var& lodMinMax, const LodPrecision& prec)
// {
// 	const float lodErr	= computeFixedPointError(prec.lodBits);
// 	const float	a		= lodMinMax[0];
// 	const float	b		= lodMinMax[1];
// 	return Vec2(deMath.clamp(lodBounds[0], a-lodErr, b-lodErr), deMath.clamp(lodBounds[1], a+lodErr, b+lodErr));
// }
//
// bool isLevel1DLookupResultValid (const ConstPixelBufferAccess&	access,
// 								 const Sampler&					sampler,
// 								 TexLookupScaleMode				scaleMode,
// 								 const LookupPrecision&			prec,
// 								 const float					coordX,
// 								 const int						coordY,
// 								 const Vec4&					result)
// {
// 	const Sampler::FilterMode filterMode = scaleMode == TEX_LOOKUP_SCALE_MAGNIFY ? sampler.magFilter : sampler.minFilter;
// 	return isLevelSampleResultValid(access, sampler, filterMode, prec, coordX, coordY, result);
// }
//
// bool isLevel1DLookupResultValid (const ConstPixelBufferAccess&	access,
// 								 const Sampler&					sampler,
// 								 TexLookupScaleMode				scaleMode,
// 								 const IntLookupPrecision&		prec,
// 								 const float					coordX,
// 								 const int						coordY,
// 								 const IVec4&					result)
// {
// 	DE_ASSERT(sampler.minFilter == Sampler::NEAREST && sampler.magFilter == Sampler::NEAREST);
// 	DE_UNREF(scaleMode);
// 	return isNearestSampleResultValid(access, sampler, prec, coordX, coordY, result);
// }
//
// bool isLevel1DLookupResultValid (const ConstPixelBufferAccess&	access,
// 								 const Sampler&					sampler,
// 								 TexLookupScaleMode				scaleMode,
// 								 const IntLookupPrecision&		prec,
// 								 const float					coordX,
// 								 const int						coordY,
// 								 const UVec4&					result)
// {
// 	DE_ASSERT(sampler.minFilter == Sampler::NEAREST && sampler.magFilter == Sampler::NEAREST);
// 	DE_UNREF(scaleMode);
// 	return isNearestSampleResultValid(access, sampler, prec, coordX, coordY, result);
// }
//
// bool isLevel2DLookupResultValid (const ConstPixelBufferAccess&	access,
// 								 const Sampler&					sampler,
// 								 TexLookupScaleMode				scaleMode,
// 								 const LookupPrecision&			prec,
// 								 /** @type {Array<number>} */ var&					coord,
// 								 const int						coordZ,
// 								 const Vec4&					result)
// {
// 	const Sampler::FilterMode filterMode = scaleMode == TEX_LOOKUP_SCALE_MAGNIFY ? sampler.magFilter : sampler.minFilter;
// 	return isLevelSampleResultValid(access, sampler, filterMode, prec, coord, coordZ, result);
// }
//
// bool isLevel2DLookupResultValid (const ConstPixelBufferAccess&	access,
// 								 const Sampler&					sampler,
// 								 TexLookupScaleMode				scaleMode,
// 								 const IntLookupPrecision&		prec,
// 								 /** @type {Array<number>} */ var&					coord,
// 								 const int						coordZ,
// 								 const IVec4&					result)
// {
// 	DE_ASSERT(sampler.minFilter == Sampler::NEAREST && sampler.magFilter == Sampler::NEAREST);
// 	DE_UNREF(scaleMode);
// 	return isNearestSampleResultValid(access, sampler, prec, coord, coordZ, result);
// }
//
// bool isLevel2DLookupResultValid (const ConstPixelBufferAccess&	access,
// 								 const Sampler&					sampler,
// 								 TexLookupScaleMode				scaleMode,
// 								 const IntLookupPrecision&		prec,
// 								 /** @type {Array<number>} */ var&					coord,
// 								 const int						coordZ,
// 								 const UVec4&					result)
// {
// 	DE_ASSERT(sampler.minFilter == Sampler::NEAREST && sampler.magFilter == Sampler::NEAREST);
// 	DE_UNREF(scaleMode);
// 	return isNearestSampleResultValid(access, sampler, prec, coord, coordZ, result);
// }
//
// bool isLevel3DLookupResultValid (const ConstPixelBufferAccess&	access,
// 								 const Sampler&					sampler,
// 								 TexLookupScaleMode				scaleMode,
// 								 const LookupPrecision&			prec,
// 								 const Vec3&					coord,
// 								 const Vec4&					result)
// {
// 	const tcu::Sampler::FilterMode filterMode = scaleMode == TEX_LOOKUP_SCALE_MAGNIFY ? sampler.magFilter : sampler.minFilter;
// 	return isLevelSampleResultValid(access, sampler, filterMode, prec, coord, result);
// }
//
// bool isLevel3DLookupResultValid (const ConstPixelBufferAccess&	access,
// 								 const Sampler&					sampler,
// 								 TexLookupScaleMode				scaleMode,
// 								 const IntLookupPrecision&		prec,
// 								 const Vec3&					coord,
// 								 const IVec4&					result)
// {
// 	DE_ASSERT(sampler.minFilter == Sampler::NEAREST && sampler.magFilter == Sampler::NEAREST);
// 	DE_UNREF(scaleMode);
// 	return isNearestSampleResultValid(access, sampler, prec, coord, result);
// }
//
// bool isLevel3DLookupResultValid (const ConstPixelBufferAccess&	access,
// 								 const Sampler&					sampler,
// 								 TexLookupScaleMode				scaleMode,
// 								 const IntLookupPrecision&		prec,
// 								 const Vec3&					coord,
// 								 const UVec4&					result)
// {
// 	DE_ASSERT(sampler.minFilter == Sampler::NEAREST && sampler.magFilter == Sampler::NEAREST);
// 	DE_UNREF(scaleMode);
// 	return isNearestSampleResultValid(access, sampler, prec, coord, result);
// }
//
// } // tcu
});
