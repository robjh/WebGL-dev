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
    'framework/opengl/gluShaderProgram',
    'framework/common/tcuSurface',
    'framework/delibs/debase/deMath',
    'framework/delibs/debase/deRandom',
    'framework/delibs/debase/deString',
    'framework/common/tcuImageCompare',
    'framework/opengl/gluTextureUtil'], function(
        tcuTestCase,
        gluShaderProgram,
        tcuSurface,
        deMath,
        deRandom,
        deString,
        tcuImageCompare,
        gluTextureUtil) {
    'use strict';
    /** @type {WebGL2RenderingContext} */ var gl;
    /** @const @type {number} */ var MAX_RENDER_WIDTH = 256;
    /** @const @type {number} */ var MAX_RENDER_HEIGHT = 256;

    /** @const @type {number} */ var MAX_UNSIGNED_BYTE = 255;
    /** @const @type {number} */ var MAX_UNSIGNED_SHORT = 65535;
    /** @const @type {number} */ var MAX_UNSIGNED_INT = 4294967295;

    /** @const @type {number} */ var RESTART_INDEX_UNSIGNED_BYTE = MAX_UNSIGNED_BYTE;
    /** @const @type {number} */ var RESTART_INDEX_UNSIGNED_SHORT = MAX_UNSIGNED_SHORT;
    /** @const @type {number} */ var RESTART_INDEX_UNSIGNED_INT = MAX_UNSIGNED_INT;

    var DE_ASSERT = function(expression) {
        if (!expression) throw new Error('Assert failed');
    };

    var GLU_CHECK_MSG = function(message) {
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
     * @enum DrawFunction
     */
    var DrawFunction = {
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
    * @param {DrawFunction} function
    * @param {boolean} beginWithRestart
    * @param {boolean} endWithRestart
    * @param {boolean} duplicateRestarts
    */
    var PrimitiveRestartCase = function(name, description, primType, indexType, _function, beginWithRestart, endWithRestart, duplicateRestarts) {
        tcuTestCase.DeqpTest.call(this, name, description);
        /** @type {PrimitiveType} */ this.m_primType = primType;
        /** @type {IndexType} */ this.m_indexType = indexType;
        /** @type {DrawFunction} */ this.m_function = _function;
        /** @type {boolean} */ this.m_beginWithRestart = beginWithRestart; // Whether there will be restart indices at the beginning of the index array.
        /** @type {boolean} */ this.m_endWithRestart = endWithRestart; // Whether there will be restart indices at the end of the index array.
        /** @type {boolean} */ this.m_duplicateRestarts = duplicateRestarts; // Whether two consecutive restarts are used instead of one.
        /** @type {ShaderProgram} */ this.m_program = null;

        // \note Only one of the following index vectors is used (according to m_indexType).
        /** @type {Array<number>} */ this.m_indicesUB = []; //deUint8
        /** @type {Array<number>} */ this.m_indicesUS = []; //deUint16
        /** @type {Array<number>} */ this.m_indicesUI = []; //deUint32

        /** @type {Array<number>} */ this.m_positions = [];
    };

    PrimitiveRestartCase.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    PrimitiveRestartCase.prototype.constructor = PrimitiveRestartCase;

    /**
    * Draw with the appropriate GLES3 draw function.
    * @param {number} startNdx
    * @param {number} count
    */
    PrimitiveRestartCase.prototype.draw = function(startNdx, count) {
        /** @type {PrimitiveType} */ var primTypeGL;

        switch (this.m_primType) {
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
                DE_ASSERT(false);
                primTypeGL = 0;
        }

        /** @type {IndexType} */ var indexTypeGL;

        switch (this.m_indexType) {
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
                DE_ASSERT(false);
                indexTypeGL = 0;
        }

        /** @type {number} */ var restartIndex = this.m_indexType == IndexType.INDEX_UNSIGNED_BYTE ? RESTART_INDEX_UNSIGNED_BYTE :
                                                   this.m_indexType == IndexType.INDEX_UNSIGNED_SHORT ? RESTART_INDEX_UNSIGNED_SHORT :
                                                   this.m_indexType == IndexType.INDEX_UNSIGNED_INT ? RESTART_INDEX_UNSIGNED_INT :
                                                   0;

        DE_ASSERT(restartIndex != 0);

        var indexGLBuffer = gl.createBuffer();
        var bufferIndex = this.getIndexPtr(startNdx);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexGLBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, bufferIndex, gl.STATIC_DRAW);

        if (this.m_function == DrawFunction.FUNCTION_DRAW_ELEMENTS) {
            gl.drawElements(primTypeGL, count - 1, indexTypeGL, 0);
        }
        else if (this.m_function == DrawFunction.FUNCTION_DRAW_ELEMENTS_INSTANCED) {
            gl.drawElementsInstanced(primTypeGL, count, indexTypeGL, 0, 1);
        }

        else {
            DE_ASSERT(this.m_function == DrawFunction.FUNCTION_DRAW_RANGE_ELEMENTS);

            // Find the largest non-restart index in the index array (for glDrawRangeElements() end parameter).

            /** @type {number} */ var max = 0;

            /** @type {number} */ var numIndices = this.getNumIndices();
            for (var i = 0; i < numIndices; i++) {
                /** @type {number} */ var index = this.getIndex(i);
                if (index != restartIndex && index > max)
                    max = index;
            }
            //TODO: drawRangeElements -> check getIndexPtr usage
            gl.drawRangeElements(primTypeGL, 0, max, count, indexTypeGL, 0);
        }
    };

    PrimitiveRestartCase.prototype.renderWithRestart = function() {
        GLU_CHECK_MSG('renderWithRestart() begin');

        // Primitive Restart is always on in WebGL2
        //gl.enable(gl.PRIMITIVE_RESTART_FIXED_INDEX);
        //GLU_CHECK_MSG('Enable primitive restart');

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
        GLU_CHECK_MSG('Clear in renderWithRestart()');

        this.draw(0, this.getNumIndices());
        GLU_CHECK_MSG('Draw in renderWithRestart()');

        GLU_CHECK_MSG('renderWithRestart() end');
    };

    PrimitiveRestartCase.prototype.renderWithoutRestart = function() {
        GLU_CHECK_MSG('renderWithoutRestart() begin');

        /** @type {number} */ var restartIndex = this.m_indexType == IndexType.INDEX_UNSIGNED_BYTE ? RESTART_INDEX_UNSIGNED_BYTE :
                                                 this.m_indexType == IndexType.INDEX_UNSIGNED_SHORT ? RESTART_INDEX_UNSIGNED_SHORT :
                                                 this.m_indexType == IndexType.INDEX_UNSIGNED_INT ? RESTART_INDEX_UNSIGNED_INT :
                                                 0;

        DE_ASSERT(restartIndex != 0);
        // Primitive Restart is always on in WebGL2
        //gl.disable(gl.PRIMITIVE_RESTART_FIXED_INDEX);
        //GLU_CHECK_MSG('Disable primitive restart');

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
        GLU_CHECK_MSG('Clear in renderWithoutRestart()');

        // Draw, emulating primitive restart.

        /** @type {number} */ var numIndices = this.getNumIndices();

        DE_ASSERT(numIndices >= 0);

        /** @type {number} */ var indexArrayStartNdx = 0; // Keep track of the draw start index - first index after a primitive restart, or initially the first index altogether.

        for (var indexArrayNdx = 0; indexArrayNdx <= numIndices; indexArrayNdx++) { // \note Goes one "too far" in order to detect end of array as well.
            if (indexArrayNdx >= numIndices || this.getIndex(indexArrayNdx) == restartIndex) {// \note Handle end of array the same way as a restart index encounter.
                if (indexArrayStartNdx < numIndices) {
                    // Draw from index indexArrayStartNdx to index indexArrayNdx-1 .

                    this.draw(indexArrayStartNdx, indexArrayNdx - indexArrayStartNdx);
                    GLU_CHECK_MSG('Draw in renderWithoutRestart()');
                }

                indexArrayStartNdx = indexArrayNdx + 1; // Next draw starts just after this restart index.
            }
        }

        GLU_CHECK_MSG('renderWithoutRestart() end');
    };

    /**
    * @param {number} index
    */
    PrimitiveRestartCase.prototype.addIndex = function(index) {
        if (this.m_indexType == IndexType.INDEX_UNSIGNED_BYTE) {
            DE_ASSERT(deMath.deInRange32(index, 0, MAX_UNSIGNED_BYTE));
            this.m_indicesUB.push(index); // deUint8
        }
        else if (this.m_indexType == IndexType.INDEX_UNSIGNED_SHORT) {
            DE_ASSERT(deMath.deInRange32(index, 0, MAX_UNSIGNED_SHORT));
            this.m_indicesUS.push(index); // deUint16
        }
        else if (this.m_indexType == IndexType.INDEX_UNSIGNED_INT) {
            DE_ASSERT(deMath.deInRange32(index, 0, MAX_UNSIGNED_INT));
            this.m_indicesUI.push(index); // // deUint32
        }
        else
            DE_ASSERT(false);
    };

    /**
    * @param {number} indexNdx
    * @return {number}
    */
    PrimitiveRestartCase.prototype.getIndex = function(indexNdx) {
        switch (this.m_indexType) {
            case IndexType.INDEX_UNSIGNED_BYTE:
                return this.m_indicesUB[indexNdx]; //deUint32
            case IndexType.INDEX_UNSIGNED_SHORT:
                return this.m_indicesUS[indexNdx]; //deUint32
            case IndexType.INDEX_UNSIGNED_INT:
                return this.m_indicesUI[indexNdx];
            default:
                DE_ASSERT(false);
                return 0;
        }
    };

    /**
    * @return {number}
    */
    PrimitiveRestartCase.prototype.getNumIndices = function() {
        switch (this.m_indexType) {
            case IndexType.INDEX_UNSIGNED_BYTE:
                return this.m_indicesUB.length;
            case IndexType.INDEX_UNSIGNED_SHORT:
                return this.m_indicesUS.length;
            case IndexType.INDEX_UNSIGNED_INT:
                return this.m_indicesUI.length;
            default:
                DE_ASSERT(false);
                return 0;
        }
    };

    /**
    * Pointer to the index value at index indexNdx.
    * @param {number} indexNdx
    * @return {Uint8Array|Uint16Array|Uint32}
    */
    PrimitiveRestartCase.prototype.getIndexPtr = function(indexNdx) {
        //TODO: implement
        switch (this.m_indexType) {
            case IndexType.INDEX_UNSIGNED_BYTE:
                return new Uint8Array(this.m_indicesUB).subarray(indexNdx);
            case IndexType.INDEX_UNSIGNED_SHORT:
                return new Uint16Array(this.m_indicesUS).subarray(indexNdx);
            case IndexType.INDEX_UNSIGNED_INT:
                return new Uint32Array(this.m_indicesUI).subarray(indexNdx);
            default:
                DE_ASSERT(false);
                return null;
        }
    };

    PrimitiveRestartCase.prototype.init = function() {
        // Clear errors from previous tests
        gl.getError();

        // Create shader program.

        /** @type {string} */ var vertShaderSource =
            '#version 300 es\n' +
            'in highp vec4 a_position;\n' +
            '\n' +
            'void main()\n' +
            '{\n' +
            '	gl_Position = a_position;\n' +
            '}\n';

            /** @type {string} */ var fragShaderSource =
            '#version 300 es\n' +
            'layout(location = 0) out mediump vec4 o_color;\n' +
            '\n' +
            'void main()\n' +
            '{\n' +
            '	o_color = vec4(1.0f);\n' +
            '}\n';

        DE_ASSERT(!this.m_program);

        this.m_program = new gluShaderProgram.ShaderProgram(gl, gluShaderProgram.makeVtxFragSources(vertShaderSource, fragShaderSource));

        if (!this.m_program.isOk()) {
            //m_testCtx.getLog() << *this.m_program;
            TCU_FAIL('Failed to compile shader');
        }

        /** @type {number} */ var restartIndex = this.m_indexType == IndexType.INDEX_UNSIGNED_BYTE ? RESTART_INDEX_UNSIGNED_BYTE :
                                                 this.m_indexType == IndexType.INDEX_UNSIGNED_SHORT ? RESTART_INDEX_UNSIGNED_SHORT :
                                                 this.m_indexType == IndexType.INDEX_UNSIGNED_INT ? RESTART_INDEX_UNSIGNED_INT :
                                                 0;

        DE_ASSERT(restartIndex != 0);

        DE_ASSERT(this.getNumIndices() == 0);

        // If testing a case with restart at beginning, add it there.
        if (this.m_beginWithRestart) {
            this.addIndex(restartIndex);
            if (this.m_duplicateRestarts)
                this.addIndex(restartIndex);
        }

        // Generate vertex positions and indices depending on primitive type.
        // \note At this point, restarts shall not be added to the start or the end of the index vector. Those are special cases, and are done above and after the following if-else chain, respectively.
        /** @type {number} */ var curIndex;
        /** @type {number} */ var numRows;
        /** @type {number} */ var numCols;
        /** @type {number} */ var fx;
        /** @type {number} */ var fy;
        /** @type {number} */ var centerY;
        /** @type {number} */ var centerX;
        /** @type {number} */ var numVertices;
        /** @type {number} */ var numArcVertices;
        /** @type {number} */ var numStrips;

        if (this.m_primType == PrimitiveType.PRIMITIVE_POINTS) {
            // Generate rows with different numbers of points.

            curIndex = 0;
            numRows = 20;

            for (var row = 0; row < numRows; row++) {
                for (var col = 0; col < row + 1; col++) {
                    fx = -1.0 + 2.0 * (col + 0.5) / numRows;
                    fy = -1.0 + 2.0 * (row + 0.5) / numRows;

                    this.m_positions.push(fx);
                    this.m_positions.push(fy);

                    this.addIndex(curIndex++);
                }

                if (row < numRows - 1) { // Add a restart after all but last row.
                    this.addIndex(restartIndex);
                    if (this.m_duplicateRestarts)
                        this.addIndex(restartIndex);
                }
            }
        }
        else if (this.m_primType == PrimitiveType.PRIMITIVE_LINE_STRIP || this.m_primType == PrimitiveType.PRIMITIVE_LINE_LOOP || this.m_primType == PrimitiveType.PRIMITIVE_LINES) {
            // Generate a numRows x numCols arrangement of line polygons of different vertex counts.

            curIndex = 0;
            numRows = 4;
            numCols = 4;

            for (var row = 0; row < numRows; row++) {
                centerY = -1.0 + 2.0 * (row + 0.5) / numRows;

                for (var col = 0; col < numCols; col++) {
                    centerX = -1.0 + 2.0 * (col + 0.5) / numCols;
                    numVertices = row * numCols + col + 1;

                    for (var i = 0; i < numVertices; i++) {
                        fx = centerX + 0.9 * Math.cos(i * 2.0 * Math.PI / numVertices) / numCols;
                        fy = centerY + 0.9 * Math.sin(i * 2.0 * Math.PI / numVertices) / numRows;

                        this.m_positions.push(fx);
                        this.m_positions.push(fy);

                        this.addIndex(curIndex++);
                    }

                    if (col < numCols - 1 || row < numRows - 1) {// Add a restart after all but last polygon.
                        this.addIndex(restartIndex);
                        if (this.m_duplicateRestarts)
                            this.addIndex(restartIndex);
                    }
                }
            }
        }
        else if (this.m_primType == PrimitiveType.PRIMITIVE_TRIANGLE_STRIP) {
            // Generate a number of horizontal triangle strips of different lengths.

            curIndex = 0;
            numStrips = 20;

            for (var stripNdx = 0; stripNdx < numStrips; stripNdx++) {
                numVertices = stripNdx + 1;

                for (var i = 0; i < numVertices; i++) {
                    fx = -0.9 + 1.8 * (i / 2 * 2) / numStrips;
                    fy = -0.9 + 1.8 * (stripNdx + (i % 2 == 0 ? 0.0 : 0.8)) / numStrips;

                    this.m_positions.push(fx);
                    this.m_positions.push(fy);

                    this.addIndex(curIndex++);
                }

                if (stripNdx < numStrips - 1) { // Add a restart after all but last strip.
                    this.addIndex(restartIndex);
                    if (this.m_duplicateRestarts)
                        this.addIndex(restartIndex);
                }
            }
        }
        else if (this.m_primType == PrimitiveType.PRIMITIVE_TRIANGLE_FAN)
        {
            // Generate a numRows x numCols arrangement of triangle fan polygons of different vertex counts.

            curIndex = 0;
            numRows = 4;
            numCols = 4;

            for (var row = 0; row < numRows; row++) {
                centerY = -1.0 + 2.0 * (row + 0.5) / numRows;

                for (var col = 0; col < numCols; col++) {
                    centerX = -1.0 + 2.0 * (col + 0.5) / numCols;
                    numArcVertices = row * numCols + col;

                    this.m_positions.push(centerX);
                    this.m_positions.push(centerY);

                    this.addIndex(curIndex++);

                    for (var i = 0; i < numArcVertices; i++) {
                        fx = centerX + 0.9 * Math.cos(i * 2.0 * Math.PI / numArcVertices) / numCols;
                        fy = centerY + 0.9 * Math.sin(i * 2.0 * Math.PI / numArcVertices) / numRows;

                        this.m_positions.push(fx);
                        this.m_positions.push(fy);

                        this.addIndex(curIndex++);
                    }

                    if (col < numCols - 1 || row < numRows - 1) { // Add a restart after all but last polygon.
                        this.addIndex(restartIndex);
                        if (this.m_duplicateRestarts)
                            this.addIndex(restartIndex);
                    }
                }
            }
        }
        else if (this.m_primType == PrimitiveType.PRIMITIVE_TRIANGLES) {
            // Generate a number of rows with (potentially incomplete) triangles.

            curIndex = 0;
            numRows = 3 * 7;

            for (var rowNdx = 0; rowNdx < numRows; rowNdx++) {
                numVertices = rowNdx + 1;

                for (var i = 0; i < numVertices; i++) {
                    fx = -0.9 + 1.8 * ((i / 3) + (i % 3 == 2 ? 0.8 : 0.0)) * 3 / numRows;
                    fy = -0.9 + 1.8 * (rowNdx + (i % 3 == 0 ? 0.0 : 0.8)) / numRows;

                    this.m_positions.push(fx);
                    this.m_positions.push(fy);

                    this.addIndex(curIndex++);
                }

                if (rowNdx < numRows - 1) { // Add a restart after all but last row.
                    this.addIndex(restartIndex);
                    if (this.m_duplicateRestarts)
                        this.addIndex(restartIndex);
                }
            }
        }
        else
            DE_ASSERT(false);

        // If testing a case with restart at end, add it there.
        if (this.m_endWithRestart) {
            this.addIndex(restartIndex);
            if (this.m_duplicateRestarts)
                this.addIndex(restartIndex);
        }

        // Special case assertions.

        /** @type {number} */ var numIndices = this.getNumIndices();

        DE_ASSERT(numIndices > 0);
        DE_ASSERT(this.m_beginWithRestart || this.getIndex(0) != restartIndex); // We don't want restarts at beginning unless the case is a special case.
        DE_ASSERT(this.m_endWithRestart || this.getIndex(numIndices - 1) != restartIndex); // We don't want restarts at end unless the case is a special case.

        if (!this.m_duplicateRestarts)
            for (var i = 1; i < numIndices; i++)
                DE_ASSERT(this.getIndex(i) != restartIndex || this.getIndex(i - 1) != restartIndex); // We don't want duplicate restarts unless the case is a special case.

    };

    PrimitiveRestartCase.prototype.iterate = function() {
        /** @type {number} */ var width = Math.min(gl.drawingBufferWidth, MAX_RENDER_WIDTH);
        /** @type {number} */ var height = Math.min(gl.drawingBufferHeight, MAX_RENDER_HEIGHT);

        /** @type {number} */ var xOffsetMax = gl.drawingBufferWidth - width;
        /** @type {number} */ var yOffsetMax = gl.drawingBufferHeight - height;

        /** @type {deRandom.Random} */ var rnd = new deRandom.Random(deString.deStringHash(this.name));

        /** @type {number} */ var xOffset = rnd.getInt(0, xOffsetMax);
        /** @type {number} */ var yOffset = rnd.getInt(0, yOffsetMax);
        /** @type {tcuSurface.Surface} */ var referenceImg = new tcuSurface.Surface(width, height);
        /** @type {tcuSurface.Surface} */ var resultImg = new tcuSurface.Surface(width, height);

        gl.viewport(xOffset, yOffset, width, height);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);

        /** @type {number} */ var program = this.m_program.getProgram();
        gl.useProgram(program);

        // Setup position attribute.

        /** @type {number} */ var loc = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(loc);

        var locGlBuffer = gl.createBuffer();
        var bufferLoc = new Float32Array(this.m_positions);
        gl.bindBuffer(gl.ARRAY_BUFFER, locGlBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, bufferLoc, gl.STATIC_DRAW);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

        // Render result.
        this.renderWithRestart();
        var resImg = resultImg.getAccess();
        var resImgTransferFormat = gluTextureUtil.getTransferFormat(resImg.getFormat());
        gl.readPixels(xOffset, yOffset, resImg.m_width, resImg.m_height, resImgTransferFormat.format, resImgTransferFormat.dataType, resultImg.m_pixels);

        // Render reference (same scene as the real deal, but emulate primitive restart without actually using it).
        this.renderWithoutRestart();

        var refImg = referenceImg.getAccess();
        var refImgTransferFormat = gluTextureUtil.getTransferFormat(refImg.getFormat());

        gl.readPixels(xOffset, yOffset, refImg.m_width, refImg.m_height, refImgTransferFormat.format, refImgTransferFormat.dataType, referenceImg.m_pixels);

        // Compare.
        /** @type {boolean} */ var testOk = tcuImageCompare.pixelThresholdCompare('ComparisonResult', 'Image comparison result', referenceImg, resultImg, [0, 0, 0, 0], /*COMPARE_LOG_RESULT*/ null);

        assertMsgOptions(testOk, '', true, false);
        gl.useProgram(null);

        return tcuTestCase.runner.IterateResult.STOP;
    };


    var init = function() {
        var testGroup = tcuTestCase.runner.getState().testCases;
        for (var isRestartBeginCaseI = 0; isRestartBeginCaseI <= 1; isRestartBeginCaseI++) {
            for (var isRestartEndCaseI = 0; isRestartEndCaseI <= 1; isRestartEndCaseI++) {
                for (var isDuplicateRestartCaseI = 0; isDuplicateRestartCaseI <= 1; isDuplicateRestartCaseI++) {
                    /** @type {boolean} */ var isRestartBeginCase = isRestartBeginCaseI != 0;
                    /** @type {boolean} */ var isRestartEndCase = isRestartEndCaseI != 0;
                    /** @type {boolean} */ var isDuplicateRestartCase = isDuplicateRestartCaseI != 0;

                    /** @type {string} */ var specialCaseGroupName = '';

                    if (isRestartBeginCase) specialCaseGroupName = 'begin_restart';
                    if (isRestartEndCase) specialCaseGroupName += (deString.deIsStringEmpty(specialCaseGroupName) ? '' : '_') + 'end_restart';
                    if (isDuplicateRestartCase) specialCaseGroupName += (deString.deIsStringEmpty(specialCaseGroupName) ? '' : '_') + 'duplicate_restarts';

                    if (deString.deIsStringEmpty(specialCaseGroupName))
                        specialCaseGroupName = 'basic';

                    /** @type {TestCaseGroup} */ var specialCaseGroup = new tcuTestCase.newTest(specialCaseGroupName, '');
                    testGroup.addChild(specialCaseGroup);

                    for (var primType in PrimitiveType) {
                        /** @type {string} */ var primTypeName = PrimitiveType[primType] == PrimitiveType.PRIMITIVE_POINTS ? 'points' :
                                                                 PrimitiveType[primType] == PrimitiveType.PRIMITIVE_LINE_STRIP ? 'line_strip' :
                                                                 PrimitiveType[primType] == PrimitiveType.PRIMITIVE_LINE_LOOP ? 'line_loop' :
                                                                 PrimitiveType[primType] == PrimitiveType.PRIMITIVE_LINES ? 'lines' :
                                                                 PrimitiveType[primType] == PrimitiveType.PRIMITIVE_TRIANGLE_STRIP ? 'triangle_strip' :
                                                                 PrimitiveType[primType] == PrimitiveType.PRIMITIVE_TRIANGLE_FAN ? 'triangle_fan' :
                                                                 PrimitiveType[primType] == PrimitiveType.PRIMITIVE_TRIANGLES ? 'triangles' :
                                                                 null;

                        DE_ASSERT(primTypeName != null);

                        /** @type {TestCaseGroup} */ var primTypeGroup = new tcuTestCase.newTest(PrimitiveType[primType], '');
                        specialCaseGroup.addChild(primTypeGroup);

                        for (var indexType in IndexType) {
                            /** @type {string} */ var indexTypeName = IndexType[indexType] == IndexType.INDEX_UNSIGNED_BYTE ? 'unsigned_byte' :
                                                                      IndexType[indexType] == IndexType.INDEX_UNSIGNED_SHORT ? 'unsigned_short' :
                                                                      IndexType[indexType] == IndexType.INDEX_UNSIGNED_INT ? 'unsigned_int' :
                                                                      null;

                            DE_ASSERT(indexTypeName != null);

                            /** @type {TestCaseGroup} */ var indexTypeGroup = new tcuTestCase.newTest(indexTypeName, '');
                            primTypeGroup.addChild(indexTypeGroup);

                            for (var _function in DrawFunction) {
                                /** @type {string} */ var functionName = DrawFunction[_function] == DrawFunction.FUNCTION_DRAW_ELEMENTS ? 'draw_elements' :
                                                                         DrawFunction[_function] == DrawFunction.FUNCTION_DRAW_ELEMENTS_INSTANCED ? 'draw_elements_instanced' :
                                                                         DrawFunction[_function] == DrawFunction.FUNCTION_DRAW_RANGE_ELEMENTS ? 'draw_range_elements' :
                                                                         null;

                                DE_ASSERT(functionName != null);

                                indexTypeGroup.addChild(new PrimitiveRestartCase(functionName,
                                                                                 '',
                                                                                 PrimitiveType[primType],
                                                                                 IndexType[indexType],
                                                                                 DrawFunction[_function],
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

    var run = function(context) {
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