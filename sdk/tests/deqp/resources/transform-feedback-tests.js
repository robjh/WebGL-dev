
// it's a struct, invoked in the C version as a function
var Varying = (function(name, type, interpolation) {
	var container = Object.clone({
		name: null,
		type: null,
		interpolation: null
	});
	
	if (
		typeof(name) !== "undefined" &&
		typeof(type) !== "undefined" &&
		typeof(interpolation) !== "undefined"
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
			if (m_transformFeedbackVaryings[i] == "gl_PointSize") return true;
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
	
	// TODO:  this is a guess, getIntegerv might not work like this
	maxVertexAttribs           = gl.getIntegerv(GL_MAX_VERTEX_ATTRIBS);
	maxTfInterleavedComponents = gl.getIntegerv(GL_MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS);
	maxTfSeparateAttribs       = gl.getIntegerv(GL_MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS);
	maxTfSeparateComponents    = gl.getIntegerv(GL_MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS);
	
	// Check vertex attribs.
	var totalVertexAttribs = 1 /* a_position */ + (spec.isPointSizeUsed() ? 1 : 0);
	
	for (var i = 0; iter < spec.getTransformFeedbackVaryings().length; ++i) {
		
		
		
	}
	
}

