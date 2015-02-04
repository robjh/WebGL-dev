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

define(['framework/common/tcuTestCase', 'framework/opengl/gluShaderProgram', 'framework/opengl/gluShaderUtil', 'framework/opengl/gluDrawUtil', 'framework/delibs/debase/deInt32'], function(deqpTests, deqpProgram, deqpUtils, deqpDraw, deInt32) {
    'use strict';

    /** @const */ var VIEWPORT_WIDTH = 128;
    /** @const */ var VIEWPORT_HEIGHT = 128;

    var program;
    var gl;
    var canvas;

    /** @type {WebGLRenderingContext} */ var m_renderCtx;
    /*glu::GLSLVersion m_glslVersion;
    BufferMode m_bufferMode;*/
    /** @type {ShaderInterface} */ var m_interface;

var BlockLayoutEntry = function() {
    return {
    /** @type {number} */ size: 0,
    /** @type {string} */ name: '',
    /** @type {Array.<number>} */ activeUniformIndices: []
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

/** VarType
**/
var VarType = function() {
//private: (using var):

    /**
    * VarType types enum
    * @enum {number}
    */
    var Type = {
        TYPE_BASIC: 0,
        TYPE_ARRAY: 1,
        TYPE_STRUCT: 2
    };

    Type.TYPE_LAST = Type.length;

    /** @type {Type} */ var m_type;
    /** @type {deInt32.deUint32} */ var m_flags;

    /* m_data used to be a 'Data' union in C++. Switching to a
    normal structure due to the lack of such construct in JavaScript.
    Will edit as need arises */
    var m_data = function() {
        /** @type {deqpUtils.DataType} **/ var basicType;

        this.array = function() {
            /** @type {VarType} */ var elementType = undefined;
            /** @type {number} */ var size = 0;
        };

        /** @type {StructType} */ var structPtr;
    };

//public: (using this)

    /** isBasicType
    * @return {boolean} true if the VarType represents a basic type.
    **/
    this.isBasicType = function() {
        return m_type == Type.TYPE_BASIC;
    };

    /** isArrayType
    * @return {boolean} true if the VarType represents an array.
    **/
    this.isArrayType = function() {
        return m_type == Type.TYPE_ARRAY;
    };

    /** isStructType
    * @return {boolean} true if the VarType represents a struct.
    **/
    this.isStructType = function() {
        return m_type == Type.TYPE_STRUCT;
    };

    /** getFlags
    * @return {deUint32} returns the flags of the VarType.
    **/
    this.getFlags = function() {
        return m_flags;
    };

    /** getBasicType
    * @return {deqpUtils.DataType} returns the basic data type of the VarType.
    **/
    this.getBasicType = function() {
        return m_data.basicType;
    };

    /** getElementType
    * @return {VarType} returns the VarType of the element in case of an Array.
    **/
    this.getElementType = function() {
        return m_data.array.elementType;
    };

    /** getArraySize
    * (not to be confused with a javascript array)
    * @return {number} returns the size of the array in case it is an array.
    **/
    this.getArraySize = function() {
        return m_data.array.size;
    };

    /** getStruct
    * @return {StructType} returns the structure when it is a StructType.
    **/
    this.getStruct = function() {
        return m_data.structPtr;
    };
};

/** StructMember TODO: Check if we have to use deqpUtils.deUint32
 * in the JSDoc annotations or if a number would do.
 * @param {string} struct_name
 * @param {VarType} struct_type
 * @param {deqpUtils.deUint32} struct_flags
**/
var StructMember = function(struct_name, struct_type, struct_flags) {
//private:
    /** @type {string} */ var m_name = struct_name;
    /** @type {VarType} */ var m_type = struct_type;
    /** @type {deqpUtils.deUint32} */ var m_flags = struct_flags;

//public:
    /** getName
    * @return {string} the name of the member
    **/
    this.getName = function() { return m_name; };

    /** getType
    * @return {VarType} the type of the member
    **/
    this.getType = function() { return m_type; };

    /** getFlags
    * @return {deqpUtils.deUint32} the flags in the member
    **/
    this.getFlags = function() { return m_flags; };
};

/** StructType
 * @param {string} typeName
**/
var StructType = function(typeName) {
//private:
    /** @type {string}*/ var m_typeName = typeName;
    /** @type {Array.<StructMember>} */ var m_members = [];

//public:
    /** getTypeName
    * @return {string}
    **/
    this.getTypeName = function() {
        return m_typeName;
    };

    /* Instead of iterators, we'll add
    * a getter for a specific element (getMember),
    * and current members amount (getSize). */

    /*
    inline Iterator             begin            (void)          { return m_members.begin();      }
    inline ConstIterator        begin            (void) const    { return m_members.begin();      }
    inline Iterator             end              (void)          { return m_members.end();        }
    inline ConstIterator        end              (void) const    { return m_members.end();        }
    */

    /** getMember
    * @param {number} memberNdx The index of the member to retrieve.
    * @return {StructMember}
    **/
    this.getMember = function(memberNdx) {
        if (memberNdx >= 0 && memberNdx < m_members.length)
            return m_members[memberNdx];
        else {
            bufferedLogToConsole("Error: Invalid member index for StructType's members");
            return undefined;
        }
    };

    /** getSize
    * @return {number} The size of the m_members array.
    **/
    this.getSize = function() {
        return m_members.length;
    };

    /** addMember
    * @param {string} member_name
    * @param {VarType} member_type
    * @param {deqpUtils.deUint32} member_flags
    **/
    this.addMember = function(member_name, member_type, member_flags) {
        var member = StructMember(member_name, member_type, member_flags);

        m_members.push(member);
    };
};

/** Uniform
 * @param {string} name
 * @param {VarType} type
 * @param {deqpUtils.deUint32} flags
**/
var Uniform = function(name, type, flags) {
//private:
    /** @type {string} */ var m_name = name;
    /** @type {VarType} */ var m_type = type;
    /** @type {deqpUtils.deUint32} */ var m_flags = flags;

//public:
    /** getName
    * @return {string}
    **/
    this.getName = function() {
        return m_name;
    };

    /** getType
    * @return {VarType}
    **/
    this.getType = function() {
        return m_type;
    };

    /** getFlags
    * @return {deqpUtils.deUint32}
    **/
    this.getFlags = function() {
        return m_flags;
    };
};

/** UniformBlock
 * @param {string} blockName
**/
var UniformBlock = function(blockName) {
//private:
    /** @type {string} */ var m_blockName = blockName;
    /** @type {string} */ var m_instanceName;
    /** @type {Array.<Uniform>} */ var m_uniforms = [];
    /** @type {number} */ var m_arraySize = 0; //!< Array size or 0 if not interface block array.
    /** @type {deqpUtils.deUint32} */ var m_flags;

//public:
    /** getBlockName
    * @return {string}
    **/
    this.getBlockName = function() {
        return m_blockName;
    };

    /** getInstanceName
    * @return {string}
    **/
    this.getInstanceName = function() {
        return m_instanceName;
    };

    /** isArray
    * @return {boolean}
    **/
    this.isArray = function() {
        return m_arraySize > 0;
    };

    /** getArraySize
    * @return {number}
    **/
    this.getArraySize = function() {
        return m_arraySize;
    };

    /** getFlags
    * @return {deqpUtils.deUint32}
    **/
    this.getFlags = function() {
        return m_flags;
    };

    /** setInstanceName
    * @param {string} name
    **/
    this.setInstanceName = function(name) {
        m_instanceName = name;
    };

    /** setFlags
    * @param {deqpUtils.deUint32} flags
    **/
    this.setFlags = function(flags) {
        m_flags = flags;
    };

    /** setArraySize
    * @param {number} arraySize
    **/
    this.setArraySize = function(arraySize) {
        m_arraySize = arraySize;
    };

    /** addUniform
    * @param {Uniform} uniform
    **/
    this.addUniform = function(uniform) {
        m_uniforms.push(uniform);
    };

    /* Using uniform getter (getUniform),
     * and uniform array size getter (countUniforms)
     * instead of iterators.
    */
    /*
    inline Iterator      begin   (void)       { return m_uniforms.begin(); }
    inline ConstIterator begin   (void) const { return m_uniforms.begin(); }
    inline Iterator      end     (void)       { return m_uniforms.end();   }
    inline ConstIterator end     (void) const { return m_uniforms.end();   }
    */

    /** getUniform
    * @param {number} index
    * @return {Uniform}
    **/
    var getUniform = function(index) {
        if (index >= 0 && index < m_uniforms.length)
            return m_uniforms[index];
        else {
            bufferedLogToConsole("Error: Invalid uniform index for UniformBlock's uniforms");
            return undefined;
        }
    };

    /** countUniforms
    * @return {number}
    **/
    this.countUniforms = function() {
        return m_uniforms.length;
    };
};

/** ShaderInterface
**/
var ShaderInterface = function() {
//private:
    /** @type {Array.<StructType>} */ var m_structs = [];
    /** @type {Array.<UniformBlock>} */ var m_uniformBlocks = [];

//public:
    /** allocStruct
    * @param {string} name
    * @return {StructType}
    **/
    this.allocStruct = function(name) {
        //m_structs.reserve(m_structs.length + 1);
        m_structs.push(new StructType(name));
        return m_structs[m_structs.length - 1];
    };

    /** findStruct
    * @param {string} name
    * @return {StructType}
    **/
    this.findStruct = function(name) {
        for (var pos = 0; pos < m_structs.length; pos++) {
            if (m_structs[pos].getTypeName() == name)
                return m_structs[pos];
        }
        return undefined;
    };

    /** getNamedStructs
    * @param {Array.<StructType>} structs
    **/
    this.getNamedStructs = function(structs) {
        for (var pos = 0; pos < m_structs.length; pos++) {
            if (m_structs[pos].getTypeName() != undefined)
                structs.push(m_structs[pos]);
        }
    };

    /** allocBlock
    * @param {string} name
    * @return {UniformBlock}
    **/
    this.allocBlock = function(name) {
        m_uniformBlocks.push(new UniformBlock(name));
        return m_uniformBlocks[m_uniformBlocks.length - 1];
    };

    /** getNumUniformBlocks
    * @return {number}
    **/
    this.getNumUniformBlocks = function() {
        return m_uniformBlocks.length;
    };

    /** getUniformBlock
    * @param {number} ndx
    * @return {UniformBlock}
    **/
    this.getUniformBlock = function(ndx) {
        return m_uniformBlocks[ndx];
    };
};

/** compareTypes
* @param {UniformLayout} refLayout
* @param {UniformLayout} cmpLayout
* @return {boolean} true if uniform types are the same
**/
var compareTypes = function(refLayout, cmpLayout) {
    /** @type {boolean} */ var isOk = true;
    /** @type {number} */ var numBlocks = m_interface.getNumUniformBlocks();

    for (var blockNdx = 0; blockNdx < numBlocks; blockNdx++)
    {
        /** @type {UniformBlock} */ var block = m_interface.getUniformBlock(blockNdx);
        /** @type {boolean} */ var isArray = block.isArray();
        /** @type {number} */ var numInstances = isArray ? block.getArraySize() : 1;

        for (var instanceNdx = 0; instanceNdx < numInstances; instanceNdx++)
        {
            /** @type {string} */ var instanceName;

            instanceName += block.getBlockName();
            if (isArray)
                instanceName = instanceName + '[' + instanceNdx + ']';

            /** @type {number} */ var cmpBlockNdx = cmpLayout.getBlockIndex(instanceName);

            if (cmpBlockNdx < 0)
                continue;

            /** @type {BlockLayoutEntry} */ var cmpBlockLayout = cmpLayout.blocks[cmpBlockNdx];

            for (var ndx = 0; ndx < cmpBlockLayout.activeUniformIndices.length; ndx++)
            {
                /** @type {number} */ var ndxIter = cmpBlockLayout.activeUniformIndices[ndx];
                /** @type {UniformLayoutEntry} */ var cmpEntry = cmpLayout.uniforms[ndxIter];
                /** @type {number} */ var refEntryNdx = refLayout.getUniformIndex(cmpEntry.name);

                if (refEntryNdx < 0)
                {
                    bufferedLogToConsole("Error: Uniform '" + cmpEntry.name + "' not found in reference layout");
                    isOk = false;
                    continue;
                }

                /** @type {UniformLayoutEntry} */ var refEntry = refLayout.uniforms[refEntryNdx];

                // \todo [2012-11-26 pyry] Should we check other properties as well?
                if (refEntry.type != cmpEntry.type)
                {
                    bufferedLogToConsole("Error: Uniform type mismatch in '" + refEntry.name + "':</br>" +
                        "'  expected: '" + deqpUtils.getDataTypeName(refEntry.type) + "'</br>" +
                        "'  got: '" + deqpUtils.getDataTypeName(cmpEntry.type) + "'");
                    isOk = false;
                }
            }
        }
    }

    return isOk;
};

/** checkLayoutIndices
* @param {UniformLayout} layout Layout whose indices are to be checked
* @return {boolean} true if all is ok
**/
var checkLayoutIndices = function(layout) {
    /** @type {number} */ var numUniforms = layout.uniforms.length;
    /** @type {number} */ var numBlocks = layout.blocks.length;
    /** @type {boolean} */ var isOk = true;

    // Check uniform block indices.
    for (var uniformNdx = 0; uniformNdx < numUniforms; uniformNdx++)
    {
        /** @type {UniformLayoutEntry} */ var uniform = layout.uniforms[uniformNdx];

        if (uniform.blockNdx < 0 || !deInt32.deInBounds32(uniform.blockNdx, 0, numBlocks))
        {
            bufferedLogToConsole("Error: Invalid block index in uniform '" + uniform.name + "'");
            isOk = false;
        }
    }

    // Check active uniforms.
    for (var blockNdx = 0; blockNdx < numBlocks; blockNdx++)
    {
        /** @type {BlockLayoutEntry} */ var block = layout.blocks[blockNdx];

        for (var uniformNdx = 0; uniformNdx < block.activeUniformIndices.length; uniformNdx++)
        {
            /** @type {UniformLayoutEntry} */ var activeUniformNdx = block.activeUniformIndices[uniformNdx];
            if (!deInt32.deInBounds32(activeUniformNdx, 0, numUniforms))
            {
                bufferedLogToConsole('Error: Invalid active uniform index ' + activeUniformNdx + " in block '" + block.name);
                isOk = false;
            }
        }
    }
    return isOk;
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
        /** @type {UniformLayoutEntry}*/ var uniform = layout.uniforms[uniformNdx];

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
    var indices = [0, 1, 2, 2, 1, 3];

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

    var programSources = {sources: [vsource, fsource]};

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

    // Code for testing TODO: Remove it
    var layout = new UniformLayout();
    var block = new BlockLayoutEntry();
    block.name = 'one';
    block.activeUniformIndices.push(1);
    block.activeUniformIndices.push(0);
    layout.blocks.push(block);
    block = new BlockLayoutEntry();
    block.name = 'two';
    block.activeUniformIndices.push(0);
    block.activeUniformIndices.push(1);
    layout.blocks.push(block);
    

    var blockndx = layout.getBlockIndex('two');
    alert(blockndx);

    var uniform = new UniformLayoutEntry();
    uniform.name = 'one';
    uniform.blockNdx = 1;
    layout.uniforms.push(uniform);
    uniform = new UniformLayoutEntry();
    uniform.name = 'two';
    uniform.blockNdx=0;
    layout.uniforms.push(uniform);

    var uniformndx = layout.getUniformIndex('one');
    alert(uniformndx);
    
    var correctLayout = checkLayoutIndices(layout);
    alert('Indices are ' + ( correctLayout ? 'correct!' : 'incorrect :(') );
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


