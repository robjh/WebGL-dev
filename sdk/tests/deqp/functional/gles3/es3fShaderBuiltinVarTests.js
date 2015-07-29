/*-------------------------------------------------------------------------
 * drawElements Quality Program OpenGL ES Utilities
 * ------------------------------------------------
 *
 * Copyright 2014 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

'use strict';
goog.provide('functional.gles3.es3fShaderBuiltinVarTests');
goog.require('framework.delibs.debase.deMath');
goog.require('framework.common.tcuImageCompare');
goog.require('framework.common.tcuLogImage');
goog.require('framework.common.tcuPixelFormat');
goog.require('framework.common.tcuSurface');
goog.require('framework.common.tcuTestCase');
goog.require('framework.opengl.gluShaderProgram');
goog.require('framework.opengl.gluShaderUtil');
goog.require('framework.opengl.gluVarType');
goog.require('modules.shared.glsShaderExecUtil');


goog.scope(function() {
	var es3fShaderBuiltinVarTests = functional.gles3.es3fShaderBuiltinVarTests;
	var deMath = framework.delibs.debase.deMath;
	var glsShaderExecUtil = modules.shared.glsShaderExecUtil;
	var gluShaderProgram = framework.opengl.gluShaderProgram;
	var gluShaderUtil = framework.opengl.gluShaderUtil;
	var gluVarType = framework.opengl.gluVarType;
	var tcuPixelFormat = framework.common.tcuPixelFormat;
	var tcuSurface = framework.common.tcuSurface;
	var tcuLogImage = framework.common.tcuLogImage;
	var tcuTestCase = framework.common.tcuTestCase;
	var tcuImageCompare = framework.common.tcuImageCompare;
	/** @typedef {function():number} */ es3fShaderBuiltinVarTests.GetConstantValueFunc;

	/**
	 * @param  {number} pname
	 * @return {number} getParameter returns values of any kind
	 */
	es3fShaderBuiltinVarTests.getInteger = function(pname) {
		return /** @type {number} */ (gl.getParameter(pname));
	};

	/**
	 * @param  {number} pname
	 * @return {number} forcing number
	 */
	es3fShaderBuiltinVarTests.getVectorsFromComps = function(pname) {
		/** @type {number} */ var value = /** @type {number} */ (gl.getParameter(pname));
		assertMsgOptions(value%4 === 0, 'Expected value to be divisible by 4.', false, true);
		return value;
	};

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
	 * @param  {string} name
	 * @param  {string} desc
	 * @param  {string} varName
	 * @param  {es3fShaderBuiltinVarTests.GetConstantValueFunc} getValue
	 * @param  {gluShaderProgram.shaderType} shaderType
	 */
	es3fShaderBuiltinVarTests.ShaderBuiltinConstantCase = function(name, desc, varName, getValue, shaderType) {
		tcuTestCase.DeqpTest.call(this, name, desc);
		/** @type {string} */ this.m_varName = varName;
		/** @type {es3fShaderBuiltinVarTests.GetConstantValueFunc} */ this.m_getValue = getValue;
		/** @type {gluShaderProgram.shaderType} */ this.m_shaderType = shaderType;
	};

	es3fShaderBuiltinVarTests.ShaderBuiltinConstantCase.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
	es3fShaderBuiltinVarTests.ShaderBuiltinConstantCase.prototype.constructor = es3fShaderBuiltinVarTests.ShaderBuiltinConstantCase;

	/**
	 * @param  {gluShaderProgram.shaderType} shaderType
	 * @param  {string} varName
	 * @return {glsShaderExecUtil.ShaderExecutor}
	 */
	es3fShaderBuiltinVarTests.ShaderBuiltinConstantCase.prototype.createGetConstantExecutor = function(shaderType, varName) {
		/** @type {glsShaderExecUtil.ShaderSpec} */ var shaderSpec;

		shaderSpec.version = gluShaderUtil.GLSLVersion.V300_ES;
		shaderSpec.source = "result = " + varName + ";\n";
		shaderSpec.outputs.push(new glsShaderExecUtil.Symbol("result", gluVarType.newTypeBasic(gluShaderUtil.DataType.INT, gluShaderUtil.precision.PRECISION_HIGHP)));

		return glsShaderExecUtil.createExecutor(shaderType, shaderSpec);

	};

	/**
	 * @return {tcuTestCase.IterateResult}
	 */
	es3fShaderBuiltinVarTests.ShaderBuiltinConstantCase.prototype.iterate = function() {
		/** @type {glsShaderExecUtil.ShaderExecutor} */ var shaderExecutor = this.createGetConstantExecutor(this.m_shaderType, this.m_varName);
		// TODO: So there is a potential issue here. m_getValue takes a context in the C++. This would make sense to port if the Reference Context is be used.
		// If the Reference Context is not used, then there is no use in executing the function since it can be evaluated when the constructor is called.
		// If the RC is used, then the constructor will take an anonymous function like so:
		//    function(gl) { return es3fShaderBuiltinVarTests.getVectorsFromComps(GL_SOMETHING, gl); }
		// Will need to come back later once I know more about this test.
		/** @type {number} */ var reference = this.m_getValue();
		/** @type {goog.NumberArray} */ var result;

		if (!shaderExecutor.isOk())
			assertMsgOptions(false, "Compile failed", false, true);

		shaderExecutor.useProgram();
		result = shaderExecutor.execute(1, null);

		bufferedLogToConsole(this.m_varName + " " + QP_KEY_TAG_NONE + " " + result);

		// TODO: there is another issue here: the types of result and reference do not matches
		// result is a number whereas reference might be a number or an array.
		if (result != reference) {
			bufferedLogToConsole("ERROR: Expected " + this.m_varName + " = " + reference + "\n" +
				"Test shader:" + shaderExecutor.m_program.getProgramInfo().infoLog);
			testFailedOptions('Invalid builtin constant value', false);
		}
		else
			testPassedOptions('Pass', true);

		return tcuTestCase.IterateResult.STOP;
	};

	/**
	 * @struct
	 * @constructor
	 * @param {number=} near
	 * @param {number=} far
	 */
	es3fShaderBuiltinVarTests.DepthRangeParams = function(near, far) {
		/** @type {number} */ this.zNear = near === undefined ? 0.0 : near;
		/** @type {number} */ this.zFar = far === undefined ? 1.0 : far;
	};

	/**
	 * @constructor
	 * @extends {glsShaderRenderCase.ShaderEvaluator}
	 * @param {es3fShaderBuiltinVarTests.DepthRangeParams} params
	 */
	es3fShaderBuiltinVarTests.DepthRangeEvaluator = function(params) {
		glsShaderRenderCase.ShaderEvaluator.call(this);
		/** @type {es3fShaderBuiltinVarTests.DepthRangeParams} */ this.m_params = params;
	};

	es3fShaderBuiltinVarTests.DepthRangeEvaluator.prototype = Object.create(glsShaderRenderCase.ShaderEvaluator.prototype);
	es3fShaderBuiltinVarTests.DepthRangeEvaluator.prototype.constructor = es3fShaderBuiltinVarTests.DepthRangeEvaluator;

	/**
	 * @param  {glsShaderRenderCase.ShaderEvalContext} c
	 */
	es3fShaderBuiltinVarTests.DepthRangeEvaluator.prototype.evaluate = function(c) {
		/** @type {number} */ var zNear = deMath.clamp(this.m_params.zNear, 0.0, 1.0);
		/** @type {number} */ var zFar = deMath.clamp(this.m_params.zFar, 0.0, 1.0);
		/** @type {number} */ var diff = zFar - zNear;
		c.color[0] = zNear;
		c.color[1] = zFar;
		c.color[2] = diff * 0.5 + 0.5;
	};

	/**
	 * @constructor
	 * @extends {glsShaderRenderCase.ShaderRenderCase}
	 * @param {string} name
	 * @param {string} desc
	 * @param {boolean} isVertexCase
	 */
	es3fShaderBuiltinVarTests.ShaderDepthRangeTest = function(name, desc, isVertexCase) {
		glsShaderRenderCase.ShaderRenderCase.call(this, name, desc, isVertexCase, this.m_evaluator);
		/** @type {es3fShaderBuiltinVarTests.DepthRangeParams} */ this.m_depthRange = new es3fShaderBuiltinVarTests.DepthRangeParams();
		// TODO: there is an issue with types below
		/** @type {es3fShaderBuiltinVarTests.DepthRangeEvaluator} */ this.m_evaluator = this.m_depthRange;
		/** @type {number} */ this.m_iterNdx = 0;
	};

	es3fShaderBuiltinVarTests.ShaderDepthRangeTest.prototype = Object.create(glsShaderRenderCase.ShaderRenderCase.prototype);
	es3fShaderBuiltinVarTests.ShaderDepthRangeTest.prototype.constructor = es3fShaderBuiltinVarTests.ShaderDepthRangeTest;

	es3fShaderBuiltinVarTests.ShaderDepthRangeTest.prototype.init = function() {
		/** @type {string} */ var defaultVertSrc = '' +
			'#version 300 es\n' +
			'in highp vec4 a_position;\n' +
			'void main (void)\n' +
			'{\n' +
			'	gl_Position = a_position;\n' +
			'}\n';
		/** @type {string} */ var defaultFragSrc = '' +
			'#version 300 es\n' +
			'in mediump vec4 v_color;\n' +
			'layout(location = 0) out mediump vec4 o_color;\n\n' +
			'void main (void)\n' +
			'{\n' +
			'	o_color = v_color;\n' +
			'}\n';

		// Construct shader.
		/** @type {string} */ var src = '#version 300 es\n';
		if (this.m_isVertexCase)
			src += 'in highp vec4 a_position;\n' +
				   'out mediump vec4 v_color;\n';
		else
			src += 'layout(location = 0) out mediump vec4 o_color;\n';

		src += 'void main (void)\n{\n' +
		       '\t' + (this.m_isVertexCase ? 'v_color' : 'o_color') + ' = vec4(gl_DepthRange.near, gl_DepthRange.far, gl_DepthRange.diff*0.5 + 0.5, 1.0);\n';

		if (this.m_isVertexCase)
			src += '\tgl_Position = a_position;\n';

		src += '}\n';

		this.m_vertShaderSource = this.m_isVertexCase ? src : defaultVertSrc;
		this.m_fragShaderSource = this.m_isVertexCase ? defaultFragSrc : src;

		glsShaderRenderCase.ShaderRenderCase.init.call(this);
	};

	/**
	 * @return {tcuTestCase.IterateResult}
	 */
	es3fShaderBuiltinVarTests.ShaderDepthRangeTest.prototype.iterate = function() {
		/** @type {Array<es3fShaderBuiltinVarTests.DepthRangeParams>} */ var cases = [
			new es3fShaderBuiltinVarTests.DepthRangeParams(0.0, 1.0),
			new es3fShaderBuiltinVarTests.DepthRangeParams(1.5, -1.0),
			new es3fShaderBuiltinVarTests.DepthRangeParams(0.7, 0.3)
		];

		this.m_depthRange = cases[this.m_iterNdx];
		bufferedLogToConsole("glDepthRangef(" + this.m_depthRange.zNear + ", " + this.m_depthRange.zFar + ")");
		gl.depthRangef(this.m_depthRange.zNear, this.m_depthRange.zFar);

		glsShaderRenderCase.ShaderRenderCase.iterate.call(this);
		this.m_iterNdx += 1;

		if (this.m_iterNdx == cases.length /* TODO:|| this.m_testCtx.getTestResult() != QP_TEST_RESULT_PASS */)
			return tcuTestCase.IterateResult.STOP;
		else
			return tcuTestCase.IterateResult.CONTINUE;
	};

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
	 */
	es3fShaderBuiltinVarTests.FragCoordXYZCase = function() {
		tcuTestCase.DeqpTest.call(this, "fragcoord_xyz", "gl_FragCoord.xyz Test");
	};

	es3fShaderBuiltinVarTests.FragCoordXYZCase.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
	es3fShaderBuiltinVarTests.FragCoordXYZCase.prototype.constructor = es3fShaderBuiltinVarTests.FragCoordXYZCase;

	es3fShaderBuiltinVarTests.FragCoordXYZCase.prototype.iterate = function() {
		/** @type {number} */ var width = gl.drawingBufferWidth;
		/** @type {number} */ var height = gl.drawingBufferHeight;
		/** @type {Array<number>} */ var threshold = deMath.add([1, 1, 1, 1], tcuPixelFormat.PixelFormatFromContext().getColorThreshold());
		/** @type {Array<number>} */ var scale = [1. / width, 1. / height, 1.0];

		/** @type {tcuSurface.Surface} */ var testImg = new tcuSurface.Surface(width, height);
		/** @type {tcuSurface.Surface} */ var refImg = new tcuSurface.Surface(width, height);


		/** @type {string} */ var vtxSource = '' +
		    '#version 300 es\n' +
		    'in highp vec4 a_position;\n' +
		    'void main (void)\n' +
		    '{\n' +
		    '    gl_Position = a_position;\n' +
		    '}\n';
		/** @type {string} */ var fragSource = '' +
		    '#version 300 es\n' +
		    'uniform highp vec3 u_scale;\n' +
		    'layout(location = 0) out mediump vec4 o_color;\n' +
		    'void main (void)\n' +
		    '{\n' +
		    '    o_color = vec4(gl_FragCoord.xyz*u_scale, 1.0);\n' +
		    '}\n';
		/** @type {gluShaderProgram.ShaderProgram} */ var program = new gluShaderProgram.ShaderProgram(gl, gluShaderUtil.makeVtxFragSources(vtxSource, fragSource));

		bufferedLogToConsole(shaderSource);

		if (!program.isOk())
		    throw new Error("Compile failed");

		// Draw with GL.
	    /** @type {Array<number>} */ var positions = [
	        -1.0, 1.0, -1.0, 1.0,
	        -1.0, -1.0, 0.0, 1.0,
	         1.0, 1.0, 0.0, 1.0,
	         1.0, -1.0, 1.0, 1.0
		];
	    /** @type {Array<number>} */ var indices = [0, 1, 2, 2, 1, 3];

	    /** @type {WebGLUniformLocation} */ var scaleLoc = gl.getUniformLocation(program.getProgram(), "u_scale");
	    /** @type {gluDrawUtil.VertexArrayBinding} */ var posBinding = gluDrawUtil.newFloatVertexArrayBinding("a_position", 4, 4, 0, positions);

	    gl.useProgram(program.getProgram());
	    gl.uniform3fv(scaleLoc, scale);

	    gluDrawUtil.draw(gl, program.getProgram(), posBinding, gluDrawUtil.triangles(indices));

		testImg.readViewport(gl, [0, 0, width, height]);

		// Draw reference
		for (var y = 0; y < refImg.getHeight(); y++) {
		    for (var x = 0; x < refImg.getWidth(); x++) {
		        /** @type {number} */ var xf = (x + .5) / refImg.getWidth();
		        /** @type {number} */ var yf = (refImg.getHeight() - y - 1 + .5) / refImg.getHeight();
		        /** @type {number} */ var z = (xf + yf) / 2.0;
		        /** @type {Array<number>} */ var fragCoord = [x + .5, y + .5, z];
		        /** @type {Array<number>} */ var scaledFC = deMath.multiply(fragCoord, scale);
		        /** @type {Array<number>} */ var color = [scaledFC[0], scaledFC[1], scaledFC[2], 1.0];

		        refImg.setPixel(x, y, color);
		    }
		}

		// Compare
	    /** @type {boolean} */ var isOk = tcuImageCompare.pixelThresholdCompare("Result", "Image comparison result", refImg, testImg, threshold);

		if (!isOk) {
			tcuLogImage.logImage('Reference', 'Reference', refImg.getAccess());
			tcuLogImage.logImage('Test', 'Test', testImg.getAccess());
			testFailedOptions('Image comparison failed', false);
		}
		else
			testPassedOptions('Pass', true);

		return tcuTestCase.IterateResult.STOP;
	};

	/**
	 * @param {Array<number>} s
	 * @param {Array<number>} w
	 * @param {number} nx
	 * @param {number} ny
	 * @return {number}
	 */
	es3fShaderBuiltinVarTests.projectedTriInterpolate = function() {
		return (s[0] * (1.0 - nx - ny)/w[0] + s[1] * ny / w[1] + s[2] * nx / w[2]) / ((1.0 - nx - ny) / w[0] + ny / w[1] + nx / w[2]);
	};

    /**
    * Run test
    * @param {WebGL2RenderingContext} context
    */
    es3fShaderBuiltinVarTests.run = function(context) {
    	gl = context;
    	//Set up Test Root parameters
    	var state = tcuTestCase.runner;
    	state.setRoot(new es3fShaderBuiltinVarTests.ShaderBuiltinVarTests());

    	//Set up name and description of this test series.
    	setCurrentTestName(state.testCases.fullName());
    	description(state.testCases.getDescription());

    	try {
    		//Run test cases
    		tcuTestCase.runTestCases();
    	}
    	catch (err) {
    		testFailedOptions('Failed to es3fShaderBuiltinVarTests.run tests', false);
    		tcuTestCase.runner.terminate();
    	}
    };

});
