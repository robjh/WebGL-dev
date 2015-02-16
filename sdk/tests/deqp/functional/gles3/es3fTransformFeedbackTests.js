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


define(['framework/opengl/gluShaderUtil.js', 'framework/opengl/gluDrawUtil', 'modules/shared/glsUniformBlockCase', 'modules/shared/glsVarType'], function(deqpUtils, deqpDraw, glsUBC, glsVT) {
    'use strict';

	/** @const @type {number} */ var VIEWPORT_WIDTH = 128;
	/** @const @type {number} */ var VIEWPORT_HEIGHT = 128;
	/** @const @type {number} */ var BUFFER_GUARD_MULTIPLIER = 2;

	/**
	 * Enums for interpolation
	 * @enum {number}
	 */
	var interpolation = {

	SMOOTH: 0,
	FLAT: 1,
	CENTROID: 2

	};

	/**
	 * Returns interpolation name: smooth, flat or centroid
	 * @param {number} interpol interpolation enum value
	 * @return {string}
	 */
	var getInterpolationName = function(interpol) {

		switch (interpol) {
		case interpolation.SMOOTH: return 'smooth';
		case interpolation.FLAT: return 'flat';
		case interpolation.CENTROID: return 'centroid';
	   }throw Error('Unrecognized interpolation name ' + interpol);

	};


	/**
	 * Returns a Varying object, it's a struct, invoked in the C version as a function
	 * @param {string} name
	 * @param {glsVT.VarType} type
	 * @param {number} interpolation
	 * @return {Object}
	 */
	var Varying = (function(name, type, interpolation) {
		var container = Object.clone({
			name: null,
			type: null,
			interpolation: null
		});

		if (
			typeof(name) !== 'undefined' &&
			typeof(type) !== 'undefined' &&
			typeof(interpolation) !== 'undefined'
		) {
			container.name = name;
			container.type = type;
			container.interpolation = interpolation;
		}

		return container;
	
	});

	/**
	 * Returns an Attribute object, it's a struct, invoked in the C version as a function
	 * @param {string} name
	 * @param {glsVT.VarType} type
	 * @param {number} offset
	 * @return {Object}
	 */
	var Attribute = (function(name, type, offset) {
		var container = Object.clone({
			name: null,
			type: null,
			offset: 0
		});

		if (
			typeof(name) !== 'undefined' &&
			typeof(type) !== 'undefined' &&
			typeof(interpolation) !== 'undefined'
		) {
			container.name = name;
			container.type = type;
			container.offset = offset;
		}

		return container;
	
	});

	// it's a class
	var ProgramSpec = (function() {

	/** @type {Array} */ var m_structs = [];
	/** @type {Array} */ var m_varyings = [];
	/** @type {Array.<string>} */ var m_transformFeedbackVaryings = [];

		this.createStruct = function(name) {
			var struct = new Object;
			m_structs.push(struct);
			return struct;
		};

		this.addVarying = function(name, type, interp) {
			m_varyings.push(new Varying(name, type, interp));
		};

		this.addTransformFeedbackVarying = function(name) {
			m_transformFeedbackVaryings.push(name);
		};

		this.getStructs = function() {
			return m_structs;
		};
		this.getVaryings = function() {
			return m_varyings;
		};
		this.getTransformFeedbackVaryings = function() {
			return m_transformFeedbackVaryings;
		};
	
		this.isPointSizeUsed() = function() {
			for (var i = 0 ; i < m_transformFeedbackVaryings.length ; ++i) {
				if (m_transformFeedbackVaryings[i] == 'gl_PointSize') return true;
			}
			return false;
		};

		/*
		member functions
			*constructor*
			*destructor*
			createStruct
			addVarying
			addTransformFeedbackVarying
			getStructs
			getVaryings
			getTransformFeedbackVaryings
			isPointSizeUsed
		
			*copy constructor*
			*assignmant operator*

		data members
			m_structs
			m_varyings
			,_transformFeedbackVaryings;
		*/
	
	});

	/** Returns if the program is spported or not
	 * @param {WebGLRenderingContext} gl WebGL context
	 * @param {ProgramSpec} spec
	 * @param {number} tfMode
	 * @return {boolean}
	 */
	var isProgramSupported = function(gl, spec, tfMode) {

		// all ints
	/** @type {number} */ var maxVertexAttribs = 0;
	/** @type {number} */ var maxTfInterleavedComponents = 0;
	/** @type {number} */ var maxTfSeparateAttribs = 0;
	/** @type {number} */ var maxTfSeparateComponents = 0;

		maxVertexAttribs = gl.getParameter(GL_MAX_VERTEX_ATTRIBS);
		maxTfInterleavedComponents = gl.getParameter(GL_MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS);
		maxTfSeparateAttribs = gl.getParameter(GL_MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS);
		maxTfSeparateComponents = gl.getParameter(GL_MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS);

		// Check vertex attribs.
	/** @type {number} */ var totalVertexAttribs = 1 /* a_position */ + (spec.isPointSizeUsed() ? 1 : 0);

		for (var i = 0; iter < spec.getVaryings().length; ++i) {
			totalVertexAttribs += spec.getTransformFeedbackVaryings()[i].length;
		}

		if (totalVertexAttribs > maxVertexAttribs)
			return false; // Vertex attribute count exceeded.

		// check varyings
		// also ints
		/** @type {number} */ var totalTfComponents = 0;
		/** @type {number} */var totalTfAttribs = 0;
		/** @type {Object.<number, number>} */ var presetNumComponents = {
			gl_Position:  4,
			gl_PointSize: 1,
		};
		for (var i = 0 ; i < spec.getTransformFeedbackVaryings().length; ++i) {
			/** @type {Array.<string>} */ var name = spec.getTransformFeedbackVaryings()[i];
			/** @type {number} */ var numComponents = 0;
		
			if (typeof(presetNumComponents[name]) != 'undefined') {
				numComponents = presetNumComponents[name];
			} else {
				glu::parseVariableName(name);
				// find the varying called varName
			/** @type {Varying} */ var varying = (function(varyings) {
					for (var i = 0 ; i < varyings.length ; ++i ) {
						if (varyings[i].name == varName) {
							return varyings[i];
						}
					}
					return null;
				}(spec.getVaryings()));
			
				// glu::TypeComponentVector
				var varPath;
			
				glu::parseTypePath(name, varying.type, varPath);
				numComponents = glu::getVarType(varying.type, varPath).getScalarSize();
			}
			
			if (tfMode == gl.SEPARATE_ATTRIBS && numComponents > maxTfSeparateComponents)
				return false; // Per-attribute component count exceeded.
			
			totalTfComponents	+= numComponents;
			totalTfAttribs		+= 1;
		}
	
		if (tfMode == GL_SEPARATE_ATTRIBS && totalTfAttribs > maxTfSeparateAttribs)
			return false;

		if (tfMode == GL_INTERLEAVED_ATTRIBS && totalTfComponents > maxTfInterleavedComponents)
			return false;

		return true;
	
	};

	/**
	 * @param {string} varyingName
	 * @param {Array.<string>} path
	 * @return {string}
	 */
	var getAttributeName = function(varyingName, path) {
		
	/** @type {string} */ var str = 'a_' + varyingName.substr(deStrBeginsWith(varyingName, 'v_') ? 2 : 0);
		
		for (var i = 0 ; i < path.length ; ++i) {
		/** @type {string} */ var prefix;
			
			// TODO: this enum doesnt exist yet.
			switch (path[i].type) {
				case glu.VarTypeComponent.STRUCT_MEMBER: prefix = '_m'; break;
				case glu.VarTypeComponent.ARRAY_ELEMENT: prefix = '_e'; break;
				case glu.VarTypeComponent.MATRIX_COLUMN: prefix = '_c'; break;
				case glu.VarTypeComponent.VECTOR_COMPONENT: prefix = '_s'; break;
				default:
					throw Error('invalid type in the component path.');
			}
			
			str += prefix + path[i].index;
			
		}
		
		return str;
		
	};
	
	/**
	 * original definition:
	 * static void genShaderSources (const ProgramSpec& spec, std::string& vertSource, std::string& fragSource, bool pointSizeRequired)
	 * in place of the std::string references, this function returns those params in an object
	 * 
	 * @param {ProgramSpec} spec
	 * @param {boolean} pointSizeRequired
	 * @return {Object.<string, string>}
	 */
	var genShaderSources = function(spec, pointSizeRequired) {
		
		var vtx  = { str: null };
		var frag = { str: null };
		var addPointSize = spec.isPointSizeUsed();
		
		vtx.str  = '#version 300 es\n'
		         + 'in highp vec4 a_position;\n';
		frag.str = '#version 300 es\n'
		         + 'layout(location = 0) out mediump vec4 o_color;\n'
		         + 'uniform highp vec4 u_scale;\n'
		         + 'uniform highp vec4 u_bias;\n';
		
		if (addPointSize) {
			vtx += 'in highp float a_pointSize;\n';
		}

		// Declare attributes.
		for (var i = 0 ; i < spec.getVaryings().length ; ++i) {
			var name = spec.getVaryings()[i].name;
			var type = spec.getVaryings()[i].type;
			
			for (var j = 0 ; j < type.count ; ++j) {
				var attribType = glu.getVarType(type, type[j].getPath);
				var attribName = getAttributeName(name, type[j].getPath);
				
				vtx.str += 'in ' + glu.declare(attribType, attribName) + ';\n';
			}
		}
		
		// Declare vayrings.
		for (var ndx = 0; ndx < 2; ++ndx) {
		/** @type {string} */ var inout  = ndx ? 'in' : 'out';
			var shader = ndx ? frag : vtx;
			
			for (var i = 0 ; i < spec.getStructs().length ; ++i) {
				var struct = spec.getStructs()[i];
				if (struct.hasTypeName()) {
					str += glu.declare(struct) + ';\n';
				}
			}
			
			var varyings = spec.getVaryings();
			for (var i = 0 ; i < varyings.length ; ++i) {
				shader.str += getInterpolationName(varyings->interpolation)
					       +  ' ' + inout + ' ' + 
					       +  glu.declare(varyings->type, varyings->name)
					       +  ';\n';
			}
		}
		
		vtx.str  += '\nvoid main (void)\n{\n'
		         +  '\tgl_Position = a_position;\n';
		frag.str += '\nvoid main (void)\n{\n'
		         +  '\thighg vec4 res = vec4(0.0);\n';
		
		if (addPointSize) {
			vtx.str += '\tgl_PointSize = a_pointSize;\n';
		} else if (pointSizeRequired) {
			vtx.str += '\tgl_PointSize = 1.0;\n';
		}
		
		for (var i = 0 i < spec.getVaryings().length ; ++i) {
			var name = spec.getVaryings()[i].name;
			var type = spec.getVaryings()[i].type;
			
			for (var j = 0 ; j < type.count ; ++j) {
				var subType = glu.getVarType(type, type[i].getPath());
				var attribName = getAttributeName(name, type[i].getPath());
				
				if (!(
					subType.isBasicType &&
					glu.isDataTypeScalarOrVector(subType.getBasicType)
				)) throw Error('Not a scalar or vector.');
				
				// Vertex: assign from attribute.
				vtx.str += '\t' + name + type[i] + ' = ' + attribName + ';\n';
				
				// Fragment: add to res variable.
				var scalarSize = glu.getDataTypeScalarSize(subType.getBasicType());
				
				frag.str << '\tres += ';
				if (scalarSize == 1)       frag.str += 'vec4(' + name + vecIter + ')';
				else if (scalarSize == 2)  frag.str += 'vec2(' + name + vecIter + ').xxyy';
				else if (scalarSize == 3)  frag.str += 'vec3(' + name + vecIter + ').xyzx';
				else if (scalarSize == 4)  frag.str += 'vec4(' + name + vecIter + ')';

				frag.str += ';\n';
			}
		}
		
		frag.str += '\to_color = res * u_scale + u_bias;\n}\n';
		vtx.str  += '}\n';
		
		return {
			vertSource: vrt.str,
			fragSource: frag.str
		};
	};
	
	var createVertexCaptureProgram = function(context, spec, bufferMode, primitiveType) {
		
		var source = genShaderSources(spec, primitiveType == GL_POINTS /* Is point size required? */);

		var programSources = new ProgramSources();
		programSources.add(new glu.VertexSource(source.vertSource))
		              .add(new glu.FragmentSource(source.fragSource))
		              .add(new glu.TransformFeedbackVaryings(spec.getTransformFeedbackVaryings())
		              .add(new glu.TransformFeedbackMode(bufferMode));
		
		return new glu.ShaderProgram(context, programSources);
		
	};

	/**
	 * Returns the number of outputs with the count for the Primitives in the Transform Feedback.
	 * @param {WebGLRenderingContext} gl WebGL context
	 * @param {deqpDraw.primitiveType} primitiveType GLenum that specifies what kind of primitive is
	 * @param {number} numElements
	 * @return {number}
	 */
	var getTransformFeedbackOutputCount = function(gl, primitiveType, numElements) {

	switch (primitiveType) {
	    case gl.TRIANGLES: return numElements - numElements % 3;
	    case gl.TRIANGLE_STRIP: return 0 >= numElements - 2 ? 0 : (numElements - 2) * 3; // obtained from de::max in deDefs.hpp(deqp repo)
	    case gl.TRIANGLE_FAN: return 0 >= numElements - 2 ? 0 : (numElements - 2) * 3;
	    case gl.LINES: return numElements - numElements % 2;
	    case gl.LINE_STRIP: return 0 >= numElements - 1 ? 0 : (numElements - 1) * 2;
	    case gl.LINE_LOOP: return numElements > 1 ? numElements * 2 : 0;
	    case gl.POINTS: return numElements;
	   }throw Error('Unrecognized primitiveType' + primitiveType);

	};

	/**
	 * Returns a number with the count for the Primitives in the Transform Feedback.
	 * @param {WebGLRenderingContext} gl WebGL context
	 * @param {deqpDraw.primitiveType} primitiveType GLenum that specifies what kind of primitive is
	 * @param {number} numElements
	 * @return {number}
	 */
	var getTransformFeedbackPrimitiveCount = function(gl, primitiveType, numElements) {

	switch (primitiveType) {
	    case gl.TRIANGLES: return numElements - numElements / 3;
	    case gl.TRIANGLE_STRIP: return 0 >= numElements - 2 ? 0 : numElements - 2; // obtained from de::max in deDefs.hpp(deqp repo)
	    case gl.TRIANGLE_FAN: return 0 >= numElements - 2 ? 0 : numElements - 2;
	    case gl.LINES: return numElements - numElements / 2;
	    case gl.LINE_STRIP: return 0 >= numElements - 1 ? 0 : numElements - 1;
	    case gl.LINE_LOOP: return numElements > 1 ? numElements : 0;
	    case gl.POINTS: return numElements;
	   }throw Error('Unrecognized primitiveType' + primitiveType);

	};

	/** 
	 * Returns the type of Primitive Mode: Triangles for all Triangle Primitive's type and same for Line and Points.
	 * @param {WebGLRenderingContext} gl WebGL context
	 * @param {deqpDraw.primitiveType} primitiveType GLenum that specifies what kind of primitive is
	 * @return {deqpDraw.primitiveType} primitiveType
	 */
	var getTransformFeedbackPrimitiveMode = function(gl, primitiveType) {

	switch (primitiveType) {
	    case gl.TRIANGLES:
	    case gl.TRIANGLE_STRIP:
	    case gl.TRIANGLE_FAN:
	    	return gl.TRIANGLES;

	    case gl.LINES:
	    case gl.LINE_STRIP
	    case gl.LINE_LOOP:
	    	return gl.LINES;

	    case gl.POINTS:
	    	return gl.POINTS;
	   }throw Error('Unrecognized primitiveType' + primitiveType);

	};

	/**
	 * Returns the attribute index for a certain primitive type.
	 * @param {WebGLRenderingContext} gl WebGL context
	 * @param {deqpDraw.primitiveType} primitiveType GLenum that specifies what kind of primitive is
	 * @param {number} numInputs
	 * @param {number} outNdx
	 * @return {number}
	 */
	var getAttributeIndex = function(gl, primitiveType, numInputs, outNdx) {

	switch (primitiveType) {
		
		case gl.TRIANGLES: return outNdx;
		case gl.LINES: return outNdx;
		case gl.POINTS: return outNdx;

		case gl.TRIANGLE_STRIP:
		{
			/** @type {number} */ var triNdx = outNdx / 3;
			/** @type {number} */ var vtxNdx = outNdx % 3;
			return (triNdx % 2 != 0 && vtxNdx < 2) ? (triNdx + 1 - vtxNdx) : (triNdx + vtxNdx);
		}

		case gl.TRIANGLE_FAN:
			return (outNdx % 3 != 0) ? (outNdx / 3 + outNdx % 3) : 0;

		case gl.LINE_STRIP:
			return outNdx / 2 + outNdx % 2;

		case gl.LINE_LOOP:
		{
			var inNdx = outNdx / 2 + outNdx % 2;
			return inNdx < numInputs ? inNdx : 0;
		}

	   }throw Error('Unrecognized primitiveType' + primitiveType);

	};

	/**
	 * Returns an object type DrawCall.
	 * Contains the number of elements as well as whether the Transform Feedback is enabled or not.
	 * It's a struct, but as occurs in Varying, is invoked in the C++ version as a function.
	 * @param {number} numElements
	 * @param {boolean} tfEnabled is Transform Feedback enabled or not
	 * @return {Object.<number, boolean>} content for the DrawCall object
	 */
	var DrawCall = (function(numElements, tfEnabled) {

		var content = Object.clone({
		/** @type {number} */ numElements: null,
		/** @type {boolean} */ transformFeedbackEnabled: null
		});

		if (numElements === null || tfEnabled === null) {
			content.numElements = 0;
			content.transformFeedbackEnabled = false;
		} else {
			content.numElements = numElements;
			content.transformFeedbackEnabled = tfEnabled;
		}

		return content;
	});

	/**
	 * Returns (for all the draw calls) the type of Primitive Mode, as it calls "getTransformFeedbackPrimitiveCount".
	 * @param {WebGLRenderingContext} gl WebGL context
	 * @param {deqpDraw.primitiveType} primitiveType GLenum that specifies what kind of primitive is
	 * @param {Object.<number, boolean>} first DrawCall object
	 * @param {Object.<number, boolean>} end DrawCall object
	 * @return {number} primCount
	 */
	var computeTransformFeedbackPrimitiveCount= function(gl, primitiveType, first, end) {

	/** @type {number} */ var primCount = 0;

		for (var callElements= first.numElements; callElements != end.numElements; ++ callElements) {
			primCount += getTransformFeedbackPrimitiveCount(gl, primitiveType, callElements);
		}

		return primCount;
	};

	/**
	 * Returns an object type Attribute.
	 * Contains the number of elements and if the Transform Feedback is enabled or not.
	 * It's a struct, but as occurs in Varying, is invoked in the C++ version as a function.
	 * @param {string} name
	 * @param {deqpUtils.DataType} type
	 * @param {number} offset
	 * @return {Object.<string, type, number>} container for the type Attribute object
	 */
	var Attribute = (function(name, type, offset) {
		var container = Object.clone({
		/** @type {string} */ name: null,
		/** @type {deqpUtils.DataType} */ type: null,
		/** @type {number} */ offset: null
		});

		if (
			typeof(name) !== 'undefined' &&
			typeof(type) !== 'undefined' &&
			typeof(offset) !== 'undefined'
		) {
			container.name = name;
			container.type = type;
			container.offset = offset;
		}

		return container;

	});

	var TransformFeedbackCase = (function(context, name, desc, bufferMode, primitiveType) {
		
		var parent = {
			_construct: this._construct,
		}
		
		this._construct = function(context, name, desc, bufferMode, primitiveType) {
			if (
				typeof(context)       !== 'undefined' &&
				typeof(name)          !== 'undefined' &&
				typeof(desc)          !== 'undefined' &&
				typeof(bufferMode)    !== 'undefined' &&
				typeof(primitiveType) !== 'undefined'
			) {
				parent._construct(context, name, desc);
				m_bufferMode    = bufferMode;
				m_primitiveType = primitiveType;
			}
		};
		
		this.init = function() {
			var log = m_testCtx.getLog(); // TestLog&
			var gl  = m_context.getRenderContext().getFunctions(); // const glw::Functions&
			
			if (m_program != null) { throw Error('m_program isnt null.'); }
			m_program = createVertexCaptureProgram(
				m_context.getRenderContext(),
				m_progSpec,
				m_bufferMode,
				m_primitiveType
			);
			
			log.log(m_program);
			
			if (!m_program->isOk()) {
				
				var linkFail = m_program->getShaderInfo(glu.SHADERTYPE_VERTEX).compileOk &&
				               m_program->getShaderInfo(glu.SHADERTYPE_FRAGMENT).compileOk &&
				               !m_program->getProgramInfo().linkOk;
				
				if (linkFail) {
					if (!isPorgramSupported(gl, m_proSpec, m_bufferMode)) {
						throw new Error('Not Supported. Implementation limits exceeded.');
					} else if (hasArraysInTFVaryings(m_progSpec)) {
						throw new Error('Capturing arrays is not supported (undefined in specification)');
					} else {
						throw new Error('Link failed');
					}
				} else {
					throw new Error ('Compile failed');
				}
			}

			// TODO: TestLog static members
			log.log(
				TestLog.Message +
				'Transform feedback varyings: ' +
				tcu.formatArray(m_progSpec.getTransformFeedbackVaryings()) +
				TestLog.EndMessage
			);

			// Print out transform feedback points reported by GL.
			log.log(TestLog.Message + 'Transform feedback varyings reported by compiler:' + TestLog.EndMessage);
			logTransformFeedbackVaryings(log, gl, m_program.getProgram());

			// Compute input specification.
			computeInputLayout(m_attributes, m_inputStride, m_progSpec.getVaryings(), m_progSpec.isPointSizeUsed());

			// Build list of varyings used in transform feedback.
			computeTransformFeedbackOutputs(
				m_transformFeedbackOutputs, // TODO: make sure this param is working as intended
				m_attributes,
				m_progSpec.getVaryings(),
				m_progSpec.getTransformFeedbackVaryings(),
				m_bufferMode
			);
			if (!m_transformFeedbackOutputs.length) {
				throw new Error('transformFeedbackOutputs cannot be empty.');
			}

			// Buffer strides.
			if (!m_bufferStrides.length) {
				throw new Error('bufferStrides cannot be empty.');
			}
			if (m_bufferMode == GL.SEPARATE_ATTRIBS) {
				for (var i = 0 ; i < m_transformFeedbackOutputs.length ; ++i) {
					m_bufferStrides.push(m_transformFeedbackOutputs[i].type.getScalarSize() * 4 /*sizeof(deUint32)*/);
				}
			} else {
				var totalSize = 0;
				for (var i = 0 ; i < m_transformFeedbackOutputs.length ; ++i) {
					totalSize += m_transformFeedbackOutputs[i].type.getScalarSize() * 4 /*sizeof(deUint32)*/;
				}
				m_bufferStrides.push(totalSize);
			}

			// \note Actual storage is allocated in iterate().
		//	m_outputBuffers.resize(m_bufferStrides.size()); //                  <-- not needed in JS
		//	gl.genBuffers(m_outputBuffers.length, m_outputBuffers); // TODO:    <-- rework

			DE_ASSERT(!m_transformFeedback);
			if (m_transformFeedback != null) {
				throw new Error('transformFeedback is already set.');
			}
			m_transformFeedback = new glu.TransformFeedback(m_context.getRenderContext());

			GLU_EXPECT_NO_ERROR(gl.getError(), 'init');

			m_iterNdx = 0;
			m_testCtx.setTestResult(QP_TEST_RESULT_PASS, 'Pass');

		};
		this.deinit = function() {
		
			var gl = m_context.getRenderContext().getFunctions();

			if (!m_outputBuffers.empty()) {
			//	gl.deleteBuffers((glw::GLsizei)m_outputBuffers.size(), &m_outputBuffers[0]); // TODO: rework
				m_outputBuffers.clear();
			}

		//	delete m_transformFeedback;
			m_transformFeedback = null;

		//	delete m_program;
			m_program = null;

			// Clean up state.
			m_attributes.clear();
			m_transformFeedbackOutputs.clear();
			m_bufferStrides.clear();
			m_inputStride = 0;
		
		};
		
		this.iterate = function() {

			// static vars
			var s = TransformFeedbackCase.s_iterate;

			var log  = m_textCtx.getLog();
			var isOk = true;
			var seed = deStringHash(getName()) ^ deInt32Hash(m_iterNdx);
			var numIterations = TransformFeedbackCase.s_iterate.iterations.length;
			// first and end ignored.

			var sectionName = 'Iteration'  + (m_iterNdx+1);
			var sectionDesc = 'Iteration ' + (m_iterNdx+1) + ' / ' + numIterations;
//			var section; // something weird.

			log.log(
				TestLog.Message +
				'Testing ' +
				s.testCases[ s.iterations[m_iterNdx] ].length +
				' draw calls, (element count, TF state): ' +
				tcu.formatArray(s.testCases[ s.iterations[m_iterNdx] ]) +
				TestLog.EndMessage
			);

			isOk = runTest(s.testCases[s.iterations[m_iterNdx]], seed);

			if (!isOk) {
				m_testCtx.setTestResult(QP_TEST_RESULT_FAIL, 'Result comparison failed'); // TODO: find QP_TEST_RESULT_FAIL
			}

			m_iterNdx += 1;

			return(isOk && m_iterNdx < numIterations) ? CONTINUE : STOP; // TODO: find CONTINUTE, find STOP

		};

		/* protected */
		this.m_progSpec      = null;
		this.m_bufferMode    = null;
		this.m_primitiveType = null;

		/* private */
	//	var assign = function(/*const*/ other) { }; // defined but not implemented?
		var runTest = function(calls, seed) {

			var _min = function(x,y) { return x < y ? x : y; };

			var log             = m_testCtx.getLog();
			var gl              = m_context.getRenderContext().getFunctions();
			var rnd             = new de.Random(seed);
			var numInputs       = 0;
			var numOutputs      = 0;
			var width           = m_context.getRenderContext().getRenderTarget().getWidth();
			var height          = m_context.getRenderContext().getRenderTarget().getHeight();
			var viewportW       = _min(VIEWPORT_WIDTH,  width);
			var viewportH       = _min(VIEWPORT_HEIGHT, height);
			var viewportX       = rnd.getInt(0, width-viewportW);
			var viewportY       = rnd.getInt(0, height-viewportH);
			var frameWithTf     = new tcu.Surface(viewportW, viewportH); // tcu::Surface
			var frameWithoutTf  = new tcu.Surface(viewportW, viewportH); // tcu::Surface
			var primitiveQuery  = new glu.Query(m_context.getRenderContext()); // glu::Query
			var outputsOk       = true;
			var imagesOk        = true;
			var queryOk         = true;

			// Compute totals.
			for (var i = 0 ;i < calls.length ;++i) {
				var call = calls[i];
				numInputs	+= call.numElements;
				numOutputs	+= call.transformFeedbackEnabled ? getTransformFeedbackOutputCount(m_primitiveType, call.numElements) : 0;
			}

			// Input data.
			var inputData = genInputData(m_attributes, numInputs, m_inputStride, rnd);

			gl.bindTransformFeedback(GL_TRANSFORM_FEEDBACK, m_transformFeedback->get());
			GLU_EXPECT_NO_ERROR(gl.getError(), 'glBindTransformFeedback()');

			// Allocate storage for transform feedback output buffers and bind to targets.
			for (var bufNdx = 0 ; bufNdx < m_outputBuffers.length; ++bufNdx) {
				var buffer = m_outputBuffers[bufNdx]; // deUint32
				var stride = m_bufferStrides[bufNdx]; // int
				var	target = bufNdx; // int
				var	size = stride * numOutputs; // int
				var	guardSize = stride*BUFFER_GUARD_MULTIPLIER; // int
				var usage = GL_DYNAMIC_READ; // const deUint32

				gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, buffer);
				gl.bufferData(gl.TRANSFORM_FEEDBACK_BUFFER, size + guardSize, DE_NULL, usage);
				writeBufferGuard(gl, gl.TRANSFORM_FEEDBACK_BUFFER, size, guardSize);

				// \todo [2012-07-30 pyry] glBindBufferRange()?
				gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, target, buffer);

				GLU_EXPECT_NO_ERROR(gl.getError(), 'transform feedback buffer setup');
			}
			
			// Setup attributes.
			for (var i = 0 ; i < m_attributes.length ; ++i) {
				var loc           = gl.getAttribLocation(m_program->getProgram(), attrib->name);
				var scalarType    = glu::getDataTypeScalarType(attrib->type.getBasicType());
				var numComponents = glu::getDataTypeScalarSize(attrib->type.getBasicType());
				
				if (loc >= 0) {
					gl.enableVertexAttribArray(loc);
					var type = null;
					switch (scalarType){
						case glu.TYPE_FLOAT: type = gl.FLOAT;        break;
						case glu.TYPE_INT:   type = gl.INT;          break;
						case glu.TYPE_UINT:  type = gl.UNSIGNED_INT; break;
					}
					if (type !== null) {
						gl.vertexAttribPointer (loc, numComponents, type, GL_FALSE, m_inputStride, ptr);
					}
				}
			}
			
			// Setup viewport.
			gl.viewport(viewportX, viewportY, viewportW, viewportH);

			// Setup program.
			gl.useProgram(m_program->getProgram());

			gl.uniform4fv(
				gl.getUniformLocation(m_program->getProgram(), 'u_scale'),
				1, tcu.Vec4(0.01)
			);
			gl.uniform4fv(
				gl.getUniformLocation(m_program->getProgram(), 'u_bias'),
				1, tcu.Vec4(0.5)
			);

			// Enable query.
			gl.beginQuery(gl.TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN, primitiveQuery);
			GLU_EXPECT_NO_ERROR(gl.getError(), 'glBeginQuery(GL_TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN)');
			
			// Draw
			{
				var offset     = 0;
				var tfEnabled  = true;
				
				gl.clear(gl.COLOR_BUFFER_BIT);
				
				gl.beginTransformFeedback(getTransformFeedbackPrimitiveMode(m_primitiveType));
				
				for (var i = 0 ; i < calls.length ; ++i) {
					var call = calls[i];
					
					// Pause or resume transform feedback if necessary.
					if (call.transformFeedbackEnabled != tfEnabled)
					{
						if (call.transformFeedbackEnabled)
							gl.resumeTransformFeedback();
						else
							gl.pauseTransformFeedback();
						tfEnabled = call.transformFeedbackEnabled;
					}

					gl.drawArrays(m_primitiveType, offset, call.numElements);
					offset += call.numElements;
				}
				
				// Resume feedback before finishing it.
				if (!tfEnabled)
					gl.resumeTransformFeedback();

				gl.endTransformFeedback();
				GLU_EXPECT_NO_ERROR(gl.getError(), 'render');
			}
			
			gl.endQuery(GL_TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN);
			GLU_EXPECT_NO_ERROR(gl.getError(), 'glEndQuery(GL_TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN)');
			
			// Check and log query status right after submit
			{
				deUint32 available = GL_FALSE;
				gl.getQueryParameter(primitiveQuery, gl.QUERY_RESULT_AVAILABLE, available);
				GLU_EXPECT_NO_ERROR(gl.getError(), 'glGetQueryObjectuiv()');

				log.log(
					TestLog.Message +
					'GL_TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN status after submit: ' +
					(available != GL_FALSE ? 'GL_TRUE' : 'GL_FALSE') +
					TestLog.EndMessage
				);
			}
			
			// Compare result buffers.
			for (var bufferNdx = 0 ; bufferNdx < m_outputBuffers.length ; ++bufferNdx) {
				var buffer     = m_outputBuffers[bufferNdx];        // deUint32
				var stride     = m_bufferStrides[bufferNdx];        // int
				var size       = stride * numOutputs;               // int
				var guardSize  = stride * BUFFER_GUARD_MULTIPLIER;  // int
				var buffer     = new ArrayBuffer(size+guardSize);   // const void*
				
				// Bind buffer for reading.
				gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, buffer);
				
				gl.getBufferSubData(gl.TRANSFORM_FEEDBACK_BUFFER, 0, buffer); // (spec says to use ArrayBufferData)
				GLU_EXPECT_NO_ERROR(gl.getError(), "mapping buffer");
				
				// Verify all output variables that are written to this buffer.
				for (var i = 0 ; i < m_transformFeedbackOutputs.length ; ++i) {
					var out = m_transformFeedbackOutputs[i];
					
					if (out.bufferNdx != bufferNdx)
						continue;
					
					var inputOffset   = 0;
					var	outputOffset  = 0;
					
					// Process all draw calls and check ones with transform feedback enabled
					for (var callNdx = 0 ; callNdx < calls.length ; ++callNdx) {
						var call = calls[callNdx];
						
						if (call.transformFeedbackEnabled) {
							var inputPtr  = &inputData[0] + inputOffset*m_inputStride; // const deUint8*
							var outputPtr = (const deUint8*)bufPtr + outputOffset*stride; // const deUint8*

							if (!compareTransformFeedbackOutput(log, m_primitiveType, *out, call->numElements, inputPtr, m_inputStride, outputPtr, stride)) {
								outputsOk = false;
								break;
							}
						}

						inputOffset   += call->numElements;
						outputOffset  += call->transformFeedbackEnabled ? getTransformFeedbackOutputCount(m_primitiveType, call->numElements) : 0;
						
					}
				}
	
			}
		};

		// Derived from ProgramSpec in init()
		var m_inputStride       = 0;
		var m_attributes        = [];    // vector<Attribute>
		var m_transformFeedbackOutputs = []; // vector<Output>
		var m_bufferStrides     = [];    // vector<int>

		// GL state.
		var m_program           = null;  // glu::ShaderProgram
		var m_transformFeedback = null;  // glu::TransformFeedback
		var m_outputBuffers     = [];    // vector<deUint32>

		var m_iterNdx           = 0;     // int

		this._construct(context, name, desc, bufferMode, primitiveType);

	});
	// static data
	TransformFeedbackCase.s_iterate = {
		testCases: {
			elemCount1:   [DrawCall(  1, true)],
			elemCount2:   [DrawCall(  2, true)],
			elemCount3:   [DrawCall(  3, true)],
			elemCount4:   [DrawCall(  4, true)],
			elemCount123: [DrawCall(123, true)],
			basicPause1:  [DrawCall( 64, true),  DrawCall( 64, false), DrawCall( 64, true)],
			basicPause2:  [DrawCall( 13, true),  DrawCall(  5, true),  DrawCall( 17, false),
			               DrawCall(  3, true),  DrawCall(  7, false)],
			startPaused:  [DrawCall(123, false), DrawCall(123, true)],
			random1:      [DrawCall( 65, true),  DrawCall(135, false), DrawCall( 74, true),
			               DrawCall( 16, false), DrawCall(226, false), DrawCall(  9, true),
			               DrawCall(174, false)],
			random2:      [DrawCall(217, true),  DrawCall(171, true),  DrawCall(147, true),
			               DrawCall(152, false), DrawCall( 55, true)],
		},
		iterations = [
			'elemCount1',  'elemCount2',  'elemCount3', 'elemCount4', 'elemCount1234',
			'basicPause1', 'basicPause2', 'startPaused',
			'random1',     'random2'
		]
	};

	// TODO: find TestCase
	TransformFeedbackCase.prototype = new TestCase();

	/**
	 * Returns an Output object
	 * @return {Object}
	 */
	var Output = function() {

	return{
	/** @type {number} */ bufferNdx: 0,
	/** @type {number} */ offset: 0,
	/** @type {string} */ name: null,
	/** @type {glsVT.VarType} */ type: null,
	/** @type {Array.<Attribute>} */ inputs: null
	};

	};

	/**
	 * @param {Array.<Attribute>} attributes
	 * @param {number} inputStride
	 * @param {Array.<Varying>} varyings
	 * @param {boolean} usePointSize
	 */
	var computeInputLayout = function(attributes, inputStride, varyings, usePointSize) {

		inputStride = 0;

		// Add position
		var dataTypeVec4 = glsVT.VarType().VarTypeBasic(deqpUtils.DataType.FLOAT_VEC4, glsUBC.UniformFlags.PRECISION_HIGHP);
		attributes.push(new Attribute('a_position', dataTypeVec4, inputStride));
		inputStride += 4 * 4; /*sizeof(deUint32)*/

		if (usePointSize)
		{
			var dataTypeFloat = glsVT.VarType().VarTypeBasic(deqpUtils.DataType.FLOAT, glsUBC.UniformFlags.PRECISION_HIGHP);
			attributes.push(new Attribute('a_pointSize', dataTypeFloat, inputStride));
			inputStride += 1 * 4; /*sizeof(deUint32)*/
		}

		for (var i = 0; i < varyings.length; i++)
		{
			// TODO: check loop's conditions
			for (var vecIter = varyings[i].type; vecIter < varyings[varyings.length].type; vecIter++)
			{
				var	type = vecIter;
				var name = getAttributeName(varyings[i].name, vecIter.getPath);

				attributes.push(new Attribute(name, type, inputStride));
				inputStride += deqpUtils.getDataTypeScalarSize(type) * 4; /*sizeof(deUint32)*/
			}
		}
	};

	/**
	 * @param {Array.<Output>} transformFeedbackOutputs
	 * @param {Array.<Attribute>} attributes
	 * @param {Array.<Varying>} varyings
	 * @param {Array.<string>} transformFeedbackVaryings
	 * @param {number} bufferMode
	 */
	var computeTransformFeedbackOutputs = function(transformFeedbackOutputs, attributes, varyings, transformFeedbackVaryings, bufferMode) {

	/** @type {number} */ var accumulatedSize = 0;

		// transformFeedbackOutputs.resize(transformFeedbackVaryings.size());
		for (var varNdx = 0; varNdx < transformFeedbackVaryings.length; varNdx++)
		{
		/** @type {string} */ var name = transformFeedbackVaryings[varNdx];
		/** @type {number} */ var bufNdx = (bufferMode === 'separate' ? varNdx : 0); // TODO: bufferModes[] {GL_SEPARATE_ATTRIBS: 'separate'}
		/** @type {number} */ var offset = (bufferMode === 'separate' ? 0 : accumulatedSize); // TODO: bufferModes[] {GL_SEPARATE_ATTRIBS: 'separate'}
		/** @type {Output} */ var output = transformFeedbackOutputs[varNdx];

			output.name	= name;
			output.bufferNdx = bufNdx;
			output.offset = offset;

			if (name === 'gl_Position')
			{
			/** @type {Attribute} */ var posIn = findAttributeNameEquals(attributes, 'a_position');
				output.type = posIn.type;
				output.inputs.push(posIn);
			}
			else if (name === 'gl_PointSize')
			{
			/** @type {Attribute} */ var sizeIn = findAttributeNameEquals(attributes, 'a_pointSize');
				output.type = sizeIn.type;
				output.inputs.push(sizeIn);
			}
			else
			{
				// TODO: not sure line below string varName = glu::parseVariableName(name.c_str()); see "gluVarTypeUtil.cpp"
				/** @type {string} */ var varName = name;
				/** @type {Varying} */ var varying = findAttributeNameEquals(varyings, varName);

				/** TODO: see gluVarTypeUtil.cpp and .hpp DEQP repository within \framework\opengl
				 * glu::TypeComponentVector,  glu::parseTypePath and glu::getVarType

				 	glu::TypeComponentVector varPath;
				 	glu::parseTypePath(name.c_str(), varying.type, varPath);
				 	output.type = glu::getVarType(varying.type, varPath);

				 */

				// Add all vectorized attributes as inputs.
				// TODO: check loop's conditions, not sure of this
				for (var iter = transformFeedbackOutputs[varNdx].type; iter < transformFeedbackOutputs[transformFeedbackOutputs.length].type; iter++)
				{
				/** TODO: implement Full path. See gluVarTypeUtil.cpp and .hpp DEQP repository within \framework\opengl
					 * glu::TypeComponentVector,  glu::parseTypePath and glu::getVarType

					glu::TypeComponentVector fullPath(varPath.size() + iter.getPath().size());
					std::copy(varPath.begin(), varPath.end(), fullPath.begin());
					std::copy(iter.getPath().begin(), iter.getPath().end(), fullPath.begin()+varPath.size());

				*/

					/** @type {string} */ var attribName = getAttributeName(varName, fullPath);
					/** @type {Attribute} */ var attrib	= findAttributeNameEquals(attributes, attribName);
					output.inputs.push(attrib);
				}
			}

			// TODO: implement getScalarSize(). See gluVarType.cpp and .hpp DEQP repository within \framework\opengl
			accumulatedSize += output.type.getScalarSize() * 4; /*sizeof(deUint32)*/
		}
	};

	/**
	 * Returns an Attribute or Varying object which matches its name with the passed string value in the function
	 * @param {Array.<Attribute> || Array.<Varying>} array
	 * @param {string} name
	 * @return {Attribute || Varying}
	 */
	var findAttributeNameEquals = function(array, name) {

	/** @type {boolean} */ var attributeNameFound = false;
		for (var pos = 0; pos < array.length; pos++)
		{
			if (array[pos].name === name) {

				attributeNameFound = true;
				return array[pos];
			}
		}
		// TODO: I don't know if this error is necessary ??
		if (attributeNameFound === false)
		throw Error('Attribute or Varying name: ' + name + ', has not been found in the array');
	};

	/**
	 * @param {deqpDraw.primitiveType} primitiveType type number in deqpDraw.primitiveType
	 * @param {Output} output
	 * @param {number} numInputs
	 * @param {number} inBasePtr
	 * @param {number} inStride
	 * @param {number} outBasePtr
	 * @param {number} outStride
	 * @return {boolean} isOk
	 */
	var compareTransformFeedbackOutput = function(primitiveType, output, numInputs, inBasePtr, inStride, outBasePtr, outStride) {

	/** @type {boolean} */ var isOk	= true;
	/** @type {number} */ var outOffset	= output.offset;

		for (var attrNdx = 0; attrNdx < output.inputs.length; attrNdx++)
		{
		/** @type {Attribute} */ var attribute = output.inputs[attrNdx];
		/** @type {deqpUtils.DataType} */ var type	= attribute.type;
		/** @type {number} */ var numComponents	= deqpUtils.getDataTypeScalarSize(type);
		
		// TODO: below type glsUBC.UniformFlags ?
		/** @type {deqpUtils.precision} */ var precision = attribute.type.getPrecision(); // TODO: getPrecision() called correctly? implemented in glsVarType.js

		/** @type {string} */ var scalarType = deqpUtils.getDataTypeScalarType(type);
		/** @type {number} */ var numOutputs = getTransformFeedbackOutputCount(primitiveType, numInputs);

			for (var outNdx = 0; outNdx < numOutputs; outNdx++)
			{
			/** @type {number} */ var inNdx = getAttributeIndex(primitiveType, numInputs, outNdx);

				for (var compNdx = 0; compNdx < numComponents; compNdx++)
				{
				/** @type {number} */ var inPtr	= inBasePtr + inStride * inNdx + attribute.offset + compNdx * 4; /*sizeof(deUint32)*/
				/** @type {number} */ var outPtr = outBasePtr + outStride * outNdx + outOffset + compNdx * 4; /*sizeof(deUint32)*/
				/** @type {boolean} */ var isEqual	= false;
				/** @type {number} */ var difInOut = inPtr - outPtr;

					if (scalarType === 'float')
					{
						// ULP comparison is used for highp and mediump. Lowp uses threshold-comparison.
						switch (precision)
						{
							case deqpUtils.precision.PRECISION_HIGHP: // or case glsUBC.UniformFlags.PRECISION_HIGHP: ?
							{
								isEqual = (difInOut < 0 ? - difInOut : difInOut) < 2;
								break;
							}

							case deqpUtils.precision.PRECISION_MEDIUMP: // or case glsUBC.UniformFlags.PRECISION_MEDIUMP: ?
							{
								isEqual = (difInOut < 0 ? - difInOut : difInOut) < 2 + (1 << 13);
								break;
							}

							case deqpUtils.precision.PRECISION_LOWP: // or case glsUBC.UniformFlags.PRECISION_LOWP: ?
							{
								// TODO: check? casts for floats removed
								isEqual = (difInOut < 0 ? - difInOut : difInOut) < 0.1;
								break;
							}
							default:
								// TODO: DE_ASSERT(false);
						}
					}
					else
						isEqual = (inPtr === outPtr); // Bit-exact match required for integer types.

					if (!isEqual)
					{
						bufferedLogToConsole('Mismatch in ' + output.name + ' (' + attribute.name + '), output = ' + outNdx + ', input = ' + inNdx + ', component = ' + compNdx);
						isOk = false;
						break;
					}
				}

				if (!isOk)
					break;
			}

			if (!isOk)
				break;

			outOffset += numComponents * 4; /*sizeof(deUint32)*/
		}

		return isOk;
	};



});
