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
    'framework/common/tcuTextureUtil',
    'framework/opengl/gluTextureUtil'], function(
        deqpTests,
        deRandom,
        tcuTextureUtil,
        gluTextureUtil) {
    'use strict';

var DE_ASSERT = function(x) {
    if (!x)
        throw new Error('Assert failed');
};

var TestSpec = { // This is originaly a struct
    FramebufferType : {
        FRAMEBUFFERTYPE_NATIVE : 0,
        FRAMEBUFFERTYPE_RENDERBUFFER : 1
    },
    name : '',
    description:'',
    useColorClear:false,
    renderTriangles:false,
    framebufferType:{},
    renderbufferFormat:{},
}


var ReadPixelsTest = function(gl, spec) {
    deqpTests.DeqpTest.call(gl, spec.name, spec.description);
    this.m_random;
    this.m_log;
    /** @type {deqpProgram.ShaderProgram} */ this.m_program = null;
    /** @type {TestSpect.FramebufferType} */ this.m_framebuffeType = spec.framebufferType;
    /** @type {TestSpect.GLenum} */ this.m_renderbufferFormat = spec.renderbufferFormat;
    /** @type {tcuTextureUtil.TextureChannelClass} */ this.m_texChannelClass = tcuTextureUtil.TextureChannelClass.LAST;
    /** @type {TestSpect.FramebufferType} */ this.m_useColorClears = spec.useColorClear;
    /** @type {TestSpect.FramebufferType} */ this.m_renderTriangles = spec.renderTriangles;
    /** @type {TestSpect.FramebufferType} */ this.m_colorScale =  1.0;

    if (this.m_framebuffeType == TestSpec.FramebufferType.FRAMEBUFFERTYPE_NATIVE)
  	{
        this.m_colorScale = 1.0;
  	}
    else if (this.m_framebuffeType == TestSpec.FramebufferType.FRAMEBUFFERTYPE_RENDERBUFFER)
    {
        this.m_textChannelClass = tcuTextureUtil.getTextureChannelClass(gluTextureUtil.mapGLInternalFormat(spec.renderbufferFormat).type);
        switch (this.m_texChannelClass)
        {
            case tcuTextureUtil.TextureChannelClass.UNSIGNED_FIXED_POINT:
                this.m_colorScale = 1.0;
                break;
            case tcuTextureUtil.TextureChannelClass.SIGNED_INTEGER:
                this.m_colorScale = 100.0;
                break;
            case tcuTextureUtil.TextureChannelClass.UNSIGNED_INTEGER:
                this.m_colorScale = 100.0;
                break;
            case tcuTextureUtil.TextureChannelClass.FLOATING_POINT:
                this.m_colorScale = 100.0;
                break;
            default:
                DE_ASSERT(false);
        }
    }
    else
    {
        DE_ASSERT(false);
    }
};

    ReadPixelsTest.prototype = Object.create(deqpTests.DeqpTest.prototype);
    ReadPixelsTest.prototype.constructor = ReadPixelsTest;

    ReadPixelsTest.prototype.init = function () {
        // Check extrensions
        if (this.m_framebuffeType == TestSpec.FramebufferType.FRAMEBUFFERTYPE_RENDERBUFFER)
        {
            supported = false;

            if (this.m_renderbufferFormat == gl.RGBA16F || this.m_renderbufferFormat == gl.RGBA16)
            {
                var extensions = gl.getSupportedExtensions();
                var extension;

                for (extension of extensions)
                {
                    if (extension == "GL_EXT_color_buffer_half_float")
                    {
                        supported = true;
                        break;
                    }
                    else if (extension=="GL_EXT_color_buffer_float")
                    {
                        supported = true;
                        break;
                    }
                }
            }
            else if (this.m_renderbufferFormat == gl.RGBA32F || this.m_renderbufferFormat == gl.RG32F
            || this.m_renderbufferFormat == gl.R11F_G11F_B10F)
            {
                var extensions = gl.getSupportedExtensions();
                var extension;

                for (extension of extensions)
                {
                    if (extension=="GL_EXT_color_buffer_float")
                    {
                        supported = true;
                        break;
                    }
                }
            }
            else
                supported = true;

        		if (!supported)
                throw Error("Renderbuffer format not supported");
        }
        var outtype = "";

        if (this.m_framebuffeType == TestSpec.FramebufferType.FRAMEBUFFERTYPE_NATIVE)
            outtype = "vec4";
        else if (this.m_framebuffeType == TestSpec.FramebufferType.FRAMEBUFFERTYPE_RENDERBUFFER)
      	{
        		switch (this.m_texChannelClass)
        		{
                case tcuTextureUtil.TextureChannelClass.UNSIGNED_FIXED_POINT:
            				outtype = "vec4";
            				break;
          			case tcuTextureUtil.TextureChannelClass.SIGNED_INTEGER:
            				outtype = "ivec4";
            				break;
          			case tcuTextureUtil.TextureChannelClass.UNSIGNED_INTEGER:
            				outtype = "uvec4";
            				break;
          			case tcuTextureUtil.TextureChannelClass.FLOATING_POINT:
            				outtype = "vec4";
            				break;
          			default:
            				DE_ASSERT(false);
        		}
      	}
      	else
      		  DE_ASSERT(false);

        /** @type {string} */ var vertexShaderSource =
      	"#version 300 es\n"
      	+ "in mediump vec3 a_position;\n"
        + "in mediump vec4 a_color;\n"
        + "uniform mediump float u_colorScale;\n"
        + "out mediump vec4 v_color;\n"
        + "void main(void)\n"
        + "{\n"
        + "\tgl_Position = vec4(a_position, 1.0);\n"
        + "\tv_color = u_colorScale * a_color;\n"
      	+ "}";

        /** @type {string} */ var fragmentShaderSource =
        "#version 300 es\n"
      	+ "in mediump vec4 v_color;\n";
        + "layout (location = 0) out mediump "
        + outtype
        + " o_color;\n"
        + "void main(void)\n"
      	+ "{\n"
      	+ "\to_color = "
        + outtype
        + "(v_color);\n"
      	+ "}";
    }

var run = function(context)
{
    gl = context;
    //Set up Test Root parameters
    var testName = 'pixel_buffer_objct';
    var testDescription = 'Pixel Buffer Object Tests';
    var state = deqpTests.runner.getState();

    state.testName = testName;
    state.testCases = deqpTests.newTest(testName, testDescription, null);

    //Set up name and description of this test series.
    setCurrentTestName(testName);
    description(testDescription);

    try {
        //Create test cases
        init();
        //Run test cases
        deqpTests.runTestCases();
    }
    catch (err) {
        testFailedOptions('Failed to run tests', false);
        deqpTests.runner.terminate();
    }
};

return {
    run: run
};

});
