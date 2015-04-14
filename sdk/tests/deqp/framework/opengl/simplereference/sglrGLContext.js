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
    'framework/delibs/debase/deUtil',
    'framework/delibs/debase/deMath',
    'framework/common/tcuTextureUtil',
    'framework/common/tcuPixelFormat',
    'framework/opengl/gluShaderProgram',
    'framework/opengl/gluShaderUtil',
    'framework/opengl/gluTextureUtil',
    'framework/opengl/simplereference/sglrShaderProgram',
    'framework/referencerenderer/rrDefs',
    'framework/referencerenderer/rrMultisamplePixelBufferAccess',
    'framework/referencerenderer/rrRenderer',
    'framework/referencerenderer/rrRenderState',
    'framework/referencerenderer/rrVertexAttrib'
],
function(
    tcuTexture,
    deUtil,
    deMath,
    tcuTextureUtil,
    tcuPixelFormat,
    gluShaderProgram,
    gluShaderUtil,
    gluTextureUtil,
    sglrShaderProgram,
    rrDefs,
    rrMultisamplePixelBufferAccess,
    rrRenderer,
    rrRenderState,
    rrVertexAttrib
) {

    var DE_NULL = null;

    var GLU_EXPECT_NO_ERROR = function(error, message) {
        if (error !== gl.NONE) {
            console.log('Assertion failed message:' + message);
            // throw new Error(message);
        }
    };

    var DE_ASSERT = function(x) {
        if (!x)
            throw new Error('Assert failed');
    };

    /**
     * GLContext wraps the standard WebGL context to be able to be used interchangeably with the ReferenceContext
     * @constructor
     * @param {WebGL2RenderingContext}
     */
    var GLContext = function(context) {
        this.m_context = context;
        this.m_programs = [];
        this.m_allocatedVaos = [];

        // Copy all properties from the context.

        var prototypes = [];
        var prototype = Object.getPrototypeOf(this.m_context);

        //Traverse all the prototype hierarchy of the context object.
        while (prototype && prototype !== Object.prototype) {
            prototypes.push(prototype);
            prototype = Object.getPrototypeOf(prototype);
        }

        for(prototype in prototypes) {
            var keys = Object.keys(prototypes[prototype]);
            for(var key in keys) {
                var name = keys[key];

                var exists = false;
                var selfkeys = Object.keys(GLContext.prototype);
                for(var selfkey in selfkeys) {
                    var selfname = selfkeys[selfkey];

                    if(selfname == name) {
                        exists = true;
                        break;
                    }
                }

                if (!exists) {
                    Object.getPrototypeOf(this)[name] = (
                        function (originalobject, originalfunction) {
                            return function () {
                                return originalfunction.apply(originalobject, arguments);
                            };
                        }
                    )(this.m_context, this.m_context[name]);
                }
            }
        }
    };

    /**
     * Unimplemented error thrower
     */
    GLContext.prototype.notImplemented = function (name) {
        throw new Error('Function ' + name + ' not yet implemented in GLContext');
    };

    /**
     * createProgram
     * @param {sglrShaderProgram.ShaderProgram} shader
     * @return {WebGLProgram}
     */
    GLContext.prototype.createProgram = function (shader) {
        /** @type {gluShaderProgram} */ var program = DE_NULL;

        program = new gluShaderProgram.ShaderProgram(this.m_context, gluShaderProgram.makeVtxFragSources(shader.m_vertSrc, shader.m_fragSrc));

        if (!program.isOk()) {
            bufferedLogToConsole(program.toString());
            testFailedOptions("Compile failed", true);
        }

        this.m_programs.push(program);
        return program.getProgram();
    };

    /**
     * genVertexArrays - Creates new vertex array objects, stores them and returns the array of added array objects.
     * @param {number} numArrays
     * @return {Uint32Array} IDs of created VAOs
     */
    GLContext.prototype.genVertexArrays = function (numArrays) {
        var currentlength = this.m_allocatedVaos.length;
        if (numArrays > 0) {
            for (var i=0; i < numArrays; i++) {
                var createdArray = this.m_context.createVertexArray();
                deUtil.dePushUniqueToArray(
                    this.m_allocatedVaos,
                    createdArray
                );
            }
            return this.m_allocatedVaos.slice(currentlength, currentlength + numArrays);
        }
        return null;
    };

    return {
        GLContext: GLContext
    };

});
