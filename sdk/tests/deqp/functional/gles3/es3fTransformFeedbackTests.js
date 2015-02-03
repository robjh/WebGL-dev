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
