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
    'framework/opengl/gluDefs',
    'framework/opengl/gluDrawUtil',
    'framework/opengl/gluShaderUtil',
    'framework/opengl/gluShaderProgram',
    'framework/opengl/gluTexture',
    'framework/opengl/gluVarType',
    'framework/common/tcuTestCase',
    'framework/common/tcuSurface',
    'framework/common/tcuTexture',
    'framework/delibs/debase/deMath',
    'framework/delibs/debase/deString',
    'framework/delibs/debase/deRandom',
    'modules/shared/glsVertexArrayTests'
       ], function(
        gluDefs,
        gluDrawUtil,
        gluShaderUtil,
        gluShaderProgram,
        gluTexture,
        gluVarType,
        tcuTestCase,
        tcuSurface,
        tcuTexture,
        deMath,
        deString,
        deRandom,
        glsVertexArrayTests
    ) {
    'use strict';

    var gl = 0;

    var DE_ASSERT = function(x) {
        if (!x)
            throw new Error('Assert failed');
    };

    var DE_STATIC_ASSERT = function(x) {
        if (!x)
            throw new Error('Assert failed');
    };

    var DE_NULL = null;

    /**
     * SingleVertexArrayUsageGroup
     * @constructor
     * @param {glsVertexArrayTests.deArray.Usage} usage
     */
    var SingleVertexArrayUsageGroup = function (usage) {
        tcuTestCase.DeqpTests.call(this, deArray.usageTypeToString(usage), deArray.usageTypeToString(usage));
        this.m_usage = usage
    };

    SingleVertexArrayUsageGroup.prototype = Object.create(tcuTestCase.DeqpTests.prototype);
    SingleVertexArrayUsageGroup.prototype.constructor = SingleVertexArrayUsageGroup;

    /**
     * init
     */
    SingleVertexArrayUsageGroup.prototype.init = function () {
        /** @type {Array.<number>} */ var counts = [1, 256];
        /** @type {Array.<number>} */ var strides = [0, -1, 17, 32]; // Tread negative value as sizeof input. Same as 0, but done outside of GL.
        /** @type {glsVertexArrayTests.deArray.InputType} */ var inputTypes = [glsVertexArrayTests.deArray.InputType.FLOAT, glsVertexArrayTests.deArray.InputType.FIXED, glsVertexArrayTests.deArray.InputType.SHORT, glsVertexArrayTests.deArray.InputType.BYTE];

        for (var inputTypeNdx = 0; inputTypeNdx < inputTypes.length; inputTypeNdx++) {
            for (var countNdx = 0; countNdx < counts.length; countNdx++) {
                for (var strideNdx = 0; strideNdx < strides.length; strideNdx++) {
                    /** @type {number} */ var stride = (strides[strideNdx] < 0 ? glsVertexArrayTests.deArray.inputTypeSize(inputTypes[inputTypeNdx]) * 2 : strides[strideNdx]);
                    /** @type {boolean} */ var aligned = (stride % glsVertexArrayTests.deArray.inputTypeSize(inputTypes[inputTypeNdx])) == 0;
                    /** @type {string} */ var name = "stride" + stride + "_" + glsVertexArrayTests.deArray.inputTypeToString(inputTypes[inputTypeNdx]) + "_quads" + counts[countNdx];

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
                    spec.primitive  = glsVertexArrayTests.deArray.Primitive.TRIANGLES;
                    spec.drawCount  = counts[countNdx];
                    spec.first      = 0;
                    spec.arrays.push(arraySpec);

                    if (aligned)
                        this.addChild(new MultiVertexArrayTest(gl.getRenderContext(), spec, name, name));
                }
            }
        }
    };

    /**
     * SingleVertexArrayUsageTests
     * @constructor
     */
    var SingleVertexArrayUsageTests = function () {
        tcuTestCase.DeqpTests.call(this, "usages", "Single vertex atribute, usage");
    };

    SingleVertexArrayUsageTests.prototype = Object.create(tcuTestCase.DeqpTests.prototype);
    SingleVertexArrayUsageTests.prototype.constructor = SingleVertexArrayUsageTests;

    /**
     * SingleVertexArrayUsageTests.init
     */
    SingleVertexArrayUsageTests.prototype.init = function() {
        // Test usage
        /** @type {deArray.Usage} */ var usages = [ deArray.Usage.STATIC_DRAW, deArray.Usage.STREAM_DRAW, deArray.Usage.DYNAMIC_DRAW, deArray.Usage.STATIC_COPY, deArray.Usage.STREAM_COPY, deArray.Usage.DYNAMIC_COPY, deArray.Usage.STATIC_READ, deArray.Usage.STREAM_READ, deArray.Usage.DYNAMIC_READ ];
        for (var usageNdx = 0; usageNdx < usages.length; usageNdx++)
        {
            this.addChild(new SingleVertexArrayUsageGroup(usages[usageNdx]));
        }
    };

    /**
     * VertexArrayTestGroup
     * @constructor
     */
    var VertexArrayTestGroup = function () {
        tcuTestCase.DeqpTests.call(this, "vertex_arrays", "Vertex array and array tests");
    };

    VertexArrayTestGroup.prototype = Object.create(tcuTestCase.DeqpTests.prototype);
    VertexArrayTestGroup.prototype.constructor = VertexArrayTestGroup;

    /**
     * init
     */
    VertexArrayTestGroup.prototype.init = function () {
        this.addChild(new SingleVertexArrayTestGroup());
        //TODO: this.addChild(new MultiVertexArrayTestGroup());
    };

    /**
     * Create and execute the test cases
     * @param {WebGLRenderingContextBase} context
     */
    var run = function(context) {
        gl = context;
        //Set up root Test
        var state = tcuTestCase.runner.getState();

        var test = new VertexArrayTestGroup();
        var testName = test.fullName();
        var testDescription = test.getDescription();
        state.testCases = test;
        state.testName = testName;

        //Set up name and description of this test series.
        setCurrentTestName(testName);
        description(testDescription);

        try {
            //Create test cases
            test.init();
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
