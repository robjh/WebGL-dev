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

'use strict';
goog.provide('modules.shared.glsBufferTestUtil');
goog.require('framework.common.tcuTestCase');
goog.require('framework.delibs.debase.deMath');
goog.require('framework.delibs.debase.deRandom');
goog.require('framework.delibs.debase.deString');
goog.require('framework.delibs.debase.deUtil');
goog.require('framework.opengl.gluDrawUtil');
goog.require('framework.opengl.gluShaderProgram');
goog.require('framework.opengl.gluShaderUtil');

goog.scope(function() {

    var glsBufferTestUtil = modules.shared.glsBufferTestUtil;
    var tcuTestCase = framework.common.tcuTestCase;
    var gluShaderProgram = framework.opengl.gluShaderProgram;
    var gluShaderUtil = framework.opengl.gluShaderUtil;
    var gluDrawUtil = framework.opengl.gluDrawUtil;
    var deUtil = framework.delibs.debase.deUtil;
    var deMath = framework.delibs.debase.deMath;
    var deRandom = framework.delibs.debase.deRandom;
    var deString = framework.delibs.debase.deString;

    glsBufferTestUtil.VERIFY_QUAD_SIZE = 8; //!< Quad size in VertexArrayVerifier
    glsBufferTestUtil.MAX_LINES_PER_INDEX_ARRAY_DRAW = 128; //!< Maximum number of lines per one draw in IndexArrayVerifier
    glsBufferTestUtil.INDEX_ARRAY_DRAW_VIEWPORT_WIDTH = 128;
    glsBufferTestUtil.INDEX_ARRAY_DRAW_VIEWPORT_HEIGHT = 128;

    // Helper functions.

    /**
     * @param {Uint8Array} ptr
     * @param {number} numBytes
     * @param {number} seed
     */
    glsBufferTestUtil.fillWithRandomBytes = function (ptr, numBytes, seed) {
        var rnd = new deRandom.Random(seed);
        for (var left = numBytes; left > 0; left--)
            ptr[left - 1] = rnd.getInt();
    };

    /**
     * @param {Uint8Array} resPtr
     * @param {Uint8Array} refPtr
     * @param {number} numBytes
     * @return {boolean}
     */
    glsBufferTestUtil.compareByteArrays = function (resPtr, refPtr, numBytes) {
        var isOk = true;
        var maxSpanLen        = 8;
        var maxDiffSpans    = 4;
        var numDiffSpans    = 0;
        var diffSpanStart    = -1;
        var ndx             = 0;

        var log = "Verification result: ");

        for (;ndx < numBytes; ndx++)
        {
            if (resPtr[ndx] != refPtr[ndx])
            {
                if (diffSpanStart < 0)
                    diffSpanStart = ndx;

                isOk = false;
            }
            else if (diffSpanStart >= 0)
            {
                if (numDiffSpans < maxDiffSpans)
                {
                    var len            = ndx-diffSpanStart;
                    var printLen    = Math.min(len, maxSpanLen);

                    log += len + " byte difference at offset " + diffSpanStart + "\n" +
                        "  expected " +
                        /* TODO: tcu::formatArray (
                            tcu::Format::HexIterator<deUint8>(refPtr+diffSpanStart),
                            tcu::Format::HexIterator<deUint8>(refPtr+diffSpanStart+printLen)
                        ) + "\n" +
                        "  got " +
                        tcu::formatArray (
                            tcu::Format::HexIterator<deUint8>(resPtr+diffSpanStart),
                            tcu::Format::HexIterator<deUint8>(resPtr+diffSpanStart+printLen)
                        );*/
                        '';
                }
                else
                    log += "(output too long, truncated)";

                numDiffSpans += 1;
                diffSpanStart = -1;
            }
        }

        if (diffSpanStart >= 0)
        {
            if (numDiffSpans < maxDiffSpans)
            {
                var len = ndx-diffSpanStart;
                var printLen = Math.min(len, maxSpanLen);

                log += len + " byte difference at offset " + diffSpanStart + "\n" +
                    "  expected " +
                    /*tcu::formatArray(
                        tcu::Format::HexIterator<deUint8>(refPtr+diffSpanStart),
                        tcu::Format::HexIterator<deUint8>(refPtr+diffSpanStart+printLen)
                    ) + "\n" +
                    "  got " +
                    tcu::formatArray(
                        tcu::Format::HexIterator<deUint8>(resPtr+diffSpanStart),
                        tcu::Format::HexIterator<deUint8>(resPtr+diffSpanStart+printLen)
                    );*/
                    '';
            }
            else
                log += "(output too long, truncated)";
        }

        log += (isOk ? "Verification passed." : "Verification FAILED!");

        bufferedLogToConsole(log);

        return isOk;
    };

    /**
     * @param {number} target
     * @return {string}
     */
    glsBufferTestUtil.getBufferTargetName = function (target)
    {
        switch (target)
        {
            case gl.ARRAY_BUFFER:                return "array";
            case gl.COPY_READ_BUFFER:            return "copy_read";
            case gl.COPY_WRITE_BUFFER:            return "copy_write";
            case gl.ELEMENT_ARRAY_BUFFER:        return "element_array";
            case gl.PIXEL_PACK_BUFFER:            return "pixel_pack";
            case gl.PIXEL_UNPACK_BUFFER:        return "pixel_unpack";
            case gl.TEXTURE_BUFFER:                return "texture";
            case gl.TRANSFORM_FEEDBACK_BUFFER:    return "transform_feedback";
            case gl.UNIFORM_BUFFER:                return "uniform";
            default:
                throw new Error('Invalid buffer target');
        }
    };

    /**
     * @param {number} hint
     * @return {string}
     */
    glsBufferTestUtil.getUsageHintName = function (hint)
    {
        switch (hint)
        {
            case gl.STREAM_DRAW:    return "stream_draw";
            case gl.STREAM_READ:    return "stream_read";
            case gl.STREAM_COPY:    return "stream_copy";
            case gl.STATIC_DRAW:    return "static_draw";
            case gl.STATIC_READ:    return "static_read";
            case gl.STATIC_COPY:    return "static_copy";
            case gl.DYNAMIC_DRAW:    return "dynamic_draw";
            case gl.DYNAMIC_READ:    return "dynamic_read";
            case gl.DYNAMIC_COPY:    return "dynamic_copy";
            default:
            throw new Error('Invalid buffer usage hint');
        }
    };

    // Base class for buffer cases.

    // BufferCase

    /**
     * @constructor
     * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} description
     */
    glsBufferTestUtil.BufferCase = function (name, description) {
        tcuTestCase.DeqpTest.call(this, name, description);
        //TODO: CallLogWrapper    (renderCtx.getFunctions(), testCtx.getLog())
        //, m_renderCtx        (renderCtx)
        /** @type {Array<number>} */ this.m_allocatedBuffers = [];
    };

    /**
     * init
     */
    glsBufferTestUtil.BufferCase.prototype.init = function ()
    {
        //enableLogging(true);
    };

    /**
     * deinit (TODO: needs tcuTestCase refactor)
     */
    glsBufferTestUtil.BufferCase.prototype.deinit = function ()
    {
        for (var ndx = 0; ndx < this.m_allocatedBuffers.length; ndx++) //set<deUint32>::const_iterator bufIter = m_allocatedBuffers.begin(); bufIter != m_allocatedBuffers.end(); bufIter++)
            gl.deleteBuffers(this.m_allocatedBuffers[ndx]);
    };

    /**
     * @return {WebGLBuffer}
     */
    glsBufferTestUtil.BufferCase.prototype.genBuffer = function ()
    {
        var buf = 0;
        buf = gl.createBuffer();
        if (buf != 0)
        {
            try
            {
                deUtil.pushUniqueToArray(this.m_allocatedBuffers, buf);
            }
            catch (err)
            {
                gl.deleteBuffers(buf);
                throw err;
            }
        }
        return buf;
    };

    /**
     * @param {number} buffer
     */
    glsBufferTestUtil.BufferCase.prototype.deleteBuffer = (buffer)
    {
        gl.deleteBuffers(buffer);
        this.m_allocatedBuffers.splice(this.m_allocatedBuffers.indexOf(buffer), 1);
    };


    glsBufferTestUtil.BufferCase.prototype.checkError = function ()
    {
        /** @type {number} */ var err = gl.getError();
        if (err != gl.NO_ERROR)
            throw new TestFailedException("Got " + glEnumToString(gl, err));
    };

    // Reference buffer.

    /**
     * @constructor
     */
    glsBufferTestUtil.ReferenceBuffer = function () {
        /** @type {ArrayBuffer} */ this.m_data;
    };

    /**
     * @param {number=} offset
     * @return {Uint8Array}
     */
    glsBufferTestUtil.ReferenceBuffer.prototype.getPtr = function (offset) {
        offset = offset ? offset : 0; return new Uint8Array(this.m_data, offset);
    };

    /**
     * @param {number} numBytes
     */
    glsBufferTestUtil.ReferenceBuffer.prototype.setSize = function (numBytes)
    {
        this.m_data = new ArrayBuffer(numBytes);
    };

    /**
     * @param {number}
     * @param {Uint8Array} bytes
     */
    glsBufferTestUtil.ReferenceBuffer.prototype.setData = function (numBytes, bytes)
    {
        this.setSize(numBytes);
        var dst = new Uint8Array(this.m_data);
        dst.set(bytes.subarray(bytes, numBytes));
    };

    /**
     * @param {number} offset
     * @param {number} numBytes
     * @param {Uint8Array} bytes
     */
    glsBufferTestUtil.ReferenceBuffer.prototype.setSubData = (offset, numBytes, bytes)
    {
        assertMsgOptions(deMath.deInBounds32(offset, 0, this.m_data.byteLength) && deMath.deInRange32(offset+numBytes, offset, this.m_data.byteLength),
            'Parameters not in buffer bounds or range', false, true);
        var dst = new Uint8Array(this.m_data, offset);
        dst.set(bytes.subarray(bytes, numBytes));
    };

    // Buffer writer system.

    /**
     * @enum {number}
     */
    glsBufferTestUtil.WriteType = {
        BUFFER_SUB_DATA: 0,
        BUFFER_WRITE_MAP: 1,
        TRANSFORM_FEEDBACK: 2,
        PIXEL_PACK: 3
    };

    /**
     * @param {glsBufferTestUtil.WriteType} write
     * @return {string}
     */
    glsBufferTestUtil.getWriteTypeDescription = function (write)
    {
        /** @type {Array<string>} */ var s_desc = [
            "gl.bufferSubData()",
            "gl.mapBufferRange()",
            "transform feedback",
            "gl.readPixels() into PBO binding"
        ];
        return deUtil.getArrayElement(s_desc, write);
    };

    // BufferWriterBase

    /**
     * @constructor
     */
    glsBufferTestUtil.BufferWriterBase = function ()
    {
        //enableLogging(true);
    };

    /**
     * //Meant to be overriden
     * @return {number}
     */
    glsBufferTestUtil.BufferWriterBase.prototype.getMinSize = function() { return 0;};

    /**
     * //Meant to be overriden
     * @return {number}
     */
    glsBufferTestUtil.BufferWriterBase.prototype.getAlignment = function() { return 0; };

    /**
     * //Meant to be overriden
     * @param {number} buffer
     * @param {number} offset
     * @param {number} numBytes
     * @param {Uint8Array} bytes
     */
    glsBufferTestUtil.BufferWriterBase.prototype.writeNoHint = function (buffer, offset, numBytes, bytes) {};

    /**
     * @param {number} buffer
     * @param {number} offset
     * @param {number} numBytes
     * @param {Uint8Array} bytes
     * @param {number} targetHint
     */
    glsBufferTestUtil.BufferWriterBase.prototype.write = function (buffer, offset, numBytes, bytes, targetHint)
    {
        //DE_UNREF(targetHint);
        this.writeNoHint(buffer, offset, numBytes, bytes);
    };

    // BufferWriter

    /**
     * @constructor
     * @param {glsBufferTestUtil.WriteType} writeType
     */
    glsBufferTestUtil.BufferWriter = function (writeType)
    {
        /** @type {glsBufferTestUtil.BufferWriterBase} */ this.m_writer = null;
        switch (writeType)
        {
            case glsBufferTestUtil.WriteType.BUFFER_SUB_DATA:        this.m_writer = new glsBufferTestUtil.BufferSubDataWriter();    break;
            case glsBufferTestUtil.WriteType.BUFFER_WRITE_MAP:    this.m_writer = new glsBufferTestUtil.BufferWriteMapWriter();    break;
            default:
                testFailed("Unsupported writer");
        }
    };

    /**
     * //Meant to be overriden
     * @return {number}
     */
    glsBufferTestUtil.BufferWriter.prototype.getMinSize = function() {return this.m_writer.getMinSize();};

    /**
     * //Meant to be overriden
     * @return {number}
     */
    glsBufferTestUtil.BufferWriter.prototype.getAlignment = function() {return this.m_writer.getAlignment();};

    /**
     * @param {number} buffer
     * @param {number} offset
     * @param {number} numBytes
     * @param {Uint8Array} bytes
     */
    glsBufferTestUtil.BufferWriter.prototype.writeNoHint = function (buffer, offset, numBytes, bytes)
    {
        assertMsgOptions(numBytes >= this.getMinSize(), 'Number of bytes to write is smaller than the minimum size.', false, true);
        assertMsgOptions(offset % this.getAlignment() == 0, 'Offset is not aligned.', false, true);
        assertMsgOptions((offset + numBytes) % this.getAlignment() == 0, 'Buffer segment is not aligned', false, true);
        return this.m_writer.writeNoHint(buffer, offset, numBytes, bytes);
    };

    /**
     * @param {number} buffer
     * @param {number} offset
     * @param {number} numBytes
     * @param {Uint8Array} bytes
     * @param {number} targetHint
     */
    glsBufferTestUtil.BufferWriter.prototype.write = function (buffer, offset, numBytes, bytes, targetHint)
    {
        assertMsgOptions(numBytes >= this.getMinSize(), 'Number of bytes to write is smaller than the minimum size.', false, true);
        assertMsgOptions(offset % this.getAlignment() == 0, 'Offset is not aligned.', false, true);
        assertMsgOptions((offset + numBytes) % this.getAlignment() == 0, 'Buffer segment is not aligned', false, true);
        return this.m_writer.write(buffer, offset, numBytes, bytes, targetHint);
    };

    // BufferSubDataWriter

    /**
     * @constructor
     * @extends {glsBufferTestUtil.BufferWriterBase}
     */
    glsBufferTestUtil.BufferSubDataWriter = function () {
        glsBufferTestUtil.BufferWriterBase.call(this);
    };

    glsBufferTestUtil.BufferSubDataWriter.prototype = Object.create(glsBufferTestUtil.BufferWriterBase.prototype);
    glsBufferTestUtil.BufferSubDataWriter.prototype.constructor = glsBufferTestUtil.BufferSubDataWriter;

    /**
     * @return {number}
     */
    glsBufferTestUtil.BufferSubDataWriter.prototype.getMinSize = function () { return 1; };

    /**
     * @return {number}
     */
    glsBufferTestUtil.BufferSubDataWriter.prototype.getAlignment = function () { return 1; };

    /**
     * @param {number} buffer
     * @param {number} offset
     * @param {number} numBytes
     * @param {Uint8Array} bytes
     */
    glsBufferTestUtil.BufferSubDataWriter.prototype.writeNoHint = function (buffer, offset, numBytes, bytes)
    {
        this.writeNoHint(buffer, offset, numBytes, bytes, gl.ARRAY_BUFFER);
    };

    /**
     * @param {number} buffer
     * @param {number} offset
     * @param {number} numBytes
     * @param {Uint8Array} bytes
     * @param {number} target
     */
    glsBufferTestUtil.BufferSubDataWriter.prototype.write = function (buffer, offset, numBytes, bytes, target)
    {
        gl.bindBuffer(target, buffer);
        gl.bufferSubData(target, offset, numBytes, bytes);
        gl.bindBuffer(target, 0);
    };

    // Buffer verifier system.

    glsBufferTestUtil.VerifyType = {
        AS_VERTEX_ARRAY: 0,
        AS_INDEX_ARRAY: 1,
        AS_UNIFORM_BUFFER: 2,
        AS_PIXEL_UNPACK_BUFFER: 3,
        BUFFER_READ_MAP: 4
    };

    /**
     * @param {glsBufferTestUtil.VerifyType} verify
     * @return {string}
     */
    glsBufferTestUtil.getVerifyTypeDescription = function (verify)
    {
        /** @type {string} */ var s_desc =
        [
            "rendering as vertex data",
            "rendering as index data",
            "reading in shader as uniform buffer data",
            "using as PBO and uploading to texture",
            "reading back using glMapBufferRange()"
        ];
        return deUtil.getArrayElement(s_desc, verify);
    };

    /**
     * @param {}
     */
    class BufferVerifierBase : public glu::CallLogWrapper
    {
    public:
                                BufferVerifierBase        (glu::RenderContext& renderCtx, tcu::TestLog& log);
        virtual                    ~BufferVerifierBase        (void) {}

        virtual int                getMinSize                (void) const = DE_NULL;
        virtual int                getAlignment            (void) const = DE_NULL;
        virtual bool            verify                    (deUint32 buffer, const deUint8* reference, int offset, int numBytes) = DE_NULL;
        virtual bool            verify                    (deUint32 buffer, const deUint8* reference, int offset, int numBytes, deUint32 targetHint);

    protected:
        glu::RenderContext&        m_renderCtx;
        tcu::TestLog&            m_log;

    private:
                                BufferVerifierBase        (const BufferVerifierBase& other);
        BufferVerifierBase&        operator=                (const BufferVerifierBase& other);
    };

    /**
     * @constructor
     */
    glsBufferTestUtil.BufferVerifierBase = function ()
    {
        //enableLogging(true);
    };

    /**
     * //Meant to be overriden
     * @return {number}
     */
    glsBufferTestUtil.BufferVerifierBase.prototype.getMinSize = function() { throw new Error('Must be overriden'); };

    /**
     * //Meant to be overriden
     * @return {number}
     */
    glsBufferTestUtil.BufferVerifierBase.prototype.getAlignment = function() { throw new Error('Must be overriden'); };

    /**
     * @param {number} buffer
     * @param {Uint8Array} reference
     * @param {number} numBytes
     * @param {number} targetHint
     * @return {boolean}
     */
    glsBufferTestUtil.BufferVerifierBase.prototype.verifyNoTarget = function (buffer, reference, offset, numBytes, targetHint)
    {
        //DE_UNREF(targetHint);
        return this.verify(buffer, reference, offset, numBytes);
    };

    /**
     * //Meant to be overriden
     * @param {number} buffer
     * @param {Uint8Array} reference
     * @param {number} numBytes
     * @return {boolean}
     */
    glsBufferTestUtil.BufferVerifierBase.prototype.verify = function (buffer, reference, offset, numBytes, targetHint) { throw new Error('Must be overriden'); };

    // BufferVerifier

    /**
     * @constructor
     * @extends {glsBufferTestUtil.BufferVerifierBase}
     * @param {glsBufferTestUtil.VerifyType} verifyType
     */
    glsBufferTestUtil.BufferVerifier = function(verifyType)
    {
        glsBufferTestUtil.BufferVerifierBase.call(this);

        /** @type {glsBufferTestUtil.BufferVerifierBase} */ this.m_verifier = null;
        switch (verifyType)
        {
            case glsBufferTestUtil.VerifyType.AS_VERTEX_ARRAY: this.m_verifier = new glsBufferTestUtil.VertexArrayVerifier(); break;
            case glsBufferTestUtil.VerifyType.AS_INDEX_ARRAY: this.m_verifier = new glsBufferTestUtil.IndexArrayVerifier(); break;
            //case glsBufferTestUtil.VerifyType.BUFFER_READ_MAP: this.m_verifier = new glsBufferTestUtil.BufferMapVerifier    (renderCtx, log);    break;
            default:
                testFailed("Unsupported verifier type");
        }
    };

    /**
     * @return {number}
     */
    glsBufferTestUtil.BufferVerifier.prototype.getMinSize = function () { this.m_verifier.getMinSize(); };

    /**
     * @return {number}
     */
    glsBufferTestUtil.BufferVerifier.prototype.getAlignment = function () { this.m_verifier.getAlignment(); };

    /**
     * @param {number} buffer
     * @param {Uint8Array} reference
     * @param {number} numBytes
     * @return {boolean}
     */
    glsBufferTestUtil.BufferVerifier.prototype.verifyNoTarget = function (buffer, reference, offset, numBytes)
    {
        assertMsgOptions(numBytes >= this.getMinSize(), 'Number of bytes to write is smaller than the minimum size.', false, true);
        assertMsgOptions(offset % this.getAlignment() == 0, 'Offset is not aligned.', false, true);
        assertMsgOptions((offset + numBytes) % this.getAlignment() == 0, 'Buffer segment is not aligned', false, true);
        return this.m_verifier.verifyNoTarget(buffer, reference, offset, numBytes);
    };

    /**
     * @param {number} buffer
     * @param {Uint8Array} reference
     * @param {number} offset
     * @param {number} numBytes
     * @param {number} targetHint
     * @return {boolean}
     */
    glsBufferTestUtil.BufferVerifier.prototype.verify = function (buffer, reference, offset, numBytes, targetHint)
    {
        assertMsgOptions(numBytes >= this.getMinSize(), 'Number of bytes to write is smaller than the minimum size.', false, true);
        assertMsgOptions(offset % this.getAlignment() == 0, 'Offset is not aligned.', false, true);
        assertMsgOptions((offset + numBytes) % this.getAlignment() == 0, 'Buffer segment is not aligned', false, true);
        return this.m_verifier.verify(buffer, reference, offset, numBytes, targetHint);
    };

    // VertexArrayVerifier

    /**
     * @constructor
     * @extends {glsBufferTestUtil.BufferVerifierBase}
     */
    glsBufferTestUtil.VertexArrayVerifier = function ()
    {
        glsBufferTestUtil.BufferVerifierBase.call(this);
        this.m_program = null;
        this.m_posLoc = 0;
        this.m_byteVecLoc = 0;
        this.m_vao = 0;

        /** @type {gluShaderUtil.GLSLVersion} */ var glslVersion = gluShaderUtil.getGLSLVersion(gl);

        assertMsgOptions(gluShaderUtil.isGLSLVersionSupported(glslVersion), 'Unsupported GLSL version', false, true);

        this.m_program = new gluShaderUtil.ShaderProgram(gluShaderUtil.makeVtxFragSources(
            gluShaderUtil.getGLSLVersionDeclaration(glslVersion) + "\n" +
            "in highp vec2 a_position;\n" +
            "in mediump vec3 a_byteVec;\n" +
            "out mediump vec3 v_byteVec;\n" +
            "void main (void)\n" +
            "{\n" +
            "    gl_Position = vec4(a_position, 0.0, 1.0);\n" +
            "    v_byteVec = a_byteVec;\n" +
            "}\n",

            gluShaderUtil.getGLSLVersionDeclaration(glslVersion) + "\n" +
            "in mediump vec3 v_byteVec;\n" +
            "layout(location = 0) out mediump vec4 o_color;\n" +
            "void main (void)\n" +
            "{\n" +
            "    o_color = vec4(v_byteVec, 1.0);\n" +
            "}\n"
        ));

        if (!this.m_program.isOk())
        {
            testFailed("Compile failed");
        }

        this.m_posLoc        = gl.getAttribLocation(this.m_program.getProgram(), "a_position");
        this.m_byteVecLoc    = gl.getAttribLocation(this.m_program.getProgram(), "a_byteVec");

        this.m_vao = gl.createVertexArray();
        this.m_positionBuf = gl.createBuffer();
        this.m_indexBuf = gl.createBuffer();
    };

    /**
     * @return {number}
     */
    glsBufferTestUtil.VertexArrayVerifier.prototype.getMinSize = function () { return 3*4; };

    /**
     * @return {number}
     */
    glsBufferTestUtil.VertexArrayVerifier.prototype.getAlignment = function () { return 1; };

    /**
     * delete
     */
    glsBufferTestUtil.VertexArrayVerifier.prototype.delete = function ()
    {
        if (this.m_vao)  gl.deleteVertexArray(this.m_vao);
        if (this.m_positionBuf) gl.deleteBuffer(this.m_positionBuf);
        if (this.m_indexBuf) gl.deleteBuffer(this.m_indexBuf);
    };

    /**
     * @param {number} gridSizeX
     * @param {number} gridSizeY
     */
    glsBufferTestUtil.computePositions = function (gridSizeX, gridSizeY)
    {
        var positions = [];

        for (var y = 0; y < gridSizeY; y++)
        for (var x = 0; x < gridSizeX; x++)
        {
            /** @type {number} */ sx0            = (x+0) / gridSizeX;
            /** @type {number} */ sy0            = (y+0) / gridSizeY;
            /** @type {number} */ sx1            = (x+1) / gridSizeX;
            /** @type {number} */ sy1            = (y+1) / gridSizeY;
            /** @type {number} */ fx0            = 2.0 * sx0 - 1.0;
            /** @type {number} */ fy0            = 2.0 * sy0 - 1.0;
            /** @type {number} */ fx1            = 2.0 * sx1 - 1.0;
            /** @type {number} */ fy1            = 2.0 * sy1 - 1.0;
            /** @type {number} */ baseNdx        = (y * gridSizeX + x) * 4;

            positions[baseNdx + 0] = [fx0, fy0];
            positions[baseNdx + 1] = [fx0, fy1];
            positions[baseNdx + 2] = [fx1, fy0];
            positions[baseNdx + 3] = [fx1, fy1];
        }
    };

    /**
     * @param {number} gridSizeX
     * @param {number} gridSizeY
     * @return {Uint16Array}
     */
    glsBufferTestUtil.computeIndices = function (gridSizeX, gridSizeY)
    {
        var newbuffer = new ArrayBuffer(3 * 2 * gridSizeX * gridSizeY);

        var indices = new Uint16Array(newbuffer);

        for (var quadNdx = 0; quadNdx < gridSizeX * gridSizeY; quadNdx++)
        {
            /** @type {number} */ var v00 = quadNdx*4 + 0;
            /** @type {number} */ var v01 = quadNdx*4 + 1;
            /** @type {number} */ var v10 = quadNdx*4 + 2;
            /** @type {number} */ var v11 = quadNdx*4 + 3;

            assertMsgOptions(v11 < (1<<16), 'Vertex index value won\'t fit into a 16-bit number', false, true);

            indices[quadNdx*6 + 0] = v10;
            indices[quadNdx*6 + 1] = v00;
            indices[quadNdx*6 + 2] = v01;

            indices[quadNdx*6 + 3] = v10;
            indices[quadNdx*6 + 4] = v01;
            indices[quadNdx*6 + 5] = v11;
        }

        return indices;
    };

    /**
     * @param {Uint8Array} ptr
     * @param {number} vtxNdx
     * @return {Array<number>}
     */
    glsBufferTestUtil.fetchVtxColor = function (ptr, vtxNdx)
    {
        return new tcuRGBA.RGBA([
            ptr[vtxNdx * 3 + 0],
            ptr[vtxNdx * 3 + 1],
            ptr[vtxNdx * 3 + 2],
            255]).toVec();
    };

    /**
     * @param {tcuSurface.Surface} dst
     * @param {number} numQuads
     * @param {number} rowLength
     * @param {Uint8Array} inPtr
     */
    glsBufferTestUtil.renderQuadGridReference = function (dst, numQuads, rowLength, inPtr)
    {
        dst.setSize(rowLength * glsBufferTestUtil.VERIFY_QUAD_SIZE, (numQuads / rowLength + (numQuads % rowLength != 0 ? 1 : 0)) * glsBufferTestUtil.VERIFY_QUAD_SIZE);

        /** @type {tcuTexture.PixelBufferAccess} */ var dstAccess = dst.getAccess();
        dstAccess.clear([0, 0, 0, 0xff]);

        for (var quadNdx = 0; quadNdx < numQuads; quadNdx++)
        {
            /** @type {number} */ var x0 = (quadNdx % rowLength) * glsBufferTestUtil.VERIFY_QUAD_SIZE;
            /** @type {number} */ var y0 = (quadNdx / rowLength) * glsBufferTestUtil.VERIFY_QUAD_SIZE;
            /** @type {Array<number>} */ var v00 = glsBufferTestUtil.fetchVtxColor(inPtr, quadNdx * 4 + 0);
            /** @type {Array<number>} */ var v10 = glsBufferTestUtil.fetchVtxColor(inPtr, quadNdx * 4 + 1);
            /** @type {Array<number>} */ var v01 = glsBufferTestUtil.fetchVtxColor(inPtr, quadNdx * 4 + 2);
            /** @type {Array<number>} */ var v11 = glsBufferTestUtil.fetchVtxColor(inPtr, quadNdx * 4 + 3);

            for (var y = 0; y < glsBufferTestUtil.VERIFY_QUAD_SIZE; y++)
            for (var x = 0; x < glsBufferTestUtil.VERIFY_QUAD_SIZE; x++)
            {
                /** @type {number} */ var fx = (x + 0.5) / glsBufferTestUtil.VERIFY_QUAD_SIZE;
                /** @type {number} */ var fy = (y + 0.5) / glsBufferTestUtil.VERIFY_QUAD_SIZE;

                /** @type {boolean} */ var tri = fx + fy <= 1.0;
                /** @type {number} */ var tx = tri ? fx : (1.0-fx);
                /** @type {number} */ var ty = tri ? fy : (1.0-fy);
                /** @type {Array<number>} */ var t0 = tri ? v00 : v11;
                /** @type {Array<number>} */ var t1 = tri ? v01 : v10;
                /** @type {Array<number>} */ var t2 = tri ? v10 : v01;
                /** @type {Array<number>} */ var color = t0 + (t1 - t0) * tx + (t2 - t0) * ty;

                dstAccess.setPixel(color, x0 + x, y0 + y);
            }
        }
    };

    /**
     * @param {number} buffer
     * @param {Uint8Array} refPtr
     * @param {number} offset
     * @param {number} numBytes
     * @return {boolean}
     */
    glsBufferTestUtil.VertexArrayVerifier.prototype.verifyNoTarget = function (buffer, refPtr, offset, numBytes)
    {
        var numBytesInVtx = 3;
        var numBytesInQuad = numBytesInVtx * 4;
        var maxQuadsX = Math.min(128, Math.floor(gl.viewport.width / glsBufferTestUtil.VERIFY_QUAD_SIZE));
        var maxQuadsY = Math.min(128, Math.floor(gl.viewport.height / glsBufferTestUtil.VERIFY_QUAD_SIZE));
        var maxQuadsPerBatch = maxQuadsX * maxQuadsY;
        var numVerified = 0;
        var program = this.m_program.getProgram();
        /** @type {tcuRGBA.RGBA} */ var threshold = /*TODO: renderTarget.getPixelFormat().getColorThreshold() + tcu::RGBA(3,3,3,3);*/ new tcuRGBA.RGBA([3, 3, 3, 3]);
        var isOk = true;

        /** @type {Array<number>} */ var positions = [];
        /** @type {Uint16Array} */var indices;

        /** @type {tcuSurface.Surface} */ var rendered = new tcuSurface.Surface();
        /** @type {tcuSurface.Surface} */ var reference = new tcuSurface.Surface();

        assertMsgOptions(numBytes >= numBytesInQuad, 'Number of bytes must be bigger than number of bytes per quad'); // Can't render full quad with smaller buffers.

        positions = glsBufferTestUtil.computePositions(maxQuadsX, maxQuadsY);
        indices = glsBufferTestUtil.computeIndices(maxQuadsX, maxQuadsY);

        // Reset buffer bindings.
        gl.bindBuffer(gl.PIXEL_PACK_BUFFER, 0);

        // Setup rendering state.
        gl.viewport(0, 0, maxQuadsX * glsBufferTestUtil.VERIFY_QUAD_SIZE, maxQuadsY * glsBufferTestUtil.VERIFY_QUAD_SIZE);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.useProgram(program);
        gl.bindVertexArray(this.m_vao);

        // Upload positions
        gl.bindBuffer                (gl.ARRAY_BUFFER, this.m_positionBuf);
        gl.bufferData                (gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        gl.enableVertexAttribArray    (this.m_posLoc);
        gl.vertexAttribPointer        (this.m_posLoc, 2, gl.FLOAT, false, 0, 0);

        // Upload indices
        gl.bindBuffer                (gl.ELEMENT_ARRAY_BUFFER, this.m_indexBuf);
        gl.bufferData                (gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

        gl.enableVertexAttribArray    (this.m_byteVecLoc);
        gl.bindBuffer                (gl.ARRAY_BUFFER, buffer);

        while (numVerified < numBytes)
        {
            /** @type {number} */ var numRemaining = numBytes-numVerified;
            var isLeftoverBatch = numRemaining < numBytesInQuad;
            /** @type {number} */ var numBytesToVerify = isLeftoverBatch ? numBytesInQuad : deMath.min(maxQuadsPerBatch * numBytesInQuad, numRemaining - numRemaining % numBytesInQuad);
            /** @type {number} */ var curOffset = isLeftoverBatch ? (numBytes - numBytesInQuad) : numVerified;
            /** @type {number} */ var numQuads = Math.floor(numBytesToVerify / numBytesInQuad);
            /** @type {number} */ var numCols = Math.min(maxQuadsX, numQuads);
            /** @type {number} */ var numRows = Math.floor(numQuads/maxQuadsX) + (numQuads%maxQuadsX != 0 ? 1 : 0);
            /** @type {string} */ var imageSetDesc = "Bytes " + (offset + curOffset) + " to " + (offset+curOffset+numBytesToVerify-1);

            assertMsgOptions(numBytesToVerify > 0 && numBytesToVerify % numBytesInQuad == 0, 'Bytes to verify must be greater than zero and must be a multiple of the bytes per quad', false, true);
            assertMsgOptions(deMath.deInBounds32(curOffset, 0, numBytes), 'Offset out of bounds', false, true);
            assertMsgOptions(deMath.deInRange32(curOffset+numBytesToVerify, curOffset, numBytes), 'Range of bytes to verify outside of bounds');

            // Render batch.
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.vertexAttribPointer(this.m_byteVecLoc, 3, gl.UNSIGNED_BYTE, true, 0, offset + curOffset);
            gl.drawElements(gl.TRIANGLES, numQuads*6, gl.UNSIGNED_SHORT, null);

            glsBufferTestUtil.renderQuadGridReference(reference,  numQuads, numCols, refPtr.subarray(offset + curOffset));

            rendered.setSize(numCols * glsBufferTestUtil.VERIFY_QUAD_SIZE, numRows * glsBufferTestUtil.VERIFY_QUAD_SIZE);
            rendered.readViewport(gl);

            if (!tcuImageCompare.pixelThresholdCompare("RenderResult", imageSetDesc, reference, rendered, threshold, tcuImageCompare.CompareLogMode.RESULT))
            {
                isOk = false;
                break;
            }

            numVerified += isLeftoverBatch ? numRemaining : numBytesToVerify;
        }

        gl.bindVertexArray(0);

        return isOk;
    };

    class IndexArrayVerifier : public BufferVerifierBase
    {
    public:
                            IndexArrayVerifier        (glu::RenderContext& renderCtx, tcu::TestLog& log);
                            ~IndexArrayVerifier        (void);

        int                    getMinSize                (void) const { return 2; }
        int                    getAlignment            (void) const { return 1; }
        bool                verify                    (deUint32 buffer, const deUint8* reference, int offset, int numBytes);

    private:
        glu::ShaderProgram*    m_program;
        deUint32            m_posLoc;
        deUint32            m_colorLoc;

        deUint32            m_vao;
        deUint32            m_positionBuf;
        deUint32            m_colorBuf;
    };

});
