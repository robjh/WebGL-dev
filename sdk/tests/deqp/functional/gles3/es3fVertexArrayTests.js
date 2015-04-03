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
    'framework/delibs/debase/deRandom'], function(
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
        deRandom) {
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
     * SingleVertexArrayUsageTests
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
     */
    var VertexArrayTestGroup = function () {
        tcuTestCase.DeqpTests.call(this, "vertex_arrays", "Vertex array and array tests");
    };

    VertexArrayTestGroup.prototype = Object.create(tcuTestCase.DeqpTests.prototype);
    VertexArrayTestGroup.prototype.constructor = VertexArrayTestGroup;

    /**
     * init
     */
    void VertexArrayTestGroup.prototype.init = function () {
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
