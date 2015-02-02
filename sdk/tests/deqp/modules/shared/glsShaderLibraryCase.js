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

define(['framework/common/tcuTestCase', 'framework/opengl/gluShaderProgram', 'framework/opengl/gluShaderUtil', 'framework/opengl/gluDrawUtil'], function(deqpTests, deqpProgram, deqpUtils, deqpDraw) {
    'use strict';

    /** @const @type {number} */ var VIEWPORT_WIDTH = 128;
    /** @const @type {number} */ var VIEWPORT_HEIGHT = 128;

/**
 * Shader compilation expected result enum
 * @enum {number}
 */
var expectResult = {
    EXPECT_PASS: 0,
    EXPECT_COMPILE_FAIL: 1,
    EXPECT_LINK_FAIL: 2,
    EXPECT_COMPILE_LINK_FAIL: 3,
    EXPECT_VALIDATION_FAIL: 4
};

/**
 * Test case type
 * @enum {number}
 */
var caseType = {
    CASETYPE_COMPLETE: 0,         //!< Has all shaders specified separately.
    CASETYPE_VERTEX_ONLY: 1,      //!< "Both" case, vertex shader sub case.
    CASETYPE_FRAGMENT_ONLY: 2     //!< "Both" case, fragment shader sub case.
};

var BeforeDrawValidator = function() {
    /* TODO : GLES 3.1: implement */
};

/**
 * BeforeDrawValidator target type enum
 * @enum {number}
 */
var targetType = {
    PROGRAM: 0,
    PIPELINE: 1
};

/**
 * Shader case type enum
 * @enum {number}
 */
var shaderCase = {
    value: {
        STORAGE_INPUT: 0,
        STORAGE_OUTPUT: 1,
        STORAGE_UNIFORM: 2
    }
};

/**
 * Checks if shader uses in/out qualifiers depending on the version
 * @param {string} version
 * @return {boolean} version
 */
var usesShaderInoutQualifiers = function(version) {
    switch (version) {
        case '100':
        case '130':
        case '140':
        case '150':
            return false;

        default:
            return true;
    }
};

/**
 * Checks if version supports fragment highp precision
 * @param {string} version
 * @return {boolean} version ,True when is different from version 100
 */
var supportsFragmentHighp = function(version) {
    return version !== '100';
};


/**
 * This functions builds a matching vertex shader for a 'both' case, when
 * the fragment shader is being tested.
 * We need to build attributes and varyings for each 'input'.
 * @param {Array.<Object>} valueBlock
 * @return {string} res
 */
var genVertexShader = function(valueBlock) {
    /** @type {string} */ var res = '';
    /** @type {Object} */ var state = deqpTests.runner.getState();
    /** @type {boolean} */ var usesInout = usesShaderInoutQualifiers(state.currentTest.spec.targetVersion);
    /** @type {string} */ var vtxIn = usesInout ? 'in' : 'attribute';
    /** @type {string} */ var vtxOut = usesInout ? 'out' : 'varying';

    res += '#version ' + state.currentTest.spec.targetVersion + '\n';
    res += 'precision highp float;\n';
    res += 'precision highp int;\n';
    res += '\n';
    res += vtxIn + ' highp vec4 dEQP_Position;\n';

    for (var ndx = 0; ndx < valueBlock.values.length; ndx++) {
    /** @type {Array} */ var val = valueBlock.values[ndx];
        if (val.storageType === shaderCase.value.STORAGE_INPUT) {
            /** @type {string} */ var floatType = deqpUtils.getDataTypeFloatScalars(val.dataType);
            res += vtxIn + ' ' + floatType + ' a_' + val.valueName + ';\n';

            if (deqpUtils.getDataTypeScalarType(val.dataType) === 'float')
                res += vtxOut + ' ' + floatType + ' ' + val.valueName + ';\n';
            else
                res += vtxOut + ' ' + floatType + ' v_' + val.valueName + ';\n';
        }
    }
    res += '\n';

    // Main function.
    // - gl_Position = dEQP_Position;
    // - for each input: write attribute directly to varying
    res += 'void main()\n';
    res += '{\n';
    res += '\tgl_Position = dEQP_Position;\n';
    for (var ndx = 0; ndx < valueBlock.values.length; ndx++) {
    /** @type {Array} */ var val = valueBlock.values[ndx];
        if (val.storageType === shaderCase.value.STORAGE_INPUT) {
        /** @type {string} */ var name = val.valueName;
            if (deqpUtils.getDataTypeScalarType(val.dataType) === 'float')
                res += '\t' + name + ' = a_' + name + ';\n';
            else
                res += '\tv_' + name + ' = a_' + name + ';\n';
        }
    }

    res += '}\n';
    return res;
};

/**
 * @param {Array.<Object>} valueBlock
 * @param {boolean} useFloatTypes
 * @return {string} stream
 */
var genCompareFunctions = function(valueBlock, useFloatTypes) {
    var cmpTypeFound = {};
    /** @type {string} */ var stream = '';

    for (var ndx = 0; ndx < valueBlock.values.length; ndx++) {
    /** @type {Array} */ var val = valueBlock.values[ndx];
        if (val.storageType === shaderCase.value.STORAGE_OUTPUT)
            cmpTypeFound[deqpUtils.getDataTypeName(val.dataType)] = true;

    }
    if (useFloatTypes)
    {
        if (cmpTypeFound['bool']) stream += 'bool isOk (float a, bool b) { return ((a > 0.5) == b); }\n';
        if (cmpTypeFound['bvec2']) stream += 'bool isOk (vec2 a, bvec2 b) { return (greaterThan(a, vec2(0.5)) == b); }\n';
        if (cmpTypeFound['bvec3']) stream += 'bool isOk (vec3 a, bvec3 b) { return (greaterThan(a, vec3(0.5)) == b); }\n';
        if (cmpTypeFound['bvec4']) stream += 'bool isOk (vec4 a, bvec4 b) { return (greaterThan(a, vec4(0.5)) == b); }\n';
        if (cmpTypeFound['int']) stream += 'bool isOk (float a, int b)  { float atemp = a+0.5; return (float(b) <= atemp && atemp <= float(b+1)); }\n';
        if (cmpTypeFound['ivec2']) stream += 'bool isOk (vec2 a, ivec2 b) { return (ivec2(floor(a + 0.5)) == b); }\n';
        if (cmpTypeFound['ivec3']) stream += 'bool isOk (vec3 a, ivec3 b) { return (ivec3(floor(a + 0.5)) == b); }\n';
        if (cmpTypeFound['ivec4']) stream += 'bool isOk (vec4 a, ivec4 b) { return (ivec4(floor(a + 0.5)) == b); }\n';
        if (cmpTypeFound['uint']) stream += 'bool isOk (float a, uint b) { float atemp = a+0.5; return (float(b) <= atemp && atemp <= float(b+1u)); }\n';
        if (cmpTypeFound['uvec2']) stream += 'bool isOk (vec2 a, uvec2 b) { return (uvec2(floor(a + 0.5)) == b); }\n';
        if (cmpTypeFound['uvec3']) stream += 'bool isOk (vec3 a, uvec3 b) { return (uvec3(floor(a + 0.5)) == b); }\n';
        if (cmpTypeFound['uvec4']) stream += 'bool isOk (vec4 a, uvec4 b) { return (uvec4(floor(a + 0.5)) == b); }\n';
    }
    else
    {
        if (cmpTypeFound['bool']) stream += 'bool isOk (bool a, bool b)   { return (a == b); }\n';
        if (cmpTypeFound['bvec2']) stream += 'bool isOk (bvec2 a, bvec2 b) { return (a == b); }\n';
        if (cmpTypeFound['bvec3']) stream += 'bool isOk (bvec3 a, bvec3 b) { return (a == b); }\n';
        if (cmpTypeFound['bvec4']) stream += 'bool isOk (bvec4 a, bvec4 b) { return (a == b); }\n';
        if (cmpTypeFound['int']) stream += 'bool isOk (int a, int b)     { return (a == b); }\n';
        if (cmpTypeFound['ivec2']) stream += 'bool isOk (ivec2 a, ivec2 b) { return (a == b); }\n';
        if (cmpTypeFound['ivec3']) stream += 'bool isOk (ivec3 a, ivec3 b) { return (a == b); }\n';
        if (cmpTypeFound['ivec4']) stream += 'bool isOk (ivec4 a, ivec4 b) { return (a == b); }\n';
        if (cmpTypeFound['uint']) stream += 'bool isOk (uint a, uint b)   { return (a == b); }\n';
        if (cmpTypeFound['uvec2']) stream += 'bool isOk (uvec2 a, uvec2 b) { return (a == b); }\n';
        if (cmpTypeFound['uvec3']) stream += 'bool isOk (uvec3 a, uvec3 b) { return (a == b); }\n';
        if (cmpTypeFound['uvec4']) stream += 'bool isOk (uvec4 a, uvec4 b) { return (a == b); }\n';
    }

    if (cmpTypeFound['float'])
        stream += 'bool isOk (float a, float b, float eps) { return (abs(a-b) <= (eps*abs(b) + eps)); }\n';
    if (cmpTypeFound['vec2'])
        stream += 'bool isOk (vec2 a, vec2 b, float eps) { return all(lessThanEqual(abs(a-b), (eps*abs(b) + eps))); }\n';
    if (cmpTypeFound['vec3'])
        stream += 'bool isOk (vec3 a, vec3 b, float eps) { return all(lessThanEqual(abs(a-b), (eps*abs(b) + eps))); }\n';
    if (cmpTypeFound['vec4'])
        stream += 'bool isOk (vec4 a, vec4 b, float eps) { return all(lessThanEqual(abs(a-b), (eps*abs(b) + eps))); }\n';

    if (cmpTypeFound['mat2'])
        stream += 'bool isOk (mat2 a, mat2 b, float eps) { vec2 diff = max(abs(a[0]-b[0]), abs(a[1]-b[1])); return all(lessThanEqual(diff, vec2(eps))); }\n';
    if (cmpTypeFound['mat2x3'])
        stream += 'bool isOk (mat2x3 a, mat2x3 b, float eps) { vec3 diff = max(abs(a[0]-b[0]), abs(a[1]-b[1])); return all(lessThanEqual(diff, vec3(eps))); }\n';
    if (cmpTypeFound['mat2x4'])
        stream += 'bool isOk (mat2x4 a, mat2x4 b, float eps) { vec4 diff = max(abs(a[0]-b[0]), abs(a[1]-b[1])); return all(lessThanEqual(diff, vec4(eps))); }\n';
    if (cmpTypeFound['mat3x2'])
        stream += 'bool isOk (mat3x2 a, mat3x2 b, float eps) { vec2 diff = max(max(abs(a[0]-b[0]), abs(a[1]-b[1])), abs(a[2]-b[2])); return all(lessThanEqual(diff, vec2(eps))); }\n';
    if (cmpTypeFound['mat3'])
        stream += 'bool isOk (mat3 a, mat3 b, float eps) { vec3 diff = max(max(abs(a[0]-b[0]), abs(a[1]-b[1])), abs(a[2]-b[2])); return all(lessThanEqual(diff, vec3(eps))); }\n';
    if (cmpTypeFound['mat3x4'])
        stream += 'bool isOk (mat3x4 a, mat3x4 b, float eps) { vec4 diff = max(max(abs(a[0]-b[0]), abs(a[1]-b[1])), abs(a[2]-b[2])); return all(lessThanEqual(diff, vec4(eps))); }\n';
    if (cmpTypeFound['mat4x2'])
        stream += 'bool isOk (mat4x2 a, mat4x2 b, float eps) { vec2 diff = max(max(abs(a[0]-b[0]), abs(a[1]-b[1])), max(abs(a[2]-b[2]), abs(a[3]-b[3]))); return all(lessThanEqual(diff, vec2(eps))); }\n';
    if (cmpTypeFound['mat4x3'])
        stream += 'bool isOk (mat4x3 a, mat4x3 b, float eps) { vec3 diff = max(max(abs(a[0]-b[0]), abs(a[1]-b[1])), max(abs(a[2]-b[2]), abs(a[3]-b[3]))); return all(lessThanEqual(diff, vec3(eps))); }\n';
    if (cmpTypeFound['mat4'])
        stream += 'bool isOk (mat4 a, mat4 b, float eps) { vec4 diff = max(max(abs(a[0]-b[0]), abs(a[1]-b[1])), max(abs(a[2]-b[2]), abs(a[3]-b[3]))); return all(lessThanEqual(diff, vec4(eps))); }\n';

    return stream;
};

/**
 * @param {string} dstVec4Var
 * @param {Array.<Object>} valueBlock
 * @param {string} nonFloatNamePrefix
 * @param {string} checkVarName
 * @return {string} output
 */
var genCompareOp = function(dstVec4Var, valueBlock, nonFloatNamePrefix, checkVarName) {

    /** @type {boolean} */ var isFirstOutput = true;
    /** @type {string} */ var output = '';

    for (var ndx = 0; ndx < valueBlock.values.length; ndx++) {
    /** @type {Array} */ var val = valueBlock.values[ndx];
    /** @type {string} */ var valueName = val.valueName;

        if (val.storageType === shaderCase.value.STORAGE_OUTPUT) {
            // Check if we're only interested in one variable (then skip if not the right one).
            if (checkVarName && (valueName !== checkVarName))
                continue;

            // Prefix.
            if (isFirstOutput)
            {
                output += 'bool RES = ';
                isFirstOutput = false;
            }
            else
                output += 'RES = RES && ';

            // Generate actual comparison.
            if (deqpUtils.getDataTypeScalarType(val.dataType) === 'float')
                output += 'isOk(' + valueName + ', ref_' + valueName + ', 0.05);\n';
            else
                output += 'isOk(' + nonFloatNamePrefix + valueName + ', ref_' + valueName + ');\n';
        }
        // \note Uniforms are already declared in shader.
    }

    if (isFirstOutput)
        output += dstVec4Var + ' = vec4(1.0);\n';  // \todo [petri] Should we give warning if not expect-failure case?
    else
        output += dstVec4Var + ' = vec4(RES, RES, RES, 1.0);\n';

    return output;
};

/**
 * @param {Array.<Object>} valueBlock
 * @return {string} shader
 */
var genFragmentShader = function(valueBlock) {
    /** @type {string} */ var shader = '';
    /** @type {Object} */ var state = deqpTests.runner.getState();
    /** @type {boolean} */ var usesInout = usesShaderInoutQualifiers(state.currentTest.spec.targetVersion);
    /** @type {string} */ var vtxIn = usesInout ? 'in' : 'attribute';
    /** @type {string} */ var vtxOut = usesInout ? 'out' : 'varying';
    /** @type {boolean} */ var customColorOut = usesInout;
    /** @type {string} */ var fragIn = usesInout ? 'in' : 'varying';
    /** @type {string} */ var prec = supportsFragmentHighp(state.currentTest.spec.targetVersion) ? 'highp' : 'mediump';

    shader += '#version ' + state.currentTest.spec.targetVersion + '\n';


    shader += 'precision ' + prec + ' float;\n';
    shader += 'precision ' + prec + ' int;\n';
    shader += '\n';

    if (customColorOut)
    {
        shader += 'layout(location = 0) out mediump vec4 dEQP_FragColor;\n';
        shader += '\n';
    }

    shader += genCompareFunctions(valueBlock, true);
    shader += '\n';

    // Declarations (varying, reference for each output).
    for (var ndx = 0; ndx < valueBlock.values.length; ndx++) {
    /** @type {Array} */ var val = valueBlock.values[ndx];
    /** @type {string} */ var floatType = deqpUtils.getDataTypeFloatScalars(val.dataType);
    /** @type {string} */ var refType = deqpUtils.getDataTypeName(val.dataType);

        if (val.storageType == shaderCase.value.STORAGE_OUTPUT)
        {
            if (deqpUtils.getDataTypeScalarType(val.dataType) === 'float')
                shader += fragIn + ' ' + floatType + ' ' + val.valueName + ';\n';
            else
                shader += fragIn + ' ' + floatType + ' v_' + val.valueName + ';\n';

            shader += 'uniform ' + refType + ' ref_' + val.valueName + ';\n';
        }
    }

    shader += '\n';
    shader += 'void main()\n';
    shader += '{\n';

    shader += '\t';
    shader += genCompareOp(customColorOut ? 'dEQP_FragColor' : 'gl_FragColor', valueBlock, 'v_', null);

    shader += '}\n';
    return shader;
};

var caseRequirement = (function() {

var CaseRequirement = function() {

/**
 * @param {number} shaderType
 * @return {boolean}
 */
    this.isAffected = function(shaderType) {
        for (var i = 0; i < this.shaderTypes.length; i++)
            if (this.shaderTypes[i] === shaderType)
                return true;
        return false;
    };

    this.checkRequirements = function(gl) {
        if (this.type === requirementType.EXTENSION) {
            var extns = gl.getSupportedExtensions();
            for (var i = 0; i < extns.length; i++)
                for (var j = 0; j < this.requirements.length; j++)
                    if (extns[i] === this.requirements[j]) {
                        this.supportedExtension = this.requirements[j];
                        return true;
                    }
            if (this.requirements.length === 1)
                throw Error('Test requires extension of ' + this.requirements[0]);
            else
                throw Error('Test requires any extension of ' + this.requirements);
        } else if (this.type === requirementType.IMPLEMENTATION_LIMIT) {
            var value = gl.getParameter(this.enumName);
            assertMsgOptions(gl.getError() === gl.NO_ERROR, 'Failed to read parameter ' + this.enumName, false, true);

            if (!(value > this.referenceValue))
                throw Error('Test requires ' + this.enumName + ' (' + value + ') > ' + this.referenceValue);
        }
    };

    this.getSupportedExtension = function() {
        return this.supportedExtension;
    };

};

var createAnyExtensionRequirement = function(requirements, shaderTypes) {
    var cr = new CaseRequirement();
    cr.type = requirementType.EXTENSION;
    cr.requirements = requirements;
    cr.shaderTypes = shaderTypes;
    return cr;
};

var createLimitRequirement = function(enumName, ref) {
    var cr = new CaseRequirement();
    cr.type = requirementType.IMPLEMENTATION_LIMIT;
    cr.enumName = enumName;
    cr.referenceValue = ref;
};

/**
 * @enum {number}
 */
var requirementType = {
    EXTENSION: 0,
    IMPLEMENTATION_LIMIT: 1
};

return {
    createAnyExtensionRequirement: createAnyExtensionRequirement,
    createLimitRequirement: createLimitRequirement,
    requirementType: requirementType
};

}());

/** Specialize a shader only for the vertex test case.
 * @param {string} baseCode
 * @param {number} shaderType
 * @param {Array.<Object>} requirements
 * @return {string} resultBuf
 */
var injectExtensionRequirements = function(baseCode, shaderType, requirements) {
/**
 * @param {Array.<Object>} requirements
 * @param {number} shaderType
 * @return {string} buf
 */
    var generateExtensionStatements = function(requirements, shaderType) {
        /** @type {string} */ var buf = '';

        if (requirements)
            for (var ndx = 0; ndx < requirements.length; ndx++)
                if (requirements[ndx].type === caseRequirement.requirementType.EXTENSION &&
                    requirements[ndx].isAffected(shaderType))
                    buf += '#extension ' + requirements[ndx].getSupportedExtension() + ' : require\n';

        return buf;
    };

    /** @type {string} */ var extensions = generateExtensionStatements(requirements, shaderType);

    if (extensions.length === 0)
        return baseCode;

    /** @type {string} */ var splitLines = baseCode.split('\n');
    /** @type {boolean} */ var firstNonPreprocessorLine = true;
    /** @type {string} */ var resultBuf = '';

    for (var i = 0; i < splitLines.length; i++) {
        /** @const @type {boolean} */ var isPreprocessorDirective = (splitLines[i].match(/^\s*#/) !== null);

        if (!isPreprocessorDirective && firstNonPreprocessorLine)
        {
            firstNonPreprocessorLine = false;
            resultBuf += extensions;
        }

        resultBuf += splitLines[i] + '\n';
    }

    return resultBuf;
};


/** Specialize a shader for the vertex shader test case.
 * @param {string} src
 * @param {Array.<Object>} valueBlock
 * @return {string} withExt
 */
var specializeVertexShader = function(src, valueBlock) {
    /** @type {string} */ var decl = '';
    /** @type {string} */ var setup = '';
    /** @type {string} */ var output = '';
    /** @type {Object} */ var state = deqpTests.runner.getState();
    /** @type {boolean} */ var usesInout = usesShaderInoutQualifiers(state.currentTest.spec.targetVersion);
    /** @type {string} */ var vtxIn = usesInout ? 'in' : 'attribute';
    /** @type {string} */ var vtxOut = usesInout ? 'out' : 'varying';

    // Output (write out position).
    output += 'gl_Position = dEQP_Position;\n';

    // Declarations (position + attribute for each input, varying for each output).
    decl += vtxIn + ' highp vec4 dEQP_Position;\n';
    for (var ndx = 0; ndx < valueBlock.values.length; ndx++) {
    /** @type {Array} */ var val = valueBlock.values[ndx];
    /** @type {string} */ var valueName = val.valueName;
    /** @type {string} */ var floatType = deqpUtils.getDataTypeFloatScalars(val.dataType);
    /** @type {string} */ var dataTypeName = deqpUtils.getDataTypeName(val.dataType);

        if (val.storageType === shaderCase.value.STORAGE_INPUT)
        {
            if (deqpUtils.getDataTypeScalarType(val.dataType) === 'float')
            {
                decl += vtxIn + ' ' + floatType + ' ' + valueName + ';\n';
            }
            else
            {
                decl += vtxIn + ' ' + floatType + ' a_' + valueName + ';\n';
                setup += dataTypeName + ' ' + valueName + ' = ' + dataTypeName + '(a_' + valueName + ');\n';
            }
        }
        else if (val.storageType === shaderCase.value.STORAGE_OUTPUT)
        {
            if (deqpUtils.getDataTypeScalarType(val.dataType) === 'float')
                decl += vtxOut + ' ' + floatType + ' ' + valueName + ';\n';
            else
            {
                decl += vtxOut + ' ' + floatType + ' v_' + valueName + ';\n';
                decl += dataTypeName + ' ' + valueName + ';\n';

                output += 'v_' + valueName + ' = ' + floatType + '(' + valueName + ');\n';
            }
        }
    }

    /** @type {string} */
    var baseSrc = src
                    .replace(/\$\{DECLARATIONS\}/g, decl)
                    .replace(/\$\{DECLARATIONS:single-line\}/g, decl.replace(/\n/g, ' '))
                    .replace(/\$\{SETUP\}/g, setup)
                    .replace(/\$\{OUTPUT\}/g, output)
                    .replace(/\$\{POSITION_FRAG_COLOR\}/g, 'gl_Position');

    /** @type {string} */
    var withExt = injectExtensionRequirements(baseSrc, deqpProgram.shaderType.VERTEX, state.currentTest.spec.requirements);

    return withExt;
};

/** Specialize a shader only for the vertex test case.
 * @param {string} src
 * @param {Array.<Object>} valueBlock
 * @return {string} withExt
 */
var specializeVertexOnly = function(src, valueBlock) {
    /** @type {string} */ var decl = '';
    /** @type {string} */ var setup = '';
    /** @type {string} */ var output = '';
    /** @type {Object} */ var state = deqpTests.runner.getState();
    /** @type {boolean} */ var usesInout = usesShaderInoutQualifiers(state.currentTest.spec.targetVersion);
    /** @type {string} */ var vtxIn = usesInout ? 'in' : 'attribute';

    // Output (write out position).
    output += 'gl_Position = dEQP_Position;\n';

    // Declarations (position + attribute for each input, varying for each output).
    decl += vtxIn + ' highp vec4 dEQP_Position;\n';

    for (var ndx = 0; ndx < valueBlock.values.length; ndx++) {
    /** @type {Array} */ var val = valueBlock.values[ndx];
    /** @type {string} */ var valueName = val.valueName;
    /** @type {string} */ var type = deqpUtils.getDataTypeName(val.dataType);

        if (val.storageType === shaderCase.value.STORAGE_INPUT)
        {
            if (deqpUtils.getDataTypeScalarType(val.dataType) === 'float')
            {
                decl += vtxIn + ' ' + type + ' ' + valueName + ';\n';
            }
            else
            {
                /** @type {string} */ var floatType = deqpUtils.getDataTypeFloatScalars(val.dataType);

                decl += vtxIn + ' ' + floatType + ' a_' + valueName + ';\n';
                setup += type + ' ' + valueName + ' = ' + type + '(a_' + valueName + ');\n';
            }
        }
        else if (val.storageType === shaderCase.value.STORAGE_UNIFORM &&
                    !val.valueName.match('\\.'))
            decl += 'uniform ' + type + ' ' + valueName + ';\n';
    }

    /** @type {string} */
    var baseSrc = src
                    .replace(/\$\{VERTEX_DECLARATIONS\}/g, decl)
                    .replace(/\$\{VERTEX_DECLARATIONS:single-line\}/g, decl.replace(/\n/g, ' '))
                    .replace(/\$\{VERTEX_SETUP\}/g, setup)
                    .replace(/\$\{VERTEX_OUTPUT\}/g, output);

    /** @type {string} */
    var withExt = injectExtensionRequirements(baseSrc, deqpProgram.shaderType.VERTEX, state.currentTest.spec.requirements);

    return withExt;
};

/** Specialize a shader for the fragment shader test case.
 * @param {string} src
 * @param {Array.<Object>} valueBlock
 * @return {string} withExt
 */
var specializeFragmentShader = function(src, valueBlock) {
    /** @type {string} */ var decl = '';
    /** @type {string} */ var setup = '';
    /** @type {string} */ var output = '';

    /** @type {Object} */ var state = deqpTests.runner.getState();

    /** @type {boolean} */ var usesInout = usesShaderInoutQualifiers(state.currentTest.spec.targetVersion);
    /** @type {boolean} */ var customColorOut = usesInout;
    /** @type {string} */ var fragIn = usesInout ? 'in' : 'varying';
    /** @type {string} */ var fragColor = customColorOut ? 'dEQP_FragColor' : 'gl_FragColor';

    decl += genCompareFunctions(valueBlock, false);
    output += genCompareOp(fragColor, valueBlock, '', null);

    if (customColorOut)
        decl += 'layout(location = 0) out mediump vec4 dEQP_FragColor;\n';

    for (var ndx = 0; ndx < valueBlock.values.length; ndx++) {
    /** @type {Array} */ var val = valueBlock.values[ndx];
    /** @type {string} */ var valueName = val.valueName;
    /** @type {string} */ var floatType = deqpUtils.getDataTypeFloatScalars(val.dataType);
    /** @type {string} */ var refType = deqpUtils.getDataTypeName(val.dataType);

        if (val.storageType === shaderCase.value.STORAGE_INPUT)
        {
            if (deqpUtils.getDataTypeScalarType(val.dataType) === 'float')
                decl += fragIn + ' ' + floatType + ' ' + valueName + ';\n';
            else
            {
                decl += fragIn + ' ' + floatType + ' v_' + valueName + ';\n';
                var offset = deqpUtils.isDataTypeIntOrIVec(val.dataType) ? ' * 1.0025' : ''; // \todo [petri] bit of a hack to avoid errors in chop() due to varying interpolation
                setup += refType + ' ' + valueName + ' = ' + refType + '(v_' + valueName + offset + ');\n';
            }
        }
        else if (val.storageType === shaderCase.value.STORAGE_OUTPUT)
        {
            decl += 'uniform ' + refType + ' ref_' + valueName + ';\n';
            decl += refType + ' ' + valueName + ';\n';
        }
    }

    /* \todo [2010-04-01 petri] Check all outputs. */

    /** @type {string} */
    var baseSrc = src
                    .replace(/\$\{DECLARATIONS\}/g, decl)
                    .replace(/\$\{DECLARATIONS:single-line\}/g, decl.replace(/\n/g, ' '))
                    .replace(/\$\{SETUP\}/g, setup)
                    .replace(/\$\{OUTPUT\}/g, output)
                    .replace(/\$\{POSITION_FRAG_COLOR\}/g, fragColor);

    /** @type {string} */
    var withExt = injectExtensionRequirements(baseSrc, deqpProgram.shaderType.FRAGMENT, state.currentTest.spec.requirements);

    return withExt;
};

/** Specialize a shader only for the fragment test case.
 * @param {string} src
 * @param {Array.<Object>} valueBlock
 * @return {string} withExt
 */
var specializeFragmentOnly = function(src, valueBlock) {
    /** @type {string} */ var decl = '';
    /** @type {string} */ var output = '';
    /** @type {Object} */ var state = deqpTests.runner.getState();
    /** @type {boolean} */ var usesInout = usesShaderInoutQualifiers(state.currentTest.spec.targetVersion);
    /** @type {boolean} */ var customColorOut = usesInout;
    /** @type {string} */ var fragIn = usesInout ? 'in' : 'varying';
    /** @type {string} */ var fragColor = customColorOut ? 'dEQP_FragColor' : 'gl_FragColor';

    decl += genCompareFunctions(valueBlock, false);
    output += genCompareOp(fragColor, valueBlock, '', null);

    if (customColorOut)
        decl += 'layout(location = 0) out mediump vec4 dEQP_FragColor;\n';

    for (var ndx = 0; ndx < valueBlock.values.length; ndx++) {
    /** @type {Array} */ var val = valueBlock.values[ndx];
    /** @type {string} */ var valueName = val.valueName;
    /** @type {string} */ var floatType = deqpUtils.getDataTypeFloatScalars(val.dataType);
    /** @type {string} */ var refType = deqpUtils.getDataTypeName(val.dataType);

        if (val.storageType === shaderCase.value.STORAGE_OUTPUT) {
            decl += 'uniform ' + refType + ' ref_' + valueName + ';\n';
            decl += refType + ' ' + valueName + ';\n';
        } else if (val.storageType === shaderCase.value.STORAGE_UNIFORM &&
                   !valueName.match('\\.'))
            decl += 'uniform ' + refType + ' ' + valueName + ';\n';
    }

    /** @type {string} */
    var baseSrc = src
                     .replace(/\$\{FRAGMENT_DECLARATIONS\}/g, decl)
                     .replace(/\$\{FRAGMENT_DECLARATIONS:single-line\}/g, decl.replace(/\n/g, ' '))
                     .replace(/\$\{FRAGMENT_OUTPUT\}/g, output)
                     .replace(/\$\{FRAG_COLOR\}/g, fragColor);

    /** @type {string} */
    var withExt = injectExtensionRequirements(baseSrc, deqpProgram.shaderType.FRAGMENT, state.currentTest.spec.requirements);

    return withExt;
};

/**
 * Is tessellation present
 * @return {boolean} True if tessellation is present
 */
var isTessellationPresent = function() {
    /* TODO: GLES 3.1: implement */
    return false;
};

var setUniformValue = function(gl, pipelinePrograms, name, val, arrayNdx) {
    /** @type {boolean} */ var foundAnyMatch = false;

    for (var programNdx = 0; programNdx < pipelinePrograms.length; ++programNdx)
    {
        /** @const @type {WebGLUniformLocation} */ var loc = gl.getUniformLocation(pipelinePrograms[programNdx], name);
        /** @const @type {number} */ var scalarSize = deqpUtils.getDataTypeScalarSize(val.dataType);
        /** @const @type {number} */ var elemNdx = (val.arrayLength === 1) ? (0) : (arrayNdx * scalarSize);

        if (!loc)
            continue;

        foundAnyMatch = true;

        gl.useProgram(pipelinePrograms[programNdx]);

        /** @type {Array} */ var element = val.elements.slice(elemNdx, elemNdx + scalarSize);
        switch (val.dataType)
        {
            case deqpUtils.DataType.FLOAT: gl.uniform1fv(loc, new Float32Array(element)); break;
            case deqpUtils.DataType.FLOAT_VEC2: gl.uniform2fv(loc, new Float32Array(element)); break;
            case deqpUtils.DataType.FLOAT_VEC3: gl.uniform3fv(loc, new Float32Array(element)); break;
            case deqpUtils.DataType.FLOAT_VEC4: gl.uniform4fv(loc, new Float32Array(element)); break;
            case deqpUtils.DataType.FLOAT_MAT2: gl.uniformMatrix2fv(loc, gl.FALSE, new Float32Array(element)); break;
            case deqpUtils.DataType.FLOAT_MAT3: gl.uniformMatrix3fv(loc, gl.FALSE, new Float32Array(element)); break;
            case deqpUtils.DataType.FLOAT_MAT4: gl.uniformMatrix4fv(loc, gl.FALSE, new Float32Array(element)); break;
            case deqpUtils.DataType.INT: gl.uniform1iv(loc, new Int32Array(element)); break;
            case deqpUtils.DataType.INT_VEC2: gl.uniform2iv(loc, new Int32Array(element)); break;
            case deqpUtils.DataType.INT_VEC3: gl.uniform3iv(loc, new Int32Array(element)); break;
            case deqpUtils.DataType.INT_VEC4: gl.uniform4iv(loc, new Int32Array(element)); break;

            /** TODO: What type should be used for bool uniforms? */
            case deqpUtils.DataType.BOOL: gl.uniform1iv(loc, new Int32Array(element)); break;
            case deqpUtils.DataType.BOOL_VEC2: gl.uniform2iv(loc, new Int32Array(element)); break;
            case deqpUtils.DataType.BOOL_VEC3: gl.uniform3iv(loc, new Int32Array(element)); break;
            case deqpUtils.DataType.BOOL_VEC4: gl.uniform4iv(loc, new Int32Array(element)); break;

            case deqpUtils.DataType.UINT: gl.uniform1uiv(loc, new Uint32Array(element)); break;
            case deqpUtils.DataType.UINT_VEC2: gl.uniform2uiv(loc, new Uint32Array(element)); break;
            case deqpUtils.DataType.UINT_VEC3: gl.uniform3uiv(loc, new Uint32Array(element)); break;
            case deqpUtils.DataType.UINT_VEC4: gl.uniform4uiv(loc, new Uint32Array(element)); break;
            case deqpUtils.DataType.FLOAT_MAT2X3: gl.uniformMatrix2x3fv(loc, gl.FALSE, new Float32Array(element)); break;
            case deqpUtils.DataType.FLOAT_MAT2X4: gl.uniformMatrix2x4fv(loc, gl.FALSE, new Float32Array(element)); break;
            case deqpUtils.DataType.FLOAT_MAT3X2: gl.uniformMatrix3x2fv(loc, gl.FALSE, new Float32Array(element)); break;
            case deqpUtils.DataType.FLOAT_MAT3X4: gl.uniformMatrix3x4fv(loc, gl.FALSE, new Float32Array(element)); break;
            case deqpUtils.DataType.FLOAT_MAT4X2: gl.uniformMatrix4x2fv(loc, gl.FALSE, new Float32Array(element)); break;
            case deqpUtils.DataType.FLOAT_MAT4X3: gl.uniformMatrix4x3fv(loc, gl.FALSE, new Float32Array(element)); break;

            default:
                testFailed('Unknown data type ' + val.dataType);
        }
    }

    if (!foundAnyMatch)
        bufferedLogToConsole('WARNING // Uniform \"' + name + '\" location is not valid, location = -1. Cannot set value to the uniform.');
};

/**
 * Evaluates pixels, if they are white, black or there is any unexpected result
 * @param {deqpDraw.Surface} surface
 * @param {number} minX
 * @param {number} maxX
 * @param {number} minY
 * @param {number} maxY
 * @return {boolean} True if tessellation is present
 */
var checkPixels = function(surface, minX, maxX, minY, maxY) {
    /** @type {boolean} */ var allWhite = true;
    /** @type {boolean} */ var allBlack = true;
    /** @type {boolean} */ var anyUnexpected = false;

    assertMsgOptions((maxX > minX) && (maxY > minY), 'checkPixels sanity check', false, true);

    for (var y = minY; y <= maxY; y++) {
        for (var x = minX; x <= maxX; x++) {
            /** @type {Pixel} */ var pixel = surface.getPixel(x, y);
            // Note: we really do not want to involve alpha in the check comparison
            // \todo [2010-09-22 kalle] Do we know that alpha would be one? If yes, could use color constants white and black.
            /** @type {boolean} */ var isWhite = (pixel.getRed() == 255) && (pixel.getGreen() == 255) && (pixel.getBlue() == 255);
            /** @type {boolean} */ var isBlack = (pixel.getRed() == 0) && (pixel.getGreen() == 0) && (pixel.getBlue() == 0);

            allWhite = allWhite && isWhite;
            allBlack = allBlack && isBlack;
            anyUnexpected = anyUnexpected || (!isWhite && !isBlack);
        }
    }

    if (!allWhite) {
        if (anyUnexpected)
            testFailed('WARNING: expecting all rendered pixels to be white or black, but got other colors as well!');
        else if (!allBlack)
            testFailed('WARNING: got inconsistent results over the image, when all pixels should be the same color!');

        return false;
    }
    return true;
};

/**
 * Initialize a test case
 */
var init = function() {
/** @type {Object} */ var state = deqpTests.runner.getState();
/** @type {Object} */ var test = state.currentTest;

    bufferedLogToConsole('Processing ' + test.fullName());

    if (!test.spec.valueBlockList.length)
        test.spec.valueBlockList.push(genValueBlock());
    /** @type {Array.<Object>} */ var valueBlock = test.spec.valueBlockList[0];

    if (test.spec.requirements)
        for (var ndx = 0; ndx < test.spec.requirements.length; ++ndx)
            test.spec.requirements[ndx].checkRequirements();

    /** @type {Array.<deqpProgram.ShaderInfo>} */ var sources = [];

    if (test.spec.caseType === caseType.CASETYPE_COMPLETE) {
    /** @type {string} */ var vertex = specializeVertexOnly(test.spec.vertexSource, valueBlock);
    /** @type {string} */ var fragment = specializeFragmentOnly(test.spec.fragmentSource, valueBlock);
        sources.push(deqpProgram.genVertexSource(vertex));
        sources.push(deqpProgram.genFragmentSource(fragment));
    } else if (test.spec.caseType === caseType.CASETYPE_VERTEX_ONLY) {
        sources.push(deqpProgram.genVertexSource(specializeVertexShader(test.spec.vertexSource, valueBlock)));
        sources.push(deqpProgram.genFragmentSource(genFragmentShader(valueBlock)));
    } else if (test.spec.caseType === caseType.CASETYPE_FRAGMENT_ONLY) {
        sources.push(deqpProgram.genVertexSource(genVertexShader(valueBlock)));
        sources.push(deqpProgram.genFragmentSource(specializeFragmentShader(test.spec.fragmentSource, valueBlock)));
    }

    test.programs = [];
    test.programs.push(
        {
            programSources: {
                sources: sources
            }
        }
    );


};

/**
 * Execute a test case
 * @return {boolean} True if test case passed
 */
var execute = function()
{
    /** @const @type {number} */ var quadSize = 1.0;
    /** @const @type {Array.<number>} */
    var s_positions = [
        -quadSize, -quadSize, 0.0, 1.0,
        -quadSize, +quadSize, 0.0, 1.0,
        +quadSize, -quadSize, 0.0, 1.0,
        +quadSize, +quadSize, 0.0, 1.0
    ];

    /** @const @type {Array.<number>} */
    var s_indices = [
        0, 1, 2,
        1, 3, 2
    ];

    var wtu = WebGLTestUtils;
    /** @type {WebGLRenderingContext}c */ var gl = wtu.create3DContext('canvas');
    /** @type {Object} */ var state = deqpTests.runner.getState();
    /** @type {Object} */ var test = state.currentTest;
    /** @type {Object} */ var spec = test.spec;

    // Compute viewport.
    /* TODO: original code used random number generator to compute viewport, we use whole canvas */
    /** @const @type {number} */ var width = Math.min(canvas.width, VIEWPORT_WIDTH);
    /** @const @type {number} */ var height = Math.min(canvas.height, VIEWPORT_HEIGHT);
    /** @const @type {number} */ var viewportX = 0;
    /** @const @type {number} */ var viewportY = 0;
    /** @const @type {number} */ var numVerticesPerDraw = 4;
    /** @const @type {boolean} */ var tessellationPresent = isTessellationPresent();

    /** @type {boolean} */ var allCompilesOk = true;
    /** @type {boolean} */ var allLinksOk = true;
    /** @type {string} */ var failReason = null;

    /** @type {number} */ var vertexProgramID = -1;
    /** @type {Array.<deqpProgram.Program.program>} */ var pipelineProgramIDs = [];
    /** @type {Array.<deqpProgram.ShaderProgram>} */ var programs = [];
    var programPipeline;

    // Set the name of the current test so testFailedOptions/testPassedOptions can use it.
    setCurrentTestName(test.fullName());
    debug('Start testcase: ' + test.fullName());
    assertMsgOptions(gl.getError() === gl.NO_ERROR, 'Start testcase: ' + test.fullName(), false, true);

    if (!test.separatePrograms)
    {
    /** @type {deqpProgram.ShaderProgram} */ var program = new deqpProgram.ShaderProgram(gl, test.programs[0].programSources);

        vertexProgramID = program.getProgram();
        pipelineProgramIDs.push(program.getProgram());
        programs.push(program);

        // Check that compile/link results are what we expect.


        for (var i = 0; i < program.shaders.length; i++) {
            if (!program.shaders[i].info.compileOk)
                allCompilesOk = false;
        }

        if (!program.getProgramInfo().linkOk)
            allLinksOk = false;


    }
    else
    {
        /* TODO: GLES 3.1: Port program pipeline code */
    }

    switch (spec.expectResult)
    {
        case expectResult.EXPECT_PASS:
        case expectResult.EXPECT_VALIDATION_FAIL:
            if (!allCompilesOk)
                failReason = 'expected shaders to compile and link properly, but failed to compile.';
            else if (!allLinksOk)
                failReason = 'expected shaders to compile and link properly, but failed to link.';
            break;

        case expectResult.EXPECT_COMPILE_FAIL:
            if (allCompilesOk && !allLinksOk)
                failReason = 'expected compilation to fail, but shaders compiled and link failed.';
            else if (allCompilesOk)
                failReason = 'expected compilation to fail, but shaders compiled correctly.';
            break;

        case expectResult.EXPECT_LINK_FAIL:
            if (!allCompilesOk)
                failReason = 'expected linking to fail, but unable to compile.';
            else if (allLinksOk)
                failReason = 'expected linking to fail, but passed.';
            break;

        case expectResult.EXPECT_COMPILE_LINK_FAIL:
            if (allCompilesOk && allLinksOk)
                failReason = 'expected compile or link to fail, but passed.';
            break;

        default:
            testFailedOptions('Unknown expected result', true);
            return false;
    }

    if (failReason != null)
    {
        // \todo [2010-06-07 petri] These should be handled in the test case?
        bufferedLogToConsole('ERROR: ' + failReason);

        // If implementation parses shader at link time, report it as quality warning.
        if (spec.expectResult === expectResult.EXPECT_COMPILE_FAIL && allCompilesOk && !allLinksOk)
            bufferedLogToConsole('Quality warning: implementation parses shader at link time');

        testFailedOptions(failReason, true);
        return false;
    }

    // Return if compile/link expected to fail.
    if (spec.expectResult === expectResult.EXPECT_COMPILE_FAIL ||
        spec.expectResult === expectResult.EXPECT_COMPILE_LINK_FAIL ||
        spec.expectResult === expectResult.EXPECT_LINK_FAIL) {
        testPassedOptions('Compile/link is expected to fail', true);
        setCurrentTestName('');
        return (failReason === null);
    }

    // Setup viewport.
    gl.viewport(viewportX, viewportY, width, height);

    if (spec.separatePrograms)
    {
        /** TODO: GLES 3.1 implement */
    }
    else
    {
        // Start using program
        gl.useProgram(vertexProgramID);
        assertMsgOptions(gl.getError() === gl.NO_ERROR, 'glUseProgram()', false, true);
    }

    // Fetch location for positions positions.
    /** @type {number} */ var positionLoc = gl.getAttribLocation(vertexProgramID, 'dEQP_Position');
    if (positionLoc === -1) {
        testFailedOptions("no location found for attribute 'dEQP_Position'", true);
        return false;
    }

    // Iterate all value blocks.
    for (var blockNdx = 0; blockNdx < spec.valueBlockList.length; blockNdx++)
    {
    /** {Array.<Object>} */ var block = spec.valueBlockList[blockNdx];

        // always render at least one pass even if there is no input/output data
        /** @const @type {number} */ var numRenderPasses = Math.max(block.arrayLength, 1);

        // Iterate all array sub-cases.
        for (var arrayNdx = 0; arrayNdx < numRenderPasses; arrayNdx++)
        {
            /** @const @type {number} */ var numValues = block.values.length;
            /** @type {deqpDraw.VertexArrayBinding} */ var vertexArrays = [];
            /** @type {number} */ var attribValueNdx = 0;
            /** @type {gl.enum} */ var postDrawError;
            var beforeDrawValidator = (
                new BeforeDrawValidator(
                                        gl,
                                        (spec.separatePrograms) ? (programPipeline.getPipeline()) : (vertexProgramID),
                                        (spec.separatePrograms) ? (targetType.PIPELINE) : (targetType.PROGRAM)
                                       )
            );

            vertexArrays.push(new deqpDraw.VertexArrayBinding(gl.FLOAT, positionLoc, 4, numVerticesPerDraw, s_positions));

            // Collect VA pointer for inputs
            for (var valNdx = 0; valNdx < numValues; valNdx++) {
                /** @const @type {Array} */ var val = block.values[valNdx];
                /** @const @type {string} */ var valueName = val.valueName;
                /** @const @type {string} */ var dataType = val.dataType;
                /** @const @type {number} */ var scalarSize = deqpUtils.getDataTypeScalarSize(val.dataType);

                if (val.storageType === shaderCase.value.STORAGE_INPUT)
                {
                    // Replicate values four times.
                /** @type {Array} */ var scalars = [];

                    if (deqpUtils.isDataTypeMatrix(dataType)) {
                        /** @type {number} */ var numCols = deqpUtils.getDataTypeMatrixNumColumns(dataType);
                        /** @type {number} */ var numRows = deqpUtils.getDataTypeMatrixNumRows(dataType);
                        for (var repNdx = 0; repNdx < numVerticesPerDraw; repNdx++)
                            for (var i = 0; i < numCols; i++)
                                for (var j = 0; j < numRows; j++)
                                    scalars[repNdx * numCols + i * numRows * numVerticesPerDraw + j] = val.elements[arrayNdx * scalarSize + i * numRows + j];
                    } else
                        for (var repNdx = 0; repNdx < numVerticesPerDraw; repNdx++)
                            for (var ndx = 0; ndx < scalarSize; ndx++)
                                scalars[repNdx * scalarSize + ndx] = val.elements[arrayNdx * scalarSize + ndx];

                                // Attribute name prefix.
                    /** @type {string} */ var attribPrefix = '';
                    // \todo [2010-05-27 petri] Should latter condition only apply for vertex cases (or actually non-fragment cases)?
                    if ((spec.caseType === caseType.CASETYPE_FRAGMENT_ONLY) || (deqpUtils.getDataTypeScalarType(dataType) !== 'float'))
                        attribPrefix = 'a_';

                    // Input always given as attribute.
                    /** @type {string} */ var attribName = attribPrefix + valueName;
                    /** @type {number} */ var attribLoc = gl.getAttribLocation(vertexProgramID, attribName);
                    if (attribLoc === -1) {
                        bufferedLogToConsole("Warning: no location found for attribute '" + attribName + "'");
                        continue;
                    }

                    if (deqpUtils.isDataTypeMatrix(dataType)) {
                        /** @type {number} */ var numCols = deqpUtils.getDataTypeMatrixNumColumns(dataType);
                        /** @type {number} */ var numRows = deqpUtils.getDataTypeMatrixNumRows(dataType);

                        assertMsgOptions(scalarSize === numCols * numRows, 'Matrix size sanity check', false, true);

                        /** @type {number} */ var colSize = numRows * numVerticesPerDraw;
                        for (var i = 0; i < numCols; i++) {
                        /** @type {Array} */ var colData = scalars.slice(i * colSize, (i + 1) * colSize);
                            vertexArrays.push(new deqpDraw.VertexArrayBinding(gl.FLOAT, attribLoc + i, numRows, numVerticesPerDraw, colData));
                        }
                    }
                    else
                            vertexArrays.push(new deqpDraw.VertexArrayBinding(gl.FLOAT, attribLoc, scalarSize, numVerticesPerDraw, scalars));

                    assertMsgOptions(gl.getError() === gl.NO_ERROR, 'set vertex attrib array', false, true);
                }
            }

            assertMsgOptions(gl.getError() === gl.NO_ERROR, 'before set uniforms', false, true);

            // set uniform values for outputs (refs).
            for (var valNdx = 0; valNdx < numValues; valNdx++)
            {
            /** @type {Array} */ var val1 = block.values[valNdx];
            /** @type {string} */ var valueName1 = val1.valueName;

                if (val1.storageType === shaderCase.value.STORAGE_OUTPUT)
                {
                    // Set reference value.
                    setUniformValue(gl, pipelineProgramIDs, 'ref_' + valueName1, val1, arrayNdx);
                    assertMsgOptions(gl.getError() === gl.NO_ERROR, 'set reference uniforms', false, true);
                }
                else if (val1.storageType === shaderCase.value.STORAGE_UNIFORM)
                {
                    setUniformValue(gl, pipelineProgramIDs, valueName1, val1, arrayNdx);
                    assertMsgOptions(gl.getError() === gl.NO_ERROR, 'set uniforms', false, true);
                }
            }

            // Clear.
            gl.clearColor(0.125, 0.25, 0.5, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);
            assertMsgOptions(gl.getError() === gl.NO_ERROR, 'clear buffer', false, true);

            // Use program or pipeline
            if (spec.separatePrograms)
                gl.useProgram(0);
            else
                gl.useProgram(vertexProgramID);

            // Draw.
            if (tessellationPresent)
            {
                gl.patchParameteri(gl.GL_PATCH_VERTICES, 3);
                assertMsgOptions(gl.getError() === gl.NO_ERROR, 'set patchParameteri(PATCH_VERTICES, 3)', false, true);
            }

            deqpDraw.draw(gl,
                 vertexProgramID,
                 vertexArrays,
                 (tessellationPresent) ?
                    (deqpDraw.patches(s_indices)) :
                    (deqpDraw.triangles(s_indices)),
                 (spec.expectResult === expectResult.EXPECT_VALIDATION_FAIL) ?
                    (beforeDrawValidator) :
                    (null));

            postDrawError = gl.getError();

            if (spec.expectResult === expectResult.EXPECT_PASS) {
                /** @type {deqpDraw.Surface} */ var surface = new deqpDraw.Surface();
                /** @const @type {number} */ var w = s_positions[3];
                /** @const @type {number} */ var minY = Math.ceil(((-quadSize / w) * 0.5 + 0.5) * height + 1.0);
                /** @const @type {number} */ var maxY = Math.floor(((+quadSize / w) * 0.5 + 0.5) * height - 0.5);
                /** @const @type {number} */ var minX = Math.ceil(((-quadSize / w) * 0.5 + 0.5) * width + 1.0);
                /** @const @type {number} */ var maxX = Math.floor(((+quadSize / w) * 0.5 + 0.5) * width - 0.5);

                assertMsgOptions(postDrawError === gl.NO_ERROR, 'draw', false, true);

                surface.readSurface(gl, viewportX, viewportY, width, height);
                assertMsgOptions(gl.getError() === gl.NO_ERROR, 'read pixels', false, true);

                if (!checkPixels(surface, minX, maxX, minY, maxY)) {
                    testFailedOptions((
                        'INCORRECT RESULT for (value block ' + (blockNdx + 1) +
                        ' of ' + spec.valueBlockList.length + ', sub-case ' +
                        (arrayNdx + 1) + ' of ' + block.arrayLength + '):'
                    ), true);

                    /* TODO: Port */
                    /*
                    log << TestLog::Message << "Failing shader input/output values:" << TestLog::EndMessage;
                    dumpValues(block, arrayNdx);

                    // Dump image on failure.
                    log << TestLog::Image("Result", "Rendered result image", surface);

                    */
                    gl.useProgram(null);

                    return false;
                }
            } else if (spec.expectResult === expectResult.EXPECT_VALIDATION_FAIL) {
                /** TODO: GLES 3.1: Implement */
                testFailedOptions('Unsupported test case', true);
            }
        }
    }
    gl.useProgram(null);
    if (spec.separatePrograms)
        gl.bindProgramPipeline(0);

    assertMsgOptions(gl.getError() === gl.NO_ERROR, '', true, true);
    setCurrentTestName('');

    return true;
};

var runTestCases = function() {
/** @type {Object} */ var state = deqpTests.runner.getState();
    state.currentTest = state.testCases.next(state.filter);
    if (state.currentTest) {
        try {
            init();
            execute();
        } catch (err) {
           bufferedLogToConsole(err);
        }
        deqpTests.runner.runCallback(runTestCases);
    } else
        deqpTests.runner.terminate();

};

var genValueBlock = function() {
    return {
    /** @type {Array} */ values: [],
    /** @type {number} */ arrayLength: 0
    };
};

return {
    runTestCases: runTestCases,
    expectResult: expectResult,
    caseType: caseType,
    shaderCase: shaderCase,
    genValueBlock: genValueBlock
};

});


