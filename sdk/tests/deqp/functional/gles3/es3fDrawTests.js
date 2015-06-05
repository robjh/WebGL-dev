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
goog.require('modules.shared.glsDrawTests');

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
    var glsDrawTests = modules.shared.glsDrawTests;

    /** @type {WebGL2RenderingContext}*/ var gl;

    /**
     * @enum
     */
    es3fDrawTests.TestIterationType = {
        DRAW_COUNT: 0,        // !< test with 2, 6, and 26 primitives
        INSTANCE_COUNT: 1,    // !< test with 2, 4, and 12 instances
        INDEX_RANGE: 2
    };

    /**
     * @param {glsDrawTests.DrawTest} test
     * @param {glsDrawTests.DrawTestSpec} baseSpec
     * @param {?es3fDrawTests.TestIterationType} type
     */
    es3fDrawTests.addTestIterations = function (test, baseSpec, type)
    {
        /** @type {glsDrawTests.DrawTestSpec} */ var spec = /** @type {glsDrawTests.DrawTestSpec} */ (deUtil.clone(baseSpec));

        //JS RefRast only draws quads, so changing the primitive counts, leave original commented
        if (type == es3fDrawTests.TestIterationType.DRAW_COUNT) {
            spec.primitiveCount = 2;
            test.addIteration(spec, "draw count = 2");

            spec.primitiveCount = 6;
            test.addIteration(spec, "draw count = 6");

            spec.primitiveCount = 26;
            test.addIteration(spec, "draw count = 26");
        }
        else if (type == es3fDrawTests.TestIterationType.INSTANCE_COUNT) {
            spec.instanceCount = 2;
            test.addIteration(spec, "instance count = 2");

            spec.instanceCount = 4;
            test.addIteration(spec, "instance count = 4");

            spec.instanceCount = 12;
            test.addIteration(spec, "instance count = 12");
        }
        else if (type == es3fDrawTests.TestIterationType.INDEX_RANGE) {
            spec.indexMin = 0;
            spec.indexMax = 24;
            test.addIteration(spec, "index range = [0, 24]");

            spec.indexMin = 24;
            spec.indexMax = 40;
            test.addIteration(spec, "index range = [24, 40]");

            // Only makes sense with points
            if (spec.primitive == glsDrawTests.DrawTestSpec.Primitive.POINTS) {
                spec.indexMin = 6;
                spec.indexMax = 6;
                test.addIteration(spec, "index range = [6, 6]");
            }
        }
        else
            throw new Error('Invalid test iteration type');
    };

    /**
     * @param {glsDrawTests.DrawTestSpec} spec
     * @param {?glsDrawTests.DrawTestSpec.DrawMethod} method
     */
    es3fDrawTests.genBasicSpec = function (spec, method) {
        //spec.apiType                = glu::ApiType::es(3,0);
        spec.primitive                = glsDrawTests.DrawTestSpec.Primitive.TRIANGLES;
        spec.primitiveCount            = 6;
        spec.drawMethod                = method;
        spec.indexType                = null;
        spec.indexPointerOffset        = 0;
        spec.indexStorage            = null;
        spec.first                    = 0;
        spec.indexMin                = 0;
        spec.indexMax                = 0;
        spec.instanceCount            = 1;

        spec.attribs.push(new glsDrawTests.DrawTestSpec.AttributeSpec());

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

        spec.attribs.push(new glsDrawTests.DrawTestSpec.AttributeSpec());

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
     * @param {?glsDrawTests.DrawTestSpec.Primitive} primitive
     * @param {?glsDrawTests.DrawTestSpec.IndexType} indexType
     * @param {?glsDrawTests.DrawTestSpec.Storage} indexStorage
     */
    es3fDrawTests.AttributeGroup = function(name, descr, drawMethod, primitive, indexType, indexStorage) {
        tcuTestCase.DeqpTest.call(this, name, descr);
        this.m_method = drawMethod;
        this.m_primitive = primitive;
        this.m_indexType = indexType;
        this.m_indexStorage = indexStorage;
        this.makeExecutable();
    };

    es3fDrawTests.AttributeGroup.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    es3fDrawTests.AttributeGroup.prototype.constructor = es3fDrawTests.AttributeGroup;

    es3fDrawTests.AttributeGroup.prototype.init = function () {
        // select test type
        /** @type {boolean} */ var instanced = this.m_method == glsDrawTests.DrawTestSpec.DrawMethod.DRAWARRAYS_INSTANCED ||
            this.m_method == glsDrawTests.DrawTestSpec.DrawMethod.DRAWELEMENTS_INSTANCED;
        /** @type {boolean} */ var ranged = this.m_method == glsDrawTests.DrawTestSpec.DrawMethod.DRAWELEMENTS_RANGED;
        /** @type {es3fDrawTests.TestIterationType} */ var testType = instanced ? es3fDrawTests.TestIterationType.INSTANCE_COUNT :
            (ranged ? es3fDrawTests.TestIterationType.INDEX_RANGE : es3fDrawTests.TestIterationType.DRAW_COUNT);

        // Single attribute
        /** @type {glsDrawTests.DrawTest} */ var test = new glsDrawTests.DrawTest(null, "single_attribute", "Single attribute array.");
        /** @type {glsDrawTests.DrawTestSpec} */ var spec = new glsDrawTests.DrawTestSpec();

        //spec.apiType = glu::ApiType::es(3,0);
        spec.primitive = this.m_primitive;
        spec.primitiveCount = 6; //JS refrast value for quads
        spec.drawMethod = this.m_method;
        spec.indexType = this.m_indexType;
        spec.indexPointerOffset = 0;
        spec.indexStorage = this.m_indexStorage;
        spec.first = 0;
        spec.indexMin = 0;
        spec.indexMax = 0;
        spec.instanceCount = 1;

        spec.attribs.length = 0;

        spec.attribs.push(new glsDrawTests.DrawTestSpec.AttributeSpec());
        spec.attribs[0].inputType = glsDrawTests.DrawTestSpec.InputType.FLOAT;
        spec.attribs[0].outputType = glsDrawTests.DrawTestSpec.OutputType.VEC2;
        spec.attribs[0].storage = glsDrawTests.DrawTestSpec.Storage.BUFFER;
        spec.attribs[0].usage = glsDrawTests.DrawTestSpec.Usage.STATIC_DRAW;
        spec.attribs[0].componentCount = 2;
        spec.attribs[0].offset = 0;
        spec.attribs[0].stride = 0;
        spec.attribs[0].normalize = false;
        spec.attribs[0].instanceDivisor = 0;
        spec.attribs[0].useDefaultAttribute = false;

        es3fDrawTests.addTestIterations(test, spec, testType);

        this.addChild(test);

        // Multiple attribute

        test = new glsDrawTests.DrawTest(null, "multiple_attributes", "Multiple attribute arrays.");
        spec.primitive = this.m_primitive;
        spec.primitiveCount = 6; //JS refrast value for quads
        spec.drawMethod = this.m_method;
        spec.indexType = this.m_indexType;
        spec.indexPointerOffset = 0;
        spec.indexStorage = this.m_indexStorage;
        spec.first = 0;
        spec.indexMin = 0;
        spec.indexMax = 0;
        spec.instanceCount = 1;

        spec.attribs.length = 0;

        spec.attribs.push(new glsDrawTests.DrawTestSpec.AttributeSpec());
        spec.attribs[0].inputType = glsDrawTests.DrawTestSpec.InputType.FLOAT;
        spec.attribs[0].outputType = glsDrawTests.DrawTestSpec.OutputType.VEC2;
        spec.attribs[0].storage = glsDrawTests.DrawTestSpec.Storage.BUFFER;
        spec.attribs[0].usage = glsDrawTests.DrawTestSpec.Usage.STATIC_DRAW;
        spec.attribs[0].componentCount = 4;
        spec.attribs[0].offset = 0;
        spec.attribs[0].stride = 0;
        spec.attribs[0].normalize = false;
        spec.attribs[0].instanceDivisor = 0;
        spec.attribs[0].useDefaultAttribute = false;

        spec.attribs.push(new glsDrawTests.DrawTestSpec.AttributeSpec());
        spec.attribs[1].inputType = glsDrawTests.DrawTestSpec.InputType.FLOAT;
        spec.attribs[1].outputType = glsDrawTests.DrawTestSpec.OutputType.VEC2;
        spec.attribs[1].storage = glsDrawTests.DrawTestSpec.Storage.BUFFER;
        spec.attribs[1].usage = glsDrawTests.DrawTestSpec.Usage.STATIC_DRAW;
        spec.attribs[1].componentCount = 2;
        spec.attribs[1].offset = 0;
        spec.attribs[1].stride = 0;
        spec.attribs[1].normalize = false;
        spec.attribs[1].instanceDivisor = 0;
        spec.attribs[1].useDefaultAttribute = false;

        es3fDrawTests.addTestIterations(test, spec, testType);

        this.addChild(test);

        // Multiple attribute, second one divided

        test = new glsDrawTests.DrawTest(null, "instanced_attributes", "Instanced attribute array.");

        //spec.apiType                                = glu::ApiType::es(3,0);
        spec.primitive                                = this.m_primitive;
        spec.primitiveCount                            = 6; //JS refrast value for quads
        spec.drawMethod                                = this.m_method;
        spec.indexType                                = this.m_indexType;
        spec.indexPointerOffset                        = 0;
        spec.indexStorage                            = this.m_indexStorage;
        spec.first                                    = 0;
        spec.indexMin                                = 0;
        spec.indexMax                                = 0;
        spec.instanceCount                            = 1;

        spec.attribs.length = 0;

        spec.attribs.push(new glsDrawTests.DrawTestSpec.AttributeSpec());
        spec.attribs[0].inputType                    = glsDrawTests.DrawTestSpec.InputType.FLOAT;
        spec.attribs[0].outputType                    = glsDrawTests.DrawTestSpec.OutputType.VEC2;
        spec.attribs[0].storage                        = glsDrawTests.DrawTestSpec.Storage.BUFFER;
        spec.attribs[0].usage                        = glsDrawTests.DrawTestSpec.Usage.STATIC_DRAW;
        spec.attribs[0].componentCount                = 4;
        spec.attribs[0].offset                        = 0;
        spec.attribs[0].stride                        = 0;
        spec.attribs[0].normalize                    = false;
        spec.attribs[0].instanceDivisor                = 0;
        spec.attribs[0].useDefaultAttribute            = false;

        // Add another position component so the instances wont be drawn on each other
        spec.attribs.push(new glsDrawTests.DrawTestSpec.AttributeSpec());
        spec.attribs[1].inputType                    = glsDrawTests.DrawTestSpec.InputType.FLOAT;
        spec.attribs[1].outputType                    = glsDrawTests.DrawTestSpec.OutputType.VEC2;
        spec.attribs[1].storage                        = glsDrawTests.DrawTestSpec.Storage.BUFFER;
        spec.attribs[1].usage                        = glsDrawTests.DrawTestSpec.Usage.STATIC_DRAW;
        spec.attribs[1].componentCount                = 2;
        spec.attribs[1].offset                        = 0;
        spec.attribs[1].stride                        = 0;
        spec.attribs[1].normalize                    = false;
        spec.attribs[1].instanceDivisor                = 1;
        spec.attribs[1].useDefaultAttribute            = false;
        spec.attribs[1].additionalPositionAttribute    = true;

        // Instanced color
        spec.attribs.push(new glsDrawTests.DrawTestSpec.AttributeSpec());
        spec.attribs[2].inputType = glsDrawTests.DrawTestSpec.InputType.FLOAT;
        spec.attribs[2].outputType = glsDrawTests.DrawTestSpec.OutputType.VEC2;
        spec.attribs[2].storage = glsDrawTests.DrawTestSpec.Storage.BUFFER;
        spec.attribs[2].usage = glsDrawTests.DrawTestSpec.Usage.STATIC_DRAW;
        spec.attribs[2].componentCount = 3;
        spec.attribs[2].offset = 0;
        spec.attribs[2].stride = 0;
        spec.attribs[2].normalize = false;
        spec.attribs[2].instanceDivisor = 1;
        spec.attribs[2].useDefaultAttribute = false;

        es3fDrawTests.addTestIterations(test, spec, testType);

        this.addChild(test);

        // Multiple attribute, second one default
        test = new glsDrawTests.DrawTest(null, "default_attribute", "Attribute specified with glVertexAttrib*.");

        //spec.apiType                            = glu::ApiType::es(3,0);
        spec.primitive = this.m_primitive;
        spec.primitiveCount = 6; //JS refrast value for quads
        spec.drawMethod = this.m_method;
        spec.indexType = this.m_indexType;
        spec.indexPointerOffset = 0;
        spec.indexStorage = this.m_indexStorage;
        spec.first = 0;
        spec.indexMin = 0;
        spec.indexMax = 20; // \note addTestIterations is not called for the spec, so we must ensure [indexMin, indexMax] is a good range
        spec.instanceCount = 1;

        spec.attribs.length = 0;

        spec.attribs.push(new glsDrawTests.DrawTestSpec.AttributeSpec());
        spec.attribs[0].inputType = glsDrawTests.DrawTestSpec.InputType.FLOAT;
        spec.attribs[0].outputType = glsDrawTests.DrawTestSpec.OutputType.VEC2;
        spec.attribs[0].storage = glsDrawTests.DrawTestSpec.Storage.BUFFER;
        spec.attribs[0].usage = glsDrawTests.DrawTestSpec.Usage.STATIC_DRAW;
        spec.attribs[0].componentCount = 2;
        spec.attribs[0].offset = 0;
        spec.attribs[0].stride = 0;
        spec.attribs[0].normalize = false;
        spec.attribs[0].instanceDivisor = 0;
        spec.attribs[0].useDefaultAttribute = false;

        /**
         * IOPair
         */
        es3fDrawTests.AttributeGroup.IOPair = function() {
            /** @type {?glsDrawTests.DrawTestSpec.InputType} */ this.input = null;
            /** @type {?glsDrawTests.DrawTestSpec.OutputType} */ this.output = null;
            /** @type {number}*/ this.componentCount;
        };

        /** @type {Array<es3fDrawTests.AttributeGroup.IOPair>} */ var iopairs = [
            /** @type {es3fDrawTests.AttributeGroup.IOPair} */ ({ input: glsDrawTests.DrawTestSpec.InputType.FLOAT, output: glsDrawTests.DrawTestSpec.OutputType.VEC2,  componentCount: 4 }),
            /** @type {es3fDrawTests.AttributeGroup.IOPair} */ ({ input: glsDrawTests.DrawTestSpec.InputType.FLOAT, output: glsDrawTests.DrawTestSpec.OutputType.VEC4,  componentCount: 2 }),
            /** @type {es3fDrawTests.AttributeGroup.IOPair} */ ({ input: glsDrawTests.DrawTestSpec.InputType.INT, output: glsDrawTests.DrawTestSpec.OutputType.IVEC3, componentCount: 4 }),
            /** @type {es3fDrawTests.AttributeGroup.IOPair} */ ({ input: glsDrawTests.DrawTestSpec.InputType.UNSIGNED_INT, output: glsDrawTests.DrawTestSpec.OutputType.UVEC2, componentCount: 4 })
        ];

        spec.attribs.push(new glsDrawTests.DrawTestSpec.AttributeSpec());
        for (var ioNdx = 0; ioNdx < iopairs.length; ++ioNdx) {
            /** @type {string} */ var desc = glsDrawTests.DrawTestSpec.inputTypeToString(iopairs[ioNdx].input) + iopairs[ioNdx].componentCount + " to " + glsDrawTests.DrawTestSpec.outputTypeToString(iopairs[ioNdx].output);

            spec.attribs[1].inputType            = iopairs[ioNdx].input;
            spec.attribs[1].outputType            = iopairs[ioNdx].output;
            spec.attribs[1].storage                = glsDrawTests.DrawTestSpec.Storage.BUFFER;
            spec.attribs[1].usage                = glsDrawTests.DrawTestSpec.Usage.STATIC_DRAW;
            spec.attribs[1].componentCount        = iopairs[ioNdx].componentCount;
            spec.attribs[1].offset                = 0;
            spec.attribs[1].stride                = 0;
            spec.attribs[1].normalize            = false;
            spec.attribs[1].instanceDivisor        = 0;
            spec.attribs[1].useDefaultAttribute    = true;

            test.addIteration(spec, desc);
        }

        this.addChild(test);
    };

    /**
     * @constructor
     * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} descr
     * @param {?glsDrawTests.DrawTestSpec.DrawMethod} drawMethod
     */
    es3fDrawTests.IndexGroup = function (name, descr, drawMethod) {
        tcuTestCase.DeqpTest.call(this, name, descr);
        /** @type {?glsDrawTests.DrawTestSpec.DrawMethod} */ this.m_method = drawMethod;
        this.makeExecutable();
    };

    es3fDrawTests.IndexGroup.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    es3fDrawTests.IndexGroup.prototype.constructor = es3fDrawTests.IndexGroup;

    es3fDrawTests.IndexGroup.prototype.init = function () {
        /**
         * @constructor
         * IndexTest
         */
        es3fDrawTests.IndexGroup.IndexTest = function() {
            /** @type {?glsDrawTests.DrawTestSpec.Storage} */ this.storage = null;
            /** @type {?glsDrawTests.DrawTestSpec.IndexType} */ this.type = null;
            /** @type {boolean} */ this.aligned;
            /** @type {Array<number>} */ this.offsets = [];
        };

        /** @type {Array.IndexTest} */ var tests = [
            /** @type {es3fDrawTests.IndexGroup.IndexTest} */ ({ storage: glsDrawTests.DrawTestSpec.Storage.BUFFER, type: glsDrawTests.DrawTestSpec.IndexType.BYTE, aligned: true, offsets: [ 0, 1, -1 ] }),
            /** @type {es3fDrawTests.IndexGroup.IndexTest} */ ({ storage: glsDrawTests.DrawTestSpec.Storage.BUFFER, type: glsDrawTests.DrawTestSpec.IndexType.SHORT, aligned: true, offsets: [ 0, 2, -1 ] }),
            /** @type {es3fDrawTests.IndexGroup.IndexTest} */ ({ storage: glsDrawTests.DrawTestSpec.Storage.BUFFER, type: glsDrawTests.DrawTestSpec.IndexType.INT, aligned: true, offsets: [ 0, 4, -1 ] }),

            /** @type {es3fDrawTests.IndexGroup.IndexTest} */ ({ storage: glsDrawTests.DrawTestSpec.Storage.BUFFER, type: glsDrawTests.DrawTestSpec.IndexType.SHORT, aligned: false, offsets: [ 1, 3, -1 ] }),
            /** @type {es3fDrawTests.IndexGroup.IndexTest} */ ({ storage: glsDrawTests.DrawTestSpec.Storage.BUFFER, type: glsDrawTests.DrawTestSpec.IndexType.INT, aligned: false, offsets: [ 2, 3, -1 ] })
        ];

        /** @type {glsDrawTests.DrawTestSpec} */ var spec = new glsDrawTests.DrawTestSpec();
        es3fDrawTests.genBasicSpec(spec, this.m_method);

        //These groups are not used in JS (user storage)
        ///** @type {tcuTestCase.DeqpTest} */ var userPtrGroup = new tcuTestCase.DeqpTest("user_ptr", "user pointer");
        ///** @type {tcuTestCase.DeqpTest} */ var unalignedUserPtrGroup = new tcu::TestCaseGroup(m_testCtx, "unaligned_user_ptr", "unaligned user pointer");
        /** @type {tcuTestCase.DeqpTest} */ var bufferGroup = new tcuTestCase.DeqpTest("buffer", "buffer");
        /** @type {tcuTestCase.DeqpTest} */ var unalignedBufferGroup = new tcuTestCase.DeqpTest("unaligned_buffer", "unaligned buffer");

        /*this.addChild(userPtrGroup);
        this.addChild(unalignedUserPtrGroup);*/
        this.addChild(bufferGroup);
        this.addChild(unalignedBufferGroup);

        for (var testNdx = 0; testNdx < tests.length; ++testNdx) {
            /** @type {es3fDrawTests.IndexGroup.IndexTest} */ var indexTest    = tests[testNdx];
            /** @type {tcuTestCase.DeqpTest} */ var group = indexTest.aligned ? bufferGroup : unalignedBufferGroup;

            /** @type {string} */ var name = "index_" + glsDrawTests.DrawTestSpec.indexTypeToString(indexTest.type);
            /** @type {string} */ var desc = "index " + glsDrawTests.DrawTestSpec.indexTypeToString(indexTest.type) + " in " + glsDrawTests.DrawTestSpec.storageToString(indexTest.storage);
            /*MovePtr... ...?*/ /** @type {glsDrawTests.DrawTest} */ var test = new glsDrawTests.DrawTest(null, name, desc);

            spec.indexType = indexTest.type;
            spec.indexStorage = indexTest.storage;

            for (var iterationNdx = 0; iterationNdx < indexTest.offsets.length && indexTest.offsets[iterationNdx] != -1; ++iterationNdx) {
                /** @type {string} */ var iterationDesc = "offset " + indexTest.offsets[iterationNdx];
                spec.indexPointerOffset = indexTest.offsets[iterationNdx];
                test.addIteration(spec, iterationDesc);
            }

            if (spec.isCompatibilityTest() != glsDrawTests.DrawTestSpec.CompatibilityTestType.UNALIGNED_OFFSET &&
                spec.isCompatibilityTest() != glsDrawTests.DrawTestSpec.CompatibilityTestType.UNALIGNED_STRIDE)
                group.addChild(test);
        }
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
        this.makeExecutable();
    };

    es3fDrawTests.FirstGroup.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    es3fDrawTests.FirstGroup.prototype.constructor = es3fDrawTests.FirstGroup;

    /**
     * init
     */
    es3fDrawTests.FirstGroup.prototype.init = function() {
        var firsts =
        [
            1, 3, 17
        ];

        /** @type {glsDrawTests.DrawTestSpec} */ var spec = new glsDrawTests.DrawTestSpec();
        es3fDrawTests.genBasicSpec(spec, this.m_method);

        for (var firstNdx = 0; firstNdx < firsts.length; ++firstNdx)
        {
            var name = "first_" + firsts[firstNdx];
            var desc = "first " + firsts[firstNdx];
            /** @type {glsDrawTests.DrawTest} */ var test = new glsDrawTests.DrawTest(null, name, desc);

            spec.first = firsts[firstNdx];

            es3fDrawTests.addTestIterations(test, spec, es3fDrawTests.TestIterationType.DRAW_COUNT);

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
        this.makeExecutable();
    };

    es3fDrawTests.MethodGroup.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    es3fDrawTests.MethodGroup.prototype.constructor = es3fDrawTests.MethodGroup;

    /**
     * init
     */
    es3fDrawTests.MethodGroup.prototype.init = function() {
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

        if (indexed)
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
        }
    };

    /**
     * @constructor
     * @extends {tcuTestCase.DeqpTest}
     */
    es3fDrawTests.DrawTest = function () {
        tcuTestCase.DeqpTest.call(this, 'draw', 'Drawing tests');
        this.makeExecutable();
    };

    es3fDrawTests.DrawTest.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    es3fDrawTests.DrawTest.prototype.constructor = es3fDrawTests.DrawTest;

    /**
     * init
     */
    es3fDrawTests.DrawTest.prototype.init = function() {
        // Basic
        /** @type {Array<glsDrawTests.DrawTestSpec.DrawMethod>} */ var basicMethods = [
            glsDrawTests.DrawTestSpec.DrawMethod.DRAWARRAYS,
            glsDrawTests.DrawTestSpec.DrawMethod.DRAWELEMENTS,
            glsDrawTests.DrawTestSpec.DrawMethod.DRAWARRAYS_INSTANCED,
            glsDrawTests.DrawTestSpec.DrawMethod.DRAWELEMENTS_INSTANCED,
            glsDrawTests.DrawTestSpec.DrawMethod.DRAWELEMENTS_RANGED
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
        description(rootTest.getDescription());

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
