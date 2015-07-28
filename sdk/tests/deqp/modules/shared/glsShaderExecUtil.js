/*-------------------------------------------------------------------------
 * drawElements Quality Program OpenGL (ES) Module
 * -----------------------------------------------
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
 * \brief Shader execution utilities.
 *//*--------------------------------------------------------------------*/
'use strict';
goog.provide('modules.shared.glsShaderExecUtil');
goog.require('framework.opengl.gluVarType');
goog.require('framework.opengl.gluShaderUtil');
goog.require('framework.opengl.gluShaderProgram');
goog.require('framework.opengl.gluDrawUtil');
goog.require('framework.opengl.gluTextureUtil');
goog.require('framework.common.tcuTexture');



goog.scope(function() {

    var glsShaderExecUtil = modules.shared.glsShaderExecUtil;
    var gluVarType = framework.opengl.gluVarType;
    var gluShaderUtil = framework.opengl.gluShaderUtil;
    var gluShaderProgram = framework.opengl.gluShaderProgram;
    var gluDrawUtil = framework.opengl.gluDrawUtil;
    var gluTextureUtil = framework.opengl.gluTextureUtil;
    var tcuTexture = framework.common.tcuTexture;

    var DE_ASSERT = function(x) {
        if (!x)
            throw new Error('Assert failed');
    };

    var setParentClass = function(child, parent) {
        child.prototype = Object.create(parent.prototype);
        child.prototype.constructor = child;
    };

     /**
      * @constructor
      * @param {string=} name
      * @param {gluVarType.VarType=} varType
      */
      glsShaderExecUtil.Symbol = function(name, varType) {
        name = name === undefined ? '<unnamed>' : name;
         /** @type {string} */ this.name = name;
         /** @type {gluVarType.VarType} */ this.varType = varType || null;
     };


    //! Complete shader specification.
    /**
     * @constructor
     */
    glsShaderExecUtil.ShaderSpec = function() {
        /** @type{gluShaderUtil.GLSLVersion} */ this.version = gluShaderUtil.GLSLVersion.V300_ES; //!< Shader version.
    	/** @type{Array<glsShaderExecUtil.Symbol>} */ this.inputs;
    	/** @type{Array<glsShaderExecUtil.Symbol>} */ this.outputs;
    	/** @type{Array<string>} */ this.globalDeclarations; //!< These are placed into global scope. Can contain uniform declarations for example.
    	/** @type{Array<string>} */ this.source; //!< Source snippet to be executed.
    };

    /**
     * Base class for shader executor.
     * @constructor
     * @param{glsShaderExecUtil.ShaderSpec} shaderSpec
     */
    glsShaderExecUtil.ShaderExecutor = function(shaderSpec) {
        /** @type{Array<glsShaderExecUtil.Symbol>} */ this.m_inputs = shaderSpec.inputs;
    	/** @type{Array<glsShaderExecUtil.Symbol>} */ this.m_outputs = shaderSpec.outputs;
    };

    glsShaderExecUtil.ShaderExecutor.prototype.useProgram = function() {
    	DE_ASSERT(this.isOk);
    	gl.useProgram(this.getProgram());
    }

    /**
     * @return {boolean}
     */
    glsShaderExecUtil.ShaderExecutor.prototype.isOk = function() {
        throw new Error('Virtual function. Please override.');
    };


    /**
     * @return {WebGLProgram}
     */
    glsShaderExecUtil.ShaderExecutor.prototype.getProgram = function() {
        throw new Error('Virtual function. Please override.');
    };


    /**
     */
    glsShaderExecUtil.ShaderExecutor.prototype.execute = function(numValues, inputs, outputs) {
        throw new Error('Virtual function. Please override.');
    };

    /**
     * Base class for shader executor.
     * @param{gluShaderProgram.shaderType} shaderType
     * @param{glsShaderExecUtil.ShaderSpec} shaderSpec
     * @return{glsShaderExecUtil.ShaderExecutor}
     */
    glsShaderExecUtil.createExecutor = function(shaderType, shaderSpec) {
       switch (shaderType)
       {
           case gluShaderProgram.shaderType.VERTEX:                    return new glsShaderExecUtil.VertexShaderExecutor(shaderSpec);
           case gluShaderProgram.shaderType.FRAGMENT:                  return new glsShaderExecUtil.FragmentShaderExecutor(shaderSpec);
           default:
               throw new Error("Unsupported shader type: " + shaderType);
        }
    };

    /**
     * @param{glsShaderExecUtil.ShaderSpec} shaderSpec
     * @return{string}
     */
    glsShaderExecUtil.generateVertexShader = function(shaderSpec) {
    	/** @type{boolean} */ var usesInout	= true;
    	/** @type{string} */ var in_ = usesInout ? 'in' : 'attribute';
    	/** @type{string} */ var out = usesInout ? 'out' : 'varying';
    	/** @type{string} */ var src = '';
        /** @type{number} */ var vecSize;
        /** @type{gluShaderUtil.DataType} */ var intBaseType;

    	src += '#version 300 es\n';

    	if (shaderSpec.globalDeclarations.length > 0)
    		src += (shaderSpec.globalDeclarations + '\n');

    	for (var i = 0; i < shaderSpec.inputs.length; ++i)
    		src += (in_ + ' ' + gluVarType.declareVariable(shaderSpec.inputs[i].varType, shaderSpec.inputs[i].name) + ';\n');

    	for (var i = 0; i < shaderSpec.outputs.length; i++)	{
            var output = shaderSpec.outputs[i];
    		DE_ASSERT(output.varType.isBasicType());

    		if (gluShaderUtil.isDataTypeBoolOrBVec(output.varType.getBasicType())) {
    			vecSize = gluShaderUtil.getDataTypeScalarSize(output.varType.getBasicType());
    			intBaseType = vecSize > 1 ? gluShaderUtil.getDataTypeVector(gluShaderUtil.DataType.INT, vecSize) : gluShaderUtil.DataType.INT;
    			/** @type{gluVarType.VarType} */ var intType = new gluVarType.VarType().VarTypeBasic(intBaseType, gluShaderUtil.precision.PRECISION_HIGHP);

    			src += ('flat ' + out + ' ' + gluVarType.declareVariable(intType, 'o_' + output.name) + ';\n');
    		}
    		else
    			src += ('flat ' + out + ' ' + gluVarType.declareVariable(output.varType, output.name) + ';\n');
    	}

    	src += '\n'
    		+ 'void main (void)\n'
    		+ '{\n'
    		+ '	gl_Position = vec4(0.0);\n'
    		+ '	gl_PointSize = 1.0;\n\n';

    	// Declare necessary output variables (bools).
    	for (var i = 0; i < shaderSpec.outputs.length; i++)	{
    		if (gluShaderUtil.isDataTypeBoolOrBVec(shaderSpec.outputs[i].varType.getBasicType()))
    			src += ('\t' + gluVarType.declareVariable(shaderSpec.outputs[i].varType, shaderSpec.outputs[i].name) + ';\n');
    	}

    	//Operation - indented to correct level.
        // TODO: Add indenting
        src += shaderSpec.source.print();

    	// Assignments to outputs.
    	for (var i = 0; i < shaderSpec.outputs.length; i++)	{
    		if (gluShaderUtil.isDataTypeBoolOrBVec(output.varType.getBasicType())) {
    			vecSize = gluShaderUtil.getDataTypeScalarSize(output.varType.getBasicType());
    			intBaseType = vecSize > 1 ? gluShaderUtil.getDataTypeVector(gluShaderUtil.DataType.INT, vecSize) : gluShaderUtil.DataType.INT;

    			src += ('\to_' + output.name + ' = ' + gluShaderUtil.getDataTypeName(intBaseType) + '(' + output.name + ');\n');
    		}
    	}

    	src += "}\n";

    	return src;
    };

// static std::string generateGeometryShader (const ShaderSpec& shaderSpec)
// {
// 	DE_ASSERT(glu::glslVersionUsesInOutQualifiers(shaderSpec.version));
//
// 	std::ostringstream	src;
//
// 	src << glu::getGLSLVersionDeclaration(shaderSpec.version) << "\n";
//
// 	if (glu::glslVersionIsES(shaderSpec.version) && shaderSpec.version <= glu::GLSL_VERSION_310_ES)
// 		src << "#extension gl.EXT_geometry_shader : require\n";
//
// 	if (!shaderSpec.globalDeclarations.empty())
// 		src << shaderSpec.globalDeclarations << "\n";
//
// 	src << "layout(points) in;\n"
// 		<< "layout(points, max_vertices = 1) out;\n";
//
// 	for (vector<Symbol>::const_iterator input = shaderSpec.inputs.begin(); input != shaderSpec.inputs.end(); ++input)
// 		src << "flat in " << gluVarType.declareVariable(input.varType, "geom_" + input.name) << "[];\n";
//
// 	for (vector<Symbol>::const_iterator output = shaderSpec.outputs.begin(); output != shaderSpec.outputs.end(); ++output)
// 	{
// 		DE_ASSERT(output.varType.isBasicType());
//
// 		if (gluShaderUtil.isDataTypeBoolOrBVec(output.varType.getBasicType()))
// 		{
// 			/** @type{number} */ var				vecSize		= gluShaderUtil.getDataTypeScalarSize(output.varType.getBasicType());
// 			/** @type{gluShaderUtil.DataType} */ var 	intBaseType	= vecSize > 1 ? gluShaderUtil.getDataTypeVector(gluShaderUtil.DataType.INT, vecSize) : gluShaderUtil.DataType.INT;
// 			/** @type{gluVarType.VarType} */ var 	intType		(intBaseType, gluShaderUtil.precision.PRECISION_HIGHP);
//
// 			src << "flat out " << gluVarType.declareVariable(intType, "o_" + output.name) << ";\n";
// 		}
// 		else
// 			src << "flat out " << gluVarType.declareVariable(output.varType, output.name) << ";\n";
// 	}
//
// 	src << "\n"
// 		<< "void main (void)\n"
// 		<< "{\n"
// 		<< "	gl_Position = gl.in[0].gl_Position;\n\n";
//
// 	// Fetch input variables
// 	for (vector<Symbol>::const_iterator input = shaderSpec.inputs.begin(); input != shaderSpec.inputs.end(); ++input)
// 		src << "\t" << gluVarType.declareVariable(input.varType, input.name) << " = geom_" << input.name << "[0];\n";
//
// 	// Declare necessary output variables (bools).
// 	for (vector<Symbol>::const_iterator output = shaderSpec.outputs.begin(); output != shaderSpec.outputs.end(); ++output)
// 	{
// 		if (gluShaderUtil.isDataTypeBoolOrBVec(output.varType.getBasicType()))
// 			src << "\t" << gluVarType.declareVariable(output.varType, output.name) << ";\n";
// 	}
//
// 	src << "\n";
//
// 	// Operation - indented to correct level.
// 	{
// 		std::istringstream	opSrc	(shaderSpec.source);
// 		std::string			line;
//
// 		while (std::getline(opSrc, line))
// 			src << "\t" << line << "\n";
// 	}
//
// 	// Assignments to outputs.
// 	for (vector<Symbol>::const_iterator output = shaderSpec.outputs.begin(); output != shaderSpec.outputs.end(); ++output)
// 	{
// 		if (gluShaderUtil.isDataTypeBoolOrBVec(output.varType.getBasicType()))
// 		{
// 			/** @type{number} */ var				vecSize		= gluShaderUtil.getDataTypeScalarSize(output.varType.getBasicType());
// 			/** @type{gluShaderUtil.DataType} */ var 	intBaseType	= vecSize > 1 ? gluShaderUtil.getDataTypeVector(gluShaderUtil.DataType.INT, vecSize) : gluShaderUtil.DataType.INT;
//
// 			src << "\to_" << output.name << " = " << gluShaderUtil.getDataTypeName(intBaseType) << "(" << output.name << ");\n";
// 		}
// 	}
//
// 	src << "	EmitVertex();\n"
// 		<< "	EndPrimitive();\n"
// 		<< "}\n";
//
// 	return src.str();
// }

    /**
     * @return{string}
     */
    glsShaderExecUtil.generateEmptyFragmentSource = function (/*glu::GLSLVersion version*/) {
    	/** @type{boolean} */ var customOut = true; //glu::glslVersionUsesInOutQualifiers(version);
    	/** @type{string} */ var src;

    	src = '#version 300 es\n';

    	// \todo [2013-08-05 pyry] Do we need one dummy output?

    	src += 'void main (void)\n{\n';
    	if (!customOut)
    		src += '	gl.FragColor = vec4(0.0);\n';
    	src += '}\n';

    	return src;
    };

    /**
     * @param{glsShaderExecUtil.ShaderSpec} shaderSpec
     * @param{string} inputPrefix
     * @param{string} outputPrefix
     * @return{string}
     */
    glsShaderExecUtil.generatePassthroughVertexShader = function (shaderSpec, inputPrefix, outputPrefix) {
    	// flat qualifier is not present in earlier versions?
    	// DE_ASSERT(glu::glslVersionUsesInOutQualifiers(shaderSpec.version));

    	/** @type{string} */ var src;

    	src ="#version 300 es\n"
    		+ "in highp vec4 a_position;\n";

    	for (var i = 0; i < shaderSpec.inputs.length; i++) {
    		src += ('in ' + gluVarType.declareVariable(shaderSpec.inputs[i].varType, inputPrefix + shaderSpec.inputs[i].name) + ';\n'
    			+ 'flat out ' + gluVarType.declareVariable(shaderSpec.inputs[i].varType, outputPrefix + shaderSpec.inputs[i].name) + ';\n');
    	}

    	src += '\nvoid main (void)\n{\n'
    		+ '	gl_Position = a_position;\n'
    		+ '	gl_PointSize = 1.0;\n';

    	for (var i = 0; i <  shaderSpec.inputs.length; i++)
    		src += ('\t' + outputPrefix + shaderSpec.inputs[i].name + ' = ' + inputPrefix + shaderSpec.inputs[i].name + ';\n');

    	src += '}\n';

    	return src;
    };

    /**
     * @param{glsShaderExecUtil.ShaderSpec} shaderSpec
     * @param{boolean} useIntOutputs
     * @param{*} outLocationMap
     * @return{string}
     */
    glsShaderExecUtil.generateFragmentShader = function(shaderSpec, useIntOutputs, outLocationMap) {
    	// DE_ASSERT(glu::glslVersionUsesInOutQualifiers(shaderSpec.version));

    	/** @type{string} */ var src;
    	src = "#version 300 es\n";

    	if (!shaderSpec.globalDeclarations.length > 0)
    		src += (shaderSpec.globalDeclarations + '\n');

    	for (var i = 0; i < shaderSpec.inputs.length; i++)
        	src += ('flat in ' + gluVarType.declareVariable(shaderSpec.inputs[i].varType, shaderSpec.inputs[i].name) + ';\n');

    	for (var outNdx = 0; outNdx < shaderSpec.outputs.length; ++outNdx) {
    		/** @type{glsShaderExecUtil.Symbol} */ var output = shaderSpec.outputs[outNdx];
    		/** @type{number} */ var location = outLocationMap[output.name];
    		/** @type{string} */ var outVarName	= 'o_' + output.name;
    		/** @type {gluVarType.VariableDeclaration} */ var	decl	= new gluVarType.VariableDeclaration(output.varType, outVarName, gluVarType.Storage.STORAGE_OUT, undefined, new gluVarType.Layout(location));

    		DE_ASSERT(output.varType.isBasicType());

    		if (useIntOutputs && gluShaderUtil.isDataTypeFloatOrVec(output.varType.getBasicType()))	{
    			/** @type{number} */ var vecSize = gluShaderUtil.getDataTypeScalarSize(output.varType.getBasicType());
    			/** @type{gluShaderUtil.DataType} */ var uintBasicType	= vecSize > 1 ? gluShaderUtil.getDataTypeVector(gluShaderUtil.DataType.UINT,vecSize) : gluShaderUtil.DataType.UINT;
    			/** @type{gluVarType.VarType} */ var uintType = gluVarType.newTypeBasic(uintBasicType, gluShaderUtil.precision.PRECISION_HIGHP);

    			decl.varType = uintType;
    			src += (decl + ';\n');
    		} else if (gluShaderUtil.isDataTypeBoolOrBVec(output.varType.getBasicType())) {
    			/** @type{number} */ var vecSize = gluShaderUtil.getDataTypeScalarSize(output.varType.getBasicType());
    			/** @type{gluShaderUtil.DataType} */ var intBasicType = vecSize > 1 ? gluShaderUtil.getDataTypeVector(gluShaderUtil.DataType.INT, vecSize) : gluShaderUtil.DataType.INT;
    			/** @type{gluVarType.VarType} */ var intType = gluVarType.newTypeBasic(intBasicType, gluShaderUtil.precision.PRECISION_HIGHP);

    			decl.varType = intType;
    			src += (decl + ';\n');
    		} else if (gluShaderUtil.isDataTypeMatrix(output.varType.getBasicType())) {
    			/** @type{number} */ var vecSize = gluShaderUtil.getDataTypeMatrixNumRows(output.varType.getBasicType());
    			/** @type{number} */ var numVecs = gluShaderUtil.getDataTypeMatrixNumColumns(output.varType.getBasicType());
    			/** @type{gluShaderUtil.DataType} */ var uintBasicType	= gluShaderUtil.getDataTypeVector(gluShaderUtil.DataType.UINT,vecSize);
    			/** @type{gluVarType.VarType} */ var uintType = gluVarType.newTypeBasic(uintBasicType, gluShaderUtil.precision.PRECISION_HIGHP);

    			decl.varType = uintType;
    			for (var vecNdx = 0; vecNdx < numVecs; ++vecNdx) {
    				decl.name				= outVarName + "_" + (vecNdx);
    				decl.layout.location	= location + vecNdx;
    				src += (decl + ';\n');
    			}
    		}
    		else
    			src += '';//glu::VariableDeclaration(output.varType, output.name, glu::STORAGE_OUT, glu::INTERPOLATION_LAST, location) << ";\n";
    	}

    	src += '\nvoid main (void)\n{\n';

    	for (var i = 0; i < shaderSpec.outputs.length; i++)	{
    		if ((useIntOutputs && gluShaderUtil.isDataTypeFloatOrVec(shaderSpec.outputs[i].varType.getBasicType())) ||
    			gluShaderUtil.isDataTypeBoolOrBVec(shaderSpec.outputs[i].varType.getBasicType()) ||
    			gluShaderUtil.isDataTypeMatrix(shaderSpec.outputs[i].varType.getBasicType()))
    			src += ('\t' + gluVarType.declareVariable(shaderSpec.outputs[i].varType, shaderSpec.outputs[i].name) + ';\n');
    	}

    	// Operation - indented to correct level.
    	// {
    	// 	std::istringstream	opSrc	(shaderSpec.source);
    	// 	/** @type{number} */ var line;
        //
    	// 	while (std::getline(opSrc, line))
    	// 		src += ('\t' << line << '\n');
    	// }

    	for (var i = 0; i < shaderSpec.outputs.length; i++) {
    		if (useIntOutputs && gluShaderUtil.isDataTypeFloatOrVec(shaderSpec.outputs[i].varType.getBasicType()))
    			src += ('	o_' + shaderSpec.outputs[i].name + ' = floatBitsToUint(' + shaderSpec.outputs[i].name + ');\n');
    		else if (gluShaderUtil.isDataTypeMatrix(shaderSpec.outputs[i].varType.getBasicType())) {
    			/** @type{number} */ var numVecs = gluShaderUtil.getDataTypeMatrixNumColumns(shaderSpec.outputs[i].varType.getBasicType());

    			for (var vecNdx = 0; vecNdx < numVecs; ++vecNdx)
    				if (useIntOutputs)
    					src += ('\to_' + shaderSpec.outputs[i].name + '_' + vecNdx + ' = floatBitsToUint(' + shaderSpec.outputs[i].name + '[' + vecNdx + ']);\n');
    				else
    					src += ('\to_' + shaderSpec.outputs[i].name + '_' + vecNdx + ' = ' + shaderSpec.outputs[i].name + '[' + vecNdx + '];\n');
    		} else if (gluShaderUtil.isDataTypeBoolOrBVec(shaderSpec.outputs[i].varType.getBasicType())) {
    			/** @type{number} */ var vecSize = gluShaderUtil.getDataTypeScalarSize(shaderSpec.outputs[i].varType.getBasicType());
    			/** @type{gluShaderUtil.DataType} */ var intBaseType = vecSize > 1 ? gluShaderUtil.getDataTypeVector(gluShaderUtil.DataType.INT, vecSize) : gluShaderUtil.DataType.INT;

    			src += ('\to_' + shaderSpec.outputs[i].name + ' = ' + gluShaderUtil.getDataTypeName(intBaseType) + '(' + shaderSpec.outputs[i].name + ');\n');
    		}
    	}

    	src += '}\n';

    	return src;
    };

    /**
     * @param {Array<string>} array
     * @return {gluShaderProgram.TransformFeedbackVaryings}
     */
    glsShaderExecUtil.getTFVaryings = function(outputs) {
        return new gluShaderProgram.TransformFeedbackVaryings(outputs);
    };

    // VertexProcessorExecutor (base class for vertex and geometry executors)


    /**
     * @constructor
     * @extends{glsShaderExecUtil.ShaderExecutor}
     * @param{glsShaderExecUtil.ShaderSpec} shaderSpec
     * @param{gluShaderProgram.ProgramSources} sources
     */
    glsShaderExecUtil.VertexProcessorExecutor = function(shaderSpec, sources) {
        sources.add(glsShaderExecUtil.getTFVaryings(shaderSpec.outputs));
        sources.add(new gluShaderProgram.TransformFeedbackMode(gl.INTERLEAVED_ATTRIBS));
        glsShaderExecUtil.ShaderExecutor.call(this, shaderSpec);
        this.m_program = new gluShaderProgram.ShaderProgram(gl, sources);
    };

    setParentClass(glsShaderExecUtil.VertexProcessorExecutor, glsShaderExecUtil.ShaderExecutor);

    /**
     * @return{boolean}
     */
    glsShaderExecUtil.VertexProcessorExecutor.prototype.isOk = function() {
        return this.m_program.isOk();
    };

    /**
     * @return{WebGLProgram}
     */
    glsShaderExecUtil.VertexProcessorExecutor.prototype.getProgram = function() {
        return this.m_program.getProgram();
    };


/*
template<typename Iterator>
struct SymbolNameIterator
{
	Iterator symbolIter;

	SymbolNameIterator (Iterator symbolIter_) : symbolIter(symbolIter_) {}

	inline SymbolNameIterator&	operator++	(void)								{ ++symbolIter; return *this;				}

	inline bool					operator==	(const SymbolNameIterator& other)	{ return symbolIter == other.symbolIter;	}
	inline bool					operator!=	(const SymbolNameIterator& other)	{ return symbolIter != other.symbolIter;	}

	inline std::string operator* (void) const
	{
		if (gluShaderUtil.isDataTypeBoolOrBVec(symbolIter.varType.getBasicType()))
			return "o_" + symbolIter.name;
		else
			return symbolIter.name;
	}
};

template<typename Iterator>
inline glu::TransformFeedbackVaryings<SymbolNameIterator<Iterator> > getTFVaryings (Iterator begin, Iterator end)
{
	return glu::TransformFeedbackVaryings<SymbolNameIterator<Iterator> >(SymbolNameIterator<Iterator>(begin), SymbolNameIterator<Iterator>(end));
}

VertexProcessorExecutor::VertexProcessorExecutor (const glu::RenderContext& renderCtx, const ShaderSpec& shaderSpec, const glu::ProgramSources& sources)
	: ShaderExecutor	(renderCtx, shaderSpec)
	, m_program			(renderCtx,
						 glu::ProgramSources(sources) << getTFVaryings(shaderSpec.outputs.begin(), shaderSpec.outputs.end())
													  << glu::TransformFeedbackMode(gl.INTERLEAVED_ATTRIBS))
{
}

*/


    /**
     * @param{Array<*>} arr
     * @return {number}
     */
    glsShaderExecUtil.computeTotalScalarSize = function(arr) {
    	/** @type{number} */ var size = 0;
    	for (var i = 0; i < arr.length; i++)
    		size += arr[i].varType.getScalarSize();
    	return size;
    };

    /**
     * template<typename Iterator>
     * @param{number} numValues
     * @param{Array<number>} inputs
     * @return{Array<goog.NumberArray>} outputs
     */
    glsShaderExecUtil.VertexProcessorExecutor.prototype.execute = function(numValues, inputs) {
      var outputs = [];
    	// const glw::Functions&					gl					= m_renderCtx.getFunctions();
    	/** @type{boolean} */ var useTFObject			= true; //isContextTypeES(m_renderCtx.getType()) || (isContextTypeGLCore(m_renderCtx.getType()) && m_renderCtx.getType().getMajorVersion() >= 4);
    	/** @type{Array<gluDrawUtil.VertexArrayBinding>} */ var vertexArrays = [];
    	var transformFeedback = gl.createTransformFeedback();
    	var outputBuffer = gl.createBuffer();

    	/** @type{number} */ var outputBufferStride = glsShaderExecUtil.computeTotalScalarSize(this.m_outputs)*4;

    	// Setup inputs.
    	for (var inputNdx = 0; inputNdx < this.m_inputs.length; inputNdx++) {
    		/** @type{glsShaderExecUtil.Symbol} */ var		symbol		= this.m_inputs[inputNdx];
    		/*const void* */var ptr = inputs[inputNdx];
    		/** @type{gluShaderUtil.DataType} */ var basicType	= symbol.varType.getBasicType();
    		/** @type{number} */ var vecSize = gluShaderUtil.getDataTypeScalarSize(basicType);

    		if (gluShaderUtil.isDataTypeFloatOrVec(basicType))
                vertexArrays.push(gluDrawUtil.newFloatVertexArrayBinding(symbol.name, vecSize, numValues, 0, ptr))
    		else if (gluShaderUtil.isDataTypeIntOrIVec(basicType))
    			vertexArrays.push(0);//glu::va::Int32(symbol.name, vecSize, numValues, 0, (const deInt32*)ptr));
    		else if (gluShaderUtil.isDataTypeUintOrUVec(basicType))
    			vertexArrays.push(0);//glu::va::Uint32(symbol.name, vecSize, numValues, 0, (const deUint32*)ptr));
    		else if (gluShaderUtil.isDataTypeMatrix(basicType))	{
    			/** @type{number} */ var numRows	= gluShaderUtil.getDataTypeMatrixNumRows(basicType);
    			/** @type{number} */ var numCols	= gluShaderUtil.getDataTypeMatrixNumColumns(basicType);
    			/** @type{number} */ var stride	= numRows * numCols * 4;//sizeof(float);

    			for (var colNdx = 0; colNdx < numCols; ++colNdx)
    				vertexArrays.push(0);//glu::va::Float(symbol.name, colNdx, numRows, numValues, stride, ((const float*)ptr) + colNdx * numRows));
    		}
    		else
    			DE_ASSERT(false);
    	}

    	// Setup TF outputs.
    	if (useTFObject)
    		gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, transformFeedback);
    	gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, outputBuffer);
        // TODO: Usage should be STREAM_READ but Chrome fails
    	//gl.bufferData(gl.TRANSFORM_FEEDBACK_BUFFER, outputBufferStride*numValues, gl.STREAM_READ);
        gl.bufferData(gl.TRANSFORM_FEEDBACK_BUFFER, outputBufferStride*numValues, gl.STREAM_DRAW);
    	gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, outputBuffer);

    	// Draw with rasterization disabled.
    	gl.beginTransformFeedback(gl.POINTS);
    	gl.enable(gl.RASTERIZER_DISCARD);
    	gluDrawUtil.draw(gl, this.m_program.getProgram(), vertexArrays, 
    			  new gluDrawUtil.PrimitiveList(gluDrawUtil.primitiveType.POINTS, numValues));
    	gl.disable(gl.RASTERIZER_DISCARD);
    	gl.endTransformFeedback();

    	// Read back data.
        var result = new ArrayBuffer(outputBufferStride*numValues);
        gl.getBufferSubData(gl.TRANSFORM_FEEDBACK_BUFFER, 0, result);
		  // const void*	srcPtr		= gl.mapBufferRange(gl.TRANSFORM_FEEDBACK_BUFFER, 0, outputBufferStride*numValues, gl.MAP_READ_BIT);
		  /** @type{number} */ var curOffset	= 0; // Offset in buffer in bytes.


  		for (var outputNdx = 0; outputNdx < this.m_outputs.length; outputNdx++) {
  			/** @type{glsShaderExecUtil.Symbol} */ var		symbol		= this.m_outputs[outputNdx];
  			/** @type{number} */ var scalarSize	= symbol.varType.getScalarSize();
              /*void* */var               dstPtr      = new Uint8Array(scalarSize * numValues * 4);

  		  for (var ndx = 0; ndx < numValues; ndx++) {
            for (var j = 0; j < scalarSize*4; j++) {
                dstPtr[scalarSize*ndx + j] = result[curOffset + ndx*outputBufferStride + j];
            }
        }
        outputs[outputNdx] = dstPtr;

  			curOffset += scalarSize*4;
  		}

    	if (useTFObject)
    		gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
    	gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, null);

      return outputs;
    };

