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
    'framework/referencerenderer/rrShaders',
    'framework/referencerenderer/rrGenericVector',
    'framework/common/tcuTexture',
    'framework/delibs/debase/deMath',
    'framework/opengl/gluTextureUtil',
    'framework/opengl/gluShaderUtil',
    'framework/opengl/simplereference/sglrReferenceContext',
    'framework/common/tcuTextureUtil'],
    function(
        rrShaders,
        rrGenericVector,
        tcuTexture,
        deMath,
        gluTextureUtil,
        gluShaderUtil,
        sglrReferenceContext,
        tcuTextureUtil
    ) {

    var DE_ASSERT = function(x) {
        if (!x)
            throw new Error('Assert failed');
    };

    /**
     * VaryingFlags
     * @enum
     */
    var VaryingFlags = function() {
        this.NONE = true; //TODO: is NONE necessary?
        this.FLATSHADE = false;
    };

    /**
     * VertexAttribute
     * @constructor
     * @param {string} name_
     * @param {rrGenericVector.GenericVecType} type_
     */
    var VertexAttribute = function (name_, type_) {
        this.name = name_;
        this.type = type_;
    };

    /**
     * VertexToFragmentVarying
     * @constructor
     * @param {rrGenericVector.GenericVecType} type_
     */
    var VertexToFragmentVarying = function (type_, flags) {
        this.type = type_;
        this.flatshade = flags === undefined ? new VaryingFlags().FLATSHADE : flags.FLATSHADE;
    };

    /**
     * FragmentOutput
     * @constructor
     * @param {rrGenericVector.GenericVecType} type_
     */
    var FragmentOutput = function (type_) {
        this.type = type_;
    };

    /**
     * Uniform
     * @constructor
     * @param {string} name_
     * @param {gluShaderUtil.DataType} type_
     */
    var Uniform = function (name_, type_) {
        this.name = name_;
        this.type = type_;
    };

    /**
     * VertexSource
     * @constructor
     * @param {string} str
     */
    var VertexSource = function (str) {
        this.source = str;
    };

    /**
     * FragmentSource
     * @constructor
     * @param {string} str
     */
    var FragmentSource = function (str) {
        this.source = str;
    };

    /**
     * ShaderProgramDeclaration
     * @constructor
     */
    var ShaderProgramDeclaration = function () {
        /** @type {Array<VertexAttribute>} */ this.m_vertexAttributes = [];
        /** @type {Array<VertexToFragmentVarying>} */ this.m_vertexToFragmentVaryings = [];
        /** @type {Array<FragmentOutput>} */ this.m_fragmentOutputs = [];
        /** @type {Array<Uniform>} */ this.m_uniforms = [];
        /** @type {string} */ this.m_vertexSource;
        /** @type {string} */ this.m_fragmentSource;

        /** @type {boolean} */ this.m_vertexShaderSet = false;
        /** @type {boolean} */ this.m_fragmentShaderSet = false;
    };

    /**
     * Add a vertex attribute to the shader program declaration.
     * @param {VertexAttribute} v
     * @return {ShaderProgramDeclaration}
     */
    ShaderProgramDeclaration.prototype.pushVertexAttribute = function (v) {
        this.m_vertexAttributes.push(v);
        return this;
    };

    /**
     * Add a vertex to fragment varying to the shader program declaration.
     * @param {VertexToFragmentVarying} v
     * @return {ShaderProgramDeclaration}
     */
    ShaderProgramDeclaration.prototype.pushVertexToFragmentVarying = function (v) {
        this.m_vertexToFragmentVaryings.push(v);
        return this;
    };

    /**
     * Add a fragment output to the shader program declaration.
     * @param {FragmentOutput} v
     * @return {ShaderProgramDeclaration}
     */
    ShaderProgramDeclaration.prototype.pushFragmentOutput = function (v) {
        this.m_fragmentOutputs.push(v);
        return this;
    };

    /**
     * Add a uniform to the shader program declaration.
     * @param {Uniform} v
     * @return {ShaderProgramDeclaration}
     */
    ShaderProgramDeclaration.prototype.pushUniform = function (v) {
        this.m_uniforms.push(v);
        return this;
    };

    /**
     * @param {VertexSource} c
     */
    ShaderProgramDeclaration.prototype.pushVertexSource = function (c) {
        DE_ASSERT(!this.m_vertexShaderSet);
        this.m_vertexSource = c.source;
        this.m_vertexShaderSet = true;
        return this;
    };

    /**
     * @param {FragmentSource} c
     */
    ShaderProgramDeclaration.prototype.pushFragmentSource = function (c) {
        DE_ASSERT(!this.m_fragmentSource);
        this.m_fragmentSource = c.source;
        this.m_fragmentShaderSet = true;
        return this;
    };

    /**
     * @return {boolean}
     */
    ShaderProgramDeclaration.prototype.valid = function () {
        if (!this.m_vertexShaderSet || !this.m_fragmentShaderSet)
            return false;

        if (this.m_fragmentOutputs.length == 0)
            return false;

        return true;
    };

    /**
     * @return {number}
     */
    ShaderProgramDeclaration.prototype.getVertexInputCount = function () {
        return this.m_vertexAttributes.length;
    };

    /**
     * @return {number}
     */
    ShaderProgramDeclaration.prototype.getVertexOutputCount = function () {
        return this.m_vertexToFragmentVaryings.length;
    };

    /**
     * @return {number}
     */
    ShaderProgramDeclaration.prototype.getFragmentInputCount = function () {
        return this.m_vertexToFragmentVaryings.length;
    };

    /**
     * @return {number}
     */
    ShaderProgramDeclaration.prototype.getFragmentOutputCount = function () {
        return this.m_fragmentOutputs.length;
    };

    /**
     * UniformSlot
     */
    var UniformSlot = function () {
        /** @type {string} */ this.name = '';
        /** @type {gluShaderUtil.DataType} */ this.type = undefined;
        /** @type {number} */ this.value = '0';
        /** @type {sglrReferenceContext.Texture} */ this.sampler = DE_NULL;
    };

    /**
     * @constructor
     * @extends {rrShaders.VertexShader}
     * @extends {rrShaders.FragmentShader}
     * @param {ShaderProgramDeclaration} decl
     */
    var ShaderProgram = function (decl) {
        rrShaders.VertexShader.call(this, decl.getVertexInputCount(), decl.getVertexOutputCount());
        var current = this;
        this.VertexShader = {m_inputs: current.m_inputs, m_outputs: current.m_outputs};

        rrShaders.FragmentShader.call(this, decl.getFragmentInputCount(), decl.getFragmentOutputCount());
        current = this;
        this.FragmentShader = {m_inputs: current.m_inputs, m_outputs: current.m_outputs};

        /** @type {Array<string>} */ this.m_attributeNames = new Array(decl.getFragmentInputCount());
        /** @type {Array<UniformSlot>} */ this.m_uniforms = new Array(decl.m_uniforms.length);
        /** @type {string} */ this.m_vertSrc = decl.m_vertexSource;
        /** @type {string} */ this.m_fragSrc = decl.m_fragmentSource;

        DE_ASSERT(decl.valid());

        // Set up shader IO

        for (var ndx = 0; ndx < decl.m_vertexAttributes.length; ++ndx) {
            this.VertexShader.m_inputs[ndx].type  = decl.m_vertexAttributes[ndx].type;
            this.m_attributeNames[ndx] = decl.m_vertexAttributes[ndx].name;
        }

        for (var ndx = 0; ndx < decl.m_vertexToFragmentVaryings.length; ++ndx) {
            this.VertexShader.m_outputs[ndx].type = decl.m_vertexToFragmentVaryings[ndx].type;
            this.VertexShader.m_outputs[ndx].flatshade = decl.m_vertexToFragmentVaryings[ndx].flatshade;

            this.FragmentShader.m_inputs[ndx] = this.VertexShader.m_outputs[ndx];
        }

        for (var ndx = 0; ndx < decl.m_fragmentOutputs.length; ++ndx)
            this.FragmentShader.m_outputs[ndx].type = decl.m_fragmentOutputs[ndx].type;

        // Set up uniforms

        for (var ndx = 0; ndx < decl.m_uniforms.length; ++ndx)
            this.m_uniforms[ndx] = new Uniform(decl.m_uniforms[ndx].name, decl.m_uniforms[ndx].type);
    };

    ShaderProgram.prototype = Object.create(rrShaders.VertexShader.prototype);
    ShaderProgram.prototype = Object.create(rrShaders.FragmentShader.prototype);
    ShaderProgram.prototype.constructor = ShaderProgram;

    /**
     * @param {string} name
     * @return {UniformSlot}
     */
    ShaderProgram.prototype.getUniformByName = function (name) {
        DE_ASSERT(name);

        for (var ndx = 0; ndx < this.m_uniforms.length; ++ndx)
            if (this.m_uniforms[ndx].name == name)
                return this.m_uniforms[ndx];

        DE_ASSERT(!"Invalid uniform name, uniform not found.");
        return this.m_uniforms[0];
    };

    return {
        ShaderProgram: ShaderProgram,
        ShaderProgramDeclaration: ShaderProgramDeclaration,
        VertexAttribute: VertexAttribute,
        VertexToFragmentVarying: VertexToFragmentVarying,
        FragmentOutput: FragmentOutput,
        Uniform: Uniform,
        VertexSource: VertexSource,
        FragmentSource: FragmentSource
    };

});
