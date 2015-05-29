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
     * init
     */
    es3fDrawTests.init = function() {
        // Basic
        /** @type {es3fDrawTests.DrawTestSpec} */ basicMethods = [
            es3fDrawTests.DrawTestSpec.DRAWMETHOD_DRAWARRAYS,
            es3fDrawTests.DrawTestSpec.DRAWMETHOD_DRAWELEMENTS,
            es3fDrawTests.DrawTestSpec.DRAWMETHOD_DRAWARRAYS_INSTANCED,
            es3fDrawTests.DrawTestSpec.DRAWMETHOD_DRAWELEMENTS_INSTANCED,
            es3fDrawTests.DrawTestSpec.DRAWMETHOD_DRAWELEMENTS_RANGED,
        };

        for (int ndx = 0; ndx < DE_LENGTH_OF_ARRAY(basicMethods); ++ndx)
        {
            const std::string name = gls::DrawTestSpec::drawMethodToString(basicMethods[ndx]);
            const std::string desc = gls::DrawTestSpec::drawMethodToString(basicMethods[ndx]);

            this->addChild(new MethodGroup(m_context, name.c_str(), desc.c_str(), basicMethods[ndx]));
        }

        // extreme instancing

        this->addChild(new InstancingGroup(m_context, "instancing", "draw tests with a large instance count."));

        // Random

        this->addChild(new RandomGroup(m_context, "random", "random draw commands."));
    }

    /**
     * Create and execute the test cases
     * @param {WebGL2RenderingContext} context
     */
    es3fDrawTests.run = function(context) {
        gl = context;
        //Set up Test Root parameters
        var testName = 'draw';
        var testDescription = 'Drawing tests';
        var state = tcuTestCase.runner;

        state.setRoot(tcuTestCase.newTest(testName, testDescription, null));

        //Set up name and description of this test series.
        setCurrentTestName(testName);
        description(testDescription);

        try {
            //Create test cases
            es3fDrawTests.init();
            //Run test cases
            tcuTestCase.runTestCases();
        }
        catch (err) {
            testFailedOptions('Failed to es3fUniformBlockTests.run tests', false);
            tcuTestCase.runner.terminate();
        }
    };

});
