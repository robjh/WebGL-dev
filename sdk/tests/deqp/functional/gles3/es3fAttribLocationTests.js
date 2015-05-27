/*-------------------------------------------------------------------------
 * drawElements Quality Program OpenGL ES 3.0 Module
 * -------------------------------------------------
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
 *//*!
 * \file
 * \brief Attribute location test
 *//*--------------------------------------------------------------------*/
'use strict';
goog.provide('functional.gles3.es3fAttribLocationTests');
goog.require('modules.shared.glsAttributeLocationTests');
goog.require('functional.gles3.es3fFboTestCase');
goog.require('functional.gles3.es3fFboTestUtil');
goog.require('framework.opengl.gluShaderUtil');


goog.scope(function() {

	var es3fAttribLocationTests = functional.gles3.es3fAttribLocationTests;
	var glsAttributeLocationTests = modules.shared.glsAttributeLocationTests;
	var tcuTestCase = framework.common.tcuTestCase;
	var glsFboUtil = modules.shared.glsFboUtil;

	var DE_ASSERT = function(x) {
        if (!x)
            throw new Error('Assert failed');
    };

	es3fAttribLocationTests.createAttributeLocationTests = function() {
	
		/** @type{Array<glsAttributeLocationTests.AttribType>} */
		var types = [
			new AttribType('float',		1,  gluShaderUtil.DataType.FLOAT),
			new AttribType('vec2',		1,  gluShaderUtil.DataType.FLOAT_VEC2),
			new AttribType('vec3',		1,  gluShaderUtil.DataType.FLOAT_VEC3),
			new AttribType('vec4',		1,  gluShaderUtil.DataType.FLOAT_VEC4),

			new AttribType('mat2',		2,  gluShaderUtil.DataType.FLOAT_MAT2),
			new AttribType('mat3',		3,  gluShaderUtil.DataType.FLOAT_MAT3),
			new AttribType('mat4',		4,  gluShaderUtil.DataType.FLOAT_MAT4),

			new AttribType('int',		1,	gluShaderUtil.DataType.INT),
			new AttribType('ivec2',		1,	gluShaderUtil.DataType.INT_VEC2),
			new AttribType('ivec3',		1,	gluShaderUtil.DataType.INT_VEC3),
			new AttribType('ivec4',		1,	gluShaderUtil.DataType.INT_VEC4),

			new AttribType('uint',		1,	gluShaderUtil.DataType.UNSIGNED_INT),
			new AttribType('uvec2',		1,	gluShaderUtil.DataType.UNSIGNED_INT_VEC2),
			new AttribType('uvec3',		1,	gluShaderUtil.DataType.UNSIGNED_INT_VEC3),
			new AttribType('uvec4',		1,	gluShaderUtil.DataType.UNSIGNED_INT_VEC4),

			new AttribType('mat2x2',	2,	gluShaderUtil.DataType.FLOAT_MAT2),
			new AttribType('mat2x3',	2,	gluShaderUtil.DataType.FLOAT_MAT2x3),
			new AttribType('mat2x4',	2,	gluShaderUtil.DataType.FLOAT_MAT2x4),

			new AttribType('mat3x2',	3,	gluShaderUtil.DataType.FLOAT_MAT3x2),
			new AttribType('mat3x3',	3,	gluShaderUtil.DataType.FLOAT_MAT3),
			new AttribType('mat3x4',	3,	gluShaderUtil.DataType.FLOAT_MAT3x4),

			new AttribType('mat4x2',	4,	gluShaderUtil.DataType.FLOAT_MAT4x2),
			new AttribType('mat4x3',	4,	gluShaderUtil.DataType.FLOAT_MAT4x3),
			new AttribType('mat4x4',	4,	gluShaderUtil.DataType.FLOAT_MAT4)
		];

		/** @type{Array<glsAttributeLocationTests.AttribType>} */
		var es2Types = [
			new AttribType('float',	1,  gluShaderUtil.DataType.FLOAT),
			new AttribType('vec2',	1,  gluShaderUtil.DataType.FLOAT_VEC2),
			new AttribType('vec3',	1,  gluShaderUtil.DataType.FLOAT_VEC3),
			new AttribType('vec4',	1,  gluShaderUtil.DataType.FLOAT_VEC4),

			new AttribType('mat2',	2,  gluShaderUtil.DataType.FLOAT_MAT2),
			new AttribType('mat3',	3,  gluShaderUtil.DataType.FLOAT_MAT3),
			new AttribType('mat4',	4,  gluShaderUtil.DataType.FLOAT_MAT4)
		];

		/** @type {tcuTestCase.DeqpTest} */ 
		var root = tcuTestCase.newTest('attribute_location', 'Attribute location tests');

		/** @type{number} */ var typeNdx;

		// Basic bind attribute tests
		/** @type {tcuTestCase.DeqpTest} */ 
		var bindAttributeGroup = tcuTestCase.newTest('bind', 'Basic bind attribute location tests.');

		root.addChild(bindAttributeGroup);

		for (typeNdx = 0; typeNdx < types.length; typeNdx++) {
			/** @type{glsAttributeLocationTests.AttribType} */ type = types[typeNdx];
			bindAttributeGroup.addChild(new glsAttributeLocationTests.BindAttributeTest(type));
		}

		// Bind max number of attributes
		/** @type {tcuTestCase.DeqpTest} */ 
		var bindMaxAttributeGroup = tcuTestCase.newTest('bind_max_attributes', 'Use bind with maximum number of attributes.');

		root.addChild(bindMaxAttributeGroup);

		for (typeNdx = 0; typeNdx < types.length; typeNdx++) {
			/** @type{glsAttributeLocationTests.AttribType} */ type = types[typeNdx];
			bindMaxAttributeGroup.addChild(new glsAttributeLocationTests.BindMaxAttributesTest(type));
		}

		// Test aliasing
		/** @type {tcuTestCase.DeqpTest} */ 
		var aliasingGroup = tcuTestCase.newTest('bind_aliasing', 'Test binding aliasing locations.');

		root.addChild(aliasingGroup);

		for (typeNdx = 0; typeNdx < es2Types.length; typeNdx++) {
			/** @type{glsAttributeLocationTests.AttribType} */ type = es2Types[typeNdx];

			// Simple aliasing cases
			aliasingGroup.addChild(new glsAttributeLocationTests.BindAliasingAttributeTest(type));

			// For types which occupy more than one location. Alias second location.
			if (type.getLocationSize() > 1)
				aliasingGroup.addChild(new glsAttributeLocationTests.BindAliasingAttributeTest(type, 1));

			// Use more than maximum attributes with aliasing
			aliasingGroup.addChild(new glsAttributeLocationTests.BindMaxAliasingAttributeTest(type));

			// Use more than maximum attributes but inactive
			aliasingGroup.addChild(new glsAttributeLocationTests.BindInactiveAliasingAttributeTest(type));
		}

		// Test filling holes in attribute location
		/** @type {tcuTestCase.DeqpTest} */ 
		var holeGroup = tcuTestCase.newTest('bind_hole', 'Bind all, but one attribute and leave hole in location space for it.');

		root.addChild(holeGroup);

		for (typeNdx = 0; typeNdx < types.length; typeNdx++) {
			/** @type{glsAttributeLocationTests.AttribType} */ type = types[typeNdx];

			// Bind first location, leave hole size of type and fill rest of locations
			holeGroup.addChild(new glsAttributeLocationTests.BindHoleAttributeTest(type));
		}

		// Test binding at different times
		/** @type {tcuTestCase.DeqpTest} */ 
		var bindTimeGroup = tcuTestCase.newTest('bind_time', 'Bind time tests. Test binding at different stages.');

		root.addChild(bindTimeGroup);

		bindTimeGroup.addChild(new glsAttributeLocationTests.PreAttachBindAttributeTest());
		bindTimeGroup.addChild(new glsAttributeLocationTests.PreLinkBindAttributeTest());
		bindTimeGroup.addChild(new glsAttributeLocationTests.PostLinkBindAttributeTest());
		bindTimeGroup.addChild(new glsAttributeLocationTests.BindRelinkAttributeTest());
		bindTimeGroup.addChild(new glsAttributeLocationTests.BindReattachAttributeTest());

		// Basic layout location attribute tests
		/** @type {tcuTestCase.DeqpTest} */ 
		var layoutAttributeGroup = tcuTestCase.newTest('layout', 'Basic layout location tests.');

		root.addChild(layoutAttributeGroup);

		for (typeNdx = 0; typeNdx < types.length; typeNdx++) {
			/** @type{glsAttributeLocationTests.AttribType} */ type = types[typeNdx];
			layoutAttributeGroup.addChild(new glsAttributeLocationTests.LocationAttributeTest(type));
		}

		// Test max attributes with layout locations
		/** @type {tcuTestCase.DeqpTest} */ 
		var layoutMaxAttributeGroup = tcuTestCase.newTest('layout_max_attributes', 'Maximum attributes used with layout location qualifiers.');

		root.addChild(layoutMaxAttributeGroup);

		for (typeNdx = 0; typeNdx < types.length; typeNdx++) {
			/** @type{glsAttributeLocationTests.AttribType} */ type = types[typeNdx];
			layoutMaxAttributeGroup.addChild(new glsAttributeLocationTests.LocationMaxAttributesTest(type));
		}
	
		// Test filling holes in attribute location
		/** @type {tcuTestCase.DeqpTest} */ 
		var holeGroup = tcuTestCase.newTest('layout_hole', 'Define layout location for all, but one attribute consuming max attribute locations.');

		root.addChild(holeGroup);

		for (typeNdx = 0; typeNdx < types.length; typeNdx++) {
			/** @type{glsAttributeLocationTests.AttribType} */ type = types[typeNdx];

			// Location first location, leave hole size of type and fill rest of locations
			holeGroup.addChild(new glsAttributeLocationTests.LocationHoleAttributeTest(type));
		}

		// Basic mixed mixed attribute tests
		/** @type {tcuTestCase.DeqpTest} */ 
		var mixedAttributeGroup = tcuTestCase.newTest('mixed', 'Basic mixed location tests.');

		root.addChild(mixedAttributeGroup);

		for (typeNdx = 0; typeNdx < types.length; typeNdx++) {
			/** @type{glsAttributeLocationTests.AttribType} */ type = types[typeNdx];
			mixedAttributeGroup.addChild(new glsAttributeLocationTests.MixedAttributeTest(type));
		}
	
		/** @type {tcuTestCase.DeqpTest} */ 
		var mixedMaxAttributeGroup = tcuTestCase.newTest('mixed_max_attributes', 'Maximum attributes used with mixed binding and layout qualifiers.');

		root.addChild(mixedMaxAttributeGroup);

		for (typeNdx = 0; typeNdx < types.length; typeNdx++) {
			/** @type{glsAttributeLocationTests.AttribType} */ type = types[typeNdx];
			mixedMaxAttributeGroup.addChild(new glsAttributeLocationTests.MixedMaxAttributesTest(type));
		}

		// Test mixed binding at different times
		/** @type {tcuTestCase.DeqpTest} */ 
		var mixedTimeGroup = tcuTestCase.newTest('mixed_time', 'Bind time tests. Test binding at different stages.');

		root.addChild(mixedTimeGroup);

		mixedTimeGroup.addChild(new glsAttributeLocationTests.PreAttachMixedAttributeTest());
		mixedTimeGroup.addChild(new glsAttributeLocationTests.PreLinkMixedAttributeTest());
		mixedTimeGroup.addChild(new glsAttributeLocationTests.PostLinkMixedAttributeTest());
		mixedTimeGroup.addChild(new glsAttributeLocationTests.MixedRelinkAttributeTest());
		mixedTimeGroup.addChild(new glsAttributeLocationTests.MixedReattachAttributeTest());

		/** @type {tcuTestCase.DeqpTest} */ 
		var holeGroup = tcuTestCase.newTest('mixed_hole', 'Use layout location qualifiers and binding. Leave hole in location space for only free attribute.');

		root.addChild(holeGroup);

		for (typeNdx = 0; typeNdx < types.length; typeNdx++) {
			/** @type{glsAttributeLocationTests.AttribType} */ type = types[typeNdx];

			holeGroup.addChild(new glsAttributeLocationTests.MixedHoleAttributeTest(type));
		}
	
		// Test hole in location space that moves when relinking
		/** @type {tcuTestCase.DeqpTest} */ 
		var relinkBindHoleGroup = tcuTestCase.newTest('bind_relink_hole', 'Test relinking with moving hole in attribute location space.');

		root.addChild(relinkBindHoleGroup);

		for (typeNdx = 0; typeNdx < types.length; typeNdx++) {
			/** @type{glsAttributeLocationTests.AttribType} */ type = types[typeNdx];

			relinkBindHoleGroup.addChild(new glsAttributeLocationTests.BindRelinkHoleAttributeTest(type));
		}

		// Test hole in location space that moves when relinking
		/** @type {tcuTestCase.DeqpTest} */ 
		var relinkMixedHoleGroup = tcuTestCase.newTest('mixed_relink_hole', 'Test relinking with moving hole in attribute location space.');

		root.addChild(relinkMixedHoleGroup);

		for (typeNdx = 0; typeNdx < types.length; typeNdx++) {
			/** @type{glsAttributeLocationTests.AttribType} */ type = types[typeNdx];

			relinkMixedHoleGroup.addChild(new glsAttributeLocationTests.MixedRelinkHoleAttributeTest(type));
		}

		return root;
	};

	es3fAttribLocationTests.run = function(context) {
        gl = context;
        //Set up root Test
        var state = tcuTestCase.runner;

        var test = es3fAttribLocationTests.createAttributeLocationTests();
        var testName = test.fullName();
        var testDescription = test.getDescription() || '';

        state.testName = testName;
        state.setRoot(test);
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
            console.log(err);
            testFailedOptions('Failed to es3fAttribLocationTests.run tests', false);
            tcuTestCase.runner.terminate();
        }
    };
});
