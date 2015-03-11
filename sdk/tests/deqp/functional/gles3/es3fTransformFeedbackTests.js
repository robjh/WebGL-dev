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

define(['framework/opengl/gluShaderUtil',
        'framework/opengl/gluDrawUtil',
        'modules/shared/glsUniformBlockCase',
        'framework/opengl/gluVarType',
        'framework/opengl/gluVarTypeUtil',
        'framework/opengl/gluShaderProgram',
        'framework/delibs/debase/deRandom',
        'framework/delibs/debase/deMath',
        'framework/delibs/debase/deString',
        'framework/common/tcuTestCase',
        'framework/common/tcuSurface',
        'framework/common/tcuImageCompare'],
        function(deqpUtils, deqpDraw, glsUBC, gluVT, gluVTU, deqpProgram, deRandom, deMath, deString, deqpTests, tcuSurface, tcuPixelThresholdCompare) {
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
        default:
            throw new Error('Unrecognized interpolation name ' + interpol);
       }

    };

    var GLU_EXPECT_NO_ERROR = (function(gl, err, msg) {
        if (err != gl.NO_ERROR) {
            if (msg) msg += ': ';
            
            msg += "gl.GetError() returned " + err;
            
            throw new Error(msg)
        }
    });
    var DE_ASSERT = function(x) {
        if (!x)
            throw new Error('Assert failed');
    };

    /**
     * Returns a Varying object, it's a struct, invoked in the C version as a function
     * @param {string} name
     * @param {gluVT.VarType} type
     * @param {number} interpolation
     * @return {Object}
     */
    var Varying = (function(name, type, interpolation) {
        this.name = name;
        this.type = type;
        this.interpolation = interpolation;
    });

    /** findAttributeNameEquals
     * Replaces original implementation of "VaryingNameEquals" and "AttributeNameEquals" in the C++ version
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
        if (attributeNameFound === false)
        bufferedLogToConsole('Attribute or Varying name: ' + name + ', has not been found in the array');
        // TODO: I don't know if the error below is necessary ??
        throw Error('Attribute or Varying name: ' + name + ', has not been found in the array');
    };

    /**
     * Returns an Attribute object, it's a struct, invoked in the C version as a function
     * @param {string} name
     * @param {gluVT.VarType} type
     * @param {number} offset
     * @return {Object}
     */
    var Attribute = (function(name, type, offset) {
        var container = {
            /** @type {string}        */ name: null,
            /** @type {gluVT.VarType} */ type: null,
            /** @type {number}        */ offset: 0
        };

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

    /**
     * Returns an Output object
     * @return {Object}
     */
    var Output = (function() {
        return {
            /** @type {number}            */ bufferNdx: 0,
            /** @type {number}            */ offset: 0,
            /** @type {string}            */ name: null,
            /** @type {gluVT.VarType}     */ type: null,
            /** @type {Array.<Attribute>} */ inputs: []
            };
    });

    /**
     * Returns an object type DrawCall.
     * Contains the number of elements as well as whether the Transform Feedback is enabled or not.
     * It's a struct, but as occurs in Varying, is invoked in the C++ version as a function.
     * @param {number} numElements
     * @param {boolean} tfEnabled is Transform Feedback enabled or not
     * @return {Object.<number, boolean>} content for the DrawCall object
     */
    var DrawCall = (function(numElements, tfEnabled) {

        var content = {
            /** @type {number}  */ numElements: 0,
            /** @type {boolean} */ transformFeedbackEnabled: false
        };

        if (
            typeof(numElements) !== 'undefined' &&
            typeof(tfEnabled) !== 'undefined'
        ) {
            content.numElements = numElements;
            content.transformFeedbackEnabled = tfEnabled;
        }

        return content;
    });

    // it's a class
    var ProgramSpec = (function() {

    /** @type {Array.<gluVT.StructType>} */ var m_structs = [];
    /** @type {Array.<Varying>}          */ var m_varyings = [];
    /** @type {Array.<string>}           */ var m_transformFeedbackVaryings = [];

        this.createStruct = function(name) {
            var struct = gluVT.newStructType(name);
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

        this.isPointSizeUsed = function() {
            for (var i = 0; i < m_transformFeedbackVaryings.length; ++i) {
                if (m_transformFeedbackVaryings[i] == 'gl_PointSize') return true;
            }
            return false;
        };

    });

    /** Returns if the program is supported or not
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

        maxVertexAttribs           = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
        maxTfInterleavedComponents = gl.getParameter(gl.MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS);
        maxTfSeparateAttribs       = gl.getParameter(gl.MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS);
        maxTfSeparateComponents    = gl.getParameter(gl.MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS);

        // Check vertex attribs.
        /** @type {number} */ var totalVertexAttribs = (
            1 /* a_position */ + (spec.isPointSizeUsed() ? 1 : 0)
        );

        for (var i = 0; i < spec.getVaryings().length; ++i) {
            for (var v_iter = gluVTU.VectorTypeIterator(spec.getVaryings()[i]); !v_iter.end(); v_iter.next()) {
                totalVertexAttribs += 1;
            }
        }

        if (totalVertexAttribs > maxVertexAttribs)
            return false; // Vertex attribute count exceeded.

            // check varyings
            /** @type {number}                  */ var totalTfComponents = 0;
            /** @type {number}                  */ var totalTfAttribs = 0;
            /** @type {Object.<number, number>} */ var presetNumComponents = {
            gl_Position: 4,
            gl_PointSize: 1
        };
        for (var i = 0; i < spec.getTransformFeedbackVaryings().length; ++i) {
            /** @type {Array.<string>} */ var name = spec.getTransformFeedbackVaryings()[i];
            /** @type {number} */ var numComponents = 0;

            if (typeof(presetNumComponents[name]) != 'undefined') {
                numComponents = presetNumComponents[name];
            } else {
                var varName = gluVTU.parseVariableName(name);
                // find the varying called varName
                /** @type {Varying} */ var varying = (function(varyings) {
                    for (var i = 0; i < varyings.length; ++i) {
                        if (varyings[i].name == varName) {
                            return varyings[i];
                        }
                    }
                    return null;
                }(spec.getVaryings()));

                // glu::TypeComponentVector
                var varPath = gluVT.parseTypePath(name, varying.type);
                numComponents = gluVTU.getVarType(varying.type, varPath).getScalarSize();
            }

            if (tfMode == gl.SEPARATE_ATTRIBS && numComponents > maxTfSeparateComponents)
                return false; // Per-attribute component count exceeded.

            totalTfComponents += numComponents;
            totalTfAttribs += 1;
        }
    
        if (tfMode == gl.SEPARATE_ATTRIBS && totalTfAttribs > maxTfSeparateAttribs)
            return false;

        if (tfMode == gl.INTERLEAVED_ATTRIBS && totalTfComponents > maxTfInterleavedComponents)
            return false;

        return true;

    };

    /**
     * @param {string} varyingName
     * @param {Array.<string>} path
     * @return {string}
     */
    var getAttributeName = function(varyingName, path) {
    /** @type {string} */ var str = 'a_' + varyingName.substr(/^v_/.test(varyingName) ? 2 : 0);

        for (var i = 0; i < path.length; ++i) {
        /** @type {string} */ var prefix;

            switch (path[i].type) {
                case gluVTU.VarTypeComponent.s_Type.STRUCT_MEMBER: prefix = '_m'; break;
                case gluVTU.VarTypeComponent.s_Type.ARRAY_ELEMENT: prefix = '_e'; break;
                case gluVTU.VarTypeComponent.s_Type.MATRIX_COLUMN: prefix = '_c'; break;
                case gluVTU.VarTypeComponent.s_Type.VECTOR_COMPONENT: prefix = '_s'; break;
                default:
                    throw new Error('invalid type in the component path.');
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

        var vtx = { str: null };
        var frag = { str: null };
        var addPointSize = spec.isPointSizeUsed();

        vtx.str = '#version 300 es\n'
                 + 'in highp vec4 a_position;\n';
        frag.str = '#version 300 es\n'
                 + 'layout(location = 0) out mediump vec4 o_color;\n'
                 + 'uniform highp vec4 u_scale;\n'
                 + 'uniform highp vec4 u_bias;\n';

        if (addPointSize) {
            vtx.str += 'in highp float a_pointSize;\n';
        }

        // Declare attributes.
        for (var i = 0; i < spec.getVaryings().length; ++i) {

        /** @type {string} */ var name = spec.getVaryings()[i].name;
        /** @type {gluVarType.VarType} */ var type = spec.getVaryings()[i].type;

            // TODO: check loop, original code:
            // for (glu::VectorTypeIterator vecIter = glu::VectorTypeIterator::begin(&type); vecIter != glu::VectorTypeIterator::end(&type); vecIter++)
            for (var vecIter = new gluVTU.VectorTypeIterator(type); !vecIter.end(); vecIter.next()) {

                /** @type {gluVarType.VarType} */
                var attribType = gluVTU.getVarType(type, vecIter.getPath());

                /** @type {string} */
                var attribName = getAttributeName(name, vecIter.getPath());
                
                // TODO: only strings are needed for attribType, attribName
                vtx.str += 'in ' + gluVT.declareVariable(attribType, attribName) + ';\n'; 
                
            }
        }

        // Declare varyings.
        for (var ndx = 0; ndx < 2; ++ndx) {
        /** @type {string} */ var inout = ndx ? 'in' : 'out';
        /** @type {string} */ var shader = ndx ? frag : vtx;

            for (var i = 0; i < spec.getStructs().length; ++i) {
                var struct = spec.getStructs()[i];
                if (struct.hasTypeName()) {
                    shader.str += gluVT.declareStructType(struct) + ';\n'; // TODO: only a string is needed for struct
                }
            }

            /** @type {Array.<Varying>} */ var varyings = spec.getVaryings();
            for (var i = 0; i < varyings.length; ++i) {
            	var varying = varyings[i];
                shader.str += getInterpolationName(varying.interpolation)
                           + ' ' + inout + ' '
                           + gluVT.declareVariable(varying.type, varying.name) // TODO: only strings are needed for varyings.type and varyings.name
                           + ';\n';
            }
        }

        vtx.str  += '\nvoid main (void)\n{\n'
                 +  '\tgl_Position = a_position;\n';
        frag.str += '\nvoid main (void)\n{\n'
                 +  '\thighp vec4 res = vec4(0.0);\n';

        if (addPointSize) {
            vtx.str += '\tgl_PointSize = a_pointSize;\n';
        } else if (pointSizeRequired) {
            vtx.str += '\tgl_PointSize = 1.0;\n';
        }

        for (var i = 0; i < spec.getVaryings().length; ++i) {
        /** @type {string} */ var name = spec.getVaryings()[i].name;
        /** @type {gluVarType.VarType} */ var type = spec.getVaryings()[i].type;

            // TODO: check this loop, original code:
            // for (glu::VectorTypeIterator vecIter = glu::VectorTypeIterator::begin(&type); vecIter != glu::VectorTypeIterator::end(&type); vecIter++)
            for (var vecIter = new gluVTU.VectorTypeIterator(type); !vecIter.end(); vecIter.next()) {
            /** @type {gluVarType.VarType} */var subType = gluVTU.getVarType(type, vecIter.getPath());
            /** @type {string} */ var attribName = getAttributeName(name, vecIter.getPath());

                if (!(
                    subType.isBasicType() &&
                    deqpUtils.isDataTypeScalarOrVector(subType.getBasicType())
                )) throw new Error('Not a scalar or vector.');

                /* TODO: Fix converting type and vecIter to string */

                // Vertex: assign from attribute.
                vtx.str += '\t' + name + type + ' = ' + attribName + ';\n';

                // Fragment: add to res variable.
                var scalarSize = deqpUtils.getDataTypeScalarSize(subType.getBasicType());

                frag.str += '\tres += ';
                if (scalarSize == 1) frag.str += 'vec4(' + name + vecIter + ')';
                else if (scalarSize == 2) frag.str += 'vec2(' + name + vecIter + ').xxyy';
                else if (scalarSize == 3) frag.str += 'vec3(' + name + vecIter + ').xyzx';
                else if (scalarSize == 4) frag.str += 'vec4(' + name + vecIter + ')';

                frag.str += ';\n';
            }
        }

        frag.str += '\to_color = res * u_scale + u_bias;\n}\n';
        vtx.str += '}\n';

        return {
            vertSource: vtx.str,
            fragSource: frag.str
        };
    };

    /**
     * Returns a Shader program
     * @param {WebGLRenderingContext} gl WebGL context
     * @param {ProgramSpec} spec
     * @param {number} bufferMode
     * @param {deqpDraw.primitiveType} primitiveType GLenum that specifies what kind of primitive is
     * @return {deqpProgram.ShaderProgram}
     */
    var createVertexCaptureProgram = function(gl, spec, bufferMode, primitiveType) {

    /** @type {Object.<string, string>} */ var source = genShaderSources(spec, primitiveType === deqpDraw.primitiveType.POINTS /* Is point size required? */);

    /** @type {deqpProgram.ShaderProgram} */ var programSources = new deqpProgram.ProgramSources();
        programSources.add(new deqpProgram.VertexSource(source.vertSource))
                      .add(new deqpProgram.FragmentSource(source.fragSource))
                      .add(new deqpProgram.TransformFeedbackVaryings(spec.getTransformFeedbackVaryings()))
                      .add(new deqpProgram.TransformFeedbackMode(bufferMode));

        return new deqpProgram.ShaderProgram(gl, programSources);

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
        var dataTypeVec4 = gluVT.newTypeBasic(deqpUtils.DataType.FLOAT_VEC4, glsUBC.UniformFlags.PRECISION_HIGHP);
        attributes.push(new Attribute('a_position', dataTypeVec4, inputStride));
        inputStride += 4 * 4; /*sizeof(deUint32)*/

        if (usePointSize) {
            var dataTypeFloat = gluVT.newTypeBasic(deqpUtils.DataType.FLOAT, glsUBC.UniformFlags.PRECISION_HIGHP);
            attributes.push(new Attribute('a_pointSize', dataTypeFloat, inputStride));
            inputStride += 1 * 4; /*sizeof(deUint32)*/
        }

        for (var i = 0; i < varyings.length; i++) {
            // TODO: check loop's conditions
            // original code:
            // for (glu::VectorTypeIterator vecIter = glu::VectorTypeIterator::begin(&var->type); vecIter != glu::VectorTypeIterator::end(&var->type); vecIter++)

            for (var vecIter = gluVTU.VectorTypeIterator(varyings[i].type); !vecIter.end(); vecIter.next()) {
                var type = vecIter.getType(); // originally getType() in getVarType() within gluVARTypeUtil.hpp.
                var name = getAttributeName(varyings[i].name, vecIter.getPath); // TODO: getPath(), originally in gluVARTypeUtil.hpp

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
    var computeTransformFeedbackOutputs = function(gl, transformFeedbackOutputs, attributes, varyings, transformFeedbackVaryings, bufferMode) {

    /** @type {number} */ var accumulatedSize = 0;

        // transformFeedbackOutputs.resize(transformFeedbackVaryings.size());
        for (var varNdx = 0; varNdx < transformFeedbackVaryings.length; varNdx++)
        {
        /** @type {string} */ var name = transformFeedbackVaryings[varNdx];
        /** @type {number} */ var bufNdx = (bufferMode === gl.SEPARATE_ATTRIBS ? varNdx : 0);
        /** @type {number} */ var offset = (bufferMode === gl.SEPARATE_ATTRIBS ? 0 : accumulatedSize);
        /** @type {Output} */ var output = new Output();

            output.name = name;
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
                /** @type {string} */ var varName = gluVTU.parseVariableName(name);
                /** @type {Varying} */ var varying = findAttributeNameEquals(varyings, varName);

                var varPath = gluVTU.parseTypePath(name, varying.type);
                output.type = gluVTU.getVarType(varying.type, varPath);

                // Add all vectorized attributes as inputs.
                // TODO: check loop, original code:
                // for (glu::VectorTypeIterator iter = glu::VectorTypeIterator::begin(&output.type); iter != glu::VectorTypeIterator::end(&output.type); iter++)
                for (var iter = new gluVTU.VectorTypeIterator(output.type); !iter.end(); iter.next())
                {
                    /** @type {array} */     var fullpath   = varPath.concat(iter.getPath());
                    /** @type {string} */    var attribName = getAttributeName(varName, fullpath);
                    /** @type {Attribute} */ var attrib     = findAttributeNameEquals(attributes, attribName);
                    output.inputs.push(attrib);
                }
            }
            transformFeedbackOutputs.push(output);

            // TODO: getScalarSize() called correctly? already implemented in glsVarType.js
            accumulatedSize += output.type.getScalarSize() * 4; /*sizeof(deUint32)*/
        }
    };

    /**
     * @param {Attribute} attrib
     * @param {number} basePtr
     * @param {number} stride
     * @param {number} numElements
     * @param {deRandom} rnd
     */
    var genAttributeData = function(attrib, basePtr, stride, numElements, rnd) {

        /** @type {number} */ var elementSize = 4; /*sizeof(deUint32)*/
        /** @type {boolean} */ var isFloat = deqpUtils.isDataTypeFloatOrVec(attrib.type.getBasicType());
        /** @type {boolean} */ var isInt = deqpUtils.isDataTypeIntOrIVec(attrib.type.getBasicType());

        // TODO: below type glsUBC.UniformFlags ?
        /** @type {deqpUtils.precision} */ var precision = attrib.type.getPrecision(); // TODO: getPrecision() called correctly? implemented in glsVarType.js

        /** @type {number} */ var numComps = deqpUtils.getDataTypeScalarSize(attrib.type.getBasicType());

        for (var elemNdx = 0; elemNdx < numElements; elemNdx++)
        {
            for (var compNdx = 0; compNdx < numComps; compNdx++)
            {
                /** @type {number} */ var offset = attrib.offset + elemNdx * stride + compNdx * elementSize;
                if (isFloat)
                {
                    /** @type {number} */ var comp = basePtr + offset;
                    switch (precision)
                    {
                        case deqpUtils.precision.PRECISION_LOWP:
                            comp = 0.25 * rnd.getInt(0, 4);
                            break;
                        case deqpUtils.precision.PRECISION_MEDIUMP:
                            comp = rnd.getFloat(-1e3, 1e3);
                            break;
                        case deqpUtils.precision.PRECISION_HIGHP:
                            comp = rnd.getFloat(-1e5, 1e5);
                            break;
                        default:
                            DE_ASSERT(false);
                    }
                }
                else if (isInt)
                {
                    /** @type {number} */ var comp = basePtr + offset;
                    switch (precision)
                    {
                    // TODO: case deqpUtils.precision.PRECISION_LOWP: comp = rnd.getUint32() & 0xff << 24 >> 24;    break;
                    // TODO: case deqpUtils.precision.PRECISION_MEDIUMP:    comp = rnd.getUint32() & 0xffff << 16 >> 16; break;
                    // TODO: case deqpUtils.precision.PRECISION_HIGHP: comp = rnd.getUint32(); break;
                        default:
                            DE_ASSERT(false);
                    }
                }
            }
        }
    };

    /**
     * @param {Array.<Attribute>} attributes
     * @param {number} numInputs
     * @param {number} inputStride
     * @param {number} inputBasePtr
     * @param {deRandom} rnd
     */
    var genInputData = function(attributes, numInputs, inputStride, inputBasePtr, rnd) {

        // TODO: two first loops have been omitted
        // is declared 'ptr' --> deUint8* ptr = inputBasePtr + position.offset + inputStride*ndx;
        // and only used within these two loops

        // Random data for rest of components.
        for (var i = 0; i < attributes.length; i++)
        {
            if (attributes[i].name != 'a_position' && attributes[i].name != 'a_pointSize')
                genAttributeData(attributes[i], inputBasePtr, inputStride, numInputs, rnd);
        }
    };

    /**
     * Returns the number of outputs with the count for the Primitives in the Transform Feedback.
     * @param {deqpDraw.primitiveType} primitiveType GLenum that specifies what kind of primitive is
     * @param {number} numElements
     * @return {number}
     */
    var getTransformFeedbackOutputCount = function(primitiveType, numElements) {

    switch (primitiveType) {
        case deqpDraw.primitiveType.TRIANGLES: return numElements - numElements % 3;
        case deqpDraw.primitiveType.TRIANGLE_STRIP: return Math.max(0, numElements - 2) * 3;
        case deqpDraw.primitiveType.TRIANGLE_FAN: return Math.max(0, numElements - 2) * 3;
        case deqpDraw.primitiveType.LINES: return numElements - numElements % 2;
        case deqpDraw.primitiveType.LINE_STRIP: return Math.max(0, numElements - 1) * 2;
        case deqpDraw.primitiveType.LINE_LOOP: return numElements > 1 ? numElements * 2 : 0;
        case deqpDraw.primitiveType.POINTS: return numElements;
        default:
            throw new Error('Unrecognized primitiveType ' + primitiveType);
       }

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
        case gl.TRIANGLE_STRIP: return Math.max(0, numElements - 2);
        case gl.TRIANGLE_FAN: return Math.max(0, numElements - 2);
        case gl.LINES: return numElements - numElements / 2;
        case gl.LINE_STRIP: return Math.max(0, numElements - 1);
        case gl.LINE_LOOP: return numElements > 1 ? numElements : 0;
        case gl.POINTS: return numElements;
        default:
            throw new Error('Unrecognized primitiveType ' + primitiveType);
       }

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
        case gl.LINE_STRIP:
        case gl.LINE_LOOP:
            return gl.LINES;

        case gl.POINTS:
            return gl.POINTS;

        default:
            throw new Error('Unrecognized primitiveType ' + primitiveType);
       }

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

        default:
            throw new Error('Unrecognized primitiveType ' + primitiveType);
       }

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

    /** @type {boolean} */ var isOk = true;
    /** @type {number} */ var outOffset = output.offset;

        for (var attrNdx = 0; attrNdx < output.inputs.length; attrNdx++)
        {
        /** @type {Attribute} */ var attribute = output.inputs[attrNdx];
        /** @type {deqpUtils.DataType} */ var type = attribute.type;
        /** @type {number} */ var numComponents = deqpUtils.getDataTypeScalarSize(type);

        // TODO: below type glsUBC.UniformFlags ?
        /** @type {deqpUtils.precision} */ var precision = attribute.type.getPrecision(); // TODO: getPrecision() called correctly? implemented in gluVarType.js

        /** @type {string} */ var scalarType = deqpUtils.getDataTypeScalarType(type);
        /** @type {number} */ var numOutputs = getTransformFeedbackOutputCount(primitiveType, numInputs);

            for (var outNdx = 0; outNdx < numOutputs; outNdx++)
            {
            /** @type {number} */ var inNdx = getAttributeIndex(primitiveType, numInputs, outNdx);

                for (var compNdx = 0; compNdx < numComponents; compNdx++)
                {
                /** @type {number} */ var inPtr = inBasePtr + inStride * inNdx + attribute.offset + compNdx * 4; /*sizeof(deUint32)*/
                /** @type {number} */ var outPtr = outBasePtr + outStride * outNdx + outOffset + compNdx * 4; /*sizeof(deUint32)*/
                /** @type {boolean} */ var isEqual = false;
                /** @type {number} */ var difInOut = inPtr - outPtr;

                    if (scalarType === 'float')
                    {
                        // ULP comparison is used for highp and mediump. Lowp uses threshold-comparison.
                        switch (precision)
                        {
                            case deqpUtils.precision.PRECISION_HIGHP: // or case glsUBC.UniformFlags.PRECISION_HIGHP: ?
                            {
                                isEqual = Math.abs(difInOut) < 2;
                                break;
                            }

                            case deqpUtils.precision.PRECISION_MEDIUMP: // or case glsUBC.UniformFlags.PRECISION_MEDIUMP: ?
                            {
                                isEqual = Math.abs(difInOut) < 2 + (1 << 13);
                                break;
                            }

                            case deqpUtils.precision.PRECISION_LOWP: // or case glsUBC.UniformFlags.PRECISION_LOWP: ?
                            {
                                isEqual = Math.abs(difInOut) < 0.1;
                                break;
                            }
                            default:
                                DE_ASSERT(false);
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

    /**
     * Returns (for all the draw calls) the type of Primitive Mode, as it calls "getTransformFeedbackPrimitiveCount".
     * @param {WebGLRenderingContext} gl WebGL context
     * @param {deqpDraw.primitiveType} primitiveType GLenum that specifies what kind of primitive is
     * @param {Object.<number, boolean>} array DrawCall object
     * @return {number} primCount
     */
    var computeTransformFeedbackPrimitiveCount = function(gl, primitiveType, array) {

    /** @type {number} */ var primCount = 0;

        for (var i = 0; i < array.length; ++ i) {

            if (array.transformFeedbackEnabled)
            primCount += getTransformFeedbackPrimitiveCount(gl, primitiveType, array.numElements);
        }

        return primCount;
    };

    /**
     * @param {WebGLRenderingContext} context gl WebGL context
     * @param {number} target
     * @param {number} bufferSize
     * @param {number} guardSize
     */
    var writeBufferGuard = function(gl, target, bufferSize, guardSize) {
        // TODO: implement
    };

    /**
     * Verifies guard
     * @param {Array.<number>} buffer
     * @return {boolean}
     */
    var verifyGuard = function(buffer) {
        for (var i = 0; i < buffer.length; i++)
        {
            if (buffer[i] != 0xcd)
                return false;
        }
        return true;
    };

    /**
     * It is a child class of the orignal C++ TestCase
     * @param {WebGLRenderingContext} context gl WebGL context
     * @param {string} name
     * @param {string} desc
     * @param {number} bufferMode
     * @param {deqpDraw.primitiveType} primitiveType GLenum that specifies what kind of primitive is
     */
    var TransformFeedbackCase = (function(context, name, desc, bufferMode, primitiveType) {

        this._construct = function(context, name, desc, bufferMode, primitiveType) {
            if (
                typeof(context) !== 'undefined' &&
                typeof(name) !== 'undefined' &&
                typeof(desc) !== 'undefined' &&
                typeof(bufferMode) !== 'undefined' &&
                typeof(primitiveType) !== 'undefined'
            ) {
                deqpTests.DeqpTest.call(this, name, description);
                this.m_gl = context;
                this.m_bufferMode = bufferMode;
                this.m_primitiveType = primitiveType;
		        this.m_progSpec = new ProgramSpec();
            }
        };

        this.init = function() {
        //  var log = this.m_testCtx.getLog(); // TestLog&
            var gl = this.m_gl; // const glw::Functions&

            if (this.m_program != null) { throw new Error('this.m_program isnt null.'); }
            this.m_program = createVertexCaptureProgram(
                gl,
                this.m_progSpec,
                this.m_bufferMode,
                this.m_primitiveType
            );

            bufferedLogToConsole(this.m_program);

            if (!this.m_program.isOk()) {

                var linkFail = this.m_program.shadersOK &&
                               !this.m_program.getProgramInfo().linkOk;

                if (linkFail) {
                    if (!isProgramSupported(gl, this.m_progSpec, this.m_bufferMode)) {
                        throw new Error('Not Supported. Implementation limits exceeded.');
                    } else if (hasArraysInTFVaryings(this.m_progSpec)) {
                        throw new Error('Capturing arrays is not supported (undefined in specification)');
                    } else {
                        throw new Error('Link failed');
                    }
                } else {
                    throw new Error('Compile failed');
                }
            }

//          bufferedLogToConsole('Transform feedback varyings: ' + tcu.formatArray(this.m_progSpec.getTransformFeedbackVaryings()));
            bufferedLogToConsole('Transform feedback varyings: ' + this.m_progSpec.getTransformFeedbackVaryings());

            // Print out transform feedback points reported by GL.
    	    // bufferedLogToConsole('Transform feedback varyings reported by compiler:');
            //logTransformFeedbackVaryings(log, gl, this.m_program.getProgram());

            // Compute input specification.
            computeInputLayout(this.m_attributes, this.m_inputStride, this.m_progSpec.getVaryings(), this.m_progSpec.isPointSizeUsed());

            // Build list of varyings used in transform feedback.
            computeTransformFeedbackOutputs(
            	this.m_gl,
                this.m_transformFeedbackOutputs, // TODO: make sure this param is working as intended
                this.m_attributes,
                this.m_progSpec.getVaryings(),
                this.m_progSpec.getTransformFeedbackVaryings(),
                this.m_bufferMode
            );
            if (!this.m_transformFeedbackOutputs.length) {
                throw new Error('transformFeedbackOutputs cannot be empty.');
            }

            if (this.m_bufferMode == gl.SEPARATE_ATTRIBS) {
                for (var i = 0; i < this.m_transformFeedbackOutputs.length; ++i) {
                    this.m_bufferStrides.push(this.m_transformFeedbackOutputs[i].type.getScalarSize() * 4 /*sizeof(deUint32)*/);
                }
            } else {
                var totalSize = 0;
                for (var i = 0; i < this.m_transformFeedbackOutputs.length; ++i) {
                    totalSize += this.m_transformFeedbackOutputs[i].type.getScalarSize() * 4 /*sizeof(deUint32)*/;
                }
                this.m_bufferStrides.push(totalSize);
            }

            // \note Actual storage is allocated in iterate().
        //    this.m_outputBuffers.resize(this.m_bufferStrides.size()); //                  <-- not needed in JS
        //    gl.genBuffers(this.m_outputBuffers.length, this.m_outputBuffers); // TODO:    <-- rework

            DE_ASSERT(!this.m_transformFeedback);
            if (this.m_transformFeedback != null) {
                throw new Error('transformFeedback is already set.');
            }
            this.m_transformFeedback = gl.createTransformFeedback();

            GLU_EXPECT_NO_ERROR(gl, gl.getError(), 'init');

            this.m_iterNdx = 0;
            testPassed("Pass");
//          this.m_testCtx.setTestResult(QP_TEST_RESULT_PASS, 'Pass');

        };
        this.deinit = function() {

            var gl = this.m_gl;

            if (!this.m_outputBuffers.empty()) {
            //    gl.deleteBuffers((glw::GLsizei)this.m_outputBuffers.size(), &this.m_outputBuffers[0]); // TODO: rework
                this.m_outputBuffers.clear();
            }

        //    delete this.m_transformFeedback;
            this.m_transformFeedback = null;

        //    delete this.m_program;
            this.m_program = null;

            // Clean up state.
            this.m_attributes.clear();
            this.m_transformFeedbackOutputs.clear();
            this.m_bufferStrides.clear();
            this.m_inputStride = 0;

        };

        this.iterate = function() {

            // static vars
            var s = TransformFeedbackCase.s_iterate;

//          var log = this.m_textCtx.getLog();
            var isOk = true;
            var seed = /*deString.deStringHash(getName()) ^ */ deMath.deMathHash(this.m_iterNdx);
            var numIterations = TransformFeedbackCase.s_iterate.iterations.length;
            // first and end ignored.

            var sectionName = 'Iteration' + (this.m_iterNdx + 1);
            var sectionDesc = 'Iteration ' + (this.m_iterNdx + 1) + ' / ' + numIterations;
//            var section; // something weird.

            bufferedLogToConsole('Testing ' +
                s.testCases[s.iterations[this.m_iterNdx]].length +
                ' draw calls, (element count, TF state): ' +
            //  tcu.formatArray(
                    s.testCases[s.iterations[this.m_iterNdx]]
            //  )
            );

            isOk = this.runTest(s.testCases[s.iterations[this.m_iterNdx]], seed);

            if (!isOk) {
                // fail the test
                testFailedOptions('Result comparison failed', false);
//              this.m_testCtx.setTestResult(QP_TEST_RESULT_FAIL, 'Result comparison failed');
            }

            this.m_iterNdx += 1;

            return (isOk && this.m_iterNdx < numIterations)
                   ? deqpTests.runner.IterateResult.CONTINUE
                   : deqpTests.runner.IterateResult.STOP;

        };

        /* protected */
        this.m_bufferMode = null;
        this.m_primitiveType = null;

        /* private */
    //    var assign = function(/*const*/ other) { }; // defined but not implemented?
        this.runTest = function(calls, seed) {

            var _min = function(x, y) { return x < y ? x : y; };

        //  var log = this.m_testCtx.getLog();
        	var gl = this.m_gl;
            var rnd = new deRandom.Random(seed);
            var numInputs = 0;
            var numOutputs = 0;
            var width = gl.drawingBufferWidth;
            var height = gl.drawingBufferHeight;
            var viewportW = _min(VIEWPORT_WIDTH, width);
            var viewportH = _min(VIEWPORT_HEIGHT, height);
            var viewportX = rnd.getInt(0, width - viewportW);
            var viewportY = rnd.getInt(0, height - viewportH);
            var frameWithTf = new tcuSurface.Surface(viewportW, viewportH); // tcu::Surface
            var frameWithoutTf = new tcuSurface.Surface(viewportW, viewportH); // tcu::Surface
            var primitiveQuery = gl.createQuery();
            var outputsOk = true;
            var imagesOk = true;
            var queryOk = true;

            // Compute totals.
            for (var i = 0; i < calls.length; ++i) {
                var call = calls[i];
                numInputs += call.numElements;
                numOutputs += call.transformFeedbackEnabled ? getTransformFeedbackOutputCount(this.m_primitiveType, call.numElements) : 0;
            }

            // Input data.
            var inputData = genInputData(this.m_attributes, numInputs, this.m_inputStride, rnd);

            gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this.m_transformFeedback);
            GLU_EXPECT_NO_ERROR(gl, gl.getError(), 'glBindTransformFeedback()');

            // Allocate storage for transform feedback output buffers and bind to targets.
            for (var bufNdx = 0; bufNdx < this.m_outputBuffers.length; ++bufNdx) {
                var buffer    = this.m_outputBuffers[bufNdx]; // deUint32
                var stride    = this.m_bufferStrides[bufNdx]; // int
                var target    = bufNdx; // int
                var size      = stride * numOutputs; // int
                var guardSize = stride * BUFFER_GUARD_MULTIPLIER; // int
                var usage     = gl.DYNAMIC_READ; // const deUint32

                gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, buffer);
                gl.bufferData(gl.TRANSFORM_FEEDBACK_BUFFER, size + guardSize, 0, usage);
                writeBufferGuard(gl, gl.TRANSFORM_FEEDBACK_BUFFER, size, guardSize);

                // \todo [2012-07-30 pyry] glBindBufferRange()?
                gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, target, buffer);

                GLU_EXPECT_NO_ERROR(gl, gl.getError(), 'transform feedback buffer setup');
            }

            // Setup attributes.
            for (var i = 0; i < this.m_attributes.length; ++i) {
                var attrib = this.m_attributes[i];
                var loc = gl.getAttribLocation(this.m_program.getProgram(), attrib.name);
                /** @type {string} */
                var scalarType = deqpUtils.getDataTypeScalarType(attrib.type.getBasicType());
                /** @type {number} */
                var numComponents = deqpUtils.getDataTypeScalarSize(attrib.type.getBasicType());

                if (loc >= 0) {
                    gl.enableVertexAttribArray(loc);
                    var type = null;
                    switch (scalarType) {
                        case glu.TYPE_FLOAT: type = gl.FLOAT; break;
                        case glu.TYPE_INT: type = gl.INT;break;
                        case glu.TYPE_UINT: type = gl.UNSIGNED_INT; break;
                    }
                    if (type !== null) {
                        gl.vertexAttribPointer(loc, numComponents, type, gl.FALSE, this.m_inputStride, attrib.offset());
                    }
                }
            }

            // Setup viewport.
            gl.viewport(viewportX, viewportY, viewportW, viewportH);

            // Setup program.
            gl.useProgram(this.m_program.getProgram());

            gl.uniform4fv(
                gl.getUniformLocation(this.m_program.getProgram(), 'u_scale'),
                1, [0.01, 0.01, 0.01, 0.01]
            );
            gl.uniform4fv(
                gl.getUniformLocation(this.m_program.getProgram(), 'u_bias'),
                1, [0.5, 0.5, 0.5, 0.5]
            );

            // Enable query.
            gl.beginQuery(gl.TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN, primitiveQuery);
            GLU_EXPECT_NO_ERROR(gl, gl.getError(), 'glBeginQuery(GL_TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN)');

            // Draw
            (function() {
                var offset = 0;
                var tfEnabled = true;

                gl.clear(gl.COLOR_BUFFER_BIT);

                gl.beginTransformFeedback(getTransformFeedbackPrimitiveMode(this.m_primitiveType));

                for (var i = 0; i < calls.length; ++i) {
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

                    gl.drawArrays(this.m_primitiveType, offset, call.numElements);
                    offset += call.numElements;
                }

                // Resume feedback before finishing it.
                if (!tfEnabled)
                    gl.resumeTransformFeedback();

                gl.endTransformFeedback();
                GLU_EXPECT_NO_ERROR(gl, gl.getError(), 'render');
            })();
            
            gl.endQuery(gl.TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN);
            GLU_EXPECT_NO_ERROR(gl, gl.getError(), 'glEndQuery(GL_TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN)');

            // Check and log query status right after submit
            (function() {
                var available = gl.FALSE; // deUint32
                available = gl.getQueryParameter(primitiveQuery, gl.QUERY_RESULT_AVAILABLE);
                GLU_EXPECT_NO_ERROR(gl, gl.getError(), 'getQueryParameter()'); // formerly glGetQueryObjectuiv()

                bufferedLogToConsole('GL_TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN status after submit: ' +
                    (available != gl.FALSE ? 'GL_TRUE' : 'GL_FALSE'));
            })();

            // Compare result buffers.
            for (var bufferNdx = 0; bufferNdx < this.m_outputBuffers.length; ++bufferNdx) {
                var stride    = this.m_bufferStrides[bufferNdx];        // int
                var size      = stride * numOutputs;               // int
                var guardSize = stride * BUFFER_GUARD_MULTIPLIER;  // int
                var buffer    = new ArrayBuffer(size + guardSize); // const void*

                // Bind buffer for reading.
                gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, this.m_outputBuffers[bufferNdx]);

                gl.getBufferSubData(gl.TRANSFORM_FEEDBACK_BUFFER, 0, buffer); // (spec says to use ArrayBufferData)
                GLU_EXPECT_NO_ERROR(gl, gl.getError(), 'mapping buffer');

                // Verify all output variables that are written to this buffer.
                for (var i = 0; i < this.m_transformFeedbackOutputs.length; ++i) {
                    var out = this.m_transformFeedbackOutputs[i];

                    if (out.bufferNdx != bufferNdx)
                        continue;

                    var inputOffset = 0;
                    var outputOffset = 0;

                    // Process all draw calls and check ones with transform feedback enabled
                    for (var callNdx = 0; callNdx < calls.length; ++callNdx) {
                        var call = calls[callNdx];

                        if (call.transformFeedbackEnabled) {
                            var inputPtr = inputData[0] + inputOffset * this.m_inputStride; // const deUint8*
                            var outputPtr = outputOffset * stride; // const deUint8*

                            if (!compareTransformFeedbackOutput(this.m_primitiveType, out, call.numElements, inputPtr, this.m_inputStride, outputPtr, stride)) {
                                outputsOk = false;
                                break;
                            }
                        }

                        inputOffset += call.numElements;
                        outputOffset += call.transformFeedbackEnabled ? getTransformFeedbackOutputCount(this.m_primitiveType, call.numElements) : 0;

                    }
                }

                // Verify guardband.
                if (!verifyGuard(buffer)) {
                    bufferedLogToConsole('Error: Transform feedback buffer overrun detected');
                    outputsOk = false;
                }

            //    Javascript, and lazy memory management
            //    gl.unmapBuffer(GL_TRANSFORM_FEEDBACK_BUFFER);

            }

            // Check status after mapping buffers.
            (function() {

                var mustBeReady = this.m_outputBuffers.length > 0; // Mapping buffer forces synchronization. // const bool
                var expectedCount = computeTransformFeedbackPrimitiveCount(gl, this.m_primitiveType, calls); // const int
                var available = gl.FALSE; // deUint32
                var numPrimitives = 0; // deUint32

                available = gl.getQueryParameter(primitiveQuery, gl.QUERY_RESULT_AVAILABLE);
                numPrimitives = gl.getQueryParameter(primitiveQuery, gl.QUERY_RESULT);
                GLU_EXPECT_NO_ERROR(gl, gl.getError(), 'getQueryParameter()'); // formerly getQueryObjectuiv()

                if (!mustBeReady && available == gl.FALSE) {

                    bufferedLogToConsole('ERROR: GL_TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN result not available after mapping buffers!');
                    queryOk = false;
                }

                bufferedLogToConsole('GL_TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN = ' + numPrimitives);

                if (numPrimitives != expectedCount) {
                    bufferedLogToConsole('ERROR: Expected ' + expectedCount + ' primitives!');
                    queryOk = false;
                }
            })();

            // Clear transform feedback state.
            gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, 0);
            for (var bufNdx = 0; bufNdx < this.m_outputBuffers.length; ++bufNdx) {
                gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, 0);
                gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, bufNdx, 0);
            }

            // Read back rendered image.
            glu.readPixels(gl, viewportX, viewportY, frameWithTf.getAccess());

            // Render without transform feedback.
            (function (){
                var offset = 0; // int

                gl.clear(gl.COLOR_BUFFER_BIT);

                for (var i = 0; i < calls.length; ++i) {
                    var call = calls[i];
                    gl.drawArrays(this.m_primitiveType, offset, call.numElements);
                    offset += call.numElements;
                }

                GLU_EXPECT_NO_ERROR(gl, gl.getError(), 'render');
                glu.readPixels(gl, viewportX, viewportY, frameWithoutTf.getAccess());
            })();

            // Compare images with and without transform feedback.
            imagesOk = tcuPixelThresholdCompare.pixelThresholdCompare('Result', 'Image comparison result', frameWithoutTf, frameWithTf, [1,1,1,1], tcuPixelThresholdCompare.CompareLogMode.ON_ERROR);

            if (imagesOk) {
                bufferedLogToConsole('Rendering result comparison between TF enabled and TF disabled passed.');
            } else {
                bufferedLogToConsole('ERROR: Rendering result comparison between TF enabled and TF disabled failed!');
            }

            return outputsOk && imagesOk && queryOk;

        }; // runTest();

        // Derived from ProgramSpec in init()
        this.m_inputStride       = 0;
        this.m_attributes        = [];    // vector<Attribute>
        this.m_transformFeedbackOutputs = []; // vector<Output>
        this.m_bufferStrides     = [];    // vector<int>

        // GL state.
        this.m_program           = null;  // glu::ShaderProgram
        this.m_transformFeedback = null;  // glu::TransformFeedback
        this.m_outputBuffers     = [];    // vector<deUint32>

        this.m_iterNdx           = 0;     // int
        
//      this.m_context = this.getState();
        this.m_gl                = null;  // render context   

        this._construct(context, name, desc, bufferMode, primitiveType);

    });
    // static data
    TransformFeedbackCase.s_iterate = {
        testCases: {
            elemCount1:   [DrawCall(  1, true )],
            elemCount2:   [DrawCall(  2, true )],
            elemCount3:   [DrawCall(  3, true )],
            elemCount4:   [DrawCall(  4, true )],
            elemCount123: [DrawCall(123, true )],
            basicPause1:  [DrawCall( 64, true ), DrawCall( 64, false), DrawCall( 64, true)],
            basicPause2:  [DrawCall( 13, true ), DrawCall(  5, true ), DrawCall( 17, false),
                           DrawCall(  3, true ), DrawCall(  7, false)],
            startPaused:  [DrawCall(123, false), DrawCall(123, true )],
            random1:      [DrawCall( 65, true ), DrawCall(135, false), DrawCall( 74, true),
                           DrawCall( 16, false), DrawCall(226, false), DrawCall(  9, true),
                           DrawCall(174, false)],
            random2:      [DrawCall(217, true ), DrawCall(171, true ), DrawCall(147, true),
                           DrawCall(152, false), DrawCall( 55, true )]
        },
        iterations: [
            'elemCount1',  'elemCount2',  'elemCount3', 'elemCount4', 'elemCount1234',
            'basicPause1', 'basicPause2', 'startPaused',
            'random1',     'random2'
        ]
    };

    TransformFeedbackCase.prototype = new deqpTests.DeqpTest();

    var hasArraysInTFVaryings = (function(spec) {
    
        for (var i = 0 ; i < spec.getTransformFeedbackVaryings().length ; ++i) {
            var tfVar = spec.getTransformFeedbackVaryings()[i];
            var varName = gluVTU.parseVariableName(tfVar);
            
            if (findAttributeNameEquals(spec.getVaryings(), varName)) return true;
        }
        return false;
    
    });



    /** PositionCase
     * It is a child class of TransformFeedbackCase
     * @param {WebGLRenderingContext} context gl WebGL context
     * @param {string} name
     * @param {string} desc
     * @param {number} bufferMode
     * @param {deqpDraw.primitiveType} primitiveType GLenum that specifies what kind of primitive is
     */
    var PositionCase = (function(context, name, desc, bufferMode, primitiveType) {

        this._construct(context, name, desc, bufferMode, primitiveType);
        this.m_progSpec.addTransformFeedbackVarying('gl_Position');

        // this.init(); //TODO: call init()?

    });

    PositionCase.prototype = new TransformFeedbackCase();

    /** PointSizeCase
     * It is a child class of TransformFeedbackCase
     * @param {WebGLRenderingContext} context gl WebGL context
     * @param {string} name
     * @param {string} desc
     * @param {number} bufferMode
     * @param {deqpDraw.primitiveType} primitiveType GLenum that specifies what kind of primitive is
     */
    var PointSizeCase = (function(context, name, desc, bufferMode, primitiveType) {

        this._construct(context, name, desc, bufferMode, primitiveType);
        this.m_progSpec.addTransformFeedbackVarying('gl_PointSize');
        // this.init(); //TODO: call init()?

    });

    PointSizeCase.prototype = new TransformFeedbackCase();

    /** BasicTypeCase
     * It is a child class of TransformFeedbackCase
     * @param {WebGLRenderingContext} context gl WebGL context
     * @param {string} name
     * @param {string} desc
     * @param {number} bufferMode
     * @param {deqpDraw.primitiveType} primitiveType GLenum that specifies what kind of primitive is
     * @param {gluVT.VarType} type
     * @param {deqpUtils.precision} precision
     * @param {interpolation} interpolation enum number in this javascript
     */
    var BasicTypeCase = (function(context, name, desc, bufferMode, primitiveType, type, precision, interpolation) {

        this._construct(context, name, desc, bufferMode, primitiveType);

        this.m_progSpec.addVarying('v_varA', gluVT.newTypeBasic(type, precision), interpolation);
        this.m_progSpec.addVarying('v_varB', gluVT.newTypeBasic(type, precision), interpolation);

        this.m_progSpec.addTransformFeedbackVarying('v_varA');
        this.m_progSpec.addTransformFeedbackVarying('v_varB');
        // this.init(); //TODO: call init()?

    });

    BasicTypeCase.prototype = new TransformFeedbackCase();

    /** BasicArrayCase
     * It is a child class of TransformFeedbackCase
     * @param {WebGLRenderingContext} context gl WebGL context
     * @param {string} name
     * @param {string} desc
     * @param {number} bufferMode
     * @param {deqpDraw.primitiveType} primitiveType GLenum that specifies what kind of primitive is
     * @param {gluVT.VarType} type
     * @param {deqpUtils.precision} precision
     * @param {interpolation} interpolation enum number in this javascript
     */
    var BasicArrayCase = (function(context, name, desc, bufferMode, primitiveType, type, precision, interpolation) {

        this._construct(context, name, desc, bufferMode, primitiveType);

        if (deqpUtils.isDataTypeMatrix(type) || this.m_bufferMode === this.m_gl.SEPARATE_ATTRIBS)
        {
            // note For matrix types we need to use reduced array sizes or otherwise we will exceed maximum attribute (16)
            // or transform feedback component count (64).
            // On separate attribs mode maximum component count per varying is 4.
            this.m_progSpec.addVarying('v_varA', gluVT.newTypeArray(gluVT.newTypeBasic(type, precision), 1), interpolation);
            this.m_progSpec.addVarying('v_varB', gluVT.newTypeArray(gluVT.newTypeBasic(type, precision), 2), interpolation);
        }
        else
        {
            this.m_progSpec.addVarying('v_varA', gluVT.newTypeArray(gluVT.newTypeBasic(type, precision), 3), interpolation);
            this.m_progSpec.addVarying('v_varB', gluVT.newTypeArray(gluVT.newTypeBasic(type, precision), 4), interpolation);
        }

        this.m_progSpec.addTransformFeedbackVarying('v_varA');
        this.m_progSpec.addTransformFeedbackVarying('v_varB');
        // this.init(); //TODO: call init()?

    });

    BasicArrayCase.prototype = new TransformFeedbackCase();

    /** ArrayElementCase
     * It is a child class of TransformFeedbackCase
     * @param {WebGLRenderingContext} context gl WebGL context
     * @param {string} name
     * @param {string} desc
     * @param {number} bufferMode
     * @param {deqpDraw.primitiveType} primitiveType GLenum that specifies what kind of primitive is
     * @param {gluVT.VarType} type
     * @param {deqpUtils.precision} precision
     * @param {interpolation} interpolation enum number in this javascript
     */
    var ArrayElementCase = (function(context, name, desc, bufferMode, primitiveType, type, precision, interpolation) {

        this._construct(context, name, desc, bufferMode, primitiveType);

        this.m_progSpec.addVarying('v_varA', gluVT.newTypeBasic(type, precision), interpolation);
        this.m_progSpec.addVarying('v_varB', gluVT.newTypeBasic(type, precision), interpolation);

        this.m_progSpec.addTransformFeedbackVarying('v_varA[1]');
        this.m_progSpec.addTransformFeedbackVarying('v_varB[0]');
        this.m_progSpec.addTransformFeedbackVarying('v_varB[3]');

        // this.init(); //TODO: call init()?

    });

    ArrayElementCase.prototype = new TransformFeedbackCase();

    /** RandomCase
     * It is a child class of TransformFeedbackCase
     * @param {WebGLRenderingContext} context gl WebGL context
     * @param {string} name
     * @param {string} desc
     * @param {number} bufferMode
     * @param {deqpDraw.primitiveType} primitiveType GLenum that specifies what kind of primitive is
     * @param {number} seed
     */

    var RandomCase = (function(context, name, desc, bufferMode, primitiveType, seed) {

        this._construct(context, name, desc, bufferMode, primitiveType);

        // TODO: unfinished, same implementation in TransformFeedbackCase.iterate
        // var seed = this.iterate.seed; // TODO: possible solution as a local attribute?
        /** @type {number} */
        var seed = /*deString.deStringHash(getName()) ^ */ deMath.deMathHash(this.m_iterNdx);

        /** @type {Array.<deqpUtils.DataType>} */
        var typeCandidates = [
            deqpUtils.DataType.FLOAT,
            deqpUtils.DataType.FLOAT_VEC2,
            deqpUtils.DataType.FLOAT_VEC3,
            deqpUtils.DataType.FLOAT_VEC4,
            deqpUtils.DataType.INT,
            deqpUtils.DataType.INT_VEC2,
            deqpUtils.DataType.INT_VEC3,
            deqpUtils.DataType.INT_VEC4,
            deqpUtils.DataType.UINT,
            deqpUtils.DataType.UINT_VEC2,
            deqpUtils.DataType.UINT_VEC3,
            deqpUtils.DataType.UINT_VEC4,

            deqpUtils.DataType.FLOAT_MAT2,
            deqpUtils.DataType.FLOAT_MAT2X3,
            deqpUtils.DataType.FLOAT_MAT2X4,

            deqpUtils.DataType.FLOAT_MAT3X2,
            deqpUtils.DataType.FLOAT_MAT3,
            deqpUtils.DataType.FLOAT_MAT3X4,

            deqpUtils.DataType.FLOAT_MAT4X2,
            deqpUtils.DataType.FLOAT_MAT4X3,
            deqpUtils.DataType.FLOAT_MAT4
        ];

        // TODO: could we use /** @type {Array.<glsUBC.UniformFlags>} */ instead ???
        /** @type {Array.<deqpUtils.precision>} */
        var precisions = [

            deqpUtils.precision.PRECISION_LOWP,
            deqpUtils.precision.PRECISION_MEDIUMP,
            deqpUtils.precision.PRECISION_HIGHP

            // glsUBC.UniformFlags.PRECISION_LOW,
            // glsUBC.UniformFlags.PRECISION_MEDIUM,
            // glsUBC.UniformFlags.PRECISION_HIGH
        ];

        /** @type {Array.<string, interpolation>} */
        var interpModes = [
            {name: 'smooth', interp: interpolation.SMOOTH},
            {name: 'flat', interp: interpolation.FLAT},
            {name: 'centroid', interp: interpolation.CENTROID}
        ];

        /** @type {number} */  var maxAttributeVectors      = 16;
       //** @type {number} */  var maxTransformFeedbackComponents    = 64; // note It is enough to limit attribute set size.
        /** @type {boolean} */ var isSeparateMode           = (this.m_bufferMode === this.m_gl.SEPARATE_ATTRIBS);
        /** @type {number} */  var maxTransformFeedbackVars = isSeparateMode ? 4 : maxAttributeVectors;
        /** @type {number} */  var arrayWeight              = 0.3;
        /** @type {number} */  var positionWeight           = 0.7;
        /** @type {number} */  var pointSizeWeight          = 0.1;
        /** @type {number} */  var captureFullArrayWeight   = 0.5;

        /** @type {deRandom.deRandom} */
                               var rnd                      = new deRandom.Random(seed);
        /** @type {boolean} */ var usePosition              = rnd.getFloat() < positionWeight;
        /** @type {boolean} */ var usePointSize             = rnd.getFloat() < pointSizeWeight;
        /** @type {number} */  var numAttribVectorsToUse    = rnd.getInt(
            1, maxAttributeVectors - 1/*position*/ - (usePointSize ? 1 : 0)
        );

        /** @type {number} */  var numAttributeVectors      = 0;
        /** @type {number} */  var varNdx                   = 0;

        // Generate varyings.
        while (numAttributeVectors < numAttribVectorsToUse)
        {
            /** @type {number} */
            var maxVecs = isSeparateMode ? Math.min(2 /*at most 2*mat2*/, numAttribVectorsToUse - numAttributeVectors) : numAttribVectorsToUse - numAttributeVectors;
            /** @type {deqpUtils.DataType} */
            var begin   = typeCandidates[0];
            /** @type {number} */
            var endCandidates = begin + (
                maxVecs >= 4 ? 21 : (
                    maxVecs >= 3 ? 18 : (
                        maxVecs >= 2 ? (isSeparateMode ? 13 : 15) : 12
                    )
                )
            );
            /** @type {deqpUtils.DataType} */
            var end = typeCandidates[endCandidates];

            /** @type {deqpUtils.DataType} */
            var type = rnd.choose(typeCandidates)[0];
            
            /** @type {glsUBC.UniformFlags | deqpUtils.precision} */
            var precision = rnd.choose(precisions)[0];
            
            /** @type {interpolation} */ // TODO: implement
            var interp = deqpUtils.getDataTypeScalarType(type) === deqpUtils.DataType.FLOAT
                       ? rnd.choose(interpModes)
                       : interpolation.FLAT; 
            
            /** @type {number} */
            var numVecs     = deqpUtils.isDataTypeMatrix(type) ? deqpUtils.getDataTypeMatrixNumColumns(type) : 1;
            /** @type {number} */
            var numComps    = deqpUtils.getDataTypeScalarSize(type);
            /** @type {number} */
            var maxArrayLen = Math.max(1, isSeparateMode ? (4 / numComps) : (maxVecs / numVecs));
            /** @type {boolean} */
            var useArray    = rnd.getFloat() < arrayWeight;
            /** @type {number} */
            var arrayLen    = useArray ? rnd.getInt(1, maxArrayLen) : 1;
            /** @type {string} */
            var name        = 'v_var' + varNdx; // TODO: check varNdx.toString() omitted?

            if (useArray)
                this.m_progSpec.addVarying(name, gluVT.newTypeArray(gluVT.newTypeBasic(type, precision), arrayLen), interp);
            else
                this.m_progSpec.addVarying(name, gluVT.newTypeBasic(type, precision), interp);

            numAttributeVectors += arrayLen * numVecs;
            varNdx += 1;
        }

        // Generate transform feedback candidate set.
        /** @type {Array.<string>} */ var tfCandidates =[];

        if (usePosition) tfCandidates.push('gl_Position');
        if (usePointSize) tfCandidates.push('gl_PointSize');

        for (var ndx = 0; ndx < varNdx; ndx++)
        {
            /** @type {Varying} */
            var varying = this.m_progSpec.getVaryings()[ndx];

            if (varying.type.isArrayType())
            {
                /** @type {boolean} */
                var captureFull = rnd.getFloat() < captureFullArrayWeight;

                if (captureFull)
                {
                    tfCandidates.push(varying.name);
                }
                else
                {
                    /** @type {number} */
                    var numElem = varying.type.getArraySize();
                    for (var elemNdx = 0; elemNdx < numElem; elemNdx++)
                        tfCandidates.push(varying.name + '[' + elemNdx + ']'); // TODO: check elemNdx.toString() omitted?
                }
            }
            else
                tfCandidates.push(varying.name);
        }

        // Pick random selection.
//        vector<string> tfVaryings(Math.min(tfCandidates.length, maxTransformFeedbackVars)); // TODO: implement
//        rnd.choose(tfCandidates.begin(), tfCandidates.end(), tfVaryings.begin(), (int)tfVaryings.size()); // TODO: implement
//        rnd.shuffle(tfVaryings.begin(), tfVaryings.end()); // TODO: implement

//        for (vector<string>::const_iterator vary = tfVaryings.begin(); vary != tfVaryings.end(); vary++)
//            this.m_progSpec.addTransformFeedbackVarying(vary.c_str());

        // this.init();

    });

    RandomCase.prototype = new TransformFeedbackCase();

    /**
     * Creates the test in order to be executed
    **/
    var init = function(context) {

        /** @const @type {deqpTests.DeqpTest} */
        var testGroup = deqpTests.runner.getState().testCases;

        /** @type {Array.<string, number>} */
        var bufferModes = [
            {name: 'separate', mode: context.SEPARATE_ATTRIBS},
            {name: 'interleaved', mode: context.INTERLEAVED_ATTRIBS}
        ];

        /** @type {Array.<string, deqpDraw.primitiveType>} */
        var primitiveTypes = [
            {name: 'points', type: deqpDraw.primitiveType.POINTS},
            {name: 'lines', type: deqpDraw.primitiveType.LINES},
            {name: 'triangles', type: deqpDraw.primitiveType.TRIANGLES}
        ];

        /** @type {Array.<deqpUtils.DataType>} */
        var basicTypes = [
            deqpUtils.DataType.FLOAT,
            deqpUtils.DataType.FLOAT_VEC2,
            deqpUtils.DataType.FLOAT_VEC3,
            deqpUtils.DataType.FLOAT_VEC4,
            deqpUtils.DataType.FLOAT_MAT2,
            deqpUtils.DataType.FLOAT_MAT2X3,
            deqpUtils.DataType.FLOAT_MAT2X4,
            deqpUtils.DataType.FLOAT_MAT3X2,
            deqpUtils.DataType.FLOAT_MAT3,
            deqpUtils.DataType.FLOAT_MAT3X4,
            deqpUtils.DataType.FLOAT_MAT4X2,
            deqpUtils.DataType.FLOAT_MAT4X3,
            deqpUtils.DataType.FLOAT_MAT4,
            deqpUtils.DataType.INT,
            deqpUtils.DataType.INT_VEC2,
            deqpUtils.DataType.INT_VEC3,
            deqpUtils.DataType.INT_VEC4,
            deqpUtils.DataType.UINT,
            deqpUtils.DataType.UINT_VEC2,
            deqpUtils.DataType.UINT_VEC3,
            deqpUtils.DataType.UINT_VEC4
        ];

        // TODO: could we use /** @type {Array.<glsUBC.UniformFlags>} */ instead ???
        /** @type {Array.<deqpUtils.precision>} */
        var precisions = [

            deqpUtils.precision.PRECISION_LOWP,
            deqpUtils.precision.PRECISION_MEDIUMP,
            deqpUtils.precision.PRECISION_HIGHP

            // glsUBC.UniformFlags.PRECISION_LOW,
            // glsUBC.UniformFlags.PRECISION_MEDIUM,
            // glsUBC.UniformFlags.PRECISION_HIGH
        ];

        /** @type {Array.<string, interpolation>} */
        var interpModes = [
            {name: 'smooth', interp: interpolation.SMOOTH},
            {name: 'flat', interp: interpolation.FLAT},
            {name: 'centroid', interp: interpolation.CENTROID}
        ];

        // .position
        /** @type {deqpTests.DeqpTest} */
        var positionGroup = deqpTests.newTest('position', 'gl_Position capture using transform feedback');
        testGroup.addChild(positionGroup);

        for (var primitiveType = 0; primitiveType < primitiveTypes.length; primitiveType++)
        {
            for (var bufferMode = 0; bufferMode < bufferModes.length; bufferMode++)
            {
                /** @type {string} */
                var name = primitiveTypes[primitiveType].name + '_' + bufferModes[bufferMode].name;
                
                positionGroup.addChild(new PositionCase(
                    context,
                    name,
                    '',
                    bufferModes[bufferMode].mode,
                    primitiveTypes[primitiveType].type
                ));
            }
        }

        // .point_size
        /** @type {deqpTests.DeqpTest} */ var pointSizeGroup = deqpTests.newTest('point_size', 'gl_PointSize capture using transform feedback');
        testGroup.addChild(pointSizeGroup);

        for (var primitiveType = 0; primitiveType < primitiveTypes.length; primitiveType++)
        {
            for (var bufferMode = 0; bufferMode < bufferModes.length; bufferMode++)
            {
                /** @type {string} */
                var name = primitiveTypes[primitiveType].name + '_' + bufferModes[bufferMode].name;
                
                pointSizeGroup.addChild(new PointSizeCase(
                    context,
                    name,
                    '',
                    bufferModes[bufferMode].mode,
                    primitiveTypes[primitiveType].type
                ));
            }
        }

        // .basic_type
        /** @type {deqpTests.DeqpTest} */
        var basicTypeGroup = deqpTests.newTest('basic_types', 'Basic types in transform feedback');
        testGroup.addChild(basicTypeGroup);

        for (var bufferModeNdx = 0; bufferModeNdx < bufferModes.length; bufferModeNdx++)
        {
            /** @type {deqpTests.DeqpTest} */
            var modeGroup = deqpTests.newTest(bufferModes[bufferModeNdx].name, '');
            /** @type {number} */
            var bufferMode = bufferModes[bufferModeNdx].mode;
            basicTypeGroup.addChild(modeGroup);

            for (var primitiveTypeNdx = 0; primitiveTypeNdx < primitiveTypes.length; primitiveTypeNdx++)
            {
                /** @type {deqpTests.DeqpTest} */
                var primitiveGroup = deqpTests.newTest(primitiveTypes[primitiveTypeNdx].name, '');
                /** @type {number} */
                var primitiveType    = primitiveTypes[primitiveTypeNdx].type;
                modeGroup.addChild(primitiveGroup);

                for (var typeNdx = 0; typeNdx < basicTypes.length; typeNdx++)
                {
                    /** @type {deqpUtils.DataType} */
                    var type = basicTypes[typeNdx];
                    /** @type {boolean} */
                    var isFloat = deqpUtils.getDataTypeScalarType(type) == deqpUtils.DataType.FLOAT;

                    for (var precNdx = 0; precNdx < precisions.length; precNdx++)
                    {
                        /** @type {deqpUtils.precision} */
                        var precision = precisions[precNdx];
                        /** @type {string} */
                        var name = deqpUtils.getPrecisionName(precision) + '_' + deqpUtils.getDataTypeName(type);
                        
                        primitiveGroup.addChild(new BasicTypeCase(
                            context,
                            name,
                            '',
                            bufferMode,
                            primitiveType,
                            type,
                            precision,
                            isFloat ? interpolation.SMOOTH : interpolation.FLAT
                        ));
                    }
                }
            }
        }

        // .array
        /** @type {deqpTests.DeqpTest} */ var arrayGroup = deqpTests.newTest('array', 'Capturing whole array in TF');
        testGroup.addChild(arrayGroup);

        for (var bufferModeNdx = 0; bufferModeNdx < bufferModes.length; bufferModeNdx++)
        {
            /** @type {deqpTests.DeqpTest} */ var modeGroup = deqpTests.newTest(bufferModes[bufferModeNdx].name, '');
            /** @type {number} */ var bufferMode = bufferModes[bufferModeNdx].mode;
            arrayGroup.addChild(modeGroup);

            for (var primitiveTypeNdx = 0; primitiveTypeNdx < primitiveTypes.length; primitiveTypeNdx++)
            {
                /** @type {deqpTests.DeqpTest} */
                var primitiveGroup = deqpTests.newTest(primitiveTypes[primitiveTypeNdx].name, '');
                /** @type {number} */
                var primitiveType  = primitiveTypes[primitiveTypeNdx].type;
                modeGroup.addChild(primitiveGroup);

                for (var typeNdx = 0; typeNdx < basicTypes.length; typeNdx++)
                {
                    /** @type {deqpUtils.DataType} */
                    var type = basicTypes[typeNdx];
                    /** @type {boolean} */
                    var isFloat = deqpUtils.getDataTypeScalarType(type) == deqpUtils.DataType.FLOAT;

                    for (var precNdx = 0; precNdx < precisions.length; precNdx++)
                    {
                        /** @type {deqpUtils.precision} */
                        var precision = precisions[precNdx];
                        /** @type {string} */
                        var name = deqpUtils.getPrecisionName(precision) + '_' + deqpUtils.getDataTypeName(type);

                        primitiveGroup.addChild(new BasicArrayCase(
                            context,
                            name,
                            '',
                            bufferMode,
                            primitiveType,
                            type,
                            precision,
                            isFloat ? interpolation.SMOOTH : interpolation.FLAT
                        ));
                    }
                }
            }
        }

        // .array_element
        /** @type {deqpTests.DeqpTest} */
        var arrayElemGroup = deqpTests.newTest('array_element', 'Capturing single array element in TF');
        testGroup.addChild(arrayElemGroup);

        for (var bufferModeNdx = 0; bufferModeNdx < bufferModes.length; bufferModeNdx++)
        {
            /** @type {deqpTests.DeqpTest} */
            var modeGroup  = deqpTests.newTest(bufferModes[bufferModeNdx].name, '');
            /** @type {number} */
            var bufferMode = bufferModes[bufferModeNdx].mode;
            arrayElemGroup.addChild(modeGroup);

            for (var primitiveTypeNdx = 0; primitiveTypeNdx < primitiveTypes.length; primitiveTypeNdx++)
            {
                /** @type {deqpTests.DeqpTest} */
                var primitiveGroup = deqpTests.newTest(primitiveTypes[primitiveTypeNdx].name, '');
                /** @type {number} */
                var primitiveType  = primitiveTypes[primitiveTypeNdx].type;
                modeGroup.addChild(primitiveGroup);

                for (var typeNdx = 0; typeNdx < basicTypes.length; typeNdx++)
                {
                    /** @type {deqpUtils.DataType} */
                    var type = basicTypes[typeNdx];
                    /** @type {boolean} */
                    var isFloat = deqpUtils.getDataTypeScalarType(type) == deqpUtils.DataType.FLOAT;

                    for (var precNdx = 0; precNdx < precisions.length; precNdx++)
                    {
                        /** @type {deqpUtils.precision} */
                        var precision = precisions[precNdx];
                        /** @type {string} */
                        var name = deqpUtils.getPrecisionName(precision) + '_' + deqpUtils.getDataTypeName(type);
                        
                        primitiveGroup.addChild(new ArrayElementCase(
                            context,
                            name,
                            '',
                            bufferMode,
                            primitiveType,
                            type,
                            precision,
                            isFloat ? interpolation.SMOOTH : interpolation.FLAT
                        ));
                    }
                }
            }
        }

        // .interpolation
        /** @type {deqpTests.DeqpTest} */
        var interpolationGroup = deqpTests.newTest(
            'interpolation', 'Different interpolation modes in transform feedback varyings'
        );
        testGroup.addChild(interpolationGroup);

        for (var modeNdx = 0; modeNdx < interpModes.length; modeNdx++)
        {
        /** @type {interpolation} */
        var interp = interpModes[modeNdx].interp;
        /** @type {deqpTests.DeqpTest} */
        var modeGroup = deqpTests.newTest(interpModes[modeNdx].name, '');

            interpolationGroup.addChild(modeGroup);

            for (var precNdx = 0; precNdx < precisions.length; precNdx++)
            {
                /** @type {deqpUtils.precision} */
                var precision = precisions[precNdx];

                for (var primitiveType = 0; primitiveType < primitiveTypes.length; primitiveType++)
                {
                    for (var bufferMode = 0; bufferMode < bufferModes.length; bufferMode++)
                    {
                        /** @type {string} */
                        var name = (
                            deqpUtils.getPrecisionName(precision)         +
                            '_vec4_' + primitiveTypes[primitiveType].name +
                            '_'      + bufferModes[bufferMode].name
                        );
                        
                        modeGroup.addChild(new BasicTypeCase(
                            context,
                            name,
                            '',
                            bufferModes[bufferMode].mode,
                            primitiveTypes[primitiveType].type,
                            deqpUtils.DataType.FLOAT_VEC4,
                            precision,
                            interp
                        ));
                    }
                }
            }
        }

        // .random
        /** @type {deqpTests.DeqpTest} */
        var randomGroup = deqpTests.newTest('random', 'Randomized transform feedback cases');
        testGroup.addChild(randomGroup);

        for (var bufferModeNdx = 0; bufferModeNdx < bufferModes.length; bufferModeNdx++)
        {
            /** @type {deqpTests.DeqpTest} */
            var modeGroup  = deqpTests.newTest(bufferModes[bufferModeNdx].name, '');
            /** @type {number} */
            var bufferMode = bufferModes[bufferModeNdx].mode;
            randomGroup.addChild(modeGroup);

            for (var primitiveTypeNdx = 0; primitiveTypeNdx < primitiveTypes.length; primitiveTypeNdx++)
            {
                /** @type {deqpTests.DeqpTest} */
                var primitiveGroup = deqpTests.newTest(primitiveTypes[primitiveTypeNdx].name, '');
                /** @type {number} */
                var  primitiveType = primitiveTypes[primitiveTypeNdx].type;
                modeGroup.addChild(primitiveGroup);

                for (var ndx = 0; ndx < 10; ndx++)
                {
                    /** @type {number} */
                    var seed = deMath.deMathHash(bufferMode) ^ deMath.deMathHash(primitiveType) ^ deMath.deMathHash(ndx);
                    
                    primitiveGroup.addChild(new RandomCase(
                        context,
                        (ndx + 1).toString(),
                        '',
                        bufferMode,
                        primitiveType,
                        seed
                    )); // TODO: check, toString() omitted?
                }
            }
        }

    };


    /**
     * Create and execute the test cases
     */
    var run = function(gl) {
		var testName = 'transform_feedback';
        var testDescription = 'Transform Feedback Tests';
        var state = deqpTests.runner.getState();

        state.testName = testName;
        state.testCases = deqpTests.newTest(testName, testDescription, null);

        //Set up name and description of this test series.
        setCurrentTestName(testName);
        description(testDescription);
        try {
            init(gl);
            deqpTests.runner.runCallback(deqpTests.runTestCases);
        } catch (err) {
        	console.log(err);
            bufferedLogToConsole(err);
            deqpTests.runner.terminate();
        }

    };


    return {

        VIEWPORT_WIDTH:             VIEWPORT_WIDTH,
        VIEWPORT_HEIGHT:            VIEWPORT_HEIGHT,
        BUFFER_GUARD_MULTIPLIER:    BUFFER_GUARD_MULTIPLIER,

        run:                        run

    };

});
