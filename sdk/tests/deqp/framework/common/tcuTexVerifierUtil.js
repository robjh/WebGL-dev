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
});