// VertexShaderExecutor

/**
 * @constructor
 * @extends{glsShaderExecUtil.VertexProcessorExecutor}
 * @param{glsShaderExecUtil.ShaderSpec} shaderSpec
 */
glsShaderExecUtil.VertexShaderExecutor = function(shaderSpec) {
    var sources = gluShaderProgram.makeVtxFragSources(glsShaderExecUtil.generateVertexShader(shaderSpec),
                    glsShaderExecUtil.generateEmptyFragmentSource(shaderSpec.version));
    glsShaderExecUtil.VertexProcessorExecutor.call(this, shaderSpec, sources);
};

setParentClass(glsShaderExecUtil.VertexShaderExecutor, glsShaderExecUtil.VertexProcessorExecutor);

/**
 * @constructor
 * @extends{glsShaderExecUtil.ShaderExecutor}
 * @param{glsShaderExecUtil.ShaderSpec} shaderSpec
 */
glsShaderExecUtil.FragmentShaderExecutor = function(shaderSpec) {
    glsShaderExecUtil.ShaderExecutor.call(this, shaderSpec);
    /** @type {Array<glsShaderExecUtil.Symbol>} */ this.m_outLocationSymbols = [];
    this.m_outLocationMap = glsShaderExecUtil.generateLocationMap(this.m_outputs, this.m_outLocationSymbols);
    var sources = gluShaderProgram.makeVtxFragSources(glsShaderExecUtil.generatePassthroughVertexShader(shaderSpec, "a_", ""),
      glsShaderExecUtil.generateFragmentShader(shaderSpec, true, this.m_outLocationMap));
    this.m_program = new gluShaderProgram.ShaderProgram(gl, sources);
};

