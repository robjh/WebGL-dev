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

define([
    'framework/opengl/gluDefs',
    'framework/opengl/gluDrawUtil',
    'framework/opengl/gluShaderUtil',
    'framework/opengl/gluShaderProgram',
    'framework/opengl/gluTexture',
    'framework/opengl/gluVarType',
    'framework/common/tcuTestCase',
    'framework/common/tcuSurface',
    'framework/common/tcuTexture',
    'framework/delibs/debase/deMath',
    'framework/delibs/debase/deString',
    'framework/delibs/debase/deRandom'], function(
        gluDefs,
        gluDrawUtil,
        deqpUtils,
        gluSP,
        gluTexture,
        gluVT,
        deqpTests,
        tcuSurface,
        tcuTexture,
        deMath,
        deString,
        deRandom) {
    'use strict';

    var gl = 0;

    var DE_ASSERT = function(x) {
        if (!x)
            throw new Error('Assert failed');
    };

    var DE_STATIC_ASSERT = function(x) {
        if (!x)
            throw new Error('Assert failed');
    };

    var DE_NULL = null;

    /** @callback dataTypePredicate
     * @param {deqpUtils.DataType} t
     * @return {boolean}
     */

    /** @type {number} */ var MAX_RENDER_WIDTH = 32;
    /** @type {number} */ var MAX_RENDER_HEIGHT = 32;
    /** @type {number} */ var MAX_NUM_SAMPLER_UNIFORMS = 16;

    /** @type {Array.<deqpUtils.DataType>} */ var s_testDataTypes = [
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
        deqpUtils.DataType.UINT_VEC4,

        deqpUtils.DataType.BOOL,
        deqpUtils.DataType.BOOL_VEC2,
        deqpUtils.DataType.BOOL_VEC3,
        deqpUtils.DataType.BOOL_VEC4,

        deqpUtils.DataType.SAMPLER_2D,
        deqpUtils.DataType.SAMPLER_CUBE
        // \note We don't test all sampler types here.
    ];

    /**
     * Returns a substring from the beginning to the last occurence of the
     * specified character
     * @param {string} str The string in which to search
     * @param {string} c A single character
     * @return {string}
     */
    var beforeLast = function(str, c) {
        return str.substring(0, str.lastIndexOf(c));
    };

    /**
     * fillWithColor
     * @param {tcuTexture.PixelBufferAccess} access ,
     * @param {Array.<number>} color Array of four color components.
     */
    var fillWithColor = function(access, color) {
        for (var z = 0; z < access.getDepth(); z++)
        for (var y = 0; y < access.getHeight(); y++)
        for (var x = 0; x < access.getWidth(); x++)
            access.setPixel(color, x, y, z);
    };

    /**
     * @param {deqpUtils.DataType} type
     * @return {number}
     */
    var getSamplerNumLookupDimensions = function(type) {
        switch (type)
        {
            case deqpUtils.DataType.SAMPLER_2D:
            case deqpUtils.DataType.INT_SAMPLER_2D:
            case deqpUtils.DataType.UINT_SAMPLER_2D:
                return 2;

            case deqpUtils.DataType.SAMPLER_3D:
            case deqpUtils.DataType.INT_SAMPLER_3D:
            case deqpUtils.DataType.UINT_SAMPLER_3D:
            case deqpUtils.DataType.SAMPLER_2D_SHADOW:
            case deqpUtils.DataType.SAMPLER_2D_ARRAY:
            case deqpUtils.DataType.INT_SAMPLER_2D_ARRAY:
            case deqpUtils.DataType.UINT_SAMPLER_2D_ARRAY:
            case deqpUtils.DataType.SAMPLER_CUBE:
            case deqpUtils.DataType.INT_SAMPLER_CUBE:
            case deqpUtils.DataType.UINT_SAMPLER_CUBE:
                return 3;

            case deqpUtils.DataType.SAMPLER_CUBE_SHADOW:
            case deqpUtils.DataType.SAMPLER_2D_ARRAY_SHADOW:
                return 4;

            default:
                DE_ASSERT(false);
                return 0;
        }
    };

   /**
    * @param {deqpUtils.DataType} type
    * @return {deqpUtils.DataType}
    */
    var getSamplerLookupReturnType = function(type) {
        switch (type)
        {
            case deqpUtils.DataType.SAMPLER_2D:
            case deqpUtils.DataType.SAMPLER_CUBE:
            case deqpUtils.DataType.SAMPLER_2D_ARRAY:
            case deqpUtils.DataType.SAMPLER_3D:
                return deqpUtils.DataType.FLOAT_VEC4;

            case deqpUtils.DataType.UINT_SAMPLER_2D:
            case deqpUtils.DataType.UINT_SAMPLER_CUBE:
            case deqpUtils.DataType.UINT_SAMPLER_2D_ARRAY:
            case deqpUtils.DataType.UINT_SAMPLER_3D:
                return deqpUtils.DataType.UINT_VEC4;

            case deqpUtils.DataType.INT_SAMPLER_2D:
            case deqpUtils.DataType.INT_SAMPLER_CUBE:
            case deqpUtils.DataType.INT_SAMPLER_2D_ARRAY:
            case deqpUtils.DataType.INT_SAMPLER_3D:
                return deqpUtils.DataType.INT_VEC4;

            case deqpUtils.DataType.SAMPLER_2D_SHADOW:
            case deqpUtils.DataType.SAMPLER_CUBE_SHADOW:
            case deqpUtils.DataType.SAMPLER_2D_ARRAY_SHADOW:
                return deqpUtils.DataType.FLOAT;

            default:
                DE_ASSERT(false);
                return deqpUtils.DataType.LAST;
        }
    };

    /**
     * @param {deqpUtils.DataType} T DataType to compare the type. Used to be a template param
     * @param {deqpUtils.DataType} t
     * @return {boolean}
     */
    var dataTypeEquals = function(T, t)
    {
        return t == T;
    };

    /**
     * @param {deqpUtils.DataType} t
     * @return {boolean}
     */
    dataTypeEquals.prototype.exec = function(t) {
        return t == this.T;
    };

    /**
     * @param {number} N Row number. Used to be a template parameter
     * @param {deqpUtils.DataType} t
     * @return {dataTypeIsMatrixWithNRows | boolean}
     */
    var dataTypeIsMatrixWithNRows = function(N, t) {
        return deqpUtils.isDataTypeMatrix(t) && deqpUtils.getDataTypeMatrixNumRows(t) == N;
    };

    /**
     * @param {deqpUtils.DataType} t
     * @return {boolean}
     */
    dataTypeIsMatrixWithNRows.prototype.exec = function(t) {
        return deqpUtils.isDataTypeMatrix(t) && deqpUtils.getDataTypeMatrixNumRows(t) == this.N;
    };

   /**
    * @param {gluVT.VarType} type
    * @param {dataTypePredicate} predicate
    * @return {boolean}
    */
    var typeContainsMatchingBasicType = function(type, predicate) {
        if (type.isBasicType())
            return predicate(type.getBasicType());
        else if (type.isArrayType())
            return typeContainsMatchingBasicType(type.getElementType(), predicate);
        else
        {
            DE_ASSERT(type.isStructType());
            /** @type {gluVT.StructType} */ var structType = type.getStructPtr();
            for (var i = 0; i < structType.getNumMembers(); i++)
                if (typeContainsMatchingBasicType(structType.getMember(i).getType(), predicate))
                    return true;
            return false;
        }
    };

    /**
     * @param {Array.<deqpUtils.DataType>} dst
     * @param {gluVT.VarType} type
     */
    var getDistinctSamplerTypes = function(dst, type) {
        if (type.isBasicType())
        {
            /** @type {deqpUtils.DataType} */ var basicType = type.getBasicType();
            if (deqpUtils.isDataTypeSampler(basicType) && dst.indexOf(basicType) == -1)
                dst.push(basicType);
        }
        else if (type.isArrayType())
            getDistinctSamplerTypes(dst, type.getElementType());
        else
        {
            DE_ASSERT(type.isStructType());
            /** @type {gluVT.StructType} */ var structType = type.getStructPtr();
            for (var i = 0; i < structType.getNumMembers(); i++)
                getDistinctSamplerTypes(dst, structType.getMember(i).getType());
        }
    };

    /**
     * @param {gluVT.VarType} type
     * @return {number}
     */
    var getNumSamplersInType = function(type) {
        if (type.isBasicType())
            return deqpUtils.isDataTypeSampler(type.getBasicType()) ? 1 : 0;
        else if (type.isArrayType())
            return getNumSamplersInType(type.getElementType()) * type.getArraySize();
        else
        {
            DE_ASSERT(type.isStructType());
            /** @type {gluVT.StructType} */ var structType = type.getStructPtr();
            /** @type {number} */ var sum = 0;
            for (var i = 0; i < structType.getNumMembers(); i++)
                sum += getNumSamplersInType(structType.getMember(i).getType());
            return sum;
        }
    };

    /**
     * @typedef {Object} VarTypeWithIndex
     * @property {gluVT.VarType} type,
     * @property {number} ndx
     */

    /**
     * @param {number} maxDepth
     * @param {number} curStructIdx Out parameter, instead returning it in the VarTypeWithIndex structure.
     * @param {Array.<gluVT.StructType>} structTypeDst
     * @param {deRandom.Random} rnd
     * @return {VarTypeWithIndex}
     */
    var generateRandomType = function(maxDepth, curStructIdx, structTypesDst, rnd) {
        /** @type {boolean} */ var isStruct = maxDepth > 0 && rnd.getFloat() < 0.2;
        /** @type {boolean} */ var isArray = rnd.getFloat() < 0.3;

        if (isStruct)
        {
            /** @type {number} */ var numMembers = rnd.getInt(1, 5);
            /** @type {gluVT.StructType} */ var structType = gluVT.StructType('structType' + curStructIdx++);

            for (var i = 0; i < numMembers; i++)
            {
                /** @type {VarTypeWithIndex} */ var typeWithIndex = generateRandomType(maxDepth - 1, curStructIdx, structTypesDst, rnd);
                curStructIdx = typeWithIndex.ndx;
                structType.addMember('m' + i, typeWithIndex.type);
            }

            structTypesDst.push(structType);
            return isArray ?
            {
                type: gluVT.newTypeArray(gluVT.newTypeStruct(structType), rnd.getInt(1, 5)),
                ndx: curStructIdx
            }
            :
            {
                type: gluVT.newTypeStruct(structType),
                ndx: curStructIdx
            };
        }
        else
        {
            /** @type {deqpUtils.DataType} */ var basicType = s_testDataTypes[rnd.getInt(0, s_testDataTypes.length - 1)];
            /** @type {deqpUtils.precision} */ var precision = deqpUtils.isDataTypeBoolOrBVec(basicType) ? deqpUtils.precision.PRECISION_LAST : deqpUtils.precision.PRECISION_MEDIUMP;
            return isArray ?
            {
                type: gluVT.newTypeArray(gluVT.newTypeBasic(basicType, precision), rnd.getInt(1, 5)),
                ndx: curStructIdx
            }
            :
            {
                type: gluVT.newTypeBasic(basicType, precision),
                ndx: curStructIdx
            };
        }
    };

    /**
     * @typedef {Object} SamplerV
     * @property {number} unit,
     * @property {Array.<number>} fillColor
     */
    var SamplerV = function() {
        this.samplerV = {
            /** @type {number} */ unit: 0,
            /** @type {Array.<number>} */ fillColor: []
        };
    };

    /**
     * VarValue class. may contain different types.
     */
    var VarValue = function() {
        /** @type {deqpUtils.DataType} */ this.type = -1;
        /** @type {Array.<number | boolean> | SamplerV} */ this.val = [];
    };

    /**
     * @enum
     */
    var CaseShaderType = {
        CASESHADERTYPE_VERTEX: 0,
        CASESHADERTYPE_FRAGMENT: 1,
        CASESHADERTYPE_BOTH: 2
    };

    CaseShaderType.CASESHADERTYPE_LAST = Object.keys(CaseShaderType).length;

    /**
     * Uniform struct.
     * @param {string} name_
     * @param {gluVT.VarType} type_
     * @return {Uniform}
     */
    var Uniform = function(name_, type_) {
        /** @type {string} */ this.name = name_;
        /** @type {gluVT.VarType} */ this.type = type_;
    };

    // A set of uniforms, along with related struct types.
    /**
     * class UniformCollection
     */
    var UniformCollection = function() {
        /** @type {Array.<Uniform>} */ this.m_uniforms = [];
        /** @type {Array.<gluVT.StructType>} */ this.m_structTypes = [];
    };

    /**
     * @return {number}
     */
    UniformCollection.prototype.getNumUniforms = function() {return this.m_uniforms.length;};

    /**
     * @return {number}
     */
    UniformCollection.prototype.getNumStructTypes = function() {return this.m_structTypes.length;};

    /**
     * @param {number} ndx
     * @return {Uniform}
     */
    UniformCollection.prototype.getUniform = function(ndx) {return this.m_uniforms[ndx];};

    /**
     * @param {number} ndx
     * @return {Uniform}
     */
    UniformCollection.prototype.getUniform = function(ndx) {return this.m_uniforms[ndx];};

    /**
     * @param {number} ndx
     * @return {gluVT.StructType}
     */
    UniformCollection.prototype.getStructType = function(ndx) {return this.m_structTypes[ndx];};

    /**
     * @param {Uniform} uniform
     */
    UniformCollection.prototype.addUniform = function(uniform) {this.m_uniforms.push(uniform);};

    /**
     * @param {gluVT.StructType} type
     */
    UniformCollection.prototype.addStructType = function(type) {this.m_structTypes.push(type);};

    // Add the contents of m_uniforms and m_structTypes to receiver, and remove them from this one.
    // \note receiver takes ownership of the struct types.
    /**
     * @param {UniformCollection} receiver
     */
    UniformCollection.prototype.moveContents = function(receiver) {
        for (var i = 0; i < this.m_uniforms.length; i++)
            receiver.addUniform(this.m_uniforms[i]);
        this.m_uniforms.length = 0;

        for (var i = 0; i < this.m_structTypes.length; i++)
            receiver.addStructType(this.m_structTypes[i]);
        this.m_structTypes.length = 0;
    };

    /**
     * @param {dataTypePredicate} predicate
     * @return {boolean}
     */
    UniformCollection.prototype.containsMatchingBasicType = function(predicate) {
        for (var i = 0; i < this.m_uniforms.length; i++)
            if (typeContainsMatchingBasicType(this.m_uniforms[i].type, predicate))
                return true;
        return false;
    };

    /**
     * @return {Array.<deqpUtils.DataType>}
     */
    UniformCollection.prototype.getSamplerTypes = function() {
        /** @type {Array<deqpUtils.DataType>} */ var samplerTypes = [];
        for (var i = 0; i < this.m_uniforms.length; i++)
            getDistinctSamplerTypes(samplerTypes, this.m_uniforms[i].type);
        return samplerTypes;
    };

    /**
     * @return {boolean}
     */
    UniformCollection.prototype.containsSeveralSamplerTypes = function() {
        return this.getSamplerTypes().length > 1;
    };

    /**
     * @return {number}
     */
    UniformCollection.prototype.getNumSamplers = function() {
        var sum = 0;
        for (var i = 0; i < this.m_uniforms.length; i++)
            sum += getNumSamplersInType(this.m_uniforms[i].type);
        return sum;
    };

    /**
     * @param {deqpUtils.DataType} type
     * @param {string} nameSuffix
     * @return {UniformCollection}
     */
    UniformCollection.basic = function(type, nameSuffix) {
        if (nameSuffix === undefined) nameSuffix = '';
        /** @type {UniformCollection} */ var res = new UniformCollection();
        /** @type {deqpUtils.precision} */ var prec = deqpUtils.isDataTypeBoolOrBVec(type) ? deqpUtils.precision.PRECISION_LAST : deqpUtils.precision.PRECISION_MEDIUMP;
        res.m_uniforms.push(new Uniform('u_var' + nameSuffix, gluVT.newTypeBasic(type, prec)));
        return res;
    };

    /**
     * @param {deqpUtils.DataType} type
     * @param {string} nameSuffix
     * @return {UniformCollection}
     */
    UniformCollection.basicArray = function(type, nameSuffix) {
        if (nameSuffix === undefined) nameSuffix = '';
        /** @type {UniformCollection} */ var res = new UniformCollection();
        /** @type {deqpUtils.precision} */ var prec = deqpUtils.isDataTypeBoolOrBVec(type) ? deqpUtils.precision.PRECISION_LAST : deqpUtils.precision.PRECISION_MEDIUMP;
        res.m_uniforms.push(new Uniform('u_var' + nameSuffix, gluVT.newTypeArray(gluVT.newTypeBasic(type, prec), 3)));
        return res;
    };

    /**
     * @param {deqpUtils.DataType} type0
     * @param {deqpUtils.DataType} type1
     * @param {boolean} containsArrays
     * @param {string} nameSuffix
     * @return {UniformCollection}
     */
    UniformCollection.basicStruct = function(type0, type1, containsArrays, nameSuffix) {
        if (nameSuffix === undefined) nameSuffix = '';
        /** @type {UniformCollection} */ var res = new UniformCollection();
        /** @type {deqpUtils.precision} */ var prec0 = deqpUtils.isDataTypeBoolOrBVec(type0) ? deqpUtils.precision.PRECISION_LAST : deqpUtils.precision.PRECISION_MEDIUMP;
        /** @type {deqpUtils.precision} */ var prec1 = deqpUtils.isDataTypeBoolOrBVec(type1) ? deqpUtils.precision.PRECISION_LAST : deqpUtils.precision.PRECISION_MEDIUMP;

        /** @type {gluVT.StructType} */ var structType = new gluVT.StructType('structType' + nameSuffix);
        structType.addMember('m0', gluVT.newTypeBasic(type0, prec0));
        structType.addMember('m1', gluVT.newTypeBasic(type1, prec1));
        if (containsArrays)
        {
            structType.addMember('m2', gluVT.newTypeArray(gluVT.newTypeBasic(type0, prec0), 3));
            structType.addMember('m3', gluVT.newTypeArray(gluVT.newTypeBasic(type1, prec1), 3));
        }

        res.addStructType(structType);
        res.addUniform(new Uniform('u_var' + nameSuffix, gluVT.newTypeStruct(structType)));

        return res;
    };

    /**
     * @param {deqpUtils.DataType} type0
     * @param {deqpUtils.DataType} type1
     * @param {boolean} containsArrays
     * @param {string} nameSuffix
     * @return {UniformCollection}
     */
    UniformCollection.structInArray = function(type0, type1, containsArrays, nameSuffix) {
        if (nameSuffix === undefined) nameSuffix = '';
        /** @type {UniformCollection} */ var res = this.basicStruct(type0, type1, containsArrays, nameSuffix);
        res.getUniform(0).type = gluVT.newTypeArray(res.getUniform(0).type, 3);
        return res;
    };

    /**
     * @param {deqpUtils.DataType} type0
     * @param {deqpUtils.DataType} type1
     * @param {string} nameSuffix
     * @return {UniformCollection}
     */
    UniformCollection.nestedArraysStructs = function(type0, type1, nameSuffix) {
        if (nameSuffix === undefined) nameSuffix = '';
        /** @type {UniformCollection} */ var res = new UniformCollection();
        /** @type {deqpUtils.precision} */ var prec0 = deqpUtils.isDataTypeBoolOrBVec(type0) ? deqpUtils.precision.PRECISION_LAST : deqpUtils.precision.PRECISION_MEDIUMP;
        /** @type {deqpUtils.precision} */ var prec1 = deqpUtils.isDataTypeBoolOrBVec(type1) ? deqpUtils.precision.PRECISION_LAST : deqpUtils.precision.PRECISION_MEDIUMP;
        /** @type {gluVT.StructType} */ var structType = new gluVT.StructType('structType' + nameSuffix);
        /** @type {gluVT.StructType} */ var subStructType = new gluVT.StructType('subStructType' + nameSuffix);
        /** @type {gluVT.StructType} */ var subSubStructType = new gluVT.StructType('subSubStructType' + nameSuffix);

        subSubStructType.addMember('mss0', gluVT.newTypeBasic(type0, prec0));
        subSubStructType.addMember('mss1', gluVT.newTypeBasic(type1, prec1));

        subStructType.addMember('ms0', gluVT.newTypeBasic(type1, prec1));
        subStructType.addMember('ms1', gluVT.newTypeArray(gluVT.newTypeBasic(type0, prec0), 2));
        subStructType.addMember('ms2', gluVT.newTypeArray(gluVT.newTypeStruct(subSubStructType), 2));

        structType.addMember('m0', gluVT.newTypeBasic(type0, prec0));
        structType.addMember('m1', gluVT.newTypeStruct(subStructType));
        structType.addMember('m2', gluVT.newTypeBasic(type1, prec1));

        res.addStructType(subSubStructType);
        res.addStructType(subStructType);
        res.addStructType(structType);

        res.addUniform(new Uniform('u_var' + nameSuffix, gluVT.newTypeStruct(structType)));

        return res;
    };

    /**
     * @param {string} nameSuffix
     * @return {UniformCollection}
     */
    UniformCollection.multipleBasic = function(nameSuffix) {
        if (nameSuffix === undefined) nameSuffix = '';
        /** @type {Array.<deqpUtils.DataType>} */ var types = [deqpUtils.DataType.FLOAT, deqpUtils.DataType.INT_VEC3, deqpUtils.DataType.UINT_VEC4, deqpUtils.DataType.FLOAT_MAT3, deqpUtils.DataType.BOOL_VEC2];
        /** @type {UniformCollection} */ var res = new UniformCollection();

        for (var i = 0; i < types.length; i++)
        {
            /** @type {UniformCollection} */ var sub = this.basic(types[i], '_' + i + nameSuffix);
            sub.moveContents(res);
        }

        return res;
    };

    /**
     * @param {string} nameSuffix
     * @return {UniformCollection}
     */
    UniformCollection.multipleBasicArray = function(nameSuffix) {
        if (nameSuffix === undefined) nameSuffix = '';
        /** @type {Array.<deqpUtils.DataType>} */ var types = [deqpUtils.DataType.FLOAT, deqpUtils.DataType.INT_VEC3, deqpUtils.DataType.BOOL_VEC2];
        /** @type {UniformCollection} */ var res = new UniformCollection();

        for (var i = 0; i < types.length; i++)
        {
            /** @type {UniformCollection} */ var sub = this.basicArray(types[i], '_' + i + nameSuffix);
            sub.moveContents(res);
        }

        return res;
    };

    /**
     * @param {string} nameSuffix
     * @return {UniformCollection}
     */
    UniformCollection.multipleNestedArraysStructs = function(nameSuffix) {
        if (nameSuffix === undefined) nameSuffix = '';
        /** @type {Array.<deqpUtils.DataType>} */ var types0 = [deqpUtils.DataType.FLOAT, deqpUtils.DataType.INT, deqpUtils.DataType.BOOL_VEC4];
        /** @type {Array.<deqpUtils.DataType>} */ var types1 = [deqpUtils.DataType.FLOAT_VEC4, deqpUtils.DataType.INT_VEC4, deqpUtils.DataType.BOOL];
        /** @type {UniformCollection} */ var res = new UniformCollection();

        DE_STATIC_ASSERT(types0.length == types1.length);

        for (var i = 0; i < types0.length; i++)
        {
            /** @type {UniformCollection} */ var sub = this.nestedArraysStructs(types0[i], types1[i], '_' + i + nameSuffix);
            sub.moveContents(res);
        }

        return res;
    };

    /**
     * @param {deMath.deUint32} seed
     * @return {UniformCollection}
     */
    UniformCollection.random = function(seed) {
        /** @type {deRandom.Random} */ var rnd = new deRandom.Random(seed);
        /** @type {number} */ var numUniforms = rnd.getInt(1, 5);
        /** @type {number} */ var structIdx = 0;
        /** @type {UniformCollection} */ var res = new UniformCollection();

        for (var i = 0; i < numUniforms; i++)
        {
            /** @type {Array.<gluVT.StructType>} */ var structTypes = [];
            /** @type {Uniform} */ var uniform = new Uniform('u_var' + i, new gluVT.VarType());

            // \note Discard uniforms that would cause number of samplers to exceed MAX_NUM_SAMPLER_UNIFORMS.
            do
            {
                var temp = generateRandomType(3, structIdx, structTypes, rnd);
                structIdx = temp.ndx;
                uniform.type = (/*'u_var' + i,*/ temp.type);
            } while (res.getNumSamplers() + getNumSamplersInType(uniform.type) > MAX_NUM_SAMPLER_UNIFORMS);

            res.addUniform(uniform);
            for (var j = 0; j < structTypes.length; j++)
                res.addStructType(structTypes[j]);
        }

        return res;
    };

    /**
     * @param {VarValue} sampler
     * @return {VarValue}
     */
    var getSamplerFillValue = function(sampler) {
        DE_ASSERT(deqpUtils.isDataTypeSampler(sampler.type));

        /** @type {VarValue} */ var result = new VarValue();
        result.type = getSamplerLookupReturnType(sampler.type);

        switch (result.type)
        {
            case deqpUtils.DataType.FLOAT_VEC4:
                for (var i = 0; i < 4; i++)
                    result.val[i] = sampler.val.samplerV.fillColor[i];
                break;
            case deqpUtils.DataType.UINT_VEC4:
                for (var i = 0; i < 4; i++)
                    result.val[i] = sampler.val.samplerV.fillColor[i];
                break;
            case deqpUtils.DataType.INT_VEC4:
                for (var i = 0; i < 4; i++)
                    result.val[i] = sampler.val.samplerV.fillColor[i];
                break;
            case deqpUtils.DataType.FLOAT:
                result.val[0] = sampler.val.samplerV.fillColor[0];
                break;
            default:
                DE_ASSERT(false);
        }

        return result;
    };

    /**
     * @param {VarValue} sampler
     * @return {VarValue}
     */
    var getSamplerUnitValue = function(sampler) {
        DE_ASSERT(deqpUtils.isDataTypeSampler(sampler.type));

        /** @type {VarValue} */ var result;
        result.type = deqpUtils.DataType.INT;
        result.val[0] = sampler.val.samplerV.unit;

        return result;
    };

    /**
     * @param {deqpUtils.DataType} original
     * @return {deqpUtils.DataType}
     */
    var getDataTypeTransposedMatrix = function(original) {
        return deqpUtils.getDataTypeMatrix(deqpUtils.getDataTypeMatrixNumRows(original), deqpUtils.getDataTypeMatrixNumColumns(original));
    };

    /**
     * @param {VarValue} original
     * @return {VarValue}
     */
    var getTransposeMatrix = function(original) {
        DE_ASSERT(deqpUtils.isDataTypeMatrix(original.type));

        /** @type {number} */ var rows = deqpUtils.getDataTypeMatrixNumRows(original.type);
        /** @type {number} */ var cols = deqpUtils.getDataTypeMatrixNumColumns(original.type);
        /** @type {VarValue} */ var result;
        result.type = getDataTypeTransposedMatrix(original.type);

        for (var i = 0; i < rows; i++)
        for (var j = 0; j < cols; j++)
            result.val[i * cols + j] = original.val[j * rows + i];

        return result;
    };

    /**
     * @param {VarValue} value
     * @return {string}
     */
    var shaderVarValueStr = function(value) {
        /** @type {number} */ var numElems = deqpUtils.getDataTypeScalarSize(value.type);
        /** @type {string} */ var result = '';

        if (numElems > 1)
            result += deqpUtils.getDataTypeName(value.type) + '(';

        for (var i = 0; i < numElems; i++)
        {
            if (i > 0)
                result += ', ';

            if (deqpUtils.isDataTypeFloatOrVec(value.type) || deqpUtils.isDataTypeMatrix(value.type))
                result += value.val[i].toFixed(2);
            else if (deqpUtils.isDataTypeIntOrIVec((value.type)))
                result += value.val[i];
            else if (deqpUtils.isDataTypeUintOrUVec((value.type)))
                result += value.val[i] + 'u';
            else if (deqpUtils.isDataTypeBoolOrBVec((value.type)))
                result += value.val[i] ? 'true' : 'false';
            else if (deqpUtils.isDataTypeSampler((value.type)))
                result += shaderVarValueStr(getSamplerFillValue(value));
            else
                DE_ASSERT(false);
        }

        if (numElems > 1)
            result += ')';

        return result;
    };

    /**
     * @param {VarValue} value
     * @return {string}
     */
    var apiVarValueStr = function(value) {
        /** @type {number} */ var numElems = deqpUtils.getDataTypeScalarSize(value.type);
        /** @type {string} */ var result;

        if (numElems > 1)
            result += '(';

        for (var i = 0; i < numElems; i++)
        {
            if (i > 0)
                result += ', ';

            if (deqpUtils.isDataTypeFloatOrVec(value.type) || deqpUtils.isDataTypeMatrix(value.type))
                result += value.val[i].toFixed(2);
            else if (deqpUtils.isDataTypeIntOrIVec(value.type) ||
                deqpUtils.isDataTypeUintOrUVec(value.type))
                result += value.val[i];
            else if (deqpUtils.isDataTypeBoolOrBVec(value.type))
                result += value.val[i] ? 'true' : 'false';
            else if (deqpUtils.isDataTypeSampler(value.type))
                result += value.val.samplerV.unit;
            else
                DE_ASSERT(false);
        }

        if (numElems > 1)
            result += ')';

        return result;
    };

    /**
     * @param {deqpUtils.DataType} type
     * @param {deRandom.Random} rnd
     * @param {number} samplerUnit
     * @return {VarValue}
     */
    var generateRandomVarValue = function(type, rnd, samplerUnit /* Used if type is a sampler type. \note Samplers' unit numbers are not randomized. */) {
        if (samplerUnit === undefined) samplerUnit = -1;
        /** @type {number} */ var numElems = deqpUtils.getDataTypeScalarSize(type);
        /** @type {VarValue} */ var result = new VarValue();
        result.type = type;

        DE_ASSERT((samplerUnit >= 0) == (deqpUtils.isDataTypeSampler(type)));

        if (deqpUtils.isDataTypeFloatOrVec(type) || deqpUtils.isDataTypeMatrix(type))
        {
            for (var i = 0; i < numElems; i++)
                result.val[i] = rnd.getFloat(-10.0, 10.0);
        }
        else if (deqpUtils.isDataTypeIntOrIVec(type))
        {
            for (var i = 0; i < numElems; i++)
                result.val[i] = rnd.getInt(-10, 10);
        }
        else if (deqpUtils.isDataTypeUintOrUVec(type))
        {
            for (var i = 0; i < numElems; i++)
                result.val[i] = rnd.getInt(0, 10);
        }
        else if (deqpUtils.isDataTypeBoolOrBVec(type))
        {
            for (var i = 0; i < numElems; i++)
                result.val[i] = rnd.getBool();
        }
        else if (deqpUtils.isDataTypeSampler(type))
        {
            /** @type {deqpUtils.DataType} */ var texResultType = getSamplerLookupReturnType(type);
            /** @type {deqpUtils.DataType} */ var texResultScalarType = deqpUtils.getDataTypeScalarTypeAsDataType(texResultType);
            /** @type {number} */ var texResultNumDims = deqpUtils.getDataTypeScalarSize(texResultType);

            result.val = new SamplerV();
            result.val.samplerV.unit = samplerUnit;

            for (var i = 0; i < texResultNumDims; i++)
            {
                switch (texResultScalarType)
                {
                    case deqpUtils.DataType.FLOAT: result.val.samplerV.fillColor[i] = rnd.getFloat(0.0, 1.0); break;
                    case deqpUtils.DataType.INT: result.val.samplerV.fillColor[i] = rnd.getInt(-10, 10); break;
                    case deqpUtils.DataType.UINT: result.val.samplerV.fillColor[i] = rnd.getInt(0, 10); break;
                    default:
                        DE_ASSERT(false);
                }
            }
        }
        else
            DE_ASSERT(false);

        return result;
    };

    /**
     * @param {deqpUtils.DataType} type
     * @return {VarValue}
     */
    var generateZeroVarValue = function(type) {
        /** @type {number} */ var numElems = deqpUtils.getDataTypeScalarSize(type);
        /** @type {VarValue} */ var result;
        result.type = type;

        if (deqpUtils.isDataTypeFloatOrVec(type) || deqpUtils.isDataTypeMatrix(type))
        {
            for (var i = 0; i < numElems; i++)
                result.val[i] = 0.0;
        }
        else if (deqpUtils.isDataTypeIntOrIVec(type))
        {
            for (var i = 0; i < numElems; i++)
                result.val[i] = 0;
        }
        else if (deqpUtils.isDataTypeUintOrUVec(type))
        {
            for (var i = 0; i < numElems; i++)
                result.val[i] = 0;
        }
        else if (deqpUtils.isDataTypeBoolOrBVec(type))
        {
            for (var i = 0; i < numElems; i++)
                result.val[i] = false;
        }
        else if (deqpUtils.isDataTypeSampler(type))
        {
            /** @type {deqpUtils.DataType} */ var texResultType = getSamplerLookupReturnType(type);
            /** @type {deqpUtils.DataType} */ var texResultScalarType = deqpUtils.getDataTypeScalarType(texResultType);
            /** @type {number} */ var texResultNumDims = deqpUtils.getDataTypeScalarSize(texResultType);

            result.val = new SamplerV();
            result.val.samplerV.unit = 0;

            for (var i = 0; i < texResultNumDims; i++)
            {
                switch (texResultScalarType)
                {
                    case deqpUtils.DataType.FLOAT: result.val.samplerV.fillColor[i] = 0.12 * i; break;
                    case deqpUtils.DataType.INT: result.val.samplerV.fillColor[i] = -2 + i; break;
                    case deqpUtils.DataType.UINT: result.val.samplerV.fillColor[i] = 4 + i; break;
                    default:
                        DE_ASSERT(false);
                }
            }
        }
        else
            DE_ASSERT(false);

        return result;
    };

    /**
     * @param {VarValue} a
     * @param {VarValue} b
     * @return {boolean}
     */
    var apiVarValueEquals = function(a, b) {
        /** @type {number} */ var size = deqpUtils.getDataTypeScalarSize(a.type);
        /** @type {number} */ var floatThreshold = 0.05;

        DE_ASSERT(a.type == b.type);

        if (deqpUtils.isDataTypeFloatOrVec(a.type) || deqpUtils.isDataTypeMatrix(a.type))
        {
            for (var i = 0; i < size; i++)
                if (Math.abs(a.val[i] - b.val[i]) >= floatThreshold)
                    return false;
        }
        else if (deqpUtils.isDataTypeIntOrIVec(a.type))
        {
            for (var i = 0; i < size; i++)
                if (a.val[i] != b.val[i])
                    return false;
        }
        else if (deqpUtils.isDataTypeUintOrUVec(a.type))
        {
            for (var i = 0; i < size; i++)
                if (a.val[i] != b.val[i])
                    return false;
        }
        else if (deqpUtils.isDataTypeBoolOrBVec(a.type))
        {
            for (var i = 0; i < size; i++)
                if (a.val[i] != b.val[i])
                    return false;
        }
        else if (deqpUtils.isDataTypeSampler(a.type))
        {
            if (a.val.samplerV.unit != b.val.samplerV.unit)
                return false;
        }
        else
            DE_ASSERT(false);

        return true;
    };

    /**
     * @param {VarValue} boolValue
     * @param {deqpUtils.DataType} targetScalarType
     * @param {deRandom.Random} rnd
     * @return {VarValue}
     */
    var getRandomBoolRepresentation = function(boolValue, targetScalarType, rnd) {
        DE_ASSERT(deqpUtils.isDataTypeBoolOrBVec(boolValue.type));

        /** @type {number} */ var size = deqpUtils.getDataTypeScalarSize(boolValue.type);
        /** @type {deqpUtils.DataType} */ var targetType = size == 1 ? targetScalarType : deqpUtils.getDataTypeVector(targetScalarType, size);
        /** @type {VarValue} */ var result = new VarValue();
        result.type = targetType;

        switch (targetScalarType)
        {
            case deqpUtils.DataType.INT:
                for (var i = 0; i < size; i++)
                {
                    if (boolValue.val[i])
                    {
                        result.val[i] = rnd.getInt(-10, 10);
                        if (result.val[i] == 0)
                            result.val[i] = 1;
                    }
                    else
                        result.val[i] = 0;
                }
                break;

            case deqpUtils.DataType.UINT:
                for (var i = 0; i < size; i++)
                {
                    if (boolValue.val[i])
                        result.val[i] = rnd.getInt(1, 10);
                    else
                        result.val[i] = 0;
                }
                break;

            case deqpUtils.DataType.FLOAT:
                for (var i = 0; i < size; i++)
                {
                    if (boolValue.val[i])
                    {
                        result.val[i] = rnd.getFloat(-10.0, 10.0);
                        if (result.val[i] == 0.0)
                            result.val[i] = 1.0;
                    }
                    else
                        result.val[i] = 0;
                }
                break;

            default:
                DE_ASSERT(false);
        }

        return result;
    };

    /**
     * @param {CaseShaderType} type
     * @return {string}
     */
    var getCaseShaderTypeName = function(type) {
        switch (type)
        {
            case CaseShaderType.CASESHADERTYPE_VERTEX: return 'vertex';
            case CaseShaderType.CASESHADERTYPE_FRAGMENT: return 'fragment';
            case CaseShaderType.CASESHADERTYPE_BOTH: return 'both';
            default:
                DE_ASSERT(false);
                return DE_NULL;
        }
    };

    /**
     * @param {deMath.deUint32} seed
     * @return {CaseShaderType}
     */
    var randomCaseShaderType = function(seed) {
        return (new deRandom.Random(seed)).getInt(0, CaseShaderType.CASESHADERTYPE_LAST - 1);
    };

    //UniformCase definitions

    /**
     * @enum Feature
     */
    var Feature = {
        // ARRAYUSAGE_ONLY_MIDDLE_INDEX: only middle index of each array is used in shader. If not given, use all indices.
        ARRAYUSAGE_ONLY_MIDDLE_INDEX: 1 << 0,

        // UNIFORMFUNC_VALUE: use pass-by-value versions of uniform assignment funcs, e.g. glUniform1f(), where possible. If not given, use pass-by-pointer versions.
        UNIFORMFUNC_VALUE: 1 << 1,

        // MATRIXMODE_ROWMAJOR: pass matrices to GL in row major form. If not given, use column major.
        MATRIXMODE_ROWMAJOR: 1 << 2,

        // ARRAYASSIGN: how basic-type arrays are assigned with glUniform*(). If none given, assign each element of an array separately.
        ARRAYASSIGN_FULL: 1 << 3, //!< Assign all elements of an array with one glUniform*().
        ARRAYASSIGN_BLOCKS_OF_TWO: 1 << 4, //!< Assign two elements per one glUniform*().

        // UNIFORMUSAGE_EVERY_OTHER: use about half of the uniforms. If not given, use all uniforms (except that some array indices may be omitted according to ARRAYUSAGE).
        UNIFORMUSAGE_EVERY_OTHER: 1 << 5,

        // BOOLEANAPITYPE: type used to pass booleans to and from GL api. If none given, use float.
        BOOLEANAPITYPE_INT: 1 << 6,
        BOOLEANAPITYPE_UINT: 1 << 7,

        // UNIFORMVALUE_ZERO: use zero-valued uniforms. If not given, use random uniform values.
        UNIFORMVALUE_ZERO: 1 << 8,

        // ARRAY_FIRST_ELEM_NAME_NO_INDEX: in certain API functions, when referring to the first element of an array, use just the array name without [0] at the end.
        ARRAY_FIRST_ELEM_NAME_NO_INDEX: 1 << 9
    };

    // A basic uniform is a uniform (possibly struct or array member) whose type is a basic type (e.g. float, ivec4, sampler2d).
    /**
     * @param {string} name_
     * @param {deqpUtils.DataType} type_
     * @param {boolean} isUsedInShader_
     * @param {VarValue} finalValue_
     * @param {string} rootName_
     * @param {number} elemNdx_
     * @param {number} rootSize_
     */
    var BasicUniform = function(name_, type_, isUsedInShader_, finalValue_, rootName_, elemNdx_, rootSize_) {
        /** @type {string} */ this.name = name_;
        /** @type {deqpUtils.DataType} */ this.type = type_;
        /** @type {boolean} */ this.isUsedInShader = isUsedInShader_;
        /** @type {VarValue} */ this.finalValue = finalValue_; //!< The value we ultimately want to set for this uniform.

        /** @type {string} */ this.rootName = rootName_ === undefined ? name_ : rootName_; //!< If this is a member of a basic-typed array, rootName is the name of that array with "[0]" appended. Otherwise it equals name.
        /** @type {number} */ this.elemNdx = elemNdx_ === undefined ? -1 : elemNdx_; //!< If this is a member of a basic-typed array, elemNdx is the index in that array. Otherwise -1.
        /** @type {number} */ this.rootSize = rootSize_ === undefined ? 1 : rootSize_; //!< If this is a member of a basic-typed array, rootSize is the size of that array. Otherwise 1.
    };

    /**
     * @param {Array.<BasicUniform>} vec
     * @param {string} name
     * @return {Array.<BasicUniform>}
     */
    BasicUniform.findWithName = function(vec, name) {
        for (var i = 0; i < vec.length; i++) //vector<BasicUniform>::const_iterator it = vec.begin(); it != vec.end(); it++)
        {
            if (vec[i].name == name)
                return vec[i];
        }
        return undefined;
    };

    // Reference values for info that is expected to be reported by glGetActiveUniform() or glGetActiveUniformsiv().
    /**
     * @param {string} name_
     * @param {deqpUtils.DataType} type_
     * @param {boolean} used
     */
    var BasicUniformReportRef = function(name_, type_, used) {
        /** @type {string} */ this.name = name_;
        // \note minSize and maxSize are for arrays and can be distinct since implementations are allowed, but not required, to trim the inactive end indices of arrays.
        /** @type {number} */ this.minSize;
        /** @type {number} */ this.maxSize;
        /** @type {deqpUtils.DataType} */ this.type = type_;
        /** @type {boolean} */ this.isUsedInShader = used;
    };

    /**
     * @param {string} name_
     * @param {number} minS
     * @param {number} maxS
     * @param {deqpUtils.DataType} type_
     * @param {boolean} used
     */
    BasicUniformReportRef.prototype.constructor_A = function(name_, minS, maxS, type_, used) {
        this.name = name_;
        this.minSize = minS;
        this.maxSize = maxS;
        this.type = type_;
        this.isUsedInShader = used;
        DE_ASSERT(this.minSize <= this.maxSize);
    };

    // Info that is actually reported by glGetActiveUniform() or glGetActiveUniformsiv().
    /**
     * @param {string} name_
     * @param {number} nameLength_
     * @param {number} size_
     * @param {deqpUtils.DataType} type_
     * @param {number} index_
     */
    var BasicUniformReportGL = function(name_, nameLength_, size_, type_, index_) {
        this.name = name_;
        this.nameLength = nameLength_;
        this.size = size_;
        this.type = type_;
        this.index = index_;
    };

    /**
     * @param {Array.<BasicUniformReportGL>} vec
     * @param {string} name
     * @return {Array.<BasicUniformReportGL>}
     */
    BasicUniformReportGL.findWithName = function(vec, name) {
        for (var i = 0; i < vec.length; i++) //vector<BasicUniformReportGL>::const_iterator it = vec.begin(); it != vec.end(); it++)
        {
            if (vec[i].name == name)
                return vec[i];
        }
        return undefined;
    };

    /**
     * UniformCase class, inherits from TestCase class
     * @param {string} name
     * @param {string} description
     * @param {deMath.deUint32} seed
     * @return {UniformCase}
     */
    var UniformCase = function(name, description, seed) { // \note Randomizes caseType, uniformCollection and features.
        deqpTests.DeqpTest.call(this, name, description);

        /** @type {deMath.deUint32} */ this.m_features = this.randomFeatures(seed);
        /** @type {UniformCollection} (SharedPtr) */ this.m_uniformCollection = UniformCollection.random(seed);

        /** @type {CaseShaderType} */ this.m_caseShaderType = randomCaseShaderType(seed);

        /** @type {Array.<gluTexture.Texture2D>} */ this.m_textures2d = [];
        /** @type {Array.<gluTexture.TextureCube>} */ this.m_texturesCube = [];
        /** @type {Array.<deMath.deUint32>} */ this.m_filledTextureUnits = [];
    };

    UniformCase.prototype = Object.create(deqpTests.DeqpTest.prototype);
    UniformCase.prototype.constructor = UniformCase;

    /**
     * UniformCase new_B. Creates a UniformCase. Use after constructor.
     * @param {CaseShaderType} caseShaderType
     * @param {UniformCollection} uniformCollection (SharedPtr)
     * @param {deMath.deUint32} features
     * @return {UniformCase}
     */
    UniformCase.prototype.newB = function(caseShaderType, uniformCollection, features) {
        this.m_caseShaderType = caseShaderType;
        this.m_uniformCollection = uniformCollection;
        this.m_features = features;

        return this;
    };

    /**
     * UniformCase new_B (static). Creates a UniformCase
     * @param {string} name
     * @param {string} description
     * @param {CaseShaderType} caseShaderType
     * @param {UniformCollection} uniformCollection (SharedPtr)
     * @param {deMath.deUint32} features
     * @return {UniformCase}
     */
    UniformCase.new_B = function(name, description, caseShaderType, uniformCollection, features) {
        var uniformCase = new UniformCase(name, description, 0).newB(caseShaderType, uniformCollection, features);

        return uniformCase;
    };

    /**
     * UniformCase new_A. Creates a UniformCase. Use after constructor.
     * @param {CaseShaderType} caseShaderType
     * @param {UniformCollection} uniformCollection (SharedPtr)
     * @return {UniformCase}
     */
    UniformCase.prototype.newA = function(caseShaderType, uniformCollection) {
       this.m_caseShaderType = caseShaderType;
       this.m_uniformCollection = uniformCollection;
       this.m_features = 0;

       return this;
    };

    /**
     * UniformCase new_A (static). Creates a UniformCase
     * @param {string} name
     * @param {string} description
     * @param {CaseShaderType} caseShaderType
     * @param {UniformCollection} uniformCollection (SharedPtr)
     * @return {UniformCase}
     */
    UniformCase.new_A = function(name, description, caseShaderType, uniformCollection) {
        var uniformCase = new UniformCase(name, description, 0).newA(caseShaderType, uniformCollection);

        return uniformCase;
    };

    /**
     * @param {deMath.deUint32} seed
     * @return {deMath.deUint32}
     */
    UniformCase.prototype.randomFeatures = function(seed) {
        /** @type {Array.<deMath.deUint32>} */ UniformCase.arrayUsageChoices = [0, Feature.ARRAYUSAGE_ONLY_MIDDLE_INDEX];
        /** @type {Array.<deMath.deUint32>} */ UniformCase.uniformFuncChoices = [0, Feature.UNIFORMFUNC_VALUE];
        /** @type {Array.<deMath.deUint32>} */ UniformCase.matrixModeChoices = [0, Feature.MATRIXMODE_ROWMAJOR];
        /** @type {Array.<deMath.deUint32>} */ UniformCase.arrayAssignChoices = [0, Feature.ARRAYASSIGN_FULL, Feature.ARRAYASSIGN_BLOCKS_OF_TWO];
        /** @type {Array.<deMath.deUint32>} */ UniformCase.uniformUsageChoices = [0, Feature.UNIFORMUSAGE_EVERY_OTHER];
        /** @type {Array.<deMath.deUint32>} */ UniformCase.booleanApiTypeChoices = [0, Feature.BOOLEANAPITYPE_INT, Feature.BOOLEANAPITYPE_UINT];
        /** @type {Array.<deMath.deUint32>} */ UniformCase.uniformValueChoices = [0, Feature.UNIFORMVALUE_ZERO];

        /** @type {deRandom.Random} */ var rnd = new deRandom.Random(seed);

        /** @type {deMath.deUint32} */ var result = 0;

        var ARRAY_CHOICE = function(ARR) {return ARR[rnd.getInt(0, ARR.length - 1)];};

        result |= ARRAY_CHOICE(UniformCase.arrayUsageChoices);
        result |= ARRAY_CHOICE(UniformCase.uniformFuncChoices);
        result |= ARRAY_CHOICE(UniformCase.matrixModeChoices);
        result |= ARRAY_CHOICE(UniformCase.arrayAssignChoices);
        result |= ARRAY_CHOICE(UniformCase.uniformUsageChoices);
        result |= ARRAY_CHOICE(UniformCase.booleanApiTypeChoices);
        result |= ARRAY_CHOICE(UniformCase.uniformValueChoices);

        return result;
    };

    /**
     * Initialize the UniformCase
     */
    UniformCase.prototype.init = function() {
        /** @type {number} */ var numSamplerUniforms = this.m_uniformCollection.getNumSamplers();
        /** @type {number} */ var vertexTexUnitsRequired = this.m_caseShaderType != CaseShaderType.CASESHADERTYPE_FRAGMENT ? numSamplerUniforms : 0;
        /** @type {number} */ var fragmentTexUnitsRequired = this.m_caseShaderType != CaseShaderType.CASESHADERTYPE_VERTEX ? numSamplerUniforms : 0;
        /** @type {number} */ var combinedTexUnitsRequired = vertexTexUnitsRequired + fragmentTexUnitsRequired;
        /** @type {number} */ var vertexTexUnitsSupported = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
        /** @type {number} */ var fragmentTexUnitsSupported = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
        /** @type {number} */ var combinedTexUnitsSupported = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);

        DE_ASSERT(numSamplerUniforms <= MAX_NUM_SAMPLER_UNIFORMS);

        if (vertexTexUnitsRequired > vertexTexUnitsSupported)
            testFailedOptions('' + vertexTexUnitsRequired + ' vertex texture units required, ' + vertexTexUnitsSupported + ' supported', true);
        if (fragmentTexUnitsRequired > fragmentTexUnitsSupported)
            testFailedOptions('' + fragmentTexUnitsRequired + ' fragment texture units required, ' + fragmentTexUnitsSupported + ' supported', true);
        if (combinedTexUnitsRequired > combinedTexUnitsSupported)
            testFailedOptions('' + combinedTexUnitsRequired + ' combined texture units required, ' + combinedTexUnitsSupported + ' supported', true);
    };

    /**
     * @param {Array.<BasicUniform>} basicUniformsDst
     * @param {Array.<BasicUniformReportRef>} basicUniformReportsDst
     * @param {gluVT.VarType} varType
     * @param {string} varName
     * @param {boolean} isParentActive
     * @param {number} samplerUnitCount
     * @param {deRandom.Random} rnd
     */
    UniformCase.prototype.generateBasicUniforms = function(basicUniformsDst, basicUniformReportsDst, varType, varName, isParentActive, samplerUnitCounter, rnd) {
        if (varType.isBasicType())
        {
            /** @type {boolean} */ var isActive = isParentActive && (this.m_features & Feature.UNIFORMUSAGE_EVERY_OTHER ? basicUniformsDst.length % 2 == 0 : true);
            /** @type {deqpUtils.DataType} */ var type = varType.getBasicType();
            /** @type {VarValue} */ var value = this.m_features & Feature.UNIFORMVALUE_ZERO ? generateZeroVarValue(type) :
                                                deqpUtils.isDataTypeSampler(type) ? generateRandomVarValue(type, rnd, samplerUnitCounter++) :
                                                generateRandomVarValue(varType.getBasicType(), rnd);

            basicUniformsDst.push(new BasicUniform(varName, varType.getBasicType(), isActive, value));
            basicUniformReportsDst.push(new BasicUniformReportRef(varName, varType.getBasicType(), isActive));
        }
        else if (varType.isArrayType())
        {
            /** @type {number} */ var size = varType.getArraySize();
            /** @type {string} */ var arrayRootName = '' + varName + '[0]';
            /** @type {Array.<boolean>} */ var isElemActive;

            for (var elemNdx = 0; elemNdx < varType.getArraySize(); elemNdx++)
            {
                /** @type {boolean} */ var indexedName = '' + varName + '[' + elemNdx + ']';
                /** @type {boolean} */ var isCurElemActive = isParentActive &&
                                                  (this.m_features & Feature.UNIFORMUSAGE_EVERY_OTHER ? basicUniformsDst.size() % 2 == 0 : true) &&
                                                  (this.m_features & Feature.ARRAYUSAGE_ONLY_MIDDLE_INDEX ? elemNdx == Math.floor(size / 2) : true);

                isElemActive.push(isCurElemActive);

                if (varType.getElementType().isBasicType())
                {
                    // \note We don't want separate entries in basicUniformReportsDst for elements of basic-type arrays.
                    /** @type {deqpUtils.DataType} */ var elemBasicType = varType.getElementType().getBasicType();
                    /** @type {VarValue} */ var value = this.m_features & Feature.UNIFORMVALUE_ZERO ? generateZeroVarValue(elemBasicType) :
                                                        deqpUtils.isDataTypeSampler(elemBasicType) ? generateRandomVarValue(elemBasicType, rnd, samplerUnitCounter++) :
                                                        generateRandomVarValue(elemBasicType, rnd);

                    basicUniformsDst.push(new BasicUniform(indexedName, elemBasicType, isCurElemActive, value, arrayRootName, elemNdx, size));
                }
                else
                    this.generateBasicUniforms(basicUniformsDst, basicUniformReportsDst, varType.getElementType(), indexedName, isCurElemActive, samplerUnitCounter, rnd);
            }

            if (varType.getElementType().isBasicType())
            {
                /** @type {number} */ var minSize;
                for (minSize = varType.getArraySize(); minSize > 0 && !isElemActive[minSize - 1]; minSize--) {}

                basicUniformReportsDst.push(new BasicUniformReportRef(arrayRootName, minSize, size, varType.getElementType().getBasicType(), isParentActive && minSize > 0));
            }
        }
        else
        {
            DE_ASSERT(varType.isStructType());

            /** @type {gluVT.StructType} */ var structType = varType.getStructPtr();

            for (var i = 0; i < structType.getNumMembers(); i++)
            {
                /** @type {gluVT.StructMember} */ var member = structType.getMember(i);
                /** @type {string} */ var memberFullName = '' + varName + '.' + member.getName();

                this.generateBasicUniforms(basicUniformsDst, basicUniformReportsDst, member.getType(), memberFullName, isParentActive, samplerUnitCounter, rnd);
            }
        }
    };

    /**
     * @param {string} dst
     * @return {string}
     */
    UniformCase.prototype.writeUniformDefinitions = function(dst) {
        for (var i = 0; i < this.m_uniformCollection.getNumStructTypes(); i++)
            dst += gluVT.declareStructType(this.m_uniformCollection.getStructType(i), 0) + ';\n';

        for (var i = 0; i < this.m_uniformCollection.getNumUniforms(); i++)
            dst += 'uniform ' + gluVT.declareVariable(this.m_uniformCollection.getUniform(i).type, this.m_uniformCollection.getUniform(i).name, 0) + ';\n';

        dst += '\n';

        {
            var compareFuncs =
            [
                { requiringTypes: [deqpUtils.isDataTypeFloatOrVec, deqpUtils.isDataTypeMatrix], definition: 'mediump float compare_float    (mediump float a, mediump float b)  { return abs(a - b) < 0.05 ? 1.0 : 0.0; }'},
                { requiringTypes: [function(t) {return dataTypeEquals(deqpUtils.DataType.FLOAT_VEC2, t);}, function(t) {return dataTypeIsMatrixWithNRows(2, t);}], definition: 'mediump float compare_vec2     (mediump vec2 a, mediump vec2 b)    { return compare_float(a.x, b.x)*compare_float(a.y, b.y); }'},
                { requiringTypes: [function(t) {return dataTypeEquals(deqpUtils.DataType.FLOAT_VEC3, t);}, function(t) {return dataTypeIsMatrixWithNRows(3, t);}], definition: 'mediump float compare_vec3     (mediump vec3 a, mediump vec3 b)    { return compare_float(a.x, b.x)*compare_float(a.y, b.y)*compare_float(a.z, b.z); }'},
                { requiringTypes: [function(t) {return dataTypeEquals(deqpUtils.DataType.FLOAT_VEC4, t);}, function(t) {return dataTypeIsMatrixWithNRows(4, t);}], definition: 'mediump float compare_vec4     (mediump vec4 a, mediump vec4 b)    { return compare_float(a.x, b.x)*compare_float(a.y, b.y)*compare_float(a.z, b.z)*compare_float(a.w, b.w); }'},
                { requiringTypes: [function(t) {return dataTypeEquals(deqpUtils.DataType.FLOAT_MAT2, t);}, function(t) {return dataTypeEquals(deqpUtils.DataType.INVALID, t);}], definition: 'mediump float compare_mat2     (mediump mat2 a, mediump mat2 b)    { return compare_vec2(a[0], b[0])*compare_vec2(a[1], b[1]); }'},
                { requiringTypes: [function(t) {return dataTypeEquals(deqpUtils.DataType.FLOAT_MAT2X3, t);}, function(t) {return dataTypeEquals(deqpUtils.DataType.INVALID, t);}], definition: 'mediump float compare_mat2x3   (mediump mat2x3 a, mediump mat2x3 b){ return compare_vec3(a[0], b[0])*compare_vec3(a[1], b[1]); }'},
                { requiringTypes: [function(t) {return dataTypeEquals(deqpUtils.DataType.FLOAT_MAT2X4, t);}, function(t) {return dataTypeEquals(deqpUtils.DataType.INVALID, t);}], definition: 'mediump float compare_mat2x4   (mediump mat2x4 a, mediump mat2x4 b){ return compare_vec4(a[0], b[0])*compare_vec4(a[1], b[1]); }'},
                { requiringTypes: [function(t) {return dataTypeEquals(deqpUtils.DataType.FLOAT_MAT3X2, t);}, function(t) {return dataTypeEquals(deqpUtils.DataType.INVALID, t);}], definition: 'mediump float compare_mat3x2   (mediump mat3x2 a, mediump mat3x2 b){ return compare_vec2(a[0], b[0])*compare_vec2(a[1], b[1])*compare_vec2(a[2], b[2]); }'},
                { requiringTypes: [function(t) {return dataTypeEquals(deqpUtils.DataType.FLOAT_MAT3, t);}, function(t) {return dataTypeEquals(deqpUtils.DataType.INVALID, t);}], definition: 'mediump float compare_mat3     (mediump mat3 a, mediump mat3 b)    { return compare_vec3(a[0], b[0])*compare_vec3(a[1], b[1])*compare_vec3(a[2], b[2]); }'},
                { requiringTypes: [function(t) {return dataTypeEquals(deqpUtils.DataType.FLOAT_MAT3X4, t);}, function(t) {return dataTypeEquals(deqpUtils.DataType.INVALID, t);}], definition: 'mediump float compare_mat3x4   (mediump mat3x4 a, mediump mat3x4 b){ return compare_vec4(a[0], b[0])*compare_vec4(a[1], b[1])*compare_vec4(a[2], b[2]); }'},
                { requiringTypes: [function(t) {return dataTypeEquals(deqpUtils.DataType.FLOAT_MAT4X2, t);}, function(t) {return dataTypeEquals(deqpUtils.DataType.INVALID, t);}], definition: 'mediump float compare_mat4x2   (mediump mat4x2 a, mediump mat4x2 b){ return compare_vec2(a[0], b[0])*compare_vec2(a[1], b[1])*compare_vec2(a[2], b[2])*compare_vec2(a[3], b[3]); }'},
                { requiringTypes: [function(t) {return dataTypeEquals(deqpUtils.DataType.FLOAT_MAT4X3, t);}, function(t) {return dataTypeEquals(deqpUtils.DataType.INVALID, t);}], definition: 'mediump float compare_mat4x3   (mediump mat4x3 a, mediump mat4x3 b){ return compare_vec3(a[0], b[0])*compare_vec3(a[1], b[1])*compare_vec3(a[2], b[2])*compare_vec3(a[3], b[3]); }'},
                { requiringTypes: [function(t) {return dataTypeEquals(deqpUtils.DataType.FLOAT_MAT4, t);}, function(t) {return dataTypeEquals(deqpUtils.DataType.INVALID, t);}], definition: 'mediump float compare_mat4     (mediump mat4 a, mediump mat4 b)    { return compare_vec4(a[0], b[0])*compare_vec4(a[1], b[1])*compare_vec4(a[2], b[2])*compare_vec4(a[3], b[3]); }'},
                { requiringTypes: [function(t) {return dataTypeEquals(deqpUtils.DataType.INT, t);}, function(t) {return dataTypeEquals(deqpUtils.DataType.INVALID, t);}], definition: 'mediump float compare_int      (mediump int a, mediump int b)      { return a == b ? 1.0 : 0.0; }'},
                { requiringTypes: [function(t) {return dataTypeEquals(deqpUtils.DataType.INT_VEC2, t);}, function(t) {return dataTypeEquals(deqpUtils.DataType.INVALID, t);}], definition: 'mediump float compare_ivec2    (mediump ivec2 a, mediump ivec2 b)  { return a == b ? 1.0 : 0.0; }'},
                { requiringTypes: [function(t) {return dataTypeEquals(deqpUtils.DataType.INT_VEC3, t);}, function(t) {return dataTypeEquals(deqpUtils.DataType.INVALID, t);}], definition: 'mediump float compare_ivec3    (mediump ivec3 a, mediump ivec3 b)  { return a == b ? 1.0 : 0.0; }'},
                { requiringTypes: [function(t) {return dataTypeEquals(deqpUtils.DataType.INT_VEC4, t);}, function(t) {return dataTypeEquals(deqpUtils.DataType.INVALID, t);}], definition: 'mediump float compare_ivec4    (mediump ivec4 a, mediump ivec4 b)  { return a == b ? 1.0 : 0.0; }'},
                { requiringTypes: [function(t) {return dataTypeEquals(deqpUtils.DataType.UINT, t);}, function(t) {return dataTypeEquals(deqpUtils.DataType.INVALID, t);}], definition: 'mediump float compare_uint     (mediump uint a, mediump uint b)    { return a == b ? 1.0 : 0.0; }'},
                { requiringTypes: [function(t) {return dataTypeEquals(deqpUtils.DataType.UINT_VEC2, t);}, function(t) {return dataTypeEquals(deqpUtils.DataType.INVALID, t);}], definition: 'mediump float compare_uvec2    (mediump uvec2 a, mediump uvec2 b)  { return a == b ? 1.0 : 0.0; }'},
                { requiringTypes: [function(t) {return dataTypeEquals(deqpUtils.DataType.UINT_VEC3, t);}, function(t) {return dataTypeEquals(deqpUtils.DataType.INVALID, t);}], definition: 'mediump float compare_uvec3    (mediump uvec3 a, mediump uvec3 b)  { return a == b ? 1.0 : 0.0; }'},
                { requiringTypes: [function(t) {return dataTypeEquals(deqpUtils.DataType.UINT_VEC4, t);}, function(t) {return dataTypeEquals(deqpUtils.DataType.INVALID, t);}], definition: 'mediump float compare_uvec4    (mediump uvec4 a, mediump uvec4 b)  { return a == b ? 1.0 : 0.0; }'},
                { requiringTypes: [function(t) {return dataTypeEquals(deqpUtils.DataType.BOOL, t);}, function(t) {return dataTypeEquals(deqpUtils.DataType.INVALID, t);}], definition: 'mediump float compare_bool     (bool a, bool b)                    { return a == b ? 1.0 : 0.0; }'},
                { requiringTypes: [function(t) {return dataTypeEquals(deqpUtils.DataType.BOOL_VEC2, t);}, function(t) {return dataTypeEquals(deqpUtils.DataType.INVALID, t);}], definition: 'mediump float compare_bvec2    (bvec2 a, bvec2 b)                  { return a == b ? 1.0 : 0.0; }'},
                { requiringTypes: [function(t) {return dataTypeEquals(deqpUtils.DataType.BOOL_VEC3, t);}, function(t) {return dataTypeEquals(deqpUtils.DataType.INVALID, t);}], definition: 'mediump float compare_bvec3    (bvec3 a, bvec3 b)                  { return a == b ? 1.0 : 0.0; }'},
                { requiringTypes: [function(t) {return dataTypeEquals(deqpUtils.DataType.BOOL_VEC4, t);}, function(t) {return dataTypeEquals(deqpUtils.DataType.INVALID, t);}], definition: 'mediump float compare_bvec4    (bvec4 a, bvec4 b)                  { return a == b ? 1.0 : 0.0; }'}
            ];

            /** @type {Array.<deqpUtils.DataType>} */ var samplerTypes = this.m_uniformCollection.getSamplerTypes();

            for (var compFuncNdx = 0; compFuncNdx < compareFuncs.length; compFuncNdx++)
            {
                /** @type {Array.<dataTypePredicate>} */ var typeReq = compareFuncs[compFuncNdx].requiringTypes;
                /** @type {boolean} */ var containsTypeSampler = false;

                for (var i = 0; i < samplerTypes.length; i++)
                {
                    if (deqpUtils.isDataTypeSampler(samplerTypes[i]))
                    {
                        /** @type {deqpUtils.DataType} */ var retType = getSamplerLookupReturnType(samplerTypes[i]);
                        if (typeReq[0](retType) || typeReq[1](retType))
                        {
                            containsTypeSampler = true;
                            break;
                        }
                    }
                }

                if (containsTypeSampler || this.m_uniformCollection.containsMatchingBasicType(typeReq[0]) || this.m_uniformCollection.containsMatchingBasicType(typeReq[1]))
                    dst += compareFuncs[compFuncNdx].definition + '\n';
            }
        }

        return dst;
    };

    /**
     * @param {string} dst
     * @param {BasicUniform} uniform
     * @return {string} Used to write the string in the output parameter
     */
    UniformCase.prototype.writeUniformCompareExpr = function(dst, uniform) {
        if (deqpUtils.isDataTypeSampler(uniform.type))
            dst += 'compare_' + deqpUtils.getDataTypeName(getSamplerLookupReturnType(uniform.type)) + '(texture2D(' + uniform.name + ', vec' + getSamplerNumLookupDimensions(uniform.type) + '(0.0))';
        else
            dst += 'compare_' + deqpUtils.getDataTypeName(uniform.type) + '(' + uniform.name;

        dst += ', ' + shaderVarValueStr(uniform.finalValue) + ')';

        return dst;
    };

    /**
     * @param {string} dst
     * @param {Array.<BasicUniform>} basicUniforms
     * @param {string} variableName
     * @return {string} Used to write the string in the output parameter
     */
    UniformCase.prototype.writeUniformComparisons = function(dst, basicUniforms, variableName) {
        for (var i = 0; i < basicUniforms.length; i++)
        {
            /** @type {BasicUniform} */ var unif = basicUniforms[i];

            if (unif.isUsedInShader)
            {
                dst += '\t' + variableName + ' *= ';
                dst = this.writeUniformCompareExpr(dst, basicUniforms[i]);
                dst += ';\n';
            }
            else
                dst += '\t// UNUSED: ' + basicUniforms[i].name + '\n';
        }

        return dst;
    };

    /**
     * @param {Array.<BasicUniform>} basicUniforms
     * @return {string}
     */
    UniformCase.prototype.generateVertexSource = function(basicUniforms) {
        /** @type {boolean} */ var isVertexCase = this.m_caseShaderType == CaseShaderType.CASESHADERTYPE_VERTEX || this.m_caseShaderType == CaseShaderType.CASESHADERTYPE_BOTH;
        /** @type {string} */ var result = '';

        result += '//#version 300 es\n' +
                  '/*in*/ highp vec4 a_position;\n' +
                  '/*out*/ mediump float v_vtxOut;\n' +
                  '\n';

        if (isVertexCase)
            result = this.writeUniformDefinitions(result);

        result += '\n' +
                  'void main (void)\n' +
                  '{\n' +
                  '    gl_Position = a_position;\n' +
                  '    v_vtxOut = 1.0;\n';

        if (isVertexCase)
            result = this.writeUniformComparisons(result, basicUniforms, 'v_vtxOut');

        result += '}\n';

        return result;
    };

    /**
     * @param {Array.<BasicUniform>} basicUniforms
     * @return {string}
     */
    UniformCase.prototype.generateFragmentSource = function(basicUniforms) {
        /**@type {boolean} */ var isFragmentCase = this.m_caseShaderType == CaseShaderType.CASESHADERTYPE_FRAGMENT || this.m_caseShaderType == CaseShaderType.CASESHADERTYPE_BOTH;
        /**@type {string} */ var result = '';

        result += '//#version 300 es\n' +
                  '/*in*/ mediump float v_vtxOut;\n' +
                  '\n';

        if (isFragmentCase)
            result = this.writeUniformDefinitions(result);

        result += '\n' +
                  '/*layout(location = 0) out*/ mediump vec4 dEQP_FragColor;\n' +
                  '\n' +
                  'void main (void)\n' +
                  '{\n' +
                  '    mediump float result = v_vtxOut;\n';

        if (isFragmentCase)
            result = this.writeUniformComparisons(result, basicUniforms, 'result');

        result += '    dEQP_FragColor = vec4(result, result, result, 1.0);\n' +
                  '}\n';

        return result;
    };

    /**
     * @param {VarValue} value
     */
    UniformCase.prototype.setupTexture = function(value) {
        // \note No handling for samplers other than 2D or cube.

        DE_ASSERT(getSamplerLookupReturnType(value.type) == deqpUtils.DataType.FLOAT_VEC4);

        /** @type {number} */ var width = 32;
        /** @type {number} */ var height = 32;
        /** @type {Array.<number>} */ var color = value.val.samplerV.fillColor[0];

        if (value.type == deqpUtils.DataType.SAMPLER_2D)
        {
            /** @type {gluTexture.Texture2D} */ var texture = gluTexture.texture2DFromFormat(gl, gl.RGBA, gl.UNSIGNED_BYTE, width, height);
            /** @type {tcuTexture.Texture2D} */ var refTexture = texture.getRefTexture();
            this.m_textures2d.push(texture);

            refTexture.allocLevel(0);
            fillWithColor(refTexture.getLevel(0), color);

            gluDefs.GLU_CHECK_CALL(function() {gl.activeTexture(gl.TEXTURE0 + value.val.samplerV.unit);});
            this.m_filledTextureUnits.push(value.val.samplerV.unit);
            texture.upload();
            gluDefs.GLU_CHECK_CALL(function() {gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);});
            gluDefs.GLU_CHECK_CALL(function() {gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);});
            gluDefs.GLU_CHECK_CALL(function() {gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);});
            gluDefs.GLU_CHECK_CALL(function() {gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);});
        }
        else if (value.type == deqpUtils.DataType.SAMPLER_CUBE)
        {
            DE_ASSERT(width == height);

            /** @type {gluTexture.TextureCube} */ var texture = gluTexture.TextureCube(gl, gl.RGBA, gl.UNSIGNED_BYTE, width);
            /** @type {tcuTexture.TextureCube} */ var refTexture = texture.getRefTexture();
            this.m_texturesCube.push(texture);

            for (var face = 0; face < tcuTexture.CubeFace.TOTAL_FACES; face++)
            {
                refTexture.allocLevel(face, 0);
                fillWithColor(refTexture.getLevelFace(0, face), color);
            }

            gluDefs.GLU_CHECK_CALL(function() {gl.activeTexture(gl.TEXTURE0 + value.val.samplerV.unit);});
            this.m_filledTextureUnits.push(value.val.samplerV.unit);
            texture.upload();
            gluDefs.GLU_CHECK_CALL(function() {gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);});
            gluDefs.GLU_CHECK_CALL(function() {gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);});
            gluDefs.GLU_CHECK_CALL(function() {gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);});
            gluDefs.GLU_CHECK_CALL(function() {gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);});
        }
        else
            DE_ASSERT(false);
    };

    /**
     * @param {Array.<BasicUniformReportGL>} basicUniformReportsDst
     * @param {Array.<BasicUniformReportRef>} basicUniformReportsRef
     * @param {deMath.deUint32} programGL
     * @return {boolean}
     */
    UniformCase.prototype.getActiveUniforms = function(basicUniformReportsDst, basicUniformReportsRef, programGL) {
        /** @type {number} (GLint)*/ var numActiveUniforms = 0;
        /** @type {boolean} */ var success = true;

        gluDefs.GLU_CHECK_CALL(function() {numActiveUniforms = gl.getProgramParameter(programGL, gl.ACTIVE_UNIFORMS);});
        bufferedLogToConsole('// Number of active uniforms reported: ' + numActiveUniforms);

        for (var unifNdx = 0; unifNdx < numActiveUniforms; unifNdx++)
        {
            /** @type {number} (GLint)*/ var reportedSize = -1;
            /** @type {number} (GLenum)*/ var reportedTypeGL = gl.NONE;
            /** @type {deqpUtils.DataType} */ var reportedType;
            /** @type {string} */ var reportedNameStr;
            /** @type {WebGLActiveInfo} */ var activeInfo;

            gluDefs.GLU_CHECK_CALL(function() {activeInfo = gl.getActiveUniform(programGL, unifNdx);});

            reportedNameStr = activeInfo.name;
            reportedTypeGL = activeInfo.type;
            reportedSize = activeInfo.size;

            reportedType = deqpUtils.getDataTypeFromGLType(reportedTypeGL);

            //TODO: TCU_CHECK_MSG(reportedType != deqpUtils.DataType.LAST, "Invalid uniform type");

            bufferedLogToConsole('// Got name = ' + reportedNameStr + ', size = ' + reportedSize + ', type = ' + deqpUtils.getDataTypeName(reportedType));

            if (reportedNameStr.indexOf('gl_') != 0) // Ignore built-in uniforms.
            {
                /** @type {number} */ var referenceNdx;
                for (referenceNdx = 0; referenceNdx < basicUniformReportsRef.lenght; referenceNdx++)
                {
                    if (basicUniformReportsRef[referenceNdx].name == reportedNameStr)
                        break;
                }

                if (referenceNdx >= basicUniformReportsRef.length)
                {
                    bufferedLogToConsole('// FAILURE: invalid non-built-in uniform name reported');
                    success = false;
                }
                else
                {
                    /** @type {BasicUniformReportRef} */ var reference = basicUniformReportsRef[referenceNdx];

                    DE_ASSERT(reference.type != deqpUtils.DataType.LAST);
                    DE_ASSERT(reference.minSize >= 1 || (reference.minSize == 0 && !reference.isUsedInShader));
                    DE_ASSERT(reference.minSize <= reference.maxSize);

                    if (BasicUniformReportGL.findWithName(basicUniformReportsDst, reportedNameStr) != basicUniformReportsDst[basicUniformReportsDst.length - 1])
                    {
                        bufferedLogToConsole('// FAILURE: same uniform name reported twice');
                        success = false;
                    }

                    basicUniformReportsDst.push(new BasicUniformReportGL(reportedNameStr, reportedNameStr.length, reportedSize, reportedType, unifNdx));

                    if (reportedType != reference.type)
                    {
                        bufferedLogToConsole('// FAILURE: wrong type reported, should be ' + deqpUtils.getDataTypeName(reference.type));
                        success = false;
                    }
                    if (reportedSize < reference.minSize || reportedSize > reference.maxSize)
                    {
                        bufferedLogToConsole('// FAILURE: wrong size reported, should be ' +
                            (reference.minSize == reference.maxSize ? reference.minSize : 'in the range [' + reference.minSize + ', ' + reference.maxSize + ']'));

                        success = false;
                    }
                }
            }
        }

        for (var i = 0; i < basicUniformReportsRef.length; i++)
        {
            /** @type {BasicUniformReportRef} */ var expected = basicUniformReportsRef[i];
            if (expected.isUsedInShader && BasicUniformReportGL.findWithName(basicUniformReportsDst, expected.name) == basicUniformReportsDst[basicUniformReportsDst.length - 1])
            {
                bufferedLogToConsole('// FAILURE: uniform with name ' + expected.name + ' was not reported by GL');
                success = false;
            }
        }

        return success;
    };

    /**
     * @param {Array.<BasicUniformReportGL>} basicUniformReportsDst
     * @param {Array.<BasicUniformReportRef>} basicUniformReportsRef
     * @param {deMath.deUint32} programGL
     * @return {boolean}
     */
    UniformCase.prototype.getActiveUniforms = function(basicUniformReportsDst, basicUniformReportsRef, programGL) {
        /** @type {Array.<string>} */ var queryNames = new Array(basicUniformReportsRef.length);
        /** @type {Array.<string>} */ var queryNamesC = new Array(basicUniformReportsRef.length);
        /** @type {Array.<number>} (GLuint) */ var uniformIndices = new Array(basicUniformReportsRef.length);
        /** @type {Array.<deMath.deUint32>} */ var validUniformIndices = []; // This shall have the same contents, and in same order, as uniformIndices, but with gl.INVALID_INDEX entries removed.
        /** @type {boolean} */ var success = true;

        for (var i = 0; i < basicUniformReportsRef.length; i++)
        {
            /** @type {string} */ var name = basicUniformReportsRef[i].name;
            queryNames[i] = this.m_features & Feature.ARRAY_FIRST_ELEM_NAME_NO_INDEX && name[name.length - 1] == ']' ? beforeLast(name, '[') : name;
            queryNamesC[i] = queryNames[i];
        }

        gluDefs.GLU_CHECK_CALL(function() {uniformIndices = gl.getUniformIndices(programGL, queryNamesC);});

        for (var i = 0; i < uniformIndices.length; i++)
        {
            if (uniformIndices[i] != gl.INVALID_INDEX)
                validUniformIndices.push(uniformIndices[i]);
            else
            {
                if (basicUniformReportsRef[i].isUsedInShader)
                {
                    bufferedLogToConsole('// FAILURE: uniform with name ' + basicUniformReportsRef[i].name + ' received gl.INVALID_INDEX');
                    success = false;
                }
            }
        }

        if (validUniformIndices.length > 0)
        {
            /** @type {Array.<string>} */ var uniformNameBuf = new Array(validUniformIndices.length);
            /** @type {Array.<number>} (GLint) */ var uniformSizeBuf = new Array(validUniformIndices.length);
            /** @type {Array.<number>} (GLint) */ var uniformTypeBuf = new Array(validUniformIndices.length);

            gluDefs.GLU_CHECK_CALL(function() {uniformNameBuf = gl.getActiveUniformsiv(programGL, validUniformIndices, gl.UNIFORM_NAME_LENGTH);});
            gluDefs.GLU_CHECK_CALL(function() {uniformSizeBuf = gl.getActiveUniformsiv(programGL, validUniformIndices, gl.UNIFORM_SIZE);});
            gluDefs.GLU_CHECK_CALL(function() {uniformTypeBuf = gl.getActiveUniformsiv(programGL, validUniformIndices, gl.UNIFORM_TYPE);});

            {
                /** @type {number} */ var validNdx = -1; // Keeps the corresponding index to validUniformIndices while unifNdx is the index to uniformIndices.
                for (var unifNdx = 0; unifNdx < uniformIndices.length; unifNdx++)
                {
                    if (uniformIndices[unifNdx] == gl.INVALID_INDEX)
                        continue;

                    validNdx++;

                    /** @type {BasicUniformReportRef} */ var reference = basicUniformReportsRef[unifNdx];
                    /** @type {number} */ var reportedIndex = validUniformIndices[validNdx];
                    /** @type {number} */ var reportedNameLength = uniformNameBuf[validNdx].length;
                    /** @type {number} */ var reportedSize = uniformSizeBuf[validNdx];
                    /** @type {deqpUtils.DataType} */ var reportedType = deqpUtils.getDataTypeFromGLType(uniformTypeBuf[validNdx]);

                    //TODO: TCU_CHECK_MSG(reportedType != deqpUtils.DataType.LAST, "Invalid uniform type");

                    bufferedLogToConsole('// Got name size = ' + reportedSize +
                        ', type = ' + deqpUtils.getDataTypeName(reportedType) +
                        ' for the uniform at index ' + reportedIndex + ' (' + reference.name + ')');

                    DE_ASSERT(reference.type != deqpUtils.DataType.LAST);
                    DE_ASSERT(reference.minSize >= 1 || (reference.minSize == 0 && !reference.isUsedInShader));
                    DE_ASSERT(reference.minSize <= reference.maxSize);
                    basicUniformReportsDst.push(new BasicUniformReportGL(reference.name, reportedNameLength, reportedSize, reportedType, reportedIndex));

                    if (reportedType != reference.type)
                    {
                        bufferedLogToConsole('// FAILURE: wrong type reported, should be ' + deqpUtils.getDataTypeName(reference.type));
                        success = false;
                    }

                    if (reportedSize < reference.minSize || reportedSize > reference.maxSize)
                    {
                        bufferedLogToConsole('// FAILURE: wrong size reported, should be ' +
                            (reference.minSize == reference.maxSize ? reference.minSize : 'in the range [' + reference.minSize + ', ' + reference.maxSize + ']'));

                        success = false;
                    }
                }
            }
        }

        return success;
    };

    /**
     * @param {Array.<BasicUniformReportGL>} uniformResults
     * @param {Array.<BasicUniformReportGL>} uniformsResults
     * @return {boolean}
     */
    UniformCase.prototype.uniformVsUniformsComparison = function(uniformResults, uniformsResults) {
        /** @type {boolean} */ var success = true;

        for (var uniformResultNdx = 0; uniformResultNdx < uniformResults.length; uniformResultNdx++)
        {
            /** @type {BasicUniformReportGL} */ var uniformResult = uniformResults[uniformResultNdx];
            /** @type {sting} */ var uniformName = uniformResult.name;
            /** @type {BasicUniformReportGL} */ var uniformsResult = BasicUniformReportGL.findWithName(uniformsResults, uniformName);

            if (uniformsResult !== undefined)
            {
                bufferedLogToConsole("// Checking uniform " + uniformName);

                if (uniformResult.index != uniformsResult.index)
                {
                    bufferedLogToConsole("// FAILURE: glGetActiveUniform() and glGetUniformIndices() gave different indices for uniform " + uniformName);
                    success = false;
                }
                if (uniformResult.nameLength + 1 != uniformsResult.nameLength)
                {
                    bufferedLogToConsole("// FAILURE: glGetActiveUniform() and glGetActiveUniformsiv() gave incompatible name lengths for uniform " + uniformName);
                    success = false;
                }
                if (uniformResult.size != uniformsResult.size)
                {
                    bufferedLogToConsole("// FAILURE: glGetActiveUniform() and glGetActiveUniformsiv() gave different sizes for uniform " + uniformName);
                    success = false;
                }
                if (uniformResult.type != uniformsResult.type)
                {
                    bufferedLogToConsole("// FAILURE: glGetActiveUniform() and glGetActiveUniformsiv() gave different types for uniform " + uniformName);
                    success = false;
                }
            }
            else
            {
                bufferedLogToConsole("// FAILURE: uniform " + uniformName + " was reported active by glGetActiveUniform() but not by glGetUniformIndices()");
                success = false;
            }
        }

        for (var uniformsResultNdx = 0; uniformsResultNdx < uniformsResults.length; uniformsResultNdx++)
        {
            /** @type {BasicUniformReportGL} */ var uniformsResult = uniformsResults[uniformsResultNdx];
            /** @type {sting} */ var uniformsName = uniformsResult.name;
            /** @type {BasicUniformReportGL} */ var uniformsResultIt = BasicUniformReportGL.findWithName(uniformsResults, uniformsName);

            if (uniformsResultIt !== undefined)
            {
                bufferedLogToConsole("// FAILURE: uniform " + uniformsName + " was reported active by glGetUniformIndices() but not by glGetActiveUniform()");
                success = false;
            }
        }

        return success;
    };

    /**
     * @param {Array.<VarValue>} valuesDst
     * @param {Array.<BasicUniform>} basicUniforms
     * @param {deMath.deUint32} programGL
     * @return {boolean}
     */
    UniformCase.prototype.getUniforms = function(valuesDst, basicUniforms, programGL) {
        /** @type {boolean} */ var success = true;

        for (var unifNdx = 0; unifNdx < basicUniforms.length; unifNdx++)
        {
            /** @type {BasicUniform} */ var uniform = basicUniforms[unifNdx];
            /** @type {string} */ var queryName    = this.m_features & Feature.ARRAY_FIRST_ELEM_NAME_NO_INDEX && uniform.elemNdx == 0 ? beforeLast(uniform.name, '[') : uniform.name;
            /** @type {number} */ var location    = gl.getUniformLocation(programGL, queryName);
            /** @type {number} */ var size        = deqpUtils.getDataTypeScalarSize(uniform.type);
            /** @type {VarValue} */ var value = new VarValue();

            //TODO: deMemset(&value, 0xcd, sizeof(value)); // Initialize to known garbage.

            if (location == -1)
            {
                value.type = deqpUtils.DataType.INVALID;
                valuesDst.push(value);
                if (uniform.isUsedInShader)
                {
                    bufferedLogToConsole("// FAILURE: " + uniform.name + " was used in shader, but has location -1");
                    success = false;
                }
                continue;
            }

            value.type = uniform.type;
            gluDefs.GLU_CHECK_CALL(function(){value.val = gl.getUniform(programGL, location);});

            valuesDst.push(value);

            bufferedLogToConsole("// Got " + uniform.name + " value " + apiVarValueStr(value));
        }

        return success;
    };

    /**
     * @param {Array.<VarValue>} values
     * @param {Array.<BasicUniform>} basicUniforms
     * @return {boolean}
     */
    UniformCase.prototype.checkUniformDefaultValues = function(values, basicUniforms) {
        /** @type {boolean} */ var success = true;

        DE_ASSERT(values.length == basicUniforms.length);

        for (var unifNdx = 0; unifNdx < basicUniforms.length; unifNdx++)
        {
            /** @type {BasicUniform} */ var uniform        = basicUniforms[unifNdx];
            /** @type {VarValue} */ var unifValue    = values[unifNdx];
            /** @type {number} */ var valSize        = deqpUtils.getDataTypeScalarSize(uniform.type);

            bufferedLogToConsole("// Checking uniform " + uniform.name);

            if (unifValue.type == deqpUtils.DataType.INVALID) // This happens when glGetUniformLocation() returned -1.
                continue;

            var CHECK_UNIFORM = function(ZERO) {
                do
                {
                    for (var i = 0; i < valSize; i++)
                    {
                        if (unifValue.val[i] != ZERO)
                        {
                            bufferedLogToConsole("// FAILURE: uniform " + uniform.name + " has non-zero initial value");
                            success = false;
                        }
                    }
                } while (false)
            };

            if (deqpUtils.isDataTypeFloatOrVec(uniform.type) || deqpUtils.isDataTypeMatrix(uniform.type))
                CHECK_UNIFORM(0.0);
            else if (deqpUtils.isDataTypeIntOrIVec(uniform.type))
                CHECK_UNIFORM(0);
            else if (deqpUtils.isDataTypeUintOrUVec(uniform.type))
                CHECK_UNIFORM(0);
            else if (deqpUtils.isDataTypeBoolOrBVec(uniform.type))
                CHECK_UNIFORM(false);
            else if (deqpUtils.isDataTypeSampler(uniform.type))
                if (unifValue.val.samplerV.unit != 0)
                {
                    bufferedLogToConsole("// FAILURE: uniform " + uniform.name + " has non-zero initial value");
                    success = false;
                }
            else
                DE_ASSERT(false);
        }

        return success;
    };

    /**
     * @param {Array.<BasicUniform>} basicUniforms
     * @param {deMath.deUint32} programGL
     * @param {deRandom.Random} rnd
     */
    UniformCase.prototype.assignUniforms = function(basicUniforms, programGL, rnd) {
        /** @type {boolean} */ var transpose = (this.m_features & Feature.MATRIXMODE_ROWMAJOR) != 0;
        /** @type {boolean} (GLboolean) */ var transposeGL = transpose ? gl.TRUE : gl.FALSE;
        /** @type {deqpUtils.DataType} */ var boolApiType = this.m_features & Feature.BOOLEANAPITYPE_INT ? deqpUtils.DataType.INT
                                                : this.m_features & Feature.BOOLEANAPITYPE_UINT ? deqpUtils.DataType.UINT
                                                : deqpUtils.DataType.FLOAT;

        for (var unifNdx = 0; unifNdx < basicUniforms.length; unifNdx++)
        {
            /** @type {BasicUniform} */ var uniform = basicUniforms[unifNdx];
            /** @type {boolean} */ var isArrayMember = uniform.elemNdx >= 0;
            /** @type {string} */ var queryName = this.m_features & Feature.ARRAY_FIRST_ELEM_NAME_NO_INDEX && uniform.elemNdx == 0 ? beforeLast(uniform.name, '[') : uniform.name;
            /** @type {number} */ var numValuesToAssign = !isArrayMember ? 1
                                                        : this.m_features & Feature.ARRAYASSIGN_FULL ? (uniform.elemNdx == 0 ? uniform.rootSize : 0)
                                                        : this.m_features & Feature.ARRAYASSIGN_BLOCKS_OF_TWO ? (uniform.elemNdx % 2 == 0 ? 2 : 0)
                                                        : /* Default: assign array elements separately */ 1;

            DE_ASSERT(numValuesToAssign >= 0);
            DE_ASSERT(numValuesToAssign == 1 || isArrayMember);

            if (numValuesToAssign == 0)
            {
                bufferedLogToConsole("// Uniform " + uniform.name + " is covered by another glUniform*v() call to the same array");
                continue;
            }

            /** @type {number} */ var location = gl.getUniformLocation(programGL, queryName);
            /** @type {number} */ var typeSize = deqpUtils.getDataTypeScalarSize(uniform.type);
            /** @type {boolean} */ var assignByValue = this.m_features & Feature.UNIFORMFUNC_VALUE && !deqpUtils.isDataTypeMatrix(uniform.type) && numValuesToAssign == 1;
            /** @type {Array.<VarValue>} */ var valuesToAssign = [];

            for (var i = 0; i < numValuesToAssign; i++)
            {
                /** @type {string} */ var curName = isArrayMember ? beforeLast(uniform.rootName, '[') + "[" + uniform.elemNdx+i + "]" : uniform.name;
                /** @type {VarValue} */ var unifValue = new VarValue;

                if (isArrayMember)
                {
                    /** @type {BasicUniform} */ var elemUnif = BasicUniform.findWithName(basicUniforms, curName);
                    if (elemUnif == basicUniforms[basicUniforms.length - 1])
                        continue;
                    unifValue = elemUnif.finalValue;
                }
                else
                    unifValue = uniform.finalValue;

                /** @type {VarValue} */ var apiValue = deqpUtils.isDataTypeBoolOrBVec(unifValue.type) ? getRandomBoolRepresentation(unifValue, boolApiType, rnd)
                                        : deqpUtils.isDataTypeSampler(unifValue.type) ? getSamplerUnitValue(unifValue)
                                        : unifValue;

                valuesToAssign.push(deqpUtils.isDataTypeMatrix(apiValue.type) && transpose ? getTransposeMatrix(apiValue) : apiValue);

                if (deqpUtils.isDataTypeBoolOrBVec(uniform.type))
                    bufferedLogToConsole("// Using type " + deqpUtils.getDataTypeName(boolApiType) + " to set boolean value " + apiVarValueStr(unifValue) + " for " + curName);
                else if (deqpUtils.isDataTypeSampler(uniform.type))
                    bufferedLogToConsole("// Texture for the sampler uniform " + curName + " will be filled with color " + apiVarValueStr(getSamplerFillValue(uniform.finalValue)));
            }

            DE_ASSERT(valuesToAssign.length > 0);

            if (deqpUtils.isDataTypeFloatOrVec(valuesToAssign[0].type))
            {
                if (assignByValue)
                {
                    switch (typeSize)
                    {
                        case 1: gluDefs.GLU_CHECK_CALL(function(){gl.uniform1f(location, valuesToAssign[0].val[0]);}); break;
                        case 2: gluDefs.GLU_CHECK_CALL(function(){gl.uniform2f(location, valuesToAssign[0].val[0], valuesToAssign[0].val[1]);}); break;
                        case 3: gluDefs.GLU_CHECK_CALL(function(){gl.uniform3f(location, valuesToAssign[0].val[0], valuesToAssign[0].val[1],valuesToAssign[0].val[2]);}); break;
                        case 4: gluDefs.GLU_CHECK_CALL(function(){gl.uniform4f(location, valuesToAssign[0].val[0], valuesToAssign[0].val[1],valuesToAssign[0].val[2],valuesToAssign[0].val[3]);}); break;
                        default:
                            DE_ASSERT(false);
                    }
                }
                else
                {
                    /** @type {Array.<number>} */ var buffer = new Array(valuesToAssign.length * typeSize);
                    for (var i = 0; i < buffer.length; i++)
                        buffer[i] = valuesToAssign[Math.floor(i / typeSize)].val[i % typeSize];

                    switch (typeSize)
                    {
                        case 1: gluDefs.GLU_CHECK_CALL(function(){gl.uniform1fv(location, buffer);}); break;
                        case 2: gluDefs.GLU_CHECK_CALL(function(){gl.uniform2fv(location, buffer);}); break;
                        case 3: gluDefs.GLU_CHECK_CALL(function(){gl.uniform3fv(location, buffer);}); break;
                        case 4: gluDefs.GLU_CHECK_CALL(function(){gl.uniform4fv(location, buffer);}); break;
                        default:
                            DE_ASSERT(false);
                    }
                }
            }
            else if (deqpUtils.isDataTypeMatrix(valuesToAssign[0].type))
            {
                DE_ASSERT(!assignByValue);

                /** @type {Array.<number>} */ var buffer = new Array(valuesToAssign.length * typeSize);
                for (var i = 0; i < buffer.length; i++)
                    buffer[i] = valuesToAssign[Math.floor(i / typeSize)].val[i % typeSize];

                switch (uniform.type)
                {
                    case deqpUtils.DataType.FLOAT_MAT2: gluDefs.GLU_CHECK_CALL(function(){gl.uniformMatrix2fv(location, transposeGL, buffer);}); break;
                    case deqpUtils.DataType.FLOAT_MAT3: gluDefs.GLU_CHECK_CALL(function(){gl.uniformMatrix3fv(location, transposeGL, buffer);}); break;
                    case deqpUtils.DataType.FLOAT_MAT4: gluDefs.GLU_CHECK_CALL(function(){gl.uniformMatrix4fv(location, transposeGL, buffer);}); break;
                    case deqpUtils.DataType.FLOAT_MAT2X3: gluDefs.GLU_CHECK_CALL(function(){gl.uniformMatrix2x3fv(location, transposeGL, buffer);}); break;
                    case deqpUtils.DataType.FLOAT_MAT2X4: gluDefs.GLU_CHECK_CALL(function(){gl.uniformMatrix2x4fv(location, transposeGL, buffer);}); break;
                    case deqpUtils.DataType.FLOAT_MAT3X2: gluDefs.GLU_CHECK_CALL(function(){gl.uniformMatrix3x2fv(location, transposeGL, buffer);}); break;
                    case deqpUtils.DataType.FLOAT_MAT3X4: gluDefs.GLU_CHECK_CALL(function(){gl.uniformMatrix3x4fv(location, transposeGL, buffer);}); break;
                    case deqpUtils.DataType.FLOAT_MAT4X2: gluDefs.GLU_CHECK_CALL(function(){gl.uniformMatrix4x2fv(location, transposeGL, buffer);}); break;
                    case deqpUtils.DataType.FLOAT_MAT4X3: gluDefs.GLU_CHECK_CALL(function(){gl.uniformMatrix4x3fv(location, transposeGL, buffer);}); break;
                    default:
                        DE_ASSERT(false);
                }
            }
            else if (deqpUtils.isDataTypeIntOrIVec(valuesToAssign[0].type))
            {
                if (assignByValue)
                {
                    switch (typeSize)
                    {
                        case 1: gluDefs.GLU_CHECK_CALL(function(){gl.uniform1i(location, valuesToAssign[0].val[0]);});                            break;
                        case 2: gluDefs.GLU_CHECK_CALL(function(){gl.uniform2i(location, valuesToAssign[0].val[0], valuesToAssign[0].val[1]);});                    break;
                        case 3: gluDefs.GLU_CHECK_CALL(function(){gl.uniform3i(location, valuesToAssign[0].val[0], valuesToAssign[0].val[1], valuesToAssign[0].val[2]);});            break;
                        case 4: gluDefs.GLU_CHECK_CALL(function(){gl.uniform4i(location, valuesToAssign[0].val[0], valuesToAssign[0].val[1], valuesToAssign[0].val[2], valuesToAssign[0].val[3]);});    break;
                        default:
                            DE_ASSERT(false);
                    }
                }
                else
                {
                    /** @type {Array.<number>} */ var buffer = new Array(valuesToAssign.length * typeSize);
                    for (var i = 0; i < buffer.length; i++)
                        buffer[i] = valuesToAssign[Math.floor(i / typeSize)].val[i % typeSize];

                    switch (typeSize)
                    {
                        case 1: gluDefs.GLU_CHECK_CALL(function(){gl.uniform1iv(location, buffer);}); break;
                        case 2: gluDefs.GLU_CHECK_CALL(function(){gl.uniform2iv(location, buffer);}); break;
                        case 3: gluDefs.GLU_CHECK_CALL(function(){gl.uniform3iv(location, buffer);}); break;
                        case 4: gluDefs.GLU_CHECK_CALL(function(){gl.uniform4iv(location, buffer);}); break;
                        default:
                            DE_ASSERT(false);
                    }
                }
            }
            else if (deqpUtils.isDataTypeUintOrUVec(valuesToAssign[0].type))
            {
                if (assignByValue)
                {
                    switch (typeSize)
                    {
                        case 1: gluDefs.GLU_CHECK_CALL(function(){gl.uniform1ui(location, valuesToAssign[0].val[0]);});                            break;
                        case 2: gluDefs.GLU_CHECK_CALL(function(){gl.uniform2ui(location, valuesToAssign[0].val[0], valuesToAssign[0].val[1]);});                    break;
                        case 3: gluDefs.GLU_CHECK_CALL(function(){gl.uniform3ui(location, valuesToAssign[0].val[0], valuesToAssign[0].val[1], valuesToAssign[0].val[2]);});            break;
                        case 4: gluDefs.GLU_CHECK_CALL(function(){gl.uniform4ui(location, valuesToAssign[0].val[0], valuesToAssign[0].val[1], valuesToAssign[0].val[2], valuesToAssign[0].val[3]);});    break;
                        default:
                            DE_ASSERT(false);
                    }
                }
                else
                {
                    /** @type {Array.<number>} */ var buffer = new Array(valuesToAssign.length * typeSize);
                    for (var i = 0; i < buffer.length; i++)
                        buffer[i] = valuesToAssign[Math.floor(i / typeSize)].val[i % typeSize];

                    switch (typeSize)
                    {
                        case 1: gluDefs.GLU_CHECK_CALL(function(){gl.uniform1uiv(location, buffer);}); break;
                        case 2: gluDefs.GLU_CHECK_CALL(function(){gl.uniform2uiv(location, buffer);}); break;
                        case 3: gluDefs.GLU_CHECK_CALL(function(){gl.uniform3uiv(location, buffer);}); break;
                        case 4: gluDefs.GLU_CHECK_CALL(function(){gl.uniform4uiv(location, buffer);}); break;
                        default:
                            DE_ASSERT(false);
                    }
                }
            }
            else if (deqpUtils.isDataTypeSampler(valuesToAssign[0].type))
            {
                if (assignByValue)
                    gluDefs.GLU_CHECK_CALL(function(){gl.uniform1i(location, uniform.finalValue.val);});
                else
                {
                    /** @type {number} (GLint) */ var unit = uniform.finalValue.val;
                    gluDefs.GLU_CHECK_CALL(function(){gl.uniform1iv(location, unit);});
                }
            }
            else
                DE_ASSERT(false);
        }
    };

    /**
     * @param {Array.<VarValue>} values
     * @param {Array.<BasicUniform>} basicUniforms
     * @return {boolean}
     */
    UniformCase.prototype.compareUniformValues = function(values, basicUniforms) {
        /** @type {boolean} */ var success = true;

        for (var unifNdx = 0; unifNdx < basicUniforms.length; unifNdx++)
        {
            /** @type {BasicUniform} */ var uniform = basicUniforms[unifNdx];
            /** @type {VarValue} */ var unifValue = values[unifNdx];

            bufferedLogToConsole("// Checking uniform " + uniform.name);

            if (unifValue.type == deqpUtils.DataType.INVALID) // This happens when glGetUniformLocation() returned -1.
                continue;

            if (!apiVarValueEquals(unifValue, uniform.finalValue))
            {
                bufferedLogToConsole("// FAILURE: value obtained with glGetUniform*() for uniform " + uniform.name + " differs from value set with glUniform*()");
                success = false;
            }
        }

        return success;
    };

    /** @const @type {number} */ var VIEWPORT_WIDTH = 128;
    /** @const @type {number} */ var VIEWPORT_HEIGHT = 128;

    /**
     * @param {Array.<BasicUniform>} basicUniforms
     * @param {gluSP.ShaderProgram} program
     * @param {deRandom.Random} rnd
     * @return {boolean}
     */
    UniformCase.prototype.renderTest = function(basicUniforms, program, rnd) {
        //const tcu::RenderTarget&    renderTarget    = m_context.getRenderTarget();
        /** @const */ var viewportW = Math.min(gl.canvas.width, VIEWPORT_WIDTH);
        /** @const */ var viewportH = Math.min(gl.canvas.height, VIEWPORT_HEIGHT);
        /** @const */ var viewportX = rnd.getInt(0, gl.canvas.width);
        /** @const */ var viewportY = rnd.getInt(0, gl.canvas.height);
        /** @type {tcuSurface.Surface} */ var renderedImg = new tcuSurface.Surface(viewportW, viewportH);

        // Assert that no two samplers of different types have the same texture unit - this is an error in GL.
        for (var i = 0; i < basicUniforms.length; i++)
        {
            if (deqpUtils.isDataTypeSampler(basicUniforms[i].type))
            {
                for (var j = 0; j < i; j++)
                {
                    if (deqpUtils.isDataTypeSampler(basicUniforms[j].type) && basicUniforms[i].type != basicUniforms[j].type)
                        DE_ASSERT(basicUniforms[i].finalValue.val != basicUniforms[j].finalValue.val);
                }
            }
        }

        for (var i = 0; i < basicUniforms.length; i++)
        {
            if (deqpUtils.isDataTypeSampler(basicUniforms[i].type) && this.m_filledTextureUnits.indexOf(basicUniforms[i].finalValue.val) == -1)
            {
                bufferedLogToConsole("// Filling texture at unit " + apiVarValueStr(basicUniforms[i].finalValue) + " with color " + shaderVarValueStr(basicUniforms[i].finalValue));
                this.setupTexture(basicUniforms[i].finalValue);
            }
        }

        gluDefs.GLU_CHECK_CALL(function(){gl.viewport(viewportX, viewportY, viewportW, viewportH);});

        {
            /** @type {Array.<number>} */ var position =
            [
                -1.0, -1.0, 0.0, 1.0,
                -1.0, 1.0, 0.0, 1.0,
                1.0, -1.0, 0.0, 1.0,
                1.0, 1.0, 0.0, 1.0
            ];
            /** @type {deMath.deUint16} TODO: deUint16 not yet declared. Necessary? */ var indices = [ 0, 1, 2, 2, 1, 3 ];

            /** @type {number} */ var posLoc = gl.getAttribLocation(program.getProgram(), "a_position");
            gl.enableVertexAttribArray(posLoc);
            gl.vertexAttribPointer(posLoc, 4, gl.FLOAT, gl.FALSE, 0, position);
            gluDefs.GLU_CHECK_CALL(function(){gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, indices);});
        }

        gl.readPixels(viewportX, viewportY, viewportW, viewportH, gl.RGBA, gl.UNSIGNED_BYTE, renderedImg.getAccess().getDataPtr());

        /** @type {number} */ var numFailedPixels = 0;
        var whitePixel = new gluDrawUtil.Pixel([255.0, 255.0, 255.0, 255.0]);
        for (var y = 0; y < renderedImg.getHeight(); y++)
        {
            for (var x = 0; x < renderedImg.getWidth(); x++)
            {
                if (renderedImg.getPixel(x, y) != whitePixel)
                    numFailedPixels += 1;
            }
        }

        if (numFailedPixels > 0)
        {
            //TODO: log << TestLog::Image("RenderedImage", "Rendered image", renderedImg);
            bufferedLogToConsole("FAILURE: image comparison failed, got " + numFailedPixels + " non-white pixels");
            return false;
        }
        else
        {
            bufferedLogToConsole("Success: got all-white pixels (all uniforms have correct values)");
            return true;
        }
    };

    /**
     * @return {deqpTests.stateMachine.IterateResult}
     */
    UniformCase.prototype.iterate = function() {
        /** @type {deRandom.Random} */ var rnd = new deRandom.Random(deString.deStringHash(this.name) ^ deRandom.getBaseSeed());
        /** @type {Array.<BasicUniform>} */ var basicUniforms = [];
        /** @type {Array.<BasicUniformReportRef>} */ var basicUniformReportsRef = [];

        {
            /** @type {number} */ var samplerUnitCounter = 0;
            for (var i = 0; i < this.m_uniformCollection.getNumUniforms(); i++)
                this.generateBasicUniforms(basicUniforms, basicUniformReportsRef, this.m_uniformCollection.getUniform(i).type, this.m_uniformCollection.getUniform(i).name, true, samplerUnitCounter, rnd);
        }

        /** @type {string} */ var vertexSource = this.generateVertexSource(basicUniforms);
        /** @type {string} */ var fragmentSource = this.generateFragmentSource(basicUniforms);
        /** @type {gluSP.ShaderProgram} */ var program = new gluSP.ShaderProgram(gl, gluSP.makeVtxFragSources(vertexSource, fragmentSource));

        bufferedLogToConsole(program);

        if (!program.isOk())
        {
            testFailedOptions("Compile failed", false);
            return deqpTests.stateMachine.IterateResult.STOP;
        }

        gluDefs.GLU_CHECK_CALL(function(){gl.useProgram(program.getProgram());});

        /** @type {boolean} */ var success = this.test(basicUniforms, basicUniformReportsRef, program, rnd);
        assertMsgOptions(success, '', true, false);

        return deqpTests.stateMachine.IterateResult.STOP;
    };

    /**
     * @enum CaseType
     */
    var CaseType = {
        CASETYPE_UNIFORM: 0,            //!< Check info returned by glGetActiveUniform().
        CASETYPE_INDICES_UNIFORMSIV: 1,    //!< Check info returned by glGetUniformIndices() + glGetActiveUniformsiv().
        CASETYPE_CONSISTENCY: 2            //!< Query info with both above methods, and check consistency.
    };

    CaseType.CASETYPE_LAST = Object.keys(CaseType).length;

    /**
     * UniformInfoQueryCase class
     * UniformCase
     */
    var UniformInfoQueryCase = function(name, description, shaderType, uniformCollection, caseType, additionalFeatures) {
        UniformCase.call(this, name, description);
        this.newB(shaderType, uniformCollection, caseType, additionalFeatures);
        /** @type {CaseType} */ this.m_caseType = caseType;
    };

    UniformInfoQueryCase.prototype = Object.create(UniformCase.prototype);
    UniformInfoQueryCase.prototype.constructor = UniformInfoQueryCase;

    /**
     * @param {CaseType} caseType
     * @return {string}
     */
    UniformInfoQueryCase.getCaseTypeName = function(caseType) {
        switch (caseType)
        {
            case CaseType.CASETYPE_UNIFORM:                return "active_uniform";
            case CaseType.CASETYPE_INDICES_UNIFORMSIV:    return "indices_active_uniformsiv";
            case CaseType.CASETYPE_CONSISTENCY:            return "consistency";
            default:
                DE_ASSERT(false);
                return DE_NULL;
        }
    };

    /**
     * @param {CaseType} caseType
     * @return {string}
     */
    UniformInfoQueryCase.getCaseTypeDescription = function(caseType) {
       switch (caseType)
       {
           case CaseType.CASETYPE_UNIFORM:                return "Test glGetActiveUniform()";
           case CaseType.CASETYPE_INDICES_UNIFORMSIV:    return "Test glGetUniformIndices() along with glGetActiveUniformsiv()";
           case CaseType.CASETYPE_CONSISTENCY:            return "Check consistency between results from glGetActiveUniform() and glGetUniformIndices() + glGetActiveUniformsiv()";
           default:
               DE_ASSERT(false);
               return DE_NULL;
       }
    };

    // \note Although this is only used in UniformApiTest::init, it needs to be defined here as it's used as a template argument.
    /**
     * @param {string} name
     * @param {UniformCollection} uniformCollection_
     */
    var UniformCollectionCase = function (name, uniformCollection_) {
        /** @type {string} */ this.namePrefix = name ? name + '_' : '';
        /** @type {UniformCollection} (SharedPtr) */ this.uniformCollection = uniformCollection_;
    };

    /**
     * @param {Array.<BasicUniform>} basicUniforms
     * @param {Array.<BasicUniformReportRef>} basicUniformReportsRef
     * @param {ShaderProgram} program
     * @param {deRandom.Random} rnd
     * @return {boolean}
     */
    UniformInfoQueryCase.prototype.test = function(basicUniforms, basicUniformReportsRef, program, rnd) {
        //TODO: DE_UNREF(basicUniforms);
        //TODO: DE_UNREF(rnd);

        /** @type {deMath.deUint32} */ var programGL = program.getProgram();
        /** @type {Array.<BasicUniformReportGL>} */ var basicUniformReportsUniform = [];
        /** @type {Array.<BasicUniformReportGL>} */ var basicUniformReportsUniformsiv = [];

        if (this.m_caseType == CaseType.CASETYPE_UNIFORM || this.m_caseType == CaseType.CASETYPE_CONSISTENCY)
        {
            /** @type {boolena} */ var success = false;

            {
                //TODO:: const ScopedLogSection section(log, "InfoGetActiveUniform", "Uniform information queries with glGetActiveUniform()");
                success = this.getActiveUniforms(basicUniformReportsUniform, basicUniformReportsRef, programGL);
            }

            if (!success)
            {
                if (this.m_caseType == CaseType.CASETYPE_UNIFORM)
                    return false;
                else
                {
                    DE_ASSERT(this.m_caseType == CaseType.CASETYPE_CONSISTENCY);
                    bufferedLogToConsole("// Note: this is a consistency case, so ignoring above failure(s)");
                }
            }
        };

        if (this.m_caseType == CaseType.CASETYPE_INDICES_UNIFORMSIV || this.m_caseType == CaseType.CASETYPE_CONSISTENCY)
        {
            /** @type {boolena} */ var success = false;

            {
                //TODO: const ScopedLogSection section(log, "InfoGetActiveUniformsiv", "Uniform information queries with glGetUniformIndices() and glGetActiveUniformsiv()");
                success = this.getActiveUniformsiv(basicUniformReportsUniformsiv, basicUniformReportsRef, programGL);
            }

            if (!success)
            {
                if (this.m_caseType == CaseType.CASETYPE_INDICES_UNIFORMSIV)
                    return false;
                else
                {
                    DE_ASSERT(this.m_caseType == CaseType.CASETYPE_CONSISTENCY);
                    bufferedLogToConsole("// Note: this is a consistency case, so ignoring above failure(s)");
                }
            }
        };

        if (this.m_caseType == CaseType.CASETYPE_CONSISTENCY)
        {
            /** @type {boolena} */ var success = false;

            {
                //TODO: const ScopedLogSection section(log, "CompareUniformVsUniformsiv", "Comparison of results from glGetActiveUniform() and glGetActiveUniformsiv()");
                success = this.uniformVsUniformsivComparison(basicUniformReportsUniform, basicUniformReportsUniformsiv);
            }

            if (!success)
                return false;
        }

        return true;
    };



    /**
     * Initializes the tests to be performed.
     */
    var init = function() {
        var state = deqpTests.runner.getState();
        var testGroup = state.testCases;

        // Generate sets of UniformCollections that are used by several cases.
        /**
         * @enum
         */
        var UniformCollections = {
            BASIC: 0,
            BASIC_ARRAY: 1,
            BASIC_STRUCT: 2,
            STRUCT_IN_ARRAY: 3,
            ARRAY_IN_STRUCT: 4,
            NESTED_STRUCTS_ARRAYS: 5,
            MULTIPLE_BASIC: 6,
            MULTIPLE_BASIC_ARRAY: 7,
            MULTIPLE_NESTED_STRUCTS_ARRAYS: 8
        };

        UniformCollections.LAST = Object.keys(UniformCollections).length;

        var UniformCollectionGroup = function() {
            /** @type {string} */ this.name = '';
            /** @type {Array.<UniformCollectionCase>} */ this.cases = [];
        };

        /** @type {Array.<UniformCollectionGroup>} */ var defaultUniformCollections = new Array(UniformCollections.LAST);
        
        //Initialize
        for(var i = 0; i < defaultUniformCollections.length; i++) defaultUniformCollections[i] = new UniformCollectionGroup();

        defaultUniformCollections[UniformCollections.BASIC].name                            = "basic";
        defaultUniformCollections[UniformCollections.BASIC_ARRAY].name                        = "basic_array";
        defaultUniformCollections[UniformCollections.BASIC_STRUCT].name                        = "basic_struct";
        defaultUniformCollections[UniformCollections.STRUCT_IN_ARRAY].name                    = "struct_in_array";
        defaultUniformCollections[UniformCollections.ARRAY_IN_STRUCT].name                    = "array_in_struct";
        defaultUniformCollections[UniformCollections.NESTED_STRUCTS_ARRAYS].name            = "nested_structs_arrays";
        defaultUniformCollections[UniformCollections.MULTIPLE_BASIC].name                    = "multiple_basic";
        defaultUniformCollections[UniformCollections.MULTIPLE_BASIC_ARRAY].name                = "multiple_basic_array";
        defaultUniformCollections[UniformCollections.MULTIPLE_NESTED_STRUCTS_ARRAYS].name    = "multiple_nested_structs_arrays";

        for (var dataTypeNdx = 0; dataTypeNdx < s_testDataTypes.length; dataTypeNdx++)
        {
            /** @type {deqpUtils.DataType} */ var dataType = s_testDataTypes[dataTypeNdx];
            /** @type {string} */ var typeName    = deqpUtils.getDataTypeName(dataType);

            defaultUniformCollections[UniformCollections.BASIC].cases.push(new UniformCollectionCase(typeName, UniformCollection.basic(dataType)));

            if (deqpUtils.isDataTypeScalar(dataType) ||
                (deqpUtils.isDataTypeVector(dataType) && deqpUtils.getDataTypeScalarSize(dataType) == 4)    ||
                dataType == deqpUtils.DataType.FLOAT_MAT4                                                ||
                dataType == deqpUtils.DataType.SAMPLER_2D)
                defaultUniformCollections[UniformCollections.BASIC_ARRAY].cases.push(new UniformCollectionCase(typeName, UniformCollection.basicArray(dataType)));

            if (deqpUtils.isDataTypeScalar(dataType)        ||
                dataType == deqpUtils.DataType.FLOAT_MAT4    ||
                dataType == deqpUtils.DataType.SAMPLER_2D)
            {
                /** @type {deqpUtils.DataType} */ var  secondDataType = deqpUtils.isDataTypeScalar(dataType) ? deqpUtils.getDataTypeVector(dataType, 4) :
                                                    dataType == deqpUtils.DataType.FLOAT_MAT4 ? deqpUtils.DataType.FLOAT_MAT2 :
                                                    dataType == deqpUtils.DataType.SAMPLER_2D ? deqpUtils.DataType.SAMPLER_CUBE :
                                                    deqpUtils.DataType.LAST;
                DE_ASSERT(secondDataType != deqpUtils.DataType.LAST);
                /** @type {string} */ var secondTypeName = deqpUtils.getDataTypeName(secondDataType);
                /** @type {string} */ var name = typeName + "_" + secondTypeName;

                defaultUniformCollections[UniformCollections.BASIC_STRUCT].cases.push(new UniformCollectionCase(name, UniformCollection.basicStruct(dataType, secondDataType, false)));
                defaultUniformCollections[UniformCollections.ARRAY_IN_STRUCT].cases.push(new UniformCollectionCase(name, UniformCollection.basicStruct(dataType, secondDataType, true)));
                defaultUniformCollections[UniformCollections.STRUCT_IN_ARRAY].cases.push(new UniformCollectionCase(name, UniformCollection.structInArray(dataType, secondDataType, false)));
                defaultUniformCollections[UniformCollections.NESTED_STRUCTS_ARRAYS].cases.push(new UniformCollectionCase(name, UniformCollection.nestedArraysStructs(dataType, secondDataType)));
            }
        }
        defaultUniformCollections[UniformCollections.MULTIPLE_BASIC].cases.push(new UniformCollectionCase(DE_NULL, UniformCollection.multipleBasic()));
        defaultUniformCollections[UniformCollections.MULTIPLE_BASIC_ARRAY].cases.push(new UniformCollectionCase(DE_NULL, UniformCollection.multipleBasicArray()));
        defaultUniformCollections[UniformCollections.MULTIPLE_NESTED_STRUCTS_ARRAYS].cases.push(new UniformCollectionCase(DE_NULL, UniformCollection.multipleNestedArraysStructs()));

        // Info-query cases (check info returned by e.g. glGetActiveUniforms()).

        {
            // info_query
            /** @type {deqpTests.DeqpTest} */
            var infoQueryGroup = deqpTests.newTest('info_query', 'Test uniform info querying functions');
            testGroup.addChild(infoQueryGroup);
            for (var caseTypeI = 0; caseTypeI < CaseType.CASETYPE_LAST; caseTypeI++)
            {
                /** @type {CaseType} */ var caseType = caseTypeI;
                /** @type {deqpTests.DeqpTest} */
                var caseTypeGroup = deqpTests.newTest(UniformInfoQueryCase.getCaseTypeName(caseType), UniformInfoQueryCase.getCaseTypeDescription(caseType));
                infoQueryGroup.addChild(caseTypeGroup);

                for (var collectionGroupNdx = 0; collectionGroupNdx < UniformCollections.LAST; collectionGroupNdx++)
                {
                    var numArrayFirstElemNameCases = caseType == CaseType.INDICES_UNIFORMSIV && collectionGroupNdx == UniformCollections.BASIC_ARRAY ? 2 : 1;

                    for (var referToFirstArrayElemWithoutIndexI = 0; referToFirstArrayElemWithoutIndexI < numArrayFirstElemNameCases; referToFirstArrayElemWithoutIndexI++)
                    {
                        /** @type {UniformCollectionGroup} */ var collectionGroup = defaultUniformCollections[collectionGroupNdx];
                        /** @type {string} */ var collectionGroupName = collectionGroup.name + (referToFirstArrayElemWithoutIndexI == 0 ? '' : '_first_elem_without_brackets');
                        /** @type {deqpTests.DeqpTest} */
                        var collectionTestGroup = deqpTests.newTest(collectionGroupName, '');
                        caseTypeGroup.addChild(collectionTestGroup);

                        for (var collectionNdx = 0; collectionNdx < collectionGroup.cases.length; collectionNdx++)
                        {
                            /** @type {UniformCollectionCase} */ var collectionCase = collectionGroup.cases[collectionNdx];

                            for (var shaderType = 0; shaderType < CaseShaderType.CASESHADERTYPE_LAST; shaderType++)
                            {
                                /** @type {string} */ var name = collectionCase.namePrefix + getCaseShaderTypeName(shaderType);
                                /** @type {UniformCollection} (SharedPtr) */ var uniformCollection = collectionCase.uniformCollection;

                                collectionTestGroup.addChild(new UniformInfoQueryCase(name, '', shaderType, uniformCollection, caseType,
                                                                                       referToFirstArrayElemWithoutIndexI == 0 ? 0 : Feature.ARRAY_FIRST_ELEM_NAME_NO_INDEX));
                            }
                        }
                    }
                }

                // Info-querying cases when unused uniforms are present.

                {
                    /** @type {deqpTests.DeqpTest} */
                    var unusedUniformsGroup = deqpTests.newTest('unused_uniforms', 'Test with unused uniforms');
                    caseTypeGroup.addChild(unusedUniformsGroup);

                    /** @type {UniformCollectionGroup} */ var collectionGroup = defaultUniformCollections[UniformCollections.ARRAY_IN_STRUCT];

                    for (var collectionNdx = 0; collectionNdx < collectionGroup.cases.length; collectionNdx++)
                    {
                        /** @type {UniformCollectionCase} */ var collectionCase = collectionGroup.cases[collectionNdx];
                        /** @type {string} */ var collName = collectionCase.namePrefix;
                        /** @type {UniformCollection} (SharedPtr) */ var uniformCollection = collectionCase.uniformCollection;

                        for (var shaderType = 0; shaderType < CaseShaderType.CASESHADERTYPE_LAST; shaderType++)
                        {
                            /** @type {string} */ var name = collName + getCaseShaderTypeName(shaderType);
                            unusedUniformsGroup.addChild(new UniformInfoQueryCase(name, '', shaderType, uniformCollection, caseType,
                                                                                   Feature.UNIFORMUSAGE_EVERY_OTHER | Feature.ARRAYUSAGE_ONLY_MIDDLE_INDEX));
                        }
                    }
                }
            }
        }
    };

    /**
     * Create and execute the test cases
     */
    var run = function(context) {
        gl = context;
        //Set up Test Root parameters
        var testName = 'uniform_api';
        var testDescription = 'Uniform API Tests';
        var state = deqpTests.runner.getState();

        state.testName = testName;
        state.testCases = deqpTests.newTest(testName, testDescription, null);

        //Set up name and description of this test series.
        setCurrentTestName(testName);
        description(testDescription);

        try {
            //Create test cases
            init();
            //Run test cases
            deqpTests.runTestCases();
        }
        catch (err) {
            testFailedOptions('Failed to run tests', false);
            deqpTests.runner.terminate();
        }
    };

    return {
        run: run
    };
});
