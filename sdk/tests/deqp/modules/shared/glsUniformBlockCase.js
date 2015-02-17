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


define(['framework/common/tcuTestCase', 'framework/opengl/gluShaderProgram', 'framework/opengl/gluShaderUtil', 'framework/opengl/gluDrawUtil', 'framework/delibs/debase/deInt32', 'framework/delibs/debase/deRandom', 'modules/shared/glsVarType'], function(deqpTests, deqpProgram, deqpUtils, deqpDraw, deInt32, deRandom, glsVT) {
    'use strict';

/** @const */ var VIEWPORT_WIDTH = 128;
/** @const */ var VIEWPORT_HEIGHT = 128;

var program;
var gl;
var canvas;

/**
 * Class to implement some pointers functionality.
 */
var BlockPointers = function() {
    /** @type {ArrayBuffer} */ this.data = 0; //!< Data (vector<deUint8>).
    /** @type {Array.<number>} */ this.offsets = []; //!< Reference block pointers (map<int, void*>).
    /** @type {Array.<number>} */ this.sizes = [];
};

/**
 * push - Adds an offset/size pair to the collection
 * @param {number} offset Offset of the element to refer.
 * @param {number} size Size of the referred element.
 */
BlockPointers.prototype.push = function(offset, size) {
    this.offsets.push(offset);
    this.sizes.push(size);
};

/**
 * find - Finds and maps the data at the given offset, and returns a Uint8Array
 * @param {number} index of the element to find.
 */
BlockPointers.prototype.find = function(index) {
    return new Uint8Array(this.data, this.offsets[index], this.sizes[index]);
};

/**
 * resize - Replaces resize of a vector in C++. Sets the size of the data buffer.
 * NOTE: In this case however, if you resize, the data is lost.
 * @param {number} newsize The new size of the data buffer.
 */
BlockPointers.prototype.resize = function(newsize) {
    this.data = new ArrayBuffer(newsize);
};

var BufferMode = {
    BUFFERMODE_SINGLE: 0, //!< Single buffer shared between uniform blocks.
    BUFFERMODE_PER_BLOCK: 1 //!< Per-block buffers
};

BufferMode.BUFFERMODE_LAST = Object.keys(BufferMode).length;

var UniformFlags = {
    PRECISION_LOW: (1 << 0),
    PRECISION_MEDIUM: (1 << 1),
    PRECISION_HIGH: (1 << 2),


    LAYOUT_SHARED: (1 << 3),
    LAYOUT_PACKED: (1 << 4),
    LAYOUT_STD140: (1 << 5),
    LAYOUT_ROW_MAJOR: (1 << 6),
    LAYOUT_COLUMN_MAJOR: (1 << 7),    //!< \note Lack of both flags means column-major matrix.


    DECLARE_VERTEX: (1 << 8),
    DECLARE_FRAGMENT: (1 << 9),


    UNUSED_VERTEX: (1 << 10),    //!< Uniform or struct member is not read in vertex shader.
    UNUSED_FRAGMENT: (1 << 11)    //!< Uniform or struct member is not read in fragment shader.

};

UniformFlags.PRECISION_MASK = UniformFlags.PRECISION_LOW | UniformFlags.PRECISION_MEDIUM | UniformFlags.PRECISION_HIGH;
UniformFlags.LAYOUT_MASK = UniformFlags.LAYOUT_SHARED | UniformFlags.LAYOUT_PACKED | UniformFlags.LAYOUT_STD140 | UniformFlags.LAYOUT_ROW_MAJOR | UniformFlags.LAYOUT_COLUMN_MAJOR;
UniformFlags.DECLARE_BOTH = UniformFlags.DECLARE_VERTEX | UniformFlags.DECLARE_FRAGMENT;
UniformFlags.UNUSED_BOTH = UniformFlags.UNUSED_VERTEX | UniformFlags.UNUSED_FRAGMENT;

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
};

/** getUniformIndex, returns a uniform index number in the layout,
 * given the uniform's name.
 * @param {string} name
 * @return {number} uniform's index
 */
UniformLayout.prototype.getUniformIndex = function(name) {
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
 */
UniformLayout.prototype.getBlockIndex = function(name) {
    for (var ndx = 0; ndx < this.blocks.length; ndx++)
    {
        if (this.blocks[ndx].name == name)
            return ndx;
    }
    return -1;
};

/** StructMember TODO: Check if we have to use deInt32.deUint32
 * in the JSDoc annotations or if a number would do.
 * @param {string} name
 * @param {glsVT.VarType} type
 * @param {deInt32.deUint32} flags
**/
var StructMember = function(name, type, flags) {
    /** @type {string} */ this.m_name = name;
    /** @type {glsVT.VarType} */ this.m_type = type;
    /** @type {deInt32.deUint32} */ this.m_flags = flags;
};

/** getName
* @return {string} the name of the member
**/
StructMember.prototype.getName = function() { return this.m_name; };

/** getType
* @return {glsVT.VarType} the type of the member
**/
StructMember.prototype.getType = function() { return this.m_type; };

/** getFlags
* @return {deInt32.deUint32} the flags in the member
**/
StructMember.prototype.getFlags = function() { return this.m_flags; };

/** StructType
 * @param {string} typeName
**/
var StructType = function(typeName) {
//private:
    /** @type {string}*/ this.m_typeName = typeName;
    /** @type {Array.<StructMember>} */ this.m_members = [];
};

/** getTypeName
* @return {string}
**/
StructType.prototype.getTypeName = function() {
    return this.m_typeName;
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
StructType.prototype.getMember = function(memberNdx) {
    if (memberNdx >= 0 && memberNdx < this.m_members.length)
        return this.m_members[memberNdx];
    else {
        bufferedLogToConsole("Error: Invalid member index for StructType's members");
        return undefined;
    }
};

/** getSize
* @return {number} The size of the m_members array.
**/
StructType.prototype.getSize = function() {
    return this.m_members.length;
};

/** addMember
* @param {string} member_name
* @param {glsVT.VarType} member_type
* @param {deInt32.deUint32} member_flags
**/
StructType.prototype.addMember = function(member_name, member_type, member_flags) {
    var member = new StructMember(member_name, member_type, member_flags);

    this.m_members.push(member);
};

/** Uniform
 * @param {string} name
 * @param {glsVT.VarType} type
 * @param {deInt32.deUint32} flags
**/
var Uniform = function(name, type, flags) {
    /** @type {string} */ this.m_name = name;
    /** @type {glsVT.VarType} */ this.m_type = type;
    /** @type {deInt32.deUint32} */ this.m_flags = (typeof flags === 'undefined') ? 0 : flags;
};

/** getName
 * @return {string}
 */
Uniform.prototype.getName = function() {
    return this.m_name;
};

/** getType
 * @return {glsVT.VarType}
 */
Uniform.prototype.getType = function() {
    return this.m_type;
};

/** getFlags
* @return {deInt32.deUint32}
**/
Uniform.prototype.getFlags = function() {
    return this.m_flags;
};

/** UniformBlock
 * @param {string} blockName
**/
var UniformBlock = function(blockName) {
    /** @type {string} */ this.m_blockName = blockName;
    /** @type {string} */ this.m_instanceName;
    /** @type {Array.<Uniform>} */ this.m_uniforms = [];
    /** @type {number} */ this.m_arraySize = 0; //!< Array size or 0 if not interface block array.
    /** @type {deInt32.deUint32} */ this.m_flags = 0;
};

/** getBlockName
* @return {string}
**/
UniformBlock.prototype.getBlockName = function() {
    return this.m_blockName;
};

/** getInstanceName
* @return {string}
**/
UniformBlock.prototype.getInstanceName = function() {
    return this.m_instanceName;
};

/** isArray
* @return {boolean}
**/
UniformBlock.prototype.isArray = function() {
    return this.m_arraySize > 0;
};

/** getArraySize
* @return {number}
**/
UniformBlock.prototype.getArraySize = function() {
    return this.m_arraySize;
};

/** getFlags
* @return {deInt32.deUint32}
**/
UniformBlock.prototype.getFlags = function() {
    return this.m_flags;
};

/** setInstanceName
* @param {string} name
**/
UniformBlock.prototype.setInstanceName = function(name) {
    this.m_instanceName = name;
};

/** setFlags
* @param {deInt32.deUint32} flags
**/
UniformBlock.prototype.setFlags = function(flags) {
    this.m_flags = flags;
};

/** setArraySize
* @param {number} arraySize
**/
UniformBlock.prototype.setArraySize = function(arraySize) {
    this.m_arraySize = arraySize;
};

/** addUniform
* @param {Uniform} uniform
**/
UniformBlock.prototype.addUniform = function(uniform) {
    this.m_uniforms.push(uniform);
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
UniformBlock.prototype.getUniform = function(index) {
    if (index >= 0 && index < this.m_uniforms.length)
        return this.m_uniforms[index];
    else {
        bufferedLogToConsole("Error: Invalid uniform index for UniformBlock's uniforms");
        return undefined;
    }
};

/** countUniforms
* @return {number}
**/
UniformBlock.prototype.countUniforms = function() {
    return this.m_uniforms.length;
};

/** ShaderInterface
**/
var ShaderInterface = function() {
    /** @type {Array.<StructType>} */ this.m_structs = [];
    /** @type {Array.<UniformBlock>} */ this.m_uniformBlocks = [];
};

/** allocStruct
* @param {string} name
* @return {StructType}
**/
ShaderInterface.prototype.allocStruct = function(name) {
    //m_structs.reserve(m_structs.length + 1);
    this.m_structs.push(new StructType(name));
    return this.m_structs[this.m_structs.length - 1];
};

/** findStruct
* @param {string} name
* @return {StructType}
**/
ShaderInterface.prototype.findStruct = function(name) {
    for (var pos = 0; pos < this.m_structs.length; pos++) {
        if (this.m_structs[pos].getTypeName() == name)
            return this.m_structs[pos];
    }
    return undefined;
};

/** getNamedStructs
* @param {Array.<StructType>} structs
**/
ShaderInterface.prototype.getNamedStructs = function(structs) {
    for (var pos = 0; pos < this.m_structs.length; pos++) {
        if (this.m_structs[pos].getTypeName() != undefined)
            structs.push(this.m_structs[pos]);
    }
};

/** allocBlock
* @param {string} name
* @return {UniformBlock}
**/
ShaderInterface.prototype.allocBlock = function(name) {
    this.m_uniformBlocks.push(new UniformBlock(name));
    return this.m_uniformBlocks[this.m_uniformBlocks.length - 1];
};

/** getNumUniformBlocks
* @return {number}
**/
ShaderInterface.prototype.getNumUniformBlocks = function() {
    return this.m_uniformBlocks.length;
};

/** getUniformBlock
* @param {number} ndx
* @return {UniformBlock}
**/
ShaderInterface.prototype.getUniformBlock = function(ndx) {
    return this.m_uniformBlocks[ndx];
};

var UniformBlockCase = function(name, description, bufferMode) {
    deqpTests.DeqpTest.call(this, name, description);
    /** @type {string} */ this.m_name = name;
    /** @type {string} */ this.m_description = description;
    //glu::GLSLVersion m_glslVersion;
    /** @type {BufferMode} */ this.m_bufferMode = bufferMode;
    /** @type {ShaderInterface} */ this.m_interface = new ShaderInterface();
};

UniformBlockCase.prototype = Object.create(deqpTests.DeqpTest.prototype);
UniformBlockCase.prototype.constructor = UniformBlockCase;

/**
 * TODO: test getGLUniformLayout Gets the uniform blocks and uniforms in the program.
 * @param {WebGLRenderingContext} gl
 * @param {UniformLayout} layout To store the layout described in program.
 * @param {number} program id
 */
UniformBlockCase.prototype.getGLUniformLayout = function(gl, layout, program) {
    /** @type {number} */ var numActiveUniforms = 0;
    /** @type {number} */ var numActiveBlocks = 0;

    numActiveUniforms = gl.getProgramParameter(program, gl.GL_ACTIVE_UNIFORMS);
    numActiveBlocks = gl.getProgramParameter(program, gl.GL_ACTIVE_UNIFORM_BLOCKS);

    assertMsgOptions(gl.getError() != gl.NO_ERROR, 'Getting number of uniforms and uniform blocks', false, true);

    // Block entries.
    //No need to allocate these beforehand: layout.blocks.resize(numActiveBlocks);
    for (var blockNdx = 0; blockNdx < numActiveBlocks; blockNdx++)
    {
        /** @type {BlockLayoutEntry} */ var entry = new BlockLayoutEntry();
        /** @type {number} */ var size;
        /** @type {number} */ var nameLen;
        /** @type {number} */ var numBlockUniforms;

        size = gl.getActiveUniformBlockParameter(program, blockNdx, gl.GL_UNIFORM_BLOCK_DATA_SIZE);
        nameLen = gl.getActiveUniformBlockParameter(program, blockNdx, gl.GL_UNIFORM_BLOCK_NAME_LENGTH);
        numBlockUniforms = gl.getActiveUniformBlockParameter(program, blockNdx, gl.GL_UNIFORM_BLOCK_ACTIVE_UNIFORMS);

        assertMsgOptions(gl.getError() != gl.NO_ERROR, 'Uniform block query failed', false, true);

        /** @type {string} */ var nameBuf;
        nameBuf = gl.getActiveUniformBlockName(program, blockNdx);

        entry.name = nameBuf;
        entry.size = size;
        //entry.activeUniformIndices.resize(numBlockUniforms);

        if (numBlockUniforms > 0)
            entry.activeUniformIndices = gl.getActiveUniformBlockParameter(program, blockNdx, gl.GL_UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES);

        assertMsgOptions(gl.getError() != gl.NO_ERROR, 'Uniform block query', false, true);

        layout.blocks.push(entry); //Pushing the block into the array here.
    }

    if (numActiveUniforms > 0)
    {
        // Uniform entries.
        /** @type {Array.<number>} */ var uniformIndices = [];
        for (var i = 0; i < numActiveUniforms; i++)
            uniformIndices.push(i);

        /** @type {Array.<number>} */ var types = [];
        /** @type {Array.<number>} */ var sizes = [];
        /** @type {Array.<number>} */ var nameLengths = [];
        /** @type {Array.<number>} */ var blockIndices = [];
        /** @type {Array.<number>} */ var offsets = [];
        /** @type {Array.<number>} */ var arrayStrides = [];
        /** @type {Array.<number>} */ var matrixStrides = [];
        /** @type {Array.<number>} */ var rowMajorFlags = [];

        // Execute queries.
        types = gl.getActiveUniforms(program, uniformIndices, gl.GL_UNIFORM_TYPE);
        sizes = gl.getActiveUniforms(program, uniformIndices, gl.GL_UNIFORM_SIZE);
        nameLengths = gl.getActiveUniforms(program, uniformIndices, gl.GL_UNIFORM_NAME_LENGTH);
        blockIndices = gl.getActiveUniforms(program, uniformIndices, gl.GL_UNIFORM_BLOCK_INDEX);
        offsets = gl.getActiveUniforms(program, uniformIndices, gl.GL_UNIFORM_OFFSET);
        arrayStrides = gl.getActiveUniforms(program, uniformIndices, gl.GL_UNIFORM_ARRAY_STRIDE);
        matrixStrides = gl.getActiveUniforms(program, uniformIndices, gl.GL_UNIFORM_MATRIX_STRIDE);
        rowMajorFlags = gl.getActiveUniforms(program, uniformIndices, gl.GL_UNIFORM_IS_ROW_MAJOR);

        assertMsgOptions(gl.getError() != gl.NO_ERROR, 'Active uniform query', false, true);

        // Translate to LayoutEntries
        // No resize needed. Will push them: layout.uniforms.resize(numActiveUniforms);
        for (var uniformNdx = 0; uniformNdx < numActiveUniforms; uniformNdx++)
        {
            /** @type {UniformLayoutEntry} */ var entry = new UniformLayoutEntry();
            /** @type {string} */ var nameBuf;
            /** @type {number} */ var nameLen = 0;
            /** @type {number} */ var size = 0;
            /** @type {number} */ var type = gl.GL_NONE;

            var uniform = gl.getActiveUniform(program, uniformNdx);
            nameBuf = uniform.name;
            nameLen = nameBuf.length;
            size = uniform.size;
            type = uniform.type;

            assertMsgOptions(gl.getError() != gl.NO_ERROR, 'Uniform name query failed', false, true);

            if (nameLen != nameLengths[uniformNdx] ||
                size != sizes[uniformNdx] ||
                type != types[uniformNdx])
                testFailedOptions("Values returned by gl.getActiveUniform() don't match with values queried with gl.getActiveUniforms().", true);

            entry.name = nameBuf;
            entry.type = deqpUtils.getDataTypeFromGLType(types[uniformNdx]);
            entry.size = sizes[uniformNdx];
            entry.blockNdx = blockIndices[uniformNdx];
            entry.offset = offsets[uniformNdx];
            entry.arrayStride = arrayStrides[uniformNdx];
            entry.matrixStride = matrixStrides[uniformNdx];
            entry.isRowMajor = rowMajorFlags[uniformNdx] != gl.GL_FALSE;

            layout.uniforms.push(entry); //Pushing this uniform in the end.
        }
    }
};

/**
 * getDataTypeByteSize
 * @param {deqpUtils.DataType} type
 * @return {number}
 */
var getDataTypeByteSize = function(type) {
    return deqpUtils.getDataTypeScalarSize(type) * deqpUtils.deUint32_size;
};

/**
 * getDataTypeByteAlignment
 * @param {deqpUtils.DataType} type
 * @return {number}
 */
var getDataTypeByteAlignment = function(type)
{
    switch (type)
    {
        case deqpUtils.DataType.FLOAT:
        case deqpUtils.DataType.INT:
        case deqpUtils.DataType.UINT:
        case deqpUtils.DataType.BOOL: return 1 * deqpUtils.deUint32_size;

        case deqpUtils.DataType.FLOAT_VEC2:
        case deqpUtils.DataType.INT_VEC2:
        case deqpUtils.DataType.UINT_VEC2:
        case deqpUtils.DataType.BOOL_VEC2: return 2 * deqpUtils.deUint32_size;

        case deqpUtils.DataType.FLOAT_VEC3:
        case deqpUtils.DataType.INT_VEC3:
        case deqpUtils.DataType.UINT_VEC3:
        case deqpUtils.DataType.BOOL_VEC3:    // Fall-through to vec4

        case deqpUtils.DataType.FLOAT_VEC4:
        case deqpUtils.DataType.INT_VEC4:
        case deqpUtils.DataType.UINT_VEC4:
        case deqpUtils.DataType.BOOL_VEC4: return 4 * deqpUtils.deUint32_size;

        default:
            testFailedOptions('', false);
            return 0;
    }
};

/**
 * getDataTypeArrayStride
 * @param {deqpUtils.DataType} type
 * @return {number}
 */
var getDataTypeArrayStride = function(type) {
    assertMsgOptions(!deqpUtils.isDataTypeMatrix(type), 'Must not be a Matrix type', false, true);

    /** @type {number} */ var baseStride = getDataTypeByteSize(type);
    /** @type {number} */ var vec4Alignment = deqpUtils.deUint32_size * 4;

    assertMsgOptions(baseStride <= vec4Alignment, 'Checking alignment is correct', false, true);
    return Math.max(baseStride, vec4Alignment); // Really? See rule 4.
};

/**
 * deRoundUp32 Rounds up 'a' in case the
 * relationship with 'b' has a decimal part.
 * @param {number} a
 * @param {number} b
 * @return {number}
 */
var deRoundUp32 = function(a, b)
{
    var d = Math.trunc(a / b);
    return d * b == a ? a : (d + 1) * b;
};

/**
 * TODO: computeStd140BaseAlignment
 * @param {glsVT.VarType} type
 * @return {number}
 */
var computeStd140BaseAlignment = function(type) {
    /** @type {number} */ var vec4Alignment = deqpUtils.deUint32_size;

    if (type.isBasicType())
    {
        /** @type {deqpUtils.DataType} */ var basicType = type.getBasicType();

        if (deqpUtils.isDataTypeMatrix(basicType))
        {
            /** @type {boolean} */ var isRowMajor = !!(type.getFlags() & UniformFlags.LAYOUT_ROW_MAJOR);
            /** @type {boolean} */ var vecSize = isRowMajor ? deqpUtils.getDataTypeMatrixNumColumns(basicType) :
                deqpUtils.getDataTypeMatrixNumRows(basicType);

            return getDataTypeArrayStride(deqpUtils.getDataTypeFloatVec(vecSize));
        }
        else
            return getDataTypeByteAlignment(basicType);
    }
    else if (type.isArrayType())
    {
        /** @type {number} */ var elemAlignment = computeStd140BaseAlignment(type.getElementType());

        // Round up to alignment of vec4
        return deRoundUp32(elemAlignment, vec4Alignment);
    }
    else
    {
        assertMsgOptions(type.isStructType(), 'computeStd140BaseAlignment: Checking that the type is a structure', false, true);

        /** @type {number} */ var maxBaseAlignment = 0;

        for (var memberNdx = 0; memberNdx < type.getStruct().getSize(); memberNdx++)
            /** @type {StructMember} */ var memberIter = type.getStruct().getMember(memberNdx);
            maxBaseAlignment = Math.max(maxBaseAlignment, computeStd140BaseAlignment(memberIter.getType()));

        return deRoundUp32(maxBaseAlignment, vec4Alignment);
    }
};

/**
 * mergeLayoutflags
 * @param {deInt32.deUint32} prevFlags
 * @param {deInt32.deUint32} newFlags
 * @return {deInt32.deUint32}
 */
var mergeLayoutFlags = function(prevFlags, newFlags)
{
    /** @type {deInt32.deUint32} */ var packingMask = UniformLayout.LAYOUT_PACKED | UniformLayout.LAYOUT_SHARED | UniformLayout.LAYOUT_STD140;
    /** @type {deInt32.deUint32} */ var matrixMask = UniformLayout.LAYOUT_ROW_MAJOR | UniformLayout.LAYOUT_COLUMN_MAJOR;

    /** @type {deInt32.deUint32} */ var mergedFlags = 0;

    mergedFlags |= ((newFlags & packingMask) ? newFlags : prevFlags) & packingMask;
    mergedFlags |= ((newFlags & matrixMask) ? newFlags : prevFlags) & matrixMask;

    return mergedFlags;
};

/**
 * computeStd140Layout_B
 * @param {UniformLayout} layout
 * @param {number} curOffset
 * @param {number} curBlockNdx
 * @param {string} curPrefix
 * @param {glsVT.VarType} type
 * @param {deInt32.deUint32} layoutFlags
 */
var computeStd140Layout_B = function(layout, curOffset, curBlockNdx, curPrefix, type, layoutFlags)
{
    /** @type {number} */ var baseAlignment = computeStd140BaseAlignment(type);

    curOffset = deInt32.deAlign32(curOffset, baseAlignment);

    if (type.isBasicType())
    {
        /** @type {deqpUtils.DataType} */ var basicType = type.getBasicType();
        /** @type {UniformLayoutEntry} */ var entry = new UniformLayoutEntry();

        entry.name = curPrefix;
        entry.type = basicType;
        entry.size = 1;
        entry.arrayStride = 0;
        entry.matrixStride = 0;
        entry.blockNdx = curBlockNdx;

        if (deqpUtils.isDataTypeMatrix(basicType))
        {
            // Array of vectors as specified in rules 5 & 7.
            /** @type {boolean} */ var isRowMajor = !!(layoutFlags & UniformFlags.LAYOUT_ROW_MAJOR);
            /** @type {number} */ var vecSize = isRowMajor ? deqpUtils.getDataTypeMatrixNumColumns(basicType) :
                                             deqpUtils.getDataTypeMatrixNumRows(basicType);
            /** @type {number} */ var numVecs = isRowMajor ? deqpUtils.getDataTypeMatrixNumRows(basicType) :
                                             deqpUtils.getDataTypeMatrixNumColumns(basicType);
            /** @type {number} */ var stride = getDataTypeArrayStride(deqpUtils.getDataTypeFloatVec(vecSize));

            entry.offset = curOffset;
            entry.matrixStride = stride;
            entry.isRowMajor = isRowMajor;

            curOffset += numVecs * stride;
        }
        else
        {
            // Scalar or vector.
            entry.offset = curOffset;

            curOffset += getDataTypeByteSize(basicType);
        }

        layout.uniforms.push(entry);
    }
    else if (type.isArrayType())
    {
        /** @type {glsVT.VarType} */ var elemType = type.getElementType();

        if (elemType.isBasicType() && !deqpUtils.isDataTypeMatrix(elemType.getBasicType()))
        {
            // Array of scalars or vectors.
            /** @type {deqpUtils.DataType} */ var elemBasicType = elemType.getBasicType();
            /** @type {UniformLayoutEntry} */ var entry = new UniformLayoutEntry();
            /** @type {number} */ var stride = getDataTypeArrayStride(elemBasicType);

            entry.name = curPrefix + '[0]'; // Array uniforms are always postfixed with [0]
            entry.type = elemBasicType;
            entry.blockNdx = curBlockNdx;
            entry.offset = curOffset;
            entry.size = type.getArraySize();
            entry.arrayStride = stride;
            entry.matrixStride = 0;

            curOffset += stride * type.getArraySize();

            layout.uniforms.push(entry);
        }
        else if (elemType.isBasicType() && deqpUtils.isDataTypeMatrix(elemType.getBasicType()))
        {
            // Array of matrices.
            /** @type {deqpUtils.DataType} */ var elemBasicType = elemType.getBasicType();
            /** @type {boolean} */ var isRowMajor = !!(layoutFlags & UniformFlags.LAYOUT_ROW_MAJOR);
            /** @type {number} */ var vecSize = isRowMajor ? deqpUtils.getDataTypeMatrixNumColumns(elemBasicType) :
                                                                      deqpUtils.getDataTypeMatrixNumRows(elemBasicType);
            /** @type {number} */ var numVecs = isRowMajor ? deqpUtils.getDataTypeMatrixNumRows(elemBasicType) :
                                                                      deqpUtils.getDataTypeMatrixNumColumns(elemBasicType);
            /** @type {number} */ var stride = getDataTypeArrayStride(deqpUtils.getDataTypeFloatVec(vecSize));
            /** @type {UniformLayoutEntry} */ var entry = new UniformLayoutEntry();

            entry.name = curPrefix + '[0]'; // Array uniforms are always postfixed with [0]
            entry.type = elemBasicType;
            entry.blockNdx = curBlockNdx;
            entry.offset = curOffset;
            entry.size = type.getArraySize();
            entry.arrayStride = stride * numVecs;
            entry.matrixStride = stride;
            entry.isRowMajor = isRowMajor;

            curOffset += numVecs * type.getArraySize() * stride;

            layout.uniforms.push(entry);
        }
        else
        {
            assertMsgOptions(elemType.isStructType() || elemType.isArrayType(), 'computeStd140Layout_B: Checking that the type is a structure or an array', false, true);

            for (var elemNdx = 0; elemNdx < type.getArraySize(); elemNdx++)
                computeStd140Layout_B(layout, curOffset, curBlockNdx, curPrefix + '[' + elemNdx + ']', type.getElementType(), layoutFlags);
        }
    }
    else
    {
        assertMsgOptions(type.isStructType(), 'computeStd140Layout_B: Checking that the type is a structure', false, true);

        for (var memberNdx = 0; memberNdx < type.getStruct().getSize(); memberNdx++) {
            /** @type {StructMember} */ var memberIter = type.getStruct().getMember(memberNdx);
            computeStd140Layout_B(layout, curOffset, curBlockNdx, curPrefix + '.' + memberIter.getName(), memberIter.getType(), layoutFlags);
        }

        curOffset = deInt32.deAlign32(curOffset, baseAlignment);
    }
};

/**
 * computeStd140Layout
 * @param {UniformLayout} layout
 * @param {ShaderInterface} sinterface
 */
var computeStd140Layout = function(layout, sinterface)
{
    // \todo [2012-01-23 pyry] Uniforms in default block.

    /** @type {number} */ var numUniformBlocks = sinterface.getNumUniformBlocks();

    for (var blockNdx = 0; blockNdx < numUniformBlocks; blockNdx++)
    {
        /** @type {UniformBlock} */ var block = sinterface.getUniformBlock(blockNdx);
        /** @type {boolean} */ var hasInstanceName = block.getInstanceName() !== undefined;
        /** @type {string} */ var blockPrefix = hasInstanceName ? (block.getBlockName() + '.') : '';
        /** @type {number} */ var curOffset = 0;
        /** @type {number} */ var activeBlockNdx = layout.blocks.length;
        /** @type {number} */ var firstUniformNdx = layout.uniforms.length;

        for (var ubNdx = 0; ubNdx < block.countUniforms(); ubNdx++)
        {
            /** @type {Uniform} */ var uniform = block.getUniform(ubNdx);
            computeStd140Layout_B(layout, curOffset, activeBlockNdx, blockPrefix + uniform.getName(), uniform.getType(), mergeLayoutFlags(block.getFlags(), uniform.getFlags()));
        }

        /** @type {number} */ var uniformIndicesEnd = layout.uniforms.length;
        /** @type {number} */ var blockSize = curOffset;
        /** @type {number} */ var numInstances = block.isArray() ? block.getArraySize() : 1;

        // Create block layout entries for each instance.
        for (var instanceNdx = 0; instanceNdx < numInstances; instanceNdx++)
        {
            // Allocate entry for instance.
            layout.blocks.push(BlockLayoutEntry());
            /** @type {BlockLayoutEntry} */ var blockEntry = layout.blocks[layout.blocks.length - 1];

            blockEntry.name = block.getBlockName();
            blockEntry.size = blockSize;

            // Compute active uniform set for block.
            for (var uniformNdx = firstUniformNdx; uniformNdx < uniformIndicesEnd; uniformNdx++)
                blockEntry.activeUniformIndices.push(uniformNdx);

            if (block.isArray())
                blockEntry.name += '[' + instanceNdx + ']';
        }
    }
};

/**
 * generateValue - Value generator
 * @param {UniformLayoutEntry} entry
 * @param {Uint8Array} basePtr
 * @param {deRandom.Random} rnd
 */
var generateValue = function(entry, basePtr, rnd)
{
    /** @type {deqpUtils.DataType}*/ var scalarType = deqpUtils.getDataTypeScalarType(entry.type);
    /** @type {number} */ var scalarSize = deqpUtils.getDataTypeScalarSize(entry.type);
    /** @type {boolean} */ var isMatrix = deqpUtils.isDataTypeMatrix(entry.type);
    /** @type {number} */ var numVecs = isMatrix ? (entry.isRowMajor ? deqpUtils.getDataTypeMatrixNumRows(entry.type) : deqpUtils.getDataTypeMatrixNumColumns(entry.type)) : 1;
    /** @type {number} */ var vecSize = scalarSize / numVecs;
    /** @type {boolean} */ var isArray = entry.size > 1;
    /** @type {number} */ var compSize = deqpUtils.deUint32_size;

    assertMsgOptions(scalarSize % numVecs == 0, 'generateValue: Checking that the scalar size is coherent with the vectors', false, true);

    for (var elemNdx = 0; elemNdx < entry.size; elemNdx++)
    {
        /** @type {Uint8Array} */ var elemPtr = basePtr.subset(entry.offset + (isArray ? elemNdx * entry.arrayStride : 0)); //(deUint8*)basePtr + entry.offset + (isArray ? elemNdx*entry.arrayStride : 0);

        for (var vecNdx = 0; vecNdx < numVecs; vecNdx++)
        {
            /** @type {Uint8Array} */ var vecPtr = elemPtr.subset(isMatrix ? vecNdx * entry.matrixStride : 0);

            for (var compNdx = 0; compNdx < vecSize; compNdx++)
            {
                /** @type {Uint8Array} */ var compPtr = vecPtr.subset(compSize * compNdx);
                /** @type {number} */ var _random;

                switch (scalarType)
                {
                    case deqpUtils.FLOAT: _random = rnd.getInt(-9, 9); break;
                    case deqpUtils.INT: _random = rnd.getInt(-9, 9); break;
                    case deqpUtils.UINT: _random = rnd.getInt(0, 9); break;
                    // \note Random bit pattern is used for true values. Spec states that all non-zero values are
                    //       interpreted as true but some implementations fail this.
                    case deqpUtils.BOOL: _random = rnd.getBool() ? 1 : 0; break;
                    default:
                        testFailedOptions('generateValue: Invalid type', true);
                }

                //Copy the random data byte per byte.
                var _size = deqpUtils.getDataTypeScalarSize(scalarType);
                for (var compNdx = 0; compNdx < _size; compNdx++)
                    compPtr[compNdx] = (_random >> (8 * compNdx)) & 0xF;
            }
        }
    }
};

/**
 * generateValues
 * @param {UniformLayout} layout
 * @param {BlockPointers} blockPointers
 * @param {deInt32.deUint32} seed
 */
var generateValues = function(layout, blockPointers, seed)
{
    /** @type  {deRandom.Random} */ var rnd = new deRandom.Random(seed);
    /** @type  {number} */ var numBlocks = layout.blocks.length;

    for (var blockNdx = 0; blockNdx < numBlocks; blockNdx++)
    {
        /** @type {Uint8Array} */ var basePtr = blockPointers.find(blockNdx);
        /** @type  {number} */ var numEntries = layout.blocks[blockNdx].activeUniformIndices.length;

        for (var entryNdx = 0; entryNdx < numEntries; entryNdx++)
        {
            /** @type {UniformLayoutEntry} */ var entry = layout.uniforms[layout.blocks[blockNdx].activeUniformIndices[entryNdx]];
            generateValue(entry, basePtr, rnd);
        }
    }
};

 /**
  * TODO: iterate
  * @return {IterateResult}
  */
 UniformBlockCase.prototype.iterate = function() {
    /** @type {UniformLayout} */ var refLayout = new UniformLayout(); //!< std140 layout.
    /** @type {BlockPointers} */ var blockPointers = new BlockPointers();

    // Initialize result to pass. TODO: Check how this works already in JS
    //m_testCtx.setTestResult(UniformFlags.QP_TEST_RESULT_PASS, "Pass");

    // Compute reference layout.
    computeStd140Layout(refLayout, this.m_interface);

    // Assign storage for reference values.
    {
        /** @type {number} */ var totalSize = 0;
        for (var blockNdx = 0; blockNdx < refLayout.blocks.length; blockNdx++) // BlockLayoutEntrvector<BlockLayoutEntry>::const_iterator blockIter = refLayout.blocks.begin(); blockIter != refLayout.blocks.end(); blockIter++)
        {
            /** @type {BlockLayoutEntry} */ var blockIter = refLayout.blocks[blockNdx];
            totalSize += blockIter.size;
        }
        blockPointers.resize(totalSize);

        // Pointers for each block.
        var curOffset = 0;
        for (var blockNdx = 0; blockNdx < refLayout.blocks.length; blockNdx++)
        {
            var size = refLayout.blocks[blockNdx].size;
            blockPointers.push(curOffset, size);
            curOffset += size;
        }
    }

    // // Generate values.
    // generateValues(refLayout, blockPointers, 1 /* seed */);
};
//     // Generate shaders and build program.
//     std::ostringstream vtxSrc;
//     std::ostringstream fragSrc;
//
//     generateVertexShader(vtxSrc, m_glslVersion, m_interface, refLayout, blockPointers);
//     generateFragmentShader(fragSrc, m_glslVersion, m_interface, refLayout, blockPointers);
//
//     glu::ShaderProgram program(m_renderCtx, glu::makeVtxFragSources(vtxSrc.str(), fragSrc.str()));
//     log << program;
//
//     if (!program.isOk())
//     {
//         // Compile failed.
//         m_testCtx.setTestResult(QP_TEST_RESULT_FAIL, "Compile failed");
//         return STOP;
//     }
//
//     // Query layout from GL.
//     UniformLayout glLayout;
//     getGLUniformLayout(gl, glLayout, program.getProgram());
//
//     // Print layout to log.
//     log << TestLog::Section("ActiveUniformBlocks", "Active Uniform Blocks");
//     for (int blockNdx = 0; blockNdx < (int)glLayout.blocks.size(); blockNdx++)
//         log << TestLog::Message << blockNdx << ": " << glLayout.blocks[blockNdx] << TestLog::EndMessage;
//     log << TestLog::EndSection;
//
//     log << TestLog::Section("ActiveUniforms", "Active Uniforms");
//     for (int uniformNdx = 0; uniformNdx < (int)glLayout.uniforms.size(); uniformNdx++)
//         log << TestLog::Message << uniformNdx << ": " << glLayout.uniforms[uniformNdx] << TestLog::EndMessage;
//     log << TestLog::EndSection;
//
//     // Check that we can even try rendering with given layout.
//     if (!checkLayoutIndices(glLayout) || !checkLayoutBounds(glLayout) || !compareTypes(refLayout, glLayout))
//     {
//         m_testCtx.setTestResult(QP_TEST_RESULT_FAIL, "Invalid layout");
//         return STOP; // It is not safe to use the given layout.
//     }
//
//     // Verify all std140 blocks.
//     if (!compareStd140Blocks(refLayout, glLayout))
//         m_testCtx.setTestResult(QP_TEST_RESULT_FAIL, "Invalid std140 layout");
//
//     // Verify all shared blocks - all uniforms should be active, and certain properties match.
//     if (!compareSharedBlocks(refLayout, glLayout))
//         m_testCtx.setTestResult(QP_TEST_RESULT_FAIL, "Invalid shared layout");
//
//     // Check consistency with index queries
//     if (!checkIndexQueries(program.getProgram(), glLayout))
//         m_testCtx.setTestResult(QP_TEST_RESULT_FAIL, "Inconsintent block index query results");
//
//     // Use program.
//     gl.useProgram(program.getProgram());
//
//     // Assign binding points to all active uniform blocks.
//     for (int blockNdx = 0; blockNdx < (int)glLayout.blocks.size(); blockNdx++)
//     {
//         deUint32 binding = (deUint32)blockNdx; // \todo [2012-01-25 pyry] Randomize order?
//         gl.uniformBlockBinding(program.getProgram(), (deUint32)blockNdx, binding);
//     }
//
//     GLU_EXPECT_NO_ERROR(gl.getError(), "Failed to set uniform block bindings");
//
//     // Allocate buffers, write data and bind to targets.
//     UniformBufferManager bufferManager(m_renderCtx);
//     if (m_bufferMode == BUFFERMODE_PER_BLOCK)
//     {
//         int                            numBlocks            = (int)glLayout.blocks.size();
//         vector<vector<deUint8> >    glData                (numBlocks);
//         map<int, void*>                glBlockPointers;
//
//         for (int blockNdx = 0; blockNdx < numBlocks; blockNdx++)
//         {
//             glData[blockNdx].resize(glLayout.blocks[blockNdx].size);
//             glBlockPointers[blockNdx] = &glData[blockNdx][0];
//         }
//
//         copyUniformData(glLayout, glBlockPointers, refLayout, blockPointers);
//
//         for (int blockNdx = 0; blockNdx < numBlocks; blockNdx++)
//         {
//             deUint32    buffer    = bufferManager.allocBuffer();
//             deUint32    binding    = (deUint32)blockNdx;
//
//             gl.bindBuffer(GL_UNIFORM_BUFFER, buffer);
//             gl.bufferData(GL_UNIFORM_BUFFER, (glw::GLsizeiptr)glData[blockNdx].size(), &glData[blockNdx][0], GL_STATIC_DRAW);
//             GLU_EXPECT_NO_ERROR(gl.getError(), "Failed to upload uniform buffer data");
//
//             gl.bindBufferBase(GL_UNIFORM_BUFFER, binding, buffer);
//             GLU_EXPECT_NO_ERROR(gl.getError(), "glBindBufferBase(GL_UNIFORM_BUFFER) failed");
//         }
//     }
//     else
//     {
//         DE_ASSERT(m_bufferMode == BUFFERMODE_SINGLE);
//
//         int                totalSize            = 0;
//         int                curOffset            = 0;
//         int                numBlocks            = (int)glLayout.blocks.size();
//         int                bindingAlignment    = 0;
//         map<int, int>    glBlockOffsets;
//
//         gl.getIntegerv(GL_UNIFORM_BUFFER_OFFSET_ALIGNMENT, &bindingAlignment);
//
//         // Compute total size and offsets.
//         curOffset = 0;
//         for (int blockNdx = 0; blockNdx < numBlocks; blockNdx++)
//         {
//             if (bindingAlignment > 0)
//                 curOffset = deRoundUp32(curOffset, bindingAlignment);
//             glBlockOffsets[blockNdx] = curOffset;
//             curOffset += glLayout.blocks[blockNdx].size;
//         }
//         totalSize = curOffset;
//
//         // Assign block pointers.
//         vector<deUint8>    glData(totalSize);
//         map<int, void*>    glBlockPointers;
//
//         for (int blockNdx = 0; blockNdx < numBlocks; blockNdx++)
//             glBlockPointers[blockNdx] = &glData[glBlockOffsets[blockNdx]];
//
//         // Copy to gl format.
//         copyUniformData(glLayout, glBlockPointers, refLayout, blockPointers);
//
//         // Allocate buffer and upload data.
//         deUint32 buffer = bufferManager.allocBuffer();
//         gl.bindBuffer(GL_UNIFORM_BUFFER, buffer);
//         if (!glData.empty())
//             gl.bufferData(GL_UNIFORM_BUFFER, (glw::GLsizeiptr)glData.size(), &glData[0], GL_STATIC_DRAW);
//
//         GLU_EXPECT_NO_ERROR(gl.getError(), "Failed to upload uniform buffer data");
//
//         // Bind ranges to binding points.
//         for (int blockNdx = 0; blockNdx < numBlocks; blockNdx++)
//         {
//             deUint32 binding = (deUint32)blockNdx;
//             gl.bindBufferRange(GL_UNIFORM_BUFFER, binding, buffer, (glw::GLintptr)glBlockOffsets[blockNdx], (glw::GLsizeiptr)glLayout.blocks[blockNdx].size);
//             GLU_EXPECT_NO_ERROR(gl.getError(), "glBindBufferRange(GL_UNIFORM_BUFFER) failed");
//         }
//     }
//
//     bool renderOk = render(program.getProgram());
//     if (!renderOk)
//         m_testCtx.setTestResult(QP_TEST_RESULT_FAIL, "Image compare failed");
//
//     return STOP;
// };

/**
* compareStd140Blocks
* @param {UniformLayout} refLayout
* @param {UniformLayout} cmpLayout
**/
UniformBlockCase.prototype.compareStd140Blocks = function(refLayout, cmpLayout) {
    /**@type {boolean} */ var isOk = true;
    /**@type {number} */ var numBlocks = this.m_interface.getNumUniformBlocks();

    for (var blockNdx = 0; blockNdx < numBlocks; blockNdx++)
    {
        /**@type {UniformLayout} */ var block = this.m_interface.getUniformBlock(blockNdx);
        /**@type {boolean} */ var isArray = block.isArray();
        /**@type {UniformLayout} */ var instanceName = block.getBlockName() + (isArray ? '[0]' : '');
        /**@type {number} */ var refBlockNdx = refLayout.getBlockIndex(instanceName);
        /**@type {number} */ var cmpBlockNdx = cmpLayout.getBlockIndex(instanceName.c_str());
        /**@type {boolean} */ var isUsed = (block.getFlags() & (UniformFlags.DECLARE_VERTEX | UniformFlags.DECLARE_FRAGMENT)) != 0;

        if ((block.getFlags() & UniformFlags.LAYOUT_STD140) == 0)
            continue; // Not std140 layout.

        assertMsgOptions(refBlockNdx >= 0, 'Validating reference block index', false, true);

        if (cmpBlockNdx < 0)
        {
            // Not found, should it?
            if (isUsed)
            {
                bufferedLogToConsole("Error: Uniform block '" + instanceName + "' not found");
                isOk = false;
            }

            continue; // Skip block.
        }

        /** @type {BlockLayoutEntry} */ var refBlockLayout = refLayout.blocks[refBlockNdx];
        /** @type {BlockLayoutEntry} */ var cmpBlockLayout = cmpLayout.blocks[cmpBlockNdx];

        // \todo [2012-01-24 pyry] Verify that activeUniformIndices is correct.
        // \todo [2012-01-24 pyry] Verify all instances.
        if (refBlockLayout.activeUniformIndices.length != cmpBlockLayout.activeUniformIndices.length)
        {
            bufferedLogToConsole("Error: Number of active uniforms differ in block '" + instanceName +
                "' (expected " + refBlockLayout.activeUniformIndices.length +
                ', got ' + cmpBlockLayout.activeUniformIndices.length +
                ')');
            isOk = false;
        }

        for (var ndx = 0; ndx < refBlockLayout.activeUniformIndices.length; ndx++)
        {
            /** @type {number} */ var ndxIter = refBlockLayout.activeUniformIndices[ndx];
            /** @type {UniformLayoutEntry} */ var refEntry = refLayout.uniforms[ndxIter];
            /** @type {number} */ var cmpEntryNdx = cmpLayout.getUniformIndex(refEntry.name);

            if (cmpEntryNdx < 0)
            {
                bufferedLogToConsole("Error: Uniform '" + refEntry.name + "' not found");
                isOk = false;
                continue;
            }

            /** @type {UniformLayoutEntry} */ var cmpEntry = cmpLayout.uniforms[cmpEntryNdx];

            if (refEntry.type != cmpEntry.type ||
                refEntry.size != cmpEntry.size ||
                refEntry.offset != cmpEntry.offset ||
                refEntry.arrayStride != cmpEntry.arrayStride ||
                refEntry.matrixStride != cmpEntry.matrixStride ||
                refEntry.isRowMajor != cmpEntry.isRowMajor)
            {
                bufferedLogToConsole("Error: Layout mismatch in '" + refEntry.name + "':\n" +
                '  expected: type = ' + deqpUtils.getDataTypeName(refEntry.type) + ', size = ' + refEntry.size + ', row major = ' + (refEntry.isRowMajor ? 'true' : 'false') + '\n' +
                '  got: type = ' + deqpUtils.getDataTypeName(cmpEntry.type) + ', size = ' + cmpEntry.size + ', row major = ' + (cmpEntry.isRowMajor ? 'true' : 'false'));
                isOk = false;
            }
        }
    }

    return isOk;
};

/**
* compareSharedBlocks
* @param {UniformLayout} refLayout
* @param {UniformLayout} cmpLayout
**/
UniformBlockCase.prototype.compareSharedBlocks = function(refLayout, cmpLayout) {
    /** @type {boolean} */ var isOk = true;
    /** @type {number} */ var numBlocks = this.m_interface.getNumUniformBlocks();

    for (var blockNdx = 0; blockNdx < numBlocks; blockNdx++)
    {
        /** @type {UniformBlock} */ var block = this.m_interface.getUniformBlock(blockNdx);
        /** @type {boolean} */ var isArray = block.isArray();
        /** @type {string} */ var instanceName = block.getBlockName() + (isArray ? '[0]' : '');
        /** @type {number} */ var refBlockNdx = refLayout.getBlockIndex(instanceName);
        /** @type {number} */ var cmpBlockNdx = cmpLayout.getBlockIndex(instanceName);
        /** @type {boolean} */ var isUsed = (block.getFlags() & (UniformFlags.DECLARE_VERTEX | UniformFlags.DECLARE_FRAGMENT)) != 0;

        if ((block.getFlags() & UniformFlags.LAYOUT_SHARED) == 0)
            continue; // Not shared layout.

        assertMsgOptions(refBlockNdx >= 0, 'Validating reference block index', false, true);

        if (cmpBlockNdx < 0)
        {
            // Not found, should it?
            if (isUsed)
            {
                bufferedLogToConsole("Error: Uniform block '" + instanceName + "' not found");
                isOk = false;
            }

            continue; // Skip block.
        }

        /** @type {BlockLayoutEntry} */ var refBlockLayout = refLayout.blocks[refBlockNdx];
        /** @type {BlockLayoutEntry} */ var cmpBlockLayout = cmpLayout.blocks[cmpBlockNdx];

        if (refBlockLayout.activeUniformIndices.length != cmpBlockLayout.activeUniformIndices.length)
        {
            bufferedLogToConsole("Error: Number of active uniforms differ in block '" + instanceName +
                "' (expected " + refBlockLayout.activeUniformIndices.length +
                ', got ' + cmpBlockLayout.activeUniformIndices.length +
                ')');
            isOk = false;
        }

        for (var ndx = 0; ndx < refBlockLayout.activeUniformIndices.length; ndx++)
        {
            /** @type {number} */ var ndxIter = refBlockLayout.activeUniformIndices[ndx];
            /** @type {UniformLayoutEntry} */ var refEntry = refLayout.uniforms[ndxIter];
            /** @type {number} */ var cmpEntryNdx = cmpLayout.getUniformIndex(refEntry.name);

            if (cmpEntryNdx < 0)
            {
                bufferedLogToConsole("Error: Uniform '" + refEntry.name + "' not found");
                isOk = false;
                continue;
            }

            /** @type {UniformLayoutEntry} */ var cmpEntry = cmpLayout.uniforms[cmpEntryNdx];

            if (refEntry.type != cmpEntry.type ||
                refEntry.size != cmpEntry.size ||
                refEntry.isRowMajor != cmpEntry.isRowMajor)
            {
                bufferedLogToConsole("Error: Layout mismatch in '" + refEntry.name + "':\n" +
                '  expected: type = ' + deqpUtils.getDataTypeName(refEntry.type) + ', size = ' + refEntry.size + ', row major = ' + (refEntry.isRowMajor ? 'true' : 'false') + '\n' +
                '  got: type = ' + deqpUtils.getDataTypeName(cmpEntry.type) + ', size = ' + cmpEntry.size + ', row major = ' + (cmpEntry.isRowMajor ? 'true' : 'false'));
                isOk = false;
            }
        }
    }

    return isOk;
};

/** compareTypes
* @param {UniformLayout} refLayout
* @param {UniformLayout} cmpLayout
* @return {boolean} true if uniform types are the same
**/
UniformBlockCase.prototype.compareTypes = function(refLayout, cmpLayout) {
    /** @type {boolean} */ var isOk = true;
    /** @type {number} */ var numBlocks = this.m_interface.getNumUniformBlocks();

    for (var blockNdx = 0; blockNdx < numBlocks; blockNdx++)
    {
        /** @type {UniformBlock} */ var block = this.m_interface.getUniformBlock(blockNdx);
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
UniformBlockCase.prototype.checkLayoutIndices = function(layout) {
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
UniformBlockCase.prototype.checkLayoutBounds = function(layout) {
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
UniformBlockCase.prototype.checkIndexQueries = function(program, layout) {
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
UniformBlockCase.prototype.render = function(program) {
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
        assertMsgOptions(gl.getError() === gl.NO_ERROR, 'Reading pixels', false, true);

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

/** TODO: Substitute init, execute and runTestCases for the proper methods.
 * Initialize a test case
 */
// var init = function() {
//     // Init context
//     var wtu = WebGLTestUtils;
//     gl = wtu.create3DContext('canvas', {preserveDrawingBuffer: true});
//
//     canvas = document.getElementById('canvas');
//
//     if (!gl)
//     {
//         testFailed('Not able to create context', true);
//     }
//     // Create shaders
//     var vsource = deqpProgram.genVertexSource(getShaderSource('shader-vs'));
//     var fsource = deqpProgram.genFragmentSource(getShaderSource('shader-fs'));
//
//     var programSources = {sources: [vsource, fsource]};
//
//     program = new deqpProgram.ShaderProgram(gl, programSources);
//     gl.useProgram(program.getProgram());
// };
//
// /**
//  * Execute a test case
//  * @return {bool} True if test case passed
//  */
// var execute = function()
// {
//     //assertMsgOptions(render(program), 'Verify pixels', true, true);
//
//     // Code for testing TODO: Remove it
//     var layout = new UniformLayout();
//     var block = new BlockLayoutEntry();
//     block.name = 'one';
//     block.activeUniformIndices.push(1);
//     block.activeUniformIndices.push(0);
//     layout.blocks.push(block);
//     block = new BlockLayoutEntry();
//     block.name = 'two';
//     block.activeUniformIndices.push(0);
//     block.activeUniformIndices.push(1);
//     layout.blocks.push(block);
//
//     var blockndx = layout.getBlockIndex('two');
//     alert(blockndx);
//
//     var uniform = new UniformLayoutEntry();
//     uniform.name = 'one';
//     uniform.blockNdx = 1;
//     layout.uniforms.push(uniform);
//     uniform = new UniformLayoutEntry();
//     uniform.name = 'two';
//     uniform.blockNdx = 0;
//     layout.uniforms.push(uniform);
//
//     var uniformndx = layout.getUniformIndex('one');
//     alert(uniformndx);
//
//     var correctLayout = this.checkLayoutIndices(layout);
//     alert('Indices are ' + (correctLayout ? 'correct!' : 'incorrect :('));
// };
//
// var runTestCases = function() {
//     try {
//         init();
//         execute();
//     } catch (err) {
//         bufferedLogToConsole(err);
//     }
//     deqpTests.runner.terminate();
// };

return {
    UniformBlockCase: UniformBlockCase,
    ShaderInterface: ShaderInterface,
    UniformBlock: UniformBlock,
    Uniform: Uniform,
    StructType: StructType,
    StructMember: StructMember,
    UniformLayout: UniformLayout,
    UniformLayoutEntry: UniformLayoutEntry,
    BlockLayoutEntry: BlockLayoutEntry,
    UniformFlags: UniformFlags,
    BufferMode: BufferMode
};

});


