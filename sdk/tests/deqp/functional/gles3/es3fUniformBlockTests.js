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
/*'framework/opengl/gluDrawUtil', ... deqpDraw, */
define(['framework/opengl/gluShaderUtil', 'modules/shared/glsUniformBlockCase', 'framework/common/tcuTestCase', 'framework/delibs/debase/deInt32'], function(deqpUtils, glsUBC, deqpTests, deInt32) {
    'use strict';

    /** @const @type {number} */ var VIEWPORT_WIDTH = 128;
    /** @const @type {number} */ var VIEWPORT_HEIGHT = 128;

    /** @const @type {deqpTests.DeqpTest} */ var testGroup = deqpTests.newTest('ubo', 'Uniform Block tests', null);

    /**
     * BlockBasicTypeCase constructor
     * @param {string} name The name of the test
     * @param {string} description The description of the test
     * @param {glsUBC.VarType} type The type of the block
     * @param {glsUBC.UniformLayout} layoutFlags
     * @param {number} numInstances
     */
    var BlockBasicTypeCase = function(name, description, type, layoutFlags, numInstances) {
        glsUBC.UniformBlockCase.call(this, name, description, glsUBC.BufferMode.BUFFERMODE_PER_BLOCK);
        /** @type {glsUBC.UniformBlock}*/ var block = this.m_interface.allocBlock('Block');
        block.addUniform(new glsUBC.Uniform('var', type, 0));
        block.setFlags(layoutFlags);

        if (numInstances > 0)
        {
            block.setArraySize(numInstances);
            block.setInstanceName('block');
        }
    };

    BlockBasicTypeCase.prototype = Object.create(glsUBC.UniformBlockCase.prototype);
    BlockBasicTypeCase.prototype.constructor = BlockBasicTypeCase;

    var createBlockBasicTypeCases = function(group, name, type, layoutFlags, numInstances) {
        group.addChild(new BlockBasicTypeCase(name + '_vertex', '', type, layoutFlags | glsUBC.UniformFlags.DECLARE_VERTEX, numInstances));
        group.addChild(new BlockBasicTypeCase(name + '_fragment', '', type, layoutFlags | glsUBC.UniformFlags.DECLARE_FRAGMENT, numInstances));

        //alert(group.spec[0].m_instance);
        if (!(layoutFlags & glsUBC.UniformFlags.LAYOUT_PACKED))
            group.addChild(new BlockBasicTypeCase(name + '_both', '', type, layoutFlags | glsUBC.UniformFlags.DECLARE_VERTEX | glsUBC.UniformFlags.DECLARE_FRAGMENT, numInstances));
    };

    /**
     * BlockSingleStructCase constructor
     * @param {string} name The name of the test
     * @param {string} description The description of the test
     * @param {deInt32.deUint32} layoutFlags
     * @param {glsUBC.BufferMode} bufferMode
     * @param {number} numInstances
     */
    var BlockSingleStructCase = function(name, description, layoutFlags, bufferMode, numInstances) {
        glsUBC.UniformBlockCase.call(this, name, description, bufferMode);
        this.m_layoutFlags = layoutFlags;
        this.m_numInstances = numInstances;
    };

    BlockSingleStructCase.prototype = Object.create(glsUBC.UniformBlockCase.prototype);
    BlockSingleStructCase.prototype.constructor = BlockSingleStructCase;

    BlockSingleStructCase.prototype.init = function() {
        /**@type {glsUBC.StructType}*/ var typeS = this.m_interface.allocStruct('S');
        typeS.addMember('a', new glsUBC.VarType().VarTypeBasic(deqpUtils.DataType.INT_VEC3, glsUBC.UniformFlags.PRECISION_HIGH), glsUBC.UniformFlags.UNUSED_BOTH); // First member is unused.
        typeS.addMember('b', new glsUBC.VarType().VarTypeArray(new glsUBC.VarType().VarTypeBasic(deqpUtils.DataType.FLOAT_MAT3, glsUBC.UniformFlags.PRECISION_MEDIUM), 4));
        typeS.addMember('c', new glsUBC.VarType().VarTypeBasic(deqpUtils.DataType.FLOAT_VEC4, glsUBC.UniformFlags.PRECISION_HIGH));

        /** @type {glsUBC.UniformBlock} */ var block = this.m_interface.allocBlock('Block');
        block.addUniform(new glsUBC.Uniform('s', typeS, 0));
        block.setFlags(this.m_layoutFlags);

        if (this.m_numInstances > 0)
        {
            block.setInstanceName('block');
            block.setArraySize(this.m_numInstances);
        }
    };

    /**
     * BlockSingleStructArrayCase constructor
     * @param {string} name The name of the test
     * @param {string} description The description of the test
     * @param {deInt32.deUint32} layoutFlags
     * @param {glsUBC.BufferMode} bufferMode
     * @param {number} numInstances
     */
    var BlockSingleStructArrayCase = function(name, description, layoutFlags, bufferMode, numInstances) {
        glsUBC.UniformBlockCase.call(this, name, description, bufferMode);
        this.m_layoutFlags = layoutFlags;
        this.m_numInstances = numInstances;
    };

    BlockSingleStructArrayCase.prototype = Object.create(glsUBC.UniformBlockCase.prototype);
    BlockSingleStructArrayCase.prototype.constructor = BlockSingleStructArrayCase;

    BlockSingleStructArrayCase.prototype.init = function() {
        /**@type {glsUBC.StructType}*/ var typeS = this.m_interface.allocStruct('S');
        typeS.addMember('a', new glsUBC.VarType().VarTypeBasic(deqpUtils.DataType.INT_VEC3, glsUBC.UniformFlags.PRECISION_HIGH), glsUBC.UniformFlags.UNUSED_BOTH); // First member is unused.
        typeS.addMember('b', new glsUBC.VarType().VarTypeArray(new glsUBC.VarType().VarTypeBasic(deqpUtils.DataType.FLOAT_MAT3, glsUBC.UniformFlags.PRECISION_MEDIUM), 4));
        typeS.addMember('c', new glsUBC.VarType().VarTypeBasic(deqpUtils.DataType.FLOAT_VEC4, glsUBC.UniformFlags.PRECISION_HIGH));

        /** @type {glsUBC.UniformBlock} */ var block = this.m_interface.allocBlock('Block');
        block.addUniform(new glsUBC.Uniform('u', new glsUBC.VarType().VarTypeBasic(deqpUtils.DataType.UINT, glsUBC.UniformFlags.PRECISION_LOW)));
        block.addUniform(new glsUBC.Uniform('s', new glsUBC.VarType().VarTypeArray(new glsUBC.VarType().VarTypeStruct(typeS), 3)));
        block.addUniform(new glsUBC.Uniform('v', new glsUBC.VarType().VarTypeBasic(deqpUtils.DataType.FLOAT_VEC4, glsUBC.UniformFlags.PRECISION_MEDIUM)));
        block.setFlags(this.m_layoutFlags);

        if (this.m_numInstances > 0)
        {
            block.setInstanceName('block');
            block.setArraySize(this.m_numInstances);
        }
    };

    /**
     * BlockSingleNestedStructCase constructor
     * @param {string} name The name of the test
     * @param {string} description The description of the test
     * @param {deInt32.deUint32} layoutFlags
     * @param {glsUBC.BufferMode} bufferMode
     * @param {number} numInstances
     */
    var BlockSingleNestedStructCase = function(name, description, layoutFlags, bufferMode, numInstances) {
        glsUBC.UniformBlockCase.call(this, name, description, bufferMode);
        this.m_layoutFlags = layoutFlags;
        this.m_numInstances = numInstances;
    };

    BlockSingleNestedStructCase.prototype = Object.create(glsUBC.UniformBlockCase.prototype);
    BlockSingleNestedStructCase.prototype.constructor = BlockSingleNestedStructCase;

    BlockSingleNestedStructCase.prototype.init = function() {
        /**@type {glsUBC.StructType}*/ var typeS = this.m_interface.allocStruct('S');
        typeS.addMember('a', new glsUBC.VarType().VarTypeBasic(deqpUtils.DataType.INT_VEC3, glsUBC.UniformFlags.PRECISION_HIGH));
        typeS.addMember('b', new glsUBC.VarType().VarTypeArray(new glsUBC.VarType().VarTypeBasic(deqpUtils.DataType.FLOAT_MAT3, glsUBC.UniformFlags.PRECISION_MEDIUM), 4));
        typeS.addMember('c', new glsUBC.VarType().VarTypeBasic(deqpUtils.DataType.FLOAT_VEC4, glsUBC.UniformFlags.PRECISION_HIGH), glsUBC.UniformFlags.UNUSED_BOTH);

        /**@type {glsUBC.StructType}*/ var typeT = this.m_interface.allocStruct('T');
        typeT.addMember('a', new glsUBC.VarType().VarTypeBasic(deqpUtils.DataType.FLOAT_MAT3, glsUBC.UniformFlags.PRECISION_MEDIUM));
        typeT.addMember('b', new glsUBC.VarType().VarTypeStruct(typeS));

        /** @type {glsUBC.UniformBlock} */ var block = this.m_interface.allocBlock('Block');
        block.addUniform(new glsUBC.Uniform('s', new glsUBC.VarType().VarTypeStruct(typeS), 0));
        block.addUniform(new glsUBC.Uniform('v', new glsUBC.VarType().VarTypeBasic(deqpUtils.DataType.FLOAT_VEC2, glsUBC.UniformFlags.PRECISION_LOW), glsUBC.UniformFlags.UNUSED_BOTH));
        block.addUniform(new glsUBC.Uniform('t', new glsUBC.VarType().VarTypeStruct(typeT), 0));
        block.addUniform(new glsUBC.Uniform('u', new glsUBC.VarType().VarTypeBasic(deqpUtils.DataType.UINT, glsUBC.UniformFlags.PRECISION_HIGH), 0));
        block.setFlags(this.m_layoutFlags);

        if (this.m_numInstances > 0)
        {
            block.setInstanceName('block');
            block.setArraySize(this.m_numInstances);
        }
    };

    /**
     * BlockSingleNestedStructArrayCase constructor
     * @param {string} name The name of the test
     * @param {string} description The description of the test
     * @param {deInt32.deUint32} layoutFlags
     * @param {glsUBC.BufferMode} bufferMode
     * @param {number} numInstances
     */
    var BlockSingleNestedStructArrayCase = function(name, description, layoutFlags, bufferMode, numInstances) {
        glsUBC.UniformBlockCase.call(this, name, description, bufferMode);
        this.m_layoutFlags = layoutFlags;
        this.m_numInstances = numInstances;
    };

    BlockSingleNestedStructArrayCase.prototype = Object.create(glsUBC.UniformBlockCase.prototype);
    BlockSingleNestedStructArrayCase.prototype.constructor = BlockSingleNestedStructArrayCase;

    BlockSingleNestedStructArrayCase.prototype.init = function() {
        /**@type {glsUBC.StructType}*/ var typeS = this.m_interface.allocStruct('S');
        typeS.addMember('a', new glsUBC.VarType().VarTypeBasic(deqpUtils.DataType.INT_VEC3, glsUBC.UniformFlags.PRECISION_HIGH));
        typeS.addMember('b', new glsUBC.VarType().VarTypeArray(new glsUBC.VarType().VarTypeBasic(deqpUtils.DataType.INT_VEC2, glsUBC.UniformFlags.PRECISION_MEDIUM), 4));
        typeS.addMember('c', new glsUBC.VarType().VarTypeBasic(deqpUtils.DataType.FLOAT_VEC4, glsUBC.UniformFlags.PRECISION_HIGH), glsUBC.UniformFlags.UNUSED_BOTH);

        /**@type {glsUBC.StructType}*/ var typeT = this.m_interface.allocStruct('T');
        typeT.addMember('a', new glsUBC.VarType().VarTypeBasic(deqpUtils.DataType.FLOAT_MAT3, glsUBC.UniformFlags.PRECISION_MEDIUM));
        typeT.addMember('b', new glsUBC.VarType().VarTypeArray(new glsUBC.VarType().VarTypeStruct(typeS), 3));

        /** @type {glsUBC.UniformBlock} */ var block = this.m_interface.allocBlock('Block');
        block.addUniform(new glsUBC.Uniform('s', new glsUBC.VarType().VarTypeStruct(typeS), 0));
        block.addUniform(new glsUBC.Uniform('v', new glsUBC.VarType().VarTypeBasic(deqpUtils.DataType.FLOAT_VEC2, glsUBC.UniformFlags.PRECISION_LOW), glsUBC.UniformFlags.UNUSED_BOTH));
        block.addUniform(new glsUBC.Uniform('t', new glsUBC.VarType().VarTypeArray(new glsUBC.VarType().VarTypeStruct(typeT), 2), 0));
        block.addUniform(new glsUBC.Uniform('u', new glsUBC.VarType().VarTypeBasic(deqpUtils.DataType.UINT, glsUBC.UniformFlags.PRECISION_HIGH), 0));
        block.setFlags(this.m_layoutFlags);

        if (this.m_numInstances > 0)
        {
            block.setInstanceName('block');
            block.setArraySize(this.m_numInstances);
        }
    };

    /**
     * BlockMultiBasicTypesCase constructor
     * @param {string} name The name of the test
     * @param {string} description The description of the test
     * @param {deInt32.deUint32} flagsA
     * @param {deInt32.deUint32} flagsB
     * @param {glsUBC.BufferMode} bufferMode
     * @param {number} numInstances
     */
    var BlockMultiBasicTypesCase = function(name, description, flagsA, flagsB, bufferMode, numInstances) {
        glsUBC.UniformBlockCase.call(this, name, description, bufferMode);
        this.m_flagsA = flagsA;
        this.m_flagsB = flagsB;
        this.m_numInstances = numInstances;
    };

    BlockMultiBasicTypesCase.prototype = Object.create(glsUBC.UniformBlockCase.prototype);
    BlockMultiBasicTypesCase.prototype.constructor = BlockMultiBasicTypesCase;

    BlockMultiBasicTypesCase.prototype.init = function() {
        /** @type {glsUBC.UniformBlock} */ var blockA = this.m_interface.allocBlock('BlockA');
        blockA.addUniform(new glsUBC.Uniform('a', new glsUBC.VarType().VarTypeBasic(deqpUtils.DataType.FLOAT, glsUBC.UniformFlags.PRECISION_HIGH)));
        blockA.addUniform(new glsUBC.Uniform('b', new glsUBC.VarType().VarTypeBasic(deqpUtils.DataType.UINT_VEC3, glsUBC.UniformFlags.PRECISION_LOW), glsUBC.UniformFlags.UNUSED_BOTH));
        blockA.addUniform(new glsUBC.Uniform('c', new glsUBC.VarType().VarTypeBasic(deqpUtils.DataType.FLOAT_MAT2, glsUBC.UniformFlags.PRECISION_MEDIUM)));
        blockA.setInstanceName('blockA');
        blockA.setFlags(this.m_flagsA);

        /** @type {glsUBC.UniformBlock} */ var blockB = this.m_interface.allocBlock('BlockB');
        blockB.addUniform(new glsUBC.Uniform('a', new glsUBC.VarType().VarTypeBasic(deqpUtils.DataType.FLOAT_MAT3, glsUBC.UniformFlags.PRECISION_MEDIUM)));
        blockB.addUniform(new glsUBC.Uniform('b', new glsUBC.VarType().VarTypeBasic(deqpUtils.DataType.INT_VEC2, glsUBC.UniformFlags.PRECISION_LOW)));
        blockB.addUniform(new glsUBC.Uniform('c', new glsUBC.VarType().VarTypeBasic(deqpUtils.DataType.FLOAT_VEC4, glsUBC.UniformFlags.PRECISION_HIGH), glsUBC.UniformFlags.UNUSED_BOTH));
        blockB.addUniform(new glsUBC.Uniform('d', new glsUBC.VarType().VarTypeBasic(deqpUtils.DataType.BOOL, 0)));
        blockB.setInstanceName('blockB');
        blockB.setFlags(this.m_flagsB);

        if (this.m_numInstances > 0)
        {
            blockA.setArraySize(this.m_numInstances);
            blockB.setArraySize(this.m_numInstances);
        }
    };

    /**
     * BlockMultiNestedStructCase constructor
     * @param {string} name The name of the test
     * @param {string} description The description of the test
     * @param {deInt32.deUint32} flagsA
     * @param {deInt32.deUint32} flagsB
     * @param {glsUBC.BufferMode} bufferMode
     * @param {number} numInstances
     */
    var BlockMultiNestedStructCase = function(name, description, flagsA, flagsB, bufferMode, numInstances) {
        glsUBC.UniformBlockCase.call(this, name, description, bufferMode);
        this.m_flagsA = flagsA;
        this.m_flagsB = flagsB;
        this.m_numInstances = numInstances;
    };

    BlockMultiNestedStructCase.prototype = Object.create(glsUBC.UniformBlockCase.prototype);
    BlockMultiNestedStructCase.prototype.constructor = BlockMultiNestedStructCase;

    BlockMultiNestedStructCase.prototype.init = function() {
        /**@type {glsUBC.StructType}*/ var typeS = this.m_interface.allocStruct('S');
        typeS.addMember('a', new glsUBC.VarType().VarTypeBasic(deqpUtils.DataType.FLOAT_MAT3, glsUBC.UniformFlags.PRECISION_LOW));
        typeS.addMember('b', new glsUBC.VarType().VarTypeArray(new glsUBC.VarType().VarTypeBasic(deqpUtils.DataType.INT_VEC2, glsUBC.UniformFlags.PRECISION_MEDIUM), 4));
        typeS.addMember('c', new glsUBC.VarType().VarTypeBasic(deqpUtils.DataType.FLOAT_VEC4, glsUBC.UniformFlags.PRECISION_HIGH));

        /**@type {glsUBC.StructType}*/ var typeT = this.m_interface.allocStruct('T');
        typeT.addMember('a', new glsUBC.VarType().VarTypeBasic(deqpUtils.DataType.UINT, glsUBC.UniformFlags.PRECISION_MEDIUM), glsUBC.UniformFlags.UNUSED_BOTH);
        typeT.addMember('b', new glsUBC.VarType().VarTypeStruct(typeS));
        typeT.addMember('c', new glsUBC.VarType().VarTypeBasic(deqpUtils.DataType.BOOL_VEC4, 0));

        /** @type {glsUBC.UniformBlock} */ var blockA = this.m_interface.allocBlock('BlockA');
        blockA.addUniform(new glsUBC.Uniform('a', new glsUBC.VarType().VarTypeBasic(deqpUtils.DataType.FLOAT, glsUBC.UniformFlags.PRECISION_HIGH)));
        blockA.addUniform(new glsUBC.Uniform('b', new glsUBC.VarType().VarTypeStruct(typeS)));
        blockA.addUniform(new glsUBC.Uniform('c', new glsUBC.VarType().VarTypeBasic(deqpUtils.DataType.UINT_VEC3, glsUBC.UniformFlags.PRECISION_LOW), glsUBC.UniformFlags.UNUSED_BOTH));
        blockA.setInstanceName('blockA');
        blockA.setFlags(this.m_flagsA);

        /** @type {glsUBC.UniformBlock} */ var blockB = this.m_interface.allocBlock('BlockB');
        blockB.addUniform(new glsUBC.Uniform('a', new glsUBC.VarType().VarTypeBasic(deqpUtils.DataType.FLOAT_MAT2, glsUBC.UniformFlags.PRECISION_MEDIUM)));
        blockB.addUniform(new glsUBC.Uniform('b', new glsUBC.VarType().VarTypeStruct(typeT)));
        blockB.addUniform(new glsUBC.Uniform('c', new glsUBC.VarType().VarTypeBasic(deqpUtils.DataType.BOOL_VEC4, 0), glsUBC.UniformFlags.UNUSED_BOTH));
        blockB.addUniform(new glsUBC.Uniform('d', new glsUBC.VarType().VarTypeBasic(deqpUtils.DataType.BOOL, 0)));
        blockB.setInstanceName('blockB');
        blockB.setFlags(this.m_flagsB);

        if (this.m_numInstances > 0)
        {
            blockA.setArraySize(this.m_numInstances);
            blockB.setArraySize(this.m_numInstances);
        }
    };

    /**
     * Creates the test hierarchy to be executed.
     * @param {string} filter A filter to select particular tests.
     **/
    var init = function(filter) {
        /** @type {deqpUtils.DataType} */
        var basicTypes = [
            deqpUtils.DataType.FLOAT,
            deqpUtils.DataType.FLOAT_VEC2,
            deqpUtils.DataType.FLOAT_VEC3,
            deqpUtils.DataType.FLOAT_VEC4,
            deqpUtils.DataType.INT,
            deqpUtils.DataType.INT_VEC2,
            deqpUtils.DataType.INT_VEC3,
            deqpUtils.DataType.INT_VEC4,
            deqpUtils.DataType.UINT,
            deqpUtils.DataType.UINT_VEC2,
            deqpUtils.DataType.UINT_VEC3,
            deqpUtils.DataType.UINT_VEC4,
            deqpUtils.DataType.BOOL,
            deqpUtils.DataType.BOOL_VEC2,
            deqpUtils.DataType.BOOL_VEC3,
            deqpUtils.DataType.BOOL_VEC4,
            deqpUtils.DataType.FLOAT_MAT2,
            deqpUtils.DataType.FLOAT_MAT3,
            deqpUtils.DataType.FLOAT_MAT4,
            deqpUtils.DataType.FLOAT_MAT2X3,
            deqpUtils.DataType.FLOAT_MAT2X4,
            deqpUtils.DataType.FLOAT_MAT3X2,
            deqpUtils.DataType.FLOAT_MAT3X4,
            deqpUtils.DataType.FLOAT_MAT4X2,
            deqpUtils.DataType.FLOAT_MAT4X3
        ];

        /** @type {Array.<string, glsUBC.UniformFlags>} */
        var precisionFlags = [
            { name: 'lowp', flags: glsUBC.UniformFlags.PRECISION_LOW },
            { name: 'mediump', flags: glsUBC.UniformFlags.PRECISION_MEDIUM },
            { name: 'highp', flags: glsUBC.UniformFlags.PRECISION_HIGH }
        ];

        /** @type {Array.<string, glsUBC.UniformFlags>} */
        var layoutFlags = [
            { name: 'shared', flags: glsUBC.UniformFlags.PRECISION_LOW },
            { name: 'packed', flags: glsUBC.UniformFlags.PRECISION_MEDIUM },
            { name: 'std140', flags: glsUBC.UniformFlags.PRECISION_HIGH }
        ];

        /** @type {Array.<string, glsUBC.UniformFlags>} */
        var matrixFlags = [
            { name: 'row_major', flags: glsUBC.UniformFlags.LAYOUT_ROW_MAJOR },
            { name: 'column_major', flags: glsUBC.UniformFlags.LAYOUT_COLUMN_MAJOR }
        ];

        /** @type {Array.<string, glsUBC.BufferMode>} */
        var bufferModes = [
            { name: 'per_block_buffer', mode: glsUBC.BufferMode.BUFFERMODE_PER_BLOCK },
            { name: 'single_buffer', mode: glsUBC.BufferMode.BUFFERMODE_SINGLE }
        ];

        // ubo.single_basic_type
        /** @type {deqpTests.DeqpTest} */
        var singleBasicTypeGroup = deqpTests.newTest('single_basic_type', 'Single basic variable in single buffer');

        testGroup.addChild(singleBasicTypeGroup);

        for (var layoutFlagNdx = 0; layoutFlagNdx < layoutFlags.length; layoutFlagNdx++)
        {
            /** @type {deqpTests.deqpTest} */
            var layoutGroup = new deqpTests.newTest(layoutFlags[layoutFlagNdx].name, '', null);
            singleBasicTypeGroup.addChild(layoutGroup);

            for (var basicTypeNdx = 0; basicTypeNdx < basicTypes.length; basicTypeNdx++)
            {
                /** @type {deqpUtils.DataType} */ var type = basicTypes[basicTypeNdx];
                /** @type {string} */ var typeName = deqpUtils.getDataTypeName(type);

                if (deqpUtils.isDataTypeBoolOrBVec(type))
                    createBlockBasicTypeCases(layoutGroup, typeName, new glsUBC.VarType().VarTypeBasic(type, 0), layoutFlags[layoutFlagNdx].flags);
                else
                {
                    for (var precNdx = 0; precNdx < precisionFlags.length; precNdx++)
                        createBlockBasicTypeCases(layoutGroup, precisionFlags[precNdx].name + '_' + typeName,
                            new glsUBC.VarType().VarTypeBasic(type, precisionFlags[precNdx].flags), layoutFlags[layoutFlagNdx].flags);
                }

                if (deqpUtils.isDataTypeMatrix(type))
                {
                    for (var matFlagNdx = 0; matFlagNdx < matrixFlags.length; matFlagNdx++)
                    {
                        for (var precNdx = 0; precNdx < precisionFlags.length; precNdx++)
                            createBlockBasicTypeCases(layoutGroup, matrixFlags[matFlagNdx].name + '_' + precisionFlags[precNdx].name + '_' + typeName,
                                new glsUBC.VarType().VarTypeBasic(type, precisionFlags[precNdx].flags), layoutFlags[layoutFlagNdx].flags | matrixFlags[matFlagNdx].flags);
                    }
                }
            }
        }
        //TODO: Remove
        testPassedOptions('Init ubo.single_basic_type', true);

        // ubo.single_basic_array
        /** @type {deqpTests.DeqpTest} */
        var singleBasicArrayGroup = deqpTests.newTest('single_basic_array', 'Single basic array variable in single buffer');
        testGroup.addChild(singleBasicArrayGroup);

        for (var layoutFlagNdx = 0; layoutFlagNdx < layoutFlags.length; layoutFlagNdx++)
        {
            /** @type {deqpTests.deqpTest} */
            var layoutGroup = new deqpTests.newTest(layoutFlags[layoutFlagNdx].name, '', null);
            singleBasicArrayGroup.addChild(layoutGroup);

            for (var basicTypeNdx = 0; basicTypeNdx < basicTypes.length; basicTypeNdx++)
            {
                /** @type {deqpUtils.DataType} */ var type = basicTypes[basicTypeNdx];
                /** @type {string} */ var typeName = deqpUtils.getDataTypeName(type);
                /** @type {number} */ var arraySize = 3;

                createBlockBasicTypeCases(layoutGroup, typeName,
                    new glsUBC.VarType().VarTypeArray(new glsUBC.VarType().VarTypeBasic(type, deqpUtils.isDataTypeBoolOrBVec(type) ? 0 : glsUBC.UniformFlags.PRECISION_HIGH), arraySize),
                    layoutFlags[layoutFlagNdx].flags);

                if (deqpUtils.isDataTypeMatrix(type))
                {
                    for (var matFlagNdx = 0; matFlagNdx < matrixFlags.length; matFlagNdx++)
                        createBlockBasicTypeCases(layoutGroup, matrixFlags[matFlagNdx].name + '_' + typeName,
                            new glsUBC.VarType().VarTypeArray(new glsUBC.VarType().VarTypeBasic(type, glsUBC.UniformFlags.PRECISION_HIGH), arraySize),
                            layoutFlags[layoutFlagNdx].flags | matrixFlags[matFlagNdx].flags);
                }
            }
        }
        //TODO: Remove
        testPassedOptions('Init ubo.single_basic_array', true);

        // ubo.single_struct
        /** @type {deqpTests.DeqpTest} */
        var singleStructGroup = deqpTests.newTest('single_struct', 'Single struct in uniform block');
        testGroup.addChild(singleStructGroup);

        for (var modeNdx = 0; modeNdx < bufferModes.length; modeNdx++)
        {
            /** @type {deqpTests.deqpTest} */
            var modeGroup = new deqpTests.newTest(bufferModes[modeNdx].name, '');
            singleStructGroup.addChild(modeGroup);

            for (var layoutFlagNdx = 0; layoutFlagNdx < layoutFlags.length; layoutFlagNdx++)
            {
                for (var isArray = 0; isArray < 2; isArray++)
                {
                    /** @type {string} */ var baseName = layoutFlags[layoutFlagNdx].name;
                    /** @type {deInt32.deUint32} */ var baseFlags = layoutFlags[layoutFlagNdx].flags;

                    if (bufferModes[modeNdx].mode == glsUBC.BufferMode.BUFFERMODE_SINGLE && isArray == 0)
                        continue; // Doesn't make sense to add this variant.

                    if (isArray)
                        baseName += '_instance_array';

                    modeGroup.addChild(new BlockSingleStructCase(baseName + '_vertex', '', baseFlags | glsUBC.UniformFlags.DECLARE_VERTEX, bufferModes[modeNdx].mode, isArray ? 3 : 0));
                    modeGroup.addChild(new BlockSingleStructCase(baseName + '_fragment', '', baseFlags | glsUBC.UniformFlags.DECLARE_FRAGMENT, bufferModes[modeNdx].mode, isArray ? 3 : 0));

                    if (!(baseFlags & glsUBC.UniformFlags.LAYOUT_PACKED))
                        modeGroup.addChild(new BlockSingleStructCase(baseName + '_both', '', baseFlags | glsUBC.UniformFlags.DECLARE_VERTEX | glsUBC.UniformFlags.DECLARE_FRAGMENT, bufferModes[modeNdx].mode, isArray ? 3 : 0));
                }
            }
        }
        //TODO: Remove
        testPassedOptions('Init ubo.single_struct', true);

        // ubo.single_struct_array
        /** @type {deqpTests.DeqpTest} */
        var singleStructArrayGroup = deqpTests.newTest('single_struct_array', 'Struct array in one uniform block');
        testGroup.addChild(singleStructArrayGroup);

        for (var modeNdx = 0; modeNdx < bufferModes.length; modeNdx++)
        {
            /** @type {deqpTests.deqpTest} */
            var modeGroup = new deqpTests.newTest(bufferModes[modeNdx].name, '');
            singleStructArrayGroup.addChild(modeGroup);

            for (var layoutFlagNdx = 0; layoutFlagNdx < layoutFlags.length; layoutFlagNdx++)
            {
                for (var isArray = 0; isArray < 2; isArray++)
                {
                    /** @type {string} */ var baseName = layoutFlags[layoutFlagNdx].name;
                    /** @type {deInt32.deUint32} */ var baseFlags = layoutFlags[layoutFlagNdx].flags;

                    if (bufferModes[modeNdx].mode == glsUBC.BufferMode.BUFFERMODE_SINGLE && isArray == 0)
                        continue; // Doesn't make sense to add this variant.

                    if (isArray)
                        baseName += '_instance_array';

                    modeGroup.addChild(new BlockSingleStructArrayCase(baseName + '_vertex', '', baseFlags | glsUBC.UniformFlags.DECLARE_VERTEX, bufferModes[modeNdx].mode, isArray ? 3 : 0));
                    modeGroup.addChild(new BlockSingleStructArrayCase(baseName + '_fragment', '', baseFlags | glsUBC.UniformFlags.DECLARE_FRAGMENT, bufferModes[modeNdx].mode, isArray ? 3 : 0));

                    if (!(baseFlags & glsUBC.UniformFlags.LAYOUT_PACKED))
                        modeGroup.addChild(new BlockSingleStructArrayCase(baseName + '_both', '', baseFlags | glsUBC.UniformFlags.DECLARE_VERTEX | glsUBC.UniformFlags.DECLARE_FRAGMENT, bufferModes[modeNdx].mode, isArray ? 3 : 0));
                }
            }
        }
        //TODO: Remove
        testPassedOptions('Init ubo.single_struct_array', true);

        // ubo.single_nested_struct
        /** @type {deqpTests.DeqpTest} */
        var singleNestedStructGroup = deqpTests.newTest('single_nested_struct', 'Nested struct in one uniform block');
        testGroup.addChild(singleNestedStructGroup);

        for (var modeNdx = 0; modeNdx < bufferModes.length; modeNdx++)
        {
            /** @type {deqpTests.deqpTest} */
            var modeGroup = new deqpTests.newTest(bufferModes[modeNdx].name, '');
            singleNestedStructGroup.addChild(modeGroup);

            for (var layoutFlagNdx = 0; layoutFlagNdx < layoutFlags.length; layoutFlagNdx++)
            {
                for (var isArray = 0; isArray < 2; isArray++)
                {
                    /** @type {string} */ var baseName = layoutFlags[layoutFlagNdx].name;
                    /** @type {deInt32.deUint32} */ var baseFlags = layoutFlags[layoutFlagNdx].flags;

                    if (bufferModes[modeNdx].mode == glsUBC.BufferMode.BUFFERMODE_SINGLE && isArray == 0)
                        continue; // Doesn't make sense to add this variant.

                    if (isArray)
                        baseName += '_instance_array';

                    modeGroup.addChild(new BlockSingleNestedStructCase(baseName + '_vertex', '', baseFlags | glsUBC.UniformFlags.DECLARE_VERTEX, bufferModes[modeNdx].mode, isArray ? 3 : 0));
                    modeGroup.addChild(new BlockSingleNestedStructCase(baseName + '_fragment', '', baseFlags | glsUBC.UniformFlags.DECLARE_FRAGMENT, bufferModes[modeNdx].mode, isArray ? 3 : 0));

                    if (!(baseFlags & glsUBC.UniformFlags.LAYOUT_PACKED))
                        modeGroup.addChild(new BlockSingleNestedStructCase(baseName + '_both', '', baseFlags | glsUBC.UniformFlags.DECLARE_VERTEX | glsUBC.UniformFlags.DECLARE_FRAGMENT, bufferModes[modeNdx].mode, isArray ? 3 : 0));
                }
            }
        }
        //TODO: Remove
        testPassedOptions('Init ubo.single_nested_struct', true);

        // ubo.single_nested_struct_array
        /** @type {deqpTests.DeqpTest} */
        var singleNestedStructArrayGroup = deqpTests.newTest('single_nested_struct_array', 'Nested struct array in one uniform block');
        testGroup.addChild(singleNestedStructArrayGroup);

        for (var modeNdx = 0; modeNdx < bufferModes.length; modeNdx++)
        {
            /** @type {deqpTests.deqpTest} */
            var modeGroup = new deqpTests.newTest(bufferModes[modeNdx].name, '');
            singleNestedStructArrayGroup.addChild(modeGroup);

            for (var layoutFlagNdx = 0; layoutFlagNdx < layoutFlags.length; layoutFlagNdx++)
            {
                for (var isArray = 0; isArray < 2; isArray++)
                {
                    /** @type {string} */ var baseName = layoutFlags[layoutFlagNdx].name;
                    /** @type {deInt32.deUint32} */ var baseFlags = layoutFlags[layoutFlagNdx].flags;

                    if (bufferModes[modeNdx].mode == glsUBC.BufferMode.BUFFERMODE_SINGLE && isArray == 0)
                        continue; // Doesn't make sense to add this variant.

                    if (isArray)
                        baseName += '_instance_array';

                    modeGroup.addChild(new BlockSingleNestedStructArrayCase(baseName + '_vertex', '', baseFlags | glsUBC.UniformFlags.DECLARE_VERTEX, bufferModes[modeNdx].mode, isArray ? 3 : 0));
                    modeGroup.addChild(new BlockSingleNestedStructArrayCase(baseName + '_fragment', '', baseFlags | glsUBC.UniformFlags.DECLARE_FRAGMENT, bufferModes[modeNdx].mode, isArray ? 3 : 0));

                    if (!(baseFlags & glsUBC.UniformFlags.LAYOUT_PACKED))
                        modeGroup.addChild(new BlockSingleNestedStructArrayCase(baseName + '_both', '', baseFlags | glsUBC.UniformFlags.DECLARE_VERTEX | glsUBC.UniformFlags.DECLARE_FRAGMENT, bufferModes[modeNdx].mode, isArray ? 3 : 0));
                }
            }
        }
        //TODO: Remove
        testPassedOptions('Init ubo.single_nested_struct_array', true);

        // ubo.instance_array_basic_type
        /** @type {deqpTests.DeqpTest} */
        var instanceArrayBasicTypeGroup = deqpTests.newTest('instance_array_basic_type', 'Single basic variable in instance array');
        testGroup.addChild(instanceArrayBasicTypeGroup);

        for (var layoutFlagNdx = 0; layoutFlagNdx < layoutFlags.length; layoutFlagNdx++)
        {
            /** @type {deqpTests.deqpTest} */
            var layoutGroup = new deqpTests.newTest(layoutFlags[layoutFlagNdx].name, '');
            instanceArrayBasicTypeGroup.addChild(layoutGroup);

            for (var basicTypeNdx = 0; basicTypeNdx < basicTypes.length; basicTypeNdx++)
            {
                /** @type {deqpUtils.DataType} */ var type = basicTypes[basicTypeNdx];
                /** @type {string} */ var typeName = deqpUtils.getDataTypeName(type);
                /** @type {number} */ var numInstances = 3;

                createBlockBasicTypeCases(layoutGroup, typeName,
                    new glsUBC.VarType().VarTypeBasic(type, deqpUtils.isDataTypeBoolOrBVec(type) ? 0 : glsUBC.UniformFlags.PRECISION_HIGH),
                    layoutFlags[layoutFlagNdx].flags, numInstances);

                if (deqpUtils.isDataTypeMatrix(type))
                {
                    for (var matFlagNdx = 0; matFlagNdx < matrixFlags.length; matFlagNdx++)
                        createBlockBasicTypeCases(layoutGroup, matrixFlags[matFlagNdx].name + '_' + typeName,
                            new glsUBC.VarType().VarTypeBasic(type, glsUBC.UniformFlags.PRECISION_HIGH), layoutFlags[layoutFlagNdx].flags | matrixFlags[matFlagNdx].flags,
                            numInstances);
                }
            }
        }
        //TODO: Remove
        testPassedOptions('Init ubo.instance_array_basic_type', true);

        // ubo.multi_basic_types
        /** @type {deqpTests.DeqpTest} */
        var multiBasicTypesGroup = deqpTests.newTest('multi_basic_types', 'Multiple buffers with basic types');
        testGroup.addChild(multiBasicTypesGroup);

        for (var modeNdx = 0; modeNdx < bufferModes.length; modeNdx++)
        {
            /** @type {deqpTests.deqpTest} */
            var modeGroup = new deqpTests.newTest(bufferModes[modeNdx].name, '');
            multiBasicTypesGroup.addChild(modeGroup);

            for (var layoutFlagNdx = 0; layoutFlagNdx < layoutFlags.length; layoutFlagNdx++)
            {
                for (var isArray = 0; isArray < 2; isArray++)
                {
                    /** @type {string} */ var baseName = layoutFlags[layoutFlagNdx].name;
                    /** @type {deInt32.deUint32} */ var baseFlags = layoutFlags[layoutFlagNdx].flags;

                    if (isArray)
                        baseName += '_instance_array';

                    modeGroup.addChild(new BlockMultiBasicTypesCase(baseName + '_vertex', '', baseFlags | glsUBC.UniformFlags.DECLARE_VERTEX, baseFlags | glsUBC.UniformFlags.DECLARE_VERTEX, bufferModes[modeNdx].mode, isArray ? 3 : 0));
                    modeGroup.addChild(new BlockMultiBasicTypesCase(baseName + '_fragment', '', baseFlags | glsUBC.UniformFlags.DECLARE_FRAGMENT, baseFlags | glsUBC.UniformFlags.DECLARE_FRAGMENT, bufferModes[modeNdx].mode, isArray ? 3 : 0));

                    if (!(baseFlags & glsUBC.UniformFlags.LAYOUT_PACKED))
                        modeGroup.addChild(new BlockMultiBasicTypesCase(baseName + '_both', '', baseFlags | glsUBC.UniformFlags.DECLARE_VERTEX | glsUBC.UniformFlags.DECLARE_FRAGMENT, baseFlags | glsUBC.UniformFlags.DECLARE_VERTEX | glsUBC.UniformFlags.DECLARE_FRAGMENT, bufferModes[modeNdx].mode, isArray ? 3 : 0));

                    modeGroup.addChild(new BlockMultiBasicTypesCase(baseName + '_mixed', '', baseFlags | glsUBC.UniformFlags.DECLARE_VERTEX, baseFlags | glsUBC.UniformFlags.DECLARE_FRAGMENT, bufferModes[modeNdx].mode, isArray ? 3 : 0));
                }
            }
        }
        //TODO: Remove
        testPassedOptions('Init ubo.multi_basic_types', true);

        // ubo.multi_nested_struct
        /** @type {deqpTests.DeqpTest} */
        var multiNestedStructGroup = deqpTests.newTest('multi_nested_struct', 'Multiple buffers with basic types');
        testGroup.addChild(multiNestedStructGroup);

        for (var modeNdx = 0; modeNdx < bufferModes.length; modeNdx++)
        {
            /** @type {deqpTests.deqpTest} */
            var modeGroup = new deqpTests.newTest(bufferModes[modeNdx].name, '');
            multiNestedStructGroup.addChild(modeGroup);

            for (var layoutFlagNdx = 0; layoutFlagNdx < layoutFlags.length; layoutFlagNdx++)
            {
                for (var isArray = 0; isArray < 2; isArray++)
                {
                    /** @type {string} */ var baseName = layoutFlags[layoutFlagNdx].name;
                    /** @type {deInt32.deUint32} */ var baseFlags = layoutFlags[layoutFlagNdx].flags;

                    if (isArray)
                        baseName += '_instance_array';

                    modeGroup.addChild(new BlockMultiNestedStructCase(baseName + '_vertex', '', baseFlags | glsUBC.UniformFlags.DECLARE_VERTEX, baseFlags | glsUBC.UniformFlags.DECLARE_VERTEX, bufferModes[modeNdx].mode, isArray ? 3 : 0));
                    modeGroup.addChild(new BlockMultiNestedStructCase(baseName + '_fragment', '', baseFlags | glsUBC.UniformFlags.DECLARE_FRAGMENT, baseFlags | glsUBC.UniformFlags.DECLARE_FRAGMENT, bufferModes[modeNdx].mode, isArray ? 3 : 0));

                    if (!(baseFlags & glsUBC.UniformFlags.LAYOUT_PACKED))
                        modeGroup.addChild(new BlockMultiNestedStructCase(baseName + '_both', '', baseFlags | glsUBC.UniformFlags.DECLARE_VERTEX | glsUBC.UniformFlags.DECLARE_FRAGMENT, baseFlags | glsUBC.UniformFlags.DECLARE_VERTEX | glsUBC.UniformFlags.DECLARE_FRAGMENT, bufferModes[modeNdx].mode, isArray ? 3 : 0));

                    modeGroup.addChild(new BlockMultiNestedStructCase(baseName + '_mixed', '', baseFlags | glsUBC.UniformFlags.DECLARE_VERTEX, baseFlags | glsUBC.UniformFlags.DECLARE_FRAGMENT, bufferModes[modeNdx].mode, isArray ? 3 : 0));
                }
            }
        }
        //TODO: Remove
        testPassedOptions('Init ubo.multi_nested_struct', true);

        // TODO: ubo.random
        // {
//             /** @type {deInt32.deUint32} */ var allShaders = FEATURE_VERTEX_BLOCKS|FEATURE_FRAGMENT_BLOCKS|FEATURE_SHARED_BLOCKS;
//             /** @type {deInt32.deUint32} */ var allLayouts = FEATURE_PACKED_LAYOUT|FEATURE_SHARED_LAYOUT|FEATURE_STD140_LAYOUT;
//             /** @type {deInt32.deUint32} */ var allBasicTypes = FEATURE_VECTORS|FEATURE_MATRICES;
//             /** @type {deInt32.deUint32} */ var unused = FEATURE_UNUSED_MEMBERS|FEATURE_UNUSED_UNIFORMS;
//             /** @type {deInt32.deUint32} */ var matFlags = FEATURE_MATRIX_LAYOUT;
//             /** @type {deInt32.deUint32} */ var allFeatures = ~FEATURE_ARRAYS_OF_ARRAYS;
//
//             tcu::TestCaseGroup* randomGroup = new tcu::TestCaseGroup(m_testCtx, "random", "Random Uniform Block cases");
//             addChild(randomGroup);
//
//             // Basic types.
//             createRandomCaseGroup(randomGroup, m_context, "scalar_types",    "Scalar types only, per-block buffers",                UniformBlockCase::BUFFERMODE_PER_BLOCK,    allShaders|allLayouts|unused,                                        25, 0);
//             createRandomCaseGroup(randomGroup, m_context, "vector_types",    "Scalar and vector types only, per-block buffers",    UniformBlockCase::BUFFERMODE_PER_BLOCK,    allShaders|allLayouts|unused|FEATURE_VECTORS,                        25, 25);
//             createRandomCaseGroup(randomGroup, m_context, "basic_types",    "All basic types, per-block buffers",                UniformBlockCase::BUFFERMODE_PER_BLOCK, allShaders|allLayouts|unused|allBasicTypes|matFlags,                25, 50);
//             createRandomCaseGroup(randomGroup, m_context, "basic_arrays",    "Arrays, per-block buffers",                        UniformBlockCase::BUFFERMODE_PER_BLOCK,    allShaders|allLayouts|unused|allBasicTypes|matFlags|FEATURE_ARRAYS,    25, 50);
//
//             createRandomCaseGroup(randomGroup, m_context, "basic_instance_arrays",                    "Basic instance arrays, per-block buffers",                UniformBlockCase::BUFFERMODE_PER_BLOCK,    allShaders|allLayouts|unused|allBasicTypes|matFlags|FEATURE_INSTANCE_ARRAYS,                                25, 75);
//             createRandomCaseGroup(randomGroup, m_context, "nested_structs",                            "Nested structs, per-block buffers",                    UniformBlockCase::BUFFERMODE_PER_BLOCK,    allShaders|allLayouts|unused|allBasicTypes|matFlags|FEATURE_STRUCTS,                                        25, 100);
//             createRandomCaseGroup(randomGroup, m_context, "nested_structs_arrays",                    "Nested structs, arrays, per-block buffers",            UniformBlockCase::BUFFERMODE_PER_BLOCK,    allShaders|allLayouts|unused|allBasicTypes|matFlags|FEATURE_STRUCTS|FEATURE_ARRAYS,                            25, 150);
//             createRandomCaseGroup(randomGroup, m_context, "nested_structs_instance_arrays",            "Nested structs, instance arrays, per-block buffers",    UniformBlockCase::BUFFERMODE_PER_BLOCK,    allShaders|allLayouts|unused|allBasicTypes|matFlags|FEATURE_STRUCTS|FEATURE_INSTANCE_ARRAYS,                25, 125);
//             createRandomCaseGroup(randomGroup, m_context, "nested_structs_arrays_instance_arrays",    "Nested structs, instance arrays, per-block buffers",    UniformBlockCase::BUFFERMODE_PER_BLOCK,    allShaders|allLayouts|unused|allBasicTypes|matFlags|FEATURE_STRUCTS|FEATURE_ARRAYS|FEATURE_INSTANCE_ARRAYS,    25, 175);
//
//             createRandomCaseGroup(randomGroup, m_context, "all_per_block_buffers",    "All random features, per-block buffers",    UniformBlockCase::BUFFERMODE_PER_BLOCK,    allFeatures,    50, 200);
//             createRandomCaseGroup(randomGroup, m_context, "all_shared_buffer",        "All random features, shared buffer",        UniformBlockCase::BUFFERMODE_SINGLE,    allFeatures,    50, 250);
//         }
    };

    /**
     * Create and execute the test cases
     * @param {string} filter Optional filter
     */
    var run = function(filter) {
        init(filter);
        deqpTests.runner.terminate();
        /*WebGLTestUtils.loadTextFileAsync(testName + '.test', function(success, content) {
            if (success) {
                deqpTests.runner.getState().testFile = content;
                deqpTests.runner.getState().testName = testName;
                deqpTests.runner.getState().filter = filter;
                deqpTests.runner.runCallback(processTestFile);
            } else {
                testFailed('Failed to load test file: ' + testName);
                deqpTests.runner.terminate();
            }
        });*/
    };

    return {
        run: run
    };
});
