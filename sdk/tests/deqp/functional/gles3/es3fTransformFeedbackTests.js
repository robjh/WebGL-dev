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


define(['framework/opengl/gluShaderUtil.js'], function(deqpUtils) {
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


	// it's a struct, invoked in the C version as a function
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

	// it's a class
	var ProgramSpec = (function() {
	
		var m_structs = [];
		var m_varyings = [];
		var m_transformFeedbackVaryings = [];
	
		this.createStruct = function(name) {
			var struct = new Object;
			m_structs.push(struct);
			return struct;
		};
	
		this.addVarying = function(name, type, interp) {
			m_varyings.push({
				Varying(name, type, interp)
			});
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


	var isProgramSupported = function(gl, spec, tfMode) {

		// all ints
		var maxVertexAttribs            = 0;
		var maxTfInterleavedComponents  = 0;
		var maxTfSeparateAttribs        = 0;
		var maxTfSeparateComponents     = 0;
	
		maxVertexAttribs           = gl.getParameter(GL_MAX_VERTEX_ATTRIBS);
		maxTfInterleavedComponents = gl.getParameter(GL_MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS);
		maxTfSeparateAttribs       = gl.getParameter(GL_MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS);
		maxTfSeparateComponents    = gl.getParameter(GL_MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS);
	
		// Check vertex attribs.
		var totalVertexAttribs = 1 /* a_position */ + (spec.isPointSizeUsed() ? 1 : 0);
	
		for (var i = 0; iter < spec.getVaryings().length; ++i) {
			totalVertexAttribs += spec.getTransformFeedbackVaryings()[i].length;
		}
	
		if (totalVertexAttribs > maxVertexAttribs)
			return false; // Vertex attribute count exceeded.
	
		// check varyings
		// also ints
		var totalTfComponents  = 0;
		var totalTfAttribs     = 0;
		var presetNumComponents = {
			gl_Position:  4,
			gl_PointSize: 1,
		};
		for (var i = 0 ; i < spec.getTransformFeedbackVaryings().length; ++i) {
			var name = spec.getTransformFeedbackVaryings()[i];
			var numComponents = 0;
		
			if (typeof(presetNumComponents[name]) != 'undefined') {
				numComponents = presetNumComponents[name];
			} else {
				glu::parseVariableName(name);
				// find the varying called varName
				var varying = (function(varyings) {
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

	var getAttributeName = function(varyingName, path) {
		
		var str = 'a_' + varyingName.substr(deStrBeginsWith(varyingName, 'v_') ? 2 : 0);
		
		for (var i = 0 ; i < path.length ; ++i) {
			var prefix;
			
			// TODO: this enum doesnt exist yet.
			switch (path[i].type) {
				case glu.VarTypeComponent.STRUCT_MEMBER:     prefix = '_m'; break;
				case glu.VarTypeComponent.ARRAY_ELEMENT:     prefix = '_e'; break;
				case glu.VarTypeComponent.MATRIX_COLUMN:     prefix = '_c'; break;
				case glu.VarTypeComponent.VECTOR_COMPONENT:  prefix = '_s'; break;
				default:
					throw Error('invalid type in the component path.');
			}
			
			str += prefix + path[i].index;
			
		}
		
		return str;
		
	};
	
	// original definition:
	// static void genShaderSources (const ProgramSpec& spec, std::string& vertSource, std::string& fragSource, bool pointSizeRequired)
	// in place of the std::string references, this function returns those params in an object
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
			var inout  = ndx ? 'in' : 'out';
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
				var subType    = glu.getVarType(type, type[i].getPath());
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
		
	}

	/**
	 * Returns the number of outputs with the count for the Primitives in the Transform Feedback.
	 * @param {WebGLRenderingContext} gl WebGL context
	 * @param {GLenum} primitiveType specifies what kind of primitive
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
	 * @param {GLenum} primitiveType specifies what kind of primitive
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
	 * @param {GLenum} primitiveType specifies what kind of primitive
	 * @return {GLenum} primitiveType
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
	 * @param {GLenum} primitiveType specifies what kind of primitive
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
	 * @param {GLenum} primitiveType specifies what kind of primitive
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


});
