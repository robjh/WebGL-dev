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
    'framework/common/tcuImageCompare'], function(
        deqpUtils,
        gluSP,
        deqpTests,
        tcuSurface,
        deString,
        deRandom,
        tcuImageCompare) {
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
    /** @const @type {float} */var FLOAT_INT_SCALE = 100.0;
    /** @const @type {float} */var FLOAT_INT_BIAS = -50.0;
    /** @const @type {float} */var FLOAT_UINT_SCALE = 100.0;
    /** @const @type {float} */var FLOAT_UINT_BIAS = 0.0;

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

    var DE_NULL = null;

    var DE_FALSE = false;

    var GL_FALSE = false;

    var VarComp = function(v) {
        //TODO: implement
        return v;
    };
    // TODO: do we need this?
    //DE_STATIC_ASSERT(sizeof(VarComp) == sizeof(deUint32));
    // InstancedRenderingCase

    /**
     * @enum DrawFunction
     */
    var DrawFunction = {
            FUNCTION_DRAW_ARRAYS_INSTANCED: 0,
            FUNCTION_DRAW_ELEMENTS_INSTANCED: 1
    };

    DrawFunction.length = Object.keys(DrawFunction).length;

    /**
     * @enum InstancingType
     */
    var InstancingType = {
            TYPE_INSTANCE_ID: 0,
            TYPE_ATTRIB_DIVISOR: 1,
            TYPE_MIXED: 2,
    };

    InstancingType.length = Object.keys(InstancingType).length;


    /**
    * InstancedRenderingCase class, inherits from TestCase class
    * @constructor
    * @param {string} name
    * @param {string} description
    * @param {DrawFunction} function
    * @param {InstancingType} instancingType
    * @param {glu.DataType} rgbAttrType
    * @param {integer} numInstances
    */
    var InstancedRenderingCase = function(name, description, _function, instancingType, rgbAttrType, numInstances)
    {
        deqpTests.DeqpTest.call(this, name, description);
        /** @type {DrawFunction} */ this.m_function = _function;
        /** @type {InstancingType} */ this.m_instancingType = instancingType;
        /** @type {glu.DataType} */ this.m_rgbAttrType = rgbAttrType;
        /** @type {integer} */ this.m_numInstances = numInstances;
        /** @type {glu.ShaderProgram} */ this.m_program = DE_NULL;
        /** @type {Array.<float>} */ this.m_gridVertexPositions = [];
        /** @type {Array.<deUint16>} */ this.m_gridIndices = [];
        /** @type {Array.<float>} */ this.m_instanceOffsets = [];
        /** @type {Array.<VarComp>} */ this.m_instanceColorR = [];
        /** @type {Array.<VarComp>} */ this.m_instanceColorG = [];
        /** @type {Array.<VarComp>} */ this.m_instanceColorB = [];
    };

    InstancedRenderingCase.prototype = Object.create(deqpTests.DeqpTest.prototype);
    InstancedRenderingCase.prototype.constructor = InstancedRenderingCase;

    /**
    * Helper function that does biasing and scaling when converting float to integer.
    * @param {Array.<VarComp>} vec
    * @param {float} val
    */
    InstancedRenderingCase.prototype.pushVarCompAttrib = function(vec, val)
    {
        var isFloatCase = deqpUtils.isDataTypeFloatOrVec(this.m_rgbAttrType);
        var isIntCase = deqpUtils.isDataTypeIntOrIVec(this.m_rgbAttrType);
        var isUintCase = deqpUtils.isDataTypeUintOrUVec(this.m_rgbAttrType);
        var isMatCase = deqpUtils.isDataTypeMatrix(this.m_rgbAttrType);
        if (isFloatCase || isMatCase)
            vec.push(new VarComp(val));
        else if (isIntCase)
            vec.push(new VarComp(val * FLOAT_INT_SCALE + FLOAT_INT_BIAS));
        else if (isUintCase)
            vec.push(new VarComp(val * FLOAT_UINT_SCALE + FLOAT_UINT_BIAS));
        else
            DE_ASSERT(DE_FALSE);
    };

    InstancedRenderingCase.prototype.init = function() {
        /** @type {boolean} */ var isFloatCase = deqpUtils.isDataTypeFloatOrVec(this.m_rgbAttrType);
        /** @type {boolean} */ var isIntCase = deqpUtils.isDataTypeIntOrIVec(this.m_rgbAttrType);
        /** @type {boolean} */ var isUintCase = deqpUtils.isDataTypeUintOrUVec(this.m_rgbAttrType);
        /** @type {boolean} */ var isMatCase = deqpUtils.isDataTypeMatrix(this.m_rgbAttrType);
        /** @type {integer} */ var typeSize = deqpUtils.getDataTypeScalarSize(this.m_rgbAttrType);
        /** @type {boolean} */ var isScalarCase = typeSize == 1;
        /** @type {string} */ var swizzleFirst = isScalarCase ? '' : '.x';
        /** @type {string} */ var typeName = deqpUtils.getDataTypeName(this.m_rgbAttrType);

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
                    DE_ASSERT(DE_FALSE);

                instanceAttribs += 'in highp ' + (OFFSET_COMPONENTS == 1 ? string('float') : 'vec' + OFFSET_COMPONENTS.toString()) + ' a_instanceOffset;\n';
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
                DE_ASSERT(DE_FALSE);

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
            '#version 300 es \n' +
            'layout(location = 0) out mediump vec4 o_color;\n' +
            'in mediump vec4 v_color;\n' +
            '\n' +
            'void main()\n' +
            '{\n' +
            '	o_color = v_color;\n' +
            '}\n';

        // Create shader program and log it.

        DE_ASSERT(!this.m_program);
        this.m_program = new gluSP.ShaderProgram(gl, gluSP.makeVtxFragSources(vertShaderSourceStr, fragShaderSource));

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
                    /** @type {float} */ var fx = -1.0 + x / QUAD_GRID_SIZE * 2.0 / this.m_numInstances;
                    /** @type {float} */ var fy = -1.0 + y / QUAD_GRID_SIZE * 2.0;

                    this.m_gridVertexPositions.push(fx);
                    this.m_gridVertexPositions.push(fy);
                }

            // Indices.

            for (var y = 0; y < QUAD_GRID_SIZE; y++)
                for (var x = 0; x < QUAD_GRID_SIZE; x++)
                {
                    /** @type {integer} */ var ndx00 = y * (QUAD_GRID_SIZE + 1) + x;
                    /** @type {integer} */ var ndx10 = y * (QUAD_GRID_SIZE + 1) + x + 1;
                    /** @type {integer} */ var ndx01 = (y + 1) * (QUAD_GRID_SIZE + 1) + x;
                    /** @type {integer} */ var ndx11 = (y + 1) * (QUAD_GRID_SIZE + 1) + x + 1;

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
                    /** @type {float} */ var fx0 = -1.0 + (x + 0) / QUAD_GRID_SIZE * 2.0 / this.m_numInstances;
                    /** @type {float} */ var fx1 = -1.0 + (x + 1) / QUAD_GRID_SIZE * 2.0 / this.m_numInstances;
                    /** @type {float} */ var fy0 = -1.0 + (y + 0) / QUAD_GRID_SIZE * 2.0;
                    /** @type {float} */ var fy1 = -1.0 + (y + 1) / QUAD_GRID_SIZE * 2.0;

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

                /** @type {integer} */ var rInstances = Math.floor(this.m_numInstances / ATTRIB_DIVISOR_R) + (this.m_numInstances % ATTRIB_DIVISOR_R == 0 ? 0 : 1);
                for (var i = 0; i < rInstances; i++)
                {
                    this.pushVarCompAttrib(this.m_instanceColorR, i / rInstances);

                    for (var j = 0; j < typeSize - 1; j++)
                        this.pushVarCompAttrib(this.m_instanceColorR, 0.0);
                }
            }

            /** @type {integer} */ var gInstances = Math.floor(this.m_numInstances / ATTRIB_DIVISOR_G) + (this.m_numInstances % ATTRIB_DIVISOR_G == 0 ? 0 : 1);
            for (var i = 0; i < gInstances; i++)
            {
                this.pushVarCompAttrib(this.m_instanceColorG, i * 2.0 / gInstances);

                for (var j = 0; j < typeSize - 1; j++)
                    this.pushVarCompAttrib(this.m_instanceColorG, 0.0);
            }

            /** @type {integer} */ var bInstances = Math.floor(this.m_numInstances / ATTRIB_DIVISOR_B) + (this.m_numInstances % ATTRIB_DIVISOR_B == 0 ? 0 : 1);
            for (var i = 0; i < bInstances; i++)
            {
                this.pushVarCompAttrib(this.m_instanceColorB, 1.0 - i / bInstances);

                for (var j = 0; j < typeSize - 1; j++)
                    this.pushVarCompAttrib(this.m_instanceColorB, 0.0);
            }
        }
    };

    InstancedRenderingCase.prototype.iterate = function() {
        /** @type {integer} */ var width = Math.min(gl.drawingBufferWidth, MAX_RENDER_WIDTH);
        /** @type {integer} */ var height = Math.min(gl.drawingBufferHeight, MAX_RENDER_HEIGHT);

        /** @type {integer} */ var xOffsetMax = gl.drawingBufferWidth - width;
        /** @type {integer} */ var yOffsetMax = gl.drawingBufferHeight - height;

        /** @type {de::Random} */ var rnd = new deRandom.Random(deString.deStringHash(this.name));

        /** @type {integer} */ var xOffset = rnd.getInt(0, xOffsetMax);
        /** @type {integer} */ var yOffset = rnd.getInt(0, yOffsetMax);

        /** @type {tcu::Surface} */ var referenceImg = tcuSurface.Surface(width, height);
        /** @type {tcu::Surface} */ var resultImg = tcuSurface.Surface(width, height);

        // Draw result.

        gl.viewport(xOffset, yOffset, width, height);

        this.setupAndRender();

        deqpUtils.readPixels(this.m_context.getRenderContext(), xOffset, yOffset, resultImg.getAccess());

        // Compute reference.

        this.computeReference(referenceImg);

        // Compare.

        // Passing referenceImg.getAccess() and resultImg.getAccess() instead of referenceImg and resultImg
        /** @type {boolean} */ var testOk = tcuImageCompare.fuzzyCompare(this.m_testCtx.getLog(), 'ComparisonResult', 'Image comparison result', referenceImg.getAccess(), resultImg.getAccess(), 0.05, deqpUtils.COMPARE_LOG_RESULT);

        this.m_testCtx.setTestResult(testOk ? QP_TEST_RESULT_PASS : QP_TEST_RESULT_FAIL,
                                    testOk ? 'Pass' : 'Fail');

        return deqpTests.runner.IterateResult.STOP;
    };


    /**
    * @param {attribute?} attrPtr
    * @param {integer} location
    * @param {integer} divisor
    */
    InstancedRenderingCase.prototype.setupVarAttribPointer = function(attrPtr, location, divisor)
    {
        /** @type {boolean} */ var isFloatCase = deqpUtils.isDataTypeFloatOrVec(this.m_rgbAttrType);
        /** @type {boolean} */ var isIntCase = deqpUtils.isDataTypeIntOrIVec(this.m_rgbAttrType);
        /** @type {boolean} */ var isUintCase = deqpUtils.isDataTypeUintOrUVec(this.m_rgbAttrType);
        /** @type {boolean} */ var isMatCase = deqpUtils.isDataTypeMatrix(this.m_rgbAttrType);
        /** @type {integer} */ var typeSize = deqpUtils.getDataTypeScalarSize(this.m_rgbAttrType);
        /** @type {integer} */ var numSlots = isMatCase ? deqpUtils.getDataTypeMatrixNumColumns(this.m_rgbAttrType) : 1; // Matrix uses as many attribute slots as it has columns.

        for (var slotNdx = 0; slotNdx < numSlots; slotNdx++)
        {
            /** @type {integer} */ var curLoc = location + slotNdx;

            gl.enableVertexAttribArray(curLoc);
            gl.vertexAttribDivisor(curLoc, divisor);
            //TODO: where is the implementation for GL_FALSE?
            if (isFloatCase)
                gl.vertexAttribPointer(curLoc, typeSize, gl.FLOAT, GL_FALSE, 0, attrPtr);
            else if (isIntCase)
                gl.vertexAttribIPointer(curLoc, typeSize, gl.INT, 0, attrPtr);
            else if (isUintCase)
                gl.vertexAttribIPointer(curLoc, typeSize, gl.UNSIGNED_INT, 0, attrPtr);
            else if (isMatCase)
            {
                /** @type {integer} */ var numRows = deqpUtils.getDataTypeMatrixNumRows(this.m_rgbAttrType);
                /** @type {integer} */ var numCols = deqpUtils.getDataTypeMatrixNumColumns(this.m_rgbAttrType);
                gl.vertexAttribPointer(curLoc, numRows, gl.FLOAT, GL_FALSE, numCols * numRows * 4, attrPtr); //sizeof(float) = 4
            }
            else
                DE_ASSERT(DE_FALSE);
        }
    };


    InstancedRenderingCase.prototype.setupAndRender = function()
    {
        /** @type {deUint32} */ var program = this.m_program.getProgram();

        gl.useProgram(program);

        {
            // Setup attributes.

            // Position attribute is non-instanced.
            /** @type {integer} */ var positionLoc = gl.getAttribLocation(program, 'a_position');
            gl.enableVertexAttribArray(positionLoc);
            gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, GL_FALSE, 0, this.m_gridVertexPositions[0]);

            if (this.m_instancingType == InstancingType.TYPE_ATTRIB_DIVISOR || this.m_instancingType == InstancingType.TYPE_MIXED)
            {
                if (this.m_instancingType == InstancingType.TYPE_ATTRIB_DIVISOR)
                {
                    // Position offset attribute is instanced with separate offset for every instance.
                    /** @type {integer} */ var offsetLoc = gl.getAttribLocation(program, 'a_instanceOffset');
                    gl.enableVertexAttribArray(offsetLoc);
                    gl.vertexAttribDivisor(offsetLoc, 1);
                    gl.vertexAttribPointer(offsetLoc, OFFSET_COMPONENTS, gl.FLOAT, GL_FALSE, 0, this.m_instanceOffsets[0]);

                    /** @type {integer} */ var rLoc = gl.getAttribLocation(program, 'a_instanceR');
                    this.setupVarAttribPointer(this.m_instanceColorR[0].u32, rLoc, ATTRIB_DIVISOR_R);
                }

                /** @type {integer} */ var gLoc = gl.getAttribLocation(program, 'a_instanceG');
                this.setupVarAttribPointer(this.m_instanceColorG[0].u32, gLoc, ATTRIB_DIVISOR_G);

                /** @type {integer} */ var bLoc = gl.getAttribLocation(program, 'a_instanceB');
                this.setupVarAttribPointer(this.m_instanceColorB[0].u32, bLoc, ATTRIB_DIVISOR_B);
            }
        }

        // Draw using appropriate function.

        if (this.m_function == DrawFunction.FUNCTION_DRAW_ARRAYS_INSTANCED)
        {
            /** @type {integer} */ var numPositionComponents = 2;
            gl.drawArraysInstanced(gl.TRIANGLES, 0, Math.floor(this.m_gridVertexPositions.length / numPositionComponents), this.m_numInstances);
        }
        else
            gl.drawElementsInstanced(gl.TRIANGLES, this.m_gridIndices.length, gl.UNSIGNED_SHORT, this.m_gridIndices[0], this.m_numInstances);

        gl.useProgram(0);
    };


    /**
    * @param {tcu::Surface&?} attrPtr
    */
    InstancedRenderingCase.prototype.computeReference = function(dst)
    {
        /** @type {integer} */ var wid = dst.getWidth();
        /** @type {integer} */ var hei = dst.getHeight();

        // Draw a rectangle (vertical bar) for each instance.

        for (var instanceNdx = 0; instanceNdx < this.m_numInstances; instanceNdx++)
        {
            /** @type {integer} */ var xStart = Math.floor(instanceNdx * wid / this.m_numInstances);
            /** @type {integer} */ var xEnd = Math.floor((instanceNdx + 1) * wid / this.m_numInstances);

            // Emulate attribute divisors if that is the case.

            /** @type {integer} */ var clrNdxR = this.m_instancingType == InstancingType.TYPE_ATTRIB_DIVISOR ? Math.floor(instanceNdx / ATTRIB_DIVISOR_R) : instanceNdx;
            /** @type {integer} */ var clrNdxG = this.m_instancingType == InstancingType.TYPE_ATTRIB_DIVISOR || this.m_instancingType == InstancingType.TYPE_MIXED ? Math.floor(instanceNdx / ATTRIB_DIVISOR_G) : instanceNdx;
            /** @type {integer} */ var clrNdxB = this.m_instancingType == InstancingType.TYPE_ATTRIB_DIVISOR || this.m_instancingType == InstancingType.TYPE_MIXED ? Math.floor(instanceNdx / ATTRIB_DIVISOR_B) : instanceNdx;

            /** @type {integer} */ var rInstances = this.m_instancingType == InstancingType.TYPE_ATTRIB_DIVISOR ? Math.floor(this.m_numInstances / ATTRIB_DIVISOR_R) + (this.m_numInstances % ATTRIB_DIVISOR_R == 0 ? 0 : 1) : this.m_numInstances;
            /** @type {integer} */ var gInstances = this.m_instancingType == InstancingType.TYPE_ATTRIB_DIVISOR || this.m_instancingType == InstancingType.TYPE_MIXED ? Math.floor(this.m_numInstances / ATTRIB_DIVISOR_G) + (this.m_numInstances % ATTRIB_DIVISOR_G == 0 ? 0 : 1) : this.m_numInstances;
            /** @type {integer} */ var bInstances = this.m_instancingType == InstancingType.TYPE_ATTRIB_DIVISOR || this.m_instancingType == InstancingType.TYPE_MIXED ? Math.floor(this.m_numInstances / ATTRIB_DIVISOR_B) + (this.m_numInstances % ATTRIB_DIVISOR_B == 0 ? 0 : 1) : this.m_numInstances;

            // Calculate colors.

            /** @type {float} */ var r = clrNdxR / rInstances;
            /** @type {float} */ var g = clrNdxG * 2.0 / gInstances;
            /** @type {float} */ var b = 1.0 - clrNdxB / bInstances;

            // Convert to integer and back if shader inputs are integers.

            if (deqpUtils.isDataTypeIntOrIVec(this.m_rgbAttrType))
            {
                /** @type {deInt32} */var intR = (r * FLOAT_INT_SCALE + FLOAT_INT_BIAS);
                /** @type {deInt32} */var intG = (g * FLOAT_INT_SCALE + FLOAT_INT_BIAS);
                /** @type {deInt32} */var intB = (b * FLOAT_INT_SCALE + FLOAT_INT_BIAS);
                r = (intR - FLOAT_INT_BIAS) / FLOAT_INT_SCALE;
                g = (intG - FLOAT_INT_BIAS) / FLOAT_INT_SCALE;
                b = (intB - FLOAT_INT_BIAS) / FLOAT_INT_SCALE;
            }
            else if (deqpUtils.isDataTypeUintOrUVec(this.m_rgbAttrType))
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
        var testGroup = deqpTests.runner.getState().testCases;
        /** @type {deUintinteger32} */ var instanceCounts = [1, 2, 4, 20];

        for (var _function = 0; _function < DrawFunction.length; _function++)
        {
            /** @type {string} */ var functionName =
                                       _function == DrawFunction.FUNCTION_DRAW_ARRAYS_INSTANCED ? 'draw_arrays_instanced' :
                                       _function == DrawFunction.FUNCTION_DRAW_ELEMENTS_INSTANCED ? 'draw_elements_instanced' :
                                       DE_NULL;

            /** @type {string} */ var functionDesc =
                                       _function == DrawFunction.FUNCTION_DRAW_ARRAYS_INSTANCED ? 'Use glDrawArraysInstanced()' :
                                       _function == DrawFunction.FUNCTION_DRAW_ELEMENTS_INSTANCED ? 'Use glDrawElementsInstanced()' :
                                       DE_NULL;

            DE_ASSERT(functionName != DE_NULL);
            DE_ASSERT(functionDesc != DE_NULL);

            /** @type {TestCaseGroup} */ var functionGroup = new deqpTests.newTest(functionName, functionDesc);
            testGroup.addChild(functionGroup);

            for (var instancingType = 0; instancingType < InstancingType.length; instancingType++)
            {
                /** @type {string} */ var instancingTypeName =
                                                 instancingType == InstancingType.TYPE_INSTANCE_ID ? 'instance_id' :
                                                 instancingType == InstancingType.TYPE_ATTRIB_DIVISOR ? 'attribute_divisor' :
                                                 instancingType == InstancingType.TYPE_MIXED ? 'mixed' :
                                                 DE_NULL;

                /** @type {string} */ var instancingTypeDesc =
                                                 instancingType == InstancingType.TYPE_INSTANCE_ID ? 'Use gl_InstanceID for instancing' :
                                                 instancingType == InstancingType.TYPE_ATTRIB_DIVISOR ? 'Use vertex attribute divisors for instancing' :
                                                 instancingType == InstancingType.TYPE_MIXED ? 'Use both gl_InstanceID and vertex attribute divisors for instancing' :
                                                 DE_NULL;

                DE_ASSERT(instancingTypeName != DE_NULL);
                DE_ASSERT(instancingTypeDesc != DE_NULL);

                /** @type {TestCaseGroup} */
                var instancingTypeGroup = new deqpTests.newTest(instancingTypeName, instancingTypeDesc);

                functionGroup.addChild(instancingTypeGroup);

                for (var countNdx = 0; countNdx < instanceCounts.length; countNdx++)
                {
                    /** @type {string} */ var countName = instanceCounts[countNdx].toString() + '_instances';

                    instancingTypeGroup.addChild(new InstancedRenderingCase(countName, '',
                                                                             _function,
                                                                             instancingType,
                                                                             deqpUtils.DataType.FLOAT,
                                                                             instanceCounts[countNdx]));
                }
            }
        }

        /** @type {glu::DataType} */ var s_testTypes =
        [
            deqpUtils.DataType.FLOAT,
            deqpUtils.DataType.FLOAT_VEC2,
            deqpUtils.DataType.FLOAT_VEC3,
            deqpUtils.DataType.FLOAT_VEC4,
            deqpUtils.DataType.FLOAT_MAT2,
            deqpUtils.DataType.FLOAT_MAT2X3,
            deqpUtils.DataType.FLOAT_MAT2X4,
            deqpUtils.DataType.FLOAT_MAT3X2,
            deqpUtils.DataType.FLOAT_MAT3,
            deqpUtils.DataType.FLOAT_MAT3X4,
            deqpUtils.DataType.FLOAT_MAT4X2,
            deqpUtils.DataType.FLOAT_MAT4X3,
            deqpUtils.DataType.FLOAT_MAT4,

            deqpUtils.DataType.INT,
            deqpUtils.DataType.INT_VEC2,
            deqpUtils.DataType.INT_VEC3,
            deqpUtils.DataType.INT_VEC4,

            deqpUtils.DataType.UINT,
            deqpUtils.DataType.UINT_VEC2,
            deqpUtils.DataType.UINT_VEC3,
            deqpUtils.DataType.UINT_VEC4
        ];

        /** @type {integer} */ var typeTestNumInstances = 4;

        /** @type {TestCaseGroup} */ var typesGroup = new deqpTests.newTest('types', 'Tests for instanced attributes of particular data types');

        testGroup.addChild(typesGroup);

        for (var typeNdx = 0; typeNdx < s_testTypes.length; typeNdx++)
        {
            /** @type {glu::DataType} */ var type = s_testTypes[typeNdx];

            typesGroup.addChild(new InstancedRenderingCase(deqpUtils.getDataTypeName(type), '',
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
        var state = deqpTests.runner.getState();

        state.testName = testName;
        state.testCases = deqpTests.newTest(testName, testDescription, null);

        //Set up name and description of this test series.
        setCurrentTestName(testName);
        description(testDescription);

        try {
            //Create test cases
            init();
            //Run test cases
            deqpTests.runTestCases();
        }
        catch (err) {
            testFailedOptions('Failed to run tests', false);
            deqpTests.runner.terminate();
        }
    };

    return {
        run: run
    };
});
