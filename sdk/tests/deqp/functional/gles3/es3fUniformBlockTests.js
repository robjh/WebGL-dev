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
define(['framework/opengl/gluShaderUtil', 'modules/shared/glsUniformBlockCase', 'framework/common/tcuTestCase', 'framework/delibs/debase/deInt32'], function(deqpUtils, glsUniformBC, deqpTests, deInt32) {
    'use strict';

    /** @const @type {number} */ var VIEWPORT_WIDTH = 128;
    /** @const @type {number} */ var VIEWPORT_HEIGHT = 128;

    /** @const @type {deqpTests.DeqpTest} */ var testGroup = deqpTests.newTest('ubo', 'Uniform Block tests', null);

    /**
     * BlockBasicTypeCase constructor
     * @param {string} name The name of the test
     * @param {string} description The description of the test
     * @param {glsUniformBC.VarType} type The type of the block
     * @param {glsUniformBC.UniformLayout} layoutFlags
     * @param {number} numInstances
     */
    var BlockBasicTypeCase = function(name, description, type, layoutFlags, numInstances) {
        glsUniformBC.UniformBlockCase.call(this, name, description, glsUniformBC.BufferMode.BUFFERMODE_PER_BLOCK);
        /** @type {glsUniformBC.UniformBlock}*/ var block = this.m_interface.allocBlock('Block');
        block.addUniform(new glsUniformBC.Uniform('var', type, 0));
        block.setFlags(layoutFlags);

        if (numInstances > 0)
        {
            block.setArraySize(numInstances);
            block.setInstanceName('block');
        }
    };

    BlockBasicTypeCase.prototype = Object.create(glsUniformBC.UniformBlockCase.prototype);
    BlockBasicTypeCase.prototype.constructor = BlockBasicTypeCase;

    var createBlockBasicTypeCases = function(group, name, type, layoutFlags, numInstances) {
        group.addChild(new BlockBasicTypeCase(name + '_vertex', '', type, layoutFlags | glsUniformBC.UniformFlags.DECLARE_VERTEX, numInstances));
        group.addChild(new BlockBasicTypeCase(name + '_fragment', '', type, layoutFlags | glsUniformBC.UniformFlags.DECLARE_FRAGMENT, numInstances));

        //alert(group.spec[0].m_instance);
        if (!(layoutFlags & glsUniformBC.UniformFlags.LAYOUT_PACKED))
            group.addChild(new BlockBasicTypeCase(name + '_both', '', type, layoutFlags | glsUniformBC.UniformFlags.DECLARE_VERTEX | glsUniformBC.UniformFlags.DECLARE_FRAGMENT, numInstances));
    };

    /**
     * BlockSingleStructCase constructor
     * @param {string} name The name of the test
     * @param {string} description The description of the test
     * @param {deInt32.deUint32} layoutFlags
     * @param {glsUniformBC.BufferMode} bufferMode
     * @param {number} numInstances
     */
    var BlockSingleStructCase = function(name, description, layoutFlags, bufferMode, numInstances) {
        glsUniformBC.UniformBlockCase.call(this, name, description, bufferMode);
        this.m_layoutFlags = layoutFlags;
        this.m_numInstances = numInstances;
    };

    BlockSingleStructCase.prototype = Object.create(glsUniformBC.UniformBlockCase.prototype);
    BlockSingleStructCase.prototype.constructor = BlockSingleStructCase;

    BlockSingleStructCase.prototype.init = function() {
        /**@type {glsUniformBC.StructType}*/ var typeS = this.m_interface.allocStruct('S');
        typeS.addMember('a', new glsUniformBC.VarType().VarTypeBasic(deqpUtils.DataType.INT_VEC3, glsUniformBC.UniformFlags.PRECISION_HIGH), glsUniformBC.UniformFlags.UNUSED_BOTH); // First member is unused.
        typeS.addMember('b', new glsUniformBC.VarType().VarTypeArray(new glsUniformBC.VarType().VarTypeBasic(deqpUtils.DataType.FLOAT_MAT3, glsUniformBC.UniformFlags.PRECISION_MEDIUM), 4));
        typeS.addMember('c', new glsUniformBC.VarType().VarTypeBasic(deqpUtils.DataType.FLOAT_VEC4, glsUniformBC.UniformFlags.PRECISION_HIGH));

        /** @type {glsUniformBC.UniformBlock} */ var block = this.m_interface.allocBlock('Block');
        block.addUniform(new glsUniformBC.Uniform('s', typeS, 0));
        block.setFlags(this.m_layoutFlags);

        if (this.m_numInstances > 0)
        {
            block.setInstanceName('block');
            block.setArraySize(this.m_numInstances);
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

        /** @type {Array.<string, glsUniformBC.UniformFlags>} */
        var precisionFlags = [
            { name: 'lowp', flags: glsUniformBC.UniformFlags.PRECISION_LOW },
            { name: 'mediump', flags: glsUniformBC.UniformFlags.PRECISION_MEDIUM },
            { name: 'highp', flags: glsUniformBC.UniformFlags.PRECISION_HIGH }
        ];

        /** @type {Array.<string, glsUniformBC.UniformFlags>} */
        var layoutFlags = [
            { name: 'shared', flags: glsUniformBC.UniformFlags.PRECISION_LOW },
            { name: 'packed', flags: glsUniformBC.UniformFlags.PRECISION_MEDIUM },
            { name: 'std140', flags: glsUniformBC.UniformFlags.PRECISION_HIGH }
        ];

        /** @type {Array.<string, glsUniformBC.UniformFlags>} */
        var matrixFlags = [
            { name: 'row_major', flags: glsUniformBC.UniformFlags.LAYOUT_ROW_MAJOR },
            { name: 'column_major', flags: glsUniformBC.UniformFlags.LAYOUT_COLUMN_MAJOR }
        ];

        /** @type {Array.<string, glsUniformBC.BufferMode>} */
        var bufferModes = [
            { name: 'per_block_buffer', mode: glsUniformBC.BufferMode.BUFFERMODE_PER_BLOCK },
            { name: 'single_buffer', mode: glsUniformBC.BufferMode.BUFFERMODE_SINGLE }
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
                    createBlockBasicTypeCases(layoutGroup, typeName, new glsUniformBC.VarType().VarTypeBasic(type, 0), layoutFlags[layoutFlagNdx].flags);
                else
                {
                    for (var precNdx = 0; precNdx < precisionFlags.length; precNdx++)
                        createBlockBasicTypeCases(layoutGroup, precisionFlags[precNdx].name + '_' + typeName,
                            new glsUniformBC.VarType().VarTypeBasic(type, precisionFlags[precNdx].flags), layoutFlags[layoutFlagNdx].flags);
                }

                if (deqpUtils.isDataTypeMatrix(type))
                {
                    for (var matFlagNdx = 0; matFlagNdx < matrixFlags.length; matFlagNdx++)
                    {
                        for (var precNdx = 0; precNdx < precisionFlags.length; precNdx++)
                            createBlockBasicTypeCases(layoutGroup, matrixFlags[matFlagNdx].name + '_' + precisionFlags[precNdx].name + '_' + typeName,
                                new glsUniformBC.VarType().VarTypeBasic(type, precisionFlags[precNdx].flags), layoutFlags[layoutFlagNdx].flags | matrixFlags[matFlagNdx].flags);
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
                    new glsUniformBC.VarType().VarTypeArray(new glsUniformBC.VarType().VarTypeBasic(type, deqpUtils.isDataTypeBoolOrBVec(type) ? 0 : glsUniformBC.UniformFlags.PRECISION_HIGH), arraySize),
                    layoutFlags[layoutFlagNdx].flags);

                if (deqpUtils.isDataTypeMatrix(type))
                {
                    for (var matFlagNdx = 0; matFlagNdx < matrixFlags.length; matFlagNdx++)
                        createBlockBasicTypeCases(layoutGroup, matrixFlags[matFlagNdx].name + '_' + typeName,
                            new glsUniformBC.VarType().VarTypeArray(new glsUniformBC.VarType().VarTypeBasic(type, glsUniformBC.UniformFlags.PRECISION_HIGH), arraySize),
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

                    if (bufferModes[modeNdx].mode == glsUniformBC.BufferMode.BUFFERMODE_SINGLE && isArray == 0)
                        continue; // Doesn't make sense to add this variant.

                    if (isArray)
                        baseName += '_instance_array';

                    modeGroup.addChild(new BlockSingleStructCase(baseName + '_vertex', '', baseFlags | glsUniformBC.UniformFlags.DECLARE_VERTEX, bufferModes[modeNdx].mode, isArray ? 3 : 0));
                    modeGroup.addChild(new BlockSingleStructCase(baseName + '_fragment', '', baseFlags | glsUniformBC.UniformFlags.DECLARE_FRAGMENT, bufferModes[modeNdx].mode, isArray ? 3 : 0));

                    if (!(baseFlags & glsUniformBC.UniformFlags.LAYOUT_PACKED))
                        modeGroup.addChild(new BlockSingleStructCase(baseName + '_both', '', baseFlags | glsUniformBC.UniformFlags.DECLARE_VERTEX | glsUniformBC.UniformFlags.DECLARE_FRAGMENT, bufferModes[modeNdx].mode, isArray ? 3 : 0));
                }
            }
        }
        //TODO: Remove
        testPassedOptions('Init ubo.single_struct', true);
    };

    /**
     * Create and execute the test cases
     * @param {string} filter Optional filter
     */
    var run = function(filter) {
        init(filter);
        alert('finished!');
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
