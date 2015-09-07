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
goog.provide('functional.gles3.es3fShaderStateQueryTests');
goog.require('framework.common.tcuTestCase');
goog.require('functional.gles3.es3fApiCase');
goog.require('modules.shared.glsStateQuery');

goog.scope(function() {
var es3fShaderStateQueryTests = functional.gles3.es3fShaderStateQueryTests;
var tcuTestCase = framework.common.tcuTestCase;
var glsStateQuery = modules.shared.glsStateQuery;
var es3fApiCase = functional.gles3.es3fApiCase;

var setParentClass = function(child, parent) {
    child.prototype = Object.create(parent.prototype);
    child.prototype.constructor = child;
};

var commonTestVertSource = '#version 300 es\n' +
                            'void main (void)\n' +
                            '{\n' +
                            ' gl_Position = vec4(0.0);\n' +
                            '}\n';
var commonTestFragSource = '#version 300 es\n' +
                            'layout(location = 0) out mediump vec4 fragColor;\n' +
                            'void main (void)\n' +
                            '{\n' +
                            ' fragColor = vec4(0.0);\n' +
                            '}\n';

var brokenShader = '#version 300 es\n' +
                            'broken, this should not compile!\n' +
                            '\n';

/**
 * @constructor
 * @extends {es3fApiCase.ApiCase}
 * @param {string} name
 * @param {string} description
 */
es3fShaderStateQueryTests.ShaderTypeCase = function(name, description) {
    es3fApiCase.ApiCase.call(this, name, description, gl);
};

setParentClass(es3fShaderStateQueryTests.ShaderTypeCase, es3fApiCase.ApiCase);

es3fShaderStateQueryTests.ShaderTypeCase.prototype.test = function() {
    var shaderTypes = [gl.VERTEX_SHADER, gl.FRAGMENT_SHADER];
    for (var ndx = 0; ndx < shaderTypes.length; ++ndx) {
        var shader = gl.createShader(shaderTypes[ndx]);
        var result = glsStateQuery.verifyShader(shader, gl.SHADER_TYPE, shaderTypes[ndx]);
        this.check(result, 'Incorrect shader type');
        gl.deleteShader(shader);
    }
};

/**
 * @constructor
 * @extends {es3fApiCase.ApiCase}
 * @param {string} name
 * @param {string} description
 */
es3fShaderStateQueryTests.ShaderCompileStatusCase = function(name, description) {
    es3fApiCase.ApiCase.call(this, name, description, gl);
};

setParentClass(es3fShaderStateQueryTests.ShaderCompileStatusCase, es3fApiCase.ApiCase);

es3fShaderStateQueryTests.ShaderCompileStatusCase.prototype.test = function() {
    var result;
    var shaderVert = gl.createShader(gl.VERTEX_SHADER);
    var shaderFrag = gl.createShader(gl.FRAGMENT_SHADER);

    result = glsStateQuery.verifyShader(shaderVert, gl.COMPILE_STATUS, false);
    this.check(result, 'Vertex shader compilation status should be false');
    result = glsStateQuery.verifyShader(shaderFrag, gl.COMPILE_STATUS, false);
    this.check(result, 'Fragment shader compilation status should be false');

    gl.shaderSource(shaderVert, commonTestVertSource);
    gl.shaderSource(shaderFrag, commonTestFragSource);

    gl.compileShader(shaderVert);
    gl.compileShader(shaderFrag);

    result = glsStateQuery.verifyShader(shaderVert, gl.COMPILE_STATUS, true);
    this.check(result, 'Vertex shader compilation status should be true');
    result = glsStateQuery.verifyShader(shaderFrag, gl.COMPILE_STATUS, true);
    this.check(result, 'Fragment shader compilation status should be true');

    gl.deleteShader(shaderVert);
    gl.deleteShader(shaderFrag);
};

/**
 * @constructor
 * @extends {es3fApiCase.ApiCase}
 * @param {string} name
 * @param {string} description
 */
es3fShaderStateQueryTests.ShaderInfoLogCase = function(name, description) {
    es3fApiCase.ApiCase.call(this, name, description, gl);
};

setParentClass(es3fShaderStateQueryTests.ShaderInfoLogCase, es3fApiCase.ApiCase);

es3fShaderStateQueryTests.ShaderInfoLogCase.prototype.test = function() {
    var shader = gl.createShader(gl.VERTEX_SHADER);
    var log = gl.getShaderInfoLog(shader);
    this.check(log === '');

    gl.shaderSource(shader, brokenShader);
    gl.compileShader(shader);

    log = gl.getShaderInfoLog(shader);
    this.check(log === null || typeof log === 'string');

    gl.deleteShader(shader);
};

/**
 * @constructor
 * @extends {es3fApiCase.ApiCase}
 * @param {string} name
 * @param {string} description
 */
es3fShaderStateQueryTests.ShaderSourceCase = function(name, description) {
    es3fApiCase.ApiCase.call(this, name, description, gl);
};

setParentClass(es3fShaderStateQueryTests.ShaderSourceCase, es3fApiCase.ApiCase);

es3fShaderStateQueryTests.ShaderSourceCase.prototype.test = function() {
    var shader = gl.createShader(gl.VERTEX_SHADER);
    this.check(gl.getShaderSource(shader) === '');

    gl.shaderSource(shader, brokenShader);
    this.check(gl.getShaderSource(shader) === brokenShader);

    gl.deleteShader(shader);
};

/**
 * @constructor
 * @extends {es3fApiCase.ApiCase}
 * @param {string} name
 * @param {string} description
 */
es3fShaderStateQueryTests.DeleteStatusCase = function(name, description) {
    es3fApiCase.ApiCase.call(this, name, description, gl);
};

setParentClass(es3fShaderStateQueryTests.DeleteStatusCase, es3fApiCase.ApiCase);

es3fShaderStateQueryTests.DeleteStatusCase.prototype.test = function() {
    var shaderVert = gl.createShader(gl.VERTEX_SHADER);
    var shaderFrag = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(shaderVert, commonTestVertSource);
    gl.shaderSource(shaderFrag, commonTestFragSource);

    gl.compileShader(shaderVert);
    gl.compileShader(shaderFrag);

    this.check(glsStateQuery.verifyShader(shaderVert, gl.COMPILE_STATUS, true));
    this.check(glsStateQuery.verifyShader(shaderFrag, gl.COMPILE_STATUS, true));

    var shaderProg = gl.createProgram();
    gl.attachShader(shaderProg, shaderVert);
    gl.attachShader(shaderProg, shaderFrag);
    gl.linkProgram(shaderProg);

    this.check(glsStateQuery.verifyProgram(shaderProg, gl.LINK_STATUS, true));

    this.check(glsStateQuery.verifyShader(shaderVert, gl.DELETE_STATUS, false));
    this.check(glsStateQuery.verifyShader(shaderFrag, gl.DELETE_STATUS, false));
    this.check(glsStateQuery.verifyProgram(shaderProg, gl.DELETE_STATUS, false));

    gl.useProgram(shaderProg);

    gl.deleteShader(shaderVert);
    gl.deleteShader(shaderFrag);
    gl.deleteProgram(shaderProg);

    this.check(glsStateQuery.verifyShader(shaderVert, gl.DELETE_STATUS, true));
    this.check(glsStateQuery.verifyShader(shaderFrag, gl.DELETE_STATUS, true));
    this.check(glsStateQuery.verifyProgram(shaderProg, gl.DELETE_STATUS, true));

    gl.useProgram(null);
};

/**
* @constructor
* @extends {tcuTestCase.DeqpTest}
*/
es3fShaderStateQueryTests.ShaderStateQueryTests = function() {
    tcuTestCase.DeqpTest.call(this, 'shader', 'Shader State Query tests');
};

es3fShaderStateQueryTests.ShaderStateQueryTests.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
es3fShaderStateQueryTests.ShaderStateQueryTests.prototype.constructor = es3fShaderStateQueryTests.ShaderStateQueryTests;

es3fShaderStateQueryTests.ShaderStateQueryTests.prototype.init = function() {
    // shader
    this.addChild(new es3fShaderStateQueryTests.ShaderTypeCase('shader_type', 'SHADER_TYPE'));
    this.addChild(new es3fShaderStateQueryTests.ShaderCompileStatusCase('shader_compile_status', 'COMPILE_STATUS'));
    this.addChild(new es3fShaderStateQueryTests.ShaderInfoLogCase('shader_info_log', 'INFO_LOG'));
    this.addChild(new es3fShaderStateQueryTests.ShaderSourceCase('shader_source', 'SHADER_SOURCE'));

    // shader and program
    this.addChild(new es3fShaderStateQueryTests.DeleteStatusCase('delete_status', 'DELETE_STATUS'));

    // // vertex-attrib
    // this.addChild(new es3fShaderStateQueryTests.CurrentVertexAttribInitialCase ("current_vertex_attrib_initial", "CURRENT_VERTEX_ATTRIB"));
    // this.addChild(new es3fShaderStateQueryTests.CurrentVertexAttribFloatCase ("current_vertex_attrib_float", "CURRENT_VERTEX_ATTRIB"));
    // this.addChild(new es3fShaderStateQueryTests.CurrentVertexAttribIntCase ("current_vertex_attrib_int", "CURRENT_VERTEX_ATTRIB"));
    // this.addChild(new es3fShaderStateQueryTests.CurrentVertexAttribUintCase ("current_vertex_attrib_uint", "CURRENT_VERTEX_ATTRIB"));
    // this.addChild(new es3fShaderStateQueryTests.CurrentVertexAttribConversionCase ("current_vertex_attrib_float_to_int", "CURRENT_VERTEX_ATTRIB"));

    // // program
    // this.addChild(new es3fShaderStateQueryTests.ProgramInfoLogCase ("program_info_log_length", "INFO_LOG_LENGTH"));
    // this.addChild(new es3fShaderStateQueryTests.ProgramValidateStatusCase ("program_validate_status", "VALIDATE_STATUS"));
    // this.addChild(new es3fShaderStateQueryTests.ProgramAttachedShadersCase ("program_attached_shaders", "ATTACHED_SHADERS"));

    // this.addChild(new es3fShaderStateQueryTests.ProgramActiveUniformNameCase ("program_active_uniform_name", "ACTIVE_UNIFORMS and ACTIVE_UNIFORM_MAX_LENGTH"));
    // this.addChild(new es3fShaderStateQueryTests.ProgramUniformCase ("program_active_uniform_types", "UNIFORM_TYPE, UNIFORM_SIZE, and UNIFORM_IS_ROW_MAJOR"));
    // this.addChild(new es3fShaderStateQueryTests.ProgramActiveUniformBlocksCase ("program_active_uniform_blocks", "ACTIVE_UNIFORM_BLOCK_x"));
    // this.addChild(new es3fShaderStateQueryTests.ProgramBinaryCase ("program_binary", "PROGRAM_BINARY_LENGTH and PROGRAM_BINARY_RETRIEVABLE_HINT"));

    // // transform feedback
    // this.addChild(new es3fShaderStateQueryTests.TransformFeedbackCase ("transform_feedback", "TRANSFORM_FEEDBACK_BUFFER_MODE, TRANSFORM_FEEDBACK_VARYINGS, TRANSFORM_FEEDBACK_VARYING_MAX_LENGTH"));

    // // attribute related
    // this.addChild(new es3fShaderStateQueryTests.ActiveAttributesCase ("active_attributes", "ACTIVE_ATTRIBUTES and ACTIVE_ATTRIBUTE_MAX_LENGTH"));
    // this.addChild(new es3fShaderStateQueryTests.VertexAttributeSizeCase ("vertex_attrib_size", "VERTEX_ATTRIB_ARRAY_SIZE"));
    // this.addChild(new es3fShaderStateQueryTests.VertexAttributeTypeCase ("vertex_attrib_type", "VERTEX_ATTRIB_ARRAY_TYPE"));
    // this.addChild(new es3fShaderStateQueryTests.VertexAttributeStrideCase ("vertex_attrib_stride", "VERTEX_ATTRIB_ARRAY_STRIDE"));
    // this.addChild(new es3fShaderStateQueryTests.VertexAttributeNormalizedCase ("vertex_attrib_normalized", "VERTEX_ATTRIB_ARRAY_NORMALIZED"));
    // this.addChild(new es3fShaderStateQueryTests.VertexAttributeIntegerCase ("vertex_attrib_integer", "VERTEX_ATTRIB_ARRAY_INTEGER"));
    // this.addChild(new es3fShaderStateQueryTests.VertexAttributeEnabledCase ("vertex_attrib_array_enabled", "VERTEX_ATTRIB_ARRAY_ENABLED"));
    // this.addChild(new es3fShaderStateQueryTests.VertexAttributeDivisorCase ("vertex_attrib_array_divisor", "VERTEX_ATTRIB_ARRAY_DIVISOR"));
    // this.addChild(new es3fShaderStateQueryTests.VertexAttributeBufferBindingCase ("vertex_attrib_array_buffer_binding", "VERTEX_ATTRIB_ARRAY_BUFFER_BINDING"));
    // this.addChild(new es3fShaderStateQueryTests.VertexAttributePointerCase ("vertex_attrib_pointerv", "GetVertexAttribPointerv"));

    // // uniform values
    // this.addChild(new es3fShaderStateQueryTests.UniformValueFloatCase ("uniform_value_float", "GetUniform*"));
    // this.addChild(new es3fShaderStateQueryTests.UniformValueIntCase ("uniform_value_int", "GetUniform*"));
    // this.addChild(new es3fShaderStateQueryTests.UniformValueUintCase ("uniform_value_uint", "GetUniform*"));
    // this.addChild(new es3fShaderStateQueryTests.UniformValueBooleanCase ("uniform_value_boolean", "GetUniform*"));
    // this.addChild(new es3fShaderStateQueryTests.UniformValueSamplerCase ("uniform_value_sampler", "GetUniform*"));
    // this.addChild(new es3fShaderStateQueryTests.UniformValueArrayCase ("uniform_value_array", "GetUniform*"));
    // this.addChild(new es3fShaderStateQueryTests.UniformValueMatrixCase ("uniform_value_matrix", "GetUniform*"));

    // // precision format query
    // this.addChild(new es3fShaderStateQueryTests.PrecisionFormatCase ("precision_vertex_lowp_float", "GetShaderPrecisionFormat", gl.VERTEX_SHADER, gl.LOW_FLOAT));
    // this.addChild(new es3fShaderStateQueryTests.PrecisionFormatCase ("precision_vertex_mediump_float", "GetShaderPrecisionFormat", gl.VERTEX_SHADER, gl.MEDIUM_FLOAT));
    // this.addChild(new es3fShaderStateQueryTests.PrecisionFormatCase ("precision_vertex_highp_float", "GetShaderPrecisionFormat", gl.VERTEX_SHADER, gl.HIGH_FLOAT));
    // this.addChild(new es3fShaderStateQueryTests.PrecisionFormatCase ("precision_vertex_lowp_int", "GetShaderPrecisionFormat", gl.VERTEX_SHADER, gl.LOW_INT));
    // this.addChild(new es3fShaderStateQueryTests.PrecisionFormatCase ("precision_vertex_mediump_int", "GetShaderPrecisionFormat", gl.VERTEX_SHADER, gl.MEDIUM_INT));
    // this.addChild(new es3fShaderStateQueryTests.PrecisionFormatCase ("precision_vertex_highp_int", "GetShaderPrecisionFormat", gl.VERTEX_SHADER, gl.HIGH_INT));
    // this.addChild(new es3fShaderStateQueryTests.PrecisionFormatCase ("precision_fragment_lowp_float", "GetShaderPrecisionFormat", gl.FRAGMENT_SHADER, gl.LOW_FLOAT));
    // this.addChild(new es3fShaderStateQueryTests.PrecisionFormatCase ("precision_fragment_mediump_float", "GetShaderPrecisionFormat", gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT));
    // this.addChild(new es3fShaderStateQueryTests.PrecisionFormatCase ("precision_fragment_highp_float", "GetShaderPrecisionFormat", gl.FRAGMENT_SHADER, gl.HIGH_FLOAT));
    // this.addChild(new es3fShaderStateQueryTests.PrecisionFormatCase ("precision_fragment_lowp_int", "GetShaderPrecisionFormat", gl.FRAGMENT_SHADER, gl.LOW_INT));
    // this.addChild(new es3fShaderStateQueryTests.PrecisionFormatCase ("precision_fragment_mediump_int", "GetShaderPrecisionFormat", gl.FRAGMENT_SHADER, gl.MEDIUM_INT));
    // this.addChild(new es3fShaderStateQueryTests.PrecisionFormatCase ("precision_fragment_highp_int", "GetShaderPrecisionFormat", gl.FRAGMENT_SHADER, gl.HIGH_INT));
};

/**
* Run test
* @param {WebGL2RenderingContext} context
*/
es3fShaderStateQueryTests.run = function(context) {
    gl = context;
    //Set up Test Root parameters
    var state = tcuTestCase.runner;
    state.setRoot(new es3fShaderStateQueryTests.ShaderStateQueryTests());

    //Set up name and description of this test series.
    setCurrentTestName(state.testCases.fullName());
    description(state.testCases.getDescription());

    try {
        //Run test cases
        tcuTestCase.runTestCases();
    }
    catch (err) {
        testFailedOptions('Failed to es3fShaderStateQueryTests.run tests', false);
        tcuTestCase.runner.terminate();
    }
};

});
