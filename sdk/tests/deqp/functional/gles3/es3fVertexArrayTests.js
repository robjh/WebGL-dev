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

'use strict';
goog.provide('functional.gles3.es3fVertexArrayTests');
goog.require('framework.common.tcuSurface');
goog.require('framework.common.tcuTestCase');
goog.require('framework.common.tcuTexture');
goog.require('framework.delibs.debase.deMath');
goog.require('framework.delibs.debase.deRandom');
goog.require('framework.delibs.debase.deString');
goog.require('framework.opengl.gluDefs');
goog.require('framework.opengl.gluDrawUtil');
goog.require('framework.opengl.gluShaderProgram');
goog.require('framework.opengl.gluShaderUtil');
goog.require('framework.opengl.gluTexture');
goog.require('framework.opengl.gluVarType');
goog.require('modules.shared.glsVertexArrayTests');


goog.scope(function() {

var es3fVertexArrayTests = functional.gles3.es3fVertexArrayTests;
var gluDefs = framework.opengl.gluDefs;
var gluDrawUtil = framework.opengl.gluDrawUtil;
var gluShaderUtil = framework.opengl.gluShaderUtil;
var gluShaderProgram = framework.opengl.gluShaderProgram;
var gluTexture = framework.opengl.gluTexture;
var gluVarType = framework.opengl.gluVarType;
var tcuTestCase = framework.common.tcuTestCase;
var tcuSurface = framework.common.tcuSurface;
var tcuTexture = framework.common.tcuTexture;
var deMath = framework.delibs.debase.deMath;
var deString = framework.delibs.debase.deString;
var deRandom = framework.delibs.debase.deRandom;
var glsVertexArrayTests = modules.shared.glsVertexArrayTests;


    var DE_ASSERT = function(x) {
        if (!x)
            throw new Error('Assert failed');
    };

    es3fVertexArrayTests.DE_STATIC_ASSERT = function(x) {
        if (!x)
            throw new Error('Assert failed');
    };

    es3fVertexArrayTests.DE_NULL = null;

    /**
     * es3fVertexArrayTests.SingleVertexArrayStrideGroup
     * @constructor
     * @param {glsVertexArrayTests.deArray.InputType} type
     */
    es3fVertexArrayTests.SingleVertexArrayStrideGroup = function(type) {
        tcuTestCase.DeqpTest.call(this, glsVertexArrayTests.deArray.inputTypeToString(type), glsVertexArrayTests.deArray.inputTypeToString(type));
        this.makeExecutable();
        this.m_type = type;
    };

    es3fVertexArrayTests.SingleVertexArrayStrideGroup.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    es3fVertexArrayTests.SingleVertexArrayStrideGroup.prototype.constructor = es3fVertexArrayTests.SingleVertexArrayStrideGroup;

    es3fVertexArrayTests.SingleVertexArrayStrideGroup.prototype.init = function() {
        /** @type {glsVertexArrayTests.deArray.Storage} */ var storages = [
            // User storage not supported in WebGL - glsVertexArrayTests.deArray.Storage.USER,
            glsVertexArrayTests.deArray.Storage.BUFFER];
        var counts = [1, 256];
        var strides = [/*0,*/ -1, 17, 32]; // Tread negative value as sizeof input. Same as 0, but done outside of GL.

        for (var storageNdx = 0; storageNdx < storages.length; storageNdx++) {
            for (var componentCount = 2; componentCount < 5; componentCount++) {
                for (var countNdx = 0; countNdx < counts.length; countNdx++) {
                    for (var strideNdx = 0; strideNdx < strides.length; strideNdx++) {
                        /** @type {boolean} */ var packed = this.m_type == glsVertexArrayTests.deArray.InputType.UNSIGNED_INT_2_10_10_10 || this.m_type == glsVertexArrayTests.deArray.InputType.INT_2_10_10_10;
                        /** @type {number} */ var stride = (strides[strideNdx] < 0) ? ((packed) ? (16) : (glsVertexArrayTests.deArray.inputTypeSize(this.m_type) * componentCount)) : (strides[strideNdx]);
                        /** @type {number} */ var alignment = (packed) ? (glsVertexArrayTests.deArray.inputTypeSize(this.m_type) * componentCount) : (glsVertexArrayTests.deArray.inputTypeSize(this.m_type));
                        /** @type {boolean} */ var bufferUnaligned = (storages[storageNdx] == glsVertexArrayTests.deArray.Storage.BUFFER) && (stride % alignment) != 0;

                        /** @type {string} */ var name = glsVertexArrayTests.deArray.storageToString(storages[storageNdx]) + '_stride' + stride + '_components' + componentCount + '_quads' + counts[countNdx];

                        if ((this.m_type == glsVertexArrayTests.deArray.InputType.UNSIGNED_INT_2_10_10_10 ||
                            this.m_type == glsVertexArrayTests.deArray.InputType.INT_2_10_10_10) && componentCount != 4)
                            continue;

                        /** @type {glsVertexArrayTests.MultiVertexArrayTest.Spec.ArraySpec} */ var arraySpec = new glsVertexArrayTests.MultiVertexArrayTest.Spec.ArraySpec(
                            this.m_type,
                            glsVertexArrayTests.deArray.OutputType.VEC4,
                            storages[storageNdx],
                            glsVertexArrayTests.deArray.Usage.DYNAMIC_DRAW,
                            componentCount,
                            0,
                            stride,
                            false,
                            glsVertexArrayTests.GLValue.getMinValue(this.m_type),
                            glsVertexArrayTests.GLValue.getMaxValue(this.m_type)
                        );

                        /** @type {glsVertexArrayTests.MultiVertexArrayTest.Spec} */ var spec = new glsVertexArrayTests.MultiVertexArrayTest.Spec();

                        spec.primitive = glsVertexArrayTests.deArray.Primitive.TRIANGLES;
                        spec.drawCount = counts[countNdx];
                        spec.first = 0;
                        spec.arrays.push(arraySpec);

                        if (!bufferUnaligned)
                            this.addChild(new glsVertexArrayTests.MultiVertexArrayTest(spec, name, name));
                    }
                }
            }
        }
    };

    /**
     * es3fVertexArrayTests.SingleVertexArrayStrideTests
     * @constructor
     */
    es3fVertexArrayTests.SingleVertexArrayStrideTests = function() {
        tcuTestCase.DeqpTest.call(this, 'strides', 'Single stride vertex atribute');
        this.makeExecutable();
    };

    es3fVertexArrayTests.SingleVertexArrayStrideTests.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    es3fVertexArrayTests.SingleVertexArrayStrideTests.prototype.constructor = es3fVertexArrayTests.SingleVertexArrayStrideTests;

    es3fVertexArrayTests.SingleVertexArrayStrideTests.prototype.init = function() {
        /** @type {glsVertexArrayTests.deArray.InputType} */ var inputTypes = [
            glsVertexArrayTests.deArray.InputType.FLOAT,
            glsVertexArrayTests.deArray.InputType.SHORT,
            glsVertexArrayTests.deArray.InputType.BYTE,
            /*glsVertexArrayTests.deArray.InputType.UNSIGNED_SHORT,
            glsVertexArrayTests.deArray.InputType.UNSIGNED_BYTE,*/
            glsVertexArrayTests.deArray.InputType.FIXED,
            glsVertexArrayTests.deArray.InputType.INT_2_10_10_10];

        for (var inputTypeNdx = 0; inputTypeNdx < inputTypes.length; inputTypeNdx++)
        {
            this.addChild(new es3fVertexArrayTests.SingleVertexArrayStrideGroup(inputTypes[inputTypeNdx]));
        }
    };

    /**
     * es3fVertexArrayTests.SingleVertexArrayTestGroup
     * @constructor
     */
    es3fVertexArrayTests.SingleVertexArrayTestGroup = function() {
        tcuTestCase.DeqpTest.call(this, 'single_attribute', 'Single vertex atribute');
        this.makeExecutable();
    };

    es3fVertexArrayTests.SingleVertexArrayTestGroup.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    es3fVertexArrayTests.SingleVertexArrayTestGroup.prototype.constructor = es3fVertexArrayTests.SingleVertexArrayTestGroup;

    es3fVertexArrayTests.SingleVertexArrayTestGroup.prototype.init = function() {
        this.addChild(new es3fVertexArrayTests.SingleVertexArrayStrideTests());
        /*TODO: this.addChild(new SingleVertexArrayNormalizeTests(m_context));
        this.addChild(new SingleVertexArrayOutputTypeTests(m_context));
        this.addChild(new es3fVertexArrayTests.SingleVertexArrayUsageTests(m_context));
        this.addChild(new SingleVertexArrayOffsetTests(m_context));
        this.addChild(new SingleVertexArrayFirstTests(m_context));*/
    };

    /**
     * es3fVertexArrayTests.SingleVertexArrayUsageGroup
     * @constructor
     * @param {glsVertexArrayTests.deArray.Usage} usage
     */
    es3fVertexArrayTests.SingleVertexArrayUsageGroup = function(usage) {
        tcuTestCase.DeqpTest.call(this, glsVertexArrayTests.deArray.usageTypeToString(usage), glsVertexArrayTests.deArray.usageTypeToString(usage));
        this.makeExecutable();
        this.m_usage = usage;
    };

    es3fVertexArrayTests.SingleVertexArrayUsageGroup.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    es3fVertexArrayTests.SingleVertexArrayUsageGroup.prototype.constructor = es3fVertexArrayTests.SingleVertexArrayUsageGroup;

    /**
     * init
     */
    es3fVertexArrayTests.SingleVertexArrayUsageGroup.prototype.init = function() {
        /** @type {Array.<number>} */ var counts = [1, 256];
        /** @type {Array.<number>} */ var strides = [0, -1, 17, 32]; // Tread negative value as sizeof input. Same as 0, but done outside of GL.
        /** @type {glsVertexArrayTests.deArray.InputType} */ var inputTypes = [glsVertexArrayTests.deArray.InputType.FLOAT, glsVertexArrayTests.deArray.InputType.FIXED, glsVertexArrayTests.deArray.InputType.SHORT, glsVertexArrayTests.deArray.InputType.BYTE];

        for (var inputTypeNdx = 0; inputTypeNdx < inputTypes.length; inputTypeNdx++) {
            for (var countNdx = 0; countNdx < counts.length; countNdx++) {
                for (var strideNdx = 0; strideNdx < strides.length; strideNdx++) {
                    /** @type {number} */ var stride = (strides[strideNdx] < 0 ? glsVertexArrayTests.deArray.inputTypeSize(inputTypes[inputTypeNdx]) * 2 : strides[strideNdx]);
                    /** @type {boolean} */ var aligned = (stride % glsVertexArrayTests.deArray.inputTypeSize(inputTypes[inputTypeNdx])) == 0;
                    /** @type {string} */ var name = 'stride' + stride + '_' + glsVertexArrayTests.deArray.inputTypeToString(inputTypes[inputTypeNdx]) + '_quads' + counts[countNdx];

                    var arraySpec = new glsVertexArrayTests.MultiVertexArrayTest.Spec.ArraySpec(inputTypes[inputTypeNdx],
                                                                    glsVertexArrayTests.deArray.OutputType.VEC2,
                                                                    glsVertexArrayTests.deArray.Storage.BUFFER,
                                                                    this.m_usage,
                                                                    2,
                                                                    0,
                                                                    stride,
                                                                    false,
                                                                    glsVertexArrayTests.GLValue.getMinValue(inputTypes[inputTypeNdx]),
                                                                    glsVertexArrayTests.GLValue.getMaxValue(inputTypes[inputTypeNdx]));

                    var spec = new glsVertexArrayTests.MultiVertexArrayTest.Spec();
                    spec.primitive = glsVertexArrayTests.deArray.Primitive.TRIANGLES;
                    spec.drawCount = counts[countNdx];
                    spec.first = 0;
                    spec.arrays.push(arraySpec);

                    if (aligned)
                        this.addChild(new MultiVertexArrayTest(gl.getRenderContext(), spec, name, name));
                }
            }
        }
    };

    /**
     * es3fVertexArrayTests.SingleVertexArrayUsageTests
     * @constructor
     */
    es3fVertexArrayTests.SingleVertexArrayUsageTests = function() {
        tcuTestCase.DeqpTest.call(this, 'usages', 'Single vertex atribute, usage');
        this.makeExecutable();
    };

    es3fVertexArrayTests.SingleVertexArrayUsageTests.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    es3fVertexArrayTests.SingleVertexArrayUsageTests.prototype.constructor = es3fVertexArrayTests.SingleVertexArrayUsageTests;

    /**
     * es3fVertexArrayTests.SingleVertexArrayUsageTests.init
     */
    es3fVertexArrayTests.SingleVertexArrayUsageTests.prototype.init = function() {
        // Test usage
        /** @type {glsVertexArrayTests.deArray.Usage} */ var usages = [
            glsVertexArrayTests.deArray.Usage.STATIC_DRAW,
            glsVertexArrayTests.deArray.Usage.STREAM_DRAW,
            glsVertexArrayTests.deArray.Usage.DYNAMIC_DRAW,
            glsVertexArrayTests.deArray.Usage.STATIC_COPY,
            glsVertexArrayTests.deArray.Usage.STREAM_COPY,
            glsVertexArrayTests.deArray.Usage.DYNAMIC_COPY,
            glsVertexArrayTests.deArray.Usage.STATIC_READ,
            glsVertexArrayTests.deArray.Usage.STREAM_READ,
            glsVertexArrayTests.deArray.Usage.DYNAMIC_READ];

        for (var usageNdx = 0; usageNdx < usages.length; usageNdx++) {
            this.addChild(new es3fVertexArrayTests.SingleVertexArrayUsageGroup(usages[usageNdx]));
        }
    };

    /**
     * es3fVertexArrayTests.VertexArrayTestGroup
     * @constructor
     */
    es3fVertexArrayTests.VertexArrayTestGroup = function() {
        tcuTestCase.DeqpTest.call(this, 'vertex_arrays', 'Vertex array and array tests');
        this.makeExecutable();
    };

    es3fVertexArrayTests.VertexArrayTestGroup.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    es3fVertexArrayTests.VertexArrayTestGroup.prototype.constructor = es3fVertexArrayTests.VertexArrayTestGroup;

    /**
     * init
     */
    es3fVertexArrayTests.VertexArrayTestGroup.prototype.init = function() {
        this.addChild(new es3fVertexArrayTests.SingleVertexArrayTestGroup());
        //TODO: this.addChild(new MultiVertexArrayTestGroup());
    };

    /**
     * Create and execute the test cases
     * @param {WebGLRenderingContextBase} context
     */
    es3fVertexArrayTests.run = function(context) {
        gl = context;
        //Set up root Test
        var state = tcuTestCase.runner;

        var test = new es3fVertexArrayTests.VertexArrayTestGroup();
        var testName = test.fullName();
        var testDescription = test.getDescription();
        state.testCases = test;
        state.testName = testName;

        //Set up name and description of this test series.
        setCurrentTestName(testName);
        description(testDescription);

        try {
            //Run test cases
            tcuTestCase.runTestCases();
        } catch (err) {
            testFailedOptions('Failed to es3fVertexArrayTests.run tests', false);
            tcuTestCase.runner.terminate();
        }
    };

});