setParentClass(glsShaderExecUtil.FragmentShaderExecutor, glsShaderExecUtil.ShaderExecutor);

/**
 * @return{boolean}
 */
glsShaderExecUtil.FragmentShaderExecutor.prototype.isOk = function() {
    return this.m_program.isOk();
};

/**
 * @return{WebGLProgram}
 */
glsShaderExecUtil.FragmentShaderExecutor.prototype.getProgram = function() {
    return this.m_program.getProgram();
};

/**
 * @param {gluVarType.VarType} outputType
 * @param {boolean} useIntOutputs
 * @return {tcuTexture.TextureFormat}
 */
glsShaderExecUtil.getRenderbufferFormatForOutput = function(outputType, useIntOutputs)
{
  var channelOrderMap = [
    tcuTexture.ChannelOrder.R,
    tcuTexture.ChannelOrder.RG,
    tcuTexture.ChannelOrder.RGBA, // No RGB variants available.
    tcuTexture.ChannelOrder.RGBA
  ];

  var basicType   = outputType.getBasicType();
  var numComps    = gluShaderUtil.getDataTypeNumComponents(basicType);
  var channelType;

  switch (gluShaderUtil.getDataTypeScalarType(basicType))
  {
    case 'uint':  channelType = tcuTexture.ChannelType.UNSIGNED_INT32;                       break;
    case 'int':   channelType = tcuTexture.ChannelType.SIGNED_INT32;                         break;
    case 'bool':  channelType = tcuTexture.ChannelType.SIGNED_INT32;                         break;
    case 'float': channelType = useIntOutputs ? tcuTexture.ChannelType.UNSIGNED_INT32 :  tcuTexture.ChannelType.FLOAT; break;
    default:
      throw new Error("Invalid output type " + gluShaderUtil.getDataTypeScalarType(basicType));
  }

  return new tcuTexture.TextureFormat(channelOrderMap[numComps-1], channelType);
};

