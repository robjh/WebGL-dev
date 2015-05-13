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
goog.provide('framework.referencerenderer.rrMultisamplePixelBufferAccess');
goog.require('framework.common.tcuTexture');
goog.require('framework.common.tcuTextureUtil');
goog.require('framework.delibs.debase.deMath');

goog.scope(function() {

var rrMultisamplePixelBufferAccess = framework.referencerenderer.rrMultisamplePixelBufferAccess;
var tcuTexture = framework.common.tcuTexture;
var deMath = framework.delibs.debase.deMath;
var tcuTextureUtil = framework.common.tcuTextureUtil;

var DE_ASSERT = function(x) {
    if (!x)
        throw new Error('Assert failed');
};

/**
 * \brief Read-write pixel data access to multisampled buffers.
 *
 * Multisampled data access follows the multisampled indexing convention.
 *
 * Prevents accidental usage of non-multisampled buffer as multisampled
 * with PixelBufferAccess.
 * @constructor
 * @param {tcuTexture.PixelBufferAccess=} rawAccess
 */
rrMultisamplePixelBufferAccess.MultisamplePixelBufferAccess = function(rawAccess) {
    this.m_access = rawAccess || new tcuTexture.PixelBufferAccess({
                                            width: 0,
                                            height: 0});
};

rrMultisamplePixelBufferAccess.MultisamplePixelBufferAccess.prototype.raw = function() { return this.m_access; };
rrMultisamplePixelBufferAccess.MultisamplePixelBufferAccess.prototype.isEmpty = function() { return this.m_access.isEmpty(); };
rrMultisamplePixelBufferAccess.MultisamplePixelBufferAccess.prototype.getNumSamples = function() { return this.raw().getWidth(); };

rrMultisamplePixelBufferAccess.MultisamplePixelBufferAccess.prototype.toSinglesampleAccess = function() {
    DE_ASSERT(this.getNumSamples() == 1);

    return new tcuTexture.PixelBufferAccess({
                                  format: this.m_access.getFormat(),
                                  width: this.m_access.getHeight(),
                                  height: this.m_access.getDepth(),
                                  depth: 1,
                                  rowPitch: this.m_access.getSlicePitch(),
                                  slicePitch: this.m_access.getSlicePitch() * this.m_access.getDepth(),
                                  data: this.m_access.m_data});
};
/**
 * @param {tcuTexture.PixelBufferAccess} original
 * @return {rrMultisamplePixelBufferAccess.MultisamplePixelBufferAccess}
 */
rrMultisamplePixelBufferAccess.MultisamplePixelBufferAccess.fromSinglesampleAccess = function(original) {
    return new rrMultisamplePixelBufferAccess.MultisamplePixelBufferAccess(
                new tcuTexture.PixelBufferAccess({
                                format: original.getFormat(),
                                width: 1,
                                height: original.getWidth(),
                                depth: original.getHeight(),
                                rowPitch: original.getFormat().getPixelSize(),
                                slicePitch: original.getRowPitch(),
                                data: original.m_data}));
};

rrMultisamplePixelBufferAccess.MultisamplePixelBufferAccess.fromMultisampleAccess = function(multisampledAccess) {
    return new rrMultisamplePixelBufferAccess.MultisamplePixelBufferAccess(multisampledAccess);
};

rrMultisamplePixelBufferAccess.MultisamplePixelBufferAccess.prototype.getSubregion = function(region) {
    var x = region[0];
    var y = region[1];
    var width = region[2];
    var height = region[3];

    return rrMultisamplePixelBufferAccess.MultisamplePixelBufferAccess.fromMultisampleAccess(tcuTextureUtil.getSubregion(this.raw(), 0, x, y, this.getNumSamples(), width, height));
};

/**
 * @return {Array<number>} [x, y, width, height]
 */
rrMultisamplePixelBufferAccess.MultisamplePixelBufferAccess.prototype.getBufferSize = function() {
    return [0, 0, this.raw().getHeight(), this.raw().getDepth()];
};

/**
 * @param {tcuTexture.PixelBufferAccess} dst
 */
rrMultisamplePixelBufferAccess.MultisamplePixelBufferAccess.prototype.resolveMultisampleColorBuffer = function(dst) {
    var src = this;
    DE_ASSERT(dst.getWidth() == src.raw().getHeight());
    DE_ASSERT(dst.getHeight() == src.raw().getDepth());

    for (var y = 0; y < dst.getHeight(); y++) {
        for (var x = 0; x < dst.getWidth(); x++) {
            var sum = [0, 0, 0, 0];
            for (var s = 0; s < src.raw().getWidth(); s++)
                sum = deMath.add(sum, src.raw().getPixel(s, x, y));

            for (var i = 0; i < sum.length; i++)
                sum[i] = sum[i] / src.getNumSamples();

            dst.setPixel(sum, x, y);
        }
    }
};

rrMultisamplePixelBufferAccess.MultisamplePixelBufferAccess.prototype.resolveMultisamplePixel = function(x, y) {
    var sum = [0, 0, 0, 0];
    for (var s = 0; s < this.getNumSamples(); s++)
        sum = deMath.add(sum, this.raw().getPixel(s, x, y));

    for (var i = 0; i < sum.length; i++)
        sum[i] = sum[i] / this.getNumSamples();

    return sum;
};

rrMultisamplePixelBufferAccess.MultisamplePixelBufferAccess.prototype.clear = function(color) {
    this.raw().clear(color);
};

});
