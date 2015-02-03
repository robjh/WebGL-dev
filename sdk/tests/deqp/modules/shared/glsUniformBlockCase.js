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

define(["framework/common/tcuTestCase", "framework/opengl/gluShaderProgram", "framework/opengl/gluShaderUtil", "framework/opengl/gluDrawUtil"], function(deqpTests, deqpProgram, deqpUtils, deqpDraw) {
    'use strict';

    /** @const */ var VIEWPORT_WIDTH = 128;
    /** @const */ var VIEWPORT_HEIGHT = 128;

    var program;
    var gl;
    var canvas;

var BlockLayoutEntry = function() {
    return {
    /** @type {number} */ size: 0,
    /** @type {string} */ name: '',
    /** @type {Array} */ activeUniformIndices: []
    };
};

var UniformLayoutEntry = function() {
    return {
    /** @type {string} */ name: '',
    /** @type {deqpUtils.DataType} */ type: deqpUtils.DataType.INVALID,
    /** @type {number} */ size: 0,
    /** @type {number} */ blockNdx: -1,
    /** @type {number} */ offset: -1,
    /** @type {number} */ arrayStride: -1,
    /** @type {number} */ matrixStride: -1,
    /** @type {number} */ isRowMajor: false
    };
};

var UniformLayout = function() {
    /** @type {Array.<BlockLayoutEntry>}*/ this.blocks = [];
    /** @type {Array.<UniformLayoutEntry>}*/ this.uniforms = [];

     /** getUniformIndex, returns a uniform index number in the layout,
     * given the uniform's name.
     * @param {string} name
     * @return {number} uniform's index
     */
    this.getUniformIndex = function(name) {
        for (var ndx = 0; ndx < this.uniforms.length; ndx++)
        {
            if (this.uniforms[ndx].name == name)
                return ndx;
        }
        return -1;
    };

     /** getBlockIndex, returns a block index number in the layout,
     * given the block's name.
     * @param {string} name the name of the block
     * @return {number} block's index
     **/
    this.getBlockIndex = function(name) {
        for (var ndx = 0; ndx < this.blocks.length; ndx++)
        {
            if (this.blocks[ndx].name == name)
                return ndx;
        }
        return -1;
    };
};

/** checkLayoutBounds
* @param {UniformLayout} layout The uniform layout to check
* @return {boolean} true if all is within bounds
**/
var checkLayoutBounds = function(layout) {
    /** @type {number} */ var numUniforms = layout.uniforms.length;
    /** @type {boolean}*/ var isOk = true;

    for (var uniformNdx = 0; uniformNdx < numUniforms; uniformNdx++)
    {
        /** @type {UniformLayoutEntry}*/ var uniform = 
            layout.uniforms[uniformNdx];

        if (uniform.blockNdx < 0)
            continue;

        /** @type {BlockLayoutEntry}*/ var block = layout.blocks[uniform.blockNdx];
        /** @type {boolean}*/ var isMatrix = deqpUtils.isDataTypeMatrix(uniform.type);
        /** @type {number}*/ var numVecs = isMatrix ? (uniform.isRowMajor ? deqpUtils.getDataTypeMatrixNumRows(uniform.type) : deqpUtils.getDataTypeMatrixNumColumns(uniform.type)) : 1;
        /** @type {number}*/ var numComps = isMatrix ? (uniform.isRowMajor ? deqpUtils.getDataTypeMatrixNumColumns(uniform.type) : deqpUtils.getDataTypeMatrixNumRows(uniform.type)) : deqpUtils.getDataTypeScalarSize(uniform.type);
        /** @type {number}*/ var numElements = uniform.size;
        /** @type {number}*/ var compSize = 4; // TODO: check how to safely represent sizeof(deUint32);
        /** @type {number}*/ var vecSize = numComps * compSize;

        /** @type {number}*/ var minOffset = 0;
        /** @type {number}*/ var maxOffset = 0;

        // For negative strides.
        minOffset = Math.min(minOffset, (numVecs - 1) * uniform.matrixStride);
        minOffset = Math.min(minOffset, (numElements - 1) * uniform.arrayStride);
        minOffset = Math.min(minOffset, (numElements - 1) * uniform.arrayStride + (numVecs - 1) * uniform.matrixStride);

        maxOffset = Math.max(maxOffset, vecSize);
        maxOffset = Math.max(maxOffset, (numVecs - 1) * uniform.matrixStride + vecSize);
        maxOffset = Math.max(maxOffset, (numElements - 1) * uniform.arrayStride + vecSize);
        maxOffset = Math.max(maxOffset, (numElements - 1) * uniform.arrayStride + (numVecs - 1) * uniform.matrixStride + vecSize);

        if (uniform.offset + minOffset < 0 || uniform.offset + maxOffset > block.size)
        {
            bufferedLogToConsole("Error: Uniform '" + uniform.name + "' out of block bounds");
            isOk = false;
        }
    }

    return isOk;
};

/** checkIndexQueries
* @param {number} program The shader program to be checked against
* @param {UniformLayout} layout The layout to check
* @return {boolean} true if everything matches.
**/
var checkIndexQueries = function(program, layout) {
    /** @type {boolean}*/ var allOk = true;

    // \note Spec mandates that uniform blocks are assigned consecutive locations from 0
    //       to ACTIVE_UNIFORM_BLOCKS. BlockLayoutEntries are stored in that order in UniformLayout.
    for (var blockNdx = 0; blockNdx < layout.blocks.length; blockNdx++)
    {
        /** @const */ var block = layout.blocks[blockNdx];
        /** @const */ var queriedNdx = gl.getUniformBlockIndex(program, block.name);

        if (queriedNdx != blockNdx)
        {
            bufferedLogToConsole('ERROR: glGetUniformBlockIndex(' + block.name + ') returned ' + queriedNdx + ', expected ' + blockNdx + '!');
            allOk = false;
        }

        assertMsgOptions(gl.getError() === gl.NO_ERROR, 'glGetUniformBlockIndex()', true, true);
    }

    return allOk;
};

/** Renders a white square, and then tests all pixels are
* effectively white in the color buffer.
* @param {deqpProgram.ShaderProgram} program The shader program to use.
* @return {boolean} false if there was at least one incorrect pixel
**/
var render = function(program) {
    // Compute viewport.
    /* TODO: original code used random number generator to compute viewport, we use whole canvas */
    /** @const */ var viewportW = Math.min(canvas.width, VIEWPORT_WIDTH);
    /** @const */ var viewportH = Math.min(canvas.height, VIEWPORT_HEIGHT);
    /** @const */ var viewportX = 0;
    /** @const */ var viewportY = 0;

    gl.clearColor(0.125, 0.25, 0.5, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

    //Draw
    var position = [
        -1.0, -1.0, 0.0, 1.0,
        -1.0, 1.0, 0.0, 1.0,
        1.0, -1.0, 0.0, 1.0,
        1.0, 1.0, 0.0, 1.0
    ];
    var indices = [0, 1, 2, 2 , 1 , 3];

    gl.viewport(viewportX, viewportY, viewportW, viewportH);

    var posArray = [new deqpDraw.VertexArrayBinding(gl.FLOAT, 'a_position', 4, 4, position)];
    deqpDraw.drawFromBuffers(gl, program, posArray, deqpDraw.triangles(indices));
    assertMsgOptions(gl.getError() === gl.NO_ERROR, 'Drawing');

    // Verify that all pixels are white.
    {
        var pixels = new deqpDraw.Surface();
        var numFailedPixels = 0;

        var buffer = pixels.readSurface(gl, viewportX, viewportY, viewportW, viewportH);
        assertMsgOptions(gl.getError() === gl.NO_ERROR, 'Reading pixels');

        var whitePixel = new deqpDraw.Pixel([255.0, 255.0, 255.0, 255.0]);
        for (var y = 0; y < viewportH; y++)
        {
            for (var x = 0; x < viewportW; x++)
            {
                if (!pixels.getPixel(x, y).equals(whitePixel))
                    numFailedPixels += 1;
            }
        }

        if (numFailedPixels > 0)
        {
            bufferedLogToConsole('Image comparison failed, got ' + numFailedPixels + ' non-white pixels.');
        }

        return numFailedPixels == 0;
    }
};

/** getShaderSource
* Reads a shader program's source by scouring the current document,
* looking for a script with the specified ID.
* @param {string} id ID of the shader code in the DOM
* @return {string} shader's source code.
**/
var getShaderSource = function(id) {
  var shaderScript = document.getElementById(id);

  // Didn't find an element with the specified ID; abort.

  if (!shaderScript) {
    return null;
  }

  // Walk through the source element's children, building the
  // shader source string.

  var theSource = '';
  var currentChild = shaderScript.firstChild;

  while (currentChild) {
    if (currentChild.nodeType == 3) {
      theSource += currentChild.textContent;
    }

    currentChild = currentChild.nextSibling;
  }

  return theSource;
};

/**
 * Initialize a test case
 */
var init = function() {
    // Init context
    var wtu = WebGLTestUtils;
    gl = wtu.create3DContext('canvas', {preserveDrawingBuffer: true});
    canvas = document.getElementById('canvas');

    if (!gl)
    {
        testFailed('Not able to create context', true);
    }
    // Create shaders
    var vsource = deqpProgram.genVertexSource(getShaderSource('shader-vs'));
    var fsource = deqpProgram.genFragmentSource(getShaderSource('shader-fs'));

    var programSources = { sources: [vsource, fsource] };

    program = new deqpProgram.ShaderProgram(gl, programSources);
    gl.useProgram(program.getProgram());
};

/**
 * Execute a test case
 * @return {bool} True if test case passed
 */
var execute = function()
{
    assertMsgOptions(render(program), 'Verify pixels', true, true);

    // Code for testing
    var layout = new UniformLayout();
    var block = new BlockLayoutEntry();
    block.name = 'one';
    layout.blocks.push(block);
    block = new BlockLayoutEntry();
    block.name = 'two';
    layout.blocks.push(block);

    var blockndx = layout.getBlockIndex('two');
    alert(blockndx);

    var uniform = new UniformLayoutEntry();
    uniform.name = 'one';
    layout.uniforms.push(uniform);
    uniform = new UniformLayoutEntry();
    uniform.name = 'two';
    layout.uniforms.push(uniform);

    var uniformndx = layout.getUniformIndex('one');
    alert(uniformndx);
};

var runTestCases = function() {
    try {
        init();
        execute();
    } catch (err) {
        bufferedLogToConsole(err);
    }
    deqpTests.runner.terminate();
};

return {
    runTestCases: runTestCases
};

});