/**
 * template<typename Iterator>
 * @param{number} numValues
 * @param{Array<number>} inputs
 * @return{Array<goog.NumberArray>} outputs
 */
glsShaderExecUtil.FragmentShaderExecutor.prototype.execute = function(numValues, inputs) {
 /** @type {boolean} */ var useIntOutputs   = true;
 var outputs = [];
 /** @type{number} */ var            maxRenderbufferSize = /** @type {number} */ (gl.getParameter(gl.MAX_RENDERBUFFER_SIZE));
 /** @type{number} */ var            framebufferW    = Math.min(maxRenderbufferSize, numValues);
 /** @type{number} */ var            framebufferH    = Math.ceil(numValues / framebufferW);

 var framebuffer = gl.createFramebuffer();
 var renderbuffers = [];
 for (var i = 0 ; i < this.m_outLocationSymbols.length; i++)
    renderbuffers.push(gl.createRenderbuffer());

 var vertexArrays = [];
 var positions = [];

 if (framebufferH > maxRenderbufferSize)
   throw new Error("Value count is too high for maximum supported renderbuffer size");

 // Compute positions - 1px points are used to drive fragment shading.
 for (var valNdx = 0; valNdx < numValues; valNdx++) {
   /** @type{number} */ var    ix    = valNdx % framebufferW;
   /** @type{number} */ var    iy    = Math.floor(valNdx / framebufferW);
   var fx    = -1 + 2*(ix + 0.5) / framebufferW;
   var fy    = -1 + 2*(iy + 0.5) / framebufferH;

   positions[2 * valNdx] = fx;
   positions[2 * valNdx + 1] = fy;
 }

 // Vertex inputs.
 vertexArrays.push(gluDrawUtil.newFloatVertexArrayBinding("a_position", 2, numValues, 0, positions));

 for (var inputNdx = 0; inputNdx < this.m_inputs.length; inputNdx++)
 {
   /** @type{glsShaderExecUtil.Symbol} */ var    symbol    = this.m_inputs[inputNdx];
   var attribName  = "a_" + symbol.name;
   var ptr     = inputs[inputNdx];
   /** @type{gluShaderUtil.DataType} */ var basicType  = symbol.varType.getBasicType();
   /** @type{number} */ var      vecSize   = gluShaderUtil.getDataTypeScalarSize(basicType);

   if (gluShaderUtil.isDataTypeFloatOrVec(basicType))
     vertexArrays.push(gluDrawUtil.newFloatVertexArrayBinding(attribName, vecSize, numValues, 0, ptr));
   //TODO: Add other types
   // else if (gluShaderUtil.isDataTypeIntOrIVec(basicType))
   //   vertexArrays.push(glu::va::Int32(attribName, vecSize, numValues, 0, (const deInt32*)ptr));
   // else if (gluShaderUtil.isDataTypeUintOrUVec(basicType))
   //   vertexArrays.push(glu::va::Uint32(attribName, vecSize, numValues, 0, (const deUint32*)ptr));
   // else if (gluShaderUtil.isDataTypeMatrix(basicType))
   // {
   //   int   numRows = gluShaderUtil.getDataTypeMatrixNumRows(basicType);
   //   int   numCols = gluShaderUtil.getDataTypeMatrixNumColumns(basicType);
   //   int   stride  = numRows * numCols * sizeof(float);

   //   for (int colNdx = 0; colNdx < numCols; ++colNdx)
   //     vertexArrays.push(glu::va::Float(attribName, colNdx, numRows, numValues, stride, ((const float*)ptr) + colNdx * numRows));
   // }
   else
     DE_ASSERT(false);
 }

 // Construct framebuffer.
 gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

 for (var outNdx = 0; outNdx < this.m_outLocationSymbols.length; ++outNdx)
 {
   /** @type{glsShaderExecUtil.Symbol} */ var  output      = this.m_outLocationSymbols[outNdx];
   var  renderbuffer  = renderbuffers[outNdx];
   var  format      = gluTextureUtil.getInternalFormat(glsShaderExecUtil.getRenderbufferFormatForOutput(output.varType, useIntOutputs));

   gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
   gl.renderbufferStorage(gl.RENDERBUFFER, format, framebufferW, framebufferH);
   gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0+outNdx, gl.RENDERBUFFER, renderbuffer);
 }
 gl.bindRenderbuffer(gl.RENDERBUFFER, null);
 assertMsgOptions(gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE, 'Framebuffer is incomplete', false, true);

 var drawBuffers = [];
 for (var ndx = 0; ndx < this.m_outLocationSymbols.length; ndx++)
   drawBuffers[ndx] = gl.COLOR_ATTACHMENT0+ndx;
 gl.drawBuffers(drawBuffers);

 // Render
 gl.viewport(0, 0, framebufferW, framebufferH);
  gluDrawUtil.draw(gl, this.m_program.getProgram(), vertexArrays, 
        new gluDrawUtil.PrimitiveList(gluDrawUtil.primitiveType.POINTS, numValues));

 // Read back pixels.

   // \todo [2013-08-07 pyry] Some fast-paths could be added here.

   for (var outNdx = 0; outNdx < this.m_outputs.length; ++outNdx)
   {
     /** @type{glsShaderExecUtil.Symbol} */ var        output      = this.m_outputs[outNdx];
     /** @type{number} */ var          outSize     = output.varType.getScalarSize();
     /** @type{number} */ var          outVecSize    = gluShaderUtil.getDataTypeNumComponents(output.varType.getBasicType());
     /** @type{number} */ var          outNumLocs    = gluShaderUtil.getDataTypeNumLocations(output.varType.getBasicType());
     var format      = glsShaderExecUtil.getRenderbufferFormatForOutput(output.varType, useIntOutputs);
     var readFormat  = new tcuTexture.TextureFormat(tcuTexture.ChannelOrder.RGBA, format.type);
     var transferFormat = gluTextureUtil.getTransferFormat(readFormat);
     /** @type{number} */ var          outLocation   =this.m_outLocationMap[output.name];
     var  tmpBuf = new tcuTexture.TextureLevel(readFormat, framebufferW, framebufferH);

     for (var locNdx = 0; locNdx < outNumLocs; ++locNdx)
     {
       gl.readBuffer(gl.COLOR_ATTACHMENT0 + outLocation + locNdx);
       gl.readPixels(0, 0, framebufferW, framebufferH, transferFormat.format, transferFormat.dataType, tmpBuf.getAccess().getDataPtr());

       if (outSize == 4 && outNumLocs == 1)
         outputs[outNdx] = new Uint8Array(tmpBuf.getAccess().getBuffer());
       else
       {
         outputs[outNdx] = new Uint8Array(numValues*outVecSize*4);
         var srcPtr = new Uint8Array(tmpBuf.getAccess().getBuffer());
         for (var valNdx = 0; valNdx < numValues; valNdx++)
         {
           var srcOffset =  valNdx*4;
           var dstOffset = outSize*valNdx + outVecSize*locNdx;
           for (var j = 0; j < outVecSize*4; j++)
            outputs[outNdx][dstOffset + j] = srcPtr[srcOffset + j];
         }
       }
     }
   }
 

 // \todo [2013-08-07 pyry] Clear draw buffers & viewport?
 gl.bindFramebuffer(gl.FRAMEBUFFER, null);
 return outputs;
};



