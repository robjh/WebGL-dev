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
goog.require('framework.common.tcuTexVerifierUtil');


goog.scope(function() {

    var tcuTexLookupVerifier = framework.common.tcuTexLookupVerifier;
    var tcuTexVerifierUtil = framework.common.tcuTexVerifierUtil;
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
     *
     */
    tcuTexLookupVerifier.computeLodBoundsFromDerivates = function() {
        throw new Error('Not implemented. TODO: implement');
    };

    /**
     *
     */
    tcuTexLookupVerifier.clampLodBounds = function() {
        throw new Error('Not implemented. TODO: implement');
    };

    /**
     *
     */
    tcuTexLookupVerifier.isLookupResultValid = function() {
        throw new Error('Not implemented. TODO: implement');
    };

});
