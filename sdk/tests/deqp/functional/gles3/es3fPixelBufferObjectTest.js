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
    'framework/delibs/debase/deString',
    'framework/common/tcuTextureUtil',
    'framework/common/tcuTexture',
    'framework/opengl/gluTextureUtil',
    'framework/common/tcuImageCompare'], function(
        gluDefs,
        gluShaderProgram,
        tcuTestCase,
        deRandom,
        deString,
        tcuTextureUtil,
        tcuTexture,
        gluTextureUtil,
        tcuImageCompare) {
    'use strict';

    var DE_ASSERT = function(x) {
        if (!x)
            throw new Error('Assert failed');
    };

    var DE_STATIC_ASSERT = function(expression)
    {
        if (!expression) throw new Error('Assert failed');
    };
    
    /** @enum */
    var FramebufferType= {
        FRAMEBUFFERTYPE_NATIVE: 0,
        FRAMEBUFFERTYPE_RENDERBUFFER: 1
    };
    
    /**
     * @constructor
     * @struct
     */
    var TestSpec = function () { // This is originaly a struct
        this.name= '';
        this.description= '';
        this.useColorClear= false;
        this.renderTriangles= false;
        this.framebufferType= undefined;
        this.renderbufferFormat= undefined;
    };

    /**
     * @constructor
     * @param {TestSpec} spec
     */
    var ReadPixelsTest = function(gl, spec) {
        tcuTestCase.DeqpTest.call(this, spec.name, spec.description);
        this.m_random = new deRandom.Random(deString.deStringHash(spec.name));
        /** @type {gluShaderProgram.ShaderProgram} */ this.m_program = null;
        /** @type {FramebufferType} */ this.m_framebuffeType = spec.framebufferType;
        /** @type {GLenum} */ this.m_renderbufferFormat = spec.renderbufferFormat;
        /** @type {tcuTextureUtil.TextureChannelClass} */ this.m_texChannelClass = undefined;
        this.m_useColorClears = spec.useColorClear;
        this.m_renderTriangles = spec.renderTriangles;
        this.m_colorScale = 1.0;

        if (this.m_framebuffeType === FramebufferType.FRAMEBUFFERTYPE_NATIVE)
        {
            this.m_colorScale = 1.0;
        }
        else if (this.m_framebuffeType === FramebufferType.FRAMEBUFFERTYPE_RENDERBUFFER)
        {
            this.m_texChannelClass = tcuTextureUtil.getTextureChannelClass(gluTextureUtil.mapGLInternalFormat(spec.renderbufferFormat).type);
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

    ReadPixelsTest.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    ReadPixelsTest.prototype.constructor = ReadPixelsTest;

    ReadPixelsTest.prototype.init = function() {
        var outtype = '';

        if (this.m_framebuffeType === FramebufferType.FRAMEBUFFERTYPE_NATIVE)
            outtype = 'vec4';
        else if (this.m_framebuffeType === FramebufferType.FRAMEBUFFERTYPE_RENDERBUFFER)
        {
            switch (this.m_texChannelClass)
            {
                case tcuTextureUtil.TextureChannelClass.UNSIGNED_FIXED_POINT:
                    outtype = 'vec4';
                    break;
                case tcuTextureUtil.TextureChannelClass.SIGNED_INTEGER:
                    outtype = 'ivec4';
                    break;
                case tcuTextureUtil.TextureChannelClass.UNSIGNED_INTEGER:
                    outtype = 'uvec4';
                    break;
                case tcuTextureUtil.TextureChannelClass.FLOATING_POINT:
                    outtype = 'vec4';
                    break;
                default:
                    DE_ASSERT(false);
            }
        }
        else
            DE_ASSERT(false);

        /** @type {string} */ var vertexShaderSource =
        '#version 300 es\n' +
        'in mediump vec3 a_position;\n' +
        'in mediump vec4 a_color;\n' +
        'uniform mediump float u_colorScale;\n' +
        'out mediump vec4 v_color;\n' +
        'void main(void)\n' +
        '{\n' +
        '\tgl_Position = vec4(a_position, 1.0);\n' +
        '\tv_color = u_colorScale * a_color;\n' +
        '}';

        /** @type {string} */ var fragmentShaderSource =
        '#version 300 es\n' +
        'in mediump vec4 v_color;\n' +
        'layout (location = 0) out mediump ' +
        outtype +
        ' o_color;\n' +
        'void main(void)\n' +
        '{\n' +
        '\to_color = ' +
        outtype +
        '(v_color);\n' +
        '}';

        this.m_program = new gluShaderProgram.ShaderProgram(gl, gluShaderProgram.makeVtxFragSources(vertexShaderSource, fragmentShaderSource));

        if (!this.m_program.isOk())
            throw new Error('Compile failed. Program not created');

    };

    /**
     * @param {Array.<number>} a
     * @param {Array.<number>} b
     * @param {Array.<number>} c
     */
    ReadPixelsTest.prototype.renderTriangle = function(a, b, c) {

        var positions = [];

        positions[0] = a[0];
        positions[1] = a[1];
        positions[2] = a[2];

        positions[3] = b[0];
        positions[4] = b[1];
        positions[5] = b[2];

        positions[6] = c[0];
        positions[7] = c[1];
        positions[8] = c[2];

        var colors = [
            1.0, 0.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 1.0];

        gl.useProgram(this.m_program.getProgram());
        assertMsgOptions(gl.getError() === gl.NO_ERROR, 'useProgram failed ', false, true);
        
        /** @type {number} */ var coordLoc = -1;
        /** @type {number} */ var colorLoc = -1;
        /** @type {number} */ var colorScaleLoc = -1;
        
        colorScaleLoc = gl.getUniformLocation(this.m_program, 'u_colorScale');
        assertMsgOptions(colorScaleLoc != -1, 'Could not find u_colorScale ', false, true);
        
        gl.uniform1f(colorScaleLoc, this.m_colorScale);
        
        coordLoc = gl.getAttribLocation(this.m_program.getProgram(), 'a_position');
        assertMsgOptions(coordLoc != -1, 'Could not find a_position ', false, true);
        
        colorLoc = gl.getAttribLocation(this.m_program.getProgram(), 'a_color');
        assertMsgOptions(colorLoc != -1, 'Could not find a_color ', false, true);
        
        gl.enableVertexAttribArray(colorLoc);
        assertMsgOptions(gl.getError() === gl.NO_ERROR, 'enableVertexAttribArray failed ', false, true);
        gl.enableVertexAttribArray(coordLoc);
        assertMsgOptions(gl.getError() === gl.NO_ERROR, 'enableVertexAttribArray failed ', false, true);
        
        gl.vertexAttribPointer(coordLoc, 3, gl.FLOAT, gl.FALSE, 0, positions);
        gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, gl.FALSE, 0, colors);
        
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        
        gl.disableVertexAttribArray(colorLoc);
        gl.disableVertexAttribArray(coordLoc);
    };
    
    /**
     * @param {Float} r
     * @param {Float} g
     * @param {Float} b
     * @param {Float} a
     */
    
    ReadPixelsTest.prototype.clearColor = function(r, g, b, a) {
        if (this.m_framebuffeType == FramebufferType.FRAMEBUFFERTYPE_NATIVE)
        {
            gl.clearColor(r, g, b, a);
            gl.clear(gl.COLOR_BUFFER_BIT);
        }
        else if (this.m_framebuffeType == FramebufferType.FRAMEBUFFERTYPE_RENDERBUFFER)
        {
            switch (this.m_texChannelClass)
            {
                case tcuTextureUtil.TextureChannelClass.UNSIGNED_FIXED_POINT:
                    gl.clearColor(r, g, b, a);
                    gl.clear(gl.COLOR_BUFFER_BIT);
                    break;
                case tcuTextureUtil.TextureChannelClass.SIGNED_INTEGER:
                    gl.clearBufferiv(gl.COLOR, 0, new Int32Array([r, g, b, a]));
                    break;
                case tcuTextureUtil.TextureChannelClass.UNSIGNED_INTEGER:
                    gl.clearBufferuiv(gl.COLOR, 0, new Uint32Array([r, g, b, a]));
                    break;
                case tcuTextureUtil.TextureChannelClass.FLOATING_POINT:
                    gl.clearBufferfv(gl.COLOR, 0, new Float32Array([r, g, b, a]));
                    break;
                default:
                    DE_ASSERT(false);
            }
        }
        else
		  DE_ASSERT(false);
            
    }
    
    ReadPixelsTest.prototype.iterate = function() {
        var width = gl.drawingBufferWidth;
        var height = gl.drawingBufferHeight;
        
        var framebuffer = null;
        var renderbuffer = null;
        
        switch (this.m_framebuffeType)
        {
            case FramebufferType.FRAMEBUFFERTYPE_NATIVE:
                gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
                break;
            case FramebufferType.FRAMEBUFFERTYPE_RENDERBUFFER:
                framebuffer = gl.createFramebuffer();
                renderbuffer = gl.createRenderbuffer();
                
                gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
                gl.renderbufferStorage(gl.RENDERBUFFER, this.m_renderbufferFormat, width, height);
                
                gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
                gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, renderbuffer);
                break;
        }
        
        this.clearColor(this.m_colorScale * 0.4, this.m_colorScale * 1.0, this.m_colorScale * 0.5, this.m_colorScale * 1.0);
        
        if(this.m_useColorClears)
        {
            /** @type {number} */ var maxClearCount = 10;
            /** @type {number} */ var minClearCount = 6;
            /** @type {number} */ var minClearSize = 15;
            
            /** @type {number} */ var clearCount = this.m_random.getInt(minClearCount, maxClearCount);
            
            for(var clearNdx = 0; clearNdx < clearCount; clearNdx++)
            {
                /** @type {number} */ var clearX = this.m_random.getInt(0, width - minClearSize);
                /** @type {number} */ var clearY = this.m_random.getInt(0, height - minClearSize);
                
                /** @type {number} */ var clearWidth = this.m_random.getInt(minClearSize, width - clearX);
                /** @type {number} */ var clearHeight = this.m_random.getInt(minClearSize, height - clearY);
                
                /** @type {float} */ var clearRed = this.m_colorScale * this.m_random.getFloat();
                /** @type {float} */ var clearGreen = this.m_colorScale * this.m_random.getFloat();
                /** @type {float} */ var clearBlue = this.m_colorScale * this.m_random.getFloat();
                /** @type {float} */ var clearAlpha = this.m_colorScale * (0.5 + 0.5 * this.m_random.getFloat());
                
                gl.enable(gl.SCISSOR_TEST);
                gl.scissor(clearX, clearY, clearWidth, clearHeight);
                
                this.clearColor(clearRed,clearGreen, clearBlue, clearAlpha);
            }
            
            gl.disable(gl.SCISSOR_TEST);
            
        }
        
        if(this.m_renderTriangles)
        {
            /** @type {number} */ var minTriangleCount = 4;
            /** @type {number} */ var maxTriangleCount = 10;
            
            /** @type {number} */ var triangleCount = this.m_random.getInt(minTriangleCount, maxTriangleCount);
            
            for(var triangleNdx = 0; triangleNdx < triangleCount; triangleNdx++)
            {
                /** @type {float} */ var x1 = 2.0 * this.m_random.getFloat() - 1.0;
                /** @type {float} */ var y1 = 2.0 * this.m_random.getFloat() - 1.0;
                /** @type {float} */ var z1 = 2.0 * this.m_random.getFloat() - 1.0;
                
                /** @type {float} */ var x2 = 2.0 * this.m_random.getFloat() - 1.0;
                /** @type {float} */ var y2 = 2.0 * this.m_random.getFloat() - 1.0;
                /** @type {float} */ var z2 = 2.0 * this.m_random.getFloat() - 1.0;
                
                /** @type {float} */ var x3 = 2.0 * this.m_random.getFloat() - 1.0;
                /** @type {float} */ var y3 = 2.0 * this.m_random.getFloat() - 1.0;
                /** @type {float} */ var z3 = 2.0 * this.m_random.getFloat() - 1.0;
                
                this.renderTriangle([x1,y1,z1], [x2,y2,z2], [x3,y3,z3]);
            }
        }
        
        /** @type {TextureFormat} */ var readFormat;
        /** @type {float} */ var readPixelsFormat;
        /** @type {float} */ var readPixelsType;
        /** @type {bool} */ var floatCompare;
        
        
        if(this.m_framebuffeType == FramebufferType.FRAMEBUFFERTYPE_NATIVE)
        {
            readFormat = gluTextureUtil.mapGLTransferFormat(gl.RGBA, gl.UNSIGNED_BYTE);
            readPixelsFormat = gl.RGBA;
            readPixelsType = gl.UNSIGNED_BYTE;
            floatCompare = false;
        }
        else if(this.m_framebuffeType == FramebufferType.FRAMEBUFFERTYPE_RENDERBUFFER)
        {
            switch(this.m_texChannelClass)
            {
                case tcuTextureUtil.TextureChannelClass.UNSIGNED_FIXED_POINT:
                    readFormat = gluTextureUtil.mapGLTransferFormat(gl.RGBA_INTEGER, gl.INT);
                    readPixelsFormat = gl.RGBA_INTEGER;
                    readPixelsType = gl.INT;
                    floatCompare = true;
                    break;
                case tcuTextureUtil.TextureChannelClass.SIGNED_INTEGER:
                    readFormat = gluTextureUtil.mapGLTransferFormat(gl.RGBA_INTEGER, gl.INT);
                    readPixelsFormat = gl.RGBA_INTEGER;
                    readPixelsType = gl.INT;
                    floatCompare = false;
                    break;
                case tcuTextureUtil.TextureChannelClass.UNSIGNED_INTEGER:
                    readFormat = gluTextureUtil.mapGLTransferFormat(gl.RGBA_INTEGER, gl.UNSIGNED_INT);
                    readPixelsFormat = gl.RGBA_INTEGER;
                    readPixelsType = gl.UNSIGNED_INT;
                    floatCompare = false;
                    break;
                case tcuTextureUtil.TextureChannelClass.FLOATING_POINT:
                    readFormat = gluTextureUtil.mapGLTransferFormat(gl.RGBA, gl.FLOAT);
                    readPixelsFormat = gl.RGBA;
                    readPixelsType = gl.FLOAT;
                    floatCompare = true;
                    break;
                default:
                    DE_ASSERT(false);
                    // Silence warning
                    readFormat = gluTextureUtil.mapGLTransferFormat(gl.RGBA, gl.FLOAT);
                    readPixelsFormat = gl.RGBA;
                    readPixelsType = gl.FLOAT;
                    floatCompare = true;
            }
        }
        else
        {
            // Silence warnings
            readFormat = gluTextureUtil.mapGLTransferFormat(gl.RGBA, gl.FLOAT);
            readPixelsFormat = gl.RGBA;
            readPixelsType = gl.FLOAT;
            floatCompare = true;
            DE_ASSERT(false);
        }
        
        var readReference = new tcuTexture.Texture2D(readFormat, width, height);
        readReference.allocLevel(0);
        
        var pixelBuffer = gl.createBuffer();
        
        gl.bindBuffer(gl.PIXEL_PACK_BUFFER, pixelBuffer);
        gl.bufferData(gl.PIXEL_PACK_BUFFER, readReference.getLevel(0).getDataSize(), gl.STREAM_READ);
        
        // TODO: enable
        //gl.readPixels(0, 0, width, height, readPixelsFormat, readPixelsType, 0);
        
        var bufferData = new ArrayBuffer(readReference.getLevel(0).getDataSize());
        
        gl.getBufferSubData(gl.PIXEL_PACK_BUFFER, 0, bufferData);
        
        var readResult = new tcuTexture.ConstPixelBufferAccess({
            width: width,
            height: height,
            format: readFormat,
            data: bufferData});
        
        gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
        
        gl.readPixels(0, 0, width, height, readPixelsFormat, readPixelsType, readReference.getLevel(0).getDataPtr());
        
        if(framebuffer)
            gl.deleteFramebuffer(framebuffer);
        
        if(renderbuffer)
            gl.deleteRenderbuffer(renderbuffer);
        
        var isOk = false;
        
        if(floatCompare)
            isOk = tcuImageCompare.floatThresholdCompare('Result comparision', 'Result of read pixels to memory compared with result of read pixels to buffer', readReference.getLevel(0), readResult, [0.0, 0.0, 0.0, 0.0]);
        else
            isOk = tcuImageCompare.intThresholdCompare('Result comparision', 'Result of read pixels to memory compared with result of read pixels to buffer', readReference.getLevel(0), readResult, [0, 0, 0, 0]);
        
        gl.deleteBuffer(pixelBuffer);
        
        assertMsgOptions(isOk, this.getDescription(), true, true);
        
        return tcuTestCase.runner.IterateResult.STOP;
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
                framebufferType: FramebufferType.FRAMEBUFFERTYPE_NATIVE,
                renderbufferFormat: gl.NONE
    		},
    		{
                name: "triangles",
                description: "Simple read pixels test rendering triangles",
                useColorClear: false,
                renderTriangles: true,
                framebufferType: FramebufferType.FRAMEBUFFERTYPE_NATIVE,
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
            gl.RGBA16I,
            gl.RGBA16UI,
            gl.RGBA32I,
            gl.RGBA32UI,

            gl.SRGB8_ALPHA8,
            gl.RGB10_A2,
            gl.RGB10_A2UI,
            gl.RGBA4,
            gl.RGB5_A1,

            gl.RGB8,
            gl.RGB565,


            gl.RG8,
            gl.RG8I,
            gl.RG8UI,
            gl.RG16I,
            gl.RG16UI,
            gl.RG32I,
            gl.RG32UI
        ];

        var renderbufferFormatsStr = [
    		'rgba8',
    		'rgba8i',
    		'rgba8ui',
    		'rgba16i',
    		'rgba16ui',
    		'rgba32i',
    		'rgba32ui',

    		'srgb8_alpha8',
    		'rgb10_a2',
    		'rgb10_a2ui',
    		'rgba4',
    		'rgb5_a1',

    		'rgb8',
    		'rgb565',

    		'rg8',
    		'rg8i',
    		'rg8ui',
    		'rg16i',
    		'rg16ui',
    		'rg32i',
    		'rg32ui'];
        DE_STATIC_ASSERT(renderbufferFormatsStr.length == renderbufferFormats.length);

        for (var formatNdx = 0; formatNdx < renderbufferFormats.length; formatNdx++)
        {
            for (var trianglesClears = 0; trianglesClears < 2; trianglesClears++)
            {
                var nameDescription = renderbufferFormatsStr[formatNdx] + '_' + trianglesClears == 0 ? 'triangles' : 'clears';
                var testSpec = new TestSpec();
                testSpec.name= nameDescription;
                testSpec.description= nameDescription;
                testSpec.useColorClear= trianglesClears == 1;
                testSpec.renderTriangles= trianglesClears == 0;
                testSpec.framebufferType= FramebufferType.FRAMEBUFFERTYPE_RENDERBUFFER;
                testSpec.renderbufferFormat= renderbufferFormats[formatNdx];

                renderbufferGroup.addChild(new ReadPixelsTest(context, testSpec));
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