glsShaderExecUtil.generateLocationMap = function(symbols, locationSymbols) {
  var ret = [];
  locationSymbols.length = 0;
  var location = 0;

  for (var i = 0; i < symbols.length; i++) {
    var symbol = symbols[i];
    var numLocations = gluShaderUtil.getDataTypeNumLocations(symbol.varType.getBasicType());
    ret[symbol.name] = location;
    location += numLocations;

    for (var ndx = 0; ndx < numLocations; ++ndx)
      locationSymbols.push(symbol);
  }

  return ret;
};

//
// inline int queryInt (const glw::Functions& gl, deUint32 pname)
// {
// 	int value = 0;
// 	gl.getIntegerv(pname, &value);
// 	return value;
// }
//
//
// // Shared utilities for compute and tess executors
//
// static deUint32 getVecStd430ByteAlignment (glu::DataType type)
// {
// 	switch (gluShaderUtil.getDataTypeScalarSize(type))
// 	{
// 		case 1:		return 4u;
// 		case 2:		return 8u;
// 		case 3:		return 16u;
// 		case 4:		return 16u;
// 		default:
// 			DE_ASSERT(false);
// 			return 0u;
// 	}
// }
// TODO port this END

// class BufferIoExecutor : public ShaderExecutor
// {
// public:
// 						BufferIoExecutor	(const glu::RenderContext& renderCtx, const ShaderSpec& shaderSpec, const glu::ProgramSources& sources);
// 						~BufferIoExecutor	(void);
//
// 	bool				isOk				(void) const				{ return m_program.isOk();			}
// 	void				log					(tcu::TestLog& dst) const	{ dst << m_program;					}
// 	deUint32			getProgram			(void) const				{ return m_program.getProgram();	}
//
// protected:
// 	enum
// 	{
// 		INPUT_BUFFER_BINDING	= 0,
// 		OUTPUT_BUFFER_BINDING	= 1,
// 	};
//
// 	void				initBuffers			(int numValues);
// 	deUint32			getInputBuffer		(void) const		{ return *m_inputBuffer;					}
// 	deUint32			getOutputBuffer		(void) const		{ return *m_outputBuffer;					}
// 	deUint32			getInputStride		(void) const		{ return getLayoutStride(m_inputLayout);	}
// 	deUint32			getOutputStride		(void) const		{ return getLayoutStride(m_outputLayout);	}
//
// 	void				uploadInputBuffer	(const void* const* inputPtrs, int numValues);
// 	void				readOutputBuffer	(void* const* outputPtrs, int numValues);
//
// 	static void			declareBufferBlocks	(std::ostream& src, const ShaderSpec& spec);
// 	static void			generateExecBufferIo(std::ostream& src, const ShaderSpec& spec, const char* invocationNdxName);
//
// 	glu::ShaderProgram	m_program;
//
// private:
// 	struct VarLayout
// 	{
// 		deUint32		offset;
// 		deUint32		stride;
// 		deUint32		matrixStride;
//
// 		VarLayout (void) : offset(0), stride(0), matrixStride(0) {}
// 	};
//
// 	void				resizeInputBuffer	(int newSize);
// 	void				resizeOutputBuffer	(int newSize);
//
// 	static void			computeVarLayout	(const std::vector<Symbol>& symbols, std::vector<VarLayout>* layout);
// 	static deUint32		getLayoutStride		(const vector<VarLayout>& layout);
//
// 	static void			copyToBuffer		(const glu::VarType& varType, const VarLayout& layout, int numValues, const void* srcBasePtr, void* dstBasePtr);
// 	static void			copyFromBuffer		(const glu::VarType& varType, const VarLayout& layout, int numValues, const void* srcBasePtr, void* dstBasePtr);
//
// 	glu::Buffer			m_inputBuffer;
// 	glu::Buffer			m_outputBuffer;
//
// 	vector<VarLayout>	m_inputLayout;
// 	vector<VarLayout>	m_outputLayout;
// };
//
// BufferIoExecutor::BufferIoExecutor (const glu::RenderContext& renderCtx, const ShaderSpec& shaderSpec, const glu::ProgramSources& sources)
// 	: ShaderExecutor	(renderCtx, shaderSpec)
// 	, m_program			(renderCtx, sources)
// 	, m_inputBuffer		(renderCtx)
// 	, m_outputBuffer	(renderCtx)
// {
// 	computeVarLayout(m_inputs, &m_inputLayout);
// 	computeVarLayout(m_outputs, &m_outputLayout);
// }
//
// BufferIoExecutor::~BufferIoExecutor (void)
// {
// }
//
// void BufferIoExecutor::resizeInputBuffer (int newSize)
// {
// 	const glw::Functions& gl = m_renderCtx.getFunctions();
// 	gl.bindBuffer(gl.SHADER_STORAGE_BUFFER, *m_inputBuffer);
// 	gl.bufferData(gl.SHADER_STORAGE_BUFFER, newSize, DE_NULL, gl.STATIC_DRAW);
// 	GLU_EXPECT_NO_ERROR(gl.getError(), "Failed to allocate input buffer");
// }
//
// void BufferIoExecutor::resizeOutputBuffer (int newSize)
// {
// 	const glw::Functions& gl = m_renderCtx.getFunctions();
// 	gl.bindBuffer(gl.SHADER_STORAGE_BUFFER, *m_outputBuffer);
// 	gl.bufferData(gl.SHADER_STORAGE_BUFFER, newSize, DE_NULL, gl.STATIC_DRAW);
// 	GLU_EXPECT_NO_ERROR(gl.getError(), "Failed to allocate output buffer");
// }
//
// void BufferIoExecutor::initBuffers (int numValues)
// {
// 	const deUint32		inputStride			= getLayoutStride(m_inputLayout);
// 	const deUint32		outputStride		= getLayoutStride(m_outputLayout);
// 	/** @type{number} */ var			inputBufferSize		= numValues * inputStride;
// 	/** @type{number} */ var			outputBufferSize	= numValues * outputStride;
//
// 	resizeInputBuffer(inputBufferSize);
// 	resizeOutputBuffer(outputBufferSize);
// }
//
// void BufferIoExecutor::computeVarLayout (const std::vector<Symbol>& symbols, std::vector<VarLayout>* layout)
// {
// 	deUint32	maxAlignment	= 0;
// 	deUint32	curOffset		= 0;
//
// 	DE_ASSERT(layout.empty());
// 	layout.resize(symbols.size());
//
// 	for (size_t varNdx = 0; varNdx < symbols.size(); varNdx++)
// 	{
// 		/** @type{glsShaderExecUtil.Symbol} */ var		symbol		= symbols[varNdx];
// 		/** @type{gluShaderUtil.DataType} */ var basicType	= symbol.varType.getBasicType();
// 		VarLayout&			layoutEntry	= (*layout)[varNdx];
//
// 		if (glu::isDataTypeScalarOrVector(basicType))
// 		{
// 			const deUint32	alignment	= getVecStd430ByteAlignment(basicType);
// 			const deUint32	size		= (deUint32)gluShaderUtil.getDataTypeScalarSize(basicType)*4;
//
// 			curOffset		= (deUint32)deAlign32((int)curOffset, (int)alignment);
// 			maxAlignment	= de::max(maxAlignment, alignment);
//
// 			layoutEntry.offset			= curOffset;
// 			layoutEntry.matrixStride	= 0;
//
// 			curOffset += size;
// 		}
// 		else if (gluShaderUtil.isDataTypeMatrix(basicType))
// 		{
// 			/** @type{number} */ var				numVecs			= gluShaderUtil.getDataTypeMatrixNumColumns(basicType);
// 			/** @type{gluShaderUtil.DataType} */ var 	vecType			= glu::getDataTypeFloatVec(gluShaderUtil.getDataTypeMatrixNumRows(basicType));
// 			const deUint32			vecAlignment	= getVecStd430ByteAlignment(vecType);
//
// 			curOffset		= (deUint32)deAlign32((int)curOffset, (int)vecAlignment);
// 			maxAlignment	= de::max(maxAlignment, vecAlignment);
//
// 			layoutEntry.offset			= curOffset;
// 			layoutEntry.matrixStride	= vecAlignment;
//
// 			curOffset += vecAlignment*numVecs;
// 		}
// 		else
// 			DE_ASSERT(false);
// 	}
//
// 	{
// 		const deUint32	totalSize	= (deUint32)deAlign32(curOffset, maxAlignment);
//
// 		for (vector<VarLayout>::iterator varIter = layout.begin(); varIter != layout.end(); ++varIter)
// 			varIter.stride = totalSize;
// 	}
// }
//
// inline deUint32 BufferIoExecutor::getLayoutStride (const vector<VarLayout>& layout)
// {
// 	return layout.empty() ? 0 : layout[0].stride;
// }
//
// void BufferIoExecutor::copyToBuffer (const glu::VarType& varType, const VarLayout& layout, int numValues, const void* srcBasePtr, void* dstBasePtr)
// {
// 	if (varType.isBasicType())
// 	{
// 		/** @type{gluShaderUtil.DataType} */ var 	basicType		= varType.getBasicType();
// 		const bool				isMatrix		= gluShaderUtil.isDataTypeMatrix(basicType);
// 		/** @type{number} */ var				scalarSize		= gluShaderUtil.getDataTypeScalarSize(basicType);
// 		/** @type{number} */ var				numVecs			= isMatrix ? gluShaderUtil.getDataTypeMatrixNumColumns(basicType) : 1;
// 		/** @type{number} */ var				numComps		= scalarSize / numVecs;
//
// 		for (int elemNdx = 0; elemNdx < numValues; elemNdx++)
// 		{
// 			for (var vecNdx = 0; vecNdx < numVecs; vecNdx++)
// 			{
// 				/** @type{number} */ var		srcOffset		= 4*(elemNdx*scalarSize + vecNdx*numComps);
// 				/** @type{number} */ var		dstOffset		= layout.offset + layout.stride*elemNdx + (isMatrix ? layout.matrixStride*vecNdx : 0);
// 				const deUint8*	srcPtr			= (const deUint8*)srcBasePtr + srcOffset;
// 				deUint8*		dstPtr			= (deUint8*)dstBasePtr + dstOffset;
//
// 				deMemcpy(dstPtr, srcPtr, 4*numComps);
// 			}
// 		}
// 	}
// 	else
// 		throw tcu::InternalError("Unsupported type");
// }
//
// void BufferIoExecutor::copyFromBuffer (const glu::VarType& varType, const VarLayout& layout, int numValues, const void* srcBasePtr, void* dstBasePtr)
// {
// 	if (varType.isBasicType())
// 	{
// 		/** @type{gluShaderUtil.DataType} */ var 	basicType		= varType.getBasicType();
// 		const bool				isMatrix		= gluShaderUtil.isDataTypeMatrix(basicType);
// 		/** @type{number} */ var				scalarSize		= gluShaderUtil.getDataTypeScalarSize(basicType);
// 		/** @type{number} */ var				numVecs			= isMatrix ? gluShaderUtil.getDataTypeMatrixNumColumns(basicType) : 1;
// 		/** @type{number} */ var				numComps		= scalarSize / numVecs;
//
// 		for (int elemNdx = 0; elemNdx < numValues; elemNdx++)
// 		{
// 			for (var vecNdx = 0; vecNdx < numVecs; vecNdx++)
// 			{
// 				/** @type{number} */ var		srcOffset		= layout.offset + layout.stride*elemNdx + (isMatrix ? layout.matrixStride*vecNdx : 0);
// 				/** @type{number} */ var		dstOffset		= 4*(elemNdx*scalarSize + vecNdx*numComps);
// 				const deUint8*	srcPtr			= (const deUint8*)srcBasePtr + srcOffset;
// 				deUint8*		dstPtr			= (deUint8*)dstBasePtr + dstOffset;
//
// 				deMemcpy(dstPtr, srcPtr, 4*numComps);
// 			}
// 		}
// 	}
// 	else
// 		throw tcu::InternalError("Unsupported type");
// }
//
// void BufferIoExecutor::uploadInputBuffer (const void* const* inputPtrs, int numValues)
// {
// 	const glw::Functions&	gl				= m_renderCtx.getFunctions();
// 	const deUint32			buffer			= *m_inputBuffer;
// 	const deUint32			inputStride		= getLayoutStride(m_inputLayout);
// 	/** @type{number} */ var				inputBufferSize	= inputStride*numValues;
//
// 	if (inputBufferSize == 0)
// 		return; // No inputs
//
// 	gl.bindBuffer(gl.SHADER_STORAGE_BUFFER, buffer);
// 	void* mapPtr = gl.mapBufferRange(gl.SHADER_STORAGE_BUFFER, 0, inputBufferSize, gl.MAP_WRITE_BIT);
// 	GLU_EXPECT_NO_ERROR(gl.getError(), "glMapBufferRange()");
// 	TCU_CHECK(mapPtr);
//
// 	try
// 	{
// 		DE_ASSERT(m_inputs.size() == m_inputLayout.size());
// 		for (size_t inputNdx = 0; inputNdx < m_inputs.size(); ++inputNdx)
// 		{
// 			const glu::VarType&		varType		= m_inputs[inputNdx].varType;
// 			const VarLayout&		layout		= m_inputLayout[inputNdx];
//
// 			copyToBuffer(varType, layout, numValues, inputPtrs[inputNdx], mapPtr);
// 		}
// 	}
// 	catch (...)
// 	{
// 		gl.unmapBuffer(gl.SHADER_STORAGE_BUFFER);
// 		throw;
// 	}
//
// 	gl.unmapBuffer(gl.SHADER_STORAGE_BUFFER);
// 	GLU_EXPECT_NO_ERROR(gl.getError(), "glUnmapBuffer()");
// }
//
// void BufferIoExecutor::readOutputBuffer (void* const* outputPtrs, int numValues)
// {
// 	const glw::Functions&	gl					= m_renderCtx.getFunctions();
// 	const deUint32			buffer				= *m_outputBuffer;
// 	const deUint32			outputStride		= getLayoutStride(m_outputLayout);
// 	/** @type{number} */ var				outputBufferSize	= numValues*outputStride;
//
// 	DE_ASSERT(outputBufferSize > 0); // At least some outputs are required.
//
// 	gl.bindBuffer(gl.SHADER_STORAGE_BUFFER, buffer);
// 	void* mapPtr = gl.mapBufferRange(gl.SHADER_STORAGE_BUFFER, 0, outputBufferSize, gl.MAP_READ_BIT);
// 	GLU_EXPECT_NO_ERROR(gl.getError(), "glMapBufferRange()");
// 	TCU_CHECK(mapPtr);
//
// 	try
// 	{
// 		DE_ASSERT(m_outputs.size() == m_outputLayout.size());
// 		for (size_t outputNdx = 0; outputNdx < m_outputs.size(); ++outputNdx)
// 		{
// 			const glu::VarType&		varType		= m_outputs[outputNdx].varType;
// 			const VarLayout&		layout		= m_outputLayout[outputNdx];
//
// 			copyFromBuffer(varType, layout, numValues, mapPtr, outputPtrs[outputNdx]);
// 		}
// 	}
// 	catch (...)
// 	{
// 		gl.unmapBuffer(gl.SHADER_STORAGE_BUFFER);
// 		throw;
// 	}
//
// 	gl.unmapBuffer(gl.SHADER_STORAGE_BUFFER);
// 	GLU_EXPECT_NO_ERROR(gl.getError(), "glUnmapBuffer()");
// }
//
// void BufferIoExecutor::declareBufferBlocks (std::ostream& src, const ShaderSpec& spec)
// {
// 	// Input struct
// 	if (!spec.inputs.empty())
// 	{
// 		glu::StructType inputStruct("Inputs");
// 		for (vector<Symbol>::const_iterator symIter = spec.inputs.begin(); symIter != spec.inputs.end(); ++symIter)
// 			inputStruct.addMember(symIter.name.c_str(), symIter.varType);
// 		src << gluVarType.declareVariable(&inputStruct) << ";\n";
// 	}
//
// 	// Output struct
// 	{
// 		glu::StructType outputStruct("Outputs");
// 		for (vector<Symbol>::const_iterator symIter = spec.outputs.begin(); symIter != spec.outputs.end(); ++symIter)
// 			outputStruct.addMember(symIter.name.c_str(), symIter.varType);
// 		src << gluVarType.declareVariable(&outputStruct) << ";\n";
// 	}
//
// 	src << "\n";
//
// 	if (!spec.inputs.empty())
// 	{
// 		src	<< "layout(binding = " << int(INPUT_BUFFER_BINDING) << ", std430) buffer InBuffer\n"
// 			<< "{\n"
// 			<< "	Inputs inputs[];\n"
// 			<< "};\n";
// 	}
//
// 	src	<< "layout(binding = " << int(OUTPUT_BUFFER_BINDING) << ", std430) buffer OutBuffer\n"
// 		<< "{\n"
// 		<< "	Outputs outputs[];\n"
// 		<< "};\n"
// 		<< "\n";
// }
//
// void BufferIoExecutor::generateExecBufferIo (std::ostream& src, const ShaderSpec& spec, const char* invocationNdxName)
// {
// 	for (vector<Symbol>::const_iterator symIter = spec.inputs.begin(); symIter != spec.inputs.end(); ++symIter)
// 		src << "\t" << gluVarType.declareVariable(symIter.varType, symIter.name) << " = inputs[" << invocationNdxName << "]." << symIter.name << ";\n";
//
// 	for (vector<Symbol>::const_iterator symIter = spec.outputs.begin(); symIter != spec.outputs.end(); ++symIter)
// 		src << "\t" << gluVarType.declareVariable(symIter.varType, symIter.name) << ";\n";
//
// 	src << "\n";
//
// 	{
// 		std::istringstream	opSrc	(spec.source);
// 		std::string			line;
//
// 		while (std::getline(opSrc, line))
// 			src << "\t" << line << "\n";
// 	}
//
// 	src << "\n";
// 	for (vector<Symbol>::const_iterator symIter = spec.outputs.begin(); symIter != spec.outputs.end(); ++symIter)
// 		src << "\toutputs[" << invocationNdxName << "]." << symIter.name << " = " << symIter.name << ";\n";
// }
//
// // ComputeShaderExecutor
//
// class ComputeShaderExecutor : public BufferIoExecutor
// {
// public:
// 						ComputeShaderExecutor	(const glu::RenderContext& renderCtx, const ShaderSpec& shaderSpec);
// 						~ComputeShaderExecutor	(void);
//
// 	void				execute					(int numValues, const void* const* inputs, void* const* outputs);
//
// protected:
// 	static std::string	generateComputeShader	(const ShaderSpec& spec);
//
// 	tcu::IVec3			m_maxWorkSize;
// };
//
// std::string ComputeShaderExecutor::generateComputeShader (const ShaderSpec& spec)
// {
// 	std::ostringstream src;
//
// 	src << glu::getGLSLVersionDeclaration(spec.version) << "\n";
//
// 	if (!spec.globalDeclarations.empty())
// 		src << spec.globalDeclarations << "\n";
//
// 	src << "layout(local_size_x = 1) in;\n"
// 		<< "\n";
//
// 	declareBufferBlocks(src, spec);
//
// 	src << "void main (void)\n"
// 		<< "{\n"
// 		<< "	uint invocationNdx = gl.NumWorkGroups.x*gl.NumWorkGroups.y*gl.WorkGroupID.z\n"
// 		<< "	                   + gl.NumWorkGroups.x*gl.WorkGroupID.y + gl.WorkGroupID.x;\n";
//
// 	generateExecBufferIo(src, spec, "invocationNdx");
//
// 	src << "}\n";
//
// 	return src.str();
// }
//
// ComputeShaderExecutor::ComputeShaderExecutor (const glu::RenderContext& renderCtx, const ShaderSpec& shaderSpec)
// 	: BufferIoExecutor	(renderCtx, shaderSpec,
// 						 glu::ProgramSources() << glu::ComputeSource(generateComputeShader(shaderSpec)))
// {
// 	m_maxWorkSize	= tcu::IVec3(128,128,64); // Minimum in 3plus
// }
//
// ComputeShaderExecutor::~ComputeShaderExecutor (void)
// {
// }
//
// void ComputeShaderExecutor::execute (int numValues, const void* const* inputs, void* const* outputs)
// {
// 	const glw::Functions&	gl						= m_renderCtx.getFunctions();
// 	/** @type{number} */ var				maxValuesPerInvocation	= m_maxWorkSize[0];
// 	const deUint32			inputStride				= getInputStride();
// 	const deUint32			outputStride			= getOutputStride();
//
// 	initBuffers(numValues);
//
// 	// Setup input buffer & copy data
// 	uploadInputBuffer(inputs, numValues);
//
// 	// Perform compute invocations
// 	{
// 		int curOffset = 0;
// 		while (curOffset < numValues)
// 		{
// 			/** @type{number} */ var numToExec = de::min(maxValuesPerInvocation, numValues-curOffset);
//
// 			if (inputStride > 0)
// 				gl.bindBufferRange(gl.SHADER_STORAGE_BUFFER, INPUT_BUFFER_BINDING, getInputBuffer(), curOffset*inputStride, numToExec*inputStride);
//
// 			gl.bindBufferRange(gl.SHADER_STORAGE_BUFFER, OUTPUT_BUFFER_BINDING, getOutputBuffer(), curOffset*outputStride, numToExec*outputStride);
// 			GLU_EXPECT_NO_ERROR(gl.getError(), "glBindBufferRange(gl.SHADER_STORAGE_BUFFER)");
//
// 			gl.dispatchCompute(numToExec, 1, 1);
// 			GLU_EXPECT_NO_ERROR(gl.getError(), "glDispatchCompute()");
//
// 			curOffset += numToExec;
// 		}
// 	}
//
// 	// Read back data
// 	readOutputBuffer(outputs, numValues);
// }

