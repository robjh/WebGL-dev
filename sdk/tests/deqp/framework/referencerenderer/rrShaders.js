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
    'framework/common/tcuTexture',
    'framework/delibs/debase/deMath',
    'framework/referencerenderer/rrFragmentPacket',
    'framework/referencerenderer/rrGenericVector',
    'framework/referencerenderer/rrShadingContext',
    'framework/referencerenderer/rrVertexAttrib',
    'framework/referencerenderer/rrVertexPacket'],
    function(
        tcuTexture,
        deMath,
        rrFragmentPacket,
        rrGenericVector,
        rrShadingContext,
        rrVertexAttrib,
        rrVertexPacket) {

    /**
     * Vertex shader input information
     * @constructor
     */
    var VertexInputInfo = function () {
        /** @type {rrGenericVector.GenericVecType} */ this.type = undefined;
    };

    /**
     * Shader varying information
     * @constructor
     */
    var VertexVaryingInfo = function () {
        /** @type {rrGenericVector.GenericVecType} */ this.type = undefined;
        /** @type {boolean} */ var flatshade   = false;
    };

    var VertexOutputInfo = VertexVaryingInfo;
    var FragmentInputInfo = VertexVaryingInfo;

    /**
     * Fragment shader output information
     * @constructor
     */
    var FragmentOutputInfo = function () {
        //Sensible defaults
        /** @type {rrGenericVector.GenericVecType} */ this.type = undefined;
    };

    /**
     * Vertex shader interface
     *
     * Vertex shaders execute shading for set of vertex packets. See VertexPacket
     * documentation for more details on shading API.
     * @constructor
     * @param {number} numInputs
     * @param {number} numOutputs
     */
    var VertexShader = function (numInputs, numOutputs) {
        /** @type {Array.<VertexInputInfo> */ this.m_inputs = [];
        /** @type {Array.<VertexOutputInfo> */ this.m_outputs = [];
    };

    /**
     * shadeVertices - abstract function, to be implemented by children classes
     * @param {rrVertexAttrib.VertexAttrib} inputs
     * @param {rrVertexPacket.VertexPacket} inputs
     * @param {number} numPackets
     */
     VertexShader.prototype.shadeVertices = function(inputs, packets, numPackets) {
     };

     /**
      * getInputs
      * @return {Array.<VertexInputInfo>}
      */
     VertexShader.prototype.getInputs = function () {return this.m_inputs;};

     /**
      * getOutputs
      * @return {Array.<VertexOutputInfo>}
      */
    VertexShader.prototype.getOutputs = function () {return this.m_outputs;}

    /**
     * Fragment shader interface
     *
     * Fragment shader executes shading for list of fragment packets. See
     * FragmentPacket documentation for more details on shading API.
     * @constructor
     * @param {number} numInputs
     * @param {number} numOutputs
     */
    var FragmentShader = function (numInputs, numOutputs) {
        /** @type {Array.<FragmentInputInfo> */ this.m_inputs = [];
        /** @type {Array.<FragmentOutputInfo> */ this.m_outputs = [];
    };

    /**
     * shadeFragments - abstract function, to be implemented by children classes
     * @note numPackets must be greater than zero.
     * @param {Array.<rrFragmentPacket.FragmentPacket>} packets
     * @param {number} numPackets
     * @param {rrShadingContext.FragmentShadingContext} context
     */
    FragmentShader.prototype.shadeFragments = function(packets, numPackets, context) {};

    /**
     * getInputs
     * @return {Array.<FragmentInputInfo>}
     */
    FragmentShader.prototype.getInputs = function () {return this.m_inputs;};

    /**
     * getOutputs
     * @return {Array.<FragmentOutputInfo>}
     */
    FragmentShader.prototype.getOutputs = function () {return this.m_outputs;}

    // Helpers for shader implementations.

    /**
     * VertexShaderLoop
     * @constructor
     * @param {Object} shader
     */
    var VertexShaderLoop = function (shader) {
        VertexShader.call(this);
        this.m_shader = shader;
    };

    VertexShaderLoop.prototype = Object.create(VertexShader.prototype);
    VertexShaderLoop.prototype.constructor = VertexShaderLoop;

    /**
     * shadeVertices
     * @param {Array.<rrVertexAttrib.VertexAttrib>} inputs
     * @param {Array.<rrVertexPacket.VertexPacket>} packets
     * @param {number} numPackets
     * @param {Object} shader
     */
    VertexShaderLoop.prototype.shadeVertices = function (inputs, packets, numPackets, shader) {
        for (var ndx = 0; ndx < numPackets; ndx++)
            this.m_shader.shadeVertex(inputs, packets[ndx]);
    };

    /**
     * FragmentShaderLoop
     * @constructor
     * @param {Object} shader
     */
    var FragmentShaderLoop = function (shader) {
        FragmentShader.call(this);
        this.m_shader = shader;
    };

    /**
     * shadeFragments
     * @param {Array.<rrFragmentPacket>} packets
     * @param {number} numPackets
     * @param {Object} shader
     */
    FragmentShaderLoop.prototype.shadeFragments = function (packets, numPackets) {
        for (var ndx = 0; ndx < numPackets; ndx++)
            this.m_shader.shadeFragment(packets[ndx]);
    };

    return {
        VertexShader: VertexShader,
        FragmentShader: FragmentShader,
        VertexShaderLoop: VertexShaderLoop,
        FragmentShaderLoop: FragmentShaderLoop
    };
});