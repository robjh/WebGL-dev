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

define(['framework/opengl/gluDrawUtil'], function(deqpDraw) {
    'use strict';

	/** @const @type {number} */ var VIEWPORT_WIDTH = 128;
	/** @const @type {number} */ var VIEWPORT_HEIGHT = 128;
	/** @const @type {number} */ var BUFFER_GUARD_MULTIPLIER = 2;

	/**
	 * Enums for interpolation
	 * @enum {number}
	 */
	var interpolation = {

	INTERPOLATION_SMOOTH: 0,
	INTERPOLATION_FLAT,
	INTERPOLATION_CENTROID,
	INTERPOLATION_LAST

	};

	/**
	 * Returns interpolation name: smooth, flat or centroid
	 * @param {number} interpol interpolation enum value
	 * @return {string}
	 */
	var getInterpolationName = function(interpol) {

	switch (interpol) {
		case INTERPOLATION_SMOOTH: return 'smooth';
		case INTERPOLATION_FLAT: return 'flat';
		case INTERPOLATION_CENTROID: return 'centroid';
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
		
		var str = "a_" + varyingName.substr(deStrBeginsWith(varyingName, "v_") ? 2 : 0);
		
		for (var i = 0 ; i < path.length ; ++i) {
			var prefix;
			
			// TODO: this enum doesnt exist yet.
			switch (path[i].type) {
				case glu.VarTypeComponent.STRUCT_MEMBER:     prefix = "_m"; break;
				case glu.VarTypeComponent.ARRAY_ELEMENT:     prefix = "_e"; break;
				case glu.VarTypeComponent.MATRIX_COLUMN:     prefix = "_c"; break;
				case glu.VarTypeComponent.VECTOR_COMPONENT:  prefix = "_s"; break;
				default:
					throw Error("invalid type in the component path.");
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
			vtx += "in highp float a_pointSize;\n";
		}

		// Declare attributes.
		for (var i = 0 ; i < spec.getVaryings().length ; ++i) {
			var name = spec.getVaryings()[i].name;
			var type = spec.getVaryings()[i].type;
			
			for (var j = 0 ; j < type.count ; ++j) {
				var attribType = glu.getVarType(type, type[j].getPath);
				var attribName = getattributeName(name, type[j].getPath);
				
				vtx.str += "in " + glu.declare(attribType, attribName) + ";\n";
			}
		}
		
		// Declare vayrings.
		for (var ndx = 0; ndx < 2; ++ndx) {
			var inout  = ndx ? "in" : "out";
			var shader = ndx ? frag : vtx;
			
			for (var i = 0 ; i < spec.getStructs().length ; ++i) {
				var struct = spec.getStructs()[i];
				if (struct.hasTypeName()) {
					str += glu.declare(struct) + ";\n";
				}
			}
			
			var varyings = spec.getVaryings();
			for (var i = 0 ; i < varyings.length ; ++i) {
				shader.str += getInterpolationName(varyings->interpolation)
					       +  " " + inout + " " + 
					       +  glu.declare(varyings->type, varyings->name)
					       +  ";\n";
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
			fragSourcr: frag.str
		};
	};
	
	
	/**
	 *
	 * @param {primitiveType}
	 * @param {number} numElements
	 * @return {number}
	 */
	var getTransformFeedbackOutputCount = function(primitiveType, numElements) {

	switch (primitiveType) {
		case deqpDraw.primitiveType.TRIANGLES: return numElements - numElements % 3;
		case deqpDraw.primitiveType.TRIANGLE_STRIP: return numElements; // TODO
		case deqpDraw.primitiveType.TRIANGLE_FAN: return numElements; // TODO
		case deqpDraw.primitiveType.LINES: return numElements - numElements % 2;
		case deqpDraw.primitiveType.LINES_STRIP: return numElements; // TODO
		case deqpDraw.primitiveType.LINE_LOOP: return numElements > 1 ? numElements * 2 : 0;
		case deqpDraw.primitiveType.POINTS: return numElements;
	   }throw Error('Unrecognized primitiveType' + primitiveType);

	};


});
