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

define(['framework/delibs/debase/deMath'], function(deMath) {
    'use strict';

    var DE_ASSERT = function(x) {
        if (!x)
            throw new Error('Assert failed');
    };

    /**
     * class RGBA
     * @constructor
     */
    var RGBA = function() {
        /** @type {Uint32Array} */ this.m_value = new Uint32Array(4);
    };

    /**
     * @enum Shift
     * In JS, these are not shift values, but positions in a typed array
     */
    RGBA.Shift = {
        RED: 0,
        GREEN: 1,
        BLUE: 2,
        ALPHA: 3
    };

    /**
     * @enum Mask used as flags
     * Hopefully will not use typed arrays
     */
    RGBA.Mask = function() {
        return {
            RED: false,
            GREEN: false,
            BLUE: false,
            ALPHA: false
        };
    };

    /**
     * Builds an RGBA object from color components
     * @param {number} r
     * @param {number} g
     * @param {number} b
     * @param {number} a
     * @return {RGBA}
     */
    var newRGBAComponents = function(r, g, b, a) {
        /** @type {RGBA} */ var rgba = new RGBA();
        DE_ASSERT(deMath.deInRange32(r, 0, 255));
        DE_ASSERT(deMath.deInRange32(g, 0, 255));
        DE_ASSERT(deMath.deInRange32(b, 0, 255));
        DE_ASSERT(deMath.deInRange32(a, 0, 255));

        var result = new Uint8Array(4);
        result[RGBA.Shift.RED] = r;
        result[RGBA.Shift.GREEN] = g;
        result[RGBA.Shift.BLUE] = b;
        result[RGBA.Shift.ALPHA] = a;

        rgba.m_value = new Uint32Array(result);

        return rgba;
    };

    /**
     * Builds an RGBA object from a 32 bit value
     * @param {deMath.deUint32} val
     * @return {RGBA}
     */
    var newRGBAValue = function(val) {
        /** @type {RGBA} */ var rgba = new RGBA();
        rgba.m_value = new Uint32Array([val]);

        return rgba;
    };

    /**
     * Builds an RGBA object from a number array
     * @param {Array.<number>} v
     * @return {RGBA}
     */
    var newRGBAFromArray = function(v) {
        /** @type {RGBA} */ var rgba = new RGBA();
        var result = new Uint8Array(v);

        rgba.m_value = new Uint32Array(result);

        return rgba;
    };

    /**
     * @param {number} v
     */
    RGBA.prototype.setRed = function(v) { DE_ASSERT(deMath.deInRange32(v, 0, 255)); this.m_value[RGBA.Shift.RED] = v; };

    /**
     * @param {number} v
     */
    RGBA.prototype.setGreen = function(v) { DE_ASSERT(deMath.deInRange32(v, 0, 255)); this.m_value[RGBA.Shift.GREEN] = v; };

    /**
     * @param {number} v
     */
    RGBA.prototype.setBlue = function(v) { DE_ASSERT(deMath.deInRange32(v, 0, 255)); this.m_value[RGBA.Shift.BLUE] = v; };

    /**
     * @param {number} v
     */
    RGBA.prototype.setAlpha = function(v) { DE_ASSERT(deMath.deInRange32(v, 0, 255)); this.m_value[RGBA.Shift.ALPHA] = v; };

    /**
     * @return {number}
     */
    RGBA.prototype.getRed = function() { return this.m_value[RGBA.Shift.RED]; };

    /**
     * @return {number}
     */
    RGBA.prototype.getGreen = function() { return this.m_value[RGBA.Shift.GREEN]; };

    /**
     * @return {number}
     */
    RGBA.prototype.getBlue = function() { return this.m_value[RGBA.Shift.BLUE]; };

    /**
     * @return {number}
     */
    RGBA.prototype.getAlpha = function() { return this.m_value[RGBA.Shift.ALPHA]; };

    /**
     * @return {deMath.deUint32}
     */
    RGBA.prototype.getPacked = function() { return this.m_value[0]; };

    /**
     * @param {RGBA} thr
     * @return {boolean}
     */
    RGBA.prototype.isBelowThreshold = function(thr) { return (this.getRed() <= thr.getRed()) && (this.getGreen() <= thr.getGreen()) && (this.getBlue() <= thr.getBlue()) && (this.getAlpha() <= thr.getAlpha()); };

    /**
     * @param {Uint8Array} bytes
     * @return {RGBA}
     */
    RGBA.fromBytes = function(bytes)  { return newRGBAFromArray(bytes); };

    /**
     * @param {Uint8Array} bytes
     */
    RGBA.prototype.toBytes = function(bytes) { var result = new Uint8Array(this.m_value); bytes[0] = result[0]; bytes[1] = result[1]; bytes[2] = result[2]; bytes[3] = result[3]; };

    /**
     * @return {Array.<number>}
     */
    RGBA.prototype.toVec = function() {
        return [
            this.getRed() / 255.0,
            this.getGreen() / 255.0,
            this.getBlue() / 255.0,
            this.getAlpha() / 255.0
        ];
    };

    /**
     * @return {Array.<number>}
     */
    RGBA.prototype.toVec = function() {
        return [
            this.getRed(),
            this.getGreen(),
            this.getBlue(),
            this.getAlpha()
        ];
    };

    /**
     * @param {RGBA} v
     * @return {boolean}
     */
    RGBA.prototype.equals = function(v) {
        return (
            this.m_value[0] == v.m_value[0] &&
            this.m_value[1] == v.m_value[1] &&
            this.m_value[2] == v.m_value[2] &&
            this.m_value[3] == v.m_value[3]
        );
    };

    /**
     * @param {RGBA} a
     * @param {RGBA} b
     * @param {RGBA} threshold
     * @return {boolean}
     */
    var compareThreshold = function(a, b, threshold) {
        if (a.equals(b)) return true; // Quick-accept
        return computeAbsDiff(a, b).isBelowThreshold(threshold);
    };

    /**
     * @param {RGBA} a
     * @param {RGBA} b
     * @return {boolean}
     */
    var computeAbsDiff = function(a, b) {
        return newRGBAComponents(
            Math.abs(a.getRed() - b.getRed()),
            Math.abs(a.getGreen() - b.getGreen()),
            Math.abs(a.getBlue() - b.getBlue()),
            Math.abs(a.getAlpha() - b.getAlpha())
        );
    };

    // Color constants
    RGBA.red = new RGBA(0xFF, 0, 0, 0xFF);
    RGBA.green = new RGBA(0, 0xFF, 0, 0xFF);
    RGBA.blue = new RGBA(0, 0, 0xFF, 0xFF);
    RGBA.gray = new RGBA(0x80, 0x80, 0x80, 0xFF);
    RGBA.white = new RGBA(0xFF, 0xFF, 0xFF, 0xFF);
    RGBA.black = new RGBA(0, 0, 0, 0xFF);

    return {
        RGBA: RGBA,
        newRGBAComponents: newRGBAComponents,
        newRGBAValue: newRGBAValue,
        newRGBAFromArray: newRGBAFromArray,
        compareThreshold: compareThreshold,
        computeAbsDiff: computeAbsDiff
    };
});
