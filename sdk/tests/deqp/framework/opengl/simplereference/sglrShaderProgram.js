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
    'framework/opengl/simplereference/sglrReferenceContext'
    'framework/common/tcuTextureUtil'],
    function(
        rrShaders,
        rrGenericVector,
        tcuTexture,
        deMath,
        gluTextureUtil,
        gluShaderUtil,
        sglrReferenceContext
        tcuTextureUtil
    ) {

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
        this.flatshade = flags.FLATSHADE;
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
        /** @type {Array.<VertexAttribute>} */ this.m_vertexAttributes = [];
        /** @type {Array.<VertexToFragmentVarying>} */ this.m_vertexToFragmentVaryings = [];
        /** @type {Array.<FragmentOutput>} */ this.m_fragmentOutputs = [];
        /** @type {Array.<Uniform>} */ this.m_uniforms = [];
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
        return m_fragmentOutputs.length;
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
        rrShaders.FragmentShader.call(this, decl.getFragmentInputCount(), decl.getFragmentOutputCount());
        /** @type {Array.<string>} */ this.m_attributeNames = new Array(decl.getFragmentInputCount());
        /** @type {Array.<UniformSlot>} */ this.m_uniforms = new Array(decl.m_uniforms.length);
        /** @type {string} */ this.m_vertSrc = decl.m_vertexSource;
        /** @type {string} */ this.m_fragSrc = decl.m_fragmentSource;
    };



    /**
     * @param {string} name
     * @return {UniformSlot}
     */
    ShaderProgram.prototype.getUniformByName = function (name) {
        
    };

        inline const rr::VertexShader*          getVertexShader     (void) const { return static_cast<const rr::VertexShader*>(this);   }
        inline const rr::FragmentShader*        getFragmentShader   (void) const { return static_cast<const rr::FragmentShader*>(this); }
        inline const rr::GeometryShader*        getGeometryShader   (void) const { return static_cast<const rr::GeometryShader*>(this); }
        
    private:
        virtual void                            shadeVertices       (const rr::VertexAttrib* inputs, rr::VertexPacket* const* packets, const int numPackets) const = 0;
        virtual void                            shadeFragments      (rr::FragmentPacket* packets, const int numPackets, const rr::FragmentShadingContext& context) const = 0;
        virtual void                            shadePrimitives     (rr::GeometryEmitter& output, int verticesIn, const rr::PrimitivePacket* packets, const int numPackets, int invocationID) const;
        
        std::vector<std::string>                m_attributeNames;
    protected:
        std::vector<UniformSlot>                m_uniforms;
        
    private:
        const std::string                       m_vertSrc;
        const std::string                       m_fragSrc;
        const std::string                       m_geomSrc;
        const bool                              m_hasGeometryShader;
        
        friend class ReferenceContext;  // for uniform access
        friend class GLContext;         // for source string access
    };

    /**
    * ShaderProgram class
    * @constructor
    */
    var ShaderProgram = function () {
    };
});
