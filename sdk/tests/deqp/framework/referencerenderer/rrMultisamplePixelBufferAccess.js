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

define(['framework/common/tcuTexture', 'framework/delibs/debase/deMath'], function(tcuTexture, deMath) {

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
 */
var MultisamplePixelBufferAccess = function(rawAccess) {
    this.m_access = rawAccess;
};

MultisamplePixelBufferAccess.prototype.raw = function() { return this.m_access; };
MultisamplePixelBufferAccess.prototype.getNumSamples = function() { this.raw().getWidth(); };

MultisamplePixelBufferAccess.prototype.toSinglesampleAccess = function() {
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

MultisamplePixelBufferAccess.fromSinglesampleAccess = function(original) {
    return new MultisamplePixelBufferAccess(
                new tcuTexture.PixelBufferAccess({
                                format: original.getFormat(),
                                width: 1,
                                height: original.getWidth(),
                                depth: original.getHeight(),
                                rowPitch: original.getFormat().getPixelSize(),
                                slicePitch: original.getRowPitch(),
                                data: original.m_data}));
};

MultisamplePixelBufferAccess.fromMultisampleAccess = function(multisampledAccess) {
    return new MultisamplePixelBufferAccess(multisampledAccess);
};

MultisamplePixelBufferAccess.prototype.getSubregion = function(x, y, width, height) {
    /* TODO: implement */
    throw new Error('Unimplemented');
};

/**
 * @param {tcuTexture.PixelBufferAccess} dst
 */
MultisamplePixelBufferAccess.prototype.resolveMultisampleColorBuffer = function(dst) {
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

MultisamplePixelBufferAccess.prototype.resolveMultisamplePixel = function(x, y) {
    var sum = [0, 0, 0, 0];
    for (var s = 0; s < this.getNumSamples(); s++)
        sum = deMath.add(sum, this.raw().getPixel(s, x, y));

    for (var i = 0; i < sum.length; i++)
        sum[i] = sum[i] / this.getNumSamples();

    return sum;
};

return {
    MultisamplePixelBufferAccess: MultisamplePixelBufferAccess
};

});