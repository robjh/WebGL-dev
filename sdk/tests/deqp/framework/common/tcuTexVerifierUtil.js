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
goog.provide('framework.common.tcuTexVerifierUtil');
goog.require('framework.common.tcuFloat');

goog.scope(function() {

    var tcuTexVerifierUtil = framework.common.tcuTexVerifierUtil;
    var tcuFloat = framework.common.tcuFloat;

    /**
     * @param {Array<number>} numAccurateBits
     * @return {Array<number>}
     */
    tcuTexVerifierUtil.computeFixedPointError = function(numAccurateBits) {
    	/** @type {Array<number>} */ var res = [];
    	for (var ndx = 0; ndx < numAccurateBits.length; ndx++)
    		res[ndx] = tcuTexVerifierUtil.computeFixedPointErrorNumber(numAccurateBits[ndx]);
    	return res;
    };
    /**
     *
     * @param {boolean} normalizedCoords
     * @param {number} dim
     * @param {number} coord
     * @param {number} coordBits
     * @param {number} uvBits
     * @return {Array<number>}
     */
    tcuTexVerifierUtil.computeNonNormalizedCoordBounds = function(normalizedCoords, dim, coord, coordBits, uvBits) {
        /** @type {number} */ var coordErr = tcuTexVerifierUtil.computeFloatingPointError(coord, coordBits);
        /** @type {number} */ var minN = coord - coordErr;
        /** @type {number} */ var maxN = coord + coordErr;
        /** @type {number} */ var minA = normalizedCoords ? minN * dim : minN;
        /** @type {number} */ var maxA = normalizedCoords ? maxN * dim : maxN;
        /** @type {number} */ var minC = minA - tcuTexVerifierUtil.computeFixedPointError(uvBits);
        /** @type {number} */ var maxC = maxA + tcuTexVerifierUtil.computeFixedPointError(uvBits);
        return [minC, maxC];
    };

    /**
     * @param {tcuTexture.WrapMode} mode
     * @return {boolean}
     */
    tcuTexVerifierUtil.isWrapModeSupported = function(mode) {
        return mode != tcuTexture.WrapMode.MIRRORED_REPEAT_CL && mode != tcuTexture.WrapMode.REPEAT_CL;
    };

    /**
     * @param {number} numAccurateBits
     * @return {number}
     */
    tcuTexVerifierUtil.computeFixedPointErrorNumber = function(numAccurateBits) {
        return tcuTexVerifierUtil.computeFloatingPointError(1.0, numAccurateBits);
    };

    /**
     * @param {number} value
     * @param {number} numAccurateBits
     * @return {number}
     */
    tcuTexVerifierUtil.computeFloatingPointError = function(value, numAccurateBits) {
        /** @type {number} */ var numGarbageBits = 23 - numAccurateBits;
        /** @type {number} */ var mask = (1 << numGarbageBits) - 1;
        /** @type {number} */ var exp = tcuFloat.newFloat32(value).exponent();

        /** @type {tcuFloat.deFloat} */ var v1 = new tcuFloat.deFloat();
        /** @type {tcuFloat.deFloat} */ var v2 = new tcuFloat.deFloat();
        return v1.construct(1, exp, 1 << 23 | mask).getValue() - v2.construct(1, exp, 1 << 23).getValue();
    };

    /**
     * @param  {tcuTexture.WrapMode} mode
     * @param  {number} c
     * @param  {number} size
     * @return {number}
     */
    tcuTexVerifierUtil.wrap = function(mode, c, size) {
    	switch (mode) {
    		// \note CL and GL modes are handled identically here, as verification process accounts for
    		//		 accuracy differences caused by different methods (wrapping vs. denormalizing first).
    		case tcuTexture.WrapMode.CLAMP_TO_EDGE:
    			return deMath.clamp(c, 0, size - 1);

    		case tcuTexture.WrapMode.REPEAT_GL:
    		case tcuTexture.WrapMode.REPEAT_CL:
    			return tcuTexVerifierUtil.imod(c, size);

    		case tcuTexture.WrapMode.MIRRORED_REPEAT_GL:
    		case tcuTexture.WrapMode.MIRRORED_REPEAT_CL:
    			return (size - 1) - tcuTexVerifierUtil.mirror(tcuTexVerifierUtil.imod(c, 2 * size) - size);

    		default:
    			throw new Error("Wrap mode not supported.");
    	}
    };

    /**
     * @param {number} a
     * @param {number} b
     * @return {number}
     */
    tcuTexVerifierUtil.imod = function(a, b) {
    	var m = a % b;
    	return m < 0 ? m + b : m;
    };

    /**
     * @param {number} a
     * @return {number}
     */
    tcuTexVerifierUtil.mirror = function (a) {
    	return a >= 0.0 ? a : -(1 + a);
    };

});
