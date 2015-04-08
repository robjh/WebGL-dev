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

define([
    'framework/delibs/debase/deMath',
    'framework/referencerenderer/rrDefs',
    'framework/referencerenderer/rrFragmentPacket',
    'framework/referencerenderer/rrGenericVector'],
    function (
        deMath,
        rrDefs,
        rrFragmentPacket,
        rrGenericVector) {
    'use strict';

    var DE_ASSERT = function(x) {
        if (!x)
            throw new Error('Assert failed');
    };

    var DE_NULL = null;

    /**
     * Fragment shading context
     *
     * Contains per-primitive information used in fragment shading
     * @constructor
     * @param {Array.<Array.<number>>} varying0 (GenericVec4*)
     * @param {Array.<Array.<number>>} varying1 (GenericVec4*)
     * @param {Array.<Array.<number>>} varying2 (GenericVec4*)
     * @param {Array.<number>} outputArray (GenericVec4*)
     * @param {Array.<number>} fragmentDepths (float*)
     * @param {number} numFragmentOutputs
     * @param {number} numSamples
     */
    var FragmentShadingContext = function (varying0, varying1, varying2, outputArray, fragmentDepths, numFragmentOutputs, numSamples) {
        /** @type {Array.<Array.<Array.<number>>>} (GenericVec4*) */ this.varyings = [varying0, varying1, varying2]; //!< Vertex shader outputs. Pointer will be NULL if there is no such vertex.
        /** @type {Array.<number>} (GenericVec4*) */ this.outputArray = outputArray; //!< Fragment output array
        /** @type {number} */ this.numFragmentOutputs = numFragmentOutputs; //!< Fragment output count
        /** @type {number} */ this.numSamples = numSamples; //!< Number of samples
        /** @type {Array.<number>} (float*) */ this.fragmentDepths = fragmentDepths; //!< Fragment packet depths. Pointer will be NULL if there is no depth buffer. Each sample has per-sample depth values
    };

    // Write output

    /**
     * writeFragmentOutput
     * @param {FragmentShadingContext} context
     * @param {number} packetNdx
     * @param {number} fragNdx
     * @param {number} outputNdx
     * @param {Object} value
     */
    var writeFragmentOutput = function (context, packetNdx, fragNdx, outputNdx, value) {
        DE_ASSERT(packetNdx >= 0);
        DE_ASSERT(fragNdx >= 0 && fragNdx < 4);
        DE_ASSERT(outputNdx >= 0 && outputNdx < context.numFragmentOutputs);

        context.outputArray[outputNdx + context.numFragmentOutputs * (fragNdx + packetNdx * 4)] = value;
    };

    // Read Varying

    /**
     * @param {rrFragmentPacket.FragmentPacket} packet
     * @param {FragmentShadingContext} context
     * @param {number} varyingLoc
     * @param {number} fragNdx
     * @return {Array.<number>} (Vector<T, 4>)
     */
    var readPointVarying = function (packet, context, varyingLoc, fragNdx) {
        //DE_UNREF(fragNdx);
        //DE_UNREF(packet);

        return context.varyings[0][varyingLoc];
    };

    /**
     * @param {rrFragmentPacket.FragmentPacket} packet
     * @param {FragmentShadingContext} context
     * @param {number} varyingLoc
     * @param {number} fragNdx
     * @return {Array.<number>} (Vector<T, 4>)
     */
    var readLineVarying = function (packet, context, varyingLoc, fragNdx) {
        return   packet.barycentric[0][fragNdx] * context.varyings[0][varyingLoc] +
            packet.barycentric[1][fragNdx] * context.varyings[1][varyingLoc];
    };

    /**
     * @param {rrFragmentPacket.FragmentPacket} packet
     * @param {FragmentShadingContext} context
     * @param {number} varyingLoc
     * @param {number} fragNdx
     * @return {Array.<number>} (Vector<T, 4>)
     */
    var readTriangleVarying = function (packet, context, varyingLoc, fragNdx) {
        return   packet.barycentric[0][fragNdx] * context.varyings[0][varyingLoc] +
            packet.barycentric[1][fragNdx] * context.varyings[1][varyingLoc] +
            packet.barycentric[2][fragNdx] * context.varyings[2][varyingLoc];
    };

    /**
     * @param {rrFragmentPacket.FragmentPacket} packet
     * @param {FragmentShadingContext} context
     * @param {number} varyingLoc
     * @param {number} fragNdx
     * @return {Array.<number>} (Vector<T, 4>)
     */
    var readVarying = function (packet, context, varyingLoc, fragNdx) {
        if (context.varyings[1] == DE_NULL) return readPointVarying(packet, context, varyingLoc, fragNdx);
        if (context.varyings[2] == DE_NULL) return readLineVarying(packet, context, varyingLoc, fragNdx);
        return readTriangleVarying(packet, context, varyingLoc, fragNdx);
    };

    // Derivative

    /**
     * dFdxLocal
     * @param {Array.<Array.<number>>} outFragmentdFdx
     * @param {Array.<Array.<number>>} func
     */
    var dFdxLocal = function (outFragmentdFdx, func) {
        /** @type {Array.<Array.<number>>} */ var dFdx = [
            deMath.subtract(func[1], func[0]),
            deMath.subtract(func[3], func[2])
        ];

        outFragmentdFdx[0] = deMath.assign(dFdx[0]);
        outFragmentdFdx[1] = deMath.assign(dFdx[0]);
        outFragmentdFdx[2] = deMath.assign(dFdx[1]);
        outFragmentdFdx[3] = deMath.assign(dFdx[1]);
    };

    /**
     * dFdyLocal
     * @param {Array.<Array.<number>>} outFragmentdFdy
     * @param {Array.<Array.<number>>} func
     */
    var dFdyLocal = function (outFragmentdFdy, func) {
        /** @type {Array.<Array.<number>>} */ var dFdy = [
            deMath.subtract(func[2], func[0]),
            deMath.subtract(func[3], func[1])
        ];

        outFragmentdFdy[0] = deMath.assign(dFdy[0]);
        outFragmentdFdy[1] = deMath.assign(dFdy[1]);
        outFragmentdFdy[2] = deMath.assign(dFdy[0]);
        outFragmentdFdy[3] = deMath.assign(dFdy[1]);
    };

    /**
     * dFdxVarying
     * @param {Array.<Array.<number>>} outFragmentdFdx
     * @param {rrFragmentPacket.FragmentPacket} packet
     * @param {FragmentShadingContext} context
     * @param {number} varyingLoc
     */
    var dFdxVarying = function (outFragmentdFdx, packet, context, varyingLoc) {
        /** @type {Array.<Array.<number>>} */ var func = [
            readVarying(packet, context, varyingLoc, 0),
            readVarying(packet, context, varyingLoc, 1),
            readVarying(packet, context, varyingLoc, 2),
            readVarying(packet, context, varyingLoc, 3)
        ];

        dFdxLocal(outFragmentdFdx, func);
    };

    /**
     * dFdyVarying
     * @param {Array.<Array.<number>>} outFragmentdFdy
     * @param {rrFragmentPacket.FragmentPacket} packet
     * @param {FragmentShadingContext} context
     * @param {number} varyingLoc
     */
    var dFdyVarying = function (outFragmentdFdy, packet, context, varyingLoc) {
        /** @type {Array.<Array.<number>>} */ var func = [
            readVarying(packet, context, varyingLoc, 0),
            readVarying(packet, context, varyingLoc, 1),
            readVarying(packet, context, varyingLoc, 2),
            readVarying(packet, context, varyingLoc, 3)
        ];

        dFdyLocal(outFragmentdFdy, func);
    };

    // Fragent depth

    /**
     * readFragmentDepth
     * @param {FragmentShadingContext} context
     * @param {number} packetNdx
     * @param {number} fragNdx
     * @param {number} sampleNdx
     * @return {number}
     */
    var readFragmentDepth = function (context, packetNdx, fragNdx, sampleNdx) {
        // Reading or writing to fragment depth values while there is no depth buffer is legal but not supported by rr
        DE_ASSERT(context.fragmentDepths);
        return context.fragmentDepths[(packetNdx * 4 + fragNdx) * context.numSamples + sampleNdx];
    };

    /**
     * writeFragmentDepth
     * @param {FragmentShadingContext} context
     * @param {number} packetNdx
     * @param {number} fragNdx
     * @param {number} sampleNdx
     * @param {number} depthValue
     */
    var writeFragmentDepth = function (context, packetNdx, fragNdx, sampleNdx, depthValue) {
        // Reading or writing to fragment depth values while there is no depth buffer is legal but not supported by rr
        DE_ASSERT(context.fragmentDepths);
        context.fragmentDepths[(packetNdx * 4 + fragNdx) * context.numSamples + sampleNdx] = depthValue;
    };

});