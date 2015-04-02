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
        //TODO: implement
    };

    PrimitiveRestartCase.prototype.renderWithoutRestart = function() {
        //TODO: implement
    };

    /**
    * Draw with the appropriate GLES3 draw function.
    * @param {deUint32} index
    */
    PrimitiveRestartCase.prototype.addIndex = function(index) {
        //TODO: implement
    };

    /**
    * @param {number} indexNdx
    */
    PrimitiveRestartCase.prototype.getIndex = function(indexNdx) {
        //TODO: implement
    };

    PrimitiveRestartCase.prototype.getNumIndices = function() {
        //TODO: implement
    };

    /**
    * Pointer to the index value at index indexNdx.
    * @param {number} indexNdx
    */
    PrimitiveRestartCase.prototype.getIndexPtr = function(indexNdx) {
        //TODO: implement
    };

    PrimitiveRestartCase.prototype.init = function() {
        //TODO: implement
    };

    PrimitiveRestartCase.prototype.iterate = function() {
        //TODO: implement
    };


    var init = function() {
        //TODO: implement
    };

    var run = function() {
        //TODO: implement
    };


    return {
        run: run
    };
});
