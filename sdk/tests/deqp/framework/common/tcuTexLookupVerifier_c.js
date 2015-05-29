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
     * @constructor
     */
    tcuTexLookupVerifier.IntLookupPrecision = function() {
        /** @type {Array<number>} */ this.coordBits = [22, 22, 22];
        /** @type {Array<number>} */ this.uvwBits = [16, 16, 16];
        /** @type {Array<number>} */ this.colorThreshold = [0, 0, 0, 0];
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
	 * @param {tcuTexLookupVerifier.LookupPrecision} prec
	 * @param {Array<number>} ref
	 * @param {Array<number>} result
	 * @return {boolean}
	 */
	tcuTexLookupVerifier.isColorValid_Vec = function(prec, ref, result) {
		const Vec4 diff = abs(ref - result);
		return deMath.boolAll(
			deMath.logicalOrBool(
				deMath.lessThanEqual(diff, prec.colorThreshold),
				deMath.logicalNotBool(prec.colorMask)));
	};
	/**
	 * @param {tcuTexLookupVerifier.IntLookupPrecision} prec
	 * @param {Array<number>} ref
	 * @param {Array<number>} result
	 * @return {boolean}
	 */
	tcuTexLookupVerifier.isColorValid_IVec = function(prec, ref, result) {
		return deMath.boolAll(
			deMath.logicalOrBool(
				deMath.lessThanEqual(deMath.absDiff(ref, result), prec.colorThreshold),
				deMath.logicalNotBool(prec.colorMask)));
	};
	/**
	 * @param {tcuTexLookupVerifier.IntLookupPrecision} prec
	 * @param {Array<number>} ref
	 * @param {Array<number>} result
	 * @return {boolean}
	 */
	tcuTexLookupVerifier.isColorValid_UVec = function(prec, ref, result) {
		return deMath.boolAll(
			deMath.logicalOrBool(
				deMath.lessThanEqual(deMath.absDiff(ref, result), prec.colorThreshold),
				deMath.logicalNotBool(prec.colorMask)));
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
     * @constructor
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

		/** @const {number} */ var maxSteps = 1<<16;
		/** @type {Array<number>} */ var d = deMath.absDiff(line.p1, line.p0);
		/** @type {Array<number>} */ var stepCount = deMath.divide([d, d, d, d], prec.colorThreshold);
		/** @type {Array<number>} */
		var minStep = deMath.divide([1.0, 1.0, 1.0, 1.0], deMath.add(stepCount, [1.0, 1.0, 1.0, 1.0]));
		/** @const {number} */ var step = deMath.max(tcuTexLookupVerifier.minComp(minStep), 1.0 / maxSteps);

		return step;
	};

	/**
	 * @param  {tcuTexLookupVerifier.LookupPrecision} prec
	 * @param  {tcuTexLookupVerifier.ColorQuad} quad
	 * @return {number}
	 */
	tcuTexLookupVerifier.computeBilinearSearchStepFromFloatQuad = function(prec, quad) {
		assertMsgOptions(deMath.boolAll(deMath.greaterThan(prec.colorThreshold, [0.0, 0.0, 0.0, 0.0])), '', false, true);

		/** @const {number} */ var maxSteps	= 1<<16;
		/** @const {Array<number>} */ var d0 = deMath.absDiff(quad.p10, quad.p00);
		/** @const {Array<number>} */ var d1 = deMath.absDiff(quad.p01, quad.p00);
		/** @const {Array<number>} */ var d2 = deMath.absDiff(quad.p11, quad.p10);
		/** @const {Array<number>} */ var d3 = deMath.absDiff(quad.p11, quad.p01);
		/** @const {Array<number>} */ var maxD = deMath.max(d0, deMath.max(d1, deMath.max(d2, d3)));
		/** @const {Array<number>} */ var stepCount	= deMath.divide(maxD, prec.colorThreshold);
		/** @const {Array<number>} */ var minStep = deMath.divide([1.0, 1.0, 1.0, 1.0], deMath.add(stepCount, [1.0, 1.0, 1.0, 1.0]));
		/** @const {number} */ var step = Math.max(tcuTexLookupVerifier.minComp(minStep), 1.0 / maxSteps);

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

// // Range search utilities
//
// static bool isLinearRangeValid (const LookupPrecision&	prec,
// 								const Vec4&				c0,
// 								const Vec4&				c1,
// 								const Vec2&				fBounds,
// 								const Vec4&				result)
// {
// 	// This is basically line segment - AABB test. Valid interpolation line is checked
// 	// against result AABB constructed by applying threshold.
//
// 	const Vec4		i0				= c0*(1.0f - fBounds[0]) + c1*fBounds[0];
// 	const Vec4		i1				= c0*(1.0f - fBounds[1]) + c1*fBounds[1];
// 	const Vec4		rMin			= result - prec.colorThreshold;
// 	const Vec4		rMax			= result + prec.colorThreshold;
// 	bool			allIntersect	= true;
//
// 	// Algorithm: For each component check whether segment endpoints are inside, or intersect with slab.
// 	// If all intersect or are inside, line segment intersects the whole 4D AABB.
// 	for (int compNdx = 0; compNdx < 4; compNdx++)
// 	{
// 		if (!prec.colorMask[compNdx])
// 			continue;
//
// 		// Signs for both bounds: false = left, true = right.
// 		const bool	sMin0	= i0[compNdx] >= rMin[compNdx];
// 		const bool	sMin1	= i1[compNdx] >= rMin[compNdx];
// 		const bool	sMax0	= i0[compNdx] > rMax[compNdx];
// 		const bool	sMax1	= i1[compNdx] > rMax[compNdx];
//
// 		// If all signs are equal, line segment is outside bounds.
// 		if (sMin0 == sMin1 && sMin1 == sMax0 && sMax0 == sMax1)
// 		{
// 			allIntersect = false;
// 			break;
// 		}
// 	}
//
// 	return allIntersect;
// }
//
// static bool isBilinearRangeValid (const LookupPrecision&	prec,
// 								  const ColorQuad&			quad,
// 								  const Vec2&				xBounds,
// 								  const Vec2&				yBounds,
// 								  const float				searchStep,
// 								  const Vec4&				result)
// {
// 	DE_ASSERT(xBounds.x() <= xBounds.y());
// 	DE_ASSERT(yBounds.x() <= yBounds.y());
//
// 	if (!isInColorBounds(prec, quad, result))
// 		return false;
//
// 	for (float x = xBounds.x(); x < xBounds.y()+searchStep; x += searchStep)
// 	{
// 		const float		a	= de::min(x, xBounds.y());
// 		const Vec4		c0	= quad.p00*(1.0f - a) + quad.p10*a;
// 		const Vec4		c1	= quad.p01*(1.0f - a) + quad.p11*a;
//
// 		if (isLinearRangeValid(prec, c0, c1, yBounds, result))
// 			return true;
// 	}
//
// 	return false;
// }
//
// static bool isTrilinearRangeValid (const LookupPrecision&	prec,
// 								   const ColorQuad&			quad0,
// 								   const ColorQuad&			quad1,
// 								   const Vec2&				xBounds,
// 								   const Vec2&				yBounds,
// 								   const Vec2&				zBounds,
// 								   const float				searchStep,
// 								   const Vec4&				result)
// {
// 	DE_ASSERT(xBounds.x() <= xBounds.y());
// 	DE_ASSERT(yBounds.x() <= yBounds.y());
// 	DE_ASSERT(zBounds.x() <= zBounds.y());
//
// 	if (!isInColorBounds(prec, quad0, quad1, result))
// 		return false;
//
// 	for (float x = xBounds.x(); x < xBounds.y()+searchStep; x += searchStep)
// 	{
// 		for (float y = yBounds.x(); y < yBounds.y()+searchStep; y += searchStep)
// 		{
// 			const float		a	= de::min(x, xBounds.y());
// 			const float		b	= de::min(y, yBounds.y());
// 			const Vec4		c0	= quad0.p00*(1.0f-a)*(1.0f-b) + quad0.p10*a*(1.0f-b) + quad0.p01*(1.0f-a)*b + quad0.p11*a*b;
// 			const Vec4		c1	= quad1.p00*(1.0f-a)*(1.0f-b) + quad1.p10*a*(1.0f-b) + quad1.p01*(1.0f-a)*b + quad1.p11*a*b;
//
// 			if (isLinearRangeValid(prec, c0, c1, zBounds, result))
// 				return true;
// 		}
// 	}
//
// 	return false;
// }
//
// static bool is1DTrilinearFilterResultValid (const LookupPrecision&	prec,
// 											const ColorLine&		line0,
// 											const ColorLine&		line1,
// 											const Vec2&				xBounds0,
// 											const Vec2&				xBounds1,
// 											const Vec2&				zBounds,
// 											const float				searchStep,
// 											const Vec4&				result)
// {
// 	DE_ASSERT(xBounds0.x() <= xBounds0.y());
// 	DE_ASSERT(xBounds1.x() <= xBounds1.y());
//
// 	if (!isInColorBounds(prec, line0, line1, result))
// 		return false;
//
// 	for (float x0 = xBounds0.x(); x0 < xBounds0.y()+searchStep; x0 += searchStep)
// 	{
// 		const float		a0	= de::min(x0, xBounds0.y());
// 		const Vec4		c0	= line0.p0*(1.0f-a0) + line0.p1*a0;
//
// 		for (float x1 = xBounds1.x(); x1 <= xBounds1.y(); x1 += searchStep)
// 		{
// 			const float		a1	= de::min(x1, xBounds1.y());
// 			const Vec4		c1	= line1.p0*(1.0f-a1) + line1.p1*a1;
//
// 			if (isLinearRangeValid(prec, c0, c1, zBounds, result))
// 				return true;
// 		}
// 	}
//
// 	return false;
// }
//
// static bool is2DTrilinearFilterResultValid (const LookupPrecision&	prec,
// 											const ColorQuad&		quad0,
// 											const ColorQuad&		quad1,
// 											const Vec2&				xBounds0,
// 											const Vec2&				yBounds0,
// 											const Vec2&				xBounds1,
// 											const Vec2&				yBounds1,
// 											const Vec2&				zBounds,
// 											const float				searchStep,
// 											const Vec4&				result)
// {
// 	DE_ASSERT(xBounds0.x() <= xBounds0.y());
// 	DE_ASSERT(yBounds0.x() <= yBounds0.y());
// 	DE_ASSERT(xBounds1.x() <= xBounds1.y());
// 	DE_ASSERT(yBounds1.x() <= yBounds1.y());
//
// 	if (!isInColorBounds(prec, quad0, quad1, result))
// 		return false;
//
// 	for (float x0 = xBounds0.x(); x0 < xBounds0.y()+searchStep; x0 += searchStep)
// 	{
// 		for (float y0 = yBounds0.x(); y0 < yBounds0.y()+searchStep; y0 += searchStep)
// 		{
// 			const float		a0	= de::min(x0, xBounds0.y());
// 			const float		b0	= de::min(y0, yBounds0.y());
// 			const Vec4		c0	= quad0.p00*(1.0f-a0)*(1.0f-b0) + quad0.p10*a0*(1.0f-b0) + quad0.p01*(1.0f-a0)*b0 + quad0.p11*a0*b0;
//
// 			for (float x1 = xBounds1.x(); x1 <= xBounds1.y(); x1 += searchStep)
// 			{
// 				for (float y1 = yBounds1.x(); y1 <= yBounds1.y(); y1 += searchStep)
// 				{
// 					const float		a1	= de::min(x1, xBounds1.y());
// 					const float		b1	= de::min(y1, yBounds1.y());
// 					const Vec4		c1	= quad1.p00*(1.0f-a1)*(1.0f-b1) + quad1.p10*a1*(1.0f-b1) + quad1.p01*(1.0f-a1)*b1 + quad1.p11*a1*b1;
//
// 					if (isLinearRangeValid(prec, c0, c1, zBounds, result))
// 						return true;
// 				}
// 			}
// 		}
// 	}
//
// 	return false;
// }
//
// static bool is3DTrilinearFilterResultValid (const LookupPrecision&	prec,
// 											const ColorQuad&		quad00,
// 											const ColorQuad&		quad01,
// 											const ColorQuad&		quad10,
// 											const ColorQuad&		quad11,
// 											const Vec2&				xBounds0,
// 											const Vec2&				yBounds0,
// 											const Vec2&				zBounds0,
// 											const Vec2&				xBounds1,
// 											const Vec2&				yBounds1,
// 											const Vec2&				zBounds1,
// 											const Vec2&				wBounds,
// 											const float				searchStep,
// 											const Vec4&				result)
// {
// 	DE_ASSERT(xBounds0.x() <= xBounds0.y());
// 	DE_ASSERT(yBounds0.x() <= yBounds0.y());
// 	DE_ASSERT(zBounds0.x() <= zBounds0.y());
// 	DE_ASSERT(xBounds1.x() <= xBounds1.y());
// 	DE_ASSERT(yBounds1.x() <= yBounds1.y());
// 	DE_ASSERT(zBounds1.x() <= zBounds1.y());
//
// 	if (!isInColorBounds(prec, quad00, quad01, quad10, quad11, result))
// 		return false;
//
// 	for (float x0 = xBounds0.x(); x0 < xBounds0.y()+searchStep; x0 += searchStep)
// 	{
// 		for (float y0 = yBounds0.x(); y0 < yBounds0.y()+searchStep; y0 += searchStep)
// 		{
// 			const float		a0	= de::min(x0, xBounds0.y());
// 			const float		b0	= de::min(y0, yBounds0.y());
// 			const Vec4		c00	= quad00.p00*(1.0f-a0)*(1.0f-b0) + quad00.p10*a0*(1.0f-b0) + quad00.p01*(1.0f-a0)*b0 + quad00.p11*a0*b0;
// 			const Vec4		c01	= quad01.p00*(1.0f-a0)*(1.0f-b0) + quad01.p10*a0*(1.0f-b0) + quad01.p01*(1.0f-a0)*b0 + quad01.p11*a0*b0;
//
// 			for (float z0 = zBounds0.x(); z0 < zBounds0.y()+searchStep; z0 += searchStep)
// 			{
// 				const float		c0	= de::min(z0, zBounds0.y());
// 				const Vec4		cz0	= c00*(1.0f-c0) + c01*c0;
//
// 				for (float x1 = xBounds1.x(); x1 < xBounds1.y()+searchStep; x1 += searchStep)
// 				{
// 					for (float y1 = yBounds1.x(); y1 < yBounds1.y()+searchStep; y1 += searchStep)
// 					{
// 						const float		a1	= de::min(x1, xBounds1.y());
// 						const float		b1	= de::min(y1, yBounds1.y());
// 						const Vec4		c10	= quad10.p00*(1.0f-a1)*(1.0f-b1) + quad10.p10*a1*(1.0f-b1) + quad10.p01*(1.0f-a1)*b1 + quad10.p11*a1*b1;
// 						const Vec4		c11	= quad11.p00*(1.0f-a1)*(1.0f-b1) + quad11.p10*a1*(1.0f-b1) + quad11.p01*(1.0f-a1)*b1 + quad11.p11*a1*b1;
//
// 						for (float z1 = zBounds1.x(); z1 < zBounds1.y()+searchStep; z1 += searchStep)
// 						{
// 							const float		c1	= de::min(z1, zBounds1.y());
// 							const Vec4		cz1	= c10*(1.0f - c1) + c11*c1;
//
// 							if (isLinearRangeValid(prec, cz0, cz1, wBounds, result))
// 								return true;
// 						}
// 					}
// 				}
// 			}
// 		}
// 	}
//
// 	return false;
// }
//
// template<typename PrecType, typename ScalarType>
// static bool isNearestSampleResultValid (const ConstPixelBufferAccess&		level,
// 										const Sampler&						sampler,
// 										const PrecType&						prec,
// 										const float							coordX,
// 										const int							coordY,
// 										const Vector<ScalarType, 4>&		result)
// {
// 	DE_ASSERT(level.getDepth() == 1);
//
// 	const Vec2		uBounds			= computeNonNormalizedCoordBounds(sampler.normalizedCoords, level.getWidth(),	coordX, prec.coordBits.x(), prec.uvwBits.x());
//
// 	const int		minI			= deFloorFloatToInt32(uBounds.x());
// 	const int		maxI			= deFloorFloatToInt32(uBounds.y());
//
// 	for (int i = minI; i <= maxI; i++)
// 	{
// 		const int					x		= wrap(sampler.wrapS, i, level.getWidth());
// 		const Vector<ScalarType, 4>	color	= lookup<ScalarType>(level, sampler, x, coordY, 0);
//
// 		if (isColorValid(prec, color, result))
// 			return true;
// 	}
//
// 	return false;
// }
//
// template<typename PrecType, typename ScalarType>
// static bool isNearestSampleResultValid (const ConstPixelBufferAccess&		level,
// 										const Sampler&						sampler,
// 										const PrecType&						prec,
// 										const Vec2&							coord,
// 										const int							coordZ,
// 										const Vector<ScalarType, 4>&		result)
// {
// 	const Vec2		uBounds			= computeNonNormalizedCoordBounds(sampler.normalizedCoords, level.getWidth(),	coord.x(), prec.coordBits.x(), prec.uvwBits.x());
// 	const Vec2		vBounds			= computeNonNormalizedCoordBounds(sampler.normalizedCoords, level.getHeight(),	coord.y(), prec.coordBits.y(), prec.uvwBits.y());
//
// 	// Integer coordinates - without wrap mode
// 	const int		minI			= deFloorFloatToInt32(uBounds.x());
// 	const int		maxI			= deFloorFloatToInt32(uBounds.y());
// 	const int		minJ			= deFloorFloatToInt32(vBounds.x());
// 	const int		maxJ			= deFloorFloatToInt32(vBounds.y());
//
// 	// \todo [2013-07-03 pyry] This could be optimized by first computing ranges based on wrap mode.
//
// 	for (int j = minJ; j <= maxJ; j++)
// 	{
// 		for (int i = minI; i <= maxI; i++)
// 		{
// 			const int					x		= wrap(sampler.wrapS, i, level.getWidth());
// 			const int					y		= wrap(sampler.wrapT, j, level.getHeight());
// 			const Vector<ScalarType, 4>	color	= lookup<ScalarType>(level, sampler, x, y, coordZ);
//
// 			if (isColorValid(prec, color, result))
// 				return true;
// 		}
// 	}
//
// 	return false;
// }
//
// template<typename PrecType, typename ScalarType>
// static bool isNearestSampleResultValid (const ConstPixelBufferAccess&		level,
// 										const Sampler&						sampler,
// 										const PrecType&						prec,
// 										const Vec3&							coord,
// 										const Vector<ScalarType, 4>&		result)
// {
// 	const Vec2		uBounds			= computeNonNormalizedCoordBounds(sampler.normalizedCoords, level.getWidth(),	coord.x(), prec.coordBits.x(), prec.uvwBits.x());
// 	const Vec2		vBounds			= computeNonNormalizedCoordBounds(sampler.normalizedCoords, level.getHeight(),	coord.y(), prec.coordBits.y(), prec.uvwBits.y());
// 	const Vec2		wBounds			= computeNonNormalizedCoordBounds(sampler.normalizedCoords, level.getDepth(),	coord.z(), prec.coordBits.z(), prec.uvwBits.z());
//
// 	// Integer coordinates - without wrap mode
// 	const int		minI			= deFloorFloatToInt32(uBounds.x());
// 	const int		maxI			= deFloorFloatToInt32(uBounds.y());
// 	const int		minJ			= deFloorFloatToInt32(vBounds.x());
// 	const int		maxJ			= deFloorFloatToInt32(vBounds.y());
// 	const int		minK			= deFloorFloatToInt32(wBounds.x());
// 	const int		maxK			= deFloorFloatToInt32(wBounds.y());
//
// 	// \todo [2013-07-03 pyry] This could be optimized by first computing ranges based on wrap mode.
//
// 	for (int k = minK; k <= maxK; k++)
// 	{
// 		for (int j = minJ; j <= maxJ; j++)
// 		{
// 			for (int i = minI; i <= maxI; i++)
// 			{
// 				const int					x		= wrap(sampler.wrapS, i, level.getWidth());
// 				const int					y		= wrap(sampler.wrapT, j, level.getHeight());
// 				const int					z		= wrap(sampler.wrapR, k, level.getDepth());
// 				const Vector<ScalarType, 4>	color	= lookup<ScalarType>(level, sampler, x, y, z);
//
// 				if (isColorValid(prec, color, result))
// 					return true;
// 			}
// 		}
// 	}
//
// 	return false;
// }
//
// bool isLinearSampleResultValid (const ConstPixelBufferAccess&		level,
// 								const Sampler&						sampler,
// 								const LookupPrecision&				prec,
// 								const float							coordX,
// 								const int							coordY,
// 								const Vec4&							result)
// {
// 	const Vec2					uBounds			= computeNonNormalizedCoordBounds(sampler.normalizedCoords, level.getWidth(), coordX, prec.coordBits.x(), prec.uvwBits.x());
//
// 	const int					minI			= deFloorFloatToInt32(uBounds.x()-0.5f);
// 	const int					maxI			= deFloorFloatToInt32(uBounds.y()-0.5f);
//
// 	const int					w				= level.getWidth();
//
// 	for (int i = minI; i <= maxI; i++)
// 	{
// 		// Wrapped coordinates
// 		const int	x0		= wrap(sampler.wrapS, i  , w);
// 		const int	x1		= wrap(sampler.wrapS, i+1, w);
//
// 		// Bounds for filtering factors
// 		const float	minA	= de::clamp((uBounds.x()-0.5f)-float(i), 0.0f, 1.0f);
// 		const float	maxA	= de::clamp((uBounds.y()-0.5f)-float(i), 0.0f, 1.0f);
//
// 		const Vec4	colorA	= lookup<float>(level, sampler, x0, coordY, 0);
// 		const Vec4	colorB	= lookup<float>(level, sampler, x1, coordY, 0);
//
// 		if (isLinearRangeValid(prec, colorA, colorB, Vec2(minA, maxA), result))
// 			return true;
// 	}
//
// 	return false;
// }
//
// bool isLinearSampleResultValid (const ConstPixelBufferAccess&		level,
// 								const Sampler&						sampler,
// 								const LookupPrecision&				prec,
// 								const Vec2&							coord,
// 								const int							coordZ,
// 								const Vec4&							result)
// {
// 	const Vec2					uBounds			= computeNonNormalizedCoordBounds(sampler.normalizedCoords, level.getWidth(),	coord.x(), prec.coordBits.x(), prec.uvwBits.x());
// 	const Vec2					vBounds			= computeNonNormalizedCoordBounds(sampler.normalizedCoords, level.getHeight(),	coord.y(), prec.coordBits.y(), prec.uvwBits.y());
//
// 	// Integer coordinate bounds for (x0,y0) - without wrap mode
// 	const int					minI			= deFloorFloatToInt32(uBounds.x()-0.5f);
// 	const int					maxI			= deFloorFloatToInt32(uBounds.y()-0.5f);
// 	const int					minJ			= deFloorFloatToInt32(vBounds.x()-0.5f);
// 	const int					maxJ			= deFloorFloatToInt32(vBounds.y()-0.5f);
//
// 	const int					w				= level.getWidth();
// 	const int					h				= level.getHeight();
//
// 	const TextureChannelClass	texClass		= getTextureChannelClass(level.getFormat().type);
// 	float						searchStep		= texClass == TEXTURECHANNELCLASS_UNSIGNED_FIXED_POINT	? computeBilinearSearchStepForUnorm(prec) :
// 												  texClass == TEXTURECHANNELCLASS_SIGNED_FIXED_POINT	? computeBilinearSearchStepForSnorm(prec) :
// 												  0.0f; // Step is computed for floating-point quads based on texel values.
//
// 	// \todo [2013-07-03 pyry] This could be optimized by first computing ranges based on wrap mode.
//
// 	for (int j = minJ; j <= maxJ; j++)
// 	{
// 		for (int i = minI; i <= maxI; i++)
// 		{
// 			// Wrapped coordinates
// 			const int	x0		= wrap(sampler.wrapS, i  , w);
// 			const int	x1		= wrap(sampler.wrapS, i+1, w);
// 			const int	y0		= wrap(sampler.wrapT, j  , h);
// 			const int	y1		= wrap(sampler.wrapT, j+1, h);
//
// 			// Bounds for filtering factors
// 			const float	minA	= de::clamp((uBounds.x()-0.5f)-float(i), 0.0f, 1.0f);
// 			const float	maxA	= de::clamp((uBounds.y()-0.5f)-float(i), 0.0f, 1.0f);
// 			const float	minB	= de::clamp((vBounds.x()-0.5f)-float(j), 0.0f, 1.0f);
// 			const float	maxB	= de::clamp((vBounds.y()-0.5f)-float(j), 0.0f, 1.0f);
//
// 			ColorQuad quad;
// 			lookupQuad(quad, level, sampler, x0, x1, y0, y1, coordZ);
//
// 			if (texClass == TEXTURECHANNELCLASS_FLOATING_POINT)
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
// static bool isLinearSampleResultValid (const ConstPixelBufferAccess&		level,
// 									   const Sampler&						sampler,
// 									   const LookupPrecision&				prec,
// 									   const Vec3&							coord,
// 									   const Vec4&							result)
// {
// 	const Vec2					uBounds			= computeNonNormalizedCoordBounds(sampler.normalizedCoords, level.getWidth(),	coord.x(), prec.coordBits.x(), prec.uvwBits.x());
// 	const Vec2					vBounds			= computeNonNormalizedCoordBounds(sampler.normalizedCoords, level.getHeight(),	coord.y(), prec.coordBits.y(), prec.uvwBits.y());
// 	const Vec2					wBounds			= computeNonNormalizedCoordBounds(sampler.normalizedCoords, level.getDepth(),	coord.z(), prec.coordBits.z(), prec.uvwBits.z());
//
// 	// Integer coordinate bounds for (x0,y0) - without wrap mode
// 	const int					minI			= deFloorFloatToInt32(uBounds.x()-0.5f);
// 	const int					maxI			= deFloorFloatToInt32(uBounds.y()-0.5f);
// 	const int					minJ			= deFloorFloatToInt32(vBounds.x()-0.5f);
// 	const int					maxJ			= deFloorFloatToInt32(vBounds.y()-0.5f);
// 	const int					minK			= deFloorFloatToInt32(wBounds.x()-0.5f);
// 	const int					maxK			= deFloorFloatToInt32(wBounds.y()-0.5f);
//
// 	const int					w				= level.getWidth();
// 	const int					h				= level.getHeight();
// 	const int					d				= level.getDepth();
//
// 	const TextureChannelClass	texClass		= getTextureChannelClass(level.getFormat().type);
// 	float						searchStep		= texClass == TEXTURECHANNELCLASS_UNSIGNED_FIXED_POINT	? computeBilinearSearchStepForUnorm(prec) :
// 												  texClass == TEXTURECHANNELCLASS_SIGNED_FIXED_POINT	? computeBilinearSearchStepForSnorm(prec) :
// 												  0.0f; // Step is computed for floating-point quads based on texel values.
//
// 	// \todo [2013-07-03 pyry] This could be optimized by first computing ranges based on wrap mode.
//
// 	for (int k = minK; k <= maxK; k++)
// 	{
// 		for (int j = minJ; j <= maxJ; j++)
// 		{
// 			for (int i = minI; i <= maxI; i++)
// 			{
// 				// Wrapped coordinates
// 				const int	x0		= wrap(sampler.wrapS, i  , w);
// 				const int	x1		= wrap(sampler.wrapS, i+1, w);
// 				const int	y0		= wrap(sampler.wrapT, j  , h);
// 				const int	y1		= wrap(sampler.wrapT, j+1, h);
// 				const int	z0		= wrap(sampler.wrapR, k  , d);
// 				const int	z1		= wrap(sampler.wrapR, k+1, d);
//
// 				// Bounds for filtering factors
// 				const float	minA	= de::clamp((uBounds.x()-0.5f)-float(i), 0.0f, 1.0f);
// 				const float	maxA	= de::clamp((uBounds.y()-0.5f)-float(i), 0.0f, 1.0f);
// 				const float	minB	= de::clamp((vBounds.x()-0.5f)-float(j), 0.0f, 1.0f);
// 				const float	maxB	= de::clamp((vBounds.y()-0.5f)-float(j), 0.0f, 1.0f);
// 				const float	minC	= de::clamp((wBounds.x()-0.5f)-float(k), 0.0f, 1.0f);
// 				const float	maxC	= de::clamp((wBounds.y()-0.5f)-float(k), 0.0f, 1.0f);
//
// 				ColorQuad quad0, quad1;
// 				lookupQuad(quad0, level, sampler, x0, x1, y0, y1, z0);
// 				lookupQuad(quad1, level, sampler, x0, x1, y0, y1, z1);
//
// 				if (texClass == TEXTURECHANNELCLASS_FLOATING_POINT)
// 					searchStep = de::min(computeBilinearSearchStepFromFloatQuad(prec, quad0), computeBilinearSearchStepFromFloatQuad(prec, quad1));
//
// 				if (isTrilinearRangeValid(prec, quad0, quad1, Vec2(minA, maxA), Vec2(minB, maxB), Vec2(minC, maxC), searchStep, result))
// 					return true;
// 			}
// 		}
// 	}
//
// 	return false;
// }
//
// static bool isNearestMipmapLinearSampleResultValid (const ConstPixelBufferAccess&	level0,
// 													const ConstPixelBufferAccess&	level1,
// 													const Sampler&					sampler,
// 													const LookupPrecision&			prec,
// 													const float						coord,
// 													const int						coordY,
// 													const Vec2&						fBounds,
// 													const Vec4&						result)
// {
// 	const int		w0				= level0.getWidth();
// 	const int		w1				= level1.getWidth();
//
// 	const Vec2		uBounds0		= computeNonNormalizedCoordBounds(sampler.normalizedCoords, w0,	coord, prec.coordBits.x(), prec.uvwBits.x());
// 	const Vec2		uBounds1		= computeNonNormalizedCoordBounds(sampler.normalizedCoords, w1,	coord, prec.coordBits.x(), prec.uvwBits.x());
//
// 	// Integer coordinates - without wrap mode
// 	const int		minI0			= deFloorFloatToInt32(uBounds0.x());
// 	const int		maxI0			= deFloorFloatToInt32(uBounds0.y());
// 	const int		minI1			= deFloorFloatToInt32(uBounds1.x());
// 	const int		maxI1			= deFloorFloatToInt32(uBounds1.y());
//
// 	for (int i0 = minI0; i0 <= maxI0; i0++)
// 	{
// 		for (int i1 = minI1; i1 <= maxI1; i1++)
// 		{
// 			const Vec4	c0	= lookup<float>(level0, sampler, wrap(sampler.wrapS, i0, w0), coordY, 0);
// 			const Vec4	c1	= lookup<float>(level1, sampler, wrap(sampler.wrapS, i1, w1), coordY, 0);
//
// 			if (isLinearRangeValid(prec, c0, c1, fBounds, result))
// 				return true;
// 		}
// 	}
//
// 	return false;
// }
//
// static bool isNearestMipmapLinearSampleResultValid (const ConstPixelBufferAccess&	level0,
// 													const ConstPixelBufferAccess&	level1,
// 													const Sampler&					sampler,
// 													const LookupPrecision&			prec,
// 													const Vec2&						coord,
// 													const int						coordZ,
// 													const Vec2&						fBounds,
// 													const Vec4&						result)
// {
// 	const int		w0				= level0.getWidth();
// 	const int		w1				= level1.getWidth();
// 	const int		h0				= level0.getHeight();
// 	const int		h1				= level1.getHeight();
//
// 	const Vec2		uBounds0		= computeNonNormalizedCoordBounds(sampler.normalizedCoords, w0,	coord.x(), prec.coordBits.x(), prec.uvwBits.x());
// 	const Vec2		uBounds1		= computeNonNormalizedCoordBounds(sampler.normalizedCoords, w1,	coord.x(), prec.coordBits.x(), prec.uvwBits.x());
// 	const Vec2		vBounds0		= computeNonNormalizedCoordBounds(sampler.normalizedCoords, h0,	coord.y(), prec.coordBits.y(), prec.uvwBits.y());
// 	const Vec2		vBounds1		= computeNonNormalizedCoordBounds(sampler.normalizedCoords, h1,	coord.y(), prec.coordBits.y(), prec.uvwBits.y());
//
// 	// Integer coordinates - without wrap mode
// 	const int		minI0			= deFloorFloatToInt32(uBounds0.x());
// 	const int		maxI0			= deFloorFloatToInt32(uBounds0.y());
// 	const int		minI1			= deFloorFloatToInt32(uBounds1.x());
// 	const int		maxI1			= deFloorFloatToInt32(uBounds1.y());
// 	const int		minJ0			= deFloorFloatToInt32(vBounds0.x());
// 	const int		maxJ0			= deFloorFloatToInt32(vBounds0.y());
// 	const int		minJ1			= deFloorFloatToInt32(vBounds1.x());
// 	const int		maxJ1			= deFloorFloatToInt32(vBounds1.y());
//
// 	for (int j0 = minJ0; j0 <= maxJ0; j0++)
// 	{
// 		for (int i0 = minI0; i0 <= maxI0; i0++)
// 		{
// 			for (int j1 = minJ1; j1 <= maxJ1; j1++)
// 			{
// 				for (int i1 = minI1; i1 <= maxI1; i1++)
// 				{
// 					const Vec4	c0	= lookup<float>(level0, sampler, wrap(sampler.wrapS, i0, w0), wrap(sampler.wrapT, j0, h0), coordZ);
// 					const Vec4	c1	= lookup<float>(level1, sampler, wrap(sampler.wrapS, i1, w1), wrap(sampler.wrapT, j1, h1), coordZ);
//
// 					if (isLinearRangeValid(prec, c0, c1, fBounds, result))
// 						return true;
// 				}
// 			}
// 		}
// 	}
//
// 	return false;
// }
//
// static bool isNearestMipmapLinearSampleResultValid (const ConstPixelBufferAccess&	level0,
// 													const ConstPixelBufferAccess&	level1,
// 													const Sampler&					sampler,
// 													const LookupPrecision&			prec,
// 													const Vec3&						coord,
// 													const Vec2&						fBounds,
// 													const Vec4&						result)
// {
// 	const int		w0				= level0.getWidth();
// 	const int		w1				= level1.getWidth();
// 	const int		h0				= level0.getHeight();
// 	const int		h1				= level1.getHeight();
// 	const int		d0				= level0.getDepth();
// 	const int		d1				= level1.getDepth();
//
// 	const Vec2		uBounds0		= computeNonNormalizedCoordBounds(sampler.normalizedCoords, w0,	coord.x(), prec.coordBits.x(), prec.uvwBits.x());
// 	const Vec2		uBounds1		= computeNonNormalizedCoordBounds(sampler.normalizedCoords, w1,	coord.x(), prec.coordBits.x(), prec.uvwBits.x());
// 	const Vec2		vBounds0		= computeNonNormalizedCoordBounds(sampler.normalizedCoords, h0,	coord.y(), prec.coordBits.y(), prec.uvwBits.y());
// 	const Vec2		vBounds1		= computeNonNormalizedCoordBounds(sampler.normalizedCoords, h1,	coord.y(), prec.coordBits.y(), prec.uvwBits.y());
// 	const Vec2		wBounds0		= computeNonNormalizedCoordBounds(sampler.normalizedCoords, d0,	coord.z(), prec.coordBits.z(), prec.uvwBits.z());
// 	const Vec2		wBounds1		= computeNonNormalizedCoordBounds(sampler.normalizedCoords, d1,	coord.z(), prec.coordBits.z(), prec.uvwBits.z());
//
// 	// Integer coordinates - without wrap mode
// 	const int		minI0			= deFloorFloatToInt32(uBounds0.x());
// 	const int		maxI0			= deFloorFloatToInt32(uBounds0.y());
// 	const int		minI1			= deFloorFloatToInt32(uBounds1.x());
// 	const int		maxI1			= deFloorFloatToInt32(uBounds1.y());
// 	const int		minJ0			= deFloorFloatToInt32(vBounds0.x());
// 	const int		maxJ0			= deFloorFloatToInt32(vBounds0.y());
// 	const int		minJ1			= deFloorFloatToInt32(vBounds1.x());
// 	const int		maxJ1			= deFloorFloatToInt32(vBounds1.y());
// 	const int		minK0			= deFloorFloatToInt32(wBounds0.x());
// 	const int		maxK0			= deFloorFloatToInt32(wBounds0.y());
// 	const int		minK1			= deFloorFloatToInt32(wBounds1.x());
// 	const int		maxK1			= deFloorFloatToInt32(wBounds1.y());
//
// 	for (int k0 = minK0; k0 <= maxK0; k0++)
// 	{
// 		for (int j0 = minJ0; j0 <= maxJ0; j0++)
// 		{
// 			for (int i0 = minI0; i0 <= maxI0; i0++)
// 			{
// 				for (int k1 = minK1; k1 <= maxK1; k1++)
// 				{
// 					for (int j1 = minJ1; j1 <= maxJ1; j1++)
// 					{
// 						for (int i1 = minI1; i1 <= maxI1; i1++)
// 						{
// 							const Vec4	c0	= lookup<float>(level0, sampler, wrap(sampler.wrapS, i0, w0), wrap(sampler.wrapT, j0, h0), wrap(sampler.wrapR, k0, d0));
// 							const Vec4	c1	= lookup<float>(level1, sampler, wrap(sampler.wrapS, i1, w1), wrap(sampler.wrapT, j1, h1), wrap(sampler.wrapR, k1, d1));
//
// 							if (isLinearRangeValid(prec, c0, c1, fBounds, result))
// 								return true;
// 						}
// 					}
// 				}
// 			}
// 		}
// 	}
//
// 	return false;
// }
//
// static bool isLinearMipmapLinearSampleResultValid (const ConstPixelBufferAccess&	level0,
// 												   const ConstPixelBufferAccess&	level1,
// 												   const Sampler&					sampler,
// 												   const LookupPrecision&			prec,
// 												   const float						coordX,
// 												   const int						coordY,
// 												   const Vec2&						fBounds,
// 												   const Vec4&						result)
// {
// 	// \todo [2013-07-04 pyry] This is strictly not correct as coordinates between levels should be dependent.
// 	//						   Right now this allows pairing any two valid bilinear quads.
//
// 	const int					w0				= level0.getWidth();
// 	const int					w1				= level1.getWidth();
//
// 	const Vec2					uBounds0		= computeNonNormalizedCoordBounds(sampler.normalizedCoords, w0,	coordX, prec.coordBits.x(), prec.uvwBits.x());
// 	const Vec2					uBounds1		= computeNonNormalizedCoordBounds(sampler.normalizedCoords, w1,	coordX, prec.coordBits.x(), prec.uvwBits.x());
//
// 	// Integer coordinates - without wrap mode
// 	const int					minI0			= deFloorFloatToInt32(uBounds0.x()-0.5f);
// 	const int					maxI0			= deFloorFloatToInt32(uBounds0.y()-0.5f);
// 	const int					minI1			= deFloorFloatToInt32(uBounds1.x()-0.5f);
// 	const int					maxI1			= deFloorFloatToInt32(uBounds1.y()-0.5f);
//
// 	const TextureChannelClass	texClass		= getTextureChannelClass(level0.getFormat().type);
// 	const float					cSearchStep		= texClass == TEXTURECHANNELCLASS_UNSIGNED_FIXED_POINT	? computeBilinearSearchStepForUnorm(prec) :
// 												  texClass == TEXTURECHANNELCLASS_SIGNED_FIXED_POINT	? computeBilinearSearchStepForSnorm(prec) :
// 												  0.0f; // Step is computed for floating-point quads based on texel values.
//
// 	for (int i0 = minI0; i0 <= maxI0; i0++)
// 	{
// 		ColorLine	line0;
// 		float		searchStep0;
//
// 		{
// 			const int	x0		= wrap(sampler.wrapS, i0  , w0);
// 			const int	x1		= wrap(sampler.wrapS, i0+1, w0);
// 			lookupLine(line0, level0, sampler, x0, x1, coordY);
//
// 			if (texClass == TEXTURECHANNELCLASS_FLOATING_POINT)
// 				searchStep0 = computeBilinearSearchStepFromFloatLine(prec, line0);
// 			else
// 				searchStep0 = cSearchStep;
// 		}
//
// 		const float	minA0	= de::clamp((uBounds0.x()-0.5f)-float(i0), 0.0f, 1.0f);
// 		const float	maxA0	= de::clamp((uBounds0.y()-0.5f)-float(i0), 0.0f, 1.0f);
//
// 		for (int i1 = minI1; i1 <= maxI1; i1++)
// 		{
// 			ColorLine	line1;
// 			float		searchStep1;
//
// 			{
// 				const int	x0		= wrap(sampler.wrapS, i1  , w1);
// 				const int	x1		= wrap(sampler.wrapS, i1+1, w1);
// 				lookupLine(line1, level1, sampler, x0, x1, coordY);
//
// 				if (texClass == TEXTURECHANNELCLASS_FLOATING_POINT)
// 					searchStep1 = computeBilinearSearchStepFromFloatLine(prec, line1);
// 				else
// 					searchStep1 = cSearchStep;
// 			}
//
// 			const float	minA1	= de::clamp((uBounds1.x()-0.5f)-float(i1), 0.0f, 1.0f);
// 			const float	maxA1	= de::clamp((uBounds1.y()-0.5f)-float(i1), 0.0f, 1.0f);
//
// 			if (is1DTrilinearFilterResultValid(prec, line0, line1, Vec2(minA0, maxA0), Vec2(minA1, maxA1), fBounds, de::min(searchStep0, searchStep1), result))
// 				return true;
// 		}
// 	}
//
// 	return false;
// }
//
// static bool isLinearMipmapLinearSampleResultValid (const ConstPixelBufferAccess&	level0,
// 												   const ConstPixelBufferAccess&	level1,
// 												   const Sampler&					sampler,
// 												   const LookupPrecision&			prec,
// 												   const Vec2&						coord,
// 												   const int						coordZ,
// 												   const Vec2&						fBounds,
// 												   const Vec4&						result)
// {
// 	// \todo [2013-07-04 pyry] This is strictly not correct as coordinates between levels should be dependent.
// 	//						   Right now this allows pairing any two valid bilinear quads.
//
// 	const int					w0				= level0.getWidth();
// 	const int					w1				= level1.getWidth();
// 	const int					h0				= level0.getHeight();
// 	const int					h1				= level1.getHeight();
//
// 	const Vec2					uBounds0		= computeNonNormalizedCoordBounds(sampler.normalizedCoords, w0,	coord.x(), prec.coordBits.x(), prec.uvwBits.x());
// 	const Vec2					uBounds1		= computeNonNormalizedCoordBounds(sampler.normalizedCoords, w1,	coord.x(), prec.coordBits.x(), prec.uvwBits.x());
// 	const Vec2					vBounds0		= computeNonNormalizedCoordBounds(sampler.normalizedCoords, h0,	coord.y(), prec.coordBits.y(), prec.uvwBits.y());
// 	const Vec2					vBounds1		= computeNonNormalizedCoordBounds(sampler.normalizedCoords, h1,	coord.y(), prec.coordBits.y(), prec.uvwBits.y());
//
// 	// Integer coordinates - without wrap mode
// 	const int					minI0			= deFloorFloatToInt32(uBounds0.x()-0.5f);
// 	const int					maxI0			= deFloorFloatToInt32(uBounds0.y()-0.5f);
// 	const int					minI1			= deFloorFloatToInt32(uBounds1.x()-0.5f);
// 	const int					maxI1			= deFloorFloatToInt32(uBounds1.y()-0.5f);
// 	const int					minJ0			= deFloorFloatToInt32(vBounds0.x()-0.5f);
// 	const int					maxJ0			= deFloorFloatToInt32(vBounds0.y()-0.5f);
// 	const int					minJ1			= deFloorFloatToInt32(vBounds1.x()-0.5f);
// 	const int					maxJ1			= deFloorFloatToInt32(vBounds1.y()-0.5f);
//
// 	const TextureChannelClass	texClass		= getTextureChannelClass(level0.getFormat().type);
// 	const float					cSearchStep		= texClass == TEXTURECHANNELCLASS_UNSIGNED_FIXED_POINT	? computeBilinearSearchStepForUnorm(prec) :
// 												  texClass == TEXTURECHANNELCLASS_SIGNED_FIXED_POINT	? computeBilinearSearchStepForSnorm(prec) :
// 												  0.0f; // Step is computed for floating-point quads based on texel values.
//
// 	for (int j0 = minJ0; j0 <= maxJ0; j0++)
// 	{
// 		for (int i0 = minI0; i0 <= maxI0; i0++)
// 		{
// 			ColorQuad	quad0;
// 			float		searchStep0;
//
// 			{
// 				const int	x0		= wrap(sampler.wrapS, i0  , w0);
// 				const int	x1		= wrap(sampler.wrapS, i0+1, w0);
// 				const int	y0		= wrap(sampler.wrapT, j0  , h0);
// 				const int	y1		= wrap(sampler.wrapT, j0+1, h0);
// 				lookupQuad(quad0, level0, sampler, x0, x1, y0, y1, coordZ);
//
// 				if (texClass == TEXTURECHANNELCLASS_FLOATING_POINT)
// 					searchStep0 = computeBilinearSearchStepFromFloatQuad(prec, quad0);
// 				else
// 					searchStep0 = cSearchStep;
// 			}
//
// 			const float	minA0	= de::clamp((uBounds0.x()-0.5f)-float(i0), 0.0f, 1.0f);
// 			const float	maxA0	= de::clamp((uBounds0.y()-0.5f)-float(i0), 0.0f, 1.0f);
// 			const float	minB0	= de::clamp((vBounds0.x()-0.5f)-float(j0), 0.0f, 1.0f);
// 			const float	maxB0	= de::clamp((vBounds0.y()-0.5f)-float(j0), 0.0f, 1.0f);
//
// 			for (int j1 = minJ1; j1 <= maxJ1; j1++)
// 			{
// 				for (int i1 = minI1; i1 <= maxI1; i1++)
// 				{
// 					ColorQuad	quad1;
// 					float		searchStep1;
//
// 					{
// 						const int	x0		= wrap(sampler.wrapS, i1  , w1);
// 						const int	x1		= wrap(sampler.wrapS, i1+1, w1);
// 						const int	y0		= wrap(sampler.wrapT, j1  , h1);
// 						const int	y1		= wrap(sampler.wrapT, j1+1, h1);
// 						lookupQuad(quad1, level1, sampler, x0, x1, y0, y1, coordZ);
//
// 						if (texClass == TEXTURECHANNELCLASS_FLOATING_POINT)
// 							searchStep1 = computeBilinearSearchStepFromFloatQuad(prec, quad1);
// 						else
// 							searchStep1 = cSearchStep;
// 					}
//
// 					const float	minA1	= de::clamp((uBounds1.x()-0.5f)-float(i1), 0.0f, 1.0f);
// 					const float	maxA1	= de::clamp((uBounds1.y()-0.5f)-float(i1), 0.0f, 1.0f);
// 					const float	minB1	= de::clamp((vBounds1.x()-0.5f)-float(j1), 0.0f, 1.0f);
// 					const float	maxB1	= de::clamp((vBounds1.y()-0.5f)-float(j1), 0.0f, 1.0f);
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
// static bool isLinearMipmapLinearSampleResultValid (const ConstPixelBufferAccess&	level0,
// 												   const ConstPixelBufferAccess&	level1,
// 												   const Sampler&					sampler,
// 												   const LookupPrecision&			prec,
// 												   const Vec3&						coord,
// 												   const Vec2&						fBounds,
// 												   const Vec4&						result)
// {
// 	// \todo [2013-07-04 pyry] This is strictly not correct as coordinates between levels should be dependent.
// 	//						   Right now this allows pairing any two valid bilinear quads.
//
// 	const int					w0				= level0.getWidth();
// 	const int					w1				= level1.getWidth();
// 	const int					h0				= level0.getHeight();
// 	const int					h1				= level1.getHeight();
// 	const int					d0				= level0.getDepth();
// 	const int					d1				= level1.getDepth();
//
// 	const Vec2					uBounds0		= computeNonNormalizedCoordBounds(sampler.normalizedCoords, w0,	coord.x(), prec.coordBits.x(), prec.uvwBits.x());
// 	const Vec2					uBounds1		= computeNonNormalizedCoordBounds(sampler.normalizedCoords, w1,	coord.x(), prec.coordBits.x(), prec.uvwBits.x());
// 	const Vec2					vBounds0		= computeNonNormalizedCoordBounds(sampler.normalizedCoords, h0,	coord.y(), prec.coordBits.y(), prec.uvwBits.y());
// 	const Vec2					vBounds1		= computeNonNormalizedCoordBounds(sampler.normalizedCoords, h1,	coord.y(), prec.coordBits.y(), prec.uvwBits.y());
// 	const Vec2					wBounds0		= computeNonNormalizedCoordBounds(sampler.normalizedCoords, d0,	coord.z(), prec.coordBits.z(), prec.uvwBits.z());
// 	const Vec2					wBounds1		= computeNonNormalizedCoordBounds(sampler.normalizedCoords, d1,	coord.z(), prec.coordBits.z(), prec.uvwBits.z());
//
// 	// Integer coordinates - without wrap mode
// 	const int					minI0			= deFloorFloatToInt32(uBounds0.x()-0.5f);
// 	const int					maxI0			= deFloorFloatToInt32(uBounds0.y()-0.5f);
// 	const int					minI1			= deFloorFloatToInt32(uBounds1.x()-0.5f);
// 	const int					maxI1			= deFloorFloatToInt32(uBounds1.y()-0.5f);
// 	const int					minJ0			= deFloorFloatToInt32(vBounds0.x()-0.5f);
// 	const int					maxJ0			= deFloorFloatToInt32(vBounds0.y()-0.5f);
// 	const int					minJ1			= deFloorFloatToInt32(vBounds1.x()-0.5f);
// 	const int					maxJ1			= deFloorFloatToInt32(vBounds1.y()-0.5f);
// 	const int					minK0			= deFloorFloatToInt32(wBounds0.x()-0.5f);
// 	const int					maxK0			= deFloorFloatToInt32(wBounds0.y()-0.5f);
// 	const int					minK1			= deFloorFloatToInt32(wBounds1.x()-0.5f);
// 	const int					maxK1			= deFloorFloatToInt32(wBounds1.y()-0.5f);
//
// 	const TextureChannelClass	texClass		= getTextureChannelClass(level0.getFormat().type);
// 	const float					cSearchStep		= texClass == TEXTURECHANNELCLASS_UNSIGNED_FIXED_POINT	? computeBilinearSearchStepForUnorm(prec) :
// 												  texClass == TEXTURECHANNELCLASS_SIGNED_FIXED_POINT	? computeBilinearSearchStepForSnorm(prec) :
// 												  0.0f; // Step is computed for floating-point quads based on texel values.
//
// 	for (int k0 = minK0; k0 <= maxK0; k0++)
// 	{
// 		for (int j0 = minJ0; j0 <= maxJ0; j0++)
// 		{
// 			for (int i0 = minI0; i0 <= maxI0; i0++)
// 			{
// 				ColorQuad	quad00, quad01;
// 				float		searchStep0;
//
// 				{
// 					const int	x0		= wrap(sampler.wrapS, i0  , w0);
// 					const int	x1		= wrap(sampler.wrapS, i0+1, w0);
// 					const int	y0		= wrap(sampler.wrapT, j0  , h0);
// 					const int	y1		= wrap(sampler.wrapT, j0+1, h0);
// 					const int	z0		= wrap(sampler.wrapR, k0  , d0);
// 					const int	z1		= wrap(sampler.wrapR, k0+1, d0);
// 					lookupQuad(quad00, level0, sampler, x0, x1, y0, y1, z0);
// 					lookupQuad(quad01, level0, sampler, x0, x1, y0, y1, z1);
//
// 					if (texClass == TEXTURECHANNELCLASS_FLOATING_POINT)
// 						searchStep0 = de::min(computeBilinearSearchStepFromFloatQuad(prec, quad00), computeBilinearSearchStepFromFloatQuad(prec, quad01));
// 					else
// 						searchStep0 = cSearchStep;
// 				}
//
// 				const float	minA0	= de::clamp((uBounds0.x()-0.5f)-float(i0), 0.0f, 1.0f);
// 				const float	maxA0	= de::clamp((uBounds0.y()-0.5f)-float(i0), 0.0f, 1.0f);
// 				const float	minB0	= de::clamp((vBounds0.x()-0.5f)-float(j0), 0.0f, 1.0f);
// 				const float	maxB0	= de::clamp((vBounds0.y()-0.5f)-float(j0), 0.0f, 1.0f);
// 				const float	minC0	= de::clamp((wBounds0.x()-0.5f)-float(k0), 0.0f, 1.0f);
// 				const float	maxC0	= de::clamp((wBounds0.y()-0.5f)-float(k0), 0.0f, 1.0f);
//
// 				for (int k1 = minK1; k1 <= maxK1; k1++)
// 				{
// 					for (int j1 = minJ1; j1 <= maxJ1; j1++)
// 					{
// 						for (int i1 = minI1; i1 <= maxI1; i1++)
// 						{
// 							ColorQuad	quad10, quad11;
// 							float		searchStep1;
//
// 							{
// 								const int	x0		= wrap(sampler.wrapS, i1  , w1);
// 								const int	x1		= wrap(sampler.wrapS, i1+1, w1);
// 								const int	y0		= wrap(sampler.wrapT, j1  , h1);
// 								const int	y1		= wrap(sampler.wrapT, j1+1, h1);
// 								const int	z0		= wrap(sampler.wrapR, k1  , d1);
// 								const int	z1		= wrap(sampler.wrapR, k1+1, d1);
// 								lookupQuad(quad10, level1, sampler, x0, x1, y0, y1, z0);
// 								lookupQuad(quad11, level1, sampler, x0, x1, y0, y1, z1);
//
// 								if (texClass == TEXTURECHANNELCLASS_FLOATING_POINT)
// 									searchStep1 = de::min(computeBilinearSearchStepFromFloatQuad(prec, quad10), computeBilinearSearchStepFromFloatQuad(prec, quad11));
// 								else
// 									searchStep1 = cSearchStep;
// 							}
//
// 							const float	minA1	= de::clamp((uBounds1.x()-0.5f)-float(i1), 0.0f, 1.0f);
// 							const float	maxA1	= de::clamp((uBounds1.y()-0.5f)-float(i1), 0.0f, 1.0f);
// 							const float	minB1	= de::clamp((vBounds1.x()-0.5f)-float(j1), 0.0f, 1.0f);
// 							const float	maxB1	= de::clamp((vBounds1.y()-0.5f)-float(j1), 0.0f, 1.0f);
// 							const float	minC1	= de::clamp((wBounds1.x()-0.5f)-float(k1), 0.0f, 1.0f);
// 							const float	maxC1	= de::clamp((wBounds1.y()-0.5f)-float(k1), 0.0f, 1.0f);
//
// 							if (is3DTrilinearFilterResultValid(prec, quad00, quad01, quad10, quad11,
// 															   Vec2(minA0, maxA0), Vec2(minB0, maxB0), Vec2(minC0, maxC0),
// 															   Vec2(minA1, maxA1), Vec2(minB1, maxB1), Vec2(minC1, maxC1),
// 															   fBounds, de::min(searchStep0, searchStep1), result))
// 								return true;
// 						}
// 					}
// 				}
// 			}
// 		}
// 	}
//
// 	return false;
// }
//
// static bool isLevelSampleResultValid (const ConstPixelBufferAccess&		level,
// 									  const Sampler&					sampler,
// 									  const Sampler::FilterMode			filterMode,
// 									  const LookupPrecision&			prec,
// 									  const float						coordX,
// 									  const int							coordY,
// 									  const Vec4&						result)
// {
// 	if (filterMode == Sampler::LINEAR)
// 		return isLinearSampleResultValid(level, sampler, prec, coordX, coordY, result);
// 	else
// 		return isNearestSampleResultValid(level, sampler, prec, coordX, coordY, result);
// }
//
// static bool isLevelSampleResultValid (const ConstPixelBufferAccess&		level,
// 									  const Sampler&					sampler,
// 									  const Sampler::FilterMode			filterMode,
// 									  const LookupPrecision&			prec,
// 									  const Vec2&						coord,
// 									  const int							coordZ,
// 									  const Vec4&						result)
// {
// 	if (filterMode == Sampler::LINEAR)
// 		return isLinearSampleResultValid(level, sampler, prec, coord, coordZ, result);
// 	else
// 		return isNearestSampleResultValid(level, sampler, prec, coord, coordZ, result);
// }
//
// static bool isMipmapLinearSampleResultValid (const ConstPixelBufferAccess&		level0,
// 										     const ConstPixelBufferAccess&		level1,
// 											 const Sampler&						sampler,
// 										     const Sampler::FilterMode			levelFilter,
// 										     const LookupPrecision&				prec,
// 										     const float						coordX,
// 											 const int							coordY,
// 										     const Vec2&						fBounds,
// 										     const Vec4&						result)
// {
// 	if (levelFilter == Sampler::LINEAR)
// 		return isLinearMipmapLinearSampleResultValid(level0, level1, sampler, prec, coordX, coordY, fBounds, result);
// 	else
// 		return isNearestMipmapLinearSampleResultValid(level0, level1, sampler, prec, coordX, coordY, fBounds, result);
// }
//
// static bool isMipmapLinearSampleResultValid (const ConstPixelBufferAccess&		level0,
// 										     const ConstPixelBufferAccess&		level1,
// 											 const Sampler&						sampler,
// 										     const Sampler::FilterMode			levelFilter,
// 										     const LookupPrecision&				prec,
// 										     const Vec2&						coord,
// 											 const int							coordZ,
// 										     const Vec2&						fBounds,
// 										     const Vec4&						result)
// {
// 	if (levelFilter == Sampler::LINEAR)
// 		return isLinearMipmapLinearSampleResultValid(level0, level1, sampler, prec, coord, coordZ, fBounds, result);
// 	else
// 		return isNearestMipmapLinearSampleResultValid(level0, level1, sampler, prec, coord, coordZ, fBounds, result);
// }
//
// bool isLookupResultValid (const Texture2DView& texture, const Sampler& sampler, const LookupPrecision& prec, const Vec2& coord, const Vec2& lodBounds, const Vec4& result)
// {
// 	const float		minLod			= lodBounds.x();
// 	const float		maxLod			= lodBounds.y();
// 	const bool		canBeMagnified	= minLod <= sampler.lodThreshold;
// 	const bool		canBeMinified	= maxLod > sampler.lodThreshold;
//
// 	DE_ASSERT(isSamplerSupported(sampler));
//
// 	if (canBeMagnified)
// 	{
// 		if (isLevelSampleResultValid(texture.getLevel(0), sampler, sampler.magFilter, prec, coord, 0, result))
// 			return true;
// 	}
//
// 	if (canBeMinified)
// 	{
// 		const bool	isNearestMipmap	= isNearestMipmapFilter(sampler.minFilter);
// 		const bool	isLinearMipmap	= isLinearMipmapFilter(sampler.minFilter);
// 		const int	minTexLevel		= 0;
// 		const int	maxTexLevel		= texture.getNumLevels()-1;
//
// 		DE_ASSERT(minTexLevel <= maxTexLevel);
//
// 		if (isLinearMipmap && minTexLevel < maxTexLevel)
// 		{
// 			const int		minLevel		= de::clamp((int)deFloatFloor(minLod), minTexLevel, maxTexLevel-1);
// 			const int		maxLevel		= de::clamp((int)deFloatFloor(maxLod), minTexLevel, maxTexLevel-1);
//
// 			DE_ASSERT(minLevel <= maxLevel);
//
// 			for (int level = minLevel; level <= maxLevel; level++)
// 			{
// 				const float		minF	= de::clamp(minLod - float(level), 0.0f, 1.0f);
// 				const float		maxF	= de::clamp(maxLod - float(level), 0.0f, 1.0f);
//
// 				if (isMipmapLinearSampleResultValid(texture.getLevel(level), texture.getLevel(level+1), sampler, getLevelFilter(sampler.minFilter), prec, coord, 0, Vec2(minF, maxF), result))
// 					return true;
// 			}
// 		}
// 		else if (isNearestMipmap)
// 		{
// 			// \note The accurate formula for nearest mipmapping is level = ceil(lod + 0.5) - 1 but Khronos has made
// 			//		 decision to allow floor(lod + 0.5) as well.
// 			const int		minLevel		= de::clamp((int)deFloatCeil(minLod + 0.5f) - 1,	minTexLevel, maxTexLevel);
// 			const int		maxLevel		= de::clamp((int)deFloatFloor(maxLod + 0.5f),		minTexLevel, maxTexLevel);
//
// 			DE_ASSERT(minLevel <= maxLevel);
//
// 			for (int level = minLevel; level <= maxLevel; level++)
// 			{
// 				if (isLevelSampleResultValid(texture.getLevel(level), sampler, getLevelFilter(sampler.minFilter), prec, coord, 0, result))
// 					return true;
// 			}
// 		}
// 		else
// 		{
// 			if (isLevelSampleResultValid(texture.getLevel(0), sampler, sampler.minFilter, prec, coord, 0, result))
// 				return true;
// 		}
// 	}
//
// 	return false;
// }
//
// bool isLookupResultValid (const Texture1DView& texture, const Sampler& sampler, const LookupPrecision& prec, const float coord, const Vec2& lodBounds, const Vec4& result)
// {
// 	const float		minLod			= lodBounds.x();
// 	const float		maxLod			= lodBounds.y();
// 	const bool		canBeMagnified	= minLod <= sampler.lodThreshold;
// 	const bool		canBeMinified	= maxLod > sampler.lodThreshold;
//
// 	DE_ASSERT(isSamplerSupported(sampler));
//
// 	if (canBeMagnified)
// 	{
// 		if (isLevelSampleResultValid(texture.getLevel(0), sampler, sampler.magFilter, prec, coord, 0, result))
// 			return true;
// 	}
//
// 	if (canBeMinified)
// 	{
// 		const bool	isNearestMipmap	= isNearestMipmapFilter(sampler.minFilter);
// 		const bool	isLinearMipmap	= isLinearMipmapFilter(sampler.minFilter);
// 		const int	minTexLevel		= 0;
// 		const int	maxTexLevel		= texture.getNumLevels()-1;
//
// 		DE_ASSERT(minTexLevel <= maxTexLevel);
//
// 		if (isLinearMipmap && minTexLevel < maxTexLevel)
// 		{
// 			const int		minLevel		= de::clamp((int)deFloatFloor(minLod), minTexLevel, maxTexLevel-1);
// 			const int		maxLevel		= de::clamp((int)deFloatFloor(maxLod), minTexLevel, maxTexLevel-1);
//
// 			DE_ASSERT(minLevel <= maxLevel);
//
// 			for (int level = minLevel; level <= maxLevel; level++)
// 			{
// 				const float		minF	= de::clamp(minLod - float(level), 0.0f, 1.0f);
// 				const float		maxF	= de::clamp(maxLod - float(level), 0.0f, 1.0f);
//
// 				if (isMipmapLinearSampleResultValid(texture.getLevel(level), texture.getLevel(level+1), sampler, getLevelFilter(sampler.minFilter), prec, coord, 0, Vec2(minF, maxF), result))
// 					return true;
// 			}
// 		}
// 		else if (isNearestMipmap)
// 		{
// 			// \note The accurate formula for nearest mipmapping is level = ceil(lod + 0.5) - 1 but Khronos has made
// 			//		 decision to allow floor(lod + 0.5) as well.
// 			const int		minLevel		= de::clamp((int)deFloatCeil(minLod + 0.5f) - 1,	minTexLevel, maxTexLevel);
// 			const int		maxLevel		= de::clamp((int)deFloatFloor(maxLod + 0.5f),		minTexLevel, maxTexLevel);
//
// 			DE_ASSERT(minLevel <= maxLevel);
//
// 			for (int level = minLevel; level <= maxLevel; level++)
// 			{
// 				if (isLevelSampleResultValid(texture.getLevel(level), sampler, getLevelFilter(sampler.minFilter), prec, coord, 0, result))
// 					return true;
// 			}
// 		}
// 		else
// 		{
// 			if (isLevelSampleResultValid(texture.getLevel(0), sampler, sampler.minFilter, prec, coord, 0, result))
// 				return true;
// 		}
// 	}
//
// 	return false;
// }
//
// static bool isSeamlessLinearSampleResultValid (const ConstPixelBufferAccess (&faces)[CUBEFACE_LAST],
// 											   const Sampler&				sampler,
// 											   const LookupPrecision&		prec,
// 											   const CubeFaceFloatCoords&	coords,
// 											   const Vec4&					result)
// {
// 	const int					size			= faces[coords.face].getWidth();
//
// 	const Vec2					uBounds			= computeNonNormalizedCoordBounds(sampler.normalizedCoords, size, coords.s, prec.coordBits.x(), prec.uvwBits.x());
// 	const Vec2					vBounds			= computeNonNormalizedCoordBounds(sampler.normalizedCoords, size, coords.t, prec.coordBits.y(), prec.uvwBits.y());
//
// 	// Integer coordinate bounds for (x0,y0) - without wrap mode
// 	const int					minI			= deFloorFloatToInt32(uBounds.x()-0.5f);
// 	const int					maxI			= deFloorFloatToInt32(uBounds.y()-0.5f);
// 	const int					minJ			= deFloorFloatToInt32(vBounds.x()-0.5f);
// 	const int					maxJ			= deFloorFloatToInt32(vBounds.y()-0.5f);
//
// 	const TextureChannelClass	texClass		= getTextureChannelClass(faces[coords.face].getFormat().type);
// 	float						searchStep		= texClass == TEXTURECHANNELCLASS_UNSIGNED_FIXED_POINT	? computeBilinearSearchStepForUnorm(prec) :
// 												  texClass == TEXTURECHANNELCLASS_SIGNED_FIXED_POINT	? computeBilinearSearchStepForSnorm(prec) :
// 												  0.0f; // Step is computed for floating-point quads based on texel values.
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
// 			const float	minA	= de::clamp((uBounds.x()-0.5f)-float(i), 0.0f, 1.0f);
// 			const float	maxA	= de::clamp((uBounds.y()-0.5f)-float(i), 0.0f, 1.0f);
// 			const float	minB	= de::clamp((vBounds.x()-0.5f)-float(j), 0.0f, 1.0f);
// 			const float	maxB	= de::clamp((vBounds.y()-0.5f)-float(j), 0.0f, 1.0f);
//
// 			ColorQuad quad;
// 			quad.p00 = lookup<float>(faces[c00.face], sampler, c00.s, c00.t, 0);
// 			quad.p10 = lookup<float>(faces[c10.face], sampler, c10.s, c10.t, 0);
// 			quad.p01 = lookup<float>(faces[c01.face], sampler, c01.s, c01.t, 0);
// 			quad.p11 = lookup<float>(faces[c11.face], sampler, c11.s, c11.t, 0);
//
// 			if (texClass == TEXTURECHANNELCLASS_FLOATING_POINT)
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
// 															const Vec2&						fBounds,
// 															const Vec4&						result)
// {
// 	// \todo [2013-07-04 pyry] This is strictly not correct as coordinates between levels should be dependent.
// 	//						   Right now this allows pairing any two valid bilinear quads.
//
// 	const int					size0			= faces0[coords.face].getWidth();
// 	const int					size1			= faces1[coords.face].getWidth();
//
// 	const Vec2					uBounds0		= computeNonNormalizedCoordBounds(sampler.normalizedCoords, size0,	coords.s, prec.coordBits.x(), prec.uvwBits.x());
// 	const Vec2					uBounds1		= computeNonNormalizedCoordBounds(sampler.normalizedCoords, size1,	coords.s, prec.coordBits.x(), prec.uvwBits.x());
// 	const Vec2					vBounds0		= computeNonNormalizedCoordBounds(sampler.normalizedCoords, size0,	coords.t, prec.coordBits.y(), prec.uvwBits.y());
// 	const Vec2					vBounds1		= computeNonNormalizedCoordBounds(sampler.normalizedCoords, size1,	coords.t, prec.coordBits.y(), prec.uvwBits.y());
//
// 	// Integer coordinates - without wrap mode
// 	const int					minI0			= deFloorFloatToInt32(uBounds0.x()-0.5f);
// 	const int					maxI0			= deFloorFloatToInt32(uBounds0.y()-0.5f);
// 	const int					minI1			= deFloorFloatToInt32(uBounds1.x()-0.5f);
// 	const int					maxI1			= deFloorFloatToInt32(uBounds1.y()-0.5f);
// 	const int					minJ0			= deFloorFloatToInt32(vBounds0.x()-0.5f);
// 	const int					maxJ0			= deFloorFloatToInt32(vBounds0.y()-0.5f);
// 	const int					minJ1			= deFloorFloatToInt32(vBounds1.x()-0.5f);
// 	const int					maxJ1			= deFloorFloatToInt32(vBounds1.y()-0.5f);
//
// 	const TextureChannelClass	texClass		= getTextureChannelClass(faces0[coords.face].getFormat().type);
// 	const float					cSearchStep		= texClass == TEXTURECHANNELCLASS_UNSIGNED_FIXED_POINT	? computeBilinearSearchStepForUnorm(prec) :
// 												  texClass == TEXTURECHANNELCLASS_SIGNED_FIXED_POINT	? computeBilinearSearchStepForSnorm(prec) :
// 												  0.0f; // Step is computed for floating-point quads based on texel values.
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
// 				quad0.p00 = lookup<float>(faces0[c00.face], sampler, c00.s, c00.t, 0);
// 				quad0.p10 = lookup<float>(faces0[c10.face], sampler, c10.s, c10.t, 0);
// 				quad0.p01 = lookup<float>(faces0[c01.face], sampler, c01.s, c01.t, 0);
// 				quad0.p11 = lookup<float>(faces0[c11.face], sampler, c11.s, c11.t, 0);
//
// 				if (texClass == TEXTURECHANNELCLASS_FLOATING_POINT)
// 					searchStep0 = computeBilinearSearchStepFromFloatQuad(prec, quad0);
// 				else
// 					searchStep0 = cSearchStep;
// 			}
//
// 			const float	minA0	= de::clamp((uBounds0.x()-0.5f)-float(i0), 0.0f, 1.0f);
// 			const float	maxA0	= de::clamp((uBounds0.y()-0.5f)-float(i0), 0.0f, 1.0f);
// 			const float	minB0	= de::clamp((vBounds0.x()-0.5f)-float(j0), 0.0f, 1.0f);
// 			const float	maxB0	= de::clamp((vBounds0.y()-0.5f)-float(j0), 0.0f, 1.0f);
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
// 						quad1.p00 = lookup<float>(faces1[c00.face], sampler, c00.s, c00.t, 0);
// 						quad1.p10 = lookup<float>(faces1[c10.face], sampler, c10.s, c10.t, 0);
// 						quad1.p01 = lookup<float>(faces1[c01.face], sampler, c01.s, c01.t, 0);
// 						quad1.p11 = lookup<float>(faces1[c11.face], sampler, c11.s, c11.t, 0);
//
// 						if (texClass == TEXTURECHANNELCLASS_FLOATING_POINT)
// 							searchStep1 = computeBilinearSearchStepFromFloatQuad(prec, quad1);
// 						else
// 							searchStep1 = cSearchStep;
// 					}
//
// 					const float	minA1	= de::clamp((uBounds1.x()-0.5f)-float(i1), 0.0f, 1.0f);
// 					const float	maxA1	= de::clamp((uBounds1.y()-0.5f)-float(i1), 0.0f, 1.0f);
// 					const float	minB1	= de::clamp((vBounds1.x()-0.5f)-float(j1), 0.0f, 1.0f);
// 					const float	maxB1	= de::clamp((vBounds1.y()-0.5f)-float(j1), 0.0f, 1.0f);
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
// 	if (filterMode == Sampler::LINEAR)
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
// 												 const Vec2&					fBounds,
// 												 const Vec4&					result)
// {
// 	if (levelFilter == Sampler::LINEAR)
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
// static void getCubeLevelFaces (const TextureCubeView& texture, const int levelNdx, ConstPixelBufferAccess (&out)[CUBEFACE_LAST])
// {
// 	for (int faceNdx = 0; faceNdx < CUBEFACE_LAST; faceNdx++)
// 		out[faceNdx] = texture.getLevelFace(levelNdx, (CubeFace)faceNdx);
// }
//
// bool isLookupResultValid (const TextureCubeView& texture, const Sampler& sampler, const LookupPrecision& prec, const Vec3& coord, const Vec2& lodBounds, const Vec4& result)
// {
// 	int			numPossibleFaces				= 0;
// 	CubeFace	possibleFaces[CUBEFACE_LAST];
//
// 	DE_ASSERT(isSamplerSupported(sampler));
//
// 	getPossibleCubeFaces(coord, prec.coordBits, &possibleFaces[0], numPossibleFaces);
//
// 	if (numPossibleFaces == 0)
// 		return true; // Result is undefined.
//
// 	for (int tryFaceNdx = 0; tryFaceNdx < numPossibleFaces; tryFaceNdx++)
// 	{
// 		const CubeFaceFloatCoords	faceCoords		(possibleFaces[tryFaceNdx], projectToFace(possibleFaces[tryFaceNdx], coord));
// 		const float					minLod			= lodBounds.x();
// 		const float					maxLod			= lodBounds.y();
// 		const bool					canBeMagnified	= minLod <= sampler.lodThreshold;
// 		const bool					canBeMinified	= maxLod > sampler.lodThreshold;
//
// 		if (canBeMagnified)
// 		{
// 			ConstPixelBufferAccess faces[CUBEFACE_LAST];
// 			getCubeLevelFaces(texture, 0, faces);
//
// 			if (isCubeLevelSampleResultValid(faces, sampler, sampler.magFilter, prec, faceCoords, result))
// 				return true;
// 		}
//
// 		if (canBeMinified)
// 		{
// 			const bool	isNearestMipmap	= isNearestMipmapFilter(sampler.minFilter);
// 			const bool	isLinearMipmap	= isLinearMipmapFilter(sampler.minFilter);
// 			const int	minTexLevel		= 0;
// 			const int	maxTexLevel		= texture.getNumLevels()-1;
//
// 			DE_ASSERT(minTexLevel <= maxTexLevel);
//
// 			if (isLinearMipmap && minTexLevel < maxTexLevel)
// 			{
// 				const int	minLevel	= de::clamp((int)deFloatFloor(minLod), minTexLevel, maxTexLevel-1);
// 				const int	maxLevel	= de::clamp((int)deFloatFloor(maxLod), minTexLevel, maxTexLevel-1);
//
// 				DE_ASSERT(minLevel <= maxLevel);
//
// 				for (int levelNdx = minLevel; levelNdx <= maxLevel; levelNdx++)
// 				{
// 					const float				minF	= de::clamp(minLod - float(levelNdx), 0.0f, 1.0f);
// 					const float				maxF	= de::clamp(maxLod - float(levelNdx), 0.0f, 1.0f);
//
// 					ConstPixelBufferAccess	faces0[CUBEFACE_LAST];
// 					ConstPixelBufferAccess	faces1[CUBEFACE_LAST];
//
// 					getCubeLevelFaces(texture, levelNdx,		faces0);
// 					getCubeLevelFaces(texture, levelNdx + 1,	faces1);
//
// 					if (isCubeMipmapLinearSampleResultValid(faces0, faces1, sampler, getLevelFilter(sampler.minFilter), prec, faceCoords, Vec2(minF, maxF), result))
// 						return true;
// 				}
// 			}
// 			else if (isNearestMipmap)
// 			{
// 				// \note The accurate formula for nearest mipmapping is level = ceil(lod + 0.5) - 1 but Khronos has made
// 				//		 decision to allow floor(lod + 0.5) as well.
// 				const int	minLevel	= de::clamp((int)deFloatCeil(minLod + 0.5f) - 1,	minTexLevel, maxTexLevel);
// 				const int	maxLevel	= de::clamp((int)deFloatFloor(maxLod + 0.5f),		minTexLevel, maxTexLevel);
//
// 				DE_ASSERT(minLevel <= maxLevel);
//
// 				for (int levelNdx = minLevel; levelNdx <= maxLevel; levelNdx++)
// 				{
// 					ConstPixelBufferAccess faces[CUBEFACE_LAST];
// 					getCubeLevelFaces(texture, levelNdx, faces);
//
// 					if (isCubeLevelSampleResultValid(faces, sampler, getLevelFilter(sampler.minFilter), prec, faceCoords, result))
// 						return true;
// 				}
// 			}
// 			else
// 			{
// 				ConstPixelBufferAccess faces[CUBEFACE_LAST];
// 				getCubeLevelFaces(texture, 0, faces);
//
// 				if (isCubeLevelSampleResultValid(faces, sampler, sampler.minFilter, prec, faceCoords, result))
// 					return true;
// 			}
// 		}
// 	}
//
// 	return false;
// }
//
// static inline IVec2 computeLayerRange (int numLayers, int numCoordBits, float layerCoord)
// {
// 	const float	err		= computeFloatingPointError(layerCoord, numCoordBits);
// 	const int	minL	= (int)deFloatFloor(layerCoord - err + 0.5f);		// Round down
// 	const int	maxL	= (int)deFloatCeil(layerCoord + err + 0.5f) - 1;	// Round up
//
// 	DE_ASSERT(minL <= maxL);
//
// 	return IVec2(de::clamp(minL, 0, numLayers-1), de::clamp(maxL, 0, numLayers-1));
// }
//
// bool isLookupResultValid (const Texture1DArrayView& texture, const Sampler& sampler, const LookupPrecision& prec, const Vec2& coord, const Vec2& lodBounds, const Vec4& result)
// {
// 	const IVec2		layerRange		= computeLayerRange(texture.getNumLayers(), prec.coordBits.y(), coord.y());
// 	const float		coordX			= coord.x();
// 	const float		minLod			= lodBounds.x();
// 	const float		maxLod			= lodBounds.y();
// 	const bool		canBeMagnified	= minLod <= sampler.lodThreshold;
// 	const bool		canBeMinified	= maxLod > sampler.lodThreshold;
//
// 	DE_ASSERT(isSamplerSupported(sampler));
//
// 	for (int layer = layerRange.x(); layer <= layerRange.y(); layer++)
// 	{
// 		if (canBeMagnified)
// 		{
// 			if (isLevelSampleResultValid(texture.getLevel(0), sampler, sampler.magFilter, prec, coordX, layer, result))
// 				return true;
// 		}
//
// 		if (canBeMinified)
// 		{
// 			const bool	isNearestMipmap	= isNearestMipmapFilter(sampler.minFilter);
// 			const bool	isLinearMipmap	= isLinearMipmapFilter(sampler.minFilter);
// 			const int	minTexLevel		= 0;
// 			const int	maxTexLevel		= texture.getNumLevels()-1;
//
// 			DE_ASSERT(minTexLevel <= maxTexLevel);
//
// 			if (isLinearMipmap && minTexLevel < maxTexLevel)
// 			{
// 				const int		minLevel		= de::clamp((int)deFloatFloor(minLod), minTexLevel, maxTexLevel-1);
// 				const int		maxLevel		= de::clamp((int)deFloatFloor(maxLod), minTexLevel, maxTexLevel-1);
//
// 				DE_ASSERT(minLevel <= maxLevel);
//
// 				for (int level = minLevel; level <= maxLevel; level++)
// 				{
// 					const float		minF	= de::clamp(minLod - float(level), 0.0f, 1.0f);
// 					const float		maxF	= de::clamp(maxLod - float(level), 0.0f, 1.0f);
//
// 					if (isMipmapLinearSampleResultValid(texture.getLevel(level), texture.getLevel(level+1), sampler, getLevelFilter(sampler.minFilter), prec, coordX, layer, Vec2(minF, maxF), result))
// 						return true;
// 				}
// 			}
// 			else if (isNearestMipmap)
// 			{
// 				// \note The accurate formula for nearest mipmapping is level = ceil(lod + 0.5) - 1 but Khronos has made
// 				//		 decision to allow floor(lod + 0.5) as well.
// 				const int		minLevel		= de::clamp((int)deFloatCeil(minLod + 0.5f) - 1,	minTexLevel, maxTexLevel);
// 				const int		maxLevel		= de::clamp((int)deFloatFloor(maxLod + 0.5f),		minTexLevel, maxTexLevel);
//
// 				DE_ASSERT(minLevel <= maxLevel);
//
// 				for (int level = minLevel; level <= maxLevel; level++)
// 				{
// 					if (isLevelSampleResultValid(texture.getLevel(level), sampler, getLevelFilter(sampler.minFilter), prec, coordX, layer, result))
// 						return true;
// 				}
// 			}
// 			else
// 			{
// 				if (isLevelSampleResultValid(texture.getLevel(0), sampler, sampler.minFilter, prec, coordX, layer, result))
// 					return true;
// 			}
// 		}
// 	}
//
// 	return false;
// }
//
// bool isLookupResultValid (const Texture2DArrayView& texture, const Sampler& sampler, const LookupPrecision& prec, const Vec3& coord, const Vec2& lodBounds, const Vec4& result)
// {
// 	const IVec2		layerRange		= computeLayerRange(texture.getNumLayers(), prec.coordBits.z(), coord.z());
// 	const Vec2		coordXY			= coord.swizzle(0,1);
// 	const float		minLod			= lodBounds.x();
// 	const float		maxLod			= lodBounds.y();
// 	const bool		canBeMagnified	= minLod <= sampler.lodThreshold;
// 	const bool		canBeMinified	= maxLod > sampler.lodThreshold;
//
// 	DE_ASSERT(isSamplerSupported(sampler));
//
// 	for (int layer = layerRange.x(); layer <= layerRange.y(); layer++)
// 	{
// 		if (canBeMagnified)
// 		{
// 			if (isLevelSampleResultValid(texture.getLevel(0), sampler, sampler.magFilter, prec, coordXY, layer, result))
// 				return true;
// 		}
//
// 		if (canBeMinified)
// 		{
// 			const bool	isNearestMipmap	= isNearestMipmapFilter(sampler.minFilter);
// 			const bool	isLinearMipmap	= isLinearMipmapFilter(sampler.minFilter);
// 			const int	minTexLevel		= 0;
// 			const int	maxTexLevel		= texture.getNumLevels()-1;
//
// 			DE_ASSERT(minTexLevel <= maxTexLevel);
//
// 			if (isLinearMipmap && minTexLevel < maxTexLevel)
// 			{
// 				const int		minLevel		= de::clamp((int)deFloatFloor(minLod), minTexLevel, maxTexLevel-1);
// 				const int		maxLevel		= de::clamp((int)deFloatFloor(maxLod), minTexLevel, maxTexLevel-1);
//
// 				DE_ASSERT(minLevel <= maxLevel);
//
// 				for (int level = minLevel; level <= maxLevel; level++)
// 				{
// 					const float		minF	= de::clamp(minLod - float(level), 0.0f, 1.0f);
// 					const float		maxF	= de::clamp(maxLod - float(level), 0.0f, 1.0f);
//
// 					if (isMipmapLinearSampleResultValid(texture.getLevel(level), texture.getLevel(level+1), sampler, getLevelFilter(sampler.minFilter), prec, coordXY, layer, Vec2(minF, maxF), result))
// 						return true;
// 				}
// 			}
// 			else if (isNearestMipmap)
// 			{
// 				// \note The accurate formula for nearest mipmapping is level = ceil(lod + 0.5) - 1 but Khronos has made
// 				//		 decision to allow floor(lod + 0.5) as well.
// 				const int		minLevel		= de::clamp((int)deFloatCeil(minLod + 0.5f) - 1,	minTexLevel, maxTexLevel);
// 				const int		maxLevel		= de::clamp((int)deFloatFloor(maxLod + 0.5f),		minTexLevel, maxTexLevel);
//
// 				DE_ASSERT(minLevel <= maxLevel);
//
// 				for (int level = minLevel; level <= maxLevel; level++)
// 				{
// 					if (isLevelSampleResultValid(texture.getLevel(level), sampler, getLevelFilter(sampler.minFilter), prec, coordXY, layer, result))
// 						return true;
// 				}
// 			}
// 			else
// 			{
// 				if (isLevelSampleResultValid(texture.getLevel(0), sampler, sampler.minFilter, prec, coordXY, layer, result))
// 					return true;
// 			}
// 		}
// 	}
//
// 	return false;
// }
//
// static bool isLevelSampleResultValid (const ConstPixelBufferAccess&		level,
// 									  const Sampler&					sampler,
// 									  const Sampler::FilterMode			filterMode,
// 									  const LookupPrecision&			prec,
// 									  const Vec3&						coord,
// 									  const Vec4&						result)
// {
// 	if (filterMode == Sampler::LINEAR)
// 		return isLinearSampleResultValid(level, sampler, prec, coord, result);
// 	else
// 		return isNearestSampleResultValid(level, sampler, prec, coord, result);
// }
//
// static bool isMipmapLinearSampleResultValid (const ConstPixelBufferAccess&		level0,
// 										     const ConstPixelBufferAccess&		level1,
// 											 const Sampler&						sampler,
// 										     const Sampler::FilterMode			levelFilter,
// 										     const LookupPrecision&				prec,
// 										     const Vec3&						coord,
// 										     const Vec2&						fBounds,
// 										     const Vec4&						result)
// {
// 	if (levelFilter == Sampler::LINEAR)
// 		return isLinearMipmapLinearSampleResultValid(level0, level1, sampler, prec, coord, fBounds, result);
// 	else
// 		return isNearestMipmapLinearSampleResultValid(level0, level1, sampler, prec, coord, fBounds, result);
// }
//
// bool isLookupResultValid (const Texture3DView& texture, const Sampler& sampler, const LookupPrecision& prec, const Vec3& coord, const Vec2& lodBounds, const Vec4& result)
// {
// 	const float		minLod			= lodBounds.x();
// 	const float		maxLod			= lodBounds.y();
// 	const bool		canBeMagnified	= minLod <= sampler.lodThreshold;
// 	const bool		canBeMinified	= maxLod > sampler.lodThreshold;
//
// 	DE_ASSERT(isSamplerSupported(sampler));
//
// 	if (canBeMagnified)
// 	{
// 		if (isLevelSampleResultValid(texture.getLevel(0), sampler, sampler.magFilter, prec, coord, result))
// 			return true;
// 	}
//
// 	if (canBeMinified)
// 	{
// 		const bool	isNearestMipmap	= isNearestMipmapFilter(sampler.minFilter);
// 		const bool	isLinearMipmap	= isLinearMipmapFilter(sampler.minFilter);
// 		const int	minTexLevel		= 0;
// 		const int	maxTexLevel		= texture.getNumLevels()-1;
//
// 		DE_ASSERT(minTexLevel <= maxTexLevel);
//
// 		if (isLinearMipmap && minTexLevel < maxTexLevel)
// 		{
// 			const int		minLevel		= de::clamp((int)deFloatFloor(minLod), minTexLevel, maxTexLevel-1);
// 			const int		maxLevel		= de::clamp((int)deFloatFloor(maxLod), minTexLevel, maxTexLevel-1);
//
// 			DE_ASSERT(minLevel <= maxLevel);
//
// 			for (int level = minLevel; level <= maxLevel; level++)
// 			{
// 				const float		minF	= de::clamp(minLod - float(level), 0.0f, 1.0f);
// 				const float		maxF	= de::clamp(maxLod - float(level), 0.0f, 1.0f);
//
// 				if (isMipmapLinearSampleResultValid(texture.getLevel(level), texture.getLevel(level+1), sampler, getLevelFilter(sampler.minFilter), prec, coord, Vec2(minF, maxF), result))
// 					return true;
// 			}
// 		}
// 		else if (isNearestMipmap)
// 		{
// 			// \note The accurate formula for nearest mipmapping is level = ceil(lod + 0.5) - 1 but Khronos has made
// 			//		 decision to allow floor(lod + 0.5) as well.
// 			const int		minLevel		= de::clamp((int)deFloatCeil(minLod + 0.5f) - 1,	minTexLevel, maxTexLevel);
// 			const int		maxLevel		= de::clamp((int)deFloatFloor(maxLod + 0.5f),		minTexLevel, maxTexLevel);
//
// 			DE_ASSERT(minLevel <= maxLevel);
//
// 			for (int level = minLevel; level <= maxLevel; level++)
// 			{
// 				if (isLevelSampleResultValid(texture.getLevel(level), sampler, getLevelFilter(sampler.minFilter), prec, coord, result))
// 					return true;
// 			}
// 		}
// 		else
// 		{
// 			if (isLevelSampleResultValid(texture.getLevel(0), sampler, sampler.minFilter, prec, coord, result))
// 				return true;
// 		}
// 	}
//
// 	return false;
// }
//
// static void getCubeArrayLevelFaces (const TextureCubeArrayView& texture, const int levelNdx, const int layerNdx, ConstPixelBufferAccess (&out)[CUBEFACE_LAST])
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
// bool isLookupResultValid (const TextureCubeArrayView& texture, const Sampler& sampler, const LookupPrecision& prec, const IVec4& coordBits, const Vec4& coord, const Vec2& lodBounds, const Vec4& result)
// {
// 	const IVec2	layerRange						= computeLayerRange(texture.getNumLayers(), coordBits.w(), coord.w());
// 	const Vec3	layerCoord						= coord.toWidth<3>();
// 	int			numPossibleFaces				= 0;
// 	CubeFace	possibleFaces[CUBEFACE_LAST];
//
// 	DE_ASSERT(isSamplerSupported(sampler));
//
// 	getPossibleCubeFaces(layerCoord, prec.coordBits, &possibleFaces[0], numPossibleFaces);
//
// 	if (numPossibleFaces == 0)
// 		return true; // Result is undefined.
//
// 	for (int layerNdx = layerRange.x(); layerNdx <= layerRange.y(); layerNdx++)
// 	{
// 		for (int tryFaceNdx = 0; tryFaceNdx < numPossibleFaces; tryFaceNdx++)
// 		{
// 			const CubeFaceFloatCoords	faceCoords		(possibleFaces[tryFaceNdx], projectToFace(possibleFaces[tryFaceNdx], layerCoord));
// 			const float					minLod			= lodBounds.x();
// 			const float					maxLod			= lodBounds.y();
// 			const bool					canBeMagnified	= minLod <= sampler.lodThreshold;
// 			const bool					canBeMinified	= maxLod > sampler.lodThreshold;
//
// 			if (canBeMagnified)
// 			{
// 				ConstPixelBufferAccess faces[CUBEFACE_LAST];
// 				getCubeArrayLevelFaces(texture, 0, layerNdx, faces);
//
// 				if (isCubeLevelSampleResultValid(faces, sampler, sampler.magFilter, prec, faceCoords, result))
// 					return true;
// 			}
//
// 			if (canBeMinified)
// 			{
// 				const bool	isNearestMipmap	= isNearestMipmapFilter(sampler.minFilter);
// 				const bool	isLinearMipmap	= isLinearMipmapFilter(sampler.minFilter);
// 				const int	minTexLevel		= 0;
// 				const int	maxTexLevel		= texture.getNumLevels()-1;
//
// 				DE_ASSERT(minTexLevel <= maxTexLevel);
//
// 				if (isLinearMipmap && minTexLevel < maxTexLevel)
// 				{
// 					const int	minLevel	= de::clamp((int)deFloatFloor(minLod), minTexLevel, maxTexLevel-1);
// 					const int	maxLevel	= de::clamp((int)deFloatFloor(maxLod), minTexLevel, maxTexLevel-1);
//
// 					DE_ASSERT(minLevel <= maxLevel);
//
// 					for (int levelNdx = minLevel; levelNdx <= maxLevel; levelNdx++)
// 					{
// 						const float		minF	= de::clamp(minLod - float(levelNdx), 0.0f, 1.0f);
// 						const float		maxF	= de::clamp(maxLod - float(levelNdx), 0.0f, 1.0f);
//
// 						ConstPixelBufferAccess	faces0[CUBEFACE_LAST];
// 						ConstPixelBufferAccess	faces1[CUBEFACE_LAST];
//
// 						getCubeArrayLevelFaces(texture, levelNdx,		layerNdx,	faces0);
// 						getCubeArrayLevelFaces(texture, levelNdx + 1,	layerNdx,	faces1);
//
// 						if (isCubeMipmapLinearSampleResultValid(faces0, faces1, sampler, getLevelFilter(sampler.minFilter), prec, faceCoords, Vec2(minF, maxF), result))
// 							return true;
// 					}
// 				}
// 				else if (isNearestMipmap)
// 				{
// 					// \note The accurate formula for nearest mipmapping is level = ceil(lod + 0.5) - 1 but Khronos has made
// 					//		 decision to allow floor(lod + 0.5) as well.
// 					const int	minLevel	= de::clamp((int)deFloatCeil(minLod + 0.5f) - 1,	minTexLevel, maxTexLevel);
// 					const int	maxLevel	= de::clamp((int)deFloatFloor(maxLod + 0.5f),		minTexLevel, maxTexLevel);
//
// 					DE_ASSERT(minLevel <= maxLevel);
//
// 					for (int levelNdx = minLevel; levelNdx <= maxLevel; levelNdx++)
// 					{
// 						ConstPixelBufferAccess faces[CUBEFACE_LAST];
// 						getCubeArrayLevelFaces(texture, levelNdx, layerNdx, faces);
//
// 						if (isCubeLevelSampleResultValid(faces, sampler, getLevelFilter(sampler.minFilter), prec, faceCoords, result))
// 							return true;
// 					}
// 				}
// 				else
// 				{
// 					ConstPixelBufferAccess faces[CUBEFACE_LAST];
// 					getCubeArrayLevelFaces(texture, 0, layerNdx, faces);
//
// 					if (isCubeLevelSampleResultValid(faces, sampler, sampler.minFilter, prec, faceCoords, result))
// 						return true;
// 				}
// 			}
// 		}
// 	}
//
// 	return false;
// }
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
// 	return computeLodBoundsFromDerivates(dudx, dvdx, 0.0f, dudy, dvdy, 0.0f, prec);
// }
//
// Vec2 computeLodBoundsFromDerivates (const float dudx, const float dudy, const LodPrecision& prec)
// {
// 	return computeLodBoundsFromDerivates(dudx, 0.0f, 0.0f, dudy, 0.0f, 0.0f, prec);
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
// 		const float		dudx	= float(faceSize) * 0.5f * (scdx*ma - sc*madx) / (ma*ma);
// 		const float		dvdx	= float(faceSize) * 0.5f * (tcdx*ma - tc*madx) / (ma*ma);
// 		const float		dudy	= float(faceSize) * 0.5f * (scdy*ma - sc*mady) / (ma*ma);
// 		const float		dvdy	= float(faceSize) * 0.5f * (tcdy*ma - tc*mady) / (ma*ma);
// 		const Vec2		bounds	= computeLodBoundsFromDerivates(dudx, dvdx, dudy, dvdy, prec);
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
// 				return Vec2(bounds.x(), 1000.0f);
// 			}
// 		}
//
// 		return bounds;
// 	}
// }
//
// Vec2 clampLodBounds (const Vec2& lodBounds, const Vec2& lodMinMax, const LodPrecision& prec)
// {
// 	const float lodErr	= computeFixedPointError(prec.lodBits);
// 	const float	a		= lodMinMax.x();
// 	const float	b		= lodMinMax.y();
// 	return Vec2(de::clamp(lodBounds.x(), a-lodErr, b-lodErr), de::clamp(lodBounds.y(), a+lodErr, b+lodErr));
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
// 								 const Vec2&					coord,
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
// 								 const Vec2&					coord,
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
// 								 const Vec2&					coord,
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
// template<typename PrecType, typename ScalarType>
// static bool isGatherOffsetsResultValid (const ConstPixelBufferAccess&	level,
// 										const Sampler&					sampler,
// 										const PrecType&					prec,
// 										const Vec2&						coord,
// 										int								coordZ,
// 										int								componentNdx,
// 										const IVec2						(&offsets)[4],
// 										const Vector<ScalarType, 4>&	result)
// {
// 	const Vec2	uBounds		= computeNonNormalizedCoordBounds(sampler.normalizedCoords, level.getWidth(),	coord.x(), prec.coordBits.x(), prec.uvwBits.x());
// 	const Vec2	vBounds		= computeNonNormalizedCoordBounds(sampler.normalizedCoords, level.getHeight(),	coord.y(), prec.coordBits.y(), prec.uvwBits.y());
//
// 	// Integer coordinate bounds for (x0, y0) - without wrap mode
// 	const int	minI		= deFloorFloatToInt32(uBounds.x()-0.5f);
// 	const int	maxI		= deFloorFloatToInt32(uBounds.y()-0.5f);
// 	const int	minJ		= deFloorFloatToInt32(vBounds.x()-0.5f);
// 	const int	maxJ		= deFloorFloatToInt32(vBounds.y()-0.5f);
//
// 	const int	w			= level.getWidth();
// 	const int	h			= level.getHeight();
//
// 	for (int j = minJ; j <= maxJ; j++)
// 	{
// 		for (int i = minI; i <= maxI; i++)
// 		{
// 			Vector<ScalarType, 4> color;
// 			for (int offNdx = 0; offNdx < 4; offNdx++)
// 			{
// 				// offNdx-th coordinate offset and then wrapped.
// 				const int x = wrap(sampler.wrapS, i+offsets[offNdx].x(), w);
// 				const int y = wrap(sampler.wrapT, j+offsets[offNdx].y(), h);
// 				color[offNdx] = lookup<ScalarType>(level, sampler, x, y, coordZ)[componentNdx];
// 			}
//
// 			if (isColorValid(prec, color, result))
// 				return true;
// 		}
// 	}
//
// 	return false;
// }
//
// bool isGatherOffsetsResultValid (const Texture2DView&			texture,
// 								 const Sampler&					sampler,
// 								 const LookupPrecision&			prec,
// 								 const Vec2&					coord,
// 								 int							componentNdx,
// 								 const IVec2					(&offsets)[4],
// 								 const Vec4&					result)
// {
// 	return isGatherOffsetsResultValid(texture.getLevel(0), sampler, prec, coord, 0, componentNdx, offsets, result);
// }
//
// bool isGatherOffsetsResultValid (const Texture2DView&			texture,
// 								 const Sampler&					sampler,
// 								 const IntLookupPrecision&		prec,
// 								 const Vec2&					coord,
// 								 int							componentNdx,
// 								 const IVec2					(&offsets)[4],
// 								 const IVec4&					result)
// {
// 	return isGatherOffsetsResultValid(texture.getLevel(0), sampler, prec, coord, 0, componentNdx, offsets, result);
// }
//
// bool isGatherOffsetsResultValid (const Texture2DView&			texture,
// 								 const Sampler&					sampler,
// 								 const IntLookupPrecision&		prec,
// 								 const Vec2&					coord,
// 								 int							componentNdx,
// 								 const IVec2					(&offsets)[4],
// 								 const UVec4&					result)
// {
// 	return isGatherOffsetsResultValid(texture.getLevel(0), sampler, prec, coord, 0, componentNdx, offsets, result);
// }
//
// template <typename PrecType, typename ScalarType>
// static bool is2DArrayGatherOffsetsResultValid (const Texture2DArrayView&		texture,
// 											   const Sampler&					sampler,
// 											   const PrecType&					prec,
// 											   const Vec3&						coord,
// 											   int								componentNdx,
// 											   const IVec2						(&offsets)[4],
// 											   const Vector<ScalarType, 4>&		result)
// {
// 	const IVec2 layerRange = computeLayerRange(texture.getNumLayers(), prec.coordBits.z(), coord.z());
// 	for (int layer = layerRange.x(); layer <= layerRange.y(); layer++)
// 	{
// 		if (isGatherOffsetsResultValid(texture.getLevel(0), sampler, prec, coord.swizzle(0,1), layer, componentNdx, offsets, result))
// 			return true;
// 	}
// 	return false;
// }
//
// bool isGatherOffsetsResultValid (const Texture2DArrayView&		texture,
// 								 const Sampler&					sampler,
// 								 const LookupPrecision&			prec,
// 								 const Vec3&					coord,
// 								 int							componentNdx,
// 								 const IVec2					(&offsets)[4],
// 								 const Vec4&					result)
// {
// 	return is2DArrayGatherOffsetsResultValid(texture, sampler, prec, coord, componentNdx, offsets, result);
// }
//
// bool isGatherOffsetsResultValid (const Texture2DArrayView&		texture,
// 								 const Sampler&					sampler,
// 								 const IntLookupPrecision&		prec,
// 								 const Vec3&					coord,
// 								 int							componentNdx,
// 								 const IVec2					(&offsets)[4],
// 								 const IVec4&					result)
// {
// 	return is2DArrayGatherOffsetsResultValid(texture, sampler, prec, coord, componentNdx, offsets, result);
// }
//
// bool isGatherOffsetsResultValid (const Texture2DArrayView&		texture,
// 								 const Sampler&					sampler,
// 								 const IntLookupPrecision&		prec,
// 								 const Vec3&					coord,
// 								 int							componentNdx,
// 								 const IVec2					(&offsets)[4],
// 								 const UVec4&					result)
// {
// 	return is2DArrayGatherOffsetsResultValid(texture, sampler, prec, coord, componentNdx, offsets, result);
// }
//
// template<typename PrecType, typename ScalarType>
// static bool isGatherResultValid (const TextureCubeView&			texture,
// 								 const Sampler&					sampler,
// 								 const PrecType&				prec,
// 								 const CubeFaceFloatCoords&		coords,
// 								 int							componentNdx,
// 								 const Vector<ScalarType, 4>&	result)
// {
// 	const int	size		= texture.getLevelFace(0, coords.face).getWidth();
//
// 	const Vec2	uBounds		= computeNonNormalizedCoordBounds(sampler.normalizedCoords, size, coords.s, prec.coordBits.x(), prec.uvwBits.x());
// 	const Vec2	vBounds		= computeNonNormalizedCoordBounds(sampler.normalizedCoords, size, coords.t, prec.coordBits.y(), prec.uvwBits.y());
//
// 	// Integer coordinate bounds for (x0,y0) - without wrap mode
// 	const int	minI		= deFloorFloatToInt32(uBounds.x()-0.5f);
// 	const int	maxI		= deFloorFloatToInt32(uBounds.y()-0.5f);
// 	const int	minJ		= deFloorFloatToInt32(vBounds.x()-0.5f);
// 	const int	maxJ		= deFloorFloatToInt32(vBounds.y()-0.5f);
//
// 	// Face accesses
// 	ConstPixelBufferAccess faces[CUBEFACE_LAST];
// 	for (int face = 0; face < CUBEFACE_LAST; face++)
// 		faces[face] = texture.getLevelFace(0, CubeFace(face));
//
// 	for (int j = minJ; j <= maxJ; j++)
// 	{
// 		for (int i = minI; i <= maxI; i++)
// 		{
// 			static const IVec2 offsets[4] =
// 			{
// 				IVec2(0, 1),
// 				IVec2(1, 1),
// 				IVec2(1, 0),
// 				IVec2(0, 0)
// 			};
//
// 			Vector<ScalarType, 4> color;
// 			for (int offNdx = 0; offNdx < 4; offNdx++)
// 			{
// 				const CubeFaceIntCoords c = remapCubeEdgeCoords(CubeFaceIntCoords(coords.face, i+offsets[offNdx].x(), j+offsets[offNdx].y()), size);
// 				// If any of samples is out of both edges, implementations can do pretty much anything according to spec.
// 				// \todo [2014-06-05 nuutti] Test the special case where all corner pixels have exactly the same color.
// 				//							 See also isSeamlessLinearSampleResultValid and similar.
// 				if (c.face == CUBEFACE_LAST)
// 					return true;
//
// 				color[offNdx] = lookup<ScalarType>(faces[c.face], sampler, c.s, c.t, 0)[componentNdx];
// 			}
//
// 			if (isColorValid(prec, color, result))
// 				return true;
// 		}
// 	}
//
// 	return false;
// }
//
// template <typename PrecType, typename ScalarType>
// static bool isCubeGatherResultValid (const TextureCubeView&			texture,
// 									 const Sampler&					sampler,
// 									 const PrecType&				prec,
// 									 const Vec3&					coord,
// 									 int							componentNdx,
// 									 const Vector<ScalarType, 4>&	result)
// {
// 	int			numPossibleFaces				= 0;
// 	CubeFace	possibleFaces[CUBEFACE_LAST];
//
// 	getPossibleCubeFaces(coord, prec.coordBits, &possibleFaces[0], numPossibleFaces);
//
// 	if (numPossibleFaces == 0)
// 		return true; // Result is undefined.
//
// 	for (int tryFaceNdx = 0; tryFaceNdx < numPossibleFaces; tryFaceNdx++)
// 	{
// 		const CubeFaceFloatCoords faceCoords(possibleFaces[tryFaceNdx], projectToFace(possibleFaces[tryFaceNdx], coord));
//
// 		if (isGatherResultValid(texture, sampler, prec, faceCoords, componentNdx, result))
// 			return true;
// 	}
//
// 	return false;
// }
//
// bool isGatherResultValid (const TextureCubeView&		texture,
// 								 const Sampler&				sampler,
// 								 const LookupPrecision&		prec,
// 								 const Vec3&				coord,
// 								 int						componentNdx,
// 								 const Vec4&				result)
// {
// 	return isCubeGatherResultValid(texture, sampler, prec, coord, componentNdx, result);
// }
//
// bool isGatherResultValid (const TextureCubeView&		texture,
// 								 const Sampler&				sampler,
// 								 const IntLookupPrecision&	prec,
// 								 const Vec3&				coord,
// 								 int						componentNdx,
// 								 const IVec4&				result)
// {
// 	return isCubeGatherResultValid(texture, sampler, prec, coord, componentNdx, result);
// }
//
// bool isGatherResultValid (const TextureCubeView&		texture,
// 								 const Sampler&				sampler,
// 								 const IntLookupPrecision&	prec,
// 								 const Vec3&				coord,
// 								 int						componentNdx,
// 								 const UVec4&				result)
// {
// 	return isCubeGatherResultValid(texture, sampler, prec, coord, componentNdx, result);
// }
//
// } // tcu
});
