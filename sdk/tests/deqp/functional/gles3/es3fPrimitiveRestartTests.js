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

define(['framework/common/tcuTestCase'], function(tcuTestCase){
    'use strict';

    /** @const @type {int} */ var MAX_RENDER_WIDTH = 256;
    /** @const @type {int} */ var MAX_RENDER_HEIGHT = 256;

    /** @const @type {deUint32} */ var MAX_UNSIGNED_BYTE = (1<<8) - 1;
    /** @const @type {deUint32} */ var MAX_UNSIGNED_SHORT = (1<<16) - 1;
    /** @const @type {deUint32} */ var MAX_UNSIGNED_INT = (1 << 32) - 1;

    /** @const @type {deUint8} */ var RESTART_INDEX_UNSIGNED_BYTE = MAX_UNSIGNED_BYTE;
    /** @const @type {deUint16} */ var RESTART_INDEX_UNSIGNED_SHORT = MAX_UNSIGNED_SHORT;
    /** @const @type {deUint32} */ var RESTART_INDEX_UNSIGNED_INT = MAX_UNSIGNED_INT;

    var DE_ASSERT = function(expression)
    {
        if (!expression) throw new Error('Assert failed');
    };

    var GLU_CHECK_MSG = function(message)
    {
        console.log(message);
    };

    var TCU_FAIL = function(message) {
        throw new Error(message);
    };

    /**
     * @enum PrimitiveType
     */
    var PrimitiveType = {
        PRIMITIVE_POINTS: 0,
        PRIMITIVE_LINE_STRIP: 1,
        PRIMITIVE_LINE_LOOP: 2,
        PRIMITIVE_LINES: 3,
        PRIMITIVE_TRIANGLE_STRIP: 4,
        PRIMITIVE_TRIANGLE_FAN: 5,
        PRIMITIVE_TRIANGLES: 6
    };

    /**
     * @enum IndexType
     */
    var IndexType = {
        INDEX_UNSIGNED_BYTE: 0,
        INDEX_UNSIGNED_SHORT: 1,
        INDEX_UNSIGNED_INT: 2
    };

    /**
     * @enum Function
     */
    var Function = {
        FUNCTION_DRAW_ELEMENTS: 0,
        FUNCTION_DRAW_ELEMENTS_INSTANCED: 1,
        FUNCTION_DRAW_RANGE_ELEMENTS: 2
    };

    /**
    * PrimitiveRestartCase class, inherits from TestCase class
    * @constructor
    * @param {string} name
    * @param {string} description
    * @param {PrimitiveType} primType
    * @param {IndexType} indexType
    * @param {Function} function
    * @param {boolean} beginWithRestart
    * @param {boolean} endWithRestart
    * @param {boolean} duplicateRestarts
    */
    var PrimitiveRestartCase = function(name, description, primType, indexType,
                                        function, beginWithRestart, endWithRestart,
                                        duplicateRestarts)
    {
        tcuTestCase.DeqpTest.call(this, name, description);
        /** @type {PrimitiveType} */ this.m_primType = primType;
        /** @type {IndexType} */ this.m_indexType = indexType;
        /** @type {Function} */ this.m_function = function;
        /** @type {boolean} */ this.m_beginWithRestart = beginWithRestart; // Whether there will be restart indices at the beginning of the index array.
        /** @type {boolean} */ this.m_endWithRestart = endWithRestart; // Whether there will be restart indices at the end of the index array.
        /** @type {boolean} */ this.m_duplicateRestarts = duplicateRestarts; // Whether two consecutive restarts are used instead of one.
        /** @type {ShaderProgram} */ this.m_program = null;

        // \note Only one of the following index vectors is used (according to m_indexType).
        /** @type {Array<deUint8>} */ this.m_indicesUB = [];
        /** @type {Array<deUint16>} */ this.m_indicesUS = [];
        /** @type {Array<deUint32>} */ this.m_indicesUI = [];

        /** @type {Array<float>} */ this.m_positions = [];
    };

    PrimitiveRestartCase.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    PrimitiveRestartCase.prototype.constructor = PrimitiveRestartCase;

    /**
    * Draw with the appropriate GLES3 draw function.
    * @param {number} startNdx
    * @param {number} count
    */
    PrimitiveRestartCase.prototype.draw = function(int startNdx, int count) {
            /** @type {PrimitiveType} */ var primTypeGL;

            switch (this.m_primType)
            {
                case PrimitiveType.PRIMITIVE_POINTS:
                    primTypeGL = gl.POINTS;
                    break;
                case PrimitiveType.PRIMITIVE_LINE_STRIP:
                    primTypeGL = gl.LINE_STRIP;
                    break;
                case PrimitiveType.PRIMITIVE_LINE_LOOP:
                    primTypeGL = gl.LINE_LOOP;
                    break;
                case PrimitiveType.PRIMITIVE_LINES:
                    primTypeGL = gl.LINES;
                    break;
                case PrimitiveType.PRIMITIVE_TRIANGLE_STRIP:
                    primTypeGL = gl.TRIANGLE_STRIP;
                    break;
                case PrimitiveType.PRIMITIVE_TRIANGLE_FAN:
                    primTypeGL = gl.TRIANGLE_FAN;
                    break;
                case PrimitiveType.PRIMITIVE_TRIANGLES:
                    primTypeGL = gl.TRIANGLES;
                    break;
                default:
                    DE_ASSERT(DE_FALSE);
                    primTypeGL = 0;
            }

            /** @type {IndexType} */ var indexTypeGL;

            switch (this.m_indexType)
            {
                case IndexType.INDEX_UNSIGNED_BYTE:
                    indexTypeGL = gl.UNSIGNED_BYTE;
                    break;
                case IndexType.INDEX_UNSIGNED_SHORT:
                    indexTypeGL = gl.UNSIGNED_SHORT;
                    break;
                case IndexType.INDEX_UNSIGNED_INT:
                    indexTypeGL = gl.UNSIGNED_INT;
                    break;
                default:
                    DE_ASSERT(DE_FALSE);
                    indexTypeGL = 0;
            }

            /** @type {deUint32} */ var restartIndex = this.m_indexType == IndexType.INDEX_UNSIGNED_BYTE ? RESTART_INDEX_UNSIGNED_BYTE :
                                                       this.m_indexType == IndexType.INDEX_UNSIGNED_SHORT ? RESTART_INDEX_UNSIGNED_SHORT :
                                                       this.m_indexType == IndexType.INDEX_UNSIGNED_INT ? RESTART_INDEX_UNSIGNED_INT :
                                                       0;

            DE_ASSERT(restartIndex != 0);
            //TODO: drawElementsInstanced
            if (this.m_function == Function.FUNCTION_DRAW_ELEMENTS)
                gl.drawElements(primTypeGL, (GLsizei)count, indexTypeGL, (GLvoid*)getIndexPtr(startNdx));
            else if (this.m_function == Function.FUNCTION_DRAW_ELEMENTS_INSTANCED)
                gl.drawElementsInstanced(primTypeGL, (GLsizei)count, indexTypeGL, (GLvoid*)getIndexPtr(startNdx), 1);
            else
            {
                DE_ASSERT(this.m_function == Function.FUNCTION_DRAW_RANGE_ELEMENTS);

                // Find the largest non-restart index in the index array (for glDrawRangeElements() end parameter).

                /** @type {deUint32} */ var max = 0;

                /** @type {number} */ var numIndices = getNumIndices();
                for (var i = 0; i < numIndices; i++)
                {
                    /** @type {deUint32} */ var index = getIndex(i);
                    if (index != restartIndex && index > max)
                        max = index;
                }
                //TODO: drawRangeElements
                gl.drawRangeElements(primTypeGL, 0, (GLuint)max, (GLsizei)count, indexTypeGL, (GLvoid*)getIndexPtr(startNdx));
            }
        }
    };

    PrimitiveRestartCase.prototype.renderWithRestart = function() {
        GLU_CHECK_MSG("PrimitiveRestartCase::renderWithRestart() begin");

        gl.enable(gl.PRIMITIVE_RESTART_FIXED_INDEX);
        GLU_CHECK_MSG("Enable primitive restart");

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
        GLU_CHECK_MSG("Clear in PrimitiveRestartCase::renderWithRestart()");

        draw(0, getNumIndices());
        GLU_CHECK_MSG("Draw in PrimitiveRestartCase::renderWithRestart()");

        GLU_CHECK_MSG("PrimitiveRestartCase::renderWithRestart() end");
    };

    PrimitiveRestartCase.prototype.renderWithoutRestart = function() {
        GLU_CHECK_MSG("PrimitiveRestartCase::renderWithoutRestart() begin");

        deUint32 restartIndex = this.m_indexType == IndexType.INDEX_UNSIGNED_BYTE ? RESTART_INDEX_UNSIGNED_BYTE :
                                this.m_indexType == IndexType.INDEX_UNSIGNED_SHORT ? RESTART_INDEX_UNSIGNED_SHORT :
                                this.m_indexType == IndexType.INDEX_UNSIGNED_INT ? RESTART_INDEX_UNSIGNED_INT :
                                0;

        DE_ASSERT(restartIndex != 0);

        gl.disable(gl.PRIMITIVE_RESTART_FIXED_INDEX);
        GLU_CHECK_MSG("Disable primitive restart");

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
        GLU_CHECK_MSG("Clear in PrimitiveRestartCase::renderWithoutRestart()");

        // Draw, emulating primitive restart.

        /** @type {number} */ var numIndices = getNumIndices();

        DE_ASSERT(numIndices >= 0);

        /** @type {number} */ var indexArrayStartNdx = 0; // Keep track of the draw start index - first index after a primitive restart, or initially the first index altogether.

        for (var indexArrayNdx = 0; indexArrayNdx <= numIndices; indexArrayNdx++) // \note Goes one "too far" in order to detect end of array as well.
        {
            if (indexArrayNdx >= numIndices || getIndex(indexArrayNdx) == restartIndex) // \note Handle end of array the same way as a restart index encounter.
            {
                if (indexArrayStartNdx < numIndices)
                {
                    // Draw from index indexArrayStartNdx to index indexArrayNdx-1 .

                    draw(indexArrayStartNdx, indexArrayNdx - indexArrayStartNdx);
                    GLU_CHECK_MSG("Draw in PrimitiveRestartCase::renderWithoutRestart()");
                }

                indexArrayStartNdx = indexArrayNdx + 1; // Next draw starts just after this restart index.
            }
        }

        GLU_CHECK_MSG("PrimitiveRestartCase::renderWithoutRestart() end");
    };

    /**
    * @param {deUint32} index
    */
    PrimitiveRestartCase.prototype.addIndex = function(index) {
        if (this.m_indexType == IndexType.INDEX_UNSIGNED_BYTE)
        {
            DE_ASSERT(deMath.inRange(index, 0, MAX_UNSIGNED_BYTE));
            this.m_indicesUB.push(index); // deUint8
        }
        else if (this.m_indexType == IndexType.INDEX_UNSIGNED_SHORT)
        {
            DE_ASSERT(deMath.inRange(index, 0, MAX_UNSIGNED_SHORT));
            this.m_indicesUS.push(index); // deUint16
        }
        else if (this.m_indexType == IndexType.INDEX_UNSIGNED_INT)
        {
            DE_ASSERT(deMath.inRange(index, 0, MAX_UNSIGNED_INT));
            this.m_indicesUI.push(index); // // deUint32
        }
        else
            DE_ASSERT(DE_FALSE);
    };

    /**
    * @param {number} indexNdx
    * @return {number}
    */
    PrimitiveRestartCase.prototype.getIndex = function(indexNdx) {
        switch (this.m_indexType)
        {
            case IndexType.INDEX_UNSIGNED_BYTE:
                return this.m_indicesUB[indexNdx]; //deUint32
            case IndexType.INDEX_UNSIGNED_SHORT:
                return this.m_indicesUS[indexNdx]; //deUint32
            case IndexType.INDEX_UNSIGNED_INT:
                return this.m_indicesUI[indexNdx];
            default:
                DE_ASSERT(DE_FALSE);
                return 0;
        }
    };

    /**
    * @return {number}
    */
    PrimitiveRestartCase.prototype.getNumIndices = function() {
        switch (this.m_indexType)
        {
            case IndexType.INDEX_UNSIGNED_BYTE:
                return this.m_indicesUB.length;
            case IndexType.INDEX_UNSIGNED_SHORT:
                return this.m_indicesUS.length;
            case IndexType.INDEX_UNSIGNED_INT:
                return this.m_indicesUI.length;
            default:
                DE_ASSERT(DE_FALSE);
                return 0;
        }
    };

    /**
    * Pointer to the index value at index indexNdx.
    * @param {number} indexNdx
    * @return {Array<number>}
    */
    PrimitiveRestartCase.prototype.getIndexPtr = function(indexNdx) {
        //TODO: implement
        switch (this.m_indexType)
        {
            case IndexType.INDEX_UNSIGNED_BYTE:
                return this.m_indicesUB[indexNdx];
            case IndexType.INDEX_UNSIGNED_SHORT:
                return this.m_indicesUS[indexNdx];
            case IndexType.INDEX_UNSIGNED_INT:
                return this.m_indicesUI[indexNdx];
            default:
                DE_ASSERT(DE_FALSE);
                return DE_NULL;
        }
    };

    PrimitiveRestartCase.prototype.init = function() {
        // Create shader program.

        /** @type {string} */ var vertShaderSource =
            "#version 300 es\n" +
            "in highp vec4 a_position;\n" +
            "\n" +
            "void main()\n" +
            "{\n" +
            "	gl_Position = a_position;\n" +
            "}\n";

            /** @type {string} */ var fragShaderSource =
            "#version 300 es\n" +
            "layout(location = 0) out mediump vec4 o_color;\n" +
            "\n" +
            "void main()\n" +
            "{\n" +
            "	o_color = vec4(1.0f);\n" +
            "}\n";

        DE_ASSERT(!this.m_program);
        this.m_program = new gluShaderProgram.ShaderProgram(gl, gluShaderProgram.makeVtxFragSources(vertShaderSource, fragShaderSource));

        if(!this.m_program->isOk())
        {
            //m_testCtx.getLog() << *this.m_program;
            TCU_FAIL("Failed to compile shader");
        }

        /** @type {number} */ var restartIndex = this.m_indexType == IndexType.INDEX_UNSIGNED_BYTE ? RESTART_INDEX_UNSIGNED_BYTE :
                                                   this.m_indexType == IndexType.INDEX_UNSIGNED_SHORT ? RESTART_INDEX_UNSIGNED_SHORT :
                                                   this.m_indexType == IndexType.INDEX_UNSIGNED_INT ? RESTART_INDEX_UNSIGNED_INT :
                                                   0;

        DE_ASSERT(restartIndex != 0);

        DE_ASSERT(getNumIndices() == 0);

        // If testing a case with restart at beginning, add it there.
        if (this.m_beginWithRestart)
        {
            addIndex(restartIndex);
            if (this.m_duplicateRestarts)
                addIndex(restartIndex);
        }

        // Generate vertex positions and indices depending on primitive type.
        // \note At this point, restarts shall not be added to the start or the end of the index vector. Those are special cases, and are done above and after the following if-else chain, respectively.

        if (this.m_primType == PrimitiveType.PRIMITIVE_POINTS)
        {
            // Generate rows with different numbers of points.

            /** @type {number} */ var curIndex = 0;
            /** @const @type {number} */ var numRows = 20;

            for (var row = 0; row < numRows; row++)
            {
                for (var col = 0; col < row + 1; col++)
                {
                    /** @type {number} */ var fx = -1.0 + 2.0 * (col + 0.5) / numRows;
                    /** @type {number} */ var fy = -1.0 + 2.0 * (row + 0.5) / numRows;

                    this.m_positions.push(fx);
                    this.m_positions.push(fy);

                    addIndex(curIndex++);
                }

                if (row < numRows - 1) // Add a restart after all but last row.
                {
                    addIndex(restartIndex);
                    if (this.m_duplicateRestarts)
                        addIndex(restartIndex);
                }
            }
        }
        else if (this.m_primType == PrimitiveType.PRIMITIVE_LINE_STRIP ||
                 this.m_primType == PrimitiveType.PRIMITIVE_LINE_LOOP ||
                 this.m_primType == PrimitiveType.PRIMITIVE_LINES)
        {
            // Generate a numRows x numCols arrangement of line polygons of different vertex counts.

            /** @type {number} */ var curIndex = 0;
            /** @const @type {number} */ var numRows = 4;
            /** @const @type {number} */ var numCols = 4;

            for (var row = 0; row < numRows; row++)
            {
                /** @type {number} */ var centerY = -1.0 + 2.0 * (row + 0.5) / numRows;

                for (var col = 0; col < numCols; col++)
                {
                    /** @type {number} */ var centerX = -1.0 + 2.0 * (col + 0.5) / numCols;
                    /** @type {number} */ var numVertices = row * numCols + col + 1;

                    for (var i = 0; i < numVertices; i++)
                    {
                        /** @type {number} */ var fx = centerX + 0.9 * Math.cos(i * 2.0 * DE_PI / numVertices) / numCols;
                        /** @type {number} */ var fy = centerY + 0.9 * Math.sin(i * 2.0 * DE_PI / numVertices) / numRows;

                        this.m_positions.push(fx);
                        this.m_positions.push(fy);

                        addIndex(curIndex++);
                    }

                    if (col < numCols - 1 || row < numRows - 1) // Add a restart after all but last polygon.
                    {
                        addIndex(restartIndex);
                        if (this.m_duplicateRestarts)
                            addIndex(restartIndex);
                    }
                }
            }
        }
        else if (this.m_primType == PrimitiveType.PRIMITIVE_TRIANGLE_STRIP)
        {
            // Generate a number of horizontal triangle strips of different lengths.

            /** @type {number} */ var curIndex = 0;
            /** @const @type {number} */ var numStrips = 20;

            for (var stripNdx = 0; stripNdx < numStrips; stripNdx++)
            {
                /** @type {number} */ var numVertices = stripNdx + 1;

                for (var i = 0; i < numVertices; i++)
                {
                    /** @type {number} */ var fx = -0.9 + 1.8 * (i / 2 * 2) / numStrips;
                    /** @type {number} */ var fy = -0.9 + 1.8 * (stripNdx + (i % 2 == 0 ? 0.0 : 0.8)) / numStrips;

                    this.m_positions.push(fx);
                    this.m_positions.push(fy);

                    addIndex(curIndex++);
                }

                if (stripNdx < numStrips - 1) // Add a restart after all but last strip.
                {
                    addIndex(restartIndex);
                    if (this.m_duplicateRestarts)
                        addIndex(restartIndex);
                }
            }
        }
        else if (this.m_primType == PrimitiveType.PRIMITIVE_TRIANGLE_FAN)
        {
            // Generate a numRows x numCols arrangement of triangle fan polygons of different vertex counts.

            /** @type {number} */ var curIndex = 0;
            /** @const @type {number} */ var numRows = 4;
            /** @const @type {number} */ var numCols = 4;

            for (var row = 0; row < numRows; row++)
            {
                /** @type {number} */ var centerY = -1.0 + 2.0 * (row + 0.5) / numRows;

                for (var col = 0; col < numCols; col++)
                {
                    /** @type {number} */ var centerX = -1.0 + 2.0 * (col + 0.5) / numCols;
                    /** @type {number} */ var numArcVertices = row * numCols + col;

                    this.m_positions.push(centerX);
                    this.m_positions.push(centerY);

                    addIndex(curIndex++);

                    for (var i = 0; i < numArcVertices; i++)
                    {
                        /** @type {number} */ var fx = centerX + 0.9 * Math.cos(i * 2.0 * Math.PI / numArcVertices) / numCols;
                        /** @type {number} */ var fy = centerY + 0.9 * Math.sin(i * 2.0 * Math.PI / numArcVertices) / numRows;

                        this.m_positions.push(fx);
                        this.m_positions.push(fy);

                        addIndex(curIndex++);
                    }

                    if (col < numCols - 1 || row < numRows - 1) // Add a restart after all but last polygon.
                    {
                        addIndex(restartIndex);
                        if (this.m_duplicateRestarts)
                            addIndex(restartIndex);
                    }
                }
            }
        }
        else if (this.m_primType == PrimitiveType.PRIMITIVE_TRIANGLES)
        {
            // Generate a number of rows with (potentially incomplete) triangles.

            /** @type {number} */ var curIndex	= 0;
            /** @const @type {number} */ var numRows		= 3*7;

            for (var rowNdx = 0; rowNdx < numRows; rowNdx++)
            {
                /** @type {number} */ var numVertices = rowNdx + 1;

                for (var i = 0; i < numVertices; i++)
                {
                    /** @type {number} */ var fx = -0.9 + 1.8 * ((i / 3) + (i % 3 == 2 ? 0.8 : 0.0)) * 3 / numRows;
                    /** @type {number} */ var fy = -0.9 + 1.8 * (rowNdx + (i % 3 == 0 ? 0.0 : 0.8)) / numRows;

                    this.m_positions.push(fx);
                    this.m_positions.push(fy);

                    addIndex(curIndex++);
                }

                if (rowNdx < numRows - 1) // Add a restart after all but last row.
                {
                    addIndex(restartIndex);
                    if (this.m_duplicateRestarts)
                        addIndex(restartIndex);
                }
            }
        }
        else
            DE_ASSERT(DE_FALSE);

        // If testing a case with restart at end, add it there.
        if (this.m_endWithRestart)
        {
            addIndex(restartIndex);
            if (this.m_duplicateRestarts)
                addIndex(restartIndex);
        }

        // Special case assertions.

        /** @type {number} */ var numIndices = getNumIndices();

        DE_ASSERT(numIndices > 0);
        DE_ASSERT(this.m_beginWithRestart || getIndex(0) != restartIndex); // We don't want restarts at beginning unless the case is a special case.
        DE_ASSERT(this.m_endWithRestart || getIndex(numIndices-1) != restartIndex); // We don't want restarts at end unless the case is a special case.

        if (!this.m_duplicateRestarts)
            for (var i = 1; i < numIndices; i++)
                DE_ASSERT(getIndex(i) != restartIndex || getIndex(i-1) != restartIndex); // We don't want duplicate restarts unless the case is a special case.

    };

    PrimitiveRestartCase.prototype.iterate = function() {
        /** @type {number} */ var width = Math.min(this.m_context.getRenderTarget().getWidth(), MAX_RENDER_WIDTH);
        /** @type {number} */ var height = Math.min(this.m_context.getRenderTarget().getHeight(), MAX_RENDER_HEIGHT);

        /** @type {number} */ var xOffsetMax = this.m_context.getRenderTarget().getWidth() - width;
        /** @type {number} */ var yOffsetMax = this.m_context.getRenderTarget().getHeight() - height;

        /** @type {deRandom.Random} */ var rnd (deString.deStringHash(getName()));

        /** @type {number} */ var xOffset = rnd.getInt(0, xOffsetMax);
        /** @type {number} */ var yOffset = rnd.getInt(0, yOffsetMax);
        /** @type {tcuSurface.Surface} */ var referenceImg (width, height);
        /** @type {tcuSurface.Surface} */ var resultImg (width, height);

        gl.viewport(xOffset, yOffset, width, height);
        gl.clearColor(0.0f, 0.0f, 0.0f, 1.0f);

        /** @type {number} */ var program = m_program->getProgram();
        gl.useProgram(program);

        // Setup position attribute.

        /** @type {number} */ var loc = gl.getAttribLocation(program, "a_position");
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, GL_FLOAT, GL_FALSE, 0, &m_positions[0]); //TODO: create/bind buffers

        // Render result.
        // TODO: readPixels
        renderWithRestart();
        glu::readPixels(this.m_context.getRenderContext(), xOffset, yOffset, resultImg.getAccess());

        // Render reference (same scene as the real deal, but emulate primitive restart without actually using it).

        renderWithoutRestart();
        glu::readPixels(this.m_context.getRenderContext(), xOffset, yOffset, referenceImg.getAccess());

        // Compare.
        // TODO: pixelThresholdCompare
        /** @type {boolean} */ var testOk = tcu::pixelThresholdCompare(this.m_testCtx.getLog(), "ComparisonResult", "Image comparison result", referenceImg, resultImg, tcu::RGBA(0, 0, 0, 0), tcu::COMPARE_LOG_RESULT);

        assertMsgOptions(testOk, '', true, false);
        glUseProgram(null);

        return tcuTestCase.runner.IterateResult.STOP;
    };


    var init = function() {
        for (var isRestartBeginCaseI = 0; isRestartBeginCaseI <= 1; isRestartBeginCaseI++)
        {
            for (var isRestartEndCaseI = 0; isRestartEndCaseI <= 1; isRestartEndCaseI++)
            {
                for (var isDuplicateRestartCaseI = 0; isDuplicateRestartCaseI <= 1; isDuplicateRestartCaseI++)
                {
                    /** @type {boolean} */ var isRestartBeginCase = isRestartBeginCaseI != 0;
                    /** @type {boolean} */ var isRestartEndCase = isRestartEndCaseI != 0;
                    /** @type {boolean} */ var isDuplicateRestartCase = isDuplicateRestartCaseI != 0;

                    /** @type {string} */ var specialCaseGroupName;

                    if (isRestartBeginCase) specialCaseGroupName = "begin_restart";
                    if (isRestartEndCase) specialCaseGroupName += (specialCaseGroupName.empty() ? "" : "_") + "end_restart";
                    if (isDuplicateRestartCase) specialCaseGroupName += (specialCaseGroupName.empty() ? "" : "_") + "duplicate_restarts";

                    if (specialCaseGroupName.empty())
                        specialCaseGroupName = "basic";

                    /** @type {TestCaseGroup} */ var specialCaseGroup = new TestCaseGroup(m_context, specialCaseGroupName.c_str(), "");
                    addChild(specialCaseGroup);

                    for (var primType = 0; primType < PrimitiveRestartCase::PRIMITIVE_LAST; primType++)
                    {
                        /** @type {string} */ var primTypeName = primType == PrimitiveRestartCase::PRIMITIVE_POINTS ? "points" :
                                                                 primType == PrimitiveRestartCase::PRIMITIVE_LINE_STRIP ? "line_strip" :
                                                                 primType == PrimitiveRestartCase::PRIMITIVE_LINE_LOOP ? "line_loop" :
                                                                 primType == PrimitiveRestartCase::PRIMITIVE_LINES ? "lines" :
                                                                 primType == PrimitiveRestartCase::PRIMITIVE_TRIANGLE_STRIP ? "triangle_strip" :
                                                                 primType == PrimitiveRestartCase::PRIMITIVE_TRIANGLE_FAN ? "triangle_fan" :
                                                                 primType == PrimitiveRestartCase::PRIMITIVE_TRIANGLES ? "triangles" :
                                                                 null;

                        DE_ASSERT(primTypeName != null);

                        /** @type {TestCaseGroup} */ var primTypeGroup = new TestCaseGroup(m_context, primTypeName, "");
                        specialCaseGroup.addChild(primTypeGroup);

                        for (var indexType = 0; indexType < IndexType.INDEX_LAST; indexType++)
                        {
                            /** @type {string} */ var indexTypeName = indexType == IndexType.INDEX_UNSIGNED_BYTE ? "unsigned_byte" :
                                                                      indexType == IndexType.INDEX_UNSIGNED_SHORT ? "unsigned_short" :
                                                                      indexType == IndexType.INDEX_UNSIGNED_INT ? "unsigned_int" :
                                                                      null;

                            DE_ASSERT(indexTypeName != null);

                            /** @type {TestCaseGroup} */ var indexTypeGroup = new TestCaseGroup(m_context, indexTypeName, "");
                            primTypeGroup.addChild(indexTypeGroup);

                            for (var _function = 0; _function < IndexType.FUNCTION_LAST; _function++)
                            {
                                /** @type {string} */ var functionName = _function == IndexType.FUNCTION_DRAW_ELEMENTS ? "draw_elements" :
                                                                         _function == IndexType.FUNCTION_DRAW_ELEMENTS_INSTANCED ? "draw_elements_instanced" :
                                                                         _function == IndexType.FUNCTION_DRAW_RANGE_ELEMENTS ? "draw_range_elements" :
                                                                         null;

                                DE_ASSERT(functionName != null);

                                indexTypeGroup.addChild(new PrimitiveRestartCase(functionName,
                                                                                 "",
                                                                                 primType,
                                                                                 indexType,
                                                                                 _function,
                                                                                 isRestartBeginCase,
                                                                                 isRestartEndCase,
                                                                                 isDuplicateRestartCase));
                            }
                        }
                    }
                }
            }
        }
    };

    var run = function() {
        gl = context;
        //Set up Test Root parameters
        var testName = 'primitive_restart';
        var testDescription = 'Primitive Restart Tests';
        var state = tcuTestCase.runner.getState();

        state.testName = testName;
        state.testCases = tcuTestCase.newTest(testName, testDescription, null);

        //Set up name and description of this test series.
        setCurrentTestName(testName);
        description(testDescription);

        try {
            //Create test cases
            init();
            //Run test cases
            tcuTestCase.runTestCases();
        }
        catch (err) {
            testFailedOptions('Failed to run tests', false);
            tcuTestCase.runner.terminate();
        }
    };


    return {
        run: run
    };
});
