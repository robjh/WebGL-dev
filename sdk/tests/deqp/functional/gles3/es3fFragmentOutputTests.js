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
    'framework/opengl/gluVarTypeUtil'
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
        gluVarTypeUtil
) {
    'use strict';

    var GLU_EXPECT_NO_ERROR = function(error, message) {
        assertMsgOptions(error === gl.NONE, message, false, true);
    };

    var DE_ASSERT = function(x) {
        if (!x)
            throw new Error('Assert failed');
    };

    /** BufferSpec
     * Returns the BufferSpec object, it's originally a struct
     * @param {number} format_
     * @param {number} width_
     * @param {number} height_
     * @param {number} samples_
     * @return {Object} The currently modified object
     */
    var BufferSpec = (function(format_, width_, height_, samples_) {
        var container = {
                format: gl.NONE, // TODO: change initialization GL_NONE?
                width: 0,
                height: 0,
                samples: 0
        };

        if (
                typeof(format_) !== 'undefined' &&
                typeof(width_) !== 'undefined' &&
                typeof(height_) !== 'undefined' &&
                typeof(samples_) !== 'undefined'
            ) {
                container.format = format_;
                container.width = width_;
                container.height = height_;
                container.samples = samples_;
            }

            return container;

    });

    /** FragmentOutput
     * Returns the FragmentOutput object, it's originally a struct
     * @param {gluShaderUtil.DataType} type_
     * @param {gluShaderUtil.precision} precision_
     * @param {number} location_
     * @param {number} arrayLength_
     * @return {Object} The currently modified object
     */
    var FragmentOutput = (function(type_, precision_, location_, arrayLength_) {
        var container = {
                type: gluShaderUtil.DataType.INVALID,
                precision: null, // TODO: check initialization, possible INVALID gluShaderUtil.precision?
                location: 0,
                arrayLength: 0
        };

        if (
                typeof(type_) !== 'undefined' &&
                typeof(precision_) !== 'undefined' &&
                typeof(location_) !== 'undefined' &&
                typeof(arrayLength_) !== 'undefined'
            ) {
                container.type = type_;
                container.precision = precision_;
                container.location = location_;
                container.arrayLength = arrayLength_;
            }

            return container;

    });

    /** OutputVec
     * Returns an Array of FragmentOutput objects
     * @param {FragmentOutput} output
     * @return {Array.<FragmentOutput>} outputs
     */
    var OutputVec = function(output) {

        /** @type {Array.<FragmentOutput>} */ var outputs = [];
        outputs.push(output);

        return outputs;
    };

    /** FragmentOutputCase
     * Returns the FragmentOutputCase object
     * @param {string} name
     * @param {string} description
     * @param {Array.<BufferSpec>} fboSpec
     * @param {Array.<FragmentOutput>} outputs
     * @return {Object} The currently modified object
     */
    var FragmentOutputCase = function(name, description, fboSpec, outputs) {
        deqpTests.DeqpTest.call(this, name, description);
        /** @type {Array.<BufferSpec>} */ this.m_fboSpec = fboSpec;
        /** @type {Array.<FragmentOutput>} */ this.m_outputs = outputs;
        /** @type {deqpProgram.ShaderProgram} */ this.m_program = null;
        /** @type {number} */ this.m_framebuffer = 0;
        /** @type {Array.<number>} */ this.m_renderbuffers = 0;
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

        vtx.str = '#version 300 es\n'
                 + 'in highp vec4 a_position;\n';
        frag.str = '#version 300 es\n';

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
                    vtx += 'in ' + precName + ' ' + typeName + ' in' + outNdx + '_' + elemNdx + ';\n'
                        + interp + ' out ' + precName + ' ' + typeName + ' var' + outNdx + '_' + elemNdx + ';\n';
                    frag += interp + ' in ' + precName + ' ' + typeName + ' var' + outNdx + '_' + elemNdx + ';\n';
                }
                frag += 'layout(location = ' + output.location + ') out ' + precName + ' ' + typeName + ' out' + outNdx + '[' + output.arrayLength + '];\n';
            }
            else
            {
                vtx += 'in ' + precName + ' ' + typeName + ' in' + outNdx + ';\n'
                    + interp + ' out ' + precName + ' ' + typeName + ' var' + outNdx + ';\n';
                frag += interp + ' in ' + precName + ' ' + typeName + ' var' + outNdx + ';\n'
                     + 'layout(location = ' + output.location + ') out ' + precName + ' ' + typeName + ' out' + outNdx + ';\n';
            }
        }

        vtx += '\nvoid main()\n{\n';
        frag += '\nvoid main()\n{\n';

        vtx += ' gl_Position = a_position;\n';

        // Copy body
        for (var outNdx = 0; outNdx < outputs.length; outNdx++)
        {
            /** @type {FragmentOutput} */ var output = outputs[outNdx];
            /** @type {boolean} */ var isArray  = output.arrayLength > 0;

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

        /** @type {deqpProgram.ShaderProgram}*/
        var program = new deqpProgram.ShaderProgram(gl, deqpProgram.makeVtxFragSources(vtx, frag));
        return program;
    };

    FragmentOutputCase.prototype.init = function() {

        var gl = this.getRenderContext().getFunctions(); // var gl = m_context.getRenderContext().getFunctions();
        // TestLog& log = m_testCtx.getLog();

        // Check that all attachments are supported
        for (var iter = 0; m_fboSpec.length; ++iter)
        {
            /* TODO: isSizedFormatColorRenderable (in gluTextureUtil) not implemented yet. 
            if (!glu::isSizedFormatColorRenderable(m_context.getRenderContext(), m_context.getContextInfo(), m_fboSpec[iter].format))
                throw tcu::NotSupportedError("Unsupported attachment format");
                */
        }

        DE_ASSERT(!m_program);
        m_program = createProgram(m_context.getRenderContext(), m_outputs);

       // log << *m_program;
        if (!m_program.isOk())
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
        m_renderbuffers.length = m_fboSpec.length; // TODO: check, original: m_renderbuffers.resize(m_fboSpec.length, 0);
        gl.genFramebuffers(1, m_framebuffer);
        gl.genRenderbuffers(m_renderbuffers.length, m_renderbuffers[0]);

        gl.bindFramebuffer(gl.FRAMEBUFFER, m_framebuffer);

        for (var bufNdx = 0; bufNdx < m_renderbuffers.length; bufNdx++)
        {
            /** @type {boolean} */ var rbo = m_renderbuffers[bufNdx];
            /** @type {BufferSpec} */ var bufSpec = m_fboSpec[bufNdx];
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
        // TODO: implement
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
     * Returns the float's range
     * @param {gluShaderUtil.precision} precision, number
     * @return {Array.<number>} range
     */
    var getFloatRange = function(precision) {

    /** @type {Array.<Array.<number>>} */ var Vec2 ranges =
        [
            [-2.0, 2.0],
            [-16000.0, 16000.0],
            [-1e35, 1e35]
        ];
        // DE_STATIC_ASSERT(DE_LENGTH_OF_ARRAY(ranges) == glu::PRECISION_LAST);
        // DE_ASSERT(de::inBounds<int>(precision, 0, DE_LENGTH_OF_ARRAY(ranges)));
        return ranges[precision];
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
     * Returns
     * @param {Array.<number>} vec
     * @param {number} swzNdx
     * @return {Array.<number>} Swizzled array
     */
    var swizzleVec = function(vec, swzNdx) {
    /** @type {Array.<number>} */ var swz = s_swizzles()[swzNdx % s_swizzles().length];

        return deMath.swizzle(vec, swz);
    };

    /**
     * Returns an AttachmentData object
     * @return {Object}
     */
    var AttachmentData = (function() {
        return {

        /** @type {tcuTexture.TextureFormat} */ format: null, //!< Actual format of attachment.
        /** @type {tcuTexture.TextureFormat} */ referenceFormat: null, //!< Used for reference rendering.
        /** @type {tcuTexture.TextureFormat} */ readFormat: null,
        /** @type {number} */ numWrittenChannels: 0,
        /** @type {gluShaderUtil.Precision} */ outPrecision: null,
        /** @type {Uint8Array} */ renderedData: [], // TODO: check type, originally vector<deUint8>
        /** @type {Uint8Array} */ referenceData: [] // TODO: check type, originally vector<deUint8>

        };
    });

    FragmentOutputCase.prototype.iterate = function() {
        // TODO: implement

        // TestLog& log  = m_testCtx.getLog();
        var gl = m_context.getRenderContext().getFunctions();

        // Compute grid size & index list.
        /** @type {number} */ var minCellSize = 8;
        /** @type {Array.<number>} */ var minBufSize = getMinSize(m_fboSpec);
        /** @type {number} */ var gridWidth = deMath.clamp(Math.floor(minBufSize[0] / minCellSize), 1, 255) + 1;
        /** @type {number} */ var gridHeight = deMath.clamp(Math.floor(minBufSize[1] / minCellSize), 1, 255) + 1;
        /** @type {number} */ var numVertices = gridWidth * gridHeight; // TODO: don't needed?
        /** @type {number} */ var numQuads = (gridWidth - 1) * (gridHeight -1 );
        /** @type {number} */ var numIndices = numQuads * 6;

        /** @type {number} */ var numInputVecs = getNumInputVectors(m_outputs);
        /** @type {Array.<Array.<number>>} */ var inputs = []; // TODO: check, originally vector<vector<deUint32>
        /** @type {Array.<number>} */ var positions = []; // originally vector<float> 
        /** @type {Array.<number>} */ var indices  = []; // originally vector<deUint16>

        /** @type {number} */ var readAlignment = 4;
        /** @type {number} */ var viewportW = minBufSize[0];
        /** @type {number} */ var viewportH = minBufSize[1];
        /** @type {number} */ var numAttachments = m_fboSpec.length;

        /** @type {Array.<number>} */ var drawBuffers = []; // TODO: check, originally vector<vector<deUint32>
        /** @type {Array.<AttachmentData>} */ var  attachments = [];

        // Initialize attachment data.
        for (var ndx = 0; ndx < numAttachments; ndx++)
        {
            /** @type {tcuTexture.TextureFormat} */ var texFmt = gluTextureUtil.mapGLInternalFormat(m_fboSpec[ndx].format);
            /** @type {tcuTextureUtil.TextureChannelClass} */ var chnClass =  tcuTextureUtil.getTextureChannelClass(texFmt.type);
            /** @type {boolean} */ var isFixedPoint = chnClass == tcuTextureUtil.TextureChannelClass.SIGNED_FIXED_POINT ||
                                                              chnClass == tcuTextureUtil.TextureChannelClass.UNSIGNED_FIXED_POINT;

            // \note Fixed-point formats use float reference to enable more accurate result verification.
            /** @type {tcuTexture.TextureFormat} */ var refFmt = isFixedPoint ? tcuTexture.TextureFormat(texFmt.order, tcuTexture.ChannelType.FLOAT) : texFmt; // TODO: check parameters tcuTexture.TextureFormat()
            /** @type {tcuTexture.TextureFormat} */ var readFmt = getFramebufferReadFormat(texFmt);
            /** @type {number} */ var attachmentW = m_fboSpec[ndx].width;
            /** @type {number} */ var attachmentH = m_fboSpec[ndx].height;

            drawBuffers[ndx] = gl.COLOR_ATTACHMENT0 + ndx;
            attachments[ndx].format = texFmt;
            attachments[ndx].readFormat = readFmt;
            attachments[ndx].referenceFormat = refFmt;
            attachments[ndx].renderedData.resize(readFmt.getPixelSize() * attachmentW * attachmentH);
            attachments[ndx].referenceData.resize(refFmt.getPixelSize() * attachmentW * attachmentH);
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
                positions[(y  *gridWidth + x) * 4 + 3] = 1.0;
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
                /** @type {boolean} */ var isUint = gluShaderUtil.isDataTypeUintOrUVec(output.type); // TODO: implement isDataTypeUintOrUVec in gluShaderUtil
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
                     /** @type {Array.<number>} */ var range = getFloatRange(output.precision);

                     // Vec4 variables, in tcuVector.hpp see: inline Vector<T, Size>::Vector (T s)
                     /** @type {Array.<number>} */ var minVal = [range[0], range[0], range[0], range[0]];
                     /** @type {Array.<number>} */ var maxVal = [range[1], range[1], range[1], range[1]];
                     // float* dst = (float*)&inputs[curInVec][0]; // a pointer needed in the next loop

                        if (gluVarTypeUtil.inBounds(output.location + vecNdx, 0, attachments.length))
                        {
                        // \note Floating-point precision conversion is not well-defined. For that reason we must
                        // limit value range to intersection of both data type and render target value ranges.
                        /** @type {tcuTextureUtil.TextureFormatInfo} */ var fmtInfo = tcuTextureUtil.getTextureFormatInfo(attachments[output.location+vecNdx].format);
                            minVal = deMath.max(minVal, fmtInfo.valueMin);
                            maxVal = deMath.min(maxVal, fmtInfo.valueMax);
                        }

                        // m_testCtx.getLog() << TestLog::Message << "out" << curInVec << " value range: " << minVal << " -> " << maxVal << TestLog::EndMessage;

                        for (var y = 0; y < gridHeight; y++)
                        {
                            for (var x = 0; x < gridWidth; x++)
                            {
                                /** @type {number} */ var xf = Math.floor(x / (gridWidth - 1));
                                /** @type {number} */ var yf = Math.floor(y / (gridHeight - 1));
                                /** @type {number} */ var f0 = (xf + yf) * 0.5;
                                /** @type {number} */ var f1 = 0.5 + (xf - yf) * 0.5;

                                /** @type {Array.<number>} */ var f = swizzleVec([f0, f1, 1.0 - f0, 1.0 - f1], curInVec);
                                /** @type {Array.<number>} */ var c = deMath.multiply(deMath.add(minVal, deMath.subtract(maxVal, minVal)), f);
                                
                                // this is a pointer which is incremented, originally dst + (y*gridWidth + x)*numScalars;
                                // which dst, is a pointer at an array in inputs: float* dst = (float*)&inputs[curInVec][0]
                                /** @type {number} */ var v = (y * gridWidth + x) * numScalars;

                                for (var ndx = 0; ndx < numScalars; ndx++)
                                    inputs[curInVec][v] = c[ndx];
                            }
                        }
                    }
                    else if (isInt)
                    {
                        /** @type {Array.<number>} */ var range = getIntRange(output.precision);
                        /** @type {Array.<number>} */ var minVal = [range[0], range[0], range[0], range[0]];
                        /** @type {Array.<number>} */ var maxVal = [range[1], range[1], range[1], range[1]];

                        if (gluVarTypeUtil.inBounds(output.location + vecNdx, 0, attachments.length))
                        {
                            // Limit to range of output format as conversion mode is not specified.
                            /** @type {Array.<number>} */ var fmtBits = tcuTextureUtil.getTextureFormatBitDepth(attachments[output.location+vecNdx].format); // TODO: implement function in tcuTextureUtil
                            /** @type {Array.<boolean>} */ var isZero = deMath.lessThanEqual(fmtBits, IVec4(0));
                            
                            const IVec4 fmtMinVal = (-(tcu::Vector<deInt64, 4>(1) << (fmtBits -1 ).cast<deInt64>())).asInt(); // TODO:
                            const IVec4 fmtMaxVal = ((tcu::Vector<deInt64, 4>(1) << (fmtBits -1 ).cast<deInt64>()) - deInt64(1)).asInt(); // TODO:

                            minVal = tcuTextureUtil.select(minVal, deMath.max(minVal, fmtMinVal), isZero);
                            maxVal = tcuTextureUtil.select(maxVal, deMath.min(maxVal, fmtMaxVal), isZero);
                        }

                        // m_testCtx.getLog() << TestLog::Message << "out" << curInVec << " value range: " << minVal << " -> " << maxVal << TestLog::EndMessage;

                        /** @type {Array.<number>} */ var rangeDiv = swizzleVec([gridWidth, gridHeight, gridWidth, gridHeight] - 1, curInVec);
                        const IVec4 step = ((maxVal.cast<deInt64>() - minVal.cast<deInt64>()) / (rangeDiv.cast<deInt64>())).asInt();  // TODO:
                        // deInt32* dst  = (deInt32*)&inputs[curInVec][0]; // a pointer needed in the next loop

                        for (var y = 0; y < gridHeight; y++)
                        {
                            for (var x = 0; x < gridWidth; x++)
                            {
                                /** @type {number} */ var ix = gridWidth - x - 1;
                                /** @type {number} */ var iy = gridHeight - y - 1;
                                /** @type {Array.<number>} */ var c = deMath.add(minVal, deMath.multiply(step, swizzleVec([x, y, ix, iy], curInVec)));

                                // this is a pointer which is incremented, originally dst + (y*gridWidth + x)*numScalars;
                                // which dst, is a pointer at an array in inputs: float* dst = (float*)&inputs[curInVec][0]
                                /** @type {number} */ var v = (y * gridWidth + x) * numScalars;

                                // TODO: ? DE_ASSERT(deMath.boolAll(logicalAnd(greaterThanEqual(c, minVal), deMath.lessThanEqual(c, maxVal))));

                                for (var ndx = 0; ndx < numScalars; ndx++)
                                    inputs[curInVec][v] = c[ndx];
                            }
                        }
                    }
                    else if (isUint)
                    {
                        /** @type {Array.<number>} */ var range  = getUintRange(output.precision);
                        /** @type {Array.<number>} */ var maxVal = [range[1], range[1], range[1], range[1]];

                        if (gluVarTypeUtil.inBounds(output.location+vecNdx, 0, attachments.size()))
                        {
                            // Limit to range of output format as conversion mode is not specified.
                            /** @type {Array.<number>} */ var fmtBits = tcuTextureUtil.getTextureFormatBitDepth(attachments[output.location+vecNdx].format); // TODO: implement function in tcuTextureUtil
                            const UVec4 fmtMaxVal = ((tcu::Vector<deUint64, 4>(1) << fmtBits.cast<deUint64>()) - deUint64(1)).asUint();

                            maxVal = deMath.min(maxVal, fmtMaxVal);
                        }

                        // m_testCtx.getLog() << TestLog::Message << "out" << curInVec << " value range: " << UVec4(0) << " -> " << maxVal << TestLog::EndMessage;

                        /** @type {Array.<number>} */ var rangeDiv = swizzleVec([gridWidth, gridHeight, gridWidth, gridHeight] - 1, curInVec);
                        const UVec4 step  = maxVal / rangeDiv.asUint();
                        // deUint32*  dst = &inputs[curInVec][0];

                        DE_ASSERT(range[0] == 0);

                        for (var y = 0; y < gridHeight; y++)
                        {
                            for (var x = 0; x < gridWidth; x++)
                            {
                                /** @type {number} */ var ix = gridWidth - x - 1;
                                /** @type {number} */ var iy  = gridHeight - y - 1;
                                UVec4 c = deMath.multiply(step, swizzleVec([x, y, ix, iy].asUint(), curInVec));
                                /** @type {number} */ var v  = (y * gridWidth + x) * numScalars;

                                DE_ASSERT(deMath.boolAll(deMath.lessThanEqual(c, maxVal)));

                                for (var ndx = 0; ndx < numScalars; ndx++)
                                    inputs[curInVec][v] = c[ndx];
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
        gl.bindFramebuffer(gl.FRAMEBUFFER, m_framebuffer);
        gl.viewport(0, 0, viewportW, viewportH);
        gl.drawBuffers(drawBuffers.length, drawBuffers);
        gl.disable(gl.DITHER); // Dithering causes issues with unorm formats. Those issues could be worked around in threshold, but it makes validation less accurate.
        GLU_EXPECT_NO_ERROR(gl.getError(), 'After program setup');

        {
            /** @type {number} */ var curInVec = 0;
            for (var outputNdx = 0; outputNdx < m_outputs.length; outputNdx++)
            {
                /** @type {FragmentOutput} */ var output = m_outputs[outputNdx];
                /** @type {boolean} */ var isArray = output.arrayLength > 0;
                /** @type {boolean} */ var isFloat = gluShaderUtil.isDataTypeFloatOrVec(output.type);
                /** @type {boolean} */ var isInt = gluShaderUtil.isDataTypeIntOrIVec(output.type);
                /** @type {boolean} */ var isUint = gluShaderUtil.isDataTypeUintOrUVec(output.type);
                /** @type {number} */ var scalarSize = gluShaderUtil.getDataTypeScalarSize(output.type);
                /** @type {number} */ var glScalarType = isFloat   ? gl.FLOAT          :
                                                         isInt     ? gl.INT            :
                                                         isUint    ? gl.UNSIGNED_INT   : gl.NONE;
                /** @type {number} */ var numVecs = isArray ? output.arrayLength : 1;

                for (var vecNdx = 0; vecNdx < numVecs; vecNdx++)
                {
                    /** @type {string} */ var name = string('in') + outputNdx + (isArray ? '_' + vecNdx : '');
                    /** @type {number} */ var loc = gl.getAttribLocation(m_program.getProgram(), name);

                    if (loc >= 0)
                    {
                        gl.enableVertexAttribArray(loc);
                        if (isFloat)
                            gl.vertexAttribPointer(loc, scalarSize, glScalarType, GL_FALSE, 0, inputs[curInVec]);
                        else
                            gl.vertexAttribIPointer(loc, scalarSize, glScalarType, 0, inputs[curInVec]);
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
            // void* dst = &attachments[ndx].renderedData[0];

            gl.readBuffer(GL_COLOR_ATTACHMENT0+ndx);
            gl.readPixels(0, 0, minBufSize.x(), minBufSize.y(), transferFmt.format, transferFmt.dataType, dst);
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
                    // const void* inputData = &inputs[curInNdx][0];

                    DE_ASSERT(gluVarTypeUtil.inBounds(location, 0, m_fboSpec.length));

                    /** @type {number} */ var bufW = m_fboSpec[location].width;
                    /** @type {number} */ var bufH  = m_fboSpec[location].height;
                    /** @type {Object} */ var descriptor = {
                            format: attachments[location].referenceFormat,
                            width: bufW,
                            height: bufH,
                            depth: 1,
                            data: attachments[location].referenceData
                    };
                    /** @type {tcuTexture.PixelBufferAccess} */ var buf = tcuTexture.PixelBufferAccess(descriptor);
                    // const tcu::PixelBufferAccess
                    var viewportBuf = tcuTexture.getSubregion(buf, 0, 0, 0, viewportW, viewportH, 1); // TODO: implement

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
        bool allLevelsOk = true;
        for (int attachNdx = 0; attachNdx < numAttachments; attachNdx++)
        {
            const int                       attachmentW         = m_fboSpec[attachNdx].width;
            const int                       attachmentH         = m_fboSpec[attachNdx].height;
            const int                       numValidChannels    = attachments[attachNdx].numWrittenChannels;
            const tcu::BVec4                cmpMask             (numValidChannels >= 1, numValidChannels >= 2, numValidChannels >= 3, numValidChannels >= 4);
            const glu::Precision            outPrecision        = attachments[attachNdx].outPrecision;
            const tcu::TextureFormat&       format              = attachments[attachNdx].format;
            tcu::ConstPixelBufferAccess     rendered            (attachments[attachNdx].readFormat, attachmentW, attachmentH, 1, deAlign32(attachments[attachNdx].readFormat.getPixelSize()*attachmentW, readAlignment), 0, &attachments[attachNdx].renderedData[0]);
            tcu::ConstPixelBufferAccess     reference           (attachments[attachNdx].referenceFormat, attachmentW, attachmentH, 1, &attachments[attachNdx].referenceData[0]);
            tcu::TextureChannelClass        texClass            = tcu::getTextureChannelClass(format.type);
            bool                            isOk                = true;
            const string                    name                = string("Attachment") + de::toString(attachNdx);
            const string                    desc                = string("Color attachment ") + de::toString(attachNdx);

            log << TestLog::Message << "Attachment " << attachNdx << ": " << numValidChannels << " channels have defined values and used for comparison" << TestLog::EndMessage;

            switch (texClass)
            {
                case tcu::TEXTURECHANNELCLASS_FLOATING_POINT:
                {
                    UVec4       formatThreshold;        //!< Threshold computed based on format.
                    deUint32    precThreshold   = 0;    //!< Threshold computed based on output type precision
                    UVec4       finalThreshold;

                    switch (format.type)
                    {
                        case tcu::TextureFormat::FLOAT:                         formatThreshold = UVec4(4);                                     break;
                        case tcu::TextureFormat::HALF_FLOAT:                    formatThreshold = UVec4((1<<13) + 4);                           break;
                        case tcu::TextureFormat::UNSIGNED_INT_11F_11F_10F_REV:  formatThreshold = UVec4((1<<17) + 4, (1<<17)+4, (1<<18)+4, 4);  break;
                        default:
                            DE_ASSERT(false);
                            break;
                    }

                    switch (outPrecision)
                    {
                        case glu::PRECISION_LOWP:       precThreshold   = (1<<21);  break;
                        case glu::PRECISION_MEDIUMP:    precThreshold   = (1<<13);  break;
                        case glu::PRECISION_HIGHP:      precThreshold   = 0;        break;
                        default:
                            DE_ASSERT(false);
                    }

                    finalThreshold = select(max(formatThreshold, UVec4(precThreshold)), UVec4(~0u), cmpMask);

                    isOk = tcu::floatUlpThresholdCompare(log, name.c_str(), desc.c_str(), reference, rendered, finalThreshold, tcu::COMPARE_LOG_RESULT);
                    break;
                }

                case tcu::TEXTURECHANNELCLASS_UNSIGNED_FIXED_POINT:
                {
                    // \note glReadPixels() allows only 8 bits to be read. This means that RGB10_A2 will loose some
                    // bits in the process and it must be taken into account when computing threshold.
                    const IVec4     bits            = min(IVec4(8), tcu::getTextureFormatBitDepth(format));
                    const Vec4      baseThreshold   = 1.0f / ((IVec4(1) << bits)-1).asFloat();
                    const Vec4      threshold       = select(baseThreshold, Vec4(2.0f), cmpMask);

                    isOk = tcu::floatThresholdCompare(log, name.c_str(), desc.c_str(), reference, rendered, threshold, tcu::COMPARE_LOG_RESULT);
                    break;
                }

                case tcu::TEXTURECHANNELCLASS_SIGNED_INTEGER:
                case tcu::TEXTURECHANNELCLASS_UNSIGNED_INTEGER:
                {
                    const tcu::UVec4 threshold = select(UVec4(0u), UVec4(~0u), cmpMask);
                    isOk = tcu::intThresholdCompare(log, name.c_str(), desc.c_str(), reference, rendered, threshold, tcu::COMPARE_LOG_RESULT);
                    break;
                }

                default:
                    TCU_FAIL("Unsupported comparison");
                    break;
            }

            if (!isOk)
                allLevelsOk = false;
        }

        m_testCtx.setTestResult(allLevelsOk ? QP_TEST_RESULT_PASS   : QP_TEST_RESULT_FAIL,
                                allLevelsOk ? "Pass"                : "Image comparison failed");
        return STOP;
    };

    var init = function() {

      /** @const @type {deqpTests.DeqpTest} */ var testGroup = deqpTests.runner.getState().testCases;
      //Set up Test Root parameters
        var testName = 'fot';
        var testDescription = 'Fragment Output Tests';
        var state = deqpTests.runner.getState();

        state.testName = testName;
        state.testCases = deqpTests.newTest(testName, testDescription, null);

      //Set up name and description of this test series.
        setCurrentTestName(testName);
        description(testDescription);

        /** @type {Array} */
        var requiredFloatFormats = [
            gl.RGBA32F,
            gl.RGBA16F,
            gl.R11F_G11F_B10F,
            gl.RG32F,
            gl.RG16F,
            gl.R32F,
            gl.R16F
        ];

        /** @type {Array} */
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

        /** @type {Array} */
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

        /** @type {Array} */
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

                fboSpec.push(BufferSpec(format, width, height, samples));

                for (var precNdx = 0; precNdx < precisions.length; precNdx++)
                {
                    /** @type {Array.<gluShaderUtil.precision>} */ var prec = precisions[precNdx];
                    /** @type {string} */ var precName = gluShaderUtil.getPrecisionName(prec);

                    floatGroup.addChild(new FragmentOutputCase(fmtName + '_' + precName + '_float', '', fboSpec, OutputVec(FragmentOutput(gluShaderUtil.DataType.FLOAT, prec, 0))));
                    floatGroup.addChild(new FragmentOutputCase(fmtName + '_' + precName + '_vec2', '', fboSpec, OutputVec(FragmentOutput(gluShaderUtil.DataType.FLOAT_VEC2, prec, 0))));
                    floatGroup.addChild(new FragmentOutputCase(fmtName + '_' + precName + '_vec3', '', fboSpec, OutputVec(FragmentOutput(gluShaderUtil.DataType.FLOAT_VEC3, prec, 0))));
                    floatGroup.addChild(new FragmentOutputCase(fmtName + '_' + precName + '_vec4', '', fboSpec, OutputVec(FragmentOutput(gluShaderUtil.DataType.FLOAT_VEC4, prec, 0))));
                }
            }
            bufferedLogToConsole('fot.basic_float: Tests created');
        }
    };

    /**
     * Create and execute the test cases
     */
    var run = function() {
        try {
            init();
            deqpTests.runner.runCallback(deqpTests.runTestCases);
        } catch (err) {
            bufferedLogToConsole(err);
            deqpTests.runner.terminate();
        }

    };

    return {
        run: run
    };

});
