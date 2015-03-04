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
    'framework/common/tcuCompressedTexture'
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
        tcuCompressedTexture
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
     // TODO: implement?? m_renderbuffers.resize(m_fboSpec.length, 0);
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

    FragmentOutputCase.prototype.iterate = function() {
        // TODO: implement
        
        // TestLog& log  = m_testCtx.getLog();
        var gl = m_context.getRenderContext().getFunctions();

        // Compute grid size & index list.
        /** @type {number} */ var minCellSize = 8;
        const IVec2                 minBufSize          = getMinSize(m_fboSpec);
        /** @type {number} */ var gridWidth = deMath.clamp(minBufSize.x() / minCellSize, 1, 255) +1;
        /** @type {number} */ var gridHeight = deMath.clamp(minBufSize.y() / minCellSize, 1, 255) + 1;
        const int                   numVertices         = gridWidth*gridHeight;
        const int                   numQuads            = (gridWidth-1)*(gridHeight-1);
        const int                   numIndices          = numQuads*6;

        const int                   numInputVecs        = getNumInputVectors(m_outputs);
        vector<vector<deUint32> >   inputs              (numInputVecs);
        vector<float>               positions           (numVertices*4);
        vector<deUint16>            indices             (numIndices);

        const int                   readAlignment       = 4;
        const int                   viewportW           = minBufSize.x();
        const int                   viewportH           = minBufSize.y();
        const int                   numAttachments      = (int)m_fboSpec.size();

        vector<deUint32>            drawBuffers         (numAttachments);
        vector<AttachmentData>      attachments         (numAttachments);

        // Initialize attachment data.
        for (int ndx = 0; ndx < numAttachments; ndx++)
        {
            const tcu::TextureFormat        texFmt          = glu::mapGLInternalFormat(m_fboSpec[ndx].format);
            const tcu::TextureChannelClass  chnClass        = tcu::getTextureChannelClass(texFmt.type);
            const bool                      isFixedPoint    = chnClass == tcu::TEXTURECHANNELCLASS_SIGNED_FIXED_POINT ||
                                                              chnClass == tcu::TEXTURECHANNELCLASS_UNSIGNED_FIXED_POINT;

            // \note Fixed-point formats use float reference to enable more accurate result verification.
            const tcu::TextureFormat        refFmt          = isFixedPoint ? tcu::TextureFormat(texFmt.order, tcu::TextureFormat::FLOAT) : texFmt;
            const tcu::TextureFormat        readFmt         = getFramebufferReadFormat(texFmt);
            const int                       attachmentW     = m_fboSpec[ndx].width;
            const int                       attachmentH     = m_fboSpec[ndx].height;

            drawBuffers[ndx]                    = GL_COLOR_ATTACHMENT0+ndx;
            attachments[ndx].format             = texFmt;
            attachments[ndx].readFormat         = readFmt;
            attachments[ndx].referenceFormat    = refFmt;
            attachments[ndx].renderedData.resize(readFmt.getPixelSize()*attachmentW*attachmentH);
            attachments[ndx].referenceData.resize(refFmt.getPixelSize()*attachmentW*attachmentH);
        }

        // Initialize indices.
        for (int quadNdx = 0; quadNdx < numQuads; quadNdx++)
        {
            int quadY   = quadNdx / (gridWidth-1);
            int quadX   = quadNdx - quadY*(gridWidth-1);

            indices[quadNdx*6+0] = quadX + quadY*gridWidth;
            indices[quadNdx*6+1] = quadX + (quadY+1)*gridWidth;
            indices[quadNdx*6+2] = quadX + quadY*gridWidth + 1;
            indices[quadNdx*6+3] = indices[quadNdx*6+1];
            indices[quadNdx*6+4] = quadX + (quadY+1)*gridWidth + 1;
            indices[quadNdx*6+5] = indices[quadNdx*6+2];
        }

        for (int y = 0; y < gridHeight; y++)
        {
            for (int x = 0; x < gridWidth; x++)
            {
                float   xf  = (float)x / (float)(gridWidth-1);
                float   yf  = (float)y / (float)(gridHeight-1);

                positions[(y*gridWidth + x)*4 + 0] = 2.0f*xf - 1.0f;
                positions[(y*gridWidth + x)*4 + 1] = 2.0f*yf - 1.0f;
                positions[(y*gridWidth + x)*4 + 2] = 0.0f;
                positions[(y*gridWidth + x)*4 + 3] = 1.0f;
            }
        }

        // Initialize input vectors.
        {
            int curInVec = 0;
            for (int outputNdx = 0; outputNdx < (int)m_outputs.size(); outputNdx++)
            {
                const FragmentOutput&   output      = m_outputs[outputNdx];
                bool                    isFloat     = glu::isDataTypeFloatOrVec(output.type);
                bool                    isInt       = glu::isDataTypeIntOrIVec(output.type);
                bool                    isUint      = glu::isDataTypeUintOrUVec(output.type);
                int                     numVecs     = output.arrayLength > 0 ? output.arrayLength : 1;
                int                     numScalars  = glu::getDataTypeScalarSize(output.type);

                for (int vecNdx = 0; vecNdx < numVecs; vecNdx++)
                {
                    inputs[curInVec].resize(numVertices*numScalars);

                    // Record how many outputs are written in attachment.
                    DE_ASSERT(output.location+vecNdx < (int)attachments.size());
                    attachments[output.location+vecNdx].numWrittenChannels  = numScalars;
                    attachments[output.location+vecNdx].outPrecision        = output.precision;

                    if (isFloat)
                    {
                        Vec2        range   = getFloatRange(output.precision);
                        Vec4        minVal  (range.x());
                        Vec4        maxVal  (range.y());
                        float*      dst     = (float*)&inputs[curInVec][0];

                        if (de::inBounds(output.location+vecNdx, 0, (int)attachments.size()))
                        {
                            // \note Floating-point precision conversion is not well-defined. For that reason we must
                            //       limit value range to intersection of both data type and render target value ranges.
                            const tcu::TextureFormatInfo fmtInfo = tcu::getTextureFormatInfo(attachments[output.location+vecNdx].format);
                            minVal = tcu::max(minVal, fmtInfo.valueMin);
                            maxVal = tcu::min(maxVal, fmtInfo.valueMax);
                        }

                        m_testCtx.getLog() << TestLog::Message << "out" << curInVec << " value range: " << minVal << " -> " << maxVal << TestLog::EndMessage;

                        for (int y = 0; y < gridHeight; y++)
                        {
                            for (int x = 0; x < gridWidth; x++)
                            {
                                float   xf  = (float)x / (float)(gridWidth-1);
                                float   yf  = (float)y / (float)(gridHeight-1);

                                float   f0  = (xf + yf) * 0.5f;
                                float   f1  = 0.5f + (xf - yf) * 0.5f;
                                Vec4    f   = swizzleVec(Vec4(f0, f1, 1.0f-f0, 1.0f-f1), curInVec);
                                Vec4    c   = minVal + (maxVal-minVal)*f;
                                float*  v   = dst + (y*gridWidth + x)*numScalars;

                                for (int ndx = 0; ndx < numScalars; ndx++)
                                    v[ndx] = c[ndx];
                            }
                        }
                    }
                    else if (isInt)
                    {
                        const IVec2 range   = getIntRange(output.precision);
                        IVec4       minVal  (range.x());
                        IVec4       maxVal  (range.y());

                        if (de::inBounds(output.location+vecNdx, 0, (int)attachments.size()))
                        {
                            // Limit to range of output format as conversion mode is not specified.
                            const IVec4 fmtBits     = tcu::getTextureFormatBitDepth(attachments[output.location+vecNdx].format);
                            const BVec4 isZero      = lessThanEqual(fmtBits, IVec4(0));
                            const IVec4 fmtMinVal   = (-(tcu::Vector<deInt64, 4>(1) << (fmtBits-1).cast<deInt64>())).asInt();
                            const IVec4 fmtMaxVal   = ((tcu::Vector<deInt64, 4>(1) << (fmtBits-1).cast<deInt64>())-deInt64(1)).asInt();

                            minVal = select(minVal, tcu::max(minVal, fmtMinVal), isZero);
                            maxVal = select(maxVal, tcu::min(maxVal, fmtMaxVal), isZero);
                        }

                        m_testCtx.getLog() << TestLog::Message << "out" << curInVec << " value range: " << minVal << " -> " << maxVal << TestLog::EndMessage;

                        const IVec4 rangeDiv    = swizzleVec((IVec4(gridWidth, gridHeight, gridWidth, gridHeight)-1), curInVec);
                        const IVec4 step        = ((maxVal.cast<deInt64>() - minVal.cast<deInt64>()) / (rangeDiv.cast<deInt64>())).asInt();
                        deInt32*    dst         = (deInt32*)&inputs[curInVec][0];

                        for (int y = 0; y < gridHeight; y++)
                        {
                            for (int x = 0; x < gridWidth; x++)
                            {
                                int         ix  = gridWidth - x - 1;
                                int         iy  = gridHeight - y - 1;
                                IVec4       c   = minVal + step*swizzleVec(IVec4(x, y, ix, iy), curInVec);
                                deInt32*    v   = dst + (y*gridWidth + x)*numScalars;

                                DE_ASSERT(boolAll(logicalAnd(greaterThanEqual(c, minVal), lessThanEqual(c, maxVal))));

                                for (int ndx = 0; ndx < numScalars; ndx++)
                                    v[ndx] = c[ndx];
                            }
                        }
                    }
                    else if (isUint)
                    {
                        const UVec2 range   = getUintRange(output.precision);
                        UVec4       maxVal  (range.y());

                        if (de::inBounds(output.location+vecNdx, 0, (int)attachments.size()))
                        {
                            // Limit to range of output format as conversion mode is not specified.
                            const IVec4 fmtBits     = tcu::getTextureFormatBitDepth(attachments[output.location+vecNdx].format);
                            const UVec4 fmtMaxVal   = ((tcu::Vector<deUint64, 4>(1) << fmtBits.cast<deUint64>())-deUint64(1)).asUint();

                            maxVal = tcu::min(maxVal, fmtMaxVal);
                        }

                        m_testCtx.getLog() << TestLog::Message << "out" << curInVec << " value range: " << UVec4(0) << " -> " << maxVal << TestLog::EndMessage;

                        const IVec4 rangeDiv    = swizzleVec((IVec4(gridWidth, gridHeight, gridWidth, gridHeight)-1), curInVec);
                        const UVec4 step        = maxVal / rangeDiv.asUint();
                        deUint32*   dst         = &inputs[curInVec][0];

                        DE_ASSERT(range.x() == 0);

                        for (int y = 0; y < gridHeight; y++)
                        {
                            for (int x = 0; x < gridWidth; x++)
                            {
                                int         ix  = gridWidth - x - 1;
                                int         iy  = gridHeight - y - 1;
                                UVec4       c   = step*swizzleVec(IVec4(x, y, ix, iy).asUint(), curInVec);
                                deUint32*   v   = dst + (y*gridWidth + x)*numScalars;

                                DE_ASSERT(boolAll(lessThanEqual(c, maxVal)));

                                for (int ndx = 0; ndx < numScalars; ndx++)
                                    v[ndx] = c[ndx];
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
        gl.useProgram(m_program->getProgram());
        gl.bindFramebuffer(GL_FRAMEBUFFER, m_framebuffer);
        gl.viewport(0, 0, viewportW, viewportH);
        gl.drawBuffers((int)drawBuffers.size(), &drawBuffers[0]);
        gl.disable(GL_DITHER); // Dithering causes issues with unorm formats. Those issues could be worked around in threshold, but it makes validation less accurate.
        GLU_EXPECT_NO_ERROR(gl.getError(), "After program setup");

        {
            int curInVec = 0;
            for (int outputNdx = 0; outputNdx < (int)m_outputs.size(); outputNdx++)
            {
                const FragmentOutput&   output          = m_outputs[outputNdx];
                bool                    isArray         = output.arrayLength > 0;
                bool                    isFloat         = glu::isDataTypeFloatOrVec(output.type);
                bool                    isInt           = glu::isDataTypeIntOrIVec(output.type);
                bool                    isUint          = glu::isDataTypeUintOrUVec(output.type);
                int                     scalarSize      = glu::getDataTypeScalarSize(output.type);
                deUint32                glScalarType    = isFloat   ? GL_FLOAT          :
                                                          isInt     ? GL_INT            :
                                                          isUint    ? GL_UNSIGNED_INT   : GL_NONE;
                int                     numVecs         = isArray ? output.arrayLength : 1;

                for (int vecNdx = 0; vecNdx < numVecs; vecNdx++)
                {
                    string  name    = string("in") + de::toString(outputNdx) + (isArray ? string("_") + de::toString(vecNdx) : string());
                    int     loc     = gl.getAttribLocation(m_program->getProgram(), name.c_str());

                    if (loc >= 0)
                    {
                        gl.enableVertexAttribArray(loc);
                        if (isFloat)
                            gl.vertexAttribPointer(loc, scalarSize, glScalarType, GL_FALSE, 0, &inputs[curInVec][0]);
                        else
                            gl.vertexAttribIPointer(loc, scalarSize, glScalarType, 0, &inputs[curInVec][0]);
                    }
                    else
                        log << TestLog::Message << "Warning: No location for attribute '" << name << "' found." << TestLog::EndMessage;

                    curInVec += 1;
                }
            }
        }
        {
            int posLoc = gl.getAttribLocation(m_program->getProgram(), "a_position");
            TCU_CHECK(posLoc >= 0);
            gl.enableVertexAttribArray(posLoc);
            gl.vertexAttribPointer(posLoc, 4, GL_FLOAT, GL_FALSE, 0, &positions[0]);
        }
        GLU_EXPECT_NO_ERROR(gl.getError(), "After attribute setup");

        gl.drawElements(GL_TRIANGLES, numIndices, GL_UNSIGNED_SHORT, &indices[0]);
        GLU_EXPECT_NO_ERROR(gl.getError(), "glDrawElements");

        // Read all attachment points.
        for (int ndx = 0; ndx < numAttachments; ndx++)
        {
            const glu::TransferFormat       transferFmt     = glu::getTransferFormat(attachments[ndx].readFormat);
            void*                           dst             = &attachments[ndx].renderedData[0];

            gl.readBuffer(GL_COLOR_ATTACHMENT0+ndx);
            gl.readPixels(0, 0, minBufSize.x(), minBufSize.y(), transferFmt.format, transferFmt.dataType, dst);
        }

        // Render reference images.
        {
            int curInNdx = 0;
            for (int outputNdx = 0; outputNdx < (int)m_outputs.size(); outputNdx++)
            {
                const FragmentOutput&   output          = m_outputs[outputNdx];
                const bool              isArray         = output.arrayLength > 0;
                const bool              isFloat         = glu::isDataTypeFloatOrVec(output.type);
                const bool              isInt           = glu::isDataTypeIntOrIVec(output.type);
                const bool              isUint          = glu::isDataTypeUintOrUVec(output.type);
                const int               scalarSize      = glu::getDataTypeScalarSize(output.type);
                const int               numVecs         = isArray ? output.arrayLength : 1;

                for (int vecNdx = 0; vecNdx < numVecs; vecNdx++)
                {
                    const int       location    = output.location+vecNdx;
                    const void*     inputData   = &inputs[curInNdx][0];

                    DE_ASSERT(de::inBounds(location, 0, (int)m_fboSpec.size()));

                    const int                       bufW            = m_fboSpec[location].width;
                    const int                       bufH            = m_fboSpec[location].height;
                    const tcu::PixelBufferAccess    buf             (attachments[location].referenceFormat, bufW, bufH, 1, &attachments[location].referenceData[0]);
                    const tcu::PixelBufferAccess    viewportBuf     = getSubregion(buf, 0, 0, 0, viewportW, viewportH, 1);

                    if (isInt || isUint)
                        renderIntReference(viewportBuf, gridWidth, gridHeight, scalarSize, (const int*)inputData);
                    else if (isFloat)
                        renderFloatReference(viewportBuf, gridWidth, gridHeight, scalarSize, (const float*)inputData);
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
