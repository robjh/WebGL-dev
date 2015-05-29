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
goog.provide('functional.gles3.es3fDrawTests');
goog.require('framework.common.tcuSurface');
goog.require('framework.common.tcuTestCase');
goog.require('framework.common.tcuTexture');
goog.require('framework.delibs.debase.deMath');
goog.require('framework.delibs.debase.deRandom');
goog.require('framework.delibs.debase.deString');
goog.require('framework.delibs.debase.deUtil');
goog.require('framework.opengl.gluDrawUtil');
goog.require('framework.opengl.gluShaderProgram');
goog.require('framework.opengl.gluShaderUtil');
goog.require('framework.opengl.gluTexture');
goog.require('framework.opengl.gluVarType');

goog.scope(function() {

    var es3fDrawTests = functional.gles3.es3fDrawTests;
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
    var deUtil = framework.delibs.debase.deUtil;
    var glsVertexArrayTests = modules.shared.glsVertexArrayTests;

    /** @type {WebGL2RenderingContext}*/ var gl;

    /**
     * @enum
     */
    es3fDrawTests.TestIterationType = {
        DRAW_COUNT: 0,        // !< test with 1, 5, and 25 primitives
        INSTANCE_COUNT: 1,    // !< test with 1, 4, and 11 instances
        INDEX_RANGE: 2
    };

    /**
     * @param {glsDrawTests.DrawTest} test
     * @param {glsDrawTests.DrawTestSpec} baseSpec
     * @param {?es3fDrawTests.TestIterationType} type
     */
    es3fDrawTests.addTestIterations = function (test, baseSpec, type)
    {
        /** @type {glsDrawTests.DrawTestSpec} */ var spec = deUtil.clone(baseSpec);

        if (type == es3fDrawTests.TestIterationType.DRAW_COUNT)
        {
            spec.primitiveCount = 1;
            test.addIteration(spec, "draw count = 1");

            spec.primitiveCount = 5;
            test.addIteration(spec, "draw count = 5");

            spec.primitiveCount = 25;
            test.addIteration(spec, "draw count = 25");
        }
        else if (type == es3fDrawTests.TestIterationType.INSTANCE_COUNT)
        {
            spec.instanceCount = 1;
            test.addIteration(spec, "instance count = 1");

            spec.instanceCount = 4;
            test.addIteration(spec, "instance count = 4");

            spec.instanceCount = 11;
            test.addIteration(spec, "instance count = 11");
        }
        else if (type == es3fDrawTests.TestIterationType.INDEX_RANGE)
        {
            spec.indexMin = 0;
            spec.indexMax = 23;
            test.addIteration(spec, "index range = [0, 23]");

            spec.indexMin = 23;
            spec.indexMax = 40;
            test.addIteration(spec, "index range = [23, 40]");

            // Only makes sense with points
            if (spec.primitive == glsDrawTests.DrawTestSpec.Primitive.POINTS)
            {
                spec.indexMin = 5;
                spec.indexMax = 5;
                test.addIteration(spec, "index range = [5, 5]");
            }
        }
        else
            throw new Error('Invalid test iteration type');
    };

    /**
     * @param {glsDrawTests.DrawTestSpec} spec
     * @param {?glsDrawTests.DrawTestSpec.DrawMethod} method
     */
    es3fDrawTests.genBasicSpec = function (spec, method)
    {
        //spec.apiType                = glu::ApiType::es(3,0);
        spec.primitive                = glsDrawTests.DrawTestSpec.Primitive.TRIANGLES;
        spec.primitiveCount            = 5;
        spec.drawMethod                = method;
        spec.indexType                = null;
        spec.indexPointerOffset        = 0;
        spec.indexStorage            = null;
        spec.first                    = 0;
        spec.indexMin                = 0;
        spec.indexMax                = 0;
        spec.instanceCount            = 1;

        spec.attribs[0].inputType                = glsDrawTests.DrawTestSpec.InputType.FLOAT;
        spec.attribs[0].outputType                = glsDrawTests.DrawTestSpec.OutputType.VEC2;
        spec.attribs[0].storage                    = glsDrawTests.DrawTestSpec.Storage.BUFFER;
        spec.attribs[0].usage                    = glsDrawTests.DrawTestSpec.Usage.STATIC_DRAW;
        spec.attribs[0].componentCount            = 4;
        spec.attribs[0].offset                    = 0;
        spec.attribs[0].stride                    = 0;
        spec.attribs[0].normalize                = false;
        spec.attribs[0].instanceDivisor            = 0;
        spec.attribs[0].useDefaultAttribute        = false;

        spec.attribs[1].inputType                = glsDrawTests.DrawTestSpec.InputType.FLOAT;
        spec.attribs[1].outputType                = glsDrawTests.DrawTestSpec.OutputType.VEC2;
        spec.attribs[1].storage                    = glsDrawTests.DrawTestSpec.Storage.BUFFER;
        spec.attribs[1].usage                    = glsDrawTests.DrawTestSpec.Usage.STATIC_DRAW;
        spec.attribs[1].componentCount            = 2;
        spec.attribs[1].offset                    = 0;
        spec.attribs[1].stride                    = 0;
        spec.attribs[1].normalize                = false;
        spec.attribs[1].instanceDivisor            = 0;
        spec.attribs[1].useDefaultAttribute        = false;
    };

    /**
     * @constructor
     * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} descr
     * @param {?glsDrawTests.DrawTestSpec.DrawMethod} drawMethod
     */
    es3fDrawTests.FirstGroup = function (name, descr, drawMethod) {
        tcuTestCase.DeqpTest.call(this, name, descr);
        /** @type {?glsDrawTests.DrawTestSpec.DrawMethod} */ this.m_method = drawMethod;
    };

    es3fDrawTests.FirstGroup.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    es3fDrawTests.FirstGroup.prototype.constructor = es3fDrawTests.FirstGroup;

    /**
     * init
     */
    es3fDrawTests.FirstGroup.prototype.init = function()
    {
        firsts =
        [
            1, 3, 17
        ];

        /** @type {glsDrawTests.DrawTestSpec} */ var spec = new glsDrawTests.DrawTestSpec();
        es3fDrawTests.genBasicSpec(spec, m_method);

        for (var firstNdx = 0; firstNdx < firsts.length; ++firstNdx)
        {
            var name = "first_" + firsts[firstNdx];
            var desc = "first " + firsts[firstNdx];
            /** @type {glsDrawTests.DrawTest} */ var test = new glsDrawTests.DrawTest(null, name, desc);

            spec.first = firsts[firstNdx];

            es3fDrawTests.addTestIterations(test, spec, TYPE_DRAW_COUNT);

            this.addChild(test);
        }
    };

    /**
     * @constructor
     * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} descr
     * @param {?glsDrawTests.DrawTestSpec.DrawMethod} drawMethod
     */
    es3fDrawTests.MethodGroup = function (name, descr, drawMethod) {
        tcuTestCase.DeqpTest.call(this, name, descr);
        /** @type {?glsDrawTests.DrawTestSpec.DrawMethod} */ this.m_method = drawMethod;
    };

    es3fDrawTests.MethodGroup.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    es3fDrawTests.MethodGroup.prototype.constructor = es3fDrawTests.MethodGroup;

    /**
     * init
     */
    es3fDrawTests.MethodGroup.prototype.init = function ()
    {
        var indexed = (this.m_method == glsDrawTests.DrawTestSpec.DrawMethod.DRAWELEMENTS) || (this.m_method == glsDrawTests.DrawTestSpec.DrawMethod.DRAWELEMENTS_INSTANCED) || (this.m_method == glsDrawTests.DrawTestSpec.DrawMethod.DRAWELEMENTS_RANGED);
        var hasFirst = (this.m_method == glsDrawTests.DrawTestSpec.DrawMethod.DRAWARRAYS) || (this.m_method == glsDrawTests.DrawTestSpec.DrawMethod.DRAWARRAYS_INSTANCED);

        var primitive =
        [
            glsDrawTests.DrawTestSpec.Primitive.POINTS,
            glsDrawTests.DrawTestSpec.Primitive.TRIANGLES,
            glsDrawTests.DrawTestSpec.Primitive.TRIANGLE_FAN,
            glsDrawTests.DrawTestSpec.Primitive.TRIANGLE_STRIP,
            glsDrawTests.DrawTestSpec.Primitive.LINES,
            glsDrawTests.DrawTestSpec.Primitive.LINE_STRIP,
            glsDrawTests.DrawTestSpec.Primitive.LINE_LOOP
        ];

        if (hasFirst)
        {
            // First-tests
            this.addChild(new es3fDrawTests.FirstGroup("first", "First tests", this.m_method));
        }

        /*if (indexed)
        {
            // Index-tests
            if (this.m_method != glsDrawTests.DrawTestSpec.DrawMethod.DRAWELEMENTS_RANGED)
                this.addChild(new es3fDrawTests.IndexGroup("indices", "Index tests", this.m_method));
        }

        for (var ndx = 0; ndx < primitive.length; ++ndx)
        {
            var name = glsDrawTests.DrawTestSpec.primitiveToString(primitive[ndx]);
            var desc = glsDrawTests.DrawTestSpec.primitiveToString(primitive[ndx]);

            this.addChild(new es3fDrawTests.AttributeGroup(name, desc, this.m_method, primitive[ndx], glsDrawTests.DrawTestSpec.IndexType.SHORT, glsDrawTests.DrawTestSpec.Storage.BUFFER));
        }*/
    };

    /**
     * @constructor
     * @extends {tcuTestCase.DeqpTest}
     */
    es3fDrawTests.DrawTest = function () {
        tcuTestCase.DeqpTest.call(this, 'draw', 'Drawing tests');
    };

    es3fDrawTests.DrawTest.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    es3fDrawTests.DrawTest.prototype.constructor = es3fDrawTests.DrawTest;

    /**
     * init
     */
    es3fDrawTests.DrawTest.prototype.init = function() {
        // Basic
        /** @type {Array<es3fDrawTests.DrawTestSpec.DrawMethod>} */ basicMethods = [
            es3fDrawTests.DrawTestSpec.DrawMethod.DRAWARRAYS,
            es3fDrawTests.DrawTestSpec.DrawMethod.DRAWELEMENTS,
            es3fDrawTests.DrawTestSpec.DrawMethod.DRAWARRAYS_INSTANCED,
            es3fDrawTests.DrawTestSpec.DrawMethod.DRAWELEMENTS_INSTANCED,
            es3fDrawTests.DrawTestSpec.DrawMethod.DRAWELEMENTS_RANGED
        ];

        for (var ndx = 0; ndx < basicMethods.length; ++ndx)
        {
            var name = glsDrawTests.DrawTestSpec.drawMethodToString(basicMethods[ndx]);
            var desc = glsDrawTests.DrawTestSpec.drawMethodToString(basicMethods[ndx]);

            this.addChild(new es3fDrawTests.MethodGroup(name, desc, basicMethods[ndx]));
        }

        // extreme instancing

        //this.addChild(new es3fDrawTests.InstancingGroup("instancing", "draw tests with a large instance count."));

        // Random

        //this.addChild(new es3fDrawTests.RandomGroup("random", "random draw commands."));
    };

    /**
     * Create and execute the test cases
     * @param {WebGL2RenderingContext} context
     */
    es3fDrawTests.run = function(context) {
        gl = context;
        //Set up Test Root parameters
        var state = tcuTestCase.runner;

        var rootTest = new es3fDrawTests.DrawTest();
        state.setRoot(rootTest);

        //Set up name and description of this test series.
        setCurrentTestName(rootTest.fullName());
        description(rootTest.getDesc());

        try {
            //Run test cases
            tcuTestCase.runTestCases();
        }
        catch (err) {
            testFailedOptions('Failed to run draw tests', false);
            tcuTestCase.runner.terminate();
        }
    };

});
