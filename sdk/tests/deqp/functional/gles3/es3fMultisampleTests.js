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
goog.provide('functional.gles3.es3fMultisampleTests');
goog.require('framework.common.tcuTestCase');


goog.scope(function() {
    /** @type {?WebGL2RenderingContext} */ var gl;
    var es3fMultisampleTests = functional.gles3.es3fMultisampleTests;
    var tcuTestCase = framework.common.tcuTestCase;

    /** @const {number} */ es3fMultisampleTests.FBO_COLOR_FORMAT = gl.RGBA8;
    /** @const {number} */ es3fMultisampleTests.SQRT_HALF = 0.707107;

    /**
     * @constructor
     * @struct
     * @param {Array<number>} p0_
     * @param {Array<number>} p1_
     * @param {Array<number>} p2_
     * @param {Array<number>} p3_
     */
    es3fMultisampleTests.QuadCorners = function(p0_, p1_, p2_, p3_) {
        /** @type {Array<number>} */ this.p0 = p0_;
        /** @type {Array<number>} */ this.p1 = p1_;
        /** @type {Array<number>} */ this.p2 = p2_;
        /** @type {Array<number>} */ this.p3 = p3_;
    };

    /**
     * @param {number} defaultCount
     * @return {number}
     */
    es3fMultisampleTests.getIterationCount = function(defaultCount) {
        // The C++ test takes an argument from the command line.
        // Leaving this function in case we want to be able to take an argument from the URL
        return defaultCount;
    };

    /**
     * @param {number} a
     * @param {number} b
     * @param {number} c
     * @param {number} d
     * @return {number}
     */
    es3fMultisampleTests.min4 = function(a, b, c, d) {
           return Math.min(Math.min(Math.min(a, b), c), d);
    };

    /**
     * @param {number} a
     * @param {number} b
     * @param {number} c
     * @param {number} d
     * @return {number}
     */
    es3fMultisampleTests.max4 = function(a, b, c, d) {
           return Math.max(Math.max(Math.max(a, b), c), d);
    };

    /**
     * @param  {Array<number>} point
     * @param  {Array<number>} p0
     * @param  {Array<number>} p1
     * @param  {Array<number>} p2
     * @param  {Array<number>} p3
     * @return {boolean}
     */
    es3fMultisampleTests.isInsideQuad = function(point, p0, p1, p2, p3) {
        /** @type {number} */ var dot0 = (point[0] - p0[0]) * (p1[1] - p0[1]) + (point[1] - p0[1]) * (p0[0] - p1[0]);
        /** @type {number} */ var dot1 = (point[0] - p1[0]) * (p2[1] - p1[1]) + (point[1] - p1[1]) * (p1[0] - p2[0]);
        /** @type {number} */ var dot2 = (point[0] - p2[0]) * (p3[1] - p2[1]) + (point[1] - p2[1]) * (p2[0] - p3[0]);
        /** @type {number} */ var dot3 = (point[0] - p3[0]) * (p0[1] - p3[1]) + (point[1] - p3[1]) * (p3[0] - p0[0]);

        return (dot0 > 0) == (dot1 > 0) && (dot1 > 0) == (dot2 > 0) && (dot2 > 0) == (dot3 > 0);
    };

    /**
     * Check if a region in an image is unicolored.
     *
     * Checks if the pixels in img inside the convex quadilateral defined by
     * p0, p1, p2 and p3 are all (approximately) of the same color.
     *
     * @param  {tcuTexture.Surface} img
     * @param  {Array<number>} p0
     * @param  {Array<number>} p1
     * @param  {Array<number>} p2
     * @param  {Array<number>} p3
     * @return {boolean}
     */
    es3fMultisampleTests.isPixelRegionUnicolored = function(img, p0, p1, p2, p3) {
        /** @type {number} */ var xMin = deMath.clamp(es3fMultisampleTests.min4(p0[0], p1[0], p2[0], p3[0]), 0, img.getWidth() - 1);
        /** @type {number} */ var yMin = deMath.clamp(es3fMultisampleTests.min4(p0[1], p1[1], p2[1], p3[1]), 0, img.getHeight() - 1);
        /** @type {number} */ var xMax = deMath.clamp(es3fMultisampleTests.max4(p0[0], p1[0], p2[0], p3[0]), 0, img.getWidth() - 1);
        /** @type {number} */ var yMax = deMath.clamp(es3fMultisampleTests.max4(p0[1], p1[1], p2[1], p3[1]), 0, img.getHeight() - 1);
        /** @type {boolean} */ var insideEncountered = false; //!< Whether we have already seen at least one pixel inside the region.
        /** @type {tcuRGBA.RGBA} */ var insideColor; //!< Color of the first pixel inside the region.

        for (var y = yMin; y <= yMax; y++)
        for (var x = xMin; x <= xMax; x++) {
            if (es3fMultisampleTests.isInsideQuad([x, y], p0, p1, p2, p3)) {
                /** @type {tcuRGBA.RGBA} */ var pixColor = img.getPixel(x, y);

                if (insideEncountered)
                    if (!tcuRGA.compareThreshold(pixColor, insideColor, tcuRGBA.newRGBAComponents(3, 3, 3, 3))) // Pixel color differs from already-detected color inside same region - region not unicolored.
                        return false;
                else {
                    insideEncountered = true;
                    insideColor = pixColor;
                }
            }
        }

        return true;
    };

    /**
     * @constructor
     * @extends {tcuTestCase.DeqpTest}
     */
    es3fMultisampleTests.MultisampleTests = function() {
        tcuTestCase.DeqpTest.call(this, '', '');
    };

    es3fMultisampleTests.MultisampleTests.prototype = Object.create(tcuTestCase.DeqpTest.prototype);

    /** Copy the constructor */
    es3fMultisampleTests.MultisampleTests.prototype.constructor = es3fMultisampleTests.MultisampleTests;

    /**
     * init
     */
    es3fMultisampleTests.MultisampleTests.prototype.init = function() {

    };

});
