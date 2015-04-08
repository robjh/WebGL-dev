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
    'framework/opengl/gluDefs',
    'framework/opengl/gluShaderProgram',
    'framework/common/tcuTestCase',
    'framework/delibs/debase/deRandom',
    'framework/common/tcuTextureUtil',
    'framework/opengl/gluTextureUtil'], function(
        gluDefs,
        gluShaderProgram,
        tcuTestCase,
        deRandom,
        tcuTextureUtil,
        gluTextureUtil) {
    'use strict';

    var DE_ASSERT = function(x) {
        if (!x)
            throw new Error('Assert failed');
    };

    var DE_STATIC_ASSERT = function(expression)
    {
        if (!expression) throw new Error('Assert failed');
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
        tcuTestCase.DeqpTest.call(gl, spec.name, spec.description);
        this.m_random;
        this.m_log;
        /** @type {gluShaderProgram.ShaderProgram} */ this.m_program = null;
        /** @type {TestSpect.FramebufferType} */ this.m_framebuffeType = spec.framebufferType;
        /** @type {TestSpect.GLenum} */ this.m_renderbufferFormat = spec.renderbufferFormat;
        /** @type {tcuTextureUtil.TextureChannelClass} */ this.m_texChannelClass = Object.keys(tcuTextureUtil.TextureChannelClass).length;
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
            switch (this.m_textChannelClass)
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

    ReadPixelsTest.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
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

        this.m_program = new gluShaderProgram.ShaderProgram(gl, gluShaderProgram.makeVtxFragSources(vertexShaderSource, fragmentShaderSource));

        if (!this.m_program.isOk())
            throw new Error('Compile failed. Program no created');

    };

    /**
     * @param {Array.<number>} a
     * @param {Array.<number>} b
     * @param {Array.<number>} c
     */
    ReadPixelsTest.prototype.renderTriangle = function (a, b, c) {

        var positions;

        positions[0] = a[0];
        positions[1] = a[1];
        positions[2] = a[2];

        positions[3] = b[0];
        positions[4] = b[1];
        positions[5] = b[2];

        positions[6] = c[0];
        positions[7] = c[1];
        positions[8] = c[2];

        colors = [
            1.0, 0.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 1.0];

        gluDefs.GUL_CHECK_CALL(function() {gl.useProgram(this.m_program.getProgram())});
        
        /** @type {number} */ coordLoc = -1;
        /** @type {number} */ colorLoc = -1;
        /** @type {number} */ colorScaleLoc = -1;
        
        colorScaleLoc = gl.getUniformLocation(this.m_program, 'u_colorScale');
        TCU_CHECK(clearTimeout != -1);
        
        gluDefs.GLU_CHECK_CALL(function() {gl.uniform1f(colorScaleLoc, this.m_colorScale)});
        
        coordLoc = gl.getAttribLocation(this.m_program.getProgram(), 'a_position');
        TCU_CHECK(coordLoc != -1);
        
        colorLoc = gl.getAttribLocation(this.m_program.getProgram(), 'a_color');
        TCU_CHECK(colorLoc != -1);
        
        gluDefs.GLU_CHECK_CALL(function() {gl.enableVertexAttribArray(colorLoc)});
        gluDefs.GLU_CHECK_CALL(function() {gl.enableVertexAttribArray(coordLoc)});
        
        gluDefs.GLU_CHECK_CALL(function() {gl.vertexAttribPointer(coordLoc, 3, gl.FLOAT, gl.FALSE, 0, positions)});
        gluDefs.GLU_CHECK_CALL(function() {gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, gl.FALSE, 0, colors)});
        
        gluDefs.GLU_CHECK_CALL(function() {gl.drawArrays(gl.TRIANGLES, 0, 3)});
        
        gluDefs.GLU_CHECK_CALL(function() {gl.disableVertexAttribArray(colorLoc)});
        gluDefs.GLU_CHECK_CALL(function() {gl.disableVertexAttribArray(coordLoc)});
    }

    var init = function(context)
    {
        var state = tcuTestCase.runner.getState();
        /** @type {tcuTestCase.DeqpTest} */ var testGroup = state.testCases;

        /** @type {tcuTestCase.DeqpTest} */ var nativeFramebufferGroup = new tcuTestCase.newTest('native', 'Tests with reading from native framebuffer');

        var nativeFramebufferTests = [
    		{
                name: "clears",
                description: "Simple read pixels test with color clears",
                useColorClear: true,
                renderTriangles: false,
                framebufferType: TestSpec.FramebufferType.FRAMEBUFFERTYPE_NATIVE,
                renderbufferFormat: gl.NONE
    		},
    		{
                name: "triangles",
                description: "Simple read pixels test rendering triangles",
                useColorClear: false,
                renderTriangles: true,
                framebufferType: TestSpec.FramebufferType.FRAMEBUFFERTYPE_NATIVE,
                renderbufferFormat: gl.NONE
    		}
    	];

        for (var testNdx = 0; testNdx < nativeFramebufferTests.length; testNdx++)
            nativeFramebufferGroup.addChild(new ReadPixelsTest(context, nativeFramebufferTests[testNdx]));

        testGroup.addChild(nativeFramebufferGroup);

        /** @type {tcuTestCase.DeqpTest} */ var renderbufferGroup = new tcuTestCase.newTest('renderbuffer', 'Tests with reading from renderbuffer');

        var renderbufferFormats = [
            gl.RGBA8,
            gl.RGBA8I,
            gl.RGBA8UI,
            gl.RGBA16F,
            gl.RGBA16I,
            gl.RGBA16UI,
            gl.RGBA32F,
            gl.RGBA32I,
            gl.RGBA32UI,

            gl.SRGB8_ALPHA8,
            gl.RGB10_A2,
            gl.RGB10_A2UI,
            gl.RGBA4,
            gl.RGB5_A1,

            gl.RGB8,
            gl.RGB565,

            gl.R11F_G11F_B10F,

            gl.RG8,
            gl.RG8I,
            gl.RG8UI,
            gl.RG16F,
            gl.RG16I,
            gl.RG16UI,
            gl.RG32F,
            gl.RG32I,
            gl.RG32UI
        ];

        var renderbufferFormatsStr = [
    		"rgba8",
    		"rgba8i",
    		"rgba8ui",
    		"rgba16f",
    		"rgba16i",
    		"rgba16ui",
    		"rgba32f",
    		"rgba32i",
    		"rgba32ui",

    		"srgb8_alpha8",
    		"rgb10_a2",
    		"rgb10_a2ui",
    		"rgba4",
    		"rgb5_a1",

    		"rgb8",
    		"rgb565",

    		"r11f_g11f_b10f",

    		"rg8",
    		"rg8i",
    		"rg8ui",
    		"rg16f",
    		"rg16i",
    		"rg16ui",
    		"rg32f",
    		"rg32i",
    		"rg32ui"
    	];

        DE_STATIC_ASSERT(renderbufferFormatsStr.length == renderbufferFormats.length);

        for (var formatNdx = 0; formatNdx < renderbufferFormats.length; formatNdx++)
        {
            for (var trianglesClears = 0; trianglesClears < 2; trianglesClears++)
            {
                var nameDescription = renderbufferFormatsStr[formatNdx] + '_' + trianglesClears == 0 ? 'triangles' : 'clears';
                var testSpect = {
                    FramebufferType : {
                        FRAMEBUFFERTYPE_NATIVE : 0,
                        FRAMEBUFFERTYPE_RENDERBUFFER : 1
                    },
                    name: nameDescription,
                    description: nameDescription,
                    useColorClear:trianglesClears == 1,
                    renderTriangles:trianglesClears == 0,
                    framebufferType: TestSpec.FramebufferType.FRAMEBUFFERTYPE_RENDERBUFFER,
                    renderbufferFormat: renderbufferFormats[formatNdx]
                }

                renderbufferGroup.addChild(new ReadPixelsTest(context, testSpect));
            }
        }

        testGroup.addChild(renderbufferGroup);
    };



    var run = function(context)
    {
        gl = context;
        //Set up Test Root parameters
        var testName = 'pixel_buffer_objct';
        var testDescription = 'Pixel Buffer Object Tests';
        var state = tcuTestCase.runner.getState();

        state.testName = testName;
        state.testCases = tcuTestCase.newTest(testName, testDescription, null);

        //Set up name and description of this test series.
        setCurrentTestName(testName);
        description(testDescription);

        try {
            //Create test cases
            init(context);
            //Run test cases
            tcuTestCase.runTestCases();
        }
        catch (err) {
            bufferedLogToConsole(err);
            tcuTestCase.runner.terminate();
        }
    };

    return {
        run: run
    };

});
