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
    'framework/opengl/gluShaderProgram',
    'functional/gles3/es3fFboTestUtil',
    'framework/opengl/gluShaderUtil',
    'framework/delibs/debase/deRandom',
    'framework/common/tcuTestCase',
    'framework/common/tcuSurface',
    'framework/opengl/gluTexture',
    'framework/opengl/gluTextureUtil',
    'framework/common/tcuTexture',
    'modules/shared/glsTextureTestUtil',
    'framework/common/tcuTextureUtil',
    'framework/opengl/gluStrUtil',
    'framework/delibs/debase/deMath',
    'framework/common/tcuCompressedTexture',
    'framework/opengl/gluVarTypeUtil',
    'framework/common/tcuImageCompare'
],
function(
        deqpProgram,
        fboTestUtil,
        gluShaderUtil,
        deRandom,
        deqpTests,
        tcuSurface,
        gluTexture,
        gluTextureUtil,
        tcuTexture,
        glsTextureTestUtil,
        tcuTextureUtil,
        gluStrUtil,
        deMath,
        tcuCompressedTexture,
        gluVarTypeUtil,
        tcuImageCompare
) {
    'use strict';

    var GLU_EXPECT_NO_ERROR = function(error, message) {
        assertMsgOptions(error === gl.NONE, message, false, true);
    };

    var DE_ASSERT = function(x) {
        if (!x)
            throw new Error('Assert failed');
    };

    var TCU_FAIL = function(msg) {
        testFailedOptions(msg, true);
    };

    /** toUInt32
     * Returns a converted UInt32
     * @param {number} x
     * @return {UInt32}
     */
    var toUInt32 = function(x) {
        return x >>> 0;
      };

    /** BufferSpec
     * Constructs the BufferSpec object, it's originally a struct
     * @param {number} format_
     * @param {number} width_
     * @param {number} height_
     * @param {number} samples_
     */
    var BufferSpec = (function(format_, width_, height_, samples_) {
        this.format = format_;
        this.width = width_;
        this.height = height_;
        this.samples = samples_;
    });

    /** FragmentOutput
     * Constructs the FragmentOutput object, it's originally a struct
     * @param {gluShaderUtil.DataType} type_
     * @param {gluShaderUtil.precision} precision_
     * @param {number} location_
     * @param {number} arrayLength_
     */
    var FragmentOutput = (function(type_, precision_, location_, arrayLength_) {
        this.type = type_;
        this.precision = precision_;
        this.location = location_;
        this.arrayLength = arrayLength_;
    });

    /** @type {Array.<FragmentOutput>} */ var Outputs = [];

    /** OutputVec
     * Returns an Array of FragmentOutput objects
     * @param {FragmentOutput} output
     * @return {Array.<FragmentOutput>} outputs
     */
    var OutputVec = function(output) {

        Outputs.push(output);
        var partialOutput = Outputs.slice(0, Outputs.length);

        return partialOutput;
    };

    /** FragmentOutputCase
     * Constructs the FragmentOutputCase object
     * @param {WebGLRenderingContext} gl WebGL context
     * @param {string} name
     * @param {string} description
     * @param {Array.<BufferSpec>} fboSpec
     * @param {Array.<FragmentOutput>} outputs
     * @return {Object} The currently modified object
     */
    var FragmentOutputCase = function(gl, name, description, fboSpec, outputs) {
        deqpTests.DeqpTest.call(this, name, description);
        /** @type {Array.<BufferSpec>} */ this.m_fboSpec = fboSpec;
        /** @type {Array.<FragmentOutput>} */ this.m_outputs = outputs;
        /** @type {deqpProgram.ShaderProgram} */ this.m_program = null;
        /** @type {number} */ this.m_framebuffer = 0; // deUint32
        /** @type {Uint32Array} */ this.m_renderbuffers = []; // vector<deUint32>
        /** @type {WebGLRenderingContext} */ this.m_gl = gl;
    };

    FragmentOutputCase.prototype = Object.create(deqpTests.DeqpTest.prototype);
    FragmentOutputCase.prototype.constructor = FragmentOutputCase;

    /** Creates Program
     * Returns a ShaderProgram object
     * @param {WebGLRenderingContext} gl WebGL context
     * @param {Array.<FragmentOutput>} outputs
     * @return {deqpProgram.ShaderProgram} program
     */
    var createProgram = function(gl, outputs) {

        var vtx = '';
        var frag = '';

        vtx = '#version 300 es\n' + 'in highp vec4 a_position;\n';
        frag = '#version 300 es\n';

     // Input-output declarations.
        for (var outNdx = 0; outNdx < outputs.length; outNdx++)
        {
            /** @type {FragmentOutput} */ var output = outputs[outNdx];
            /** @type {boolean} */ var isArray = output.arrayLength > 0;
            /** @type {string} */ var typeName = gluShaderUtil.getDataTypeName(output.type);
            /** @type {string} */ var precName = gluShaderUtil.getPrecisionName(output.precision);
            /** @type {boolean} */ var isFloat = gluShaderUtil.isDataTypeFloatOrVec(output.type);
            /** @type {string} */ var interp = isFloat ? 'smooth' : 'flat';

            if (isArray)
            {
                for (var elemNdx = 0; elemNdx < output.arrayLength; elemNdx++)
                {
                    vtx += 'in ' + precName + ' ' + typeName + ' in' + outNdx + '_' + elemNdx + ';\n' +
                    interp + ' out ' + precName + ' ' + typeName + ' var' + outNdx + '_' + elemNdx + ';\n';
                    frag += interp + ' in ' + precName + ' ' + typeName + ' var' + outNdx + '_' + elemNdx + ';\n';
                }
                frag += 'layout(location = ' + output.location + ') out ' + precName + ' ' + typeName + ' out' + outNdx + '[' + output.arrayLength + '];\n';
            }
            else
            {
                vtx += 'in ' + precName + ' ' + typeName + ' in' + outNdx + ';\n' +
                interp + ' out ' + precName + ' ' + typeName + ' var' + outNdx + ';\n';
                frag += interp + ' in ' + precName + ' ' + typeName + ' var' + outNdx + ';\n' +
                'layout(location = ' + output.location + ') out ' + precName + ' ' + typeName + ' out' + outNdx + ';\n';
            }
        }

        vtx += '\nvoid main()\n{\n';
        frag += '\nvoid main()\n{\n';

        vtx += '    gl_Position = a_position;\n';

        // Copy body
        for (var outNdx = 0; outNdx < outputs.length; outNdx++)
        {
            /** @type {FragmentOutput} */ var output = outputs[outNdx];
            /** @type {boolean} */ var isArray = output.arrayLength > 0;

            if (isArray)
            {
                for (var elemNdx = 0; elemNdx < output.arrayLength; elemNdx++)
                {
                    vtx += '\tvar' + outNdx + '_' + elemNdx + ' = in' + outNdx + '_' + elemNdx + ';\n';
                    frag += '\tout' + outNdx + '[' + elemNdx + '] = var' + outNdx + '_' + elemNdx + ';\n';
                }
            }
            else
            {
                vtx += '\tvar' + outNdx + ' = in' + outNdx + ';\n';
                frag += '\tout' + outNdx + ' = var' + outNdx + ';\n';
            }
        }

        vtx += '}\n';
        frag += '}\n';

        /** @type {deqpProgram.ShaderProgram} */
        var program = new deqpProgram.ShaderProgram(gl, deqpProgram.makeVtxFragSources(vtx, frag));
        // bufferedLogToConsole(program);
        return program;
    };

    FragmentOutputCase.prototype.init = function() {

        /** @type {WebGLRenderingContext} */ var gl = this.m_gl;

        // Check that all attachments are supported
        for (var iter = 0; iter < this.m_fboSpec.length; ++iter)
        {
            /* TODO: isSizedFormatColorRenderable (in gluTextureUtil) not implemented yet.
            if (!glu::isSizedFormatColorRenderable(m_context.getRenderContext(), m_context.getContextInfo(), this.m_fboSpec[iter].format))
                throw tcu::NotSupportedError("Unsupported attachment format");
                */
        }

        DE_ASSERT(!this.m_program);
        this.m_program = createProgram(gl, this.m_outputs);

       // log << *m_program;
        if (!this.m_program.isOk())
            throw new Error('Compile failed. Program no created');

        /*
        // Print render target info to log.
        log << TestLog::Section("Framebuffer", "Framebuffer configuration");

        for (int ndx = 0; ndx < (int)m_fboSpec.size(); ndx++)
            log << TestLog::Message << "COLOR_ATTACHMENT" << ndx << ": "
                                    << glu::getPixelFormatStr(m_fboSpec[ndx].format) << ", "
                                    << m_fboSpec[ndx].width << "x" << m_fboSpec[ndx].height << ", "
                                    << m_fboSpec[ndx].samples << " samples"
                << TestLog::EndMessage;

        log << TestLog::EndSection;*/

        // Create framebuffer.
        this.m_renderbuffers.length = this.m_fboSpec.length; // m_renderbuffers only used here in init()

        gl.genFramebuffers(1, this.m_framebuffer);
        gl.genRenderbuffers(this.m_framebuffer.length, this.m_framebuffer);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.m_framebuffer);

        for (var bufNdx = 0; bufNdx < this.m_framebuffer.length; bufNdx++)
        {
            /** @type {boolean} */ var rbo = this.m_framebuffer[bufNdx];
            /** @type {BufferSpec} */ var bufSpec = this.m_fboSpec[bufNdx];
            /** @type {number} */ var attachment = gl.COLOR_ATTACHMENT0 + bufNdx;

            gl.bindRenderbuffer(gl.RENDERBUFFER, rbo);
            gl.renderbufferStorageMultisample(gl.RENDERBUFFER, bufSpec.samples, bufSpec.format, bufSpec.width, bufSpec.height);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, attachment, gl.RENDERBUFFER, rbo);
        }
        GLU_EXPECT_NO_ERROR(gl.getError(), 'After framebuffer setup');

        /** @type {number} */ var fboStatus = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (fboStatus == gl.FRAMEBUFFER_UNSUPPORTED)
            throw new Error('Framebuffer not supported');
            // throw tcu::NotSupportedError("Framebuffer not supported", "", __FILE__, __LINE__);
        else if (fboStatus != gl.FRAMEBUFFER_COMPLETE)
            throw new Error('Incomplete framebuffer');
            // throw tcu::TestError((string("Incomplete framebuffer: ") + glu::getFramebufferStatusStr(fboStatus), "", __FILE__, __LINE__);

        gl.bindFramebuffer(gl.FRAMEBUFFER, 0);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'After init');
    };

    FragmentOutputCase.prototype.deinit = function() {
        // TODO: implement?
    };

    /** getMinSize
     * Returns a 2-dimension Array (originally in the C++ version IVec2) with the minimum size
     * compared to the width and height of each BufferSpec object contained in the passed Array
     * @param {Array.<BufferSpec>} fboSpec
     * @return {Array.<number>} minSize
     */
    var getMinSize = function(fboSpec) {
        /** @type {Array.<number>} */ var minSize = [0x7fffffff, 0x7fffffff];
        for (var i = 0; i < fboSpec.length; i++)
        {
            minSize[0] = Math.min(minSize[0], fboSpec[i].width);
            minSize[1] = Math.min(minSize[1], fboSpec[i].height);
        }
        return minSize;

    };

    /** getNumInputVectors
     * Returns the length of the array of all the outputs (FragmentOutput object)
     * @param {Array.<FragmentOutput>} outputs
     * @return {number} numVecs
     */
    var getNumInputVectors = function(outputs) {
        /** @type {Array.<number>} */ var numVecs = 0;
        for (var i = 0; i < outputs.length; i++)
            numVecs += (outputs[i].arrayLength > 0 ? outputs[i].arrayLength : 1);
        return numVecs;
    };

    /** getFloatRange
     * Returns an Float32Array, in the C++ version called Vec2 object
     * @param {gluShaderUtil.precision} precision, number
     * @return {Float32Array} Vec2
     */
    var getFloatRange = function(precision) {

        /** @type {Array.<Float32Array>} */
        var ranges = // Vec2
        [
            [-2.0, 2.0],
            [-16000.0, 16000.0],
            [-1e35, 1e35]
        ];
        // DE_STATIC_ASSERT(DE_LENGTH_OF_ARRAY(ranges) == glu::PRECISION_LAST);
        // DE_ASSERT(de::inBounds<int>(precision, 0, DE_LENGTH_OF_ARRAY(ranges)));
        return ranges[precision];
    };

    /** getIntRange
     * Returns an Int32Array, in the C++ version called IVec2 object
     * @param {gluShaderUtil.precision} precision, number
     * @return {Int32Array} IVec2
     */
    var getIntRange = function(precision) {

        /** @type {Array.<Int32Array>} */
        var ranges = // IVec2
        [
            [-(1 << 7), (1 << 7) - 1],
            [-(1 << 15), (1 << 15) - 1],
            [0x80000000, 0x7fffffff]
        ];
        // DE_STATIC_ASSERT(DE_LENGTH_OF_ARRAY(ranges) == glu::PRECISION_LAST);
        // DE_ASSERT(de::inBounds<int>(precision, 0, DE_LENGTH_OF_ARRAY(ranges)));
        return ranges[precision];
    };

    /** getUintRange
     * Returns an Uint32Array, in the C++ version called UVec2 object
     * @param {gluShaderUtil.precision} precision, number
     * @return {Uint32Array} UVec2
     */
    var getUintRange = function(precision) {

        /** @type {Array.<Uint32Array>} */
        var ranges = // UVec2
        [
            [0, (1 << 8) - 1],
            [0, (1 << 16) - 1],
            [0, 0xffffffff]
        ];
        // DE_STATIC_ASSERT(DE_LENGTH_OF_ARRAY(ranges) == glu::PRECISION_LAST);
        // DE_ASSERT(de::inBounds<int>(precision, 0, DE_LENGTH_OF_ARRAY(ranges)));
        return ranges[precision];

    };

    /** readVec4
     * @param {Float32Array} ptr, TypedArray Float32Array, it is a pointer in the C++ version
     * @param {number} numComponents
     * @return {Float32Array} Vec4
     */
    var readVec4 = function(ptr, numComponents) {
        DE_ASSERT(numComponents >= 1);
        return [
                ptr[0],
                numComponents >= 2 ? ptr[1] : 0.0,
                numComponents >= 3 ? ptr[2] : 0.0,
                numComponents >= 4 ? ptr[3] : 0.0
                ];
    };

    /** readIVec4
     * @param {Int32Array} ptr, TypedArray Int32Array, it is a pointer in the C++ version
     * @param {number} numComponents
     * @return {Int32Array} IVec4
     */
    var readIVec4 = function(ptr, numComponents) {
        DE_ASSERT(numComponents >= 1);
        return [
                ptr[0],
                numComponents >= 2 ? ptr[1] : 0,
                numComponents >= 3 ? ptr[2] : 0,
                numComponents >= 4 ? ptr[3] : 0
                ];
    };

    /** renderFloatReference
     * @param {tcuTexture.PixelBufferAccess} dst
     * @param {number} gridWidth
     * @param {number} gridHeight
     * @param {number} numComponents
     * @param {Float32Array} vertices, whole TypedArray Float32Array. It's a pointer in the C++ version
     */
    var renderFloatReference = function(dst, gridWidth, gridHeight, numComponents, vertices) {

        /** @type {boolean} */ var isSRGB = dst.getFormat().order == tcuTexture.ChannelOrder.sRGB || dst.getFormat().order == tcuTexture.ChannelOrder.sRGBA;
        /** @type {number} */ var cellW = Math.floor(dst.getWidth() / (gridWidth - 1));
        /** @type {number} */ var cellH = Math.floor(dst.getHeight() / (gridHeight - 1));

        for (var y = 0; y < dst.getHeight(); y++)
        {
            for (var x = 0; x < dst.getWidth(); x++)
            {
                /** @type {number} */ var cellX = deMath.clamp(Math.floor(x / cellW), 0, gridWidth - 2);
                /** @type {number} */ var cellY = deMath.clamp(Math.floor(y / cellH), 0, gridHeight - 2);
                /** @type {number} */ var xf = Math.floor((x - cellX * cellW + 0.5) / cellW);
                /** @type {number} */ var yf = Math.floor((y - cellY * cellH + 0.5) / cellH);

                /** @type {Float32Array} */ var v00 = readVec4(vertices[((cellY + 0) * gridWidth + cellX + 0) * numComponents], numComponents); // Vec4
                /** @type {Float32Array} */ var v01 = readVec4(vertices[((cellY + 1) * gridWidth + cellX + 0) * numComponents], numComponents); // Vec4
                /** @type {Float32Array} */ var v10 = readVec4(vertices[((cellY + 0) * gridWidth + cellX + 1) * numComponents], numComponents); // Vec4
                /** @type {Float32Array} */ var v11 = readVec4(vertices[((cellY + 1) * gridWidth + cellX + 1) * numComponents], numComponents); // Vec4

                /** @type {boolean} */ var tri = xf + yf >= 1.0;
                /** @type {Float32Array} */ var v0 = tri ? v11 : v00; // Vec4&
                /** @type {Float32Array} */ var v1 = tri ? v01 : v10; // Vec4&
                /** @type {Float32Array} */ var v2 = tri ? v10 : v01; // Vec4&
                /** @type {number} */ var s = tri ? 1.0 - xf : xf;
                /** @type {number} */ var t = tri ? 1.0 - yf : yf;
                /** @type {Float32Array} */ var color = deMath.add(v0, deMath.add(deMath.multiply((deMath.subtract(v1, v0)), s), deMath.multiply((deMath.subtract(v2, v0)), t))); // Vec4

                dst.setPixel(isSRGB ? tcuTextureUtil.linearToSRGB(color) : color, x, y);
            }
        }
    };

    /** renderIntReference
     * @param {tcuTexture.PixelBufferAccess} dst
     * @param {number} gridWidth
     * @param {number} gridHeight
     * @param {number} numComponents
     * @param {Uint32Array} vertices, whole TypedArray Uint32Array. It's a pointer in the C++ version
     */
    var renderIntReference = function(dst, gridWidth, gridHeight, numComponents, vertices) {

        /** @type {number} */ var cellW = Math.floor(dst.getWidth() / (gridWidth - 1));
        /** @type {number} */ var cellH = Math.floor(dst.getHeight() / (gridHeight - 1));

        for (var y = 0; y < dst.getHeight(); y++)
        {
            for (var x = 0; x < dst.getWidth(); x++)
            {
                /** @type {number} */ var cellX = deMath.clamp(Math.floor(x / cellW), 0, gridWidth - 2);
                /** @type {number} */ var cellY = deMath.clamp(Math.floor(y / cellH), 0, gridHeight - 2);
                /** @type {Array.<number>} */ var c = readIVec4(vertices[(cellY * gridWidth + cellX + 1) * numComponents], numComponents); // IVec4

                dst.setPixel(c, x, y);
            }
        }
    };

    /** s_swizzles
     * @return {Array.<Array.<number>>}
     */
    var s_swizzles = function() {
        var mat_swizzles = [
            [0, 1, 2, 3],
            [1, 2, 3, 0],
            [2, 3, 0, 1],
            [3, 0, 1, 2],
            [3, 2, 1, 0],
            [2, 1, 0, 3],
            [1, 0, 3, 2],
            [0, 3, 2, 1]
        ];

        return mat_swizzles;
    };

    /** swizzleVec
     * Returns an Array from a position contained in the Array s_swizzles []
     * @param {Array.<number>} vec
     * @param {number} swzNdx
     * @return {Array.<number>} Swizzled array
     */
    var swizzleVec = function(vec, swzNdx) {
    /** @type {Array.<number>} */ var swz = s_swizzles()[swzNdx % s_swizzles().length];

        return deMath.swizzle(vec, swz);
    };

    /**
     * Constructs an AttachmentData object
     * @return {Object}
     */
    var AttachmentData = (function() {
        return {

        /** @type {tcuTexture.TextureFormat} */ format: null, //!< Actual format of attachment.
        /** @type {tcuTexture.TextureFormat} */ referenceFormat: null, //!< Used for reference rendering.
        /** @type {tcuTexture.TextureFormat} */ readFormat: null,
        /** @type {number} */ numWrittenChannels: 0,
        /** @type {gluShaderUtil.Precision} */ outPrecision: null,
        /** @type {Uint8Array} */ renderedData: [],
        /** @type {Uint8Array} */ referenceData: []

        };
    });

    FragmentOutputCase.prototype.iterate = function() {

        // TestLog& log  = m_testCtx.getLog();
        /** @type {Array.<BufferSpec>} */ var m_fboSpec = this.m_fboSpec;
        /** @type {Array.<FragmentOutput>} */ var m_outputs = this.m_outputs;
        /** @type {deqpProgram.ShaderProgram} */ var m_program = this.m_program;
        /** @type {WebGLRenderingContext} */ var gl = this.m_gl;

        // Compute grid size & index list.
        /** @type {number} */ var minCellSize = 8;
        /** @type {Array.<number>} */ var minBufSize = getMinSize(m_fboSpec); // IVec2, array of integers, size = 2
        /** @type {number} */ var gridWidth = deMath.clamp(Math.floor(minBufSize[0] / minCellSize), 1, 255) + 1;
        /** @type {number} */ var gridHeight = deMath.clamp(Math.floor(minBufSize[1] / minCellSize), 1, 255) + 1;
        /** @type {number} */ var numVertices = gridWidth * gridHeight;
        /** @type {number} */ var numQuads = (gridWidth - 1) * (gridHeight - 1);
        /** @type {number} */ var numIndices = numQuads * 6;

        /** @type {number} */ var numInputVecs = getNumInputVectors(m_outputs);
        /** @type {Array.<Uint32Array>} */ var inputs = []; // originally vector<vector<deUint32>
        /** @type {Array.<number>} */ var positions = []; // originally vector<float>
        /** @type {Array.<number>} */ var indices = []; // originally vector<deUint16>
        indices.length = numIndices;

        /** @type {number} */ var readAlignment = 4;
        /** @type {number} */ var viewportW = minBufSize[0];
        /** @type {number} */ var viewportH = minBufSize[1];
        /** @type {number} */ var numAttachments = m_fboSpec.length;

        /** @type {Uint32Array} */ var drawBuffers = []; // originally vector<deUint32>
        drawBuffers.length = numAttachments;
        /** @type {Array.<AttachmentData>} */ var attachments = [];

        // Initialize attachment data.
        for (var ndx = 0; ndx < numAttachments; ndx++)
        {
            /** @type {tcuTexture.TextureFormat} */ var texFmt = gluTextureUtil.mapGLInternalFormat(m_fboSpec[ndx].format);
            /** @type {tcuTextureUtil.TextureChannelClass} */ var chnClass = tcuTextureUtil.getTextureChannelClass(texFmt.type);
            /** @type {boolean} */ var isFixedPoint = (chnClass == tcuTextureUtil.TextureChannelClass.SIGNED_FIXED_POINT ||
                                                              chnClass == tcuTextureUtil.TextureChannelClass.UNSIGNED_FIXED_POINT);

            // \note Fixed-point formats use float reference to enable more accurate result verification.
            /** @type {tcuTexture.TextureFormat} */ var refFmt = isFixedPoint ? tcuTexture.TextureFormat(texFmt.order, tcuTexture.ChannelType.FLOAT) : texFmt; // TODO: check parameters tcuTexture.TextureFormat()
            /** @type {tcuTexture.TextureFormat} */ var readFmt = fboTestUtil.getFramebufferReadFormat(texFmt);
            /** @type {number} */ var attachmentW = m_fboSpec[ndx].width;
            /** @type {number} */ var attachmentH = m_fboSpec[ndx].height;

            drawBuffers[ndx] = gl.COLOR_ATTACHMENT0 + ndx;
            attachments[ndx] = new AttachmentData;
            attachments[ndx].format = texFmt;
            attachments[ndx].readFormat = readFmt;
            attachments[ndx].referenceFormat = refFmt;
            attachments[ndx].renderedData.length = readFmt.getPixelSize() * attachmentW * attachmentH;
            attachments[ndx].referenceData.length = refFmt.getPixelSize() * attachmentW * attachmentH;
        }

        // Initialize indices.
        for (var quadNdx = 0; quadNdx < numQuads; quadNdx++)
        {
            /** @type {number} */ var quadY = Math.floor(quadNdx / (gridWidth - 1));
            /** @type {number} */ var quadX = quadNdx - quadY * (gridWidth - 1);

            indices[quadNdx * 6 + 0] = quadX + quadY * gridWidth;
            indices[quadNdx * 6 + 1] = quadX + (quadY + 1) * gridWidth;
            indices[quadNdx * 6 + 2] = quadX + quadY * gridWidth + 1;
            indices[quadNdx * 6 + 3] = indices[quadNdx * 6 + 1];
            indices[quadNdx * 6 + 4] = quadX + (quadY + 1) * gridWidth + 1;
            indices[quadNdx * 6 + 5] = indices[quadNdx * 6 + 2];
        }

        for (var y = 0; y < gridHeight; y++)
        {
            for (var x = 0; x < gridWidth; x++)
            {
                /** @type {number} */ var xf = Math.floor(x / (gridWidth - 1));
                /** @type {number} */ var yf = Math.floor(y / (gridHeight - 1));

                positions[(y * gridWidth + x) * 4 + 0] = 2.0 * xf - 1.0;
                positions[(y * gridWidth + x) * 4 + 1] = 2.0 * yf - 1.0;
                positions[(y * gridWidth + x) * 4 + 2] = 0.0;
                positions[(y * gridWidth + x) * 4 + 3] = 1.0;
            }
        }

        // Initialize input vectors.
        {
            var curInVec = 0;
            for (var outputNdx = 0; outputNdx < m_outputs.length; outputNdx++)
            {
                /** @type {FragmentOutput} */ var output = m_outputs[outputNdx];
                /** @type {boolean} */ var isFloat = gluShaderUtil.isDataTypeFloatOrVec(output.type);
                /** @type {boolean} */ var isInt = gluShaderUtil.isDataTypeIntOrIVec(output.type);
                /** @type {boolean} */ var isUint = gluShaderUtil.isDataTypeUintOrUVec(output.type);
                /** @type {number} */ var numVecs = output.arrayLength > 0 ? output.arrayLength : 1;
                /** @type {number} */ var numScalars = gluShaderUtil.getDataTypeScalarSize(output.type);

                for (var vecNdx = 0; vecNdx < numVecs; vecNdx++)
                {
                    inputs[curInVec].length = numVertices * numScalars;

                    // Record how many outputs are written in attachment.
                    DE_ASSERT(output.location + vecNdx < attachments.length);
                    attachments[output.location + vecNdx].numWrittenChannels = numScalars;
                    attachments[output.location + vecNdx].outPrecision = output.precision;

                    if (isFloat)
                    {
                     /** @type {Float32Array} */ var range = getFloatRange(output.precision); // Vec2, array of floats, size = 2
                     /** @type {Float32Array} */ var minVal = [range[0], range[0], range[0], range[0]]; // Vec4, array of floats, size = 4
                     /** @type {Float32Array} */ var maxVal = [range[1], range[1], range[1], range[1]]; // Vec4
                     // float* dst = (float*)&inputs[curInVec][0]; // a pointer needed in the next loop

                        if (deMath.deInBounds32(output.location + vecNdx, 0, attachments.length))
                        {
                        // \note Floating-point precision conversion is not well-defined. For that reason we must
                        // limit value range to intersection of both data type and render target value ranges.
                        /** @type {tcuTextureUtil.TextureFormatInfo} */ var fmtInfo = tcuTextureUtil.getTextureFormatInfo(attachments[output.location + vecNdx].format);
                            minVal = deMath.max(minVal, fmtInfo.valueMin);
                            maxVal = deMath.min(maxVal, fmtInfo.valueMax);
                        }

                        console.log('out ' + curInVec + ' value range: ' + minVal + ' -> ' + maxVal);

                        for (var y = 0; y < gridHeight; y++)
                        {
                            for (var x = 0; x < gridWidth; x++)
                            {
                                /** @type {number} */ var xf = Math.floor(x / (gridWidth - 1));
                                /** @type {number} */ var yf = Math.floor(y / (gridHeight - 1));
                                /** @type {number} */ var f0 = (xf + yf) * 0.5;
                                /** @type {number} */ var f1 = 0.5 + (xf - yf) * 0.5;

                                /** @type {Float32Array} */ var f = swizzleVec([f0, f1, 1.0 - f0, 1.0 - f1], curInVec); // Vec4
                                /** @type {Float32Array} */ var c = deMath.multiply(deMath.add(minVal, deMath.subtract(maxVal, minVal)), f); // Vec4


                                // this is a pointer which is incremented, originally pos = dst + (y*gridWidth + x)*numScalars;
                                /** @type {number} */ var pos = (y * gridWidth + x) * numScalars;
                                // which dst, is a pointer at inputs[]: float* dst = (float*)&inputs[curInVec][0]

                                for (var ndx = 0; ndx < numScalars; ndx++)
                                 // TODO: toUInt32() conversion? inputs[curInVec][pos] is an Uint32, and c[ndx] a float
                                    inputs[curInVec][pos] = c[ndx]; // pos changes every iteration!
                            }
                        }
                    }
                    else if (isInt)
                    {
                        /** @type {Int32Array} */ var range = getIntRange(output.precision); // IVec2
                        /** @type {Int32Array} */ var minVal = [range[0], range[0], range[0], range[0]]; // IVec4
                        /** @type {Int32Array} */ var maxVal = [range[1], range[1], range[1], range[1]]; // IVec4

                        if (deMath.deInBounds32(output.location + vecNdx, 0, attachments.length))
                        {
                            // Limit to range of output format as conversion mode is not specified.
                            /** @type {Int32Array} */ var fmtBits = tcuTextureUtil.getTextureFormatBitDepth(attachments[output.location + vecNdx].format); // IVec4
                            /** @type {Array.<boolean>} */ var isZero = deMath.lessThanEqual(fmtBits, [0, 0, 0, 0]); // BVec4, array of booleans, size = 4

                            /** @type {Int32Array} */ var fmtMinVal = []; // IVec4
                            fmtMinVal.length = 4;
                            /** @type {Int32Array} */ var fmtMaxVal = []; // IVec4
                            fmtMaxVal.length = 4;
                            /** @type {Int32Array} */ var deInt = [1, 1, 1, 1]; // instead of deInt64, Vector<deInt64, 4>(1)

                            for (var i = 0; i < 4; i++) {

                                // const IVec4 fmtMinVal = (-(tcu::Vector<deInt64, 4>(1) << (fmtBits - 1 ).cast<deInt64>())).asInt();
                                fmtMinVal[i] = deInt[i] * Math.pow(2, fmtBits[i] - 1); // TODO: check implementation, original above
                                // const IVec4 fmtMaxVal = ((tcu::Vector<deInt64, 4>(1) << (fmtBits - 1 ).cast<deInt64>()) - deInt64(1)).asInt();
                                fmtMaxVal[i] = deInt[i] * Math.pow(2, fmtBits[i] - 1 - deInt[i]); // TODO: check implementation, original above
                            }

                            minVal = tcuTextureUtil.select(minVal, deMath.max(minVal, fmtMinVal), isZero);
                            maxVal = tcuTextureUtil.select(maxVal, deMath.min(maxVal, fmtMaxVal), isZero);
                        }

                        console.log('out ' + curInVec + ' value range: ' + minVal + ' -> ' + maxVal);

                        /** @type {Int32Array} */
                        var rangeDiv = swizzleVec([gridWidth - 1, gridHeight - 1, gridWidth - 1, gridHeight - 1], curInVec); // IVec4
                        /** @type {Int32Array} */ var step = []; // IVec4
                        step.length = 4;
                        /** @type {Int32Array} */ var deInt = [1, 1, 1, 1]; // instead of the original deInt64
                        for (var i = 0; i < 4; i++) {
                            // const IVec4 step = ((maxVal.cast<deInt64>() - minVal.cast<deInt64>()) / (rangeDiv.cast<deInt64>())).asInt();
                            step[i] = Math.floor((maxVal[i] - minVal[i]) / rangeDiv[i]); // TODO: check with the above line of code

                        }
                        // deInt32* dst = (deInt32*)&inputs[curInVec][0]; // a pointer needed in the next loop in the C++ version

                        for (var y = 0; y < gridHeight; y++)
                        {
                            for (var x = 0; x < gridWidth; x++)
                            {
                                /** @type {number} */ var ix = gridWidth - x - 1;
                                /** @type {number} */ var iy = gridHeight - y - 1;
                                /** @type {Array.<number>} */ var c = deMath.add(minVal, deMath.multiply(step, swizzleVec([x, y, ix, iy], curInVec))); // IVec4

                                // this is a pointer which is incremented, originally dst + (y*gridWidth + x)*numScalars;
                                /** @type {number} */ var pos = (y * gridWidth + x) * numScalars;
                                // which dst, is a pointer at an array in inputs: float* dst = (float*)&inputs[curInVec][0]

                                // TODO: DE_ASSERT(deMath.boolAll(logicalAnd(greaterThanEqual(c, minVal), deMath.lessThanEqual(c, maxVal))));

                                for (var ndx = 0; ndx < numScalars; ndx++)
                                 // TODO: validate toUInt32() conversion, inputs[curInVec][v] is an Uint32, and c[ndx] an Int
                                    inputs[curInVec][pos] = c[ndx]; // pos changes every iteration!
                            }
                        }
                    }
                    else if (isUint)
                    {
                        /** @type {Uint32Array} */ var range = getUintRange(output.precision); // UVec2
                        /** @type {Uint32Array} */ var maxVal = [range[1], range[1], range[1], range[1]]; // UVec4

                        if (deMath.deInBounds32(output.location + vecNdx, 0, attachments.length))
                        {
                            // Limit to range of output format as conversion mode is not specified.
                            /** @type {Int32Array} */ var fmtBits = tcuTextureUtil.getTextureFormatBitDepth(attachments[output.location + vecNdx].format); // IVec4
                            /** @type {Uint32Array} */ var fmtMaxVal = []; // UVec4
                            fmtMaxVal.length = 4;
                            /** @type {Uint32Array} */ var deUint = [1, 1, 1, 1]; // instead of original deUint64, Vector<deUint64, 4>(1)

                            for (var i = 0; i < 4; i++) {
                                // const UVec4 fmtMaxVal = ((tcu::Vector<deUint64, 4>(1) << fmtBits.cast<deUint64>()) - deUint64(1)).asUint();
                                fmtMaxVal[i] = deUint[i] << fmtBits[i] - deUint[i]; // TODO: check implementation, original above. There is not ArrayUint64 in JavaScript
                            }

                            maxVal = deMath.min(maxVal, fmtMaxVal);
                        }

                        console.log('out ' + curInVec + ' value range: ' + minVal + ' -> ' + maxVal);

                        /** @type {Int32Array} */
                        var rangeDiv = swizzleVec([gridWidth - 1, gridHeight - 1, gridWidth - 1, gridHeight - 1], curInVec); // IVec4

                        /** @type {Uint32Array} */ var step = []; // UVec4
                        step.length = 4;

                        for (var stepPos = 0; stepPos < maxVal.length; stepPos++) {
                            step[stepPos] = Math.floor(maxVal[stepPos] / rangeDiv[stepPos]);
                        }

                        // deUint32*  dst = &inputs[curInVec][0]; // a pointer used in the next loop

                        DE_ASSERT(range[0] == 0);

                        for (var y = 0; y < gridHeight; y++)
                        {
                            for (var x = 0; x < gridWidth; x++)
                            {
                                /** @type {number} */ var ix = gridWidth - x - 1;
                                /** @type {number} */ var iy = gridHeight - y - 1;
                                /** @type {Uint32Array} */ var c = deMath.multiply(step, swizzleVec([x, y, ix, iy], curInVec)); // UVec4
                                /** @type {number} */ var pos = (y * gridWidth + x) * numScalars;

                                DE_ASSERT(deMath.boolAll(deMath.lessThanEqual(c, maxVal)));

                                for (var ndx = 0; ndx < numScalars; ndx++)
                                    inputs[curInVec][pos] = c[ndx]; // pos changes every iteration!
                            }
                        }
                    }
                    else
                        DE_ASSERT(false);

                    curInVec += 1;
                }
            }
        }

        // Render using gl.
        gl.useProgram(m_program.getProgram());
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.m_framebuffer);
        gl.viewport(0, 0, viewportW, viewportH);
        gl.drawBuffers(drawBuffers.length, drawBuffers);
        gl.disable(gl.DITHER); // Dithering causes issues with unorm formats. Those issues could be worked around in threshold, but it makes validation less accurate.
        GLU_EXPECT_NO_ERROR(gl.getError(), 'After program setup');

        {
            curInVec = 0;
            for (var outputNdx = 0; outputNdx < m_outputs.length; outputNdx++)
            {
                /** @type {FragmentOutput} */ var output = m_outputs[outputNdx];
                /** @type {boolean} */ var isArray = output.arrayLength > 0;
                /** @type {boolean} */ var isFloat = gluShaderUtil.isDataTypeFloatOrVec(output.type);
                /** @type {boolean} */ var isInt = gluShaderUtil.isDataTypeIntOrIVec(output.type);
                /** @type {boolean} */ var isUint = gluShaderUtil.isDataTypeUintOrUVec(output.type);
                /** @type {number} */ var scalarSize = gluShaderUtil.getDataTypeScalarSize(output.type);
                /** @type {number} */ var glScalarType = isFloat ? /* gluShaderUtil.DataType.FLOAT */ gl.FLOAT :
                                                         isInt ? /* gluShaderUtil.DataType.INT */ gl.INT :
                                                         isUint ? /* gluShaderUtil.DataType.UINT */ gl.UNSIGNED_INT : /* gluShaderUtil.DataType.INVALID */ gl.NONE;
                /** @type {number} */ var numVecs = isArray ? output.arrayLength : 1;

                for (var vecNdx = 0; vecNdx < numVecs; vecNdx++)
                {
                    /** @type {string} */ var name = 'in' + outputNdx + (isArray ? '_' + vecNdx : '');
                    /** @type {number} */ var loc = gl.getAttribLocation(m_program.getProgram(), name);

                    if (loc >= 0)
                    {
                        gl.enableVertexAttribArray(loc);
                        if (isFloat)
                            // KHRONOS specification: void vertexAttribIPointer(GLuint index, GLint size, GLenum type, GLsizei stride, GLintptr offset)
                            gl.vertexAttribPointer(loc, scalarSize, glScalarType, gl.FALSE, 0, inputs[curInVec][0]); // TODO: check offset = inputs[curInVec][0] ?
                        else
                            gl.vertexAttribIPointer(loc, scalarSize, glScalarType, 0, inputs[curInVec][0], 0); // offset = 0
                    }
                    else
                        bufferedLogToConsole('Warning: No location for attribute "' + name + '" found.');

                    curInVec += 1;
                }
            }
        }
        {
            /** @type {string} */ var posLoc = gl.getAttribLocation(m_program.getProgram(), 'a_position');
            // TODO: TCU_CHECK(posLoc >= 0);
            gl.enableVertexAttribArray(posLoc);
            gl.vertexAttribPointer(posLoc, 4, gl.FLOAT, gl.FALSE, 0, positions);
        }
        GLU_EXPECT_NO_ERROR(gl.getError(), 'After attribute setup');

        gl.drawElements(gl.TRIANGLES, numIndices, gl.UNSIGNED_SHORT, indices);
        GLU_EXPECT_NO_ERROR(gl.getError(), 'glDrawElements');

        // Read all attachment points.
        for (var ndx = 0; ndx < numAttachments; ndx++)
        {
            /** @type {gluTextureUtil.TransferFormat} */ var transferFmt = gluTextureUtil.getTransferFormat(attachments[ndx].readFormat);
            var dst = attachments[ndx].renderedData; // void* dst = &attachments[ndx].renderedData[0]; // originally a pointer but needed in gl.readPixels

            gl.readBuffer(gl.COLOR_ATTACHMENT0 + ndx);
            // KHRONOS specification: void glReadPixels(GLint x, GLint y, GLsizei width, GLsizei height, GLenum format, GLenum type, GLvoid * data);
            gl.readPixels(0, 0, minBufSize[0], minBufSize[1], transferFmt.format, transferFmt.dataType, dst);
        }

        // Render reference images.
        {
            var curInNdx = 0;
            for (var outputNdx = 0; outputNdx < m_outputs.length; outputNdx++)
            {
                /** @type {FragmentOutput} */ var output = m_outputs[outputNdx];
                /** @type {boolean} */ var isArray = output.arrayLength > 0;
                /** @type {boolean} */ var isFloat = gluShaderUtil.isDataTypeFloatOrVec(output.type);
                /** @type {boolean} */ var isInt = gluShaderUtil.isDataTypeIntOrIVec(output.type);
                /** @type {boolean} */ var isUint = gluShaderUtil.isDataTypeUintOrUVec(output.type);
                /** @type {number} */ var scalarSize = gluShaderUtil.getDataTypeScalarSize(output.type);
                /** @type {number} */ var numVecs = isArray ? output.arrayLength : 1;

                for (var vecNdx = 0; vecNdx < numVecs; vecNdx++)
                {
                    /** @type {number} */ var location = output.location + vecNdx;
                    /** @type {Uint32Array} */ var inputData = inputs[curInNdx];

                    DE_ASSERT(deMath.deInBounds32(location, 0, m_fboSpec.length));

                    /** @type {number} */ var bufW = m_fboSpec[location].width;
                    /** @type {number} */ var bufH = m_fboSpec[location].height;
                    /** @type {Object} */ var descriptor = {
                            format: attachments[location].referenceFormat,
                            width: bufW,
                            height: bufH,
                            depth: 1,
                            data: attachments[location].referenceData
                    };
                    /** @type {tcuTexture.PixelBufferAccess} */ var buf = tcuTexture.PixelBufferAccess(descriptor);
                    /** @type {tcuTexture.PixelBufferAccess} */ var viewportBuf = tcuTextureUtil.getSubregion(buf, 0, 0, 0, viewportW, viewportH, 1);

                    if (isInt || isUint)
                        renderIntReference(viewportBuf, gridWidth, gridHeight, scalarSize, inputData);
                    else if (isFloat)
                        renderFloatReference(viewportBuf, gridWidth, gridHeight, scalarSize, inputData);
                    else
                        DE_ASSERT(false);

                    curInNdx += 1;
                }
            }
        }

        // Compare all images.
        /** @type {boolean} */ var allLevelsOk = true;
        for (var attachNdx = 0; attachNdx < numAttachments; attachNdx++)
        {
            /** @type {number} */ var attachmentW = m_fboSpec[attachNdx].width;
            /** @type {number} */ var attachmentH  = m_fboSpec[attachNdx].height;
            /** @type {number} */ var numValidChannels = attachments[attachNdx].numWrittenChannels;
            /** @type {Array.<boolean>} */ var cmpMask = [numValidChannels >= 1, numValidChannels >= 2, numValidChannels >= 3, numValidChannels >= 4];
            /** @type {gluShaderUtil.Precision} */ var outPrecision = attachments[attachNdx].outPrecision;
            /** @type {tcuTexture.TextureFormat} */ var format = attachments[attachNdx].format;
            /** @type {Object} */
            var renderedDescriptor = {
                    // TODO: check attributes of this object for descriptor in tcuTexture.ConstPixelBufferAccess
                    format: attachments[attachNdx].readFormat,
                    width: attachmentW,
                    height: attachmentH,
                    depth: 1,
                    rowPitch: deMath.deAlign32(attachments[attachNdx].readFormat.getPixelSize() * attachmentW, readAlignment),
                    slicePitch: 0,
                    data: attachments[attachNdx].renderedData
            };
            /** @type {tcuTexture.ConstPixelBufferAccess} */ var rendered = tcuTexture.ConstPixelBufferAccess(renderedDescriptor);

            /** @type {Object} */
            var referenceDescriptor = {
                    // TODO: check attributes of this object for descriptor in tcuTexture.ConstPixelBufferAccess
                    format: attachments[attachNdx].referenceFormat,
                    width: attachmentW,
                    height: attachmentH,
                    depth: 1,
                    data: attachments[attachNdx].referenceData
            };
            /** @type {tcuTexture.ConstPixelBufferAccess} */ var reference = tcuTexture.ConstPixelBufferAccess(referenceDescriptor);
            /** @type {tcuTextureUtil.TextureChannelClass} */ var texClass = tcuTextureUtil.getTextureChannelClass(format.type);
            /** @type {boolean} */ var isOk = true;
            /** @type {string} */ var name = 'Attachment ' + attachNdx;
            /** @type {string} */ var desc = 'Color attachment ' + attachNdx;

            bufferedLogToConsole('Attachment ' + attachNdx + ': ' + numValidChannels + ' channels have defined values and used for comparison');

            switch (texClass)
            {
                case tcuTextureUtil.TextureChannelClass.FLOATING_POINT:
                {
                    /** @type {Uint32Array} */ var formatThreshold = []; // UVec4 //!< Threshold computed based on format.
                    formatThreshold.length = 4;
                    /** @type {number} */ var precThreshold = 0; // deUint32 //!< Threshold computed based on output type precision
                    /** @type {Uint32Array} */ var finalThreshold = []; // UVec4
                    finalThreshold.length = 4;

                    switch (format.type)
                    {
                        case tcuTexture.ChannelType.FLOAT:
                            formatThreshold = [4, 4, 4, 4]; // UVec4
                            break;
                        case tcuTexture.ChannelType.HALF_FLOAT:
                            formatThreshold = [(1 << 13) + 4, (1 << 13) + 4, (1 << 13) + 4, (1 << 13) + 4]; // UVec4
                            break;
                        case tcuTexture.ChannelType.UNSIGNED_INT_11F_11F_10F_REV:
                            formatThreshold = [(1 << 17) + 4, (1 << 17) + 4, (1 << 18) + 4, 4]; // UVec4
                            break;
                        default:
                            DE_ASSERT(false);
                            break;
                    }

                    switch (outPrecision)
                    {
                        case gluShaderUtil.Precision.PRECISION_LOWP:
                            precThreshold = (1 << 21);
                            break;
                        case gluShaderUtil.Precision.PRECISION_MEDIUMP:
                            precThreshold = (1 << 13);
                            break;
                        case gluShaderUtil.Precision.PRECISION_HIGHP:
                            precThreshold = 0;
                            break;
                        default:
                            DE_ASSERT(false);
                    }

                    finalThreshold = tcuTextureUtil.select(
                                    deMath.max(formatThreshold, [precThreshold, precThreshold, precThreshold, precThreshold]),
                                    [1, 1, 1, 1], // C++ version: UVec4(~0u) bitwise not, all bits in the integer will be flipped
                                    cmpMask);

                    isOk = tcuImageCompare.floatUlpThresholdCompare(name, desc, reference, rendered, finalThreshold /*, tcu::COMPARE_LOG_RESULT*/);
                    break;
                }

                case tcuTextureUtil.TextureChannelClass.UNSIGNED_FIXED_POINT:
                {
                    // \note glReadPixels() allows only 8 bits to be read. This means that RGB10_A2 will loose some
                    // bits in the process and it must be taken into account when computing threshold.
                    /** @type {Int32Array} */ var bits = deMath.min([8, 8, 8, 8], tcuTextureUtil.getTextureFormatBitDepth(format)); // IVec4

                    /** @type {Float32Array} */ var baseThreshold = []; // Vec4
                    baseThreshold.length = 4;
                    for (var inc = 0; inc < baseThreshold.length; inc++) {
                        // TODO: check the operation below: baseThreshold = 1.0f / ((IVec4(1) << bits)-1).asFloat();
                        baseThreshold[inc] = 1.0 / ((1 << bits[inc]) - 1);
                    }

                    /** @type {Float32Array} */ var threshold = tcuTextureUtil.select(baseThreshold, [2.0, 2.0, 2.0, 2.0], cmpMask); // Vec4

                    isOk = tcuImageCompare.floatThresholdCompare(name, desc, reference, rendered, threshold/*, tcu::COMPARE_LOG_RESULT*/);
                    break;
                }

                case tcuTextureUtil.TextureChannelClass.SIGNED_INTEGER:
                case tcuTextureUtil.TextureChannelClass.UNSIGNED_INTEGER:
                {
                    /** @type {Uint32Array} */
                    var threshold = tcuTextureUtil.select(
                                    [0, 0, 0, 0],
                                    [1, 1, 1, 1],
                                    cmpMask
                                    ); // UVec4
                    isOk = tcuImageCompare.intThresholdCompare(name, desc, reference, rendered, threshold/*, tcu::COMPARE_LOG_RESULT*/);
                    break;
                }

                default:
                    TCU_FAIL('Unsupported comparison');
                    break;
            }

            if (!isOk)
                allLevelsOk = false;
        }

        return deqpTests.runner.IterateResult.STOP;
    };

    /** createRandomCase
     * Creates the createRandomCase, child class of FragmentOutputCase
     * @param {WebGLRenderingContext} gl WebGL context
     * @param {number} minRenderTargets
     * @param {number} maxRenderTargets
     * @param {number} seed
     * @return {FragmentOutputCase} The currently modified object
     */
    var createRandomCase = function (gl, minRenderTargets, maxRenderTargets, seed) {

        /** @type {Array.<gluShaderUtil.DataType>} */
        var outputTypes = [
                           gluShaderUtil.DataType.FLOAT,
                           gluShaderUtil.DataType.FLOAT_VEC2,
                           gluShaderUtil.DataType.FLOAT_VEC3,
                           gluShaderUtil.DataType.FLOAT_VEC4,
                           gluShaderUtil.DataType.INT,
                           gluShaderUtil.DataType.INT_VEC2,
                           gluShaderUtil.DataType.INT_VEC3,
                           gluShaderUtil.DataType.INT_VEC4,
                           gluShaderUtil.DataType.UINT,
                           gluShaderUtil.DataType.UINT_VEC2,
                           gluShaderUtil.DataType.UINT_VEC3,
                           gluShaderUtil.DataType.UINT_VEC4
                           ];

        /** @type {Array.<gluShaderUtil.precision>} */
        var precisions = [
                          gluShaderUtil.precision.PRECISION_LOWP,
                          gluShaderUtil.precision.PRECISION_MEDIUMP,
                          gluShaderUtil.precision.PRECISION_HIGHP
                          ];

        /** @type {Array.<GLenum>} */
        var floatFormats = [
                            gl.RGBA32F,
                            gl.RGBA16F,
                            gl.R11F_G11F_B10F,
                            gl.RG32F,
                            gl.RG16F,
                            gl.R32F,
                            gl.R16F,
                            gl.RGBA8,
                            gl.SRGB8_ALPHA8,
                            gl.RGB10_A2,
                            gl.RGBA4,
                            gl.RGB5_A1,
                            gl.RGB8,
                            gl.RGB565,
                            gl.RG8,
                            gl.R8
                            ];

        /** @type {Array.<GLenum>} */
        var intFormats = [
                            gl.RGBA32I,
                            gl.RGBA16I,
                            gl.RGBA8I,
                            gl.RG32I,
                            gl.RG16I,
                            gl.RG8I,
                            gl.R32I,
                            gl.R16I,
                            gl.R8I
                            ];

        /** @type {Array.<GLenum>} */
        var uintFormats = [
                           gl.RGBA32UI,
                           gl.RGBA16UI,
                           gl.RGBA8UI,
                           gl.RGB10_A2UI,
                           gl.RG32UI,
                           gl.RG16UI,
                           gl.RG8UI,
                           gl.R32UI,
                           gl.R16UI,
                           gl.R8UI
                           ];

        /** @type {Array.<number>} */ var rnd = new deRandom.Random(seed);
        /** @type {Array.<FragmentOutput>} */ var outputs = [];
        /** @type {Array.<BufferSpec>} */ var targets = [];
        /** @type {Array.<gluShaderUtil.DataType>} */ var outTypes = [];
      
        /** @type {number} */ var numTargets = rnd.getInt(minRenderTargets, maxRenderTargets);
        /** @type {number} */ var width = 128; // \todo [2012-04-10 pyry] Separate randomized sizes per target?
        /** @type {number} */ var height = 64;
        /** @type {number} */ var samples = 0;

        // Compute outputs.
        /** @type {number} */ var curLoc = 0;
        while (curLoc < numTargets)
        {
            /** @type {boolean} */ var useArray = rnd.getFloat() < 0.3;
            /** @type {number} */ var maxArrayLen = numTargets - curLoc;
            /** @type {number} */ var arrayLen = useArray ? rnd.getInt(1, maxArrayLen) : 0;
            /** @type {Array.<gluShaderUtil.DataType>} */ var basicType = rnd.choose(outputTypes, outputTypes.length); // TODO: check second parameter: &outputTypes[0] + DE_LENGTH_OF_ARRAY(outputTypes)
            /** @type {Array.<gluShaderUtil.precision>} */ var precision = rnd.choose(precisions, precisions.length); // TODO: check second parameter: &precisions[0] + DE_LENGTH_OF_ARRAY(precisions)
            /** @type {number} */ var numLocations = useArray ? arrayLen : 1;

            outputs.push(new FragmentOutput(basicType, precision, curLoc, arrayLen));

            for (var ndx = 0; ndx < numLocations; ndx++)
                outTypes.push(basicType);

            curLoc += numLocations;
        }
        DE_ASSERT(curLoc == numTargets);
        DE_ASSERT(outTypes.length == numTargets);

        // Compute buffers.
        while (targets.length < numTargets)
        {
            /** @type {Array.<gluShaderUtil.DataType>} */ var outType = outTypes[targets.size()];
            /** @type {boolean} */ var isFloat = gluShaderUtil.isDataTypeFloatOrVec(outType);
            /** @type {boolean} */ var isInt = gluShaderUtil.isDataTypeIntOrIVec(outType);
            /** @type {boolean} */ var isUint = gluShaderUtil.isDataTypeUintOrUVec(outType);
            /** @type {number} */ var format = 0; // deUint32

            if (isFloat)
                format = rnd.choose(floatFormats, null, floatFormats.length); // TODO: check second parameter: &floatFormats[0] + DE_LENGTH_OF_ARRAY(floatFormats)
            else if (isInt)
                format = rnd.choose(intFormats, null, intFormats.length); // TODO: check second parameter: &intFormats[0] + DE_LENGTH_OF_ARRAY(intFormats)
            else if (isUint)
                format = rnd.choose(uintFormats, null, uintFormats.length); // TODO: check second parameter: &uintFormats[0] + DE_LENGTH_OF_ARRAY(uintFormats)
            else
                DE_ASSERT(false);

            targets.push(new BufferSpec(format, width, height, samples));
        }

        return new FragmentOutputCase(gl, seed, '', targets, outputs);

    };
    
    var init = function(gl) {

        var state = deqpTests.runner.getState();
        /** @const @type {deqpTests.DeqpTest} */ var testGroup = state.testCases;

        /** @type {Array.<GLenum>} */
        var requiredFloatFormats = [
            gl.RGBA32F,
            gl.RGBA16F,
            gl.R11F_G11F_B10F,
            gl.RG32F,
            gl.RG16F,
            gl.R32F,
            gl.R16F
        ];

        /** @type {Array.<GLenum>} */
        var requiredFixedFormats = [
            gl.RGBA8,
            gl.SRGB8_ALPHA8,
            gl.RGB10_A2,
            gl.RGBA4,
            gl.RGB5_A1,
            gl.RGB8,
            gl.RGB565,
            gl.RG8,
            gl.R8
        ];

        /** @type {Array.<GLenum>} */
        var requiredIntFormats = [
            gl.RGBA32I,
            gl.RGBA16I,
            gl.RGBA8I,
            gl.RG32I,
            gl.RG16I,
            gl.RG8I,
            gl.R32I,
            gl.R16I,
            gl.R8I
        ];

        /** @type {Array.<GLenum>} */
        var requiredUintFormats = [
            gl.RGBA32UI,
            gl.RGBA16UI,
            gl.RGBA8UI,
            gl.RGB10_A2UI,
            gl.RG32UI,
            gl.RG16UI,
            gl.RG8UI,
            gl.R32UI,
            gl.R16UI,
            gl.R8UI
        ];

        /** @type {Array.<gluShaderUtil.precision>} */
        var precisions = [

            gluShaderUtil.precision.PRECISION_LOWP,
            gluShaderUtil.precision.PRECISION_MEDIUMP,
            gluShaderUtil.precision.PRECISION_HIGHP

        ];

     // .basic.
        {
            /** @type {deqpTests.DeqpTest} */ var basicGroup = deqpTests.newTest('basic', 'Basic fragment output tests');
            testGroup.addChild(basicGroup);

            /** @const @type {number} */ var width = 64;
            /** @const @type {number} */ var height = 64;
            /** @const @type {number} */ var samples = 0;

            // .float
            /** @type {deqpTests.DeqpTest} */ var floatGroup = deqpTests.newTest('float', 'Floating-point output tests');
            basicGroup.addChild(floatGroup);

            for (var fmtNdx = 0; fmtNdx < requiredFloatFormats.length; fmtNdx++)
            {
                /** @type {number} */ var format = requiredFloatFormats[fmtNdx];
                /** @type {string} */ var fmtName = fboTestUtil.getFormatName(format);
                /** @type {Array.<BufferSpec>} */ var fboSpec = [];

                fboSpec.push(new BufferSpec(format, width, height, samples));

                for (var precNdx = 0; precNdx < precisions.length; precNdx++)
                {
                    /** @type {Array.<gluShaderUtil.precision>} */ var prec = precisions[precNdx];
                    /** @type {string} */ var precName = gluShaderUtil.getPrecisionName(prec);

                    floatGroup.addChild(new FragmentOutputCase(gl, fmtName + '_' + precName + '_float', '', fboSpec, OutputVec(new FragmentOutput(gluShaderUtil.DataType.FLOAT, prec, 0))));
                    floatGroup.addChild(new FragmentOutputCase(gl, fmtName + '_' + precName + '_vec2', '', fboSpec, OutputVec(new FragmentOutput(gluShaderUtil.DataType.FLOAT_VEC2, prec, 0))));
                    floatGroup.addChild(new FragmentOutputCase(gl, fmtName + '_' + precName + '_vec3', '', fboSpec, OutputVec(new FragmentOutput(gluShaderUtil.DataType.FLOAT_VEC3, prec, 0))));
                    floatGroup.addChild(new FragmentOutputCase(gl, fmtName + '_' + precName + '_vec4', '', fboSpec, OutputVec(new FragmentOutput(gluShaderUtil.DataType.FLOAT_VEC4, prec, 0))));
                }
            }

         // .fixed
            /** @type {deqpTests.DeqpTest} */ var fixedGroup = deqpTests.newTest('fixed', 'Fixed-point output tests');
            basicGroup.addChild(fixedGroup);
            for (var fmtNdx = 0; fmtNdx < requiredFixedFormats.length; fmtNdx++)
            {
                /** @type {number} */ var format  = requiredFixedFormats[fmtNdx];
                /** @type {string} */ var fmtName = fboTestUtil.getFormatName(format);
                /** @type {Array.<BufferSpec>} */ var fboSpec = [];
    
                fboSpec.push(new BufferSpec(format, width, height, samples));
    
                for (var precNdx = 0; precNdx < precisions.length; precNdx++)
                {
                    /** @type {Array.<gluShaderUtil.precision>} */ var prec = precisions[precNdx];
                    /** @type {string} */ var precName = gluShaderUtil.getPrecisionName(prec);
    
                    fixedGroup.addChild(new FragmentOutputCase(gl, fmtName + '_' + precName + '_float', '', fboSpec, OutputVec(new FragmentOutput(gluShaderUtil.DataType.FLOAT, prec, 0))));
                    fixedGroup.addChild(new FragmentOutputCase(gl, fmtName + '_' + precName + '_vec2', '', fboSpec, OutputVec(new FragmentOutput(gluShaderUtil.DataType.FLOAT_VEC2, prec, 0))));
                    fixedGroup.addChild(new FragmentOutputCase(gl, fmtName + '_' + precName + '_vec3', '', fboSpec, OutputVec(new FragmentOutput(gluShaderUtil.DataType.FLOAT_VEC3, prec, 0))));
                    fixedGroup.addChild(new FragmentOutputCase(gl, fmtName + '_' + precName + '_vec4', '', fboSpec, OutputVec(new FragmentOutput(gluShaderUtil.DataType.FLOAT_VEC4, prec, 0))));
                }
            }
    
         // .int
            /** @type {deqpTests.DeqpTest} */ var intGroup = deqpTests.newTest('int', 'Integer output tests');
            basicGroup.addChild(intGroup);
            for (var fmtNdx = 0; fmtNdx < requiredIntFormats.length; fmtNdx++)
            {
                /** @type {number} */ var format = requiredIntFormats[fmtNdx];
                /** @type {string} */ var fmtName = fboTestUtil.getFormatName(format);
                /** @type {Array.<BufferSpec>} */ var fboSpec = [];
    
                fboSpec.push(new BufferSpec(format, width, height, samples));
    
                for (var precNdx = 0; precNdx < precisions.length; precNdx++)
                {
                    /** @type {Array.<gluShaderUtil.precision>} */ var prec = precisions[precNdx];
                    /** @type {string} */ var precName = gluShaderUtil.getPrecisionName(prec);
    
                    intGroup.addChild(new FragmentOutputCase(gl, fmtName + '_' + precName + '_int', '', fboSpec, OutputVec(new FragmentOutput(gluShaderUtil.DataType.INT, prec, 0))));
                    intGroup.addChild(new FragmentOutputCase(gl, fmtName + '_' + precName + '_ivec2', '', fboSpec, OutputVec(new FragmentOutput(gluShaderUtil.DataType.INT_VEC2, prec, 0))));
                    intGroup.addChild(new FragmentOutputCase(gl, fmtName + '_' + precName + '_ivec3', '', fboSpec, OutputVec(new FragmentOutput(gluShaderUtil.DataType.INT_VEC3, prec, 0))));
                    intGroup.addChild(new FragmentOutputCase(gl, fmtName + '_' + precName + '_ivec4', '', fboSpec, OutputVec(new FragmentOutput(gluShaderUtil.DataType.INT_VEC4, prec, 0))));
                }
            }
    
         // .uint
            /** @type {deqpTests.DeqpTest} */ var uintGroup = deqpTests.newTest('uint', 'Usigned integer output tests');
            basicGroup.addChild(uintGroup);
            for (var fmtNdx = 0; fmtNdx < requiredUintFormats.length; fmtNdx++)
            {
                /** @type {number} */ var format = requiredUintFormats[fmtNdx];
                /** @type {string} */ var fmtName = fboTestUtil.getFormatName(format);
                /** @type {Array.<BufferSpec>} */ var fboSpec = [];
    
                fboSpec.push(new BufferSpec(format, width, height, samples));
    
                for (var precNdx = 0; precNdx < precisions.length; precNdx++)
                {
                    /** @type {Array.<gluShaderUtil.precision>} */ var prec = precisions[precNdx];
                    /** @type {string} */ var precName = gluShaderUtil.getPrecisionName(prec);
    
                    uintGroup.addChild(new FragmentOutputCase(gl, fmtName + '_' + precName + '_uint', '', fboSpec, OutputVec(new FragmentOutput(gluShaderUtil.DataType.UINT, prec, 0))));
                    uintGroup.addChild(new FragmentOutputCase(gl, fmtName + '_' + precName + '_uvec2', '', fboSpec, OutputVec(new FragmentOutput(gluShaderUtil.DataType.UINT_VEC2, prec, 0))));
                    uintGroup.addChild(new FragmentOutputCase(gl, fmtName + '_' + precName + '_uvec3', '', fboSpec, OutputVec(new FragmentOutput(gluShaderUtil.DataType.UINT_VEC3, prec, 0))));
                    uintGroup.addChild(new FragmentOutputCase(gl, fmtName + '_' + precName + '_uvec4', '', fboSpec, OutputVec(new FragmentOutput(gluShaderUtil.DataType.UINT_VEC4, prec, 0))));
    
                }
            }
        }

     // .array
        {
            /** @type {deqpTests.DeqpTest} */ var arrayGroup = deqpTests.newTest('array', 'Array outputs');
            testGroup.addChild(arrayGroup);

            width = 64;
            height = 64;
            samples = 0;
            /** @type {number} */ var numTargets = 3;

            // .float
            /** @type {deqpTests.DeqpTest} */ var arrayFloatGroup = deqpTests.newTest('float', 'Floating-point output tests');
            arrayGroup.addChild(arrayFloatGroup);
            for (var fmtNdx = 0; fmtNdx < requiredFloatFormats.length; fmtNdx++)
            {
                /** @type {number} */ var format = requiredFloatFormats[fmtNdx];
                /** @type {string} */ var fmtName = fboTestUtil.getFormatName(format);
                /** @type {Array.<BufferSpec>} */ var fboSpec = [];

                for (var ndx = 0; ndx < numTargets; ndx++)
                    fboSpec.push(new BufferSpec(format, width, height, samples));

                for (var precNdx = 0; precNdx < precisions.length; precNdx++)
                {
                    /** @type {Array.<gluShaderUtil.precision>} */ var prec = precisions[precNdx];
                    /** @type {string} */ var precName = gluShaderUtil.getPrecisionName(prec);

                    arrayFloatGroup.addChild(new FragmentOutputCase(gl, fmtName + '_' + precName + '_float', '', fboSpec, OutputVec(new FragmentOutput(gluShaderUtil.DataType.FLOAT, prec, 0, numTargets))));
                    arrayFloatGroup.addChild(new FragmentOutputCase(gl, fmtName + '_' + precName + '_vec2', '', fboSpec, OutputVec(new FragmentOutput(gluShaderUtil.DataType.FLOAT_VEC2, prec, 0, numTargets))));
                    arrayFloatGroup.addChild(new FragmentOutputCase(gl, fmtName + '_' + precName + '_vec3', '', fboSpec, OutputVec(new FragmentOutput(gluShaderUtil.DataType.FLOAT_VEC3, prec, 0, numTargets))));
                    arrayFloatGroup.addChild(new FragmentOutputCase(gl, fmtName + '_' + precName + '_vec4', '', fboSpec, OutputVec(new FragmentOutput(gluShaderUtil.DataType.FLOAT_VEC4, prec, 0, numTargets))));
                }
            }

            // .fixed
            /** @type {deqpTests.DeqpTest} */ var arrayFixedGroup = deqpTests.newTest('fixed', 'Fixed-point output tests');
            arrayGroup.addChild(arrayFixedGroup);
            for (var fmtNdx = 0; fmtNdx < requiredFixedFormats.length; fmtNdx++)
            {
                /** @type {number} */ var format = requiredFixedFormats[fmtNdx];
                /** @type {string} */ var fmtName = fboTestUtil.getFormatName(format);
                /** @type {Array.<BufferSpec>} */ var fboSpec = [];

                for (var ndx = 0; ndx < numTargets; ndx++)
                    fboSpec.push(new BufferSpec(format, width, height, samples));

                for (var precNdx = 0; precNdx < precisions.length; precNdx++)
                {
                    /** @type {Array.<gluShaderUtil.precision>} */ var prec = precisions[precNdx];
                    /** @type {string} */ var precName = gluShaderUtil.getPrecisionName(prec);

                    arrayFixedGroup.addChild(new FragmentOutputCase(gl, fmtName + '_' + precName + '_float', '', fboSpec, OutputVec(new FragmentOutput(gluShaderUtil.DataType.FLOAT, prec, 0, numTargets))));
                    arrayFixedGroup.addChild(new FragmentOutputCase(gl, fmtName + '_' + precName + '_vec2', '', fboSpec, OutputVec(new FragmentOutput(gluShaderUtil.DataType.FLOAT_VEC2, prec, 0, numTargets))));
                    arrayFixedGroup.addChild(new FragmentOutputCase(gl, fmtName + '_' + precName + '_vec3', '', fboSpec, OutputVec(new FragmentOutput(gluShaderUtil.DataType.FLOAT_VEC3, prec, 0, numTargets))));
                    arrayFixedGroup.addChild(new FragmentOutputCase(gl, fmtName + '_' + precName + '_vec4', '', fboSpec, OutputVec(new FragmentOutput(gluShaderUtil.DataType.FLOAT_VEC4, prec, 0, numTargets))));
                }
            }

            // .int
            /** @type {deqpTests.DeqpTest} */ var arrayIntGroup = deqpTests.newTest('int', 'Integer output tests');
            arrayGroup.addChild(arrayIntGroup);
            for (var fmtNdx = 0; fmtNdx < requiredIntFormats.length; fmtNdx++)
            {
                /** @type {number} */ var format = requiredIntFormats[fmtNdx];
                /** @type {string} */ var fmtName = fboTestUtil.getFormatName(format);
                /** @type {Array.<BufferSpec>} */ var fboSpec = [];

                for (var ndx = 0; ndx < numTargets; ndx++)
                    fboSpec.push(new BufferSpec(format, width, height, samples));

                for (var precNdx = 0; precNdx < precisions.length; precNdx++)
                {
                    /** @type {Array.<gluShaderUtil.precision>} */ var prec = precisions[precNdx];
                    /** @type {string} */ var precName = gluShaderUtil.getPrecisionName(prec);

                    arrayIntGroup.addChild(new FragmentOutputCase(gl, fmtName + '_' + precName + '_int', '', fboSpec, OutputVec(new FragmentOutput(gluShaderUtil.DataType.INT, prec, 0, numTargets))));
                    arrayIntGroup.addChild(new FragmentOutputCase(gl, fmtName + '_' + precName + '_ivec2', '', fboSpec, OutputVec(new FragmentOutput(gluShaderUtil.DataType.INT_VEC2, prec, 0, numTargets))));
                    arrayIntGroup.addChild(new FragmentOutputCase(gl, fmtName + '_' + precName + '_ivec3', '', fboSpec, OutputVec(new FragmentOutput(gluShaderUtil.DataType.INT_VEC3, prec, 0, numTargets))));
                    arrayIntGroup.addChild(new FragmentOutputCase(gl, fmtName + '_' + precName + '_ivec4', '', fboSpec, OutputVec(new FragmentOutput(gluShaderUtil.DataType.INT_VEC4, prec, 0, numTargets))));
                }
            }

            // .uint
            /** @type {deqpTests.DeqpTest} */ var arrayUintGroup = deqpTests.newTest('uint', 'Usigned integer output tests');
            arrayGroup.addChild(arrayUintGroup);
            for (var fmtNdx = 0; fmtNdx < requiredUintFormats.length; fmtNdx++)
            {
                /** @type {number} */ var format = requiredUintFormats[fmtNdx];
                /** @type {string} */ var fmtName = fboTestUtil.getFormatName(format);
                /** @type {Array.<BufferSpec>} */ var fboSpec = [];

                for (var ndx = 0; ndx < numTargets; ndx++)
                    fboSpec.push(new BufferSpec(format, width, height, samples));

                for (var precNdx = 0; precNdx < precisions.length; precNdx++)
                {
                    /** @type {Array.<gluShaderUtil.precision>} */ var prec = precisions[precNdx];
                    /** @type {string} */ var precName = gluShaderUtil.getPrecisionName(prec);

                    arrayUintGroup.addChild(new FragmentOutputCase(gl, fmtName + '_' + precName + '_uint', '', fboSpec, OutputVec(new FragmentOutput(gluShaderUtil.DataType.UINT, prec, 0, numTargets))));
                    arrayUintGroup.addChild(new FragmentOutputCase(gl, fmtName + '_' + precName + '_uvec2', '', fboSpec, OutputVec(new FragmentOutput(gluShaderUtil.DataType.UINT_VEC2, prec, 0, numTargets))));
                    arrayUintGroup.addChild(new FragmentOutputCase(gl, fmtName + '_' + precName + '_uvec3', '', fboSpec, OutputVec(new FragmentOutput(gluShaderUtil.DataType.UINT_VEC3, prec, 0, numTargets))));
                    arrayUintGroup.addChild(new FragmentOutputCase(gl, fmtName + '_' + precName + '_uvec4', '', fboSpec, OutputVec(new FragmentOutput(gluShaderUtil.DataType.UINT_VEC4, prec, 0, numTargets))));
                }
            }
        }

        debug('fragment output test: Tests created');

     /*// .random
        {
            *//** @type {deqpTests.DeqpTest} *//* var randomGroup = deqpTests.newTest('random', 'Random fragment output cases');
            testGroup.addChild(randomGroup);

            for (var seed = 0; seed < 100; seed++)
                randomGroup.addChild(createRandomCase(gl, 2, 4, seed));
        }*/

    };

    /**
     * Create and execute the test cases
     */
    var run = function(gl) {

      //Set up Test Root parameters
        var testName = 'fragment_output';
        var testDescription = 'Fragment Output Tests';
        var state = deqpTests.runner.getState();

        state.testName = testName;
        state.testCases = deqpTests.newTest(testName, testDescription, null);

      //Set up name and description of this test series.
        setCurrentTestName(testName);
        description(testDescription);

        try {
            init(gl);
            // deqpTests.runner.runCallback(deqpTests.runTestCases);
            deqpTests.runTestCases();
        } catch (err) {
            testFailedOptions('Failed to run tests', false);
            // console.log(err);
            bufferedLogToConsole(err);
            deqpTests.runner.terminate();
        }

    };

    return {
        run: run
    };

});
