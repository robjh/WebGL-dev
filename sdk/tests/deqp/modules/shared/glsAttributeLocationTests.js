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
 * \brief Attribute location tests
 *//*--------------------------------------------------------------------*/

'use strict';
goog.provide('modules.shared.glsAttributeLocationTests');
goog.require('framework.common.tcuTestCase');
goog.require('modules.shared.glsFboUtil');

goog.scope(function() {

	var glsAttributeLocationTests = modules.shared.glsAttributeLocationTests;
	var tcuTestCase = framework.common.tcuTestCase;
	var glsFboUtil = modules.shared.glsFboUtil;

	var DE_ASSERT = function(x) {
        if (!x)
            throw new Error('Assert failed');
    };

    /**
     * @param{glsFboUtil.Map} bindings
     * @param{string} attrib
     * @return {?number}
     */
    glsAttributeLocationTests.getBoundLocation = function(bindings, attrib) {
		/** @type{?number} */ var value = bindings.getValue(attrib);
		return (value == null ? glsAttributeLocationTests.LocationEnum.UNDEF : value);
	}

	/**
	 * @param{Array<*>} arr
	 * @param{number} newSize
	 * @param{*} defaultValue
	 * @return{Array<*>}
	 */
	glsAttributeLocationTests.resizeArray = function(arr, newSize, defaultValue) {
		/** @type{boolean} */ var increase = arr.length < newSize;
		/** @type{number} */ var i = 0;
		if (increase) {
			for (i = arr.length; i < newSize; i++) {
				arr[i] = defaultValue;
			}
		} else {
			arr.length = newSize;
		}

		return arr;
	}

	/**
	 * @param{Array<glsAttributeLocationTests.Attribute>} attributes
	 * @param{glsFboUtil.Map} bindings
	 * @return{boolean}
	 */
	glsAttributeLocationTests.hasAttributeAliasing = function(attributes, bindings) {
		/** @type{Array<boolean>} */ var reservedSpaces;

		/** @type{number} */ var location;
		/** @type{number} */ var size;

		for (var attribNdx = 0; attribNdx < attributes.length; attribNdx++)	{
			location	= glsAttributeLocationTests.getBoundLocation(bindings, attributes[attribNdx].getName());
			size		= attributes[attribNdx].getType().getLocationSize();

			if (location != glsAttributeLocationTests.LocationEnum.UNDEF) {
				if (reservedSpaces.length < location + size)
					glsAttributeLocationTests.resizeArray(reservedSpaces, location + size, false);

				for (var i = 0; i < size; i++) {
					if (reservedSpaces[location + i])
						return true;

					reservedSpaces[location + i] = true;
				}
			}
		}

		return false;
	}

	/**
	 * TODO
	 * @param{*} renderCtx
	 */
	glsAttributeLocationTests.getMaxAttributeLocations = function(/* glu::RenderContext& */ renderCtx) {
		// const glw::Functions& gl = renderCtx.getFunctions();
		// /** @type{number} */ var maxAttribs;

		// gl.getIntegerv(GL_MAX_VERTEX_ATTRIBS, &maxAttribs);
		// GLU_EXPECT_NO_ERROR(gl.getError(), "glGetIntegerv()");

		// return maxAttribs;
	}

	/**
	 * @param{Array<glsAttributeLocationTests.Attribute>} attributes
	 * @return{string}
	 */
	glsAttributeLocationTests.generateAttributeDefinitions = function(attributes) {
		/** @type{string} */ var src = '';
		/** @type{number} */ var i = 0;

		for (i = 0; i < attributes.length; i++)	{
			if (attributes[i].getLayoutLocation() != glsAttributeLocationTests.LocationEnum.UNDEF)	
				src += ("layout(location = " + attributes[i].getLayoutLocation() + ") ");

			src += '${VTX_INPUT} mediump ';
			src	+= (attributes[i].getType().getName() + ' ');
			src	+= attributes[i].getName();
			src	+= (attributes[i].getArraySize() != glsAttributeLocationTests.ArrayEnum.NOT ? 
				'[' + attributes[i].getArraySize() + ']' : '');
			src += ';\n';
		}

		return src;
	}

	/**
	 * @param{Array<glsAttributeLocationTests.Attribute>} attributes
	 * @return{string}
	 */
	glsAttributeLocationTests.generateConditionUniformDefinitions = function(attributes) {
		/** @type{string} */ var src = '';
		/** @type{number} */ var i = 0;
		/** @type{Array<string>} */ var conditions;

		for (i = 0; i < attributes.length; i++)	{
			if (attributes[i].getCondition() != glsAttributeLocationTests.ConstCond.NEVER 
				&& attributes[i].getCondition() != glsAttributeLocationTests.ConstCond.ALWAYS)
			conditions.append(attributes[i].getCondition().getName());
		}

		for (i = 0; i < conditions.length; i++) 
			src += ('uniform mediump float u_' + conditions[i] + ';\n');

		return src;
	}

	/**
	 * @param{glsAttributeLocationTests.Attribute} attrib
	 * @param{number}
	 * @return{string}
	 */
	glsAttributeLocationTests.generateToVec4Expression = function(attrib, id) {
		/** @type{string} */ var src = '';
		id = id || -1;

		/** @type{string} */ 
		var variableName = (attrib.getName() + (attrib.getArraySize() != glsAttributeLocationTests.ArrayEnum.NOT ? "[" + id + "]" : ""));

		switch (attrib.getType().getGLTypeEnum()) {
			case GL_INT_VEC2:
			case GL_UNSIGNED_INT_VEC2:
			case GL_FLOAT_VEC2:
				src += ("vec4(" + variableName + ".xy, " + variableName + ".yx)");
				break;

			case GL_INT_VEC3:
			case GL_UNSIGNED_INT_VEC3:
			case GL_FLOAT_VEC3:
				src += ("vec4(" + variableName + ".xyz, " + variableName + ".x)");
				break;

			default:
				src += ("vec4(" + variableName + ")");
				break;
		}

		return src;
	}

	/**
	 * @param{Array<glsAttributeLocationTests.Attribute>} attributes
	 * @return{string}
	 */
	glsAttributeLocationTests.generateOutputCode = function(attributes) {
		/** @type{string} */ var src = '';

		for (i = 0; i < attributes.length; i++)	{
			if (attributes[i].getCondition() == glsAttributeLocationTests.ConstCond.NEVER) {
				src += '\tif (0 != 0)\n';
				src += '\t{\n';

				if (attributes[i].getArraySize() == glsAttributeLocationTests.ArrayEnum.NOT)
					src += ('\t\tcolor += ' + generateToVec4Expression(attributes[i]) + ';\n');
				else {
					for (j = 0; j < attributes[i].getArraySize(); i++)
						src += ('\t\tcolor += ' + generateToVec4Expression(attributes[i], j) + ';\n');
				}

				src += '\t}\n';
			} else if (attributes[i].getCondition() == glsAttributeLocationTests.ConstCond.ALWAYS) {
				if (attributes[i].getArraySize() == glsAttributeLocationTests.ArrayEnum.NOT)
					src += ('\tcolor += ' + generateToVec4Expression(attributes[i]) + ';\n');
				else {
					for (j = 0; j < attributes[i].getArraySize(); j++)
						src += ('\tcolor += ' + generateToVec4Expression(attributes[i], j) + ';\n';
				}
			} else {
				src += ('\tif (u_' + attributes[i].getCondition().getName() + (attributes[i].getCondition().getNegate() ? ' != ' : ' == ') + '0.0)\n');
				src += '\t{\n';

				if (attributes[i].getArraySize() == glsAttributeLocationTests.ArrayEnum.NOT)
					src += ('\t\tcolor += ' + generateToVec4Expression(attributes[i]) + ';\n');
				else {
					for (j = 0; j < attributes[i].getArraySize(); i++)
						src += ('\t\tcolor += ' + generateToVec4Expression(attributes[i], j) + ';\n');
				}

				src += '\t}\n';
			}
		}

		return src;
	}


	/**
	 * @param{Array<glsAttributeLocationTests.Attribute>} attributes
	 * @return{string}
	 */
	glsAttributeLocationTests.generateVertexShaderTemplate = function(attributes) {
		/** @type{string} */ var src = '';

		src +=	'${VERSION}\n';
		src +=	'${VTX_OUTPUT} mediump vec4 v_color;\n';

		src += generateAttributeDefinitions(attributes);
		src += '\n';
		src += generateConditionUniformDefinitions(attributes);
		src += '\n';

		src += 'void main (void)\n';
		src +=	'{\n';
		src +=	'\tmediump vec4 color = vec4(0.0);\n';
		src +=	'\n';

		src += generateOutputCode(attributes);

		src += '\n';
		src += '\tv_color = color;\n';
		src += '\tgl_Position = color;\n';
		src += '}\n';

		return src;
	}

	/**
	 * TODO: check the method to get the gl version
	 * @param{Array<glsAttributeLocationTests.Attribute>} attributes
	 * @param{boolean} attributeAliasing
	 * @return{string}
	 */
	glsAttributeLocationTests.createVertexShaderSource = function(attributes, attributeAliasing) {
		// \note On GLES only GLSL #version 100 supports aliasing
		/** @type{string} */ var contextGLSLVersion = gl.getContextTypeGLSLVersion(renderCtx.getType());
		// TODO check the version methods
		/** @type{string} */ var glslVersion = (attributeAliasing && glslVersionIsES(contextGLSLVersion) ? GLSL_VERSION_100_ES : contextGLSLVersion);
		/** @type{boolean} */ var usesInOutQualifiers = glu::glslVersionUsesInOutQualifiers(glslVersion);
		const tcu::StringTemplate	vertexShaderTemplate(generateVertexShaderTemplate(attributes));

		map<string, string> parameters;

		parameters["VERSION"]					= glu::getGLSLVersionDeclaration(glslVersion);
		parameters["VTX_OUTPUT"]				= (usesInOutQualifiers ? "out"				: "varying");
		parameters["VTX_INPUT"]					= (usesInOutQualifiers ? "in"				: "attribute");
		parameters["FRAG_INPUT"]				= (usesInOutQualifiers ? "in"				: "varying");
		parameters["FRAG_OUTPUT_VAR"]			= (usesInOutQualifiers ? "dEQP_FragColor"	: "gl_FragColor");
		parameters["FRAG_OUTPUT_DECLARATION"]	= (usesInOutQualifiers
													? "layout(location=0) out mediump vec4 dEQP_FragColor;"
													: "");

		return vertexShaderTemplate.specialize(parameters);
	}

	/**
	 * TODO: check the method to get the gl version
	 * @param{boolean} attributeAliasing
	 * @return{string}
	 */
	glsAttributeLocationTests.createFragmentShaderSource = function(attributeAliasing) {
		/** @type{string} */ var fragmentShaderSource = '';
		fragmentShaderSource += '${VERSION}\n';
		fragmentShaderSource += '${FRAG_OUTPUT_DECLARATION}\n';
		fragmentShaderSource += '${FRAG_INPUT} mediump vec4 v_color;\n';
		fragmentShaderSource += 'void main (void)\n';
		fragmentShaderSource += '{\n';
		fragmentShaderSource += '\t${FRAG_OUTPUT_VAR} = v_color;\n';
		fragmentShaderSource += '}\n';

		// \note On GLES only GLSL #version 100 supports aliasing
		const glu::GLSLVersion		contextGLSLVersion		= glu::getContextTypeGLSLVersion(renderCtx.getType());
		const glu::GLSLVersion		glslVersion				= (attributeAliasing ? glu::GLSL_VERSION_300_ES : contextGLSLVersion);
		const tcu::StringTemplate	fragmentShaderTemplate(fragmentShaderSource);
		const bool					usesInOutQualifiers		= glu::glslVersionUsesInOutQualifiers(glslVersion);

		map<string, string> parameters;

		parameters["VERSION"]					= glu::getGLSLVersionDeclaration(glslVersion);
		parameters["VTX_OUTPUT"]				= (usesInOutQualifiers ? "out"				: "varying");
		parameters["VTX_INPUT"]					= (usesInOutQualifiers ? "in"				: "attribute");
		parameters["FRAG_INPUT"]				= (usesInOutQualifiers ? "in"				: "varying");
		parameters["FRAG_OUTPUT_VAR"]			= (usesInOutQualifiers ? "dEQP_FragColor"	: "gl_FragColor");
		parameters["FRAG_OUTPUT_DECLARATION"]	= (usesInOutQualifiers
														? "layout(location=0) out mediump vec4 dEQP_FragColor;"
														: "");

		return fragmentShaderTemplate.specialize(parameters);
	}

/*
TODO: some of this code is alredy implemented in other files. I'll check which method I
can reuse.
string getShaderInfoLog (const glw::Functions& gl, deUint32 shader)
{
	deInt32	length = 0;
	string	infoLog;

	gl.getShaderiv(shader, GL_INFO_LOG_LENGTH, &length);
	GLU_EXPECT_NO_ERROR(gl.getError(), "glGetShaderiv()");

	infoLog.resize(length, '\0');

	gl.getShaderInfoLog(shader, (glw::GLsizei)infoLog.length(), DE_NULL, &(infoLog[0]));
	GLU_EXPECT_NO_ERROR(gl.getError(), "glGetShaderInfoLog()");

	return infoLog;
}

bool getShaderCompileStatus (const glw::Functions& gl, deUint32 shader)
{
	deInt32 status;

	gl.getShaderiv(shader, GL_COMPILE_STATUS, &status);
	GLU_EXPECT_NO_ERROR(gl.getError(), "glGetShaderiv()");

	return status == GL_TRUE;
}

string getProgramInfoLog (const glw::Functions& gl, deUint32 program)
{
	deInt32	length = 0;
	string	infoLog;

	gl.getProgramiv(program, GL_INFO_LOG_LENGTH, &length);
	GLU_EXPECT_NO_ERROR(gl.getError(), "glGetProgramiv()");

	infoLog.resize(length, '\0');

	gl.getProgramInfoLog(program, (glw::GLsizei)infoLog.length(), DE_NULL, &(infoLog[0]));
	GLU_EXPECT_NO_ERROR(gl.getError(), "glGetProgramInfoLog()");

	return infoLog;
}

bool getProgramLinkStatus (const glw::Functions& gl, deUint32 program)
{
	deInt32 status;

	gl.getProgramiv(program, GL_LINK_STATUS, &status);
	GLU_EXPECT_NO_ERROR(gl.getError(), "glGetProgramiv()");

	return status == GL_TRUE;
}

void logProgram (TestLog& log, const glw::Functions& gl, deUint32 program)
{
	const bool				programLinkOk	= getProgramLinkStatus(gl, program);
	const string			programInfoLog	= getProgramInfoLog(gl, program);
	tcu::ScopedLogSection	linkInfo		(log, "Program Link Info", "Program Link Info");

	{
		tcu::ScopedLogSection infoLogSection(log, "Info Log", "Info Log");

		log << TestLog::Message << programInfoLog << TestLog::EndMessage;
	}

	log << TestLog::Message << "Link result: " << (programLinkOk ? "Ok" : "Fail") << TestLog::EndMessage;
}

void logShaders (TestLog&		log,
				const string&	vertexShaderSource,
				const string&	vertexShaderInfoLog,
				bool			vertexCompileOk,
				const string&	fragmentShaderSource,
				const string&	fragmentShaderInfoLog,
				bool			fragmentCompileOk)
{
	// \todo [mika] Log as real shader elements. Currently not supported by TestLog.
	{
		tcu::ScopedLogSection shaderSection(log, "Vertex Shader Info", "Vertex Shader Info");

		log << TestLog::KernelSource(vertexShaderSource);

		{
			tcu::ScopedLogSection infoLogSection(log, "Info Log", "Info Log");

			log << TestLog::Message << vertexShaderInfoLog << TestLog::EndMessage;
		}

		log << TestLog::Message << "Compilation result: " << (vertexCompileOk ? "Ok" : "Failed") << TestLog::EndMessage;
	}

	{
		tcu::ScopedLogSection shaderSection(log, "Fragment Shader Info", "Fragment Shader Info");

		log << TestLog::KernelSource(fragmentShaderSource);

		{
			tcu::ScopedLogSection infoLogSection(log, "Info Log", "Info Log");

			log << TestLog::Message << fragmentShaderInfoLog << TestLog::EndMessage;
		}

		log << TestLog::Message << "Compilation result: " << (fragmentCompileOk ? "Ok" : "Failed") << TestLog::EndMessage;
	}
}

pair<deUint32, deUint32> createAndAttachShaders (TestLog& log, glu::RenderContext& renderCtx, deUint32 program, const vector<Attribute>& attributes, bool attributeAliasing)
{
	const glw::Functions&	gl						= renderCtx.getFunctions();
	const string			vertexShaderSource		= createVertexShaderSource(renderCtx, attributes, attributeAliasing);
	const string			fragmentShaderSource	= createFragmentShaderSource(renderCtx, attributeAliasing);

	const deUint32			vertexShader			= gl.createShader(GL_VERTEX_SHADER);
	const deUint32			fragmentShader			= gl.createShader(GL_FRAGMENT_SHADER);

	try
	{
		GLU_EXPECT_NO_ERROR(gl.getError(), "glCreateShader()");

		{
			const char* const vertexShaderString	= vertexShaderSource.c_str();
			const char* const fragmentShaderString	= fragmentShaderSource.c_str();

			gl.shaderSource(vertexShader, 1, &vertexShaderString, DE_NULL);
			gl.shaderSource(fragmentShader, 1, &fragmentShaderString, DE_NULL);

			GLU_EXPECT_NO_ERROR(gl.getError(), "glShaderSource()");
		}

		gl.compileShader(vertexShader);
		gl.compileShader(fragmentShader);
		GLU_EXPECT_NO_ERROR(gl.getError(), "glCompileShader()");

		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		GLU_EXPECT_NO_ERROR(gl.getError(), "glAttachShader()");

		{
			const bool		vertexCompileOk			= getShaderCompileStatus(gl, vertexShader);
			const bool		fragmentCompileOk		= getShaderCompileStatus(gl, fragmentShader);

			const string	vertexShaderInfoLog		= getShaderInfoLog(gl, vertexShader);
			const string	fragmentShaderInfoLog	= getShaderInfoLog(gl, fragmentShader);

			logShaders(log, vertexShaderSource, vertexShaderInfoLog, vertexCompileOk, fragmentShaderSource, fragmentShaderInfoLog, fragmentCompileOk);

			TCU_CHECK_MSG(vertexCompileOk, "Vertex shader compilation failed");
			TCU_CHECK_MSG(fragmentCompileOk, "Fragment shader compilation failed");
		}

		gl.deleteShader(vertexShader);
		gl.deleteShader(fragmentShader);

		return pair<deUint32, deUint32>(vertexShader, fragmentShader);
	}
	catch (...)
	{
		if (vertexShader != 0)
			gl.deleteShader(vertexShader);

		if (fragmentShader != 0)
			gl.deleteShader(fragmentShader);

		throw;
	}
}

void bindAttributes (TestLog& log, const glw::Functions& gl, deUint32 program, const vector<Bind>& binds)
{
	for (vector<Bind>::const_iterator iter = binds.begin(); iter != binds.end(); ++iter)
	{
		log << TestLog::Message << "Bind attribute: '" << iter->getAttributeName() << "' to " << iter->getLocation() << TestLog::EndMessage;
		gl.bindAttribLocation(program, iter->getLocation(), iter->getAttributeName().c_str());
		GLU_EXPECT_NO_ERROR(gl.getError(), "glBindAttribLocation()");
	}
}

void logAttributes (TestLog& log, const vector<Attribute>& attributes)
{
	for (int attribNdx = 0; attribNdx < (int)attributes.size(); attribNdx++)
	{
		const Attribute& attrib = attributes[attribNdx];

		log << TestLog::Message
			<< "Type: " << attrib.getType().getName()
			<< ", Name: " << attrib.getName()
			<< (attrib.getLayoutLocation()	!= Attribute::LOC_UNDEF ? ", Layout location "	+ de::toString(attrib.getLayoutLocation()) : "")
			<< TestLog::EndMessage;
	}
}

bool checkActiveAttribQuery (TestLog& log, const glw::Functions& gl, deUint32 program, const vector<Attribute>& attributes)
{
	deInt32					activeAttribCount = 0;
	set<string>				activeAttributes;
	bool					isOk = true;

	gl.getProgramiv(program, GL_ACTIVE_ATTRIBUTES, &activeAttribCount);
	GLU_EXPECT_NO_ERROR(gl.getError(), "glGetProgramiv(program, GL_ACTIVE_ATTRIBUTES, &activeAttribCount)");

	for (int activeAttribNdx = 0; activeAttribNdx < activeAttribCount; activeAttribNdx++)
	{
		char			name[128];
		const size_t	maxNameSize = DE_LENGTH_OF_ARRAY(name) - 1;
		deInt32			length = 0;
		deInt32			size = 0;
		deUint32		type = 0;

		std::memset(name, 0, sizeof(name));

		gl.getActiveAttrib(program, activeAttribNdx, maxNameSize, &length, &size, &type, name);
		GLU_EXPECT_NO_ERROR(gl.getError(), "glGetActiveAttrib()");

		log << TestLog::Message
			<< "glGetActiveAttrib(program"
			<< ", index=" << activeAttribNdx
			<< ", bufSize=" << maxNameSize
			<< ", length=" << length
			<< ", size=" << size
			<< ", type=" << glu::getShaderVarTypeStr(type)
			<< ", name='" << name << "')" << TestLog::EndMessage;

		{
			bool found = false;

			for (int attribNdx = 0; attribNdx < (int)attributes.size(); attribNdx++)
			{
				const Attribute& attrib = attributes[attribNdx];

				if (attrib.getName() == name)
				{
					if (type != attrib.getType().getGLTypeEnum())
					{
						log << TestLog::Message
							<< "Error: Wrong type " << glu::getShaderVarTypeStr(type)
							<< " expected " << glu::getShaderVarTypeStr(attrib.getType().getGLTypeEnum())
							<< TestLog::EndMessage;

						isOk = false;
					}

					if (attrib.getArraySize() == Attribute::NOT_ARRAY)
					{
						if (size != 1)
						{
							log << TestLog::Message << "Error: Wrong size " << size << " expected " << 1 << TestLog::EndMessage;
							isOk = false;
						}
					}
					else
					{
						if (size != attrib.getArraySize())
						{
							log << TestLog::Message << "Error: Wrong size " << size << " expected " << attrib.getArraySize() << TestLog::EndMessage;
							isOk = false;
						}
					}

					found = true;
					break;
				}
			}

			if (!found)
			{
				log << TestLog::Message << "Error: Unknown attribute '" << name << "' returned by glGetActiveAttrib()." << TestLog::EndMessage;
				isOk = false;
			}
		}

		activeAttributes.insert(name);
	}

	for (int attribNdx = 0; attribNdx < (int)attributes.size(); attribNdx++)
	{
		const Attribute&	attrib		= attributes[attribNdx];
		const bool			isActive	= attrib.getCondition() != Cond::COND_NEVER;

		if (isActive)
		{
			if (activeAttributes.find(attrib.getName()) == activeAttributes.end())
			{
				log << TestLog::Message << "Error: Active attribute " << attrib.getName() << " wasn't returned by glGetActiveAttrib()." << TestLog::EndMessage;
				isOk = false;
			}
		}
		else
		{
			if (activeAttributes.find(attrib.getName()) != activeAttributes.end())
				log << TestLog::Message << "Note: Inactive attribute " << attrib.getName() << " was returned by glGetActiveAttrib()." << TestLog::EndMessage;
		}
	}

	return isOk;
}

bool checkAttribLocationQuery (TestLog& log, const glw::Functions& gl, deUint32 program, const vector<Attribute>& attributes, const map<string, deUint32>& bindings)
{
	bool isOk = true;

	for (int attribNdx = 0; attribNdx < (int)attributes.size(); attribNdx++)
	{
		const Attribute&	attrib				= attributes[attribNdx];
		const deInt32		expectedLocation	= (attrib.getLayoutLocation() != Attribute::LOC_UNDEF ? attrib.getLayoutLocation() : getBoundLocation(bindings, attrib.getName()));
		const deInt32		location			= gl.getAttribLocation(program, attrib.getName().c_str());

		GLU_EXPECT_NO_ERROR(gl.getError(), "glGetAttribLocation()");

		log << TestLog::Message
			<< location << " = glGetAttribLocation(program, \"" << attrib.getName() << "\")"
			<< (attrib.getCondition() != Cond::COND_NEVER && expectedLocation != Attribute::LOC_UNDEF ? ", expected " + de::toString(expectedLocation) : "")
			<< "." << TestLog::EndMessage;

		if (attrib.getCondition() == Cond::COND_NEVER && location != -1)
			log << TestLog::Message << "\tNote: Inactive attribute with location." << TestLog::EndMessage;

		if (attrib.getCondition() != Cond::COND_NEVER && expectedLocation != Attribute::LOC_UNDEF && expectedLocation != location)
			log << TestLog::Message << "\tError: Invalid attribute location." << TestLog::EndMessage;

		isOk &= (attrib.getCondition() == Cond::COND_NEVER || expectedLocation == Attribute::LOC_UNDEF || expectedLocation == location);
	}

	return isOk;
}

bool checkQuery (TestLog& log, const glw::Functions& gl, deUint32 program, const vector<Attribute>& attributes, const map<string, deUint32>& bindings)
{
	bool isOk = checkActiveAttribQuery(log, gl, program, attributes);

	if (!checkAttribLocationQuery(log, gl, program, attributes, bindings))
		isOk = false;

	return isOk;
}

string generateTestName (const AttribType& type, int arraySize)
{
	return type.getName() + (arraySize != Attribute::NOT_ARRAY ? "_array_" + de::toString(arraySize) : "");
}



	*/


	/**
	 * @constructor
	 * @param{string} name
	 * @param{number} locationSize
	 * @param{number} typeEnum
	 */
	glsAttributeLocationTests.AttribType = function(name, locationSize, typeEnum) {
		/** @type{string} */ this.m_name = name;
		/** @type{number} */ this.m_locationSize = locationSize;
		/** @type{number} */ this.m_glTypeEnum = typeEnum;
	};

	/**
	 * @return{string}
	 */
	glsAttributeLocationTests.AttribType.prototype.getName = function() {
		return this.m_name;
	};

	/**
	 * @return{number}
	 */
	glsAttributeLocationTests.AttribType.prototype.getLocationSize = function() {
		return this.m_locationSize;
	};

	/**
	 * @return{number}
	 */
	glsAttributeLocationTests.AttribType.prototype.getGLTypeEnum = function() {
		return this.m_glTypeEnum;
	};

	/**
	 * @enum{number}
	 */
	glsAttributeLocationTests.ConstCond = {
		ALWAYS : 0,
		NEVER : 1
	};

	/**
	 * @constructor
	 * @param{string} name
	 * @param{boolean} negate
	 */
	glsAttributeLocationTests.Cond = function(name, negate) {
		/** @type{boolean} */ this.m_negate = negate;
		/** @type{string} */ this.m_name = name;
	};

	/**
	 * @param{glsAttributeLocationTests.ConstCond} cond
	 * @return{glsAttributeLocationTests.Cond}
	 */
	glsAttributeLocationTests.NewCondWithEnum = function(cond) {
		var condObj = new glsAttributeLocationTests.Cond();
		condObj.m_name = '__always__';
		condObj.m_negate = (cond != glsAttributeLocationTests.ConstCond.NEVER);

		DE_ASSERT(cond == glsAttributeLocationTests.ConstCond.ALWAYS 
			|| cond == glsAttributeLocationTests.ConstCond.NEVER);

		return condObj;
	};

	/**
	 * @param{glsAttributeLocationTests.Cond} other
	 * @return{boolean}
	 */
	glsAttributeLocationTests.Cond.prototype.equals = function(other) {
		return (this.m_negate == other.m_negate && this.n_name == other.n_name);
	};

	/**
	 * @param{glsAttributeLocationTests.Cond} other
	 * @return{boolean}
	 */
	glsAttributeLocationTests.Cond.prototype.notEquals = function(other) {
		return (!this.equals(other));
	};

	/**
	 * @return{string} 
	 */
	glsAttributeLocationTests.Cond.prototype.getName = function() {
		return this.m_name;
	};

	/**
	 * @return{boolean} 
	 */
	glsAttributeLocationTests.Cond.prototype.getNegate = function() {
		return this.m_negate;
	};

	/**
	 * @enum{number}
	 */
	glsAttributeLocationTests.LocationEnum = {
		UNDEF: -1
	};

	/**
	 * @enum{number}
	 */
	glsAttributeLocationTests.ArrayEnum = {
		NOT: -1
	};

	/**
	 * @constructor
	 * @param{glsAttributeLocationTests.AttribType} type
	 * @param{string} name
	 * @param{number=} layoutLocation
	 * @param{glsAttributeLocationTests.Con=} cond
	 * @param{number=} arraySize
	 */
	glsAttributeLocationTests.Attribute = function(type, name, layoutLocation, cond, arraySize) {
		/** @type{glsAttributeLocationTests.AttribType} */ this.m_type = type;
		/** @type{string} */ this.m_name = name;
		/** @type{number} */ this.m_layoutLocation = layoutLocation || glsAttributeLocationTests.LocationEnum.UNDEF;
		/** @type{glsAttributeLocationTests.Cond} */ this.m_cond = cond || 
								glsAttributeLocationTests.NewCondWithEnum(glsAttributeLocationTests.ConstCond.ALWAYS);
		/** @type{number} */ this.m_arraySize = arraySize || glsAttributeLocationTests.ArrayEnum.NOT;
	};

	/**
	 * @return{glsAttributeLocationTests.AttribType} 
	 */
	glsAttributeLocationTests.Cond.prototype.getType = function() {
		return this.m_type;
	};

	/**
	 * @return{String} 
	 */
	glsAttributeLocationTests.Cond.prototype.getName = function() {
		return this.m_name;
	};

	/**
	 * @return{number} 
	 */
	glsAttributeLocationTests.Cond.prototype.getLayoutLocation = function() {
		return this.m_layoutLocation;
	};

	/**
	 * @return{glsAttributeLocationTests.Cond} 
	 */
	glsAttributeLocationTests.Cond.prototype.getCondition = function() {
		return this.m_cond;
	};

	/**
	 * @return{number} 
	 */
	glsAttributeLocationTests.Cond.prototype.getArraySize = function() {
		return this.m_arraySize;
	};

	/**
	 * @constructor
	 * @param{string} attribute
	 * @param{number} location
	 */
	glsAttributeLocationTests.Bind = function(attribute, location) {
		/** @type{string} */ this.m_attribute = attribute;
		/** @type{number} */ this.m_location = location;
	};

	/**
	 * @return{string}
	 */
	glsAttributeLocationTests.Bind.prototype.getAttributeName = function() {
		return this.m_attribute;
	};

	/**
	 * @return{number}
	 */
	glsAttributeLocationTests.Bind.prototype.getLocation = function() {
		return this.m_location;
	};



	/**
	 * @param{Array<glsAttributeLocationTests.Attribute>} attributes
	 * @param{Array<glsAttributeLocationTests.Bind>} preAttachBind
	 * @param{Array<glsAttributeLocationTests.Bind>} preLinkBind
	 * @param{Array<glsAttributeLocationTests.Bind>} postLinkBind
	 * @param{boolean} relink
	 * @param{boolean?} reattach
	 * @param{Array<glsAttributeLocationTests.Attribute>?} reattachAttributes
	 * @return{number}
	 */
	glsAttributeLocationTests.runTest = function(attributes, preAttachBind, preLinkBind, postLinkBind, relink, reattach, reattachAttributes) {
		reattach = reattach || false;
		reattachAttributes = reattachAttributes || [];

		/*  TODO: check possible reuse of functions
		TestLog&					log			= testCtx.getLog();
		const glw::Functions&		gl			= renderCtx.getFunctions();
		deUint32					program 	= 0;
		pair<deUint32, deUint32>	shaders;
		*/
		try	{
			/** @type{boolean} */ var isOk = true;
			/** @type{glsFboUtil.Map} */ var activeBindings;

			/** @type{number} */ var bindNdx = 0;
			for (bindNdx = 0; bindNdx < preAttachBind.length; bindNdx++)
				activeBindings[preAttachBind[bindNdx].getAttributeName()] = preAttachBind[bindNdx].getLocation();

			for (bindNdx = 0; bindNdx < preLinkBind.length; bindNdx++)
				activeBindings[preLinkBind[bindNdx].getAttributeName()] = preLinkBind[bindNdx].getLocation();

			{
				tcu::ScopedLogSection section(log, "Attributes", "Attribute information");
				logAttributes(testCtx.getLog(), attributes);
			}

			log << TestLog::Message << "Create program." << TestLog::EndMessage;
			program = gl.createProgram();
			GLU_EXPECT_NO_ERROR(gl.getError(), "glCreateProgram()");

			if (!preAttachBind.empty())
				bindAttributes(log, gl, program, preAttachBind);

			log << TestLog::Message << "Create and attach shaders to program." << TestLog::EndMessage;
			shaders = createAndAttachShaders(log, renderCtx, program, attributes, hasAttributeAliasing(attributes, activeBindings));

			if (!preLinkBind.empty())
				bindAttributes(log, gl, program, preLinkBind);

			log << TestLog::Message << "Link program." << TestLog::EndMessage;

				gl.linkProgram(program);
			GLU_EXPECT_NO_ERROR(gl.getError(), "glLinkProgram()");

			logProgram(log, gl, program);
			TCU_CHECK_MSG(getProgramLinkStatus(gl, program), "Program link failed");

			if (!checkQuery(log, gl, program, attributes, activeBindings))
				isOk = false;

			if (!postLinkBind.empty()) {
				bindAttributes(log, gl, program, postLinkBind);

				if (!checkQuery(log, gl, program, attributes, activeBindings))
					isOk = false;
			}

			if (relink) {
				log << TestLog::Message << "Relink program." << TestLog::EndMessage;
				gl.linkProgram(program);
				GLU_EXPECT_NO_ERROR(gl.getError(), "glLinkProgram()");

				logProgram(log, gl, program);
				TCU_CHECK_MSG(getProgramLinkStatus(gl, program), "Program link failed");

				for (bindNdx = 0; bindNdx < postLinkBind.length; bindNdx++)
					activeBindings[postLinkBind[bindNdx].getAttributeName()] = postLinkBind[bindNdx].getLocation();

				if (!checkQuery(log, gl, program, attributes, activeBindings))
					isOk = false;
			}

			if (reattach) {
				gl.detachShader(program, shaders.first);
				gl.detachShader(program, shaders.second);
				GLU_EXPECT_NO_ERROR(gl.getError(), "glDetachShader()");

				log << TestLog::Message << "Create and attach shaders to program." << TestLog::EndMessage;
				createAndAttachShaders(log, renderCtx, program, reattachAttributes, hasAttributeAliasing(reattachAttributes, activeBindings));

				log << TestLog::Message << "Relink program." << TestLog::EndMessage;
				gl.linkProgram(program);
				GLU_EXPECT_NO_ERROR(gl.getError(), "glLinkProgram()");

				logProgram(log, gl, program);
				TCU_CHECK_MSG(getProgramLinkStatus(gl, program), "Program link failed");

				if (!checkQuery(log, gl, program, reattachAttributes, activeBindings))
					isOk = false;
			}

			gl.deleteProgram(program);
			GLU_EXPECT_NO_ERROR(gl.getError(), "glDeleteProgram()");

			if (isOk)
				testCtx.setTestResult(QP_TEST_RESULT_PASS, "Pass");
			else
				testCtx.setTestResult(QP_TEST_RESULT_FAIL, "Fail");
		} catch (e)	{
			if (program)
				gl.deleteProgram(program);

			throw e;
		}
	};

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
	 * @param{glsAttributeLocationTests.AttribType} type
	 * @param {number=} arraySize
	 */
	glsAttributeLocationTests.BindAttributeTest = function(name, desc, type, arraySize) {
		tcuTestCase.DeqpTest.call(this, name, desc);
		/** @type{*} */ this.m_renderCtx = renderCtx;
		/** @type{glsAttributeLocationTests.AttribType} */ this.m_type = type;
		/** @type{number} */ this.m_arraySize = arraySize || glsAttributeLocationTests.ArrayEnum.NOT;
	};

	glsAttributeLocationTests.BindAttributeTest.prototype.iterate = function() {
		/** @type{Array<glsAttributeLocationTests.Bind>} */ var noBindings = [];

		/** @type{Array<glsAttributeLocationTests.Attribute>} */	var attributes = [];
		/** @type{Array<glsAttributeLocationTests.Bind>} */ var bindings = [];

		attributes.push(new glsAttributeLocationTests.Attribute(m_type, 'a_0', glsAttributeLocationTests.LocationEnum.UNDEF, glsAttributeLocationTests.ConstCond.ALWAYS, m_arraySize));
		bindings.push(new Bind("a_0", 3));

		glsAttributeLocationTests.runTest(m_testCtx, m_renderCtx, attributes, noBindings, bindings, noBindings, false);
		return tcuTestCase.IterateResult.STOP;;
	};

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
	 * @param{TestContext} testCtx
	 * @param{RenderContext} renderCtx
	 * @param{glsAttributeLocationTests.AttribType} type
	 * @param {number=} arraySize
	 */
	glsAttributeLocationTests.BindMaxAttributesTest = function(name, desc, testCtx, renderCtx, type, arraySize) {
		tcuTestCase.DeqpTest.call(this, name, desc);
		/** @type{*} */ this.m_renderCtx = renderCtx;
		/** @type{glsAttributeLocationTests.AttribType} */ this.m_type = type;
		/** @type{number} */ this.m_arraySize = arraySize || glsAttributeLocationTests.ArrayEnum.NOT;
	};

	glsAttributeLocationTests.BindMaxAttributesTest.prototype.iterate = function() {
		/** @type{Array<glsAttributeLocationTests.Bind>} */ var noBindings = [];
		/** @type{number} */ var maxAttributes = getMaxAttributeLocations(m_renderCtx);
		/** @type{number} */ var arrayElementCount = (m_arraySize != glsAttributeLocationTests.ArrayEnum.NOT ? m_arraySize : 1);;

		/** @type{Array<glsAttributeLocationTests.Attribute>} */	var attributes = [];
		/** @type{Array<glsAttributeLocationTests.Bind>} */ var bindings = [];
		/** @type{number} */ var ndx = 0;

		m_testCtx.getLog() << TestLog::Message << "GL_MAX_VERTEX_ATTRIBS: " << maxAttributes << TestLog::EndMessage;

		for (var loc = maxAttributes - (arrayElementCount * m_type.getLocationSize()); loc >= 0; loc -= (arrayElementCount * m_type.getLocationSize())) {
			attributes.push(new Attribute(m_type, "a_" + ndx, glsAttributeLocationTests.LocationEnum.UNDEF, glsAttributeLocationTests.ConstCond.ALWAYS, m_arraySize));
			bindings.push_back(Bind("a_" + de::toString(ndx), loc));
			ndx++;
		}

		glsAttributeLocationTests.runTest(m_testCtx, m_renderCtx, attributes, noBindings, bindings, noBindings, false);
		return tcuTestCase.IterateResult.STOP;
	};

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
	 * @param{TestContext} testCtx
	 * @param{RenderContext} renderCtx
	 * @param{glsAttributeLocationTests.AttribType} type
	 * @param{number=} offset
	 * @param {number=} arraySize
	 */
	glsAttributeLocationTests.BindAliasingAttributeTest = function(name, desc, testCtx, renderCtx, type, offset, arraySize) {
		tcuTestCase.DeqpTest.call(this, name, desc);
		/** @type{*} */ this.m_renderCtx = renderCtx;
		/** @type{glsAttributeLocationTests.AttribType} */ this.m_type = type;
		/** @type{number} */ this.m_offset = offset || 0;
		/** @type{number} */ this.m_arraySize = arraySize || glsAttributeLocationTests.ArrayEnum.NOT;
	};

	glsAttributeLocationTests.BindAliasingAttributeTest.prototype.iterate = function() {
		/** @type{Array<glsAttributeLocationTests.Bind>} */ var noBindings = [];

		/** @type{Array<glsAttributeLocationTests.Attribute>} */	var attributes = [];
		/** @type{Array<glsAttributeLocationTests.Bind>} */ var bindings = [];

		attributes.push(new Attribute(m_type, 'a_0', glsAttributeLocationTests.LocationEnum.UNDEF, new Cond('A', true), m_arraySize));
		attributes.push(new Attribute(AttribType('vec4', 1, GL_FLOAT_VEC4), 'a_1', glsAttributeLocationTests.LocationEnum.UNDEF, new Cond('A', false)));
		bindings.push(new Bind('a_0', 1));
		bindings.push(new Bind('a_1', 1 + m_offset));

		glsAttributeLocationTests.runTest(m_testCtx, m_renderCtx, attributes, noBindings, bindings, noBindings, false);
		return tcuTestCase.IterateResult.STOP;
	};

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
	 * @param{TestContext} testCtx
	 * @param{RenderContext} renderCtx
	 * @param{glsAttributeLocationTests.AttribType} type
	 * @param {number=} arraySize
	 */
	glsAttributeLocationTests.BindMaxAliasingAttributeTest = function(name, desc, testCtx, renderCtx, type, arraySize) {
		tcuTestCase.DeqpTest.call(this, name, desc);
		/** @type{*} */ this.m_renderCtx = renderCtx;
		/** @type{glsAttributeLocationTests.AttribType} */ this.m_type = type;
		/** @type{number} */ this.m_arraySize = arraySize || glsAttributeLocationTests.ArrayEnum.NOT;
	};

	glsAttributeLocationTests.BindMaxAliasingAttributeTest.prototype.iterate = function() {
		/** @type{Array<glsAttributeLocationTests.Bind>} */ var noBindings = [];
		/** @type{number} */ var maxAttributes = getMaxAttributeLocations(m_renderCtx);
		/** @type{number} */ var arrayElementCount = (m_arraySize != glsAttributeLocationTests.ArrayEnum.NOT ? m_arraySize : 1);;

		/** @type{Array<glsAttributeLocationTests.Attribute>} */	var attributes = [];
		/** @type{Array<glsAttributeLocationTests.Bind>} */ var bindings = [];
		/** @type{number} */ var ndx = 0;

		m_testCtx.getLog() << TestLog::Message << 'GL_MAX_VERTEX_ATTRIBS: ' << maxAttributes << TestLog::EndMessage;

		for (loc = maxAttributes - arrayElementCount * m_type.getLocationSize(); loc >= 0; loc -= m_type.getLocationSize() * arrayElementCount) {
			attributes.push(new Attribute(m_type, 'a_' + ndx, glsAttributeLocationTests.LocationEnum.UNDEF, new Cond('A', true)));
			bindings.push(new Bind('a_' + ndx, loc));

			attributes.push(new Attribute(m_type, 'a_' + (ndx + maxAttributes), glsAttributeLocationTests.LocationEnum.UNDEF, new Cond('A', false)));
			bindings.push(new Bind('a_' + (ndx + maxAttributes), loc));
			ndx++;
		}

		glsAttributeLocationTests.runTest(m_testCtx, m_renderCtx, attributes, noBindings, bindings, noBindings, false);
		return tcuTestCase.IterateResult.STOP;
	};

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
	 * @param{TestContext} testCtx
	 * @param{RenderContext} renderCtx
	 * @param{glsAttributeLocationTests.AttribType} type
	 * @param {number=} arraySize
	 */
	glsAttributeLocationTests.BindInactiveAliasingAttributeTest = function(name, desc, testCtx, renderCtx, type, arraySize) {
		tcuTestCase.DeqpTest.call(this, name, desc);
		/** @type{*} */ this.m_renderCtx = renderCtx;
		/** @type{glsAttributeLocationTests.AttribType} */ this.m_type = type;
		/** @type{number} */ this.m_arraySize = arraySize || glsAttributeLocationTests.ArrayEnum.NOT;
	};


	glsAttributeLocationTests.BindInactiveAliasingAttributeTest.prototype.iterate = function() {
		/** @type{Array<glsAttributeLocationTests.Bind>} */ var noBindings = [];
		/** @type{number} */ var maxAttributes = getMaxAttributeLocations(m_renderCtx);
		/** @type{glsAttributeLocationTests.AttribType} */ var vec4('vec4', 1, GL_FLOAT_VEC4);
		/** @type{number} */ var arrayElementCount = (m_arraySize != glsAttributeLocationTests.ArrayEnum.NOT ? m_arraySize : 1);;

		/** @type{Array<glsAttributeLocationTests.Attribute>} */	var attributes = [];
		/** @type{Array<glsAttributeLocationTests.Bind>} */ var bindings = [];
		/** @type{number} */ var ndx = 0;

		m_testCtx.getLog() << TestLog::Message << 'GL_MAX_VERTEX_ATTRIBS: ' << maxAttributes << TestLog::EndMessage;

		for (loc = maxAttributes - arrayElementCount * m_type.getLocationSize(); loc >= 0; loc -= m_type.getLocationSize() * arrayElementCount) {
			attributes.push(new Attribute(m_type, 'a_' + ndx, glsAttributeLocationTests.LocationEnum.UNDEF, new Cond('A')));
			bindings.push(new Bind('a_' + (ndx), loc));

			attributes.push(new Attribute(m_type, 'a_' + (ndx + maxAttributes), glsAttributeLocationTests.LocationEnum.UNDEF, glsAttributeLocationTests.ConstCond.NEVER));
			bindings.push(new Bind('a_' + (ndx + maxAttributes), loc));
			ndx++;
		}

		glsAttributeLocationTests.runTest(m_testCtx, m_renderCtx, attributes, noBindings, bindings, noBindings, false);
		return tcuTestCase.IterateResult.STOP;
	};

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
	 * @param{TestContext} testCtx
	 * @param{RenderContext} renderCtx
	 * @param{glsAttributeLocationTests.AttribType} type
	 * @param {number=} arraySize
	 */
	glsAttributeLocationTests.BindHoleAttributeTest = function(name, desc, testCtx, renderCtx, type, arraySize) {
		tcuTestCase.DeqpTest.call(this, name, desc);
		/** @type{*} */ this.m_renderCtx = renderCtx;
		/** @type{glsAttributeLocationTests.AttribType} */ this.m_type = type;
		/** @type{number} */ this.m_arraySize = arraySize || glsAttributeLocationTests.ArrayEnum.NOT;
	};

	glsAttributeLocationTests.BindHoleAttributeTest.prototype.iterate = function() {
		/** @type{Array<glsAttributeLocationTests.Bind>} */ var noBindings = [];
		/** @type{number} */ var maxAttributes = getMaxAttributeLocations(m_renderCtx);
		/** @type{glsAttributeLocationTests.AttribType} */ var vec4('vec4', 1, GL_FLOAT_VEC4);
		/** @type{number} */ var arrayElementCount = (m_arraySize != glsAttributeLocationTests.ArrayEnum.NOT ? m_arraySize : 1);;

		/** @type{Array<glsAttributeLocationTests.Attribute>} */	var attributes = [];
		/** @type{Array<glsAttributeLocationTests.Bind>} */ var bindings = [];
		/** @type{number} */ var ndx = 0;

		attributes.push(new Attribute(vec4, 'a_0'));
		bindings.push(new Bind('a_0', 0));

		attributes.push(new Attribute(m_type, 'a_1', glsAttributeLocationTests.LocationEnum.UNDEF, glsAttributeLocationTests.ConstCond.ALWAYS, m_arraySize));

		ndx = 2;
		for (loc = 1 + m_type.getLocationSize() * arrayElementCount; loc < maxAttributes; loc++) {
			attributes.push(new Attribute(vec4, 'a_' + ndx));
			bindings.push(new Bind('a_' + ndx, loc));

			ndx++;
		}

		glsAttributeLocationTests.runTest(m_testCtx, m_renderCtx, attributes, noBindings, bindings, noBindings, false);
		return tcuTestCase.IterateResult.STOP;
	};

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
	 * @param{TestContext} testCtx
	 * @param{RenderContext} renderCtx
	 */
	glsAttributeLocationTests.PreAttachBindAttributeTest = function(name, desc, testCtx, renderCtx) {
		tcuTestCase.DeqpTest.call(this, name, desc);
		/** @type{*} */ this.m_renderCtx = renderCtx;
	};

	glsAttributeLocationTests.PreAttachBindAttributeTest.prototype.iterate = function() {
		/** @type{Array<glsAttributeLocationTests.Bind>} */ var noBindings = [];
		/** @type{number} */ var maxAttributes = getMaxAttributeLocations(m_renderCtx);
		
		/** @type{Array<glsAttributeLocationTests.Attribute>} */	var attributes = [];
		/** @type{Array<glsAttributeLocationTests.Bind>} */ var bindings = [];
		/** @type{number} */ var ndx = 0;

		attributes.push(new Attribute(AttribType("vec4", 1, GL_FLOAT_VEC4), "a_0"));
		bindings.push(new Bind("a_0", 3));

		glsAttributeLocationTests.runTest(m_testCtx, m_renderCtx, attributes, bindings, noBindings, noBindings, false);
		return tcuTestCase.IterateResult.STOP;
	};

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
	 * @param{TestContext} testCtx
	 * @param{RenderContext} renderCtx
	 */
	glsAttributeLocationTests.PreLinkBindAttributeTest = function(name, desc, testCtx, renderCtx) {
		tcuTestCase.DeqpTest.call(this, name, desc);
		/** @type{*} */ this.m_renderCtx = renderCtx;
	};

	glsAttributeLocationTests.PreLinkBindAttributeTest.prototype.iterate = function() {
		/** @type{Array<glsAttributeLocationTests.Bind>} */ var noBindings = [];
		
		/** @type{Array<glsAttributeLocationTests.Attribute>} */	var attributes = [];
		/** @type{Array<glsAttributeLocationTests.Bind>} */ var bindings = [];
		/** @type{number} */ var ndx = 0;

		attributes.push(new Attribute(AttribType('vec4', 1, GL_FLOAT_VEC4), 'a_0'));
		bindings.push(new Bind('a_0', 3));

		glsAttributeLocationTests.runTest(m_testCtx, m_renderCtx, attributes, bindings, noBindings, noBindings, false);
		return tcuTestCase.IterateResult.STOP;
};

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
	 * @param{TestContext} testCtx
	 * @param{RenderContext} renderCtx
	 */
	glsAttributeLocationTests.PostLinkBindAttributeTest = function(name, desc, testCtx, renderCtx) {
		tcuTestCase.DeqpTest.call(this, name, desc);
		/** @type{*} */ this.m_renderCtx = renderCtx;
	};

	glsAttributeLocationTests.PostLinkBindAttributeTest.prototype.iterate = function() {
		/** @type{Array<glsAttributeLocationTests.Bind>} */ var noBindings = [];
		
		/** @type{Array<glsAttributeLocationTests.Attribute>} */	var attributes = [];
		/** @type{Array<glsAttributeLocationTests.Bind>} */ var bindings = [];

		attributes.push(new Attribute(AttribType('vec4', 1, GL_FLOAT_VEC4), 'a_0'));
		bindings.push(new Bind('a_0', 3));

		glsAttributeLocationTests.runTest(m_testCtx, m_renderCtx, attributes, noBindings, noBindings, bindings, false);
		return tcuTestCase.IterateResult.STOP;
}

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
	 * @param{TestContext} testCtx
	 * @param{RenderContext} renderCtx
	 */
	glsAttributeLocationTests.BindReattachAttributeTest = function(name, desc, testCtx, renderCtx) {
		tcuTestCase.DeqpTest.call(this, name, desc);
		/** @type{*} */ this.m_renderCtx = renderCtx;
	};

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
	 * @param{TestContext} testCtx
	 * @param{RenderContext} renderCtx
	 * @param{glsAttributeLocationTests.AttribType} type
	 * @param {number=} arraySize
	 */
	glsAttributeLocationTests.LocationAttributeTest = function(name, desc, testCtx, renderCtx, type, arraySize) {
		tcuTestCase.DeqpTest.call(this, name, desc);
		/** @type{*} */ this.m_renderCtx = renderCtx;
		/** @type{glsAttributeLocationTests.AttribType} */ this.m_type = type;
		/** @type{number} */ this.m_arraySize = arraySize || glsAttributeLocationTests.ArrayEnum.NOT;
	};

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
	 * @param{TestContext} testCtx
	 * @param{RenderContext} renderCtx
	 * @param{glsAttributeLocationTests.AttribType} type
	 * @param {number=} arraySize
	 */
	glsAttributeLocationTests.LocationMaxAttributesTest = function(name, desc, testCtx, renderCtx, type, arraySize) {
		tcuTestCase.DeqpTest.call(this, name, desc);
		/** @type{*} */ this.m_renderCtx = renderCtx;
		/** @type{glsAttributeLocationTests.AttribType} */ this.m_type = type;
		/** @type{number} */ this.m_arraySize = arraySize || glsAttributeLocationTests.ArrayEnum.NOT;
	};

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
	 * @param{TestContext} testCtx
	 * @param{RenderContext} renderCtx
	 * @param{glsAttributeLocationTests.AttribType} type
	 * @param {number=} arraySize
	 */
	glsAttributeLocationTests.LocationHoleAttributeTest = function(name, desc, testCtx, renderCtx, type, arraySize) {
		tcuTestCase.DeqpTest.call(this, name, desc);
		/** @type{*} */ this.m_renderCtx = renderCtx;
		/** @type{glsAttributeLocationTests.AttribType} */ this.m_type = type;
		/** @type{number} */ this.m_arraySize = arraySize || glsAttributeLocationTests.ArrayEnum.NOT;
	};

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
	 * @param{TestContext} testCtx
	 * @param{RenderContext} renderCtx
	 * @param{glsAttributeLocationTests.AttribType} type
	 * @param {number=} arraySize
	 */
	glsAttributeLocationTests.MixedAttributeTest = function(name, desc, testCtx, renderCtx, type, arraySize) {
		tcuTestCase.DeqpTest.call(this, name, desc);
		/** @type{*} */ this.m_renderCtx = renderCtx;
		/** @type{glsAttributeLocationTests.AttribType} */ this.m_type = type;
		/** @type{number} */ this.m_arraySize = arraySize || glsAttributeLocationTests.ArrayEnum.NOT;
	};

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
	 * @param{TestContext} testCtx
	 * @param{RenderContext} renderCtx
	 * @param{glsAttributeLocationTests.AttribType} type
	 * @param {number=} arraySize
	 */
	glsAttributeLocationTests.MixedMaxAttributesTest = function(name, desc, testCtx, renderCtx, type, arraySize) {
		tcuTestCase.DeqpTest.call(this, name, desc);
		/** @type{*} */ this.m_renderCtx = renderCtx;
		/** @type{glsAttributeLocationTests.AttribType} */ this.m_type = type;
		/** @type{number} */ this.m_arraySize = arraySize || glsAttributeLocationTests.ArrayEnum.NOT;
	};

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
	 * @param{TestContext} testCtx
	 * @param{RenderContext} renderCtx
	 * @param{glsAttributeLocationTests.AttribType} type
	 * @param {number=} arraySize
	 */
	glsAttributeLocationTests.MixedHoleAttributeTest = function(name, desc, testCtx, renderCtx, type, arraySize) {
		tcuTestCase.DeqpTest.call(this, name, desc);
		/** @type{*} */ this.m_renderCtx = renderCtx;
		/** @type{glsAttributeLocationTests.AttribType} */ this.m_type = type;
		/** @type{number} */ this.m_arraySize = arraySize || glsAttributeLocationTests.ArrayEnum.NOT;
	};

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
	 * @param{TestContext} testCtx
	 * @param{RenderContext} renderCtx
	 */
	glsAttributeLocationTests.BindRelinkAttributeTest = function(name, desc, testCtx, renderCtx) {
		tcuTestCase.DeqpTest.call(this, name, desc);
		/** @type{*} */ this.m_renderCtx = renderCtx;
	};

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
	 * @param{TestContext} testCtx
	 * @param{RenderContext} renderCtx
	 * @param{glsAttributeLocationTests.AttribType} type
	 * @param {number=} arraySize
	 */
	glsAttributeLocationTests.BindRelinkHoleAttributeTest = function(name, desc, testCtx, renderCtx, type, arraySize) {
		tcuTestCase.DeqpTest.call(this, name, desc);
		/** @type{*} */ this.m_renderCtx = renderCtx;
		/** @type{glsAttributeLocationTests.AttribType} */ this.m_type = type;
		/** @type{number} */ this.m_arraySize = arraySize || glsAttributeLocationTests.ArrayEnum.NOT;
	};

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
	 * @param{TestContext} testCtx
	 * @param{RenderContext} renderCtx
	 * @param{glsAttributeLocationTests.AttribType} type
	 * @param {number=} arraySize
	 */
	glsAttributeLocationTests.MixedRelinkHoleAttributeTest = function(name, desc, testCtx, renderCtx, type, arraySize) {
		tcuTestCase.DeqpTest.call(this, name, desc);
		/** @type{*} */ this.m_renderCtx = renderCtx;
		/** @type{glsAttributeLocationTests.AttribType} */ this.m_type = type;
		/** @type{number} */ this.m_arraySize = arraySize || glsAttributeLocationTests.ArrayEnum.NOT;
	};

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
	 * @param{TestContext} testCtx
	 * @param{RenderContext} renderCtx
	 */
	glsAttributeLocationTests.PreAttachMixedAttributeTest = function(name, desc, testCtx, renderCtx) {
		tcuTestCase.DeqpTest.call(this, name, desc);
		/** @type{*} */ this.m_renderCtx = renderCtx;
	};

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
	 * @param{TestContext} testCtx
	 * @param{RenderContext} renderCtx
	 */
	glsAttributeLocationTests.PreLinkMixedAttributeTest = function(name, desc, testCtx, renderCtx) {
		tcuTestCase.DeqpTest.call(this, name, desc);
		/** @type{*} */ this.m_renderCtx = renderCtx;
	};

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
	 * @param{TestContext} testCtx
	 * @param{RenderContext} renderCtx
	 */
	glsAttributeLocationTests.PostLinkMixedAttributeTest = function(name, desc, testCtx, renderCtx) {
		tcuTestCase.DeqpTest.call(this, name, desc);
		/** @type{*} */ this.m_renderCtx = renderCtx;
	};

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
	 * @param{TestContext} testCtx
	 * @param{RenderContext} renderCtx
	 */
	glsAttributeLocationTests.MixedReattachAttributeTest = function(name, desc, testCtx, renderCtx) {
		tcuTestCase.DeqpTest.call(this, name, desc);
		/** @type{*} */ this.m_renderCtx = renderCtx;
	};

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
	 * @param{TestContext} testCtx
	 * @param{RenderContext} renderCtx
	 */
	glsAttributeLocationTests.MixedRelinkAttributeTest = function(name, desc, testCtx, renderCtx) {
		tcuTestCase.DeqpTest.call(this, name, desc);
		/** @type{*} */ this.m_renderCtx = renderCtx;
	};

});