// Tessellation utils
// TODO validate if this method should be ported
// static std::string generateVertexShaderForTess (glu::GLSLVersion version)
// {
// 	std::ostringstream	src;
//
// 	src << glu::getGLSLVersionDeclaration(version) << "\n";
//
// 	src << "void main (void)\n{\n"
// 		<< "	gl_Position = vec4(gl.VertexID/2, gl.VertexID%2, 0.0, 1.0);\n"
// 		<< "}\n";
//
// 	return src.str();
// }
//
// class CheckTessSupport
// {
// public:
// 	inline CheckTessSupport (const glu::RenderContext& renderCtx)
// 	{
// 		if (renderCtx.getType().getAPI().getProfile() == glu::PROFILE_ES)
// 			checkExtension(renderCtx, "gl.EXT_tessellation_shader");
// 	}
// };

// TessControlExecutor

// class TessControlExecutor : private CheckTessSupport, public BufferIoExecutor
// {
// public:
// 						TessControlExecutor			(const glu::RenderContext& renderCtx, const ShaderSpec& shaderSpec);
// 						~TessControlExecutor		(void);
//
// 	void				execute						(int numValues, const void* const* inputs, void* const* outputs);
//
// protected:
// 	static std::string	generateTessControlShader	(const ShaderSpec& shaderSpec);
// };
//
// std::string TessControlExecutor::generateTessControlShader (const ShaderSpec& shaderSpec)
// {
// 	std::ostringstream src;
//
// 	src << glu::getGLSLVersionDeclaration(shaderSpec.version) << "\n";
//
// 	if (shaderSpec.version == glu::GLSL_VERSION_310_ES)
// 		src << "#extension gl.EXT_tessellation_shader : require\n";
//
// 	if (!shaderSpec.globalDeclarations.empty())
// 		src << shaderSpec.globalDeclarations << "\n";
//
// 	src << "\nlayout(vertices = 1) out;\n\n";
//
// 	declareBufferBlocks(src, shaderSpec);
//
// 	src << "void main (void)\n{\n";
//
// 	for (var ndx = 0; ndx < 2; ndx++)
// 		src << "\tgl.TessLevelInner[" << ndx << "] = 1.0;\n";
//
// 	for (var ndx = 0; ndx < 4; ndx++)
// 		src << "\tgl.TessLevelOuter[" << ndx << "] = 1.0;\n";
//
// 	src << "\n"
// 		<< "\thighp uint invocationId = uint(gl.PrimitiveID);\n";
//
// 	generateExecBufferIo(src, shaderSpec, "invocationId");
//
// 	src << "}\n";
//
// 	return src.str();
// }
//
// static std::string generateEmptyTessEvalShader (glu::GLSLVersion version)
// {
// 	std::ostringstream src;
//
// 	src << glu::getGLSLVersionDeclaration(version) << "\n";
//
// 	if (version == glu::GLSL_VERSION_310_ES)
// 		src << "#extension gl.EXT_tessellation_shader : require\n\n";
//
// 	src << "layout(triangles, ccw) in;\n";
//
// 	src << "\nvoid main (void)\n{\n"
// 		<< "\tgl_Position = vec4(gl.TessCoord.xy, 0.0, 1.0);\n"
// 		<< "}\n";
//
// 	return src.str();
// }
//
// TessControlExecutor::TessControlExecutor (const glu::RenderContext& renderCtx, const ShaderSpec& shaderSpec)
// 	: CheckTessSupport	(renderCtx)
// 	, BufferIoExecutor	(renderCtx, shaderSpec, glu::ProgramSources()
// 							<< glu::VertexSource(generateVertexShaderForTess(shaderSpec.version))
// 							<< glu::TessellationControlSource(generateTessControlShader(shaderSpec))
// 							<< glu::TessellationEvaluationSource(generateEmptyTessEvalShader(shaderSpec.version))
// 							<< glu::FragmentSource(generateEmptyFragmentSource(shaderSpec.version)))
// {
// }
//
// TessControlExecutor::~TessControlExecutor (void)
// {
// }
//
// void TessControlExecutor::execute (int numValues, const void* const* inputs, void* const* outputs)
// {
// 	const glw::Functions&	gl	= m_renderCtx.getFunctions();
//
// 	initBuffers(numValues);
//
// 	// Setup input buffer & copy data
// 	uploadInputBuffer(inputs, numValues);
//
// 	if (!m_inputs.empty())
// 		gl.bindBufferBase(gl.SHADER_STORAGE_BUFFER, INPUT_BUFFER_BINDING, getInputBuffer());
//
// 	gl.bindBufferBase(gl.SHADER_STORAGE_BUFFER, OUTPUT_BUFFER_BINDING, getOutputBuffer());
//
// 	// Render patches
// 	gl.patchParameteri(gl.PATCH_VERTICES, 3);
// 	gl.drawArrays(gl.PATCHES, 0, 3*numValues);
//
// 	// Read back data
// 	readOutputBuffer(outputs, numValues);
// }
//
// // TessEvaluationExecutor
//
// class TessEvaluationExecutor : private CheckTessSupport, public BufferIoExecutor
// {
// public:
// 						TessEvaluationExecutor	(const glu::RenderContext& renderCtx, const ShaderSpec& shaderSpec);
// 						~TessEvaluationExecutor	(void);
//
// 	void				execute					(int numValues, const void* const* inputs, void* const* outputs);
//
// protected:
// 	static std::string	generateTessEvalShader	(const ShaderSpec& shaderSpec);
// };
//
// static std::string generatePassthroughTessControlShader (glu::GLSLVersion version)
// {
// 	std::ostringstream src;
//
// 	src << glu::getGLSLVersionDeclaration(version) << "\n";
//
// 	if (version == glu::GLSL_VERSION_310_ES)
// 		src << "#extension gl.EXT_tessellation_shader : require\n\n";
//
// 	src << "layout(vertices = 1) out;\n\n";
//
// 	src << "void main (void)\n{\n";
//
// 	for (var ndx = 0; ndx < 2; ndx++)
// 		src << "\tgl.TessLevelInner[" << ndx << "] = 1.0;\n";
//
// 	for (var ndx = 0; ndx < 4; ndx++)
// 		src << "\tgl.TessLevelOuter[" << ndx << "] = 1.0;\n";
//
// 	src << "}\n";
//
// 	return src.str();
// }
//
// std::string TessEvaluationExecutor::generateTessEvalShader (const ShaderSpec& shaderSpec)
// {
// 	std::ostringstream src;
//
// 	src << glu::getGLSLVersionDeclaration(shaderSpec.version) << "\n";
//
// 	if (shaderSpec.version == glu::GLSL_VERSION_310_ES)
// 		src << "#extension gl.EXT_tessellation_shader : require\n";
//
// 	if (!shaderSpec.globalDeclarations.empty())
// 		src << shaderSpec.globalDeclarations << "\n";
//
// 	src << "\n";
//
// 	src << "layout(isolines, equal_spacing) in;\n\n";
//
// 	declareBufferBlocks(src, shaderSpec);
//
// 	src << "void main (void)\n{\n"
// 		<< "\tgl_Position = vec4(gl.TessCoord.x, 0.0, 0.0, 1.0);\n"
// 		<< "\thighp uint invocationId = uint(gl.PrimitiveID) + (gl.TessCoord.x > 0.5 ? 1u : 0u);\n";
//
// 	generateExecBufferIo(src, shaderSpec, "invocationId");
//
// 	src	<< "}\n";
//
// 	return src.str();
// }
//
// TessEvaluationExecutor::TessEvaluationExecutor (const glu::RenderContext& renderCtx, const ShaderSpec& shaderSpec)
// 	: CheckTessSupport	(renderCtx)
// 	, BufferIoExecutor	(renderCtx, shaderSpec, glu::ProgramSources()
// 							<< glu::VertexSource(generateVertexShaderForTess(shaderSpec.version))
// 							<< glu::TessellationControlSource(generatePassthroughTessControlShader(shaderSpec.version))
// 							<< glu::TessellationEvaluationSource(generateTessEvalShader(shaderSpec))
// 							<< glu::FragmentSource(generateEmptyFragmentSource(shaderSpec.version)))
// {
// }
//
// TessEvaluationExecutor::~TessEvaluationExecutor (void)
// {
// }
//
// void TessEvaluationExecutor::execute (int numValues, const void* const* inputs, void* const* outputs)
// {
// 	const glw::Functions&	gl				= m_renderCtx.getFunctions();
// 	/** @type{number} */ var				alignedValues	= deAlign32(numValues, 2);
//
// 	// Initialize buffers with aligned value count to make room for padding
// 	initBuffers(alignedValues);
//
// 	// Setup input buffer & copy data
// 	uploadInputBuffer(inputs, numValues);
//
// 	// \todo [2014-06-26 pyry] Duplicate last value in the buffer to prevent infinite loops for example?
//
// 	if (!m_inputs.empty())
// 		gl.bindBufferBase(gl.SHADER_STORAGE_BUFFER, INPUT_BUFFER_BINDING, getInputBuffer());
//
// 	gl.bindBufferBase(gl.SHADER_STORAGE_BUFFER, OUTPUT_BUFFER_BINDING, getOutputBuffer());
//
// 	// Render patches
// 	gl.patchParameteri(gl.PATCH_VERTICES, 2);
// 	gl.drawArrays(gl.PATCHES, 0, 2*alignedValues);
//
// 	// Read back data
// 	readOutputBuffer(outputs, numValues);
// }

});
