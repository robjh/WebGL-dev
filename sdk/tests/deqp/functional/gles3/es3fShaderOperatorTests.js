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
goog.provide('functional.gles3.es3fShaderOperatorTests');
goog.require('framework.common.tcuTestCase');
goog.require('framework.opengl.gluShaderUtil');
goog.require('framework.opengl.gluShaderProgram');
goog.require('framework.delibs.debase.deMath');
goog.require('modules.shared.glsShaderRenderCase');
goog.require('framework.common.tcuMatrix');



goog.scope(function() {
var es3fShaderOperatorTests = functional.gles3.es3fShaderOperatorTests;
var tcuTestCase = framework.common.tcuTestCase;
var gluShaderUtil = framework.opengl.gluShaderUtil;
var gluShaderProgram = framework.opengl.gluShaderProgram;
var deMath = framework.delibs.debase.deMath;
var glsShaderRenderCase = modules.shared.glsShaderRenderCase;
var tcuMatrix = framework.common.tcuMatrix;

/** @const */ es3fShaderOperatorTests.MAX_INPUTS = 3;

es3fShaderOperatorTests.stringJoin = function(elems, delim)
{
    var result = '';
    for (var i = 0; i < elems.length; i++)
        result += (i > 0 ? delim : "") + elems[i];
    return result;
};

es3fShaderOperatorTests.twoValuedVec4 = function(first, second, firstMask)
{
    var elems = [];
    for (var i = 0; i < 4; i++)
        elems[i] = firstMask[i] ? first : second;

    return "vec4(" + es3fShaderOperatorTests.stringJoin(elems, ", ") + ")";
};

var setParentClass = function(child, parent) {
    child.prototype = Object.create(parent.prototype);
    child.prototype.constructor = child;
};

var negate = function(x) {
    // TODO: add vertex and matrix ops if required
    return -x;
};

/**
 * @constructor
 * @param {boolean} low
 * @param {boolean} medium
 * @param {boolean} high
 */
es3fShaderOperatorTests.Precision = function(low, medium, high) {
    this.low = low;
    this.medium = medium;
    this.high = high;
};

/** @const */ es3fShaderOperatorTests.Precision.Low = new es3fShaderOperatorTests.Precision(true, false, false);
/** @const */ es3fShaderOperatorTests.Precision.Medium = new es3fShaderOperatorTests.Precision(false, true, false);
/** @const */ es3fShaderOperatorTests.Precision.High = new es3fShaderOperatorTests.Precision(false, false, true);
/** @const */ es3fShaderOperatorTests.Precision.LowMedium = new es3fShaderOperatorTests.Precision(true, true, false);
/** @const */ es3fShaderOperatorTests.Precision.MediumHigh = new es3fShaderOperatorTests.Precision(false, true, true);
/** @const */ es3fShaderOperatorTests.Precision.All = new es3fShaderOperatorTests.Precision(true, true, true);
/** @const */ es3fShaderOperatorTests.Precision.None = new es3fShaderOperatorTests.Precision(false, false, false);

/**
 * @enum
 */
es3fShaderOperatorTests.ValueType = {
    NONE          : 0,
    FLOAT         : (1<<0),   // float scalar
    FLOAT_VEC     : (1<<1),   // float vector
    FLOAT_GENTYPE : (1<<2),   // float scalar/vector
    VEC3          : (1<<3),   // vec3 only
    MATRIX        : (1<<4),   // matrix
    BOOL          : (1<<5),   // boolean scalar
    BOOL_VEC      : (1<<6),   // boolean vector
    BOOL_GENTYPE  : (1<<7),   // boolean scalar/vector
    INT           : (1<<8),   // int scalar
    INT_VEC       : (1<<9),   // int vector
    INT_GENTYPE   : (1<<10),  // int scalar/vector
    UINT          : (1<<11),  // uint scalar
    UINT_VEC      : (1<<12),  // uint vector
    UINT_GENTYPE  : (1<<13)  // uint scalar/vector
};

/**
 * @param {es3fShaderOperatorTests.ValueType} type
 * @return {boolean}
 */
es3fShaderOperatorTests.isBoolType = function(type) {
    return (type & (es3fShaderOperatorTests.ValueType.BOOL | es3fShaderOperatorTests.ValueType.BOOL_VEC | es3fShaderOperatorTests.ValueType.BOOL_GENTYPE)) != 0;
};

/**
 * @param {es3fShaderOperatorTests.ValueType} type
 * @return {boolean}
 */
es3fShaderOperatorTests.isIntType = function(type) {
    return (type & (es3fShaderOperatorTests.ValueType.INT | es3fShaderOperatorTests.ValueType.INT_VEC | es3fShaderOperatorTests.ValueType.INT_GENTYPE)) != 0;
};

/**
 * @param {es3fShaderOperatorTests.ValueType} type
 * @return {boolean}
 */
es3fShaderOperatorTests.isUintType = function(type) {
    return (type & (es3fShaderOperatorTests.ValueType.UINT | es3fShaderOperatorTests.ValueType.UINT_VEC | es3fShaderOperatorTests.ValueType.UINT_GENTYPE)) != 0;
};

/**
 * @param {es3fShaderOperatorTests.ValueType} type
 * @return {boolean}
 */
es3fShaderOperatorTests.isScalarType = function(type) {
    return type == es3fShaderOperatorTests.ValueType.FLOAT || type == es3fShaderOperatorTests.ValueType.BOOL || type == es3fShaderOperatorTests.ValueType.INT || type == es3fShaderOperatorTests.ValueType.UINT;    
};

/**
 * @param {es3fShaderOperatorTests.ValueType} type
 * @return {boolean}
 */
es3fShaderOperatorTests.isFloatType = function(type) {
    return (type & (es3fShaderOperatorTests.ValueType.FLOAT | es3fShaderOperatorTests.ValueType.FLOAT_VEC | es3fShaderOperatorTests.ValueType.FLOAT_GENTYPE)) != 0;   
};


/**
 * @enum
 */
es3fShaderOperatorTests.OperationType = {
    FUNCTION: 0,
    OPERATOR: 1,
    SIDE_EFFECT_OPERATOR: 2 // Test the side-effect (as opposed to the result) of a side-effect operator.
};

/**
 * Copy array b over a
 */
var cp = function(a, b) {
    for (var i = 0; i < b.length; i++)
        a[i] = b[i];
};

es3fShaderOperatorTests.unaryGenTypeFuncs = function(func) {
    var functions = {};
    functions.scalar = function(c) { cp(c.color, func(c.in_[0][2])); };
    functions.vec2 = function(c) { cp(c.color, func(deMath.swizzle(c.in_[0], [3, 1]))); };
    functions.vec3 = function(c) { cp(c.color, func(deMath.swizzle(c.in_[0], [2, 0, 1]))); };
    functions.vec4 = function(c) { cp(c.color, func(deMath.swizzle(c.in_[0], [1, 2, 3, 0]))); };
    return functions;
};

/**
 * @constructor
 * @param {es3fShaderOperatorTests.ValueType} valueType
 * @param {es3fShaderOperatorTests.FloatScalar} rangeMin
 * @param {es3fShaderOperatorTests.FloatScalar} rangeMax
 */
es3fShaderOperatorTests.Value = function(valueType, rangeMin, rangeMax) {
    this.valueType = valueType;
    this.rangeMin = rangeMin;
    this.rangeMax = rangeMax;
};

/**
 * @enum
 */
es3fShaderOperatorTests.Symbol = {
    SYMBOL_LOWP_UINT_MAX: 0,
    SYMBOL_MEDIUMP_UINT_MAX: 1,

    SYMBOL_LOWP_UINT_MAX_RECIPROCAL: 2,
    SYMBOL_MEDIUMP_UINT_MAX_RECIPROCAL: 3,

    SYMBOL_ONE_MINUS_UINT32MAX_DIV_LOWP_UINT_MAX: 4,
    SYMBOL_ONE_MINUS_UINT32MAX_DIV_MEDIUMP_UINT_MAX: 5

};

/**
 * @constructor
 * @param {number|es3fShaderOperatorTests.Symbol} value
 * @param {boolean=} isSymbol
 */
es3fShaderOperatorTests.FloatScalar = function(value, isSymbol) {
    if (isSymbol)
        this.symbol = /** @type {es3fShaderOperatorTests.Symbol} */ (value);
    else
        this.constant = /** @type {number} */ (value);
};

es3fShaderOperatorTests.FloatScalar.prototype.getValue = function(shaderType) {
    if (this.constant !== undefined)
        return this.constant;
    // TODO: Add symbol resolving
};

/**
 * @constructor
 * @param {gluShaderUtil.DataType=} type
 * @param {es3fShaderOperatorTests.FloatScalar=} rangeMin
 * @param {es3fShaderOperatorTests.FloatScalar=} rangeMax
 */
es3fShaderOperatorTests.ShaderValue = function(type, rangeMin, rangeMax) {
    this.type = type || gluShaderUtil.DataType.INVALID;
    this.rangeMin = rangeMin || new es3fShaderOperatorTests.FloatScalar(0);
    this.rangeMax = rangeMax || new es3fShaderOperatorTests.FloatScalar(0);
};

/**
 * @constructor
 */
es3fShaderOperatorTests.ShaderDataSpec = function() {
    /** @type {es3fShaderOperatorTests.FloatScalar} */ this.resultScale = new es3fShaderOperatorTests.FloatScalar(1);
    /** @type {es3fShaderOperatorTests.FloatScalar} */ this.resultBias = new es3fShaderOperatorTests.FloatScalar(0);
    /** @type {es3fShaderOperatorTests.FloatScalar} */ this.referenceScale = new es3fShaderOperatorTests.FloatScalar(1);
    /** @type {es3fShaderOperatorTests.FloatScalar} */ this.referenceBias = new es3fShaderOperatorTests.FloatScalar(0);
    /** @type {es3fShaderOperatorTests.Precision} */ this.precision = es3fShaderOperatorTests.Precision.None;
    /** @type {gluShaderUtil.DataType} */ this.output;
    /** @type {number} */ this.numInputs = 0;
    /** @type {Array<es3fShaderOperatorTests.ShaderValue>}*/ this.inputs = [];
    for (var i = 0; i < es3fShaderOperatorTests.MAX_INPUTS; i++)
        this.inputs[i] = new es3fShaderOperatorTests.ShaderValue();
};

/**
 * @constructor
 * @struct
 * @param {string} caseName
 * @param {string} shaderFuncName
 * @param {es3fShaderOperatorTests.ValueType} outValue
 * @param {Array<es3fShaderOperatorTests.Value>} inputs
 * @param {es3fShaderOperatorTests.FloatScalar} resultScale
 * @param {es3fShaderOperatorTests.FloatScalar} resultBias
 * @param {es3fShaderOperatorTests.FloatScalar} referenceScale
 * @param {es3fShaderOperatorTests.FloatScalar} referenceBias
 * @param {gluShaderUtil.precision} precision
 * @param {*} functions
 * @param {es3fShaderOperatorTests.OperationType=} type
 * @param {boolean=} isUnaryPrefix
 */
es3fShaderOperatorTests.BuiltinFuncInfo = function(caseName, shaderFuncName, outValue, inputs, resultScale, resultBias, referenceScale, referenceBias, precision, functions, type, isUnaryPrefix) {
    this.caseName = caseName;
    this.shaderFuncName = shaderFuncName;
    this.outValue = outValue;
    this.inputs = inputs;
    this.resultScale = resultScale;
    this.resultBias = resultBias;
    this.referenceScale = referenceScale;
    this.referenceBias = referenceBias;
    this.precision = precision;
    this.evalFunctions = functions;
    this.type = type || es3fShaderOperatorTests.OperationType.FUNCTION;
    this.isUnaryPrefix = isUnaryPrefix === undefined ? true : isUnaryPrefix;
};

es3fShaderOperatorTests.builtinOperInfo = function(caseName, shaderFuncName, outValue, inputs, scale, bias, precision, functions)
{
    return new es3fShaderOperatorTests.BuiltinFuncInfo(caseName,
                                                   shaderFuncName,
                                                   outValue,
                                                   inputs,
                                                   scale,
                                                   bias,
                                                   scale,
                                                   bias,
                                                   precision,
                                                   functions,
                                                   es3fShaderOperatorTests.OperationType.OPERATOR);
};

/**
 * @constructor
 * @param {string} name
 * @param {string} description
 */
es3fShaderOperatorTests.BuiltinFuncGroup = function(name, description) {
    this.name = name;
    this.description = description;
    this.funcInfos = [];
}

es3fShaderOperatorTests.BuiltinFuncGroup.prototype.push = function(a) { this.funcInfos.push(a); };

var s_inSwizzles = [

    [ "z", "wy", "zxy", "yzwx" ],
    [ "x", "yx", "yzx", "wzyx" ],
    [ "y", "zy", "wyz", "xwzy" ]
];

var s_outSwizzles = [ "x", "yz", "xyz", "xyzw" ];

var s_outSwizzleChannelMasks = [
    [true,  false, false, false ],
    [false, true,  true,  false ],
    [true,  true,  true,  false ],
    [true,  true,  true,  true ]
];

/**
 * @constructor
 * @extends {glsShaderRenderCase.ShaderRenderCase}
 * @param {string} caseName
 * @param {string} description
 * @param {boolean} isVertexCase
 * @param {glsShaderRenderCase.ShaderEvalFunc} evalFunc
 * @param {string} shaderOp
 * @param {es3fShaderOperatorTests.ShaderDataSpec} spec
 */
es3fShaderOperatorTests.ShaderOperatorCase = function(caseName, description, isVertexCase, evalFunc, shaderOp, spec) {
    glsShaderRenderCase.ShaderRenderCase.call(this, caseName, description, isVertexCase, evalFunc);
    this.m_spec = spec;
    this.m_shaderOp = shaderOp;
    this.m_evaluator; // TODO
};

setParentClass(es3fShaderOperatorTests.ShaderOperatorCase, glsShaderRenderCase.ShaderRenderCase);

es3fShaderOperatorTests.ShaderOperatorCase.prototype.setupShaderData = function() {
    var  shaderType  = this.m_isVertexCase ? gluShaderProgram.shaderType.VERTEX : gluShaderProgram.shaderType.FRAGMENT;
    var precision   = this.m_spec.precision !== undefined ? gluShaderUtil.getPrecisionName(this.m_spec.precision) : null;
    var inputPrecision = [];
    var sources = [];
    sources[0] = ''; //vertex
    sources[1] = ''; //fragment
    var vtx = 0;
    var frag = 1;
    var op = this.m_isVertexCase ? vtx : frag;    

    sources[vtx] += "#version 300 es\n";
    sources[frag] += "#version 300 es\n";

    // Compute precision for inputs.
    for (var i = 0; i < this.m_spec.numInputs; i++)
    {
        var isBoolVal   = gluShaderUtil.isDataTypeBoolOrBVec(this.m_spec.inputs[i].type);
        var isIntVal    = gluShaderUtil.isDataTypeIntOrIVec(this.m_spec.inputs[i].type);
        var isUintVal   = gluShaderUtil.isDataTypeUintOrUVec(this.m_spec.inputs[i].type);
        // \note Mediump interpolators are used for booleans, and highp for integers.
        var prec        = isBoolVal ? gluShaderUtil.precision.PRECISION_MEDIUMP
                                : isIntVal || isUintVal ? gluShaderUtil.precision.PRECISION_HIGHP
                                : this.m_spec.precision;
        inputPrecision[i] = gluShaderUtil.getPrecisionName(prec);
    }

    // Attributes.
    sources[vtx] += "in highp vec4 a_position;\n";
    for (var i = 0; i < this.m_spec.numInputs; i++)
        sources[vtx] += "in " + inputPrecision[i] + " vec4 a_in" + i + ";\n";

    // Color output.
    sources[frag] += "layout(location = 0) out mediump vec4 o_color;\n";

    if (this.m_isVertexCase)
    {
        sources[vtx] += "out mediump vec4 v_color;\n";
        sources[frag] += "in mediump vec4 v_color;\n";
    }
    else
    {
        for (var i = 0; i < this.m_spec.numInputs; i++)
        {
            sources[vtx] += "out " + inputPrecision[i] + " vec4 v_in" + i + ";\n";
            sources[frag] += "in " + inputPrecision[i] + " vec4 v_in" + i + ";\n";
        }
    }

    sources[vtx] += "\n";
    sources[vtx] += "void main()\n";
    sources[vtx] += "{\n";
    sources[vtx] += "    gl_Position = a_position;\n";

    sources[frag] += "\n";
    sources[frag] += "void main()\n";
    sources[frag] += "{\n";

    // Expression inputs.
    var prefix = this.m_isVertexCase ? "a_" : "v_";
    for (var i = 0; i < this.m_spec.numInputs; i++)
    {
        var inType      = this.m_spec.inputs[i].type;
        var inSize      = gluShaderUtil.getDataTypeScalarSize(inType);
        var isInt       = gluShaderUtil.isDataTypeIntOrIVec(inType);
        var isUint      = gluShaderUtil.isDataTypeUintOrUVec(inType);
        var isBool      = gluShaderUtil.isDataTypeBoolOrBVec(inType);
        var typeName    = gluShaderUtil.getDataTypeName(inType);
        var swizzle     = s_inSwizzles[i][inSize-1];

        sources[op] += "\t";
        if (precision && !isBool) sources[op] += precision + " ";

        sources[op] += typeName + " in" + i + " = ";

        if (isBool)
        {
            if (inSize == 1)    sources[op] += "(";
            else                sources[op] += "greaterThan(";
        }
        else if (isInt || isUint)
            sources[op] += typeName + "(";

        sources[op] += prefix + "in" + i + "." + swizzle;

        if (isBool)
        {
            if (inSize == 1)    sources[op] += " > 0.0)";
            else                sources[op] += ", vec" + inSize + "(0.0))";
        }
        else if (isInt || isUint)
            sources[op] += ")";

        sources[op] += ";\n";
    }

    // Result variable.
    {
        var outTypeName = gluShaderUtil.getDataTypeName(this.m_spec.output);
        var isBoolOut   =gluShaderUtil.isDataTypeBoolOrBVec(this.m_spec.output);

        sources[op] += "\t";
        if (precision && !isBoolOut) sources[op] += precision + " ";
        sources[op] += outTypeName + " res = " + outTypeName + "(0.0);\n\n";
    }

    // Expression.
    sources[op] += "\t" + this.m_shaderOp + "\n\n";

    // Convert to color.
    var isResFloatVec   = gluShaderUtil.isDataTypeFloatOrVec(this.m_spec.output);
    var outScalarSize   = gluShaderUtil.getDataTypeScalarSize(this.m_spec.output);

    sources[op] += "\thighp vec4 color = vec4(0.0, 0.0, 0.0, 1.0);\n";
    sources[op] += "\tcolor." + s_outSwizzles[outScalarSize-1] + " = ";

    if (!isResFloatVec && outScalarSize == 1)
        sources[op] += "float(res)";
    else if (!isResFloatVec)
        sources[op] += "vec" + outScalarSize + "(res)";
    else
        sources[op] += "res";

    sources[op] += ";\n";

    // Scale & bias.
    var resultScale     = this.m_spec.resultScale.getValue(shaderType);
    var resultBias      = this.m_spec.resultBias.getValue(shaderType);
    if ((resultScale != 1.0) || (resultBias != 0.0))
    {
        sources[op] += "\tcolor = color";
        if (resultScale != 1.0) sources[op] += " * " + es3fShaderOperatorTests.twoValuedVec4(resultScale.toString(10),        "1.0", s_outSwizzleChannelMasks[outScalarSize-1]);
        if (resultBias != 0.0)  sources[op] += " + " + es3fShaderOperatorTests.twoValuedVec4(resultBias.toString(10), "0.0", s_outSwizzleChannelMasks[outScalarSize-1]);
        sources[op] += ";\n";
    }

    // ..
    if (this.m_isVertexCase)
    {
        sources[vtx] += "    v_color = color;\n";
        sources[frag] += "   o_color = v_color;\n";
    }
    else
    {
        for (var i = 0; i < this.m_spec.numInputs; i++)
        sources[vtx] += "    v_in" + i + " = a_in" + i + ";\n";
        sources[frag] += "   o_color = color;\n";
    }

    sources[vtx] += "}\n";
    sources[frag] += "}\n";

    this.m_vertShaderSource = sources[vtx];
    this.m_fragShaderSource = sources[frag];

    // Setup the user attributes.
    this.m_userAttribTransforms = [];
    for (var inputNdx = 0; inputNdx < this.m_spec.numInputs; inputNdx++)
    {
        var v = this.m_spec.inputs[inputNdx];

        var rangeMin  = v.rangeMin.getValue(shaderType);
        var rangeMax  = v.rangeMax.getValue(shaderType);
        var scale     = rangeMax - rangeMin;
        var minBias   = rangeMin;
        var maxBias   = rangeMax;
        var attribMatrix = new tcuMatrix.Matrix(4, 4);

        for (var rowNdx = 0; rowNdx < 4; rowNdx++)
        {
            var row;

            switch ((rowNdx + inputNdx) % 4)
            {
                case 0: row = [scale, 0.0, 0.0, minBias];     break;
                case 1: row = [0.0, scale, 0.0, minBias];     break;
                case 2: row = [-scale, 0.0, 0.0, maxBias];    break;
                case 3: row = [0.0, -scale, 0.0, maxBias];    break;
                default: throw new Error('Invalid row index');
            }

            attribMatrix.setRow(rowNdx, row);
        }

        this.m_userAttribTransforms[inputNdx] = attribMatrix;
    }

};

/**
 * @constructor
 * @extends {tcuTestCase.DeqpTest}
 */
es3fShaderOperatorTests.ShaderOperatorTests = function() {
    tcuTestCase.DeqpTest.call(this, 'shaderop', 'Shader operators tests');
};

setParentClass(es3fShaderOperatorTests.ShaderOperatorTests, tcuTestCase.DeqpTest);

es3fShaderOperatorTests.ShaderOperatorTests.prototype.init = function() {
    var op = es3fShaderOperatorTests.builtinOperInfo;
    var all = es3fShaderOperatorTests.Precision.All;
    var GT = es3fShaderOperatorTests.ValueType.FLOAT_GENTYPE;
    var f = function(value) {
        return new es3fShaderOperatorTests.FloatScalar(value);
    };
    var v = function(type, a, b) {
        return new es3fShaderOperatorTests.Value(type, f(a), f(b));
    };
    var funcInfoGroups = [];
    var unary = new es3fShaderOperatorTests.BuiltinFuncGroup("unary_operator", "Unary operator tests");

    unary.push(op("minus",            "-",    GT,    [v(GT,  -1.0, 1.0)],   f(0.5),   f(0.5),   all, es3fShaderOperatorTests.unaryGenTypeFuncs(negate)));
    funcInfoGroups.push(unary);


    var s_shaderTypes = [
        gluShaderProgram.shaderType.VERTEX,
        gluShaderProgram.shaderType.FRAGMENT
    ];

    var s_floatTypes = [
        gluShaderUtil.DataType.FLOAT,
        gluShaderUtil.DataType.FLOAT_VEC2,
        gluShaderUtil.DataType.FLOAT_VEC3,
        gluShaderUtil.DataType.FLOAT_VEC4
    ];

    var s_intTypes = [
        gluShaderUtil.DataType.INT,
        gluShaderUtil.DataType.INT_VEC2,
        gluShaderUtil.DataType.INT_VEC3,
        gluShaderUtil.DataType.INT_VEC4
    ];

    var s_uintTypes = [
        gluShaderUtil.DataType.UINT,
        gluShaderUtil.DataType.UINT_VEC2,
        gluShaderUtil.DataType.UINT_VEC3,
        gluShaderUtil.DataType.UINT_VEC4
    ];

    var s_boolTypes = [
        gluShaderUtil.DataType.BOOL,
        gluShaderUtil.DataType.BOOL_VEC2,
        gluShaderUtil.DataType.BOOL_VEC3,
        gluShaderUtil.DataType.BOOL_VEC4
    ];

    for (var outerGroupNdx = 0; outerGroupNdx < funcInfoGroups.length; outerGroupNdx++)
    {
        // Create outer group.
        var outerGroupInfo = funcInfoGroups[outerGroupNdx];
        var outerGroup = new tcuTestCase.DeqpTest(outerGroupInfo.name, outerGroupInfo.description);
        this.addChild(outerGroup);

        // Only create new group if name differs from previous one.
        var innerGroup = null;

        for (var funcInfoNdx = 0; funcInfoNdx < outerGroupInfo.funcInfos.length; funcInfoNdx++)
        {
            var funcInfo        = outerGroupInfo.funcInfos[funcInfoNdx];
            var shaderFuncName  = funcInfo.shaderFuncName;
            var isBoolCase      = (funcInfo.precision == es3fShaderOperatorTests.Precision.None);
            var isBoolOut       = es3fShaderOperatorTests.isBoolType(funcInfo.outValue);
            var isIntOut        = es3fShaderOperatorTests.isIntType(funcInfo.outValue);
            var isUintOut       = es3fShaderOperatorTests.isUintType(funcInfo.outValue);
            var isFloatOut      = !isBoolOut && !isIntOut && !isUintOut;

            if (!innerGroup || (innerGroup.name != funcInfo.caseName))
            {
                var groupDesc = "Built-in function " + shaderFuncName + "() tests.";
                innerGroup = new tcuTestCase.DeqpTest(funcInfo.caseName, groupDesc);
                outerGroup.addChild(innerGroup);
            }

            for (var inScalarSize = 1; inScalarSize <= 4; inScalarSize++)
            {
                var outScalarSize   = ((funcInfo.outValue == es3fShaderOperatorTests.ValueType.FLOAT) || (funcInfo.outValue == es3fShaderOperatorTests.ValueType.BOOL)) ? 1 : inScalarSize; // \todo [petri] Int.
                var outDataType     = isFloatOut    ? s_floatTypes[outScalarSize - 1]
                                            : isIntOut      ? s_intTypes[outScalarSize - 1]
                                            : isUintOut     ? s_uintTypes[outScalarSize - 1]
                                            : isBoolOut     ? s_boolTypes[outScalarSize - 1]
                                            : undefined;

                var evalFunc = null;
                if      (inScalarSize == 1) evalFunc = funcInfo.evalFunctions.scalar;
                else if (inScalarSize == 2) evalFunc = funcInfo.evalFunctions.vec2;
                else if (inScalarSize == 3) evalFunc = funcInfo.evalFunctions.vec3;
                else if (inScalarSize == 4) evalFunc = funcInfo.evalFunctions.vec4;
                else throw new Error('Invalid scalar size ' + inScalarSize);

                // Skip if no valid eval func.
                // \todo [petri] Better check for V3 only etc. cases?
                if (evalFunc == null)
                    continue;

                var precisions = ['low', 'medium', 'high'];
                for (var precId = 0; precId < precisions.length; precId++)
                {
                    var precision = precisions[precId];
                    if ((funcInfo.precision[precision]) ||
                        (funcInfo.precision == es3fShaderOperatorTests.Precision.None && precision === 'medium')) // use mediump interpolators for booleans
                    {
                        var precisionPrefix = isBoolCase ? "" : precision + "p_";

                        for (var shaderTypeNdx = 0; shaderTypeNdx <s_shaderTypes.length; shaderTypeNdx++)
                        {
                            var shaderType      = s_shaderTypes[shaderTypeNdx];
                            var shaderSpec = new es3fShaderOperatorTests.ShaderDataSpec();
                            var shaderTypeName  = gluShaderProgram.getShaderTypeName(shaderType);
                            var isVertexCase    = shaderType == gluShaderProgram.shaderType.VERTEX;
                            var isUnaryOp       = (funcInfo.inputs.length == 1);

                            // \note Data type names will be added to description and name in a following loop.
                            var desc = "Built-in function " + shaderFuncName + "(";
                            var name = precisionPrefix;

                            // Generate shader op.
                            var shaderOp = "res = ";

                            var precNames = [gluShaderUtil.precision.PRECISION_LOWP,
                                             gluShaderUtil.precision.PRECISION_MEDIUMP,
                                             gluShaderUtil.precision.PRECISION_HIGHP];
                            // Setup shader data info.
                            shaderSpec.numInputs        = 0;
                            shaderSpec.precision        = isBoolCase ? undefined : precNames[precId];
                            shaderSpec.output           = outDataType;
                            shaderSpec.resultScale      = funcInfo.resultScale;
                            shaderSpec.resultBias       = funcInfo.resultBias;
                            shaderSpec.referenceScale   = funcInfo.referenceScale;
                            shaderSpec.referenceBias    = funcInfo.referenceBias;

                            if (funcInfo.type == es3fShaderOperatorTests.OperationType.OPERATOR)
                            {
                                if (isUnaryOp && funcInfo.isUnaryPrefix)
                                    shaderOp += shaderFuncName;
                            }
                            else if (funcInfo.type == es3fShaderOperatorTests.OperationType.FUNCTION)
                                shaderOp += shaderFuncName + "(";
                            else // SIDE_EFFECT_OPERATOR
                                shaderOp += "in0;\n\t";

                            for (var inputNdx = 0; inputNdx < funcInfo.inputs.length; inputNdx++)
                            {
                                var prevNdx = inputNdx > 0 ? inputNdx - 1 : funcInfo.inputs.length - 1;
                                var prevValue = funcInfo.inputs[prevNdx];
                                var value = funcInfo.inputs[inputNdx];

                                if (value.valueType == es3fShaderOperatorTests.ValueType.NONE)
                                    continue; // Skip unused input.

                                var prevInScalarSize    = es3fShaderOperatorTests.isScalarType(prevValue.valueType) ? 1 : inScalarSize;
                                var prevInDataType      = es3fShaderOperatorTests.isFloatType(prevValue.valueType)  ? s_floatTypes[prevInScalarSize - 1]
                                                                    : es3fShaderOperatorTests.isIntType(prevValue.valueType)    ? s_intTypes[prevInScalarSize - 1]
                                                                    : es3fShaderOperatorTests.isUintType(prevValue.valueType)   ? s_uintTypes[prevInScalarSize - 1]
                                                                    : es3fShaderOperatorTests.isBoolType(prevValue.valueType)   ? s_boolTypes[prevInScalarSize - 1]
                                                                    : undefined;

                                var curInScalarSize     = es3fShaderOperatorTests.isScalarType(value.valueType) ? 1 : inScalarSize;
                                var curInDataType       = es3fShaderOperatorTests.isFloatType(value.valueType)  ? s_floatTypes[curInScalarSize - 1]
                                                                    : es3fShaderOperatorTests.isIntType(value.valueType)    ? s_intTypes[curInScalarSize - 1]
                                                                    : es3fShaderOperatorTests.isUintType(value.valueType)   ? s_uintTypes[curInScalarSize - 1]
                                                                    : es3fShaderOperatorTests.isBoolType(value.valueType)   ? s_boolTypes[curInScalarSize - 1]
                                                                    : undefined;

                                // Write input type(s) to case description and name.

                                if (inputNdx > 0)
                                    desc += ", ";

                                desc += gluShaderUtil.getDataTypeName(curInDataType);

                                if (inputNdx == 0 || prevInDataType != curInDataType) // \note Only write input type to case name if different from previous input type (avoid overly long names).
                                    name += gluShaderUtil.getDataTypeName(curInDataType) + "_";

                                // Generate op input source.

                                if (funcInfo.type == es3fShaderOperatorTests.OperationType.OPERATOR || funcInfo.type == es3fShaderOperatorTests.OperationType.FUNCTION)
                                {
                                    if (inputNdx != 0)
                                    {
                                        if (funcInfo.type == es3fShaderOperatorTests.OperationType.OPERATOR && !isUnaryOp)
                                            shaderOp += " " + shaderFuncName + " ";
                                        else
                                            shaderOp += ", ";
                                    }

                                    shaderOp += "in" + inputNdx.toString(10);

                                    if (funcInfo.type == es3fShaderOperatorTests.OperationType.OPERATOR && isUnaryOp && !funcInfo.isUnaryPrefix)
                                        shaderOp += shaderFuncName;
                                }
                                else
                                {
                                    if (inputNdx != 0 || (isUnaryOp && funcInfo.isUnaryPrefix))
                                        shaderOp += (isUnaryOp ? "" : " ") + shaderFuncName + (isUnaryOp ? "" : " ");

                                    shaderOp += inputNdx == 0 ? "res" : "in" + inputNdx.toString(10); // \note in0 has already been assigned to res, so start from in1.

                                    if (isUnaryOp && !funcInfo.isUnaryPrefix)
                                        shaderOp += shaderFuncName;
                                }

                                // Fill in shader info.
                                shaderSpec.inputs[shaderSpec.numInputs++] = new es3fShaderOperatorTests.ShaderValue(curInDataType, value.rangeMin, value.rangeMax);
                            }

                            if (funcInfo.type == es3fShaderOperatorTests.OperationType.FUNCTION)
                                shaderOp += ")";

                            shaderOp += ";";

                            desc += ").";
                            name += shaderTypeName;

                            // Create the test case.
                            innerGroup.addChild(new es3fShaderOperatorTests.ShaderOperatorCase(name, desc, isVertexCase, evalFunc, shaderOp, shaderSpec));
                        }
                    }
                }
            }
        }
    }

};

/**
* Run test
* @param {WebGL2RenderingContext} context
*/
es3fShaderOperatorTests.run = function(context) {
	gl = context;
	//Set up Test Root parameters
	var state = tcuTestCase.runner;
	state.setRoot(new es3fShaderOperatorTests.ShaderOperatorTests());

	//Set up name and description of this test series.
	setCurrentTestName(state.testCases.fullName());
	description(state.testCases.getDescription());

	try {
		//Run test cases
		tcuTestCase.runTestCases();
	}
	catch (err) {
		testFailedOptions('Failed to es3fShaderOperatorTests.run tests', false);
		tcuTestCase.runner.terminate();
	}
};

});