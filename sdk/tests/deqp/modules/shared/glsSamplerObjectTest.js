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
    'framework/common/tcuTestCase',
    'framework/delibs/debase/deRandom',
    'framework/opengl/gluShaderProgram',
    'framework/common/tcuTexture',
    'framework/common/tcuSurface',
    'framework/common/tcuTextureUtil',
    'framework/common/tcuImageCompare',
    'framework/opengl/gluDrawUtil',
    'framework/opengl/gluTextureUtil'], function (
        tcuTestCase,
        deRandom,
        gluShaderProgram,
        tcuTexture,
        tcuSurface,
        tcuTextureUtil,
        tcuImageCompare,
        gluDrawUtil,
        gluTextureUtil) {
    'use strict';

    var GLU_EXPECT_NO_ERROR = function(errorNumber, message) {
            if (errorNumber != gl.NO_ERROR) throw new Error(message);
    };

    var DE_ASSERT = function(expression) {
        if (!expression) throw new Error('Assert failed');
    };

    // TextureSamplerTest

    /** @const @type {number} */ var VIEWPORT_WIDTH = 128;
    /** @const @type {number} */ var VIEWPORT_HEIGHT = 128;

    /** @const @type {number} */ var TEXTURE2D_WIDTH = 32;
    /** @const @type {number} */ var TEXTURE2D_HEIGHT = 32;

    /** @const @type {number} */ var TEXTURE3D_WIDTH = 32;
    /** @const @type {number} */ var TEXTURE3D_HEIGHT = 32;
    /** @const @type {number} */ var TEXTURE3D_DEPTH = 32;

    /** @const @type {number} */ var CUBEMAP_SIZE = 32;

    /**
     * @struct
     */
    var SamplingState = function() {
        /** @type {GLenum} */ this.minFilter;
        /** @type {GLenum} */ this.magFilter;
        /** @type {GLenum} */ this.wrapT;
        /** @type {GLenum} */ this.wrapS;
        /** @type {GLenum} */ this.wrapR;
        /** @type {GLfloat} */ this.minLod;
        /** @type {GLfloat} */ this.maxLod;
    };

    /**
     * @struct
     */
    var TestSpec = function() {
        /** @type {string} */ this.name;
        /** @type {string} */ this.desc;
        /** @type {GLenum} */ this.target;
        /** @type {SamplingState} */ this.textureState;
        /** @type {SamplingState} */ this.textureState2; // merging TST and MTST structs
        /** @type {SamplingState} */ this.samplerState;
    };

    /**
     * @constructor
     * @const @param {TestSpec} spec
     */
    var TextureSamplerTest = function(spec) {
        tcuTestCase.DeqpTest.call(this, spec.name, spec.desc);
        /** @type {gluShaderProgram.ShaderProgram} */ this.m_program = null;
        /** @type {GLenum} */ this.m_target = spec.target;
        /** @type {SamplingState} */ this.m_textureState = spec.textureState;
        /** @type {SamplingState} */ this.m_samplerState = spec.samplerState;
        /** @type {deRandom.Random} */ this.m_random = deRandom.deStringHash(spec.name);
    };

    /**
     * @private
     * @param {tcuSurface.Surface} textureRef
     * @param {tcuSurface.Surface} samplerRef
     * @param {number} x
     * @param {number} y
     */
    TextureSamplerTest.prototype.renderReferences = function(textureRef, samplerRef, x, y) {

    };

    /**
     * @private
     * @param {tcuSurface.Surface} textureResult
     * @param {tcuSurface.Surface} samplerResult
     * @param {number} x
     * @param {number} y
     */
    TextureSamplerTest.prototype.renderResults = function(textureResult, samplerResult, x, y) {
        /** @param {number} */ var texture	= this.createTexture(this.m_target);
        /** @param {number} */ var sampler	= -1;

        gl.viewport(x, y, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glViewport(x, y, VIEWPORT_WIDTH, VIEWPORT_HEIGHT)');

        gl.genSamplers(1, sampler);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glGenSamplers(1, &sampler)');
        TCU_CHECK(sampler != -1);

        gl.bindSampler(0, sampler);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glBindSampler(0, sampler)');

        // First set sampler state
        this.setSamplerState(this.m_samplerState, sampler);

        // Set texture state
        gl.bindTexture(this.m_target, texture);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glBindTexture(m_target, texture)');

        this.setTextureState(this.m_target, this.m_textureState);
        // TODO: readPixels()
        // Render using sampler
        this.render();
        glu::readPixels(m_renderCtx, x, y, samplerResult.getAccess());

        // Render without sampler
        gl.bindSampler(0, 0);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glBindSampler(0, 0)');

        this.render();
        glu::readPixels(m_renderCtx, x, y, textureResult.getAccess());

        gl.deleteSamplers(1, sampler);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glDeleteSamplers(1, &sampler)');
        gl.deleteTextures(1, texture);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glDeleteTextures(1, &texture)');
    };

    /**
     * @private
     */
    TextureSamplerTest.prototype.render = function() {
        /** @param {number} */ var samplerLoc = -1;
        /** @param {number} */ var scaleLoc = -1;

        gl.useProgram(this.m_program.getProgram());
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glUseProgram(m_program->getProgram())');

        samplerLoc = gl.getUniformLocation(this.m_program.getProgram(), 'u_sampler');
        TCU_CHECK(samplerLoc != -1);

        scaleLoc = gl.getUniformLocation(this.m_program.getProgram(), 'u_posScale');
        TCU_CHECK(scaleLoc != -1);

        gl.clearColor(0.5, 0.5, 0.5, 1.0);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glClearColor(0.5f, 0.5f, 0.5f, 1.0f)');

        gl.clear(gl.COLOR_BUFFER_BIT);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glClear(GL_COLOR_BUFFER_BIT)');

        gl.uniform1i(samplerLoc, 0);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glUniform1i(samplerLoc, 0)');

        gl.uniform1f(scaleLoc, 1.0);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glUniform1f(scaleLoc, 1.0f)');

        switch (this.m_target)
        {
            case gl.TEXTURE_2D:
            {
                //TODO: implement gluDrawUtil.VertexArrayBinding constructor for BindingPoint, VertexArrayPointer
                /** @type {Array.<gluDrawUtil.VertexArrayBinding>} */ var vertexArrays =
                [
                    new gluDrawUtil.VertexArrayBinding(new gluDrawUtil.BindingPoint('a_position'),
                                                       new gluDrawUtil.VertexArrayPointer(gluDrawUtil.VertexComponentType.VTX_COMP_FLOAT,
                                                                                          gluDrawUtil.VertexComponentConversion.VTX_COMP_CONVERT_NONE,
                                                                                          2,
                                                                                          6,
                                                                                          0,
                                                                                          s_positions))
                ];
                // TODO: draw()
                glu::draw(m_renderCtx, this.m_program.getProgram(), vertexArrays.length, vertexArrays, gluDrawUtil.PrimitiveList(gluDrawUtil.primitiveType.TRIANGLES, 6));

                gl.uniform1f(scaleLoc, 0.25);
                GLU_EXPECT_NO_ERROR(gl.getError(), 'glUniform1f(scaleLoc, 0.25f)');

                glu::draw(m_renderCtx, this.m_program.getProgram(), vertexArrays.length, vertexArrays, gluDrawUtil.PrimitiveList(gluDrawUtil.primitiveType.TRIANGLES, 6));

                break;
            }

            case gl.TEXTURE_3D:
            {
                /** @type {Array.<gluDrawUtil.VertexArrayBinding>} */ var vertexArrays =
                [
                    new gluDrawUtil.VertexArrayBinding(new gluDrawUtil.BindingPoint('a_position'),
                                                       new gluDrawUtil.VertexArrayPointer(gluDrawUtil.VertexComponentType.VTX_COMP_FLOAT,
                                                                                          gluDrawUtil.VertexComponentConversion.VTX_COMP_CONVERT_NONE,
                                                                                          3,
                                                                                          6,
                                                                                          0,
                                                                                          s_positions3D))
                ];
                // TODO: draw()
                glu::draw(m_renderCtx, this.m_program.getProgram(), vertexArrays.length, vertexArrays, gluDrawUtil.PrimitiveList(gluDrawUtil.primitiveType.TRIANGLES, 6));

                gl.uniform1f(scaleLoc, 0.25);
                GLU_EXPECT_NO_ERROR(gl.getError(), 'glUniform1f(scaleLoc, 0.25f)');

                glu::draw(m_renderCtx, this.m_program.getProgram(), vertexArrays.length, vertexArrays, gluDrawUtil.PrimitiveList(gluDrawUtil.primitiveType.TRIANGLES, 6));

                break;
            }

            case gl.TEXTURE_CUBE_MAP:
            {
                /** @type {Array.<gluDrawUtil.VertexArrayBinding>} */ var vertexArrays =
                [
                    new gluDrawUtil.VertexArrayBinding(new gluDrawUtil.BindingPoint('a_position'),
                                                       new gluDrawUtil.VertexArrayPointer(gluDrawUtil.VertexComponentType.VTX_COMP_FLOAT,
                                                                                          gluDrawUtil.VertexComponentConversion.VTX_COMP_CONVERT_NONE,
                                                                                          4,
                                                                                          6,
                                                                                          0,
                                                                                          s_positionsCube))
                ];
                //TODO: draw()
                glu::draw(m_renderCtx, this.m_program.getProgram(), vertexArrays.length, vertexArrays, gluDrawUtil.PrimitiveList(gluDrawUtil.primitiveType.TRIANGLES, 6));

                gl.uniform1f(scaleLoc, 0.25);
                GLU_EXPECT_NO_ERROR(gl.getError(), 'glUniform1f(scaleLoc, 0.25f)');

                glu::draw(m_renderCtx, this.m_program.getProgram(), vertexArrays.length, vertexArrays, gluDrawUtil.PrimitiveList(gluDrawUtil.primitiveType.TRIANGLES, 6));

                break;
            }

            default:
                DE_ASSERT(false);
        }
    };

    /**
     * @private
     * @param {GLenum} target
     * @param {SamplingState} state
     */
    TextureSamplerTest.setTextureState = function(target, state) {
        gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, state.minFilter);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glTexParameteri(target, GL_TEXTURE_MIN_FILTER, state.minFilter)');
        gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, state.magFilter);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glTexParameteri(target, GL_TEXTURE_MAG_FILTER, state.magFilter)');
        gl.texParameteri(target, gl.TEXTURE_WRAP_S, state.wrapS);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glTexParameteri(target, GL_TEXTURE_WRAP_S, state.wrapS)');
        gl.texParameteri(target, gl.TEXTURE_WRAP_T, state.wrapT);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glTexParameteri(target, GL_TEXTURE_WRAP_T, state.wrapT)');
        gl.texParameteri(target, gl.TEXTURE_WRAP_R, state.wrapR);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glTexParameteri(target, GL_TEXTURE_WRAP_R, state.wrapR)');
        gl.texParameterf(target, gl.TEXTURE_MAX_LOD, state.maxLod);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glTexParameterf(target, GL_TEXTURE_MAX_LOD, state.maxLod)');
        gl.texParameterf(target, gl.TEXTURE_MIN_LOD, state.minLod);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glTexParameterf(target, GL_TEXTURE_MIN_LOD, state.minLod)');
    };

    /**
     * @private
     * @param {SamplingState} state
     * @param {number} sampler
     */
    TextureSamplerTest.setSamplerState = function(state, sampler) {
        gl.samplerParameteri(sampler, gl.TEXTURE_MIN_FILTER, state.minFilter);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glSamplerParameteri(sampler, GL_TEXTURE_MIN_FILTER, state.minFilter)');
        gl.samplerParameteri(sampler, gl.TEXTURE_MAG_FILTER, state.magFilter);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glSamplerParameteri(sampler, GL_TEXTURE_MAG_FILTER, state.magFilter)');
        gl.samplerParameteri(sampler, gl.TEXTURE_WRAP_S, state.wrapS);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glSamplerParameteri(sampler, GL_TEXTURE_WRAP_S, state.wrapS)');
        gl.samplerParameteri(sampler, gl.TEXTURE_WRAP_T, state.wrapT);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glSamplerParameteri(sampler, GL_TEXTURE_WRAP_T, state.wrapT)');
        gl.samplerParameteri(sampler, gl.TEXTURE_WRAP_R, state.wrapR);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glSamplerParameteri(sampler, GL_TEXTURE_WRAP_R, state.wrapR)');
        gl.samplerParameterf(sampler, gl.TEXTURE_MAX_LOD, state.maxLod);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glSamplerParameterf(sampler, GL_TEXTURE_MAX_LOD, state.maxLod)');
        gl.samplerParameterf(sampler, gl.TEXTURE_MIN_LOD, state.minLod);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glSamplerParameterf(sampler, GL_TEXTURE_MIN_LOD, state.minLod)');
    };

    /**
     * @private
     * @return {number}
     */
    TextureSamplerTest.createTexture2D = function() {
        /** @type {number} */ var texture = -1;
        /** @type {tcuTexture.Texture2D} */ var refTexture = new tcuTexture.Texture2D(
                                                                new tcuTexture.TextureFormat(tcuTexture.ChannelOrder.RGBA,
                                                                                             tcuTexture.ChannelType.UNORM_INT8),
                                                                TEXTURE2D_WIDTH,
                                                                TEXTURE2D_HEIGHT);

        refTexture.allocLevel(0);
        tcuTextureUtil.fillWithComponentGradients(refTexture.getLevel(0), [0.0, 0.0, 0.0, 0.0], [1.0, 1.0, 1.0, 1.0]);

        gl.genTextures(1, texture);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glGenTextures(1, &texture)');

        gl.bindTexture(gl.TEXTURE_2D, texture);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glBindTexture(GL_TEXTURE_2D, texture)');

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, refTexture.getWidth(), refTexture.getHeight(), 0, gl.RGBA, gl.UNSIGNED_BYTE, refTexture.getLevel(0).getDataPtr());
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA8, refTexture.getWidth(), refTexture.getHeight(), 0, GL_RGBA, GL_UNSIGNED_BYTE, refTexture.getLevel(0).getDataPtr())');

        gl.generateMipmap(gl.TEXTURE_2D);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glGenerateMipmap(GL_TEXTURE_2D)');

        gl.bindTexture(gl.TEXTURE_2D, 0);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glBindTexture(GL_TEXTURE_2D, texture)');

        return texture;
    };

    /**
     * @private
     * @return {number}
     */
    TextureSamplerTest.createTexture3D = function() {
        /** @type {number} */ var texture = -1;
        /** @type {tcuTexture.Texture3D} */ var refTexture	= new tcuTexture.Texture3D(
                                                                 new tcuTexture.TextureFormat(tcuTexture.ChannelOrder.RGBA,
                                                                                              tcuTexture.ChannelType.UNORM_INT8),
                                                                 TEXTURE3D_WIDTH,
                                                                 TEXTURE3D_HEIGHT,
                                                                 TEXTURE3D_DEPTH);

        refTexture.allocLevel(0);
        tcuTextureUtil.fillWithComponentGradients(refTexture.getLevel(0), [0.0, 0.0, 0.0, 0.0], [1.0, 1.0, 1.0, 1.0]);

        gl.genTextures(1, texture);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glGenTextures(1, &texture)');

        gl.bindTexture(gl.TEXTURE_3D, texture);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glBindTexture(GL_TEXTURE_3D, texture)');

        gl.texImage3D(gl.TEXTURE_3D, 0, gl.RGBA8, refTexture.getWidth(), refTexture.getHeight(), refTexture.getDepth(), 0, gl.RGBA, gl.UNSIGNED_BYTE, refTexture.getLevel(0).getDataPtr());
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glTexImage3D(GL_TEXTURE_3D, 0, GL_RGBA8, refTexture.getWidth(), refTexture.getHeight(), refTexture.getDepth(), 0, GL_RGBA, GL_UNSIGNED_BYTE, refTexture.getLevel(0).getDataPtr())');

        gl.generateMipmap(gl.TEXTURE_3D);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glGenerateMipmap(GL_TEXTURE_3D)');

        gl.bindTexture(gl.TEXTURE_3D, 0);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glBindTexture(GL_TEXTURE_3D, 0)');

        return texture;
    };

    /**
     * @private
     * @return {number}
     */
    TextureSamplerTest.createTextureCube = function() {
        /** @type {number} */ var texture = -1;
        /** @type {tcuTexture.TextureCube} */ var refTexture = new tcuTexture.TextureCube(
                                                                  new tcuTexture.TextureFormat(tcuTexture.ChannelOrder.RGBA,
                                                                                               tcuTexture.ChannelType.UNORM_INT8),
                                                                  CUBEMAP_SIZE);

        refTexture.allocLevel(tcuTexture.CubeFace.CUBEFACE_POSITIVE_X, 0);
        refTexture.allocLevel(tcuTexture.CubeFace.CUBEFACE_POSITIVE_Y, 0);
        refTexture.allocLevel(tcuTexture.CubeFace.CUBEFACE_POSITIVE_Z, 0);
        refTexture.allocLevel(tcuTexture.CubeFace.CUBEFACE_NEGATIVE_X, 0);
        refTexture.allocLevel(tcuTexture.CubeFace.CUBEFACE_NEGATIVE_Y, 0);
        refTexture.allocLevel(tcuTexture.CubeFace.CUBEFACE_NEGATIVE_Z, 0);

        tcuTextureUtil.fillWithComponentGradients(refTexture.getLevelFace(0, tcuTexture.CubeFace.CUBEFACE_POSITIVE_X), [0.0, 0.0, 0.0, 0.0], [1.0, 1.0, 1.0, 1.0]);
        tcuTextureUtil.fillWithComponentGradients(refTexture.getLevelFace(0, tcuTexture.CubeFace.CUBEFACE_POSITIVE_Y), [0.0, 0.0, 0.0, 0.0], [1.0, 1.0, 1.0, 1.0]);
        tcuTextureUtil.fillWithComponentGradients(refTexture.getLevelFace(0, tcuTexture.CubeFace.CUBEFACE_POSITIVE_Z), [0.0, 0.0, 0.0, 0.0], [1.0, 1.0, 1.0, 1.0]);
        tcuTextureUtil.fillWithComponentGradients(refTexture.getLevelFace(0, tcuTexture.CubeFace.CUBEFACE_NEGATIVE_X), [0.0, 0.0, 0.0, 0.0], [1.0, 1.0, 1.0, 1.0]);
        tcuTextureUtil.fillWithComponentGradients(refTexture.getLevelFace(0, tcuTexture.CubeFace.CUBEFACE_NEGATIVE_Y), [0.0, 0.0, 0.0, 0.0], [1.0, 1.0, 1.0, 1.0]);
        tcuTextureUtil.fillWithComponentGradients(refTexture.getLevelFace(0, tcuTexture.CubeFace.CUBEFACE_NEGATIVE_Z), [0.0, 0.0, 0.0, 0.0], [1.0, 1.0, 1.0, 1.0]);

        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glBindTexture(GL_TEXTURE_CUBE_MAP, texture)');

        for (var face = 0; face < Objects.keys(tcuTexture.CubeFace).length; face++)
        {
            /** @const @type {number} */ var target = gluTextureUtil.getGLCubeFace(face);
            gl.texImage2D(target, 0, gl.RGBA8, refTexture.getSize(), refTexture.getSize(), 0, gl.RGBA, gl.UNSIGNED_BYTE, refTexture.getLevelFace(0, face).getDataPtr());
        }
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glTexImage2D(GL_TEXTURE_CUBE_MAP_...) failed');

        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glGenerateMipmap(GL_TEXTURE_CUBE_MAP)');
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, 0);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glBindTexture(GL_TEXTURE_CUBE_MAP, texture)');

        return texture;
    };

    /**
     * @private
     * @param {GLenum} target
     * @return {number}
     */
    TextureSamplerTest.createTexture = function(target) {
        switch (target)
        {
            case gl.TEXTURE_2D:
                return this.createTexture2D(gl);

            case gl.TEXTURE_3D:
                return this.createTexture3D(gl);

            case gl.TEXTURE_CUBE_MAP:
                return this.createTextureCube(gl);

            default:
                DE_ASSERT(false);
                return -1;
        }
    };

    /**
     * @private
     * @param {GLenum} target
     * @return {string}
     */
     TextureSamplerTest.selectVertexShader = function(target) {
         switch (target)
         {
             case gl.TEXTURE_2D:
                 return
                 '#version 300 es\n' +
                 'in highp vec2 a_position;\n' +
                 'uniform highp float u_posScale;\n' +
                 'out mediump vec2 v_texCoord;\n' +
                 'void main (void)\n' +
                 '{\n' +
                 '\tv_texCoord = a_position;\n' +
                 '\tgl_Position = vec4(u_posScale * a_position, 0.0, 1.0);\n' +
                 '}';

             case gl.TEXTURE_3D:
                 return
                 '#version 300 es\n' +
                 'in highp vec3 a_position;\n' +
                 'uniform highp float u_posScale;\n' +
                 'out mediump vec3 v_texCoord;\n' +
                 'void main (void)\n' +
                 '{\n' +
                 '\tv_texCoord = a_position;\n' +
                 '\tgl_Position = vec4(u_posScale * a_position.xy, 0.0, 1.0);\n' +
                 '}';

             case gl.TEXTURE_CUBE_MAP:
                 return
                 '#version 300 es\n' +
                 'in highp vec4 a_position;\n' +
                 'uniform highp float u_posScale;\n' +
                 'out mediump vec2 v_texCoord;\n' +
                 'void main (void)\n' +
                 '{\n' +
                 '\tv_texCoord = a_position.zw;\n' +
                 '\tgl_Position = vec4(u_posScale * a_position.xy, 0.0, 1.0);\n' +
                 '}';

             default:
                 DE_ASSERT(false);
                 return null;
         }
     };

     /**
      * @private
      * @param {GLenum} target
      * @return {string}
      */
     TextureSamplerTest.selectFragmentShader = function(target) {
         switch (target)
         {
             case gl.TEXTURE_2D:
                 return
                 '#version 300 es\nlayout(location = 0) out mediump vec4 o_color;\n' +
                 'uniform lowp sampler2D u_sampler;\n' +
                 'in mediump vec2 v_texCoord;\n' +
                 'void main (void)\n' +
                 '{\n' +
                 '\to_color = texture(u_sampler, v_texCoord);\n' +
                 '}';

             case gl.TEXTURE_3D:
                 return
                 '#version 300 es\nlayout(location = 0) out mediump vec4 o_color;\n' +
                 'uniform lowp sampler3D u_sampler;\n' +
                 'in mediump vec3 v_texCoord;\n' +
                 'void main (void)\n' +
                 '{\n' +
                 '\to_color = texture(u_sampler, v_texCoord);\n' +
                 '}';

             case gl.TEXTURE_CUBE_MAP:
                 return
                 '#version 300 es\nlayout(location = 0) out mediump vec4 o_color;\n' +
                 'uniform lowp samplerCube u_sampler;\n' +
                 'in mediump vec2 v_texCoord;\n' +
                 'void main (void)\n' +
                 '{\n' +
                 '\to_color = texture(u_sampler, vec3(cos(3.14 * v_texCoord.y) * sin(3.14 * v_texCoord.x), sin(3.14 * v_texCoord.y), cos(3.14 * v_texCoord.y) * cos(3.14 * v_texCoord.x)));\n' +
                 '}';

             default:
                 DE_ASSERT(false);
                 return null;
         }
     };


    TextureSamplerTest.prototype.init = function() {
        /** @cons @type {string} */ var vertexShader = this.selectVertexShader(this.m_target);
        /** @cons @type {string} */ var fragmentShader = this.selectFragmentShader(this.m_target);

        DE_ASSERT(!this.m_program);
        m_program = new gluShaderProgram.ShaderProgram(gl,
                                                       gluShaderProgram.makeVtxFragSources(
                                                           vertexShaderTemplate,
                                                           fragmentShaderTemplate));

        if (!this.m_program->isOk())
        {
            // tcu::TestLog& log = m_testCtx.getLog();
            // log << *m_program;
            TCU_FAIL("Failed to compile shaders");
        }
    };

    TextureSamplerTest.prototype.iterate = function() {
        //tcu::TestLog&	log = m_testCtx.getLog();

        /** @type {tcuSurface.Surface} */ var textureRef = new tcuSurface.Surface(VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
        /** @type {tcuSurface.Surface} */ var samplerRef = new tcuSurface.Surface(VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

        /** @type {tcuSurface.Surface} */ var textureResult = new tcuSurface.Surface(VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
        /** @type {tcuSurface.Surface} */ var samplerResult = new tcuSurface.Surface(VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

        /** @type {number} */ var x = this.m_random.getInt(0, gl.drawingBufferWidth - VIEWPORT_WIDTH);
        /** @type {number} */ var y = this.m_random.getInt(0, gl.drawingBufferHeight - VIEWPORT_HEIGHT);

        this.renderReferences(textureRef, samplerRef, x, y);
        this.renderResults(textureResult, samplerResult, x, y);

        /** @type {boolean} */ var isOk = tcuImageCompare.pixelThresholdCompare ("Sampler render result", "Result from rendering with sampler", samplerRef, samplerResult, [0, 0, 0, 0], /*tcu::COMPARE_LOG_RESULT*/ null);

        if (!tcuImageCompare.pixelThresholdCompare ("Texture render result", "Result from rendering with texture state", textureRef, textureResult, [0, 0, 0, 0], /*tcu::COMPARE_LOG_RESULT*/ null))
            isOk = false;

        assertMsgOptions(isOk, '', true, false);

        return tcuTestCase.runner.IterateResult.STOP;
    };

    // MultiTextureSamplerTest

    /**
     * @constructor
     * @const @param {TestSpec} spec
     */
    var MultiTextureSamplerTest = function(spec) {
        tcuTestCase.DeqpTest.call(this, spec.name, spec.desc);
        /** @type {gluShaderProgram.ShaderProgram} */ this.m_program = null;
        /** @type {GLenum} */ this.m_target = spec.target;
        /** @type {SamplingState} */ this.m_textureState1 = spec.textureState;
        /** @type {SamplingState} */ this.m_textureState2 = spec.textureState2;
        /** @type {SamplingState} */ this.m_samplerState = spec.samplerState;
        /** @type {deRandom.Random} */ this.m_random = deRandom.deStringHash(spec.name);
    };

    MultiTextureSamplerTest.prototype.init = function() {
        /** @type {string} */ var vertexShaderTemplate	= selectVertexShader(this.m_target);
        /** @type {string} */ var fragmentShaderTemplate	= selectFragmentShader(this.m_target);

        DE_ASSERT(!this.m_program);
        this.m_program = new gluShaderProgram.ShaderProgram(this,
                                                            gluShaderProgram.makeVtxFragSources(
                                                                vertexShaderTemplate,
                                                                fragmentShaderTemplate));
        if (!this.m_program.isOk())
        {
            // tcu::TestLog& log = m_testCtx.getLog();
            //
            // log << *m_program;
            TCU_FAIL("Failed to compile shaders");
        }
    };

    MultiTextureSamplerTest.prototype.iterate = function() {
        //tcu::TestLog&	log = m_testCtx.getLog();

        /** @type {tcuSurface.Surface} */ var textureRef = new tcuSurface.Surface(VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
        /** @type {tcuSurface.Surface} */ var samplerRef = new tcuSurface.Surface(VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

        /** @type {tcuSurface.Surface} */ var textureResult = new tcuSurface.Surface(VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
        /** @type {tcuSurface.Surface} */ var samplerResult = new tcuSurface.Surface(VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

        /** @type {number} */ var x = this.m_random.getInt(0, gl.drawingBufferWidth - VIEWPORT_WIDTH);
        /** @type {number} */ var y = this.m_random.getInt(0, gl.drawingBufferHeight - VIEWPORT_HEIGHT);

        this-renderReferences(textureRef, samplerRef, x, y);
        this.renderResults(textureResult, samplerResult, x, y);

        /** @type {boolean} */ var isOk = tcuImageCompare.pixelThresholdCompare ("Sampler render result", "Result from rendering with sampler", samplerRef, samplerResult, [0, 0, 0, 0], /*tcu::COMPARE_LOG_RESULT*/ null);

        if (!tcuImageCompare.pixelThresholdCompare ("Texture render result", "Result from rendering with texture state", textureRef, textureResult, [0, 0, 0, 0], /*tcu::COMPARE_LOG_RESULT*/ null))
            isOk = false;

        assertMsgOptions(isOk, '', true, false);

        return tcuTestCase.runner.IterateResult.STOP;
    };

    /**
     * @private
     * @param {tcuSurface.Surface} textureRef
     * @param {tcuSurface.Surface} samplerRef
     * @param {number} x
     * @param {number} y
     */
    MultiTextureSamplerTest.prototype.renderReferences = function(textureRef, samplerRef, x, y) {
        /** @type {number} */ var texture1 = this.createTexture(this.m_target, 0);
        /** @type {number} */ var texture2 = this.createTexture(this.m_target, 1);

        gl.viewport(x, y, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
        GLU_EXPECT_NO_ERROR(gl.getError(), "glViewport(x, y, VIEWPORT_WIDTH, VIEWPORT_HEIGHT)");

        // Generate texture rendering reference
        gl.activeTexture(gl.TEXTURE0);
        GLU_EXPECT_NO_ERROR(gl.getError(), "glActiveTexture(GL_TEXTURE0)");
        gl.bindTexture(this.m_target, texture1);
        GLU_EXPECT_NO_ERROR(gl.getError(), "glBindTexture(m_target, texture1)");
        this.setTextureState(this.m_target, this.m_textureState1);

        gl.activeTexture(gl.TEXTURE1);
        GLU_EXPECT_NO_ERROR(gl.getError(), "glActiveTexture(GL_TEXTURE1)");
        gl.bindTexture(this.m_target, texture2);
        GLU_EXPECT_NO_ERROR(gl.getError(), "glBindTexture(m_target, texture2)");
        this.setTextureState(this.m_target, this.m_textureState2);

        // TODO: readPixels()
        this.render();
        glu::readPixels(m_renderCtx, x, y, textureRef.getAccess());

        // Generate sampler rendering reference
        gl.activeTexture(gl.TEXTURE0);
        GLU_EXPECT_NO_ERROR(gl.getError(), "glActiveTexture(GL_TEXTURE0)");
        gl.bindTexture(this.m_target, texture1);
        GLU_EXPECT_NO_ERROR(gl.getError(), "glBindTexture(m_target, texture1)");
        this.setTextureState(this.m_target, this.m_samplerState);

        gl.activeTexture(gl.TEXTURE1);
        GLU_EXPECT_NO_ERROR(gl.getError(), "glActiveTexture(GL_TEXTURE1)");
        gl.bindTexture(this.m_target, texture2);
        GLU_EXPECT_NO_ERROR(gl.getError(), "glBindTexture(m_target, texture2)");
        setTextureState(this.m_target, this.m_samplerState);

        render();
        glu::readPixels(m_renderCtx, x, y, samplerRef.getAccess());
    };

    /**
     * @private
     * @param {tcuSurface.Surface} textureResult
     * @param {tcuSurface.Surface} samplerResult
     * @param {number} x
     * @param {number} y
     */
    MultiTextureSamplerTest.prototype.renderResults = function(textureResult, samplerResult, x, y) {
        /** @type {number} */ var texture1 = this.createTexture(this.m_target, 0);
        /** @type {number} */ var texture2 = this.createTexture(this.m_target, 1);
        /** @type {number} */ var sampler = -1;

        gl.viewport(x, y, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
        GLU_EXPECT_NO_ERROR(gl.getError(), "glViewport(x, y, VIEWPORT_WIDTH, VIEWPORT_HEIGHT)");

        gl.genSamplers(1, sampler);
        GLU_EXPECT_NO_ERROR(gl.getError(), "glGenSamplers(1, &sampler)");
        TCU_CHECK(sampler != -1);

        gl.bindSampler(0, sampler);
        GLU_EXPECT_NO_ERROR(gl.getError(), "glBindSampler(0, sampler)");
        gl.bindSampler(1, sampler);
        GLU_EXPECT_NO_ERROR(gl.getError(), "glBindSampler(1, sampler)");

        // First set sampler state
        this.setSamplerState(this.m_samplerState, sampler);

        // Set texture state
        gl.bindTexture(this.m_target, texture1);
        GLU_EXPECT_NO_ERROR(gl.getError(), "glBindTexture(m_target, texture1)");
        this.setTextureState(this.m_target, this.m_textureState1);

        gl.bindTexture(this.m_target, texture2);
        GLU_EXPECT_NO_ERROR(gl.getError(), "glBindTexture(m_target, texture2)");
        this.setTextureState(this. m_target, this.m_textureState2);

        gl.activeTexture(gl.TEXTURE0);
        GLU_EXPECT_NO_ERROR(gl.getError(), "glActiveTexture(GL_TEXTURE0)");
        gl.bindTexture(this.m_target, texture1);
        GLU_EXPECT_NO_ERROR(gl.getError(), "glBindTexture(m_target, texture1)");

        gl.activeTexture(gl.TEXTURE1);
        GLU_EXPECT_NO_ERROR(gl.getError(), "glActiveTexture(GL_TEXTURE1)");
        gl.bindTexture(this.m_target, texture2);
        GLU_EXPECT_NO_ERROR(gl.getError(), "glBindTexture(m_target, texture2)");

        // Render using sampler
        // TODO: readPixels()
        this.render();
        glu::readPixels(m_renderCtx, x, y, samplerResult.getAccess());

        gl.bindSampler(0, 0);
        GLU_EXPECT_NO_ERROR(gl.getError(), "glBindSampler(0, 0)");
        gl.bindSampler(1, 0);
        GLU_EXPECT_NO_ERROR(gl.getError(), "glBindSampler(1, 0)");

        this.render();
        glu::readPixels(m_renderCtx, x, y, textureResult.getAccess());

        gl.activeTexture(gl.TEXTURE0);
        GLU_EXPECT_NO_ERROR(gl.getError(), "glActiveTexture(GL_TEXTURE0)");
        gl.bindTexture(this.m_target, 0);
        GLU_EXPECT_NO_ERROR(gl.getError(), "glBindTexture(m_target, 0)");

        gl.activeTexture(gl.TEXTURE1);
        GLU_EXPECT_NO_ERROR(gl.getError(), "glActiveTexture(GL_TEXTURE1)");
        gl.bindTexture(this.m_target, 0);
        GLU_EXPECT_NO_ERROR(gl.getError(), "glBindTexture(m_target, 0)");

        gl.deleteSamplers(1, sampler);
        GLU_EXPECT_NO_ERROR(gl.getError(), "glDeleteSamplers(1, &sampler)");
        gl.deleteTextures(1, texture1);
        GLU_EXPECT_NO_ERROR(gl.getError(), "glDeleteTextures(1, &texture1)");
        gl.deleteTextures(1, texture2);
        GLU_EXPECT_NO_ERROR(gl.getError(), "glDeleteTextures(1, &texture2)");
    };

    MultiTextureSamplerTest.prototype.render = function() {
        /** @type {number} */ var samplerLoc1	= -1;
        /** @type {number} */ var samplerLoc2	= -1;
        /** @type {number} */ var scaleLoc	= -1;

        gl.useProgram(this.m_program.getProgram());
        GLU_EXPECT_NO_ERROR(gl.getError(), "glUseProgram(m_program->getProgram())");

        samplerLoc1 = gl.getUniformLocation(this.m_program.getProgram(), "u_sampler1");
        TCU_CHECK(samplerLoc1 != -1);

        samplerLoc2 = gl.getUniformLocation(this.m_program.getProgram(), "u_sampler2");
        TCU_CHECK(samplerLoc2 != -1);

        scaleLoc = glGetUniformLocation(this.m_program.getProgram(), "u_posScale");
        TCU_CHECK(scaleLoc != -1);

        gl.clearColor(0.5, 0.5, 0.5, 1.0);
        GLU_EXPECT_NO_ERROR(gl.getError(), "glClearColor(0.5f, 0.5f, 0.5f, 1.0f)");

        gl.clear(gl.COLOR_BUFFER_BIT);
        GLU_EXPECT_NO_ERROR(gl.getError(), "glClear(GL_COLOR_BUFFER_BIT)");

        gl.uniform1i(samplerLoc1, 0);
        GLU_EXPECT_NO_ERROR(gl.getError(), "glUniform1i(samplerLoc1, 0)");

        gl.uniform1i(samplerLoc2, 1);
        GLU_EXPECT_NO_ERROR(gl.getError(), "glUniform1i(samplerLoc2, 1)");

        gl.uniform1f(scaleLoc, 1.0);
        GLU_EXPECT_NO_ERROR(gl.getError(), "glUniform1f(scaleLoc, 1.0f)");

        switch (this.m_target)
        {
            case gl.TEXTURE_2D:
            {
                //TODO: VertexArrayBinding, VertexArrayPointer, PrimitiveList, draw
                glu::VertexArrayBinding vertexArrays[] =
                {
                    glu::VertexArrayBinding(glu::BindingPoint("a_position"), glu::VertexArrayPointer(glu::VTX_COMP_FLOAT, glu::VTX_COMP_CONVERT_NONE, 2, 6, 0, s_positions))
                };

                glu::draw(m_renderCtx, this.m_program.getProgram(), vertexArrays.length, vertexArrays, glu::PrimitiveList(glu::PRIMITIVETYPE_TRIANGLES, 6));

                gl.uniform1f(scaleLoc, 0.25f);
                GLU_EXPECT_NO_ERROR(gl.getError(), "glUniform1f(scaleLoc, 0.25f)");

                glu::draw(m_renderCtx, this.m_program.getProgram(), vertexArrays.length, vertexArrays, glu::PrimitiveList(glu::PRIMITIVETYPE_TRIANGLES, 6));

                break;
            }

            case gl.TEXTURE_3D:
            {
                glu::VertexArrayBinding vertexArrays[] =
                {
                    glu::VertexArrayBinding(glu::BindingPoint("a_position"), glu::VertexArrayPointer(glu::VTX_COMP_FLOAT, glu::VTX_COMP_CONVERT_NONE, 3, 6, 0, s_positions3D))
                };

                glu::draw(m_renderCtx, this.m_program.getProgram(), vertexArrays.length, vertexArrays, glu::PrimitiveList(glu::PRIMITIVETYPE_TRIANGLES, 6));

                gl.uniform1f(scaleLoc, 0.25f);
                GLU_EXPECT_NO_ERROR(gl.getError(), "glUniform1f(scaleLoc, 0.25f)");

                glu::draw(m_renderCtx, this.m_program.getProgram(), vertexArrays.length, vertexArrays, glu::PrimitiveList(glu::PRIMITIVETYPE_TRIANGLES, 6));

                break;
            }

            case gl.TEXTURE_CUBE_MAP:
            {
                glu::VertexArrayBinding vertexArrays[] =
                {
                    glu::VertexArrayBinding(glu::BindingPoint("a_position"), glu::VertexArrayPointer(glu::VTX_COMP_FLOAT, glu::VTX_COMP_CONVERT_NONE, 4, 6, 0, s_positionsCube))
                };

                glu::draw(m_renderCtx, this.m_program.getProgram(), vertexArrays.length, vertexArrays, glu::PrimitiveList(glu::PRIMITIVETYPE_TRIANGLES, 6));

                gl.uniform1f(scaleLoc, 0.25f);
                GLU_EXPECT_NO_ERROR(gl.getError(), "glUniform1f(scaleLoc, 0.25f)");

                glu::draw(m_renderCtx, this.m_program.getProgram(), vertexArrays.length, vertexArrays, glu::PrimitiveList(glu::PRIMITIVETYPE_TRIANGLES, 6));

                break;
            }

            default:
                DE_ASSERT(false);
        }

    };

    /**
     * @private
     * @param {GLenum} target
     * @param {SamplingState} state
     */
    MultiTextureSamplerTest.setTextureState = function(target, state) {
        gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, state.minFilter);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glTexParameteri(target, GL_TEXTURE_MIN_FILTER, state.minFilter)');
        gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, state.magFilter);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glTexParameteri(target, GL_TEXTURE_MAG_FILTER, state.magFilter)');
        gl.texParameteri(target, gl.TEXTURE_WRAP_S, state.wrapS);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glTexParameteri(target, GL_TEXTURE_WRAP_S, state.wrapS)');
        gl.texParameteri(target, gl.TEXTURE_WRAP_T, state.wrapT);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glTexParameteri(target, GL_TEXTURE_WRAP_T, state.wrapT)');
        gl.texParameteri(target, gl.TEXTURE_WRAP_R, state.wrapR);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glTexParameteri(target, GL_TEXTURE_WRAP_R, state.wrapR)');
        gl.texParameterf(target, gl.TEXTURE_MAX_LOD, state.maxLod);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glTexParameterf(target, GL_TEXTURE_MAX_LOD, state.maxLod)');
        gl.texParameterf(target, gl.TEXTURE_MIN_LOD, state.minLod);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glTexParameterf(target, GL_TEXTURE_MIN_LOD, state.minLod)');
    };

    /**
     * @private
     * @param {SamplingState} state
     * @param {number} sampler
     */
    MultiTextureSamplerTest.setSamplerState = function(state, sampler) {
        gl.samplerParameteri(sampler, gl.TEXTURE_MIN_FILTER, state.minFilter);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glSamplerParameteri(sampler, GL_TEXTURE_MIN_FILTER, state.minFilter)');
        gl.samplerParameteri(sampler, gl.TEXTURE_MAG_FILTER, state.magFilter);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glSamplerParameteri(sampler, GL_TEXTURE_MAG_FILTER, state.magFilter)');
        gl.samplerParameteri(sampler, gl.TEXTURE_WRAP_S, state.wrapS);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glSamplerParameteri(sampler, GL_TEXTURE_WRAP_S, state.wrapS)');
        gl.samplerParameteri(sampler, gl.TEXTURE_WRAP_T, state.wrapT);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glSamplerParameteri(sampler, GL_TEXTURE_WRAP_T, state.wrapT)');
        gl.samplerParameteri(sampler, gl.TEXTURE_WRAP_R, state.wrapR);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glSamplerParameteri(sampler, GL_TEXTURE_WRAP_R, state.wrapR)');
        gl.samplerParameterf(sampler, gl.TEXTURE_MAX_LOD, state.maxLod);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glSamplerParameterf(sampler, GL_TEXTURE_MAX_LOD, state.maxLod)');
        gl.samplerParameterf(sampler, gl.TEXTURE_MIN_LOD, state.minLod);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glSamplerParameterf(sampler, GL_TEXTURE_MIN_LOD, state.minLod)');
    };

    /**
     * @private
     * @param {number} id
     * @return {number}
     */
    MultiTextureSamplerTest.createTexture2D = function(id) {
        /** @param {number} */ var texture = -1;
        /** @param {tcuTexture.Texture2D} */ var refTexture = new tcuTexture.Texture2D(
                                                                 new tcuTexture.TextureFormat(tcuTexture.ChannelOrder.RGBA,
                                                                                              tcuTexture.ChannelType.UNORM_INT8),
                                                                 TEXTURE2D_WIDTH,
                                                                 TEXTURE2D_HEIGHT);

        refTexture.allocLevel(0);

        gl.genTextures(1, texture);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glGenTextures(1, &texture)');

        switch (id)
        {
            case 0:
                tcuTextureUtil.fillWithComponentGradients(refTexture.getLevel(0), [0.0, 0.0, 0.0, 0.0], [1.0, 1.0, 0.5, 0.5]);
                break;

            case 1:
                tcuTextureUtil.fillWithComponentGradients(refTexture.getLevel(0), [0.0, 0.0, 0.0, 0.0], [0.5, 0.5, 1.0, 1.0]);
                break;

            default:
                DE_ASSERT(false);
        }

        gl.bindTexture(gl.TEXTURE_2D, texture);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glBindTexture(GL_TEXTURE_2D, texture)');

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, refTexture.getWidth(), refTexture.getHeight(), 0, gl.RGBA, gl.UNSIGNED_BYTE, refTexture.getLevel(0).getDataPtr());
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA8, refTexture.getWidth(), refTexture.getHeight(), 0, GL_RGBA, GL_UNSIGNED_BYTE, refTexture.getLevel(0).getDataPtr())');

        gl.generateMipmap(gl.TEXTURE_2D);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glGenerateMipmap(GL_TEXTURE_2D)');

        gl.bindTexture(gl.TEXTURE_2D, 0);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glBindTexture(GL_TEXTURE_2D, 0)');

        return texture;
    };


    /**
     * @private
     * @param {number} id
     * @return {number}
     */
    MultiTextureSamplerTest.createTexture3D = function(id) {
        /** @param {number} */ var texture = -1;
        /** @param {tcuTexture.Texture3D} */ var refTexture	= new tcuTexture.Texture3D(
                                                                 new tcuTexture.TextureFormat(tcuTexture.ChannelOrder.RGBA,
                                                                                              tcuTexture.ChannelType.UNORM_INT8),
                                                                 TEXTURE3D_WIDTH,
                                                                 TEXTURE3D_HEIGHT,
                                                                 TEXTURE3D_DEPTH);

        refTexture.allocLevel(0);

        gl.genTextures(1, texture);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glGenTextures(1, &texture)');

        switch (id)
        {
            case 0:
                tcuTextureUtil.fillWithComponentGradients(refTexture.getLevel(0), [0.0, 0.0, 0.0, 0.0], [1.0, 1.0, 0.5, 0.5]);
                break;

            case 1:
                tcuTextureUtil.fillWithComponentGradients(refTexture.getLevel(0), [0.0, 0.0, 0.0, 0.0], [0.5, 0.5, 1.0, 1.0]);
                break;

            default:
                DE_ASSERT(false);
        }

        gl.bindTexture(gl.TEXTURE_3D, texture);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glBindTexture(GL_TEXTURE_3D, texture)');

        gl.texImage3D(gl.TEXTURE_3D, 0, gl.RGBA8, refTexture.getWidth(), refTexture.getHeight(), refTexture.getDepth(), 0, gl.RGBA, gl.UNSIGNED_BYTE, refTexture.getLevel(0).getDataPtr());
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glTexImage3D(GL_TEXTURE_3D, 0, GL_RGBA8, refTexture.getWidth(), refTexture.getHeight(), refTexture.getDepth(), 0, GL_RGBA, GL_UNSIGNED_BYTE, refTexture.getLevel(0).getDataPtr())');

        gl.generateMipmap(gl.TEXTURE_3D);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glGenerateMipmap(GL_TEXTURE_3D)');

        gl.bindTexture(gl.TEXTURE_3D, 0);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glBindTexture(GL_TEXTURE_3D, 0)');

        return texture;
    };

    /**
     * @private
     * @param {number} id
     * @return {number}
     */
    MultiTextureSamplerTest.createTextureCube = function(id) {
        /** @param {number} */ var texture = -1;

        /** @param {tcuTexture.TextureCube} */ var refTexture	= new tcuTexture.TextureCube(
                                                                     new tcuTexture.TextureFormat(tcuTexture.ChannelOrder.RGBA,
                                                                                                  tcuTexture.ChannelType.UNORM_INT8),
                                                                     CUBEMAP_SIZE);

        gl.genTextures(1, texture);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glGenTextures(1, &texture)');

        refTexture.allocLevel(tcuTexture.CubeFace.CUBEFACE_POSITIVE_X, 0);
        refTexture.allocLevel(tcuTexture.CubeFace.CUBEFACE_POSITIVE_Y, 0);
        refTexture.allocLevel(tcuTexture.CubeFace.CUBEFACE_POSITIVE_Z, 0);
        refTexture.allocLevel(tcuTexture.CubeFace.CUBEFACE_NEGATIVE_X, 0);
        refTexture.allocLevel(tcuTexture.CubeFace.CUBEFACE_NEGATIVE_Y, 0);
        refTexture.allocLevel(tcuTexture.CubeFace.CUBEFACE_NEGATIVE_Z, 0);

        switch (id)
        {
            case 0:
                tcuTextureUtil.fillWithComponentGradients(refTexture.getLevelFace(0, tcuTexture.CubeFace.CUBEFACE_POSITIVE_X), [0.0, 0.0, 0.0, 0.0], [0.5, 0.5, 0.5, 0.5]);
                tcuTextureUtil.fillWithComponentGradients(refTexture.getLevelFace(0, tcuTexture.CubeFace.CUBEFACE_POSITIVE_Y), [0.0, 0.0, 0.0, 0.0], [0.5, 0.5, 0.5, 0.5]);
                tcuTextureUtil.fillWithComponentGradients(refTexture.getLevelFace(0, tcuTexture.CubeFace.CUBEFACE_POSITIVE_Z), [0.0, 0.0, 0.0, 0.0], [0.5, 0.5, 0.5, 0.5]);
                tcuTextureUtil.fillWithComponentGradients(refTexture.getLevelFace(0, tcuTexture.CubeFace.CUBEFACE_NEGATIVE_X), [0.0, 0.0, 0.0, 0.0], [0.5, 0.5, 0.5, 0.5]);
                tcuTextureUtil.fillWithComponentGradients(refTexture.getLevelFace(0, tcuTexture.CubeFace.CUBEFACE_NEGATIVE_Y), [0.0, 0.0, 0.0, 0.0], [0.5, 0.5, 0.5, 0.5]);
                tcuTextureUtil.fillWithComponentGradients(refTexture.getLevelFace(0, tcuTexture.CubeFace.CUBEFACE_NEGATIVE_Z), [0.0, 0.0, 0.0, 0.0], [0.5, 0.5, 0.5, 0.5]);
                break;

            case 1:
                tcuTextureUtil.fillWithComponentGradients(refTexture.getLevelFace(0, tcuTexture.CubeFace.CUBEFACE_POSITIVE_X), [0.5, 0.5, 0.5, 0.5], [1.0, 1.0, 1.0, 1.0]);
                tcuTextureUtil.fillWithComponentGradients(refTexture.getLevelFace(0, tcuTexture.CubeFace.CUBEFACE_POSITIVE_Y), [0.5, 0.5, 0.5, 0.5], [1.0, 1.0, 1.0, 1.0]);
                tcuTextureUtil.fillWithComponentGradients(refTexture.getLevelFace(0, tcuTexture.CubeFace.CUBEFACE_POSITIVE_Z), [0.5, 0.5, 0.5, 0.5], [1.0, 1.0, 1.0, 1.0]);
                tcuTextureUtil.fillWithComponentGradients(refTexture.getLevelFace(0, tcuTexture.CubeFace.CUBEFACE_NEGATIVE_X), [0.5, 0.5, 0.5, 0.5], [1.0, 1.0, 1.0, 1.0]);
                tcuTextureUtil.fillWithComponentGradients(refTexture.getLevelFace(0, tcuTexture.CubeFace.CUBEFACE_NEGATIVE_Y), [0.5, 0.5, 0.5, 0.5], [1.0, 1.0, 1.0, 1.0]);
                tcuTextureUtil.fillWithComponentGradients(refTexture.getLevelFace(0, tcuTexture.CubeFace.CUBEFACE_NEGATIVE_Z), [0.5, 0.5, 0.5, 0.5], [1.0, 1.0, 1.0, 1.0]);
                break;

            default:
                DE_ASSERT(false);
        }

        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glBindTexture(GL_TEXTURE_CUBE_MAP, texture)');

        for (var face = 0; face < Object.keys(tcuTexture.CubeFace).length; face++)
        {
            /** @const @type {number} */ var target = gluTextureUtil.getGLCubeFace(face);
            gl.texImage2D(target, 0, gl.RGBA8, refTexture.getSize(), refTexture.getSize(), 0, gl.RGBA, gl.UNSIGNED_BYTE, refTexture.getLevelFace(0, face).getDataPtr());
        }
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glTexImage2D(GL_TEXTURE_CUBE_MAP_...) failed');

        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glGenerateMipmap(GL_TEXTURE_CUBE_MAP)');
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, 0);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glBindTexture(GL_TEXTURE_CUBE_MAP, 0)');

        return texture;
    };

    /**
     * @private
     * @param {GLenum} target
     * @param {number} id
     * @return {number}
     */
    MultiTextureSamplerTest.createTexture = function(target, id) {
        switch (target)
        {
            case gl.TEXTURE_2D:
                return this.createTexture2D(gl, id);

            case gl.TEXTURE_3D:
                return this.createTexture3D(gl, id);

            case gl.TEXTURE_CUBE_MAP:
                return this.createTextureCube(gl, id);

            default:
                DE_ASSERT(false);
                return -1;
        }
    };

    /**
     * @private
     * @param {GLenum} target
     * @return {string}
     */
    MultiTextureSamplerTest.selectVertexShader = function(target) {
        switch (target)
            {
                case gl.TEXTURE_2D:
                    return
                    '#version 300 es\n' +
                    'in highp vec2 a_position;\n' +
                    'uniform highp float u_posScale;\n' +
                    'out mediump vec2 v_texCoord;\n' +
                    'void main (void)\n' +
                    '{\n' +
                    '\tv_texCoord = a_position;\n' +
                    '\tgl_Position = vec4(u_posScale * a_position, 0.0, 1.0);\n' +
                    '}';

                case gl.TEXTURE_3D:
                    return
                    '#version 300 es\n' +
                    'in highp vec3 a_position;\n' +
                    'uniform highp float u_posScale;\n' +
                    'out mediump vec3 v_texCoord;\n' +
                    'void main (void)\n' +
                    '{\n' +
                    '\tv_texCoord = a_position;\n' +
                    '\tgl_Position = vec4(u_posScale * a_position.xy, 0.0, 1.0);\n' +
                    '}';

                case gl.TEXTURE_CUBE_MAP:
                    return
                    '#version 300 es\n' +
                    'in highp vec4 a_position;\n' +
                    'uniform highp float u_posScale;\n' +
                    'out mediump vec2 v_texCoord;\n' +
                    'void main (void)\n' +
                    '{\n' +
                    '\tv_texCoord = a_position.zw;\n' +
                    '\tgl_Position = vec4(u_posScale * a_position.xy, 0.0, 1.0);\n' +
                    '}';

                default:
                    DE_ASSERT(false);
                    return null;
            }
    };

    /**
     * @private
     * @param {GLenum} target
     * @return {string}
     */
    MultiTextureSamplerTest.selectFragmentShader = function(target) {
        switch (target)
            {
                case gl.TEXTURE_2D:
                    return
                    '#version 300 es\nlayout(location = 0) out mediump vec4 o_color;\n' +
                    'uniform lowp sampler2D u_sampler1;\n' +
                    'uniform lowp sampler2D u_sampler2;\n' +
                    'in mediump vec2 v_texCoord;\n' +
                    'void main (void)\n' +
                    '{\n' +
                    '\to_color = vec4(0.75, 0.75, 0.75, 1.0) * (texture(u_sampler1, v_texCoord) + texture(u_sampler2, v_texCoord));\n' +
                    '}';

                    break;

                case gl.TEXTURE_3D:
                    return
                    '#version 300 es\nlayout(location = 0) out mediump vec4 o_color;\n' +
                    'uniform lowp sampler3D u_sampler1;\n' +
                    'uniform lowp sampler3D u_sampler2;\n' +
                    'in mediump vec3 v_texCoord;\n' +
                    'void main (void)\n' +
                    '{\n' +
                    '\to_color = vec4(0.75, 0.75, 0.75, 1.0) * (texture(u_sampler1, v_texCoord) + texture(u_sampler2, v_texCoord));\n' +
                    '}';

                case gl.TEXTURE_CUBE_MAP:
                    return
                    '#version 300 es\nlayout(location = 0) out mediump vec4 o_color;\n' +
                    'uniform lowp samplerCube u_sampler1;\n' +
                    'uniform lowp samplerCube u_sampler2;\n' +
                    'in mediump vec2 v_texCoord;\n' +
                    'void main (void)\n' +
                    '{\n' +
                    '\to_color = vec4(0.5, 0.5, 0.5, 1.0) * (texture(u_sampler1, vec3(cos(3.14 * v_texCoord.y) * sin(3.14 * v_texCoord.x), sin(3.14 * v_texCoord.y), cos(3.14 * v_texCoord.y) * cos(3.14 * v_texCoord.x)))' +
                    '+ texture(u_sampler2, vec3(cos(3.14 * v_texCoord.y) * sin(3.14 * v_texCoord.x), sin(3.14 * v_texCoord.y), cos(3.14 * v_texCoord.y) * cos(3.14 * v_texCoord.x))));\n' +
                    '}';

                default:
                    DE_ASSERT(false);
                    return null;
            }
    };


    return {
        TextureSamplerTest: TextureSamplerTest,
        MultiTextureSamplerTest: MultiTextureSamplerTest
    };
});
