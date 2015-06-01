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

goog.scope(function() {

var tcuTexCompareVerifier = framework.common.tcuTexCompareVerifier;
var tcuTexture = framework.common.tcuTexture;

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
    this.coordBits = coordBits || [22, 22, 22];
    this.uvwBits = uvwBits || [22, 22, 22];
    this.pcfBits = pcfBits || 16;
    this.referenceBits = referenceBits || 16;
    this.resultBits = resultBits || 16;
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
    /* TOOO: implement */
    throw new Error('Unimplemented');
};


});
