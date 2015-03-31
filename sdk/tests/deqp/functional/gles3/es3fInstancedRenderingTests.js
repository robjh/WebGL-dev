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
    'framework/opengl/gluShaderUtil',
    'framework/opengl/gluShaderProgram',
    'framework/common/tcuTestCase',
    'framework/common/tcuSurface',
    'framework/delibs/debase/deString',
    'framework/delibs/debase/deRandom',
    'framework/common/tcuImageCompare',
    'framework/opengl/gluTextureUtil'], function(
        gluShaderUtil,
        gluShaderProgram,
        tcuTestCase,
        tcuSurface,
        deString,
        deRandom,
        tcuImageCompare,
        gluTextureUtil) {
    'use strict';

    /** @const @type {number} */ var MAX_RENDER_WIDTH = 128;
    /** @const @type {number} */ var MAX_RENDER_HEIGHT = 128;

    /** @const @type {number} */ var QUAD_GRID_SIZE = 127;

    // Attribute divisors for the attributes defining the color's RGB components.
    /** @const @type {number} */var ATTRIB_DIVISOR_R = 3;
    /** @const @type {number} */var ATTRIB_DIVISOR_G = 2;
    /** @const @type {number} */var ATTRIB_DIVISOR_B = 1;

    /** @const @type {number} */var OFFSET_COMPONENTS = 3; // \note Affects whether a float or a vecN is used in shader, but only first component is non-zero.

    // Scale and bias values when converting float to integer, when attribute is of integer type.
    /** @const @type {number} */var FLOAT_INT_SCALE = 100.0;
    /** @const @type {number} */var FLOAT_INT_BIAS = -50.0;
    /** @const @type {number} */var FLOAT_UINT_SCALE = 100.0;
    /** @const @type {number} */var FLOAT_UINT_BIAS = 0.0;

    var DE_ASSERT = function(expression)
    {
        if (!expression) throw new Error('Assert failed');
    };

    var DE_STATIC_ASSERT = function(expression)
    {
        if (!expression) throw new Error('Assert failed');
    };

    var TCU_FAIL = function(message) {
        throw new Error(message);
    };

    // InstancedRenderingCase

    /**
     * @enum DrawFunction
     */
    var DrawFunction = {
            FUNCTION_DRAW_ARRAYS_INSTANCED: 0,
            FUNCTION_DRAW_ELEMENTS_INSTANCED: 1
    };

    /**
     * @enum InstancingType
     */
    var InstancingType = {
            TYPE_INSTANCE_ID: 0,
            TYPE_ATTRIB_DIVISOR: 1,
            TYPE_MIXED: 2
    };


    /**
    * InstancedRenderingCase class, inherits from TestCase class
    * @constructor
    * @param {string} name
    * @param {string} description
    * @param {DrawFunction} function
    * @param {InstancingType} instancingType
    * @param {gluShaderUtil.DataType} rgbAttrType
    * @param {number} numInstances
    */
    var InstancedRenderingCase = function(name, description, _function, instancingType, rgbAttrType, numInstances)
    {
        tcuTestCase.DeqpTest.call(this, name, description);
        /** @type {DrawFunction} */ this.m_function = _function;
        /** @type {InstancingType} */ this.m_instancingType = instancingType;
        /** @type {glu.DataType} */ this.m_rgbAttrType = rgbAttrType;
        /** @type {number} */ this.m_numInstances = numInstances;
        /** @type {glu.ShaderProgram} */ this.m_program = null;
        /** @type {Array.<number>} */ this.m_gridVertexPositions = [];
        /** @type {Array.<number>} */ this.m_gridIndices = [];
        /** @type {Array.<number>} */ this.m_instanceOffsets = [];
        /** @type {Array.<number>} */ this.m_instanceColorR = [];
        /** @type {Array.<number>} */ this.m_instanceColorG = [];
        /** @type {Array.<number>} */ this.m_instanceColorB = [];
    };

    InstancedRenderingCase.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    InstancedRenderingCase.prototype.constructor = InstancedRenderingCase;

    /**
    * Helper function that does biasing and scaling when converting float to integer.
    * @param {Array.<number>} vec
    * @param {number} val
    */
    InstancedRenderingCase.prototype.pushVarCompAttrib = function(vec, val)
    {
        vec.push(val);
    };

    InstancedRenderingCase.prototype.init = function() {
        /** @type {boolean} */ var isFloatCase = gluShaderUtil.isDataTypeFloatOrVec(this.m_rgbAttrType);
        /** @type {boolean} */ var isIntCase = gluShaderUtil.isDataTypeIntOrIVec(this.m_rgbAttrType);
        /** @type {boolean} */ var isUintCase = gluShaderUtil.isDataTypeUintOrUVec(this.m_rgbAttrType);
        /** @type {boolean} */ var isMatCase = gluShaderUtil.isDataTypeMatrix(this.m_rgbAttrType);
        /** @type {number} */ var typeSize = gluShaderUtil.getDataTypeScalarSize(this.m_rgbAttrType);
        /** @type {boolean} */ var isScalarCase = typeSize == 1;
        /** @type {string} */ var swizzleFirst = isScalarCase ? '' : '.x';
        /** @type {string} */ var typeName = gluShaderUtil.getDataTypeName(this.m_rgbAttrType);

        /** @type {string} */ var floatIntScaleStr = '(' + FLOAT_INT_SCALE.toFixed(3) + ')';
        /** @type {string} */ var floatIntBiasStr = '(' + FLOAT_INT_BIAS.toFixed(3) + ')';
        /** @type {string} */ var floatUintScaleStr = '(' + FLOAT_UINT_SCALE.toFixed(3) + ')';
        /** @type {string} */ var floatUintBiasStr = '(' + FLOAT_UINT_BIAS.toFixed(3) + ')';

        DE_ASSERT(isFloatCase || isIntCase || isUintCase || isMatCase);

        // Generate shader.
        // \note For case TYPE_MIXED, vertex position offset and color red component get their values from instance id, while green and blue get their values from instanced attributes.

        /** @type {string} */ var numInstancesStr = this.m_numInstances.toString() + '.0';

        /** @type {string} */ var instanceAttribs = '';
        /** @type {string} */ var posExpression = '';
        /** @type {string} */ var colorRExpression = '';
        /** @type {string} */ var colorGExpression = '';
        /** @type {string} */ var colorBExpression = '';

        if (this.m_instancingType == InstancingType.TYPE_INSTANCE_ID || this.m_instancingType == InstancingType.TYPE_MIXED)
        {
            posExpression = 'a_position + vec4(float(gl_InstanceID) * 2.0 / ' + numInstancesStr + ', 0.0, 0.0, 0.0)';
            colorRExpression = 'float(gl_InstanceID)/' + numInstancesStr;

            if (this.m_instancingType == InstancingType.TYPE_INSTANCE_ID)
            {
                colorGExpression = 'float(gl_InstanceID)*2.0/' + numInstancesStr;
                colorBExpression = '1.0 - float(gl_InstanceID)/' + numInstancesStr;
            }
        }

        if (this.m_instancingType == InstancingType.TYPE_ATTRIB_DIVISOR || this.m_instancingType == InstancingType.TYPE_MIXED)
        {
            if (this.m_instancingType == InstancingType.TYPE_ATTRIB_DIVISOR)
            {
                posExpression = 'a_position + vec4(a_instanceOffset';

                DE_STATIC_ASSERT(OFFSET_COMPONENTS >= 1 && OFFSET_COMPONENTS <= 4);

                for (var i = 0; i < 4 - OFFSET_COMPONENTS; i++)
                    posExpression += ', 0.0';
                posExpression += ')';

                if (isFloatCase)
                    colorRExpression = 'a_instanceR' + swizzleFirst;
                else if (isIntCase)
                    colorRExpression = '(float(a_instanceR' + swizzleFirst + ') - ' + floatIntBiasStr + ') / ' + floatIntScaleStr;
                else if (isUintCase)
                    colorRExpression = '(float(a_instanceR' + swizzleFirst + ') - ' + floatUintBiasStr + ') / ' + floatUintScaleStr;
                else if (isMatCase)
                    colorRExpression = 'a_instanceR[0][0]';
                else
                    DE_ASSERT(false);

                instanceAttribs += 'in highp ' + (OFFSET_COMPONENTS == 1 ? 'float' : 'vec' + OFFSET_COMPONENTS.toString()) + ' a_instanceOffset;\n';
                instanceAttribs += 'in mediump ' + typeName + ' a_instanceR;\n';
            }

            if (isFloatCase)
            {
                colorGExpression = 'a_instanceG' + swizzleFirst;
                colorBExpression = 'a_instanceB' + swizzleFirst;
            }
            else if (isIntCase)
            {
                colorGExpression = '(float(a_instanceG' + swizzleFirst + ') - ' + floatIntBiasStr + ') / ' + floatIntScaleStr;
                colorBExpression = '(float(a_instanceB' + swizzleFirst + ') - ' + floatIntBiasStr + ') / ' + floatIntScaleStr;
            }
            else if (isUintCase)
            {
                colorGExpression = '(float(a_instanceG' + swizzleFirst + ') - ' + floatUintBiasStr + ') / ' + floatUintScaleStr;
                colorBExpression = '(float(a_instanceB' + swizzleFirst + ') - ' + floatUintBiasStr + ') / ' + floatUintScaleStr;
            }
            else if (isMatCase)
            {
                colorGExpression = 'a_instanceG[0][0]';
                colorBExpression = 'a_instanceB[0][0]';
            }
            else
                DE_ASSERT(false);

            instanceAttribs += 'in mediump ' + typeName + ' a_instanceG;\n';
            instanceAttribs += 'in mediump ' + typeName + ' a_instanceB;\n';
        }

        DE_ASSERT(!(posExpression.length == 0));
        DE_ASSERT(!(colorRExpression.length == 0));
        DE_ASSERT(!(colorGExpression.length == 0));
        DE_ASSERT(!(colorBExpression.length == 0));

        /** @type {string} */ var vertShaderSourceStr =
            '#version 300 es\n' +
            'in highp vec4 a_position;\n' +
            instanceAttribs +
            'out mediump vec4 v_color;\n' +
            '\n' +
            'void main()\n' +
            '{\n' +
            '	gl_Position = ' + posExpression + ';\n' +
            '	v_color.r = ' + colorRExpression + ';\n' +
            '	v_color.g = ' + colorGExpression + ';\n' +
            '	v_color.b = ' + colorBExpression + ';\n' +
            '	v_color.a = 1.0;\n' +
            '}\n';

        /** @type {string} */ var fragShaderSource =
            '#version 300 es\n' +
            'layout(location = 0) out mediump vec4 o_color;\n' +
            'in mediump vec4 v_color;\n' +
            '\n' +
            'void main()\n' +
            '{\n' +
            '	o_color = v_color;\n' +
            '}\n';

        // Create shader program and log it.

        DE_ASSERT(!this.m_program);
        this.m_program = new gluShaderProgram.ShaderProgram(gl, gluShaderProgram.makeVtxFragSources(vertShaderSourceStr, fragShaderSource));

        //tcu::TestLog& log = this.m_testCtx.getLog();
        //log << *m_program;
        // TODO: bufferedLogToConsole?
        //bufferedLogToConsole(this.m_program);

        if (!this.m_program.isOk())
            TCU_FAIL('Failed to compile shader');

        // Vertex shader attributes.

        if (this.m_function == DrawFunction.FUNCTION_DRAW_ELEMENTS_INSTANCED)
        {
            // Vertex positions. Positions form a vertical bar of width <screen width>/<number of instances>.

            for (var y = 0; y < QUAD_GRID_SIZE + 1; y++)
                for (var x = 0; x < QUAD_GRID_SIZE + 1; x++)
                {
                    /** @type {number} */ var fx = -1.0 + x / QUAD_GRID_SIZE * 2.0 / this.m_numInstances;
                    /** @type {number} */ var fy = -1.0 + y / QUAD_GRID_SIZE * 2.0;

                    this.m_gridVertexPositions.push(fx);
                    this.m_gridVertexPositions.push(fy);
                }

            // Indices.

            for (var y = 0; y < QUAD_GRID_SIZE; y++)
                for (var x = 0; x < QUAD_GRID_SIZE; x++)
                {
                    /** @type {number} */ var ndx00 = y * (QUAD_GRID_SIZE + 1) + x;
                    /** @type {number} */ var ndx10 = y * (QUAD_GRID_SIZE + 1) + x + 1;
                    /** @type {number} */ var ndx01 = (y + 1) * (QUAD_GRID_SIZE + 1) + x;
                    /** @type {number} */ var ndx11 = (y + 1) * (QUAD_GRID_SIZE + 1) + x + 1;

                    // Lower-left triangle of a quad.
                    this.m_gridIndices.push(ndx00);
                    this.m_gridIndices.push(ndx10);
                    this.m_gridIndices.push(ndx01);

                    // Upper-right triangle of a quad.
                    this.m_gridIndices.push(ndx11);
                    this.m_gridIndices.push(ndx01);
                    this.m_gridIndices.push(ndx10);
                }
        }
        else
        {
            DE_ASSERT(this.m_function == DrawFunction.FUNCTION_DRAW_ARRAYS_INSTANCED);

            // Vertex positions. Positions form a vertical bar of width <screen width>/<number of instances>.

            for (var y = 0; y < QUAD_GRID_SIZE; y++)
                for (var x = 0; x < QUAD_GRID_SIZE; x++)
                {
                    /** @type {number} */ var fx0 = -1.0 + (x + 0) / QUAD_GRID_SIZE * 2.0 / this.m_numInstances;
                    /** @type {number} */ var fx1 = -1.0 + (x + 1) / QUAD_GRID_SIZE * 2.0 / this.m_numInstances;
                    /** @type {number} */ var fy0 = -1.0 + (y + 0) / QUAD_GRID_SIZE * 2.0;
                    /** @type {number} */ var fy1 = -1.0 + (y + 1) / QUAD_GRID_SIZE * 2.0;

                    // Vertices of a quad's lower-left triangle: (fx0, fy0), (fx1, fy0) and (fx0, fy1)
                    this.m_gridVertexPositions.push(fx0);
                    this.m_gridVertexPositions.push(fy0);
                    this.m_gridVertexPositions.push(fx1);
                    this.m_gridVertexPositions.push(fy0);
                    this.m_gridVertexPositions.push(fx0);
                    this.m_gridVertexPositions.push(fy1);

                    // Vertices of a quad's upper-right triangle: (fx1, fy1), (fx0, fy1) and (fx1, fy0)
                    this.m_gridVertexPositions.push(fx1);
                    this.m_gridVertexPositions.push(fy1);
                    this.m_gridVertexPositions.push(fx0);
                    this.m_gridVertexPositions.push(fy1);
                    this.m_gridVertexPositions.push(fx1);
                    this.m_gridVertexPositions.push(fy0);
                }
        }

        // Instanced attributes: position offset and color RGB components.

        if (this.m_instancingType == InstancingType.TYPE_ATTRIB_DIVISOR || this.m_instancingType == InstancingType.TYPE_MIXED)
        {
            if (this.m_instancingType == InstancingType.TYPE_ATTRIB_DIVISOR)
            {
                // Offsets are such that the vertical bars are drawn next to each other.
                for (var i = 0; i < this.m_numInstances; i++)
                {
                    this.m_instanceOffsets.push(i * 2.0 / this.m_numInstances);

                    DE_STATIC_ASSERT(OFFSET_COMPONENTS >= 1 && OFFSET_COMPONENTS <= 4);

                    for (var j = 0; j < OFFSET_COMPONENTS - 1; j++)
                        this.m_instanceOffsets.push(0.0);
                }

                /** @type {number} */ var rInstances = Math.floor(this.m_numInstances / ATTRIB_DIVISOR_R) + (this.m_numInstances % ATTRIB_DIVISOR_R == 0 ? 0 : 1);
                for (var i = 0; i < rInstances; i++)
                {
                    this.pushVarCompAttrib(this.m_instanceColorR, i / rInstances);

                    for (var j = 0; j < typeSize - 1; j++)
                        this.pushVarCompAttrib(this.m_instanceColorR, 0.0);
                }
            }

            /** @type {number} */ var gInstances = Math.floor(this.m_numInstances / ATTRIB_DIVISOR_G) + (this.m_numInstances % ATTRIB_DIVISOR_G == 0 ? 0 : 1);
            for (var i = 0; i < gInstances; i++)
            {
                this.pushVarCompAttrib(this.m_instanceColorG, i * 2.0 / gInstances);

                for (var j = 0; j < typeSize - 1; j++)
                    this.pushVarCompAttrib(this.m_instanceColorG, 0.0);
            }

            /** @type {number} */ var bInstances = Math.floor(this.m_numInstances / ATTRIB_DIVISOR_B) + (this.m_numInstances % ATTRIB_DIVISOR_B == 0 ? 0 : 1);
            for (var i = 0; i < bInstances; i++)
            {
                this.pushVarCompAttrib(this.m_instanceColorB, 1.0 - i / bInstances);

                for (var j = 0; j < typeSize - 1; j++)
                    this.pushVarCompAttrib(this.m_instanceColorB, 0.0);
            }
        }
    };

    InstancedRenderingCase.prototype.iterate = function() {
        /** @type {number} */ var width = Math.min(gl.drawingBufferWidth, MAX_RENDER_WIDTH);
        /** @type {number} */ var height = Math.min(gl.drawingBufferHeight, MAX_RENDER_HEIGHT);

        /** @type {number} */ var xOffsetMax = gl.drawingBufferWidth - width;
        /** @type {number} */ var yOffsetMax = gl.drawingBufferHeight - height;

        /** @type {deRandom.Random} */ var rnd = new deRandom.Random(deString.deStringHash(this.name));

        /** @type {number} */ var xOffset = rnd.getInt(0, xOffsetMax);
        /** @type {number} */ var yOffset = rnd.getInt(0, yOffsetMax);

        /** @type {tcuSurface.Surface} */ var referenceImg = new tcuSurface.Surface(width, height);
        /** @type {tcuSurface.Surface} */ var resultImg = new tcuSurface.Surface(width, height);

        // Draw result.

        gl.viewport(xOffset, yOffset, width, height);

        this.setupAndRender();

        //TODO: validate readPixels()
        //gluShaderUtil.readPixels(this.m_context.getRenderContext(), xOffset, yOffset, resultImg.getAccess());
        var resImg = resultImg.getAccess();
        var resImgTransferFormat = gluTextureUtil.getTransferFormat(resImg.getFormat());

        gl.readPixels(xOffset, yOffset, resImg.m_width, resImg.m_height, resImgTransferFormat.format, resImgTransferFormat.dataType, resultImg.m_pixels);
        // Compute reference.

        this.computeReference(referenceImg);

        // Compare.

        // Passing referenceImg.getAccess() and resultImg.getAccess() instead of referenceImg and resultImg
        /** @type {boolean} */ var testOk = tcuImageCompare.fuzzyCompare('ComparisonResult', 'Image comparison result', referenceImg.getAccess(), resultImg.getAccess(), 0.05, gluShaderUtil.COMPARE_LOG_RESULT);

        assertMsgOptions(testOk, '', true, false);

        return tcuTestCase.runner.IterateResult.STOP;
    };


    /**
    * @param {Array.<number>} attrPtr
    * @param {number} location
    * @param {number} divisor
    */
    InstancedRenderingCase.prototype.setupVarAttribPointer = function(attrPtr, location, divisor)
    {
        /** @type {boolean} */ var isFloatCase = gluShaderUtil.isDataTypeFloatOrVec(this.m_rgbAttrType);
        /** @type {boolean} */ var isIntCase = gluShaderUtil.isDataTypeIntOrIVec(this.m_rgbAttrType);
        /** @type {boolean} */ var isUintCase = gluShaderUtil.isDataTypeUintOrUVec(this.m_rgbAttrType);
        /** @type {boolean} */ var isMatCase = gluShaderUtil.isDataTypeMatrix(this.m_rgbAttrType);
        /** @type {number} */ var typeSize = gluShaderUtil.getDataTypeScalarSize(this.m_rgbAttrType);
        /** @type {number} */ var numSlots = isMatCase ? gluShaderUtil.getDataTypeMatrixNumColumns(this.m_rgbAttrType) : 1; // Matrix uses as many attribute slots as it has columns.

        for (var slotNdx = 0; slotNdx < numSlots; slotNdx++)
        {
            /** @type {number} */ var curLoc = location + slotNdx;

            gl.enableVertexAttribArray(curLoc);
            gl.vertexAttribDivisor(curLoc, divisor);
            var curLocGlBuffer = gl.createBuffer();
            if (isFloatCase)
            {
                var bufferCurLoc = new Float32Array(this.m_gridVertexPositions);
                gl.bindBuffer(gl.ARRAY_BUFFER, curLocGlBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, bufferCurLoc, gl.STATIC_DRAW);

                gl.vertexAttribPointer(curLoc, typeSize, gl.FLOAT, false, 0, 0);
            }
            else if (isIntCase)
            {
                var bufferCurLoc = new Int32Array(this.m_gridVertexPositions);
                gl.bindBuffer(gl.ARRAY_BUFFER, curLocGlBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, bufferCurLoc, gl.STATIC_DRAW);

                gl.vertexAttribIPointer(curLoc, typeSize, gl.INT, 0, 0);
            }
            else if (isUintCase)
            {
                var bufferCurLoc = new Uint32Array(this.m_gridVertexPositions);
                gl.bindBuffer(gl.ARRAY_BUFFER, curLocGlBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, bufferCurLoc, gl.STATIC_DRAW);

                gl.vertexAttribIPointer(curLoc, typeSize, gl.UNSIGNED_INT, 0, 0);
            }
            else if (isMatCase)
            {
                /** @type {number} */ var numRows = gluShaderUtil.getDataTypeMatrixNumRows(this.m_rgbAttrType);
                /** @type {number} */ var numCols = gluShaderUtil.getDataTypeMatrixNumColumns(this.m_rgbAttrType);

                var bufferCurLoc = new Float32Array(this.m_gridVertexPositions);
                gl.bindBuffer(gl.ARRAY_BUFFER, curLocGlBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, bufferCurLoc, gl.STATIC_DRAW);

                gl.vertexAttribPointer(curLoc, numRows, gl.FLOAT, false, numCols * numRows * 4, 0);
            }
            else
                DE_ASSERT(false);
        }
    };


    InstancedRenderingCase.prototype.setupAndRender = function()
    {
        /** @type {deUint32} */ var program = this.m_program.getProgram();

        gl.useProgram(program);

        {
            // Setup attributes.

            // Position attribute is non-instanced.
            /** @type {number} */ var positionLoc = gl.getAttribLocation(program, 'a_position');
            gl.enableVertexAttribArray(positionLoc);
            var positionBuffer = gl.createBuffer();
            var bufferGridVertexPosition = new Float32Array(this.m_gridVertexPositions);
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, bufferGridVertexPosition, gl.STATIC_DRAW);
            gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

            if (this.m_instancingType == InstancingType.TYPE_ATTRIB_DIVISOR || this.m_instancingType == InstancingType.TYPE_MIXED)
            {
                if (this.m_instancingType == InstancingType.TYPE_ATTRIB_DIVISOR)
                {
                    // Position offset attribute is instanced with separate offset for every instance.
                    /** @type {number} */ var offsetLoc = gl.getAttribLocation(program, 'a_instanceOffset');
                    gl.enableVertexAttribArray(offsetLoc);
                    gl.vertexAttribDivisor(offsetLoc, 1);

                    var offsetLocGlBuffer = gl.createBuffer();
                    var bufferOffsetLoc = new Float32Array(this.m_gridVertexPositions);
                    gl.bindBuffer(gl.ARRAY_BUFFER, offsetLocGlBuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, bufferOffsetLoc, gl.STATIC_DRAW);

                    gl.vertexAttribPointer(offsetLoc, OFFSET_COMPONENTS, gl.FLOAT, false, 0, this.m_instanceOffsets);

                    /** @type {number} */ var rLoc = gl.getAttribLocation(program, 'a_instanceR');
                    this.setupVarAttribPointer(this.m_instanceColorR, rLoc, ATTRIB_DIVISOR_R);
                }

                /** @type {number} */ var gLoc = gl.getAttribLocation(program, 'a_instanceG');
                this.setupVarAttribPointer(this.m_instanceColorG, gLoc, ATTRIB_DIVISOR_G);

                /** @type {number} */ var bLoc = gl.getAttribLocation(program, 'a_instanceB');
                this.setupVarAttribPointer(this.m_instanceColorB, bLoc, ATTRIB_DIVISOR_B);
            }
        }

        // Draw using appropriate function.

        if (this.m_function == DrawFunction.FUNCTION_DRAW_ARRAYS_INSTANCED)
        {
            /** @type {number} */ var numPositionComponents = 2;
            gl.drawArraysInstanced(gl.TRIANGLES, 0, Math.floor(this.m_gridVertexPositions.length / numPositionComponents), this.m_numInstances);
        }
        else
        {
            var gridIndicesGLBuffer = gl.createBuffer();
            var bufferGridIndices = new Float32Array(this.m_gridIndices);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gridIndicesGLBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, bufferGridIndices, gl.STATIC_DRAW);

            gl.drawElementsInstanced(gl.TRIANGLES, this.m_gridIndices.length, gl.UNSIGNED_SHORT, 0, this.m_numInstances);

        }
        gl.useProgram(null);
    };


    /**
    * @param {tcuSurface.Surface} attrPtr
    */
    InstancedRenderingCase.prototype.computeReference = function(dst)
    {
        /** @type {number} */ var wid = dst.getWidth();
        /** @type {number} */ var hei = dst.getHeight();

        // Draw a rectangle (vertical bar) for each instance.

        for (var instanceNdx = 0; instanceNdx < this.m_numInstances; instanceNdx++)
        {
            /** @type {number} */ var xStart = Math.floor(instanceNdx * wid / this.m_numInstances);
            /** @type {number} */ var xEnd = Math.floor((instanceNdx + 1) * wid / this.m_numInstances);

            // Emulate attribute divisors if that is the case.

            /** @type {number} */ var clrNdxR = this.m_instancingType == InstancingType.TYPE_ATTRIB_DIVISOR ? Math.floor(instanceNdx / ATTRIB_DIVISOR_R) : instanceNdx;
            /** @type {number} */ var clrNdxG = this.m_instancingType == InstancingType.TYPE_ATTRIB_DIVISOR || this.m_instancingType == InstancingType.TYPE_MIXED ? Math.floor(instanceNdx / ATTRIB_DIVISOR_G) : instanceNdx;
            /** @type {number} */ var clrNdxB = this.m_instancingType == InstancingType.TYPE_ATTRIB_DIVISOR || this.m_instancingType == InstancingType.TYPE_MIXED ? Math.floor(instanceNdx / ATTRIB_DIVISOR_B) : instanceNdx;

            /** @type {number} */ var rInstances = this.m_instancingType == InstancingType.TYPE_ATTRIB_DIVISOR ? Math.floor(this.m_numInstances / ATTRIB_DIVISOR_R) + (this.m_numInstances % ATTRIB_DIVISOR_R == 0 ? 0 : 1) : this.m_numInstances;
            /** @type {number} */ var gInstances = this.m_instancingType == InstancingType.TYPE_ATTRIB_DIVISOR || this.m_instancingType == InstancingType.TYPE_MIXED ? Math.floor(this.m_numInstances / ATTRIB_DIVISOR_G) + (this.m_numInstances % ATTRIB_DIVISOR_G == 0 ? 0 : 1) : this.m_numInstances;
            /** @type {number} */ var bInstances = this.m_instancingType == InstancingType.TYPE_ATTRIB_DIVISOR || this.m_instancingType == InstancingType.TYPE_MIXED ? Math.floor(this.m_numInstances / ATTRIB_DIVISOR_B) + (this.m_numInstances % ATTRIB_DIVISOR_B == 0 ? 0 : 1) : this.m_numInstances;

            // Calculate colors.

            /** @type {number} */ var r = clrNdxR / rInstances;
            /** @type {number} */ var g = clrNdxG * 2.0 / gInstances;
            /** @type {number} */ var b = 1.0 - clrNdxB / bInstances;

            // Convert to integer and back if shader inputs are integers.

            if (gluShaderUtil.isDataTypeIntOrIVec(this.m_rgbAttrType))
            {
                /** @type {deInt32} */var intR = (r * FLOAT_INT_SCALE + FLOAT_INT_BIAS);
                /** @type {deInt32} */var intG = (g * FLOAT_INT_SCALE + FLOAT_INT_BIAS);
                /** @type {deInt32} */var intB = (b * FLOAT_INT_SCALE + FLOAT_INT_BIAS);
                r = (intR - FLOAT_INT_BIAS) / FLOAT_INT_SCALE;
                g = (intG - FLOAT_INT_BIAS) / FLOAT_INT_SCALE;
                b = (intB - FLOAT_INT_BIAS) / FLOAT_INT_SCALE;
            }
            else if (gluShaderUtil.isDataTypeUintOrUVec(this.m_rgbAttrType))
            {
                /** @type {deUint32} */var uintR = (r * FLOAT_UINT_SCALE + FLOAT_UINT_BIAS);
                /** @type {deUint32} */var uintG = (g * FLOAT_UINT_SCALE + FLOAT_UINT_BIAS);
                /** @type {deUint32} */var uintB = (b * FLOAT_UINT_SCALE + FLOAT_UINT_BIAS);
                r = (uintR - FLOAT_UINT_BIAS) / FLOAT_UINT_SCALE;
                g = (uintG - FLOAT_UINT_BIAS) / FLOAT_UINT_SCALE;
                b = (uintB - FLOAT_UINT_BIAS) / FLOAT_UINT_SCALE;
            }

            // Draw rectangle.

            for (var y = 0; y < hei; y++)
                for (var x = xStart; x < xEnd; x++)
                    dst.setPixel(x, y, [r, g, b, 1.0]);
        }
    };

    var init = function()
    {
        var testGroup = tcuTestCase.runner.getState().testCases;
    /** @type {Array.<number>} */ var instanceCounts = [1, 2, 4, 20];

        for (var _function = 0; _function < Object.keys(DrawFunction).length; _function++)
        {
            /** @type {string} */ var functionName =
                                       _function == DrawFunction.FUNCTION_DRAW_ARRAYS_INSTANCED ? 'draw_arrays_instanced' :
                                       _function == DrawFunction.FUNCTION_DRAW_ELEMENTS_INSTANCED ? 'draw_elements_instanced' :
                                       null;

            /** @type {string} */ var functionDesc =
                                       _function == DrawFunction.FUNCTION_DRAW_ARRAYS_INSTANCED ? 'Use glDrawArraysInstanced()' :
                                       _function == DrawFunction.FUNCTION_DRAW_ELEMENTS_INSTANCED ? 'Use glDrawElementsInstanced()' :
                                       null;

            DE_ASSERT(functionName != null);
            DE_ASSERT(functionDesc != null);

            /** @type {TestCaseGroup} */ var functionGroup = new tcuTestCase.newTest(functionName, functionDesc);
            testGroup.addChild(functionGroup);

            for (var instancingType = 0; instancingType < Object.keys(InstancingType).length; instancingType++)
            {
                /** @type {string} */ var instancingTypeName =
                                                 instancingType == InstancingType.TYPE_INSTANCE_ID ? 'instance_id' :
                                                 instancingType == InstancingType.TYPE_ATTRIB_DIVISOR ? 'attribute_divisor' :
                                                 instancingType == InstancingType.TYPE_MIXED ? 'mixed' :
                                                 null;

                /** @type {string} */ var instancingTypeDesc =
                                                 instancingType == InstancingType.TYPE_INSTANCE_ID ? 'Use gl_InstanceID for instancing' :
                                                 instancingType == InstancingType.TYPE_ATTRIB_DIVISOR ? 'Use vertex attribute divisors for instancing' :
                                                 instancingType == InstancingType.TYPE_MIXED ? 'Use both gl_InstanceID and vertex attribute divisors for instancing' :
                                                 null;

                DE_ASSERT(instancingTypeName != null);
                DE_ASSERT(instancingTypeDesc != null);

                /** @type {TestCaseGroup} */
                var instancingTypeGroup = new tcuTestCase.newTest(instancingTypeName, instancingTypeDesc);

                functionGroup.addChild(instancingTypeGroup);

                for (var countNdx = 0; countNdx < instanceCounts.length; countNdx++)
                {
                    /** @type {string} */ var countName = instanceCounts[countNdx].toString() + '_instances';

                    instancingTypeGroup.addChild(new InstancedRenderingCase(countName, '',
                                                                             _function,
                                                                             instancingType,
                                                                             gluShaderUtil.DataType.FLOAT,
                                                                             instanceCounts[countNdx]));
                }
            }
        }

        /** @type {gluShaderUtil.DataType} */ var s_testTypes =
        [
            gluShaderUtil.DataType.FLOAT,
            gluShaderUtil.DataType.FLOAT_VEC2,
            gluShaderUtil.DataType.FLOAT_VEC3,
            gluShaderUtil.DataType.FLOAT_VEC4,
            gluShaderUtil.DataType.FLOAT_MAT2,
            gluShaderUtil.DataType.FLOAT_MAT2X3,
            gluShaderUtil.DataType.FLOAT_MAT2X4,
            gluShaderUtil.DataType.FLOAT_MAT3X2,
            gluShaderUtil.DataType.FLOAT_MAT3,
            gluShaderUtil.DataType.FLOAT_MAT3X4,
            gluShaderUtil.DataType.FLOAT_MAT4X2,
            gluShaderUtil.DataType.FLOAT_MAT4X3,
            gluShaderUtil.DataType.FLOAT_MAT4,

            gluShaderUtil.DataType.INT,
            gluShaderUtil.DataType.INT_VEC2,
            gluShaderUtil.DataType.INT_VEC3,
            gluShaderUtil.DataType.INT_VEC4,

            gluShaderUtil.DataType.UINT,
            gluShaderUtil.DataType.UINT_VEC2,
            gluShaderUtil.DataType.UINT_VEC3,
            gluShaderUtil.DataType.UINT_VEC4
        ];

        /** @type {number} */ var typeTestNumInstances = 4;

        /** @type {TestCaseGroup} */ var typesGroup = new tcuTestCase.newTest('types', 'Tests for instanced attributes of particular data types');

        testGroup.addChild(typesGroup);

        for (var typeNdx = 0; typeNdx < s_testTypes.length; typeNdx++)
        {
            /** @type {gluShaderUtil.DataType} */ var type = s_testTypes[typeNdx];
            typesGroup.addChild(new InstancedRenderingCase(gluShaderUtil.getDataTypeName(type), '',
                                                            DrawFunction.FUNCTION_DRAW_ARRAYS_INSTANCED,
                                                            InstancingType.TYPE_ATTRIB_DIVISOR,
                                                            type,
                                                            typeTestNumInstances));
        }
    };

    var run = function(context)
    {
        gl = context;
        //Set up Test Root parameters
        var testName = 'instanced_rendering';
        var testDescription = 'Instanced Rendering Tests';
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
