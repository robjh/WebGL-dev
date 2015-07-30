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
goog.require('framework.delibs.debase.deRandom');
goog.require('framework.common.tcuImageCompare');
goog.require('framework.common.tcuLogImage');
goog.require('framework.common.tcuPixelFormat');
goog.require('framework.common.tcuSurface');
goog.require('framework.common.tcuTestCase');
goog.require('framework.opengl.gluDrawUtil');
goog.require('framework.opengl.gluShaderProgram');
goog.require('framework.opengl.gluShaderUtil');
goog.require('framework.opengl.gluVarType');
goog.require('modules.shared.glsShaderExecUtil');
goog.require('modules.shared.glsShaderRenderCase');


goog.scope(function() {
	var es3fShaderBuiltinVarTests = functional.gles3.es3fShaderBuiltinVarTests;
	var deMath = framework.delibs.debase.deMath;
	var deRandom = framework.delibs.debase.deRandom;
	var glsShaderExecUtil = modules.shared.glsShaderExecUtil;
	var glsShaderRenderCase = modules.shared.glsShaderRenderCase;
	var gluShaderProgram = framework.opengl.gluShaderProgram;
	var gluShaderUtil = framework.opengl.gluShaderUtil;
	var gluDrawUtil = framework.opengl.gluDrawUtil;
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
		/** @type {glsShaderExecUtil.ShaderSpec} */ var shaderSpec = new glsShaderExecUtil.ShaderSpec();

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

		bufferedLogToConsole(this.m_varName + " " /* + QP_KEY_TAG_NONE + " "*/ + result);

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

		bufferedLogToConsole(program.getProgramInfo());

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
	es3fShaderBuiltinVarTests.projectedTriInterpolate = function(s, w, nx, ny) {
		return (s[0] * (1.0 - nx - ny)/w[0] + s[1] * ny / w[1] + s[2] * nx / w[2]) / ((1.0 - nx - ny) / w[0] + ny / w[1] + nx / w[2]);
	};

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
	 */
	es3fShaderBuiltinVarTests.FragCoordWCase = function() {
		tcuTestCase.DeqpTest.call(this, "fragcoord_w", "gl_FragCoord.w Test");
	};

	es3fShaderBuiltinVarTests.FragCoordWCase.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
	es3fShaderBuiltinVarTests.FragCoordWCase.prototype.constructor = es3fShaderBuiltinVarTests.FragCoordWCase;

	/**
	 * @return {tcuTestCase.IterateResult}
	 */
	es3fShaderBuiltinVarTests.FragCoordWCase.prototype.iterate = function() {
		/** @type {number} */ var width = gl.drawingBufferWidth;
		/** @type {number} */ var height = gl.drawingBufferHeight;
		/** @type {Array<number>} */ var threshold = deMath.add([1, 1, 1, 1], tcuPixelFormat.PixelFormatFromContext().getColorThreshold());

		/** @type {tcuSurface.Surface} */ var testImg = new tcuSurface.Surface(width, height);
		/** @type {tcuSurface.Surface} */ var refImg = new tcuSurface.Surface(width, height);

		/** @type {Array<number>} */ var w = [1.7, 2.0, 1.2, 1.0];

		/** @type {string} */ var vtxSource = '#version 300 es\n' +
			'in highp vec4 a_position;\n' +
			'void main (void)\n' +
			'{\n' +
			'	gl_Position = a_position;\n' +
			'}\n';

		/** @type {string} */ var fragSource = '#version 300 es\n' +
			'layout(location = 0) out mediump vec4 o_color;\n' +
			'void main (void)\n' +
			'{\n' +
			'	o_color = vec4(0.0, 1.0/gl_FragCoord.w - 1.0, 0.0, 1.0);\n' +
			'}\n';

		/** @type {gluShaderProgram.ShaderProgram} */ var program = new gluShaderProgram.ShaderProgram(gl, gluShaderUtil.makeVtxFragSources(vtxSource, fragSource));
		bufferedLogToConsole(program.getProgramInfo());

		if (!program.isOk())
		    throw new Error("Compile failed");

		// Draw with GL.
		/** @type {Array<number>} */ var positions = [
			-w[0], w[0], 0.0, w[0],
			-w[1], -w[1], 0.0, w[1],
			w[2], w[2], 0.0, w[2],
			w[3], -w[3], 0.0, w[3]
		];
		/** @type {Array<number>} */ var indices = [0, 1, 2, 2, 1, 3];

		/** @type {gluDrawUtil.VertexArrayBinding} */ var posBinding = gluDrawUtil.newFloatVertexArrayBinding("a_position", 4, 4, 0, positions);
		gl.useProgram(program.getProgram());

		gluDrawUtil.draw(gl, program.getProgram(), posBinding, gluDrawUtil.triangles(indices));
		testImg.readViewport(gl, [0, 0, width, height]);

		// Draw reference
		for (var y = 0; y < refImg.getHeight(); y++) {
			for (var x = 0; x < refImg.getWidth(); x++) {
				/** @type {number} */ var xf = (x + 0.5) / refImg.getWidth();
				/** @type {number} */ var yf = (refImg.getHeight() - y - 1 + 0.5) / refImg.getHeight();
				/** @type {number} */ var oow = ((xf + yf) < 1.0) ?
												es3fShaderBuiltinVarTests.projectedTriInterpolate([w[0], w[1], w[2]], [w[0], w[1], w[2]], xf, yf) :
												es3fShaderBuiltinVarTests.projectedTriInterpolate([w[3], w[2], w[1]], [w[3], w[2], w[1]], 1.0 - xf, 1.0 - yf);
				/** @type {Array<number>} */ var color = [0.0, oow - 1.0, 0.0, 1.0];

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
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
	 */
	es3fShaderBuiltinVarTests.PointCoordCase = function() {
		tcuTestCase.DeqpTest.call(this, "pointcoord", "gl_PointCoord Test");
	};

	es3fShaderBuiltinVarTests.PointCoordCase.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
	es3fShaderBuiltinVarTests.PointCoordCase.prototype.constructor = es3fShaderBuiltinVarTests.PointCoordCase;

	/**
	 * @return {tcuTestCase.IterateResult}
	 */
	es3fShaderBuiltinVarTests.PointCoordCase.prototype.iterate = function() {
		/** @type {number} */ var width = Math.min(256, gl.drawingBufferWidth);
		/** @type {number} */ var height = Math.min(256, gl.drawingBufferHeight);
		/** @type {number} */ var threshold = 0.02;

		/** @type {number} */ var numPoints	= 8;

		/** @type {number} */ var coords = [];
		/** @type {number} */ var pointSizeRange = [0.0, 0.0];
		/** @type {deRandom.Random} */ var rnd = new deRandom.Random(0x145fa);
		/** @type {tcuSurface.Surface} */ var testImg = new tcuSurface.Surface(width, height);
		/** @type {tcuSurface.Surface} */ var refImg = new tcuSurface.Surface(width, height);

		pointSizeRange = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE);

		if (pointSizeRange[0] <= 0.0 || pointSizeRange[1] <= 0.0 || pointSizeRange[1] < pointSizeRange[0])
			throw new Error("Invalid GL_ALIASED_POINT_SIZE_RANGE");

		// Compute coordinates.

		for (var i = 0; i < numPoints; i++) {
			coords[i][0] = rnd.getFloat(-0.9, 0.9);
			coords[i][1] = rnd.getFloat(-0.9, 0.9);
			coords[i][2] = rnd.getFloat(pointSizeRange[0], pointSizeRange[1]);
		}

		/** @type {string} */ var vtxSource = "#version 300 es\n" +
			"in highp vec3 a_positionSize;\n" +
			"void main (void)\n" +
			"{\n" +
			"	gl_Position = vec4(a_positionSize.xy, 0.0, 1.0);\n" +
			"	gl_PointSize = a_positionSize.z;\n" +
			"}\n";

		/** @type {string} */ var fragSource = "#version 300 es\n" +
			"layout(location = 0) out mediump vec4 o_color;\n" +
			"void main (void)\n" +
			"{\n" +
			"	o_color = vec4(gl_PointCoord, 0.0, 1.0);\n" +
			"}\n";

		/** @type {gluShaderProgram.ShaderProgram} */ var program = new gluShaderProgram.ShaderProgram(gl, gluShaderUtil.makeVtxFragSources(vtxSource, fragSource));
		bufferedLogToConsole(program.getProgramInfo());

		if (!program.isOk())
		    throw new Error("Compile failed");

		// Draw with GL.
		/** @type {gluDrawUtil.VertexArrayBinding} */ var posBinding = gluDrawUtil.newFloatVertexArrayBinding("a_positionSize", 3, coords.length, 0, coords);
		/** @type {number} */ var viewportX	= rnd.getInt(0, gl.drawingBufferWidth - width);
		/** @type {number} */ var viewportY	= rnd.getInt(0, gl.drawingBufferHeight - height);

		gl.viewport(viewportX, viewportY, width, height);
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.useProgram(program.getProgram());

		gluDrawUtil.draw(gl, program.getProgram(), posBinding, gluDrawUtil.points(indices));
		testImg.readViewport(gl, [viewportX, viewportY, width, height]);

		// Draw reference
		refImg.getAccess().clear([0.0, 0.0, 0.0, 1.0]);
		for (var i = 0; i < coords.length; i++) {
			/** @type {number} */ var x0 = deRoundFloatToInt32(width * (coords[i][0] * 0.5 + 0.5) - coords[i][2] * 0.5);
			/** @type {number} */ var y0 = deRoundFloatToInt32(height*  (coords[i][1] * 0.5 + 0.5) - coords[i][2] * 0.5);
			/** @type {number} */ var x1 = deRoundFloatToInt32(width * (coords[i][0] * 0.5 + 0.5) + coords[i][2] * 0.5);
			/** @type {number} */ var y1 = deRoundFloatToInt32(height * (coords[i][1] * 0.5 + 0.5) + coords[i][2] * 0.5);
			/** @type {number} */ var w = x1 - x0;
			/** @type {number} */ var h = y1 - y0;

			for (var yo = 0; yo < h; yo++) {
				for (var xo = 0; xo < w; xo++) {
					/** @type {number} */ var xf = (xo + 0.5) / w;
					/** @type {number} */ var yf = ((h - yo - 1) + 0.5) / h;
					/** @type {Array<number>} */ var color = [xf, yf, 0.0, 1.0];
					/** @type {number} */ var dx = x0 + xo;
					/** @type {number} */ var dy = y0 + yo;

					if (deMath.inBounds(dx, 0, refImg.getWidth()) && deMath.inBounds(dy, 0, refImg.getHeight()))
						refImg.setPixel(dx, dy, color);
				}
			}
		}

		// Compare
		/** @type {boolean} */ var isOk = tcuImageCompare.fuzzyCompare("Result", "Image comparison result", refImg, testImg, threshold);

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
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
	 */
	es3fShaderBuiltinVarTests.FrontFacingCase = function() {
		tcuTestCase.DeqpTest.call(this, "frontfacing", "gl_FrontFacing Test");
	};

	es3fShaderBuiltinVarTests.FrontFacingCase.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
	es3fShaderBuiltinVarTests.FrontFacingCase.prototype.constructor = es3fShaderBuiltinVarTests.FrontFacingCase;

	/**
	 * @return {tcuTestCase.IterateResult}
	 */
	es3fShaderBuiltinVarTests.FrontFacingCase.prototype.iterate = function() {
		// Test case renders two adjecent quads, where left is has front-facing
		// triagles and right back-facing. Color is selected based on gl_FrontFacing
		// value.
		/** @type {deRandom.Random} */ var rnd = new deRandom.Random(0x89f2c);
		/** @type {number} */ var width = Math.min(64, gl.drawingBufferWidth);
		/** @type {number} */ var height = Math.min(64, gl.drawingBufferHeight);
		/** @type {number} */ var viewportX = rnd.getInt(0, gl.drawingBufferWidth - width);
		/** @type {number} */ var viewportY = rnd.getInt(0, gl.drawingBufferHeight - height);
		/** @type {Array<number>} */ var threshold = deMath.add([1, 1, 1, 1], tcuPixelFormat.PixelFormatFromContext().getColorThreshold());

		/** @type {tcuSurface.Surface} */ var testImg = new tcuSurface.Surface(width, height);
		/** @type {tcuSurface.Surface} */ var refImg = new tcuSurface.Surface(width, height);

		/** @type {string} */ var  vtxSource = "#version 300 es\n"
			"in highp vec4 a_position;\n"
			"void main (void)\n"
			"{\n"
			"	gl_Position = a_position;\n"
			"}\n";

		/** @type {string} */ var  fragSource = "#version 300 es\n"
			"layout(location = 0) out mediump vec4 o_color;\n"
			"void main (void)\n"
			"{\n"
			"	if (gl_FrontFacing)\n"
			"		o_color = vec4(0.0, 1.0, 0.0, 1.0);\n"
			"	else\n"
			"		o_color = vec4(0.0, 0.0, 1.0, 1.0);\n"
			"}\n";

		/** @type {gluShaderProgram.ShaderProgram} */ var program = new gluShaderProgram.ShaderProgram(gl, gluShaderUtil.makeVtxFragSources(vtxSource, fragSource));

		bufferedLogToConsole(program.getProgramInfo());

		if (!program.isOk())
		    throw new Error("Compile failed");


		// Draw with GL.
		/** @type {Array<number>} */ var positions = [
			-1.0, 1.0, 0.0, 1.0,
			-1.0, -1.0, 0.0, 1.0,
			1.0, 1.0, 0.0, 1.0,
			1.0, -1.0, 0.0, 1.0
		];

		/** @type {Array<number>} */ var indicesCCW = [0, 1, 2, 2, 1, 3];
		/** @type {Array<number>} */ var indicesCW = [2, 1, 0, 3, 1, 2];

		/** @type {gluDrawUtil.VertexArrayBinding} */ var posBinding = gluDrawUtil.newFloatVertexArrayBinding("a_position", 4, 4, 0, positions);
		gl.useProgram(program.getProgram());

		gl.viewport(viewportX, viewportY, Math.floor(width / 2), height);

		gluDrawUtil.draw(gl, program.getProgram(), posBinding, gluDrawUtil.triangles(indicesCCW));

		gl.viewport(viewportX + Math.floor(width / 2), viewportY, width - Math.floor(width / 2), height);
		gluDrawUtil.draw(gl, program.getProgram(), posBinding, gluDrawUtil.triangles(indicesCW));
		testImg.readViewport(gl, [viewportX, viewportY, width, height]);
		// Draw reference
		for (var y = 0; y < refImg.getHeight(); y++) {
			for (var x = 0; x < Math.floor(refImg.getWidth() / 2); x++)
				refImg.setPixel(x, y, tcuRGBA.RGBA.green.toVec());

			for (var x = Math.floor(refImg.getWidth() / 2); x < refImg.getWidth(); x++)
				refImg.setPixel(x, y, tcuRGBA.RGBA.blue.toVec());
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
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
	 */
	es3fShaderBuiltinVarTests.VertexIDCase = function() {
		tcuTestCase.DeqpTest.call(this, "vertex_id",	"gl_VertexID Test");
		/** @type {?WebGLProgram} */ this.m_program = null;
		/** @type {WebGLBuffer} */ this.m_positionBuffer = 0;
		/** @type {WebGLBuffer} */ this.m_elementBuffer = 0;
		/** @type {number} */ this.m_viewportW = 0;
		/** @type {number} */ this.m_viewportH = 0;
		/** @type {number} */ this.m_iterNdx = 0;
		/** @type {Array<number>} */ this.m_positions = [];
		/** @type {Array<number>} */ this.m_colors = [];
	};

	es3fShaderBuiltinVarTests.VertexIDCase.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
	es3fShaderBuiltinVarTests.VertexIDCase.prototype.constructor = es3fShaderBuiltinVarTests.VertexIDCase;

	es3fShaderBuiltinVarTests.VertexIDCase.MAX_VERTICES = 24; 	//!< 8 triangles, totals 24 vertices

	es3fShaderBuiltinVarTests.VertexIDCase.prototype.init = function() {
		/** @type {number} */ var width = gl.drawingBufferWidth;
		/** @type {number} */ var height = gl.drawingBufferHeight;

		/** @type {number} */ var quadWidth = 32;
		/** @type {number} */ var quadHeight = 32;

		if (width < quadWidth)
			throw new Error("Too small render target");

		/** @type {number} */ var maxQuadsX = Math.floor(width / quadWidth);
		/** @type {number} */ var numVertices = es3fShaderBuiltinVarTests.VertexIDCase.MAX_VERTICES;

		/** @type {number} */ var numQuads = Math.floor(numVertices / 6) + (numVertices % 6 != 0 ? 1 : 0);
		/** @type {number} */ var viewportW = Math.min(numQuads, maxQuadsX)*quadWidth;
		/** @type {number} */ var viewportH = (Math.floor(numQuads/maxQuadsX) + (numQuads % maxQuadsX != 0 ? 1 : 0)) * quadHeight;

		if (viewportH > height)
			throw new Error("Too small render target");

		assertMsgOptions(viewportW <= width && viewportH <= height, 'Unexpected viewport dimensions.', false, true);

		assertMsgOptions(!this.m_program, 'Program should not be defined at this point.', false, true);

		/** @type {string} */ var vtxSource = "#version 300 es\n" +
			"in highp vec4 a_position;\n" +
			"out mediump vec4 v_color;\n" +
			"uniform highp vec4 u_colors[24];\n" +
			"void main (void)\n" +
			"{\n" +
			"	gl_Position = a_position;\n" +
			"	v_color = u_colors[gl_VertexID];\n" +
			"}\n";

		/** @type {string} */ var fragSource = "#version 300 es\n" +
			"in mediump vec4 v_color;\n" +
			"layout(location = 0) out mediump vec4 o_color;\n" +
			"void main (void)\n" +
			"{\n" +
			"	o_color = v_color;\n" +
			"}\n";

		/** @type {gluShaderProgram.ShaderProgram} */ var program = new gluShaderProgram.ShaderProgram(gl, gluShaderUtil.makeVtxFragSources(vtxSource, fragSource));
		bufferedLogToConsole(program.getProgramInfo());

		if (!program.isOk()) {
			this.m_program = null;
			throw new Error("Compile failed");
		}

		this.m_positionBuffer = gl.createBuffer();
		this.m_elementBuffer = gl.createBuffer();

		// Set colors (in dynamic memory to save static data space).
		this.m_colors[0] = [0.0, 0.0, 0.0, 1.0];
		this.m_colors[1] = [0.5, 1.0, 0.5, 1.0];
		this.m_colors[2] = [0.0, 0.5, 1.0, 1.0];
		this.m_colors[3] = [0.0, 1.0, 0.0, 1.0];
		this.m_colors[4] = [0.0, 1.0, 1.0, 1.0];
		this.m_colors[5] = [0.5, 0.0, 0.0, 1.0];
		this.m_colors[6] = [0.5, 0.0, 1.0, 1.0];
		this.m_colors[7] = [0.5, 0.0, 0.5, 1.0];
		this.m_colors[8] = [1.0, 0.0, 0.0, 1.0];
		this.m_colors[9] = [0.5, 1.0, 0.0, 1.0];
		this.m_colors[10] = [0.0, 0.5, 0.0, 1.0];
		this.m_colors[11] = [0.5, 1.0, 1.0, 1.0];
		this.m_colors[12] = [0.0, 0.0, 1.0, 1.0];
		this.m_colors[13] = [1.0, 0.0, 0.5, 1.0];
		this.m_colors[14] = [0.0, 0.5, 0.5, 1.0];
		this.m_colors[15] = [1.0, 1.0, 0.5, 1.0];
		this.m_colors[16] = [1.0, 0.0, 1.0, 1.0];
		this.m_colors[17] = [1.0, 0.5, 0.0, 1.0];
		this.m_colors[18] = [0.0, 1.0, 0.5, 1.0];
		this.m_colors[19] = [1.0, 0.5, 1.0, 1.0];
		this.m_colors[20] = [1.0, 1.0, 0.0, 1.0];
		this.m_colors[21] = [1.0, 0.5, 0.5, 1.0];
		this.m_colors[22] = [0.0, 0.0, 0.5, 1.0];
		this.m_colors[23] = [1.0, 1.0, 1.0, 1.0];

		// Compute positions.
		assertMsgOptions(numVertices % 3 == 0, 'Number of vertices should be multiple of 3.', false, true);

		for (var vtxNdx = 0; vtxNdx < numVertices; vtxNdx += 3) {
			/** @type {number} */ var h = 2.0 * quadHeight / viewportH;
			/** @type {number} */ var w = 2.0 * quadWidth / viewportW;

			/** @type {number} */ var triNdx = Math.floor(vtxNdx / 3);
			/** @type {number} */ var quadNdx = Math.floor(triNdx / 2);
			/** @type {number} */ var quadY = Math.floor(quadNdx / maxQuadsX);
			/** @type {number} */ var quadX = quadNdx % maxQuadsX;

			/** @type {number} */ var x0 = -1.0 + quadX * w;
			/** @type {number} */ var y0 = -1.0 + quadY * h;

			if (triNdx % 2 === 0) {
				this.m_positions[vtxNdx + 0] = [x0, y0, 0.0, 1.0];
				this.m_positions[vtxNdx + 1] = [x0+w, y0+h, 0.0, 1.0];
				this.m_positions[vtxNdx + 2] = [x0, y0+h, 0.0, 1.0];
			}
			else {
				this.m_positions[vtxNdx + 0] = [x0 + w, y0 + h, 0.0, 1.0];
				this.m_positions[vtxNdx + 1] = [x0, y0, 0.0, 1.0];
				this.m_positions[vtxNdx + 2] = [x0+w, y0, 0.0, 1.0];
			}
		}

		this.m_viewportW	= viewportW;
		this.m_viewportH	= viewportH;
		this.m_iterNdx	= 0;

		// m_testCtx.setTestResult(QP_TEST_RESULT_PASS, "Pass");
		testPassedOptions('Pass', true);
	};

	es3fShaderBuiltinVarTests.VertexIDCase.prototype.deinit = function() {
		this.m_program = null;

		if (this.m_positionBuffer) {
			gl.deleteBuffer(this.m_positionBuffer);
			this.m_positionBuffer = null;
		}

		if (this.m_elementBuffer) {
			gl.deleteBuffer(m_elementBuffer);
			this.m_elementBuffer = null;
		}

		this.m_positions = [];
		this.m_colors = [];
	};


	es3fShaderBuiltinVarTests.ShaderBuiltinVarTests = function() {
		tcuTestCase.DeqpTest.call(this, "builtin_variable", "Built-in Variable Tests");
	};

	es3fShaderBuiltinVarTests.ShaderBuiltinVarTests.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
	es3fShaderBuiltinVarTests.ShaderBuiltinVarTests.prototype.constructor = es3fShaderBuiltinVarTests.ShaderBuiltinVarTests;

	es3fShaderBuiltinVarTests.ShaderBuiltinVarTests.prototype.init = function() {
		var testGroup = tcuTestCase.runner.testCases;
		// Builtin constants.
		/**
		 * @struct
		 * @constructor
		 * @param {string} caseName
		 * @param {string} varName
		 * @param {es3fShaderBuiltinVarTests.GetConstantValueFunc} getValue
		 */
		var BuiltinConstant = function(caseName, varName, getValue) {
			/** @type {string} */ this.caseName = caseName;
			/** @type {string} */ this.varName = varName;
			/** @type {es3fShaderBuiltinVarTests.GetConstantValueFunc} */ this.getValue = getValue;

		};

		/** @type {Array<BuiltinConstant>} */ var builtinConstants = [
			// GLES 2.

			new BuiltinConstant("max_vertex_attribs", "gl_MaxVertexAttribs", function() { return es3fShaderBuiltinVarTests.getInteger(gl.MAX_VERTEX_ATTRIBS); }),
			new BuiltinConstant("max_vertex_uniform_vectors", "gl_MaxVertexUniformVectors", function() { return es3fShaderBuiltinVarTests.getInteger(gl.MAX_VERTEX_UNIFORM_VECTORS); }),
			new BuiltinConstant("max_fragment_uniform_vectors", "gl_MaxFragmentUniformVectors", function() { return es3fShaderBuiltinVarTests.getInteger(gl.MAX_FRAGMENT_UNIFORM_VECTORS); }),
			new BuiltinConstant("max_texture_image_units", "gl_MaxTextureImageUnits", function() { return es3fShaderBuiltinVarTests.getInteger(gl.MAX_TEXTURE_IMAGE_UNITS); }),
			new BuiltinConstant("max_vertex_texture_image_units", "gl_MaxVertexTextureImageUnits", function() { return es3fShaderBuiltinVarTests.getInteger(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS); }),
			new BuiltinConstant("max_combined_texture_image_units", "gl_MaxCombinedTextureImageUnits", function() { return es3fShaderBuiltinVarTests.getInteger(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS); }),
			new BuiltinConstant("max_draw_buffers", "gl_MaxDrawBuffers", function() { return es3fShaderBuiltinVarTests.getInteger(gl.MAX_DRAW_BUFFERS); }),

			// GLES 3.

			new BuiltinConstant("max_vertex_output_vectors", "gl_MaxVertexOutputVectors", function() { return es3fShaderBuiltinVarTests.getVectorsFromComps(gl.MAX_VERTEX_OUTPUT_COMPONENTS); }),
			new BuiltinConstant("max_fragment_input_vectors", "gl_MaxFragmentInputVectors", function() { return es3fShaderBuiltinVarTests.getVectorsFromComps(gl.MAX_FRAGMENT_INPUT_COMPONENTS); }),
			new BuiltinConstant("min_program_texel_offset", "gl_MinProgramTexelOffset", function() { return es3fShaderBuiltinVarTests.getInteger(gl.MIN_PROGRAM_TEXEL_OFFSET); }),
			new BuiltinConstant("max_program_texel_offset", "gl_MaxProgramTexelOffset", function() { return es3fShaderBuiltinVarTests.getInteger(gl.MAX_PROGRAM_TEXEL_OFFSET); })
		];

		for (var ndx = 0; ndx < builtinConstants.length; ndx++) {
			/** @type {string} */ var caseName = builtinConstants[ndx].caseName;
			/** @type {string} */ var varName = builtinConstants[ndx].varName;
			/** @type {es3fShaderBuiltinVarTests.GetConstantValueFunc} */ var getValue = builtinConstants[ndx].getValue;

			testGroup.addChild(new es3fShaderBuiltinVarTests.ShaderBuiltinConstantCase(caseName + "_vertex", varName, varName, getValue, gluShaderProgram.shaderType.VERTEX));
			testGroup.addChild(new es3fShaderBuiltinVarTests.ShaderBuiltinConstantCase(caseName + "_fragment", varName, varName, getValue, gluShaderProgram.shaderType.FRAGMENT));
		}

		testGroup.addChild(new es3fShaderBuiltinVarTests.ShaderDepthRangeTest("depth_range_vertex", "gl_DepthRange", true));
		testGroup.addChild(new es3fShaderBuiltinVarTests.ShaderDepthRangeTest("depth_range_fragment", "gl_DepthRange", false));

		// Vertex shader builtin variables.
		// \todo [2015-07-30 dag] skipping until we figure out if VertexIDCase has to be proted as well given the note below
		// addChild(new VertexIDCase		(m_context));
		// \todo [2013-03-20 pyry] gl_InstanceID -- tested in instancing tests quite thoroughly.

		// Fragment shader builtin variables.

		testGroup.addChild(new es3fShaderBuiltinVarTests.FragCoordXYZCase());
		testGroup.addChild(new es3fShaderBuiltinVarTests.FragCoordWCase());
		testGroup.addChild(new es3fShaderBuiltinVarTests.PointCoordCase());
		testGroup.addChild(new es3fShaderBuiltinVarTests.FrontFacingCase());
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
