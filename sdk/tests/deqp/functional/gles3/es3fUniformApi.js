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
    'framework/opengl/gluShaderUtil',
    'framework/opengl/gluTexture',
    'framework/opengl/gluVarType',
    'framework/common/tcuTestCase',
    'framework/common/tcuTexture',
    'framework/delibs/debase/deMath',
    'framework/delibs/debase/deRandom'], function(
        deqpUtils,
        gluTexture,
        gluVT,
        deqpTests,
        tcuTexture,
        deMath,
        deRandom) {
    'use strict';

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
     * @param {tcuTexture.PixelBufferAccess} access,
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
     * @param {deqpUtils.DataType} T_
     * @return {dataTypeEquals}
     */
    var dataTypeEquals = function(T_)
    {
        this.T = T;
    };

    /**
     * @param {deqpUtils.DataType} t
     * @return {boolean}
     */
    dataTypeEquals.prototype.exec = function(t) {
        return t == T;
    };

    /**
     * @param {number} N_ Row number. Used to be a template parameter
     * @return {dataTypeIsMatrixWithNRows}
     */
    var dataTypeIsMatrixWithNRows = function(N_) {
        this.N = N_;
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
            /** @type {gluVT.StructType} */ var structType = gluVT.StructType("structType" + curStructIdx++);

            for (var i = 0; i < numMembers; i++)
            {
                /** @type {VarTypeWithIndex} */ var typeWithIndex = generateRandomType(maxDepth-1, curStructIdx, structTypesDst, rnd);
                curStructIdx = typeWithIndex.ndx;
                structType.addMember("m" + i, typeWithIndex.type);
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
            /** @type {deqpUtils.DataType} */ var basicType = s_testDataTypes[rnd.getInt(0, s_testDataTypes.length-1)];
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

    /**
     * VarValue class. may contain different types.
     */
    var VarValue = function() {
        /** @type {deqpUtils.DataType} */ this.type = -1;
        /** @type {Array.<number|boolean> | SamplerV} */ this.val = [];
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
        /** @type {Array<deqpUtils.DataType>} */ var samplerTypes;
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
    UniformCollection.prototype.basic = function(type, nameSuffix) {
        if (nameSuffix === undefined) nameSuffix = '';
        /** @type {UniformCollection} */ var res = new UniformCollection();
        /** @type {deqpUtils.precision} */ var prec = deqpUtils.isDataTypeBoolOrBVec(type) ? deqpUtils.precision.PRECISION_LAST : deqpUtils.precision.PRECISION_MEDIUMP;
        res.m_uniforms.push(new Uniform("u_var" + nameSuffix, gluVT.newTypeBasic(type, prec)));
        return res;
    };

    /**
     * @param {deqpUtils.DataType} type
     * @param {string} nameSuffix
     * @return {UniformCollection}
     */
    UniformCollection.prototype.basicArray = function(type, nameSuffix) {
        if (nameSuffix === undefined) nameSuffix = '';
        /** @type {UniformCollection} */ var res = new UniformCollection();
        /** @type {deqpUtils.precision} */ var prec = deqpUtils.isDataTypeBoolOrBVec(type) ? deqpUtils.precision.PRECISION_LAST : deqpUtils.precision.PRECISION_MEDIUMP;
        res.m_uniforms.push(new Uniform("u_var" + nameSuffix, gluVT.newTypeAray(gluVT.newTypeBasic(type, prec), 3)));
        return res;
    };

    /**
     * @param {deqpUtils.DataType} type0
     * @param {deqpUtils.DataType} type1
     * @param {boolean} containsArrays
     * @param {string} nameSuffix
     * @return {UniformCollection}
     */
    UniformCollection.prototype.basicStruct = function(type0, type1, containsArrays, nameSuffix) {
        if (nameSuffix === undefined) nameSuffix = '';
        /** @type {UniformCollection} */ var res = new UniformCollection();
        /** @type {deqpUtils.precision} */ var prec0 = deqpUtils.isDataTypeBoolOrBVec(type0) ? deqpUtils.precision.PRECISION_LAST : deqpUtils.precision.PRECISION_MEDIUMP;
        /** @type {deqpUtils.precision} */ var prec1 = deqpUtils.isDataTypeBoolOrBVec(type1) ? deqpUtils.precision.PRECISION_LAST : deqpUtils.precision.PRECISION_MEDIUMP;

        /** @type {gluVT.StructType} */ var structType = new gluVT.StructType("structType" + nameSuffix);
        structType.addMember("m0", gluVT.newTypeBasic(type0, prec0));
        structType.addMember("m1", gluVT.newTypeBasic(type1, prec1));
        if (containsArrays)
        {
            structType.addMember("m2", gluVT.newTypeArray(gluVT.newTypeBasic(type0, prec0), 3));
            structType.addMember("m3", gluVT.newTypeArray(gluVT.newTypeBasic(type1, prec1), 3));
        }

        res.addStructType(structType);
        res.addUniform(new Uniform("u_var" + nameSuffix, gluVT.newTypeStruct(structType)));

        return res;
    };

    /**
     * @param {deqpUtils.DataType} type0
     * @param {deqpUtils.DataType} type1
     * @param {boolean} containsArrays
     * @param {string} nameSuffix
     * @return {UniformCollection}
     */
    UniformCollection.prototype.structInArray = function(type0, type1, containsArrays, nameSuffix) {
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
    UniformCollection.prototype.nestedArraysStructs = function(type0, type1, nameSuffix) {
        if (nameSuffix === undefined) nameSuffix = '';
        /** @type {UniformCollection} */ var res = new UniformCollection();
        /** @type {deqpUtils.precision} */ var prec0 = deqpUtils.isDataTypeBoolOrBVec(type0) ? deqpUtils.precision.PRECISION_LAST : deqpUtils.precision.PRECISION_MEDIUMP;
        /** @type {deqpUtils.precision} */ var prec1 = deqpUtils.isDataTypeBoolOrBVec(type1) ? deqpUtils.precision.PRECISION_LAST : deqpUtils.precision.PRECISION_MEDIUMP;
        /** @type {gluVT.StructType} */ var structType = new gluVT.StructType("structType" + nameSuffix);
        /** @type {gluVT.StructType} */ var subStructType = new gluVT.StructType("subStructType" + nameSuffix);
        /** @type {gluVT.StructType} */ var subSubStructType = new gluVT.StructType("subSubStructType" + nameSuffix);

        subSubStructType.addMember("mss0", gluVT.newTypeBasic(type0, prec0));
        subSubStructType.addMember("mss1", gluVT.newTypeBasic(type1, prec1));

        subStructType.addMember("ms0", gluVT.newTypeBasic(type1, prec1));
        subStructType.addMember("ms1", gluVT.newTypeArray(gluVT.newTypeBasic(type0, prec0), 2));
        subStructType.addMember("ms2", gluVT.newTypeArray(gluVT.newTypeStruct(subSubStructType), 2));

        structType.addMember("m0", gluVT.newTypeBasic(type0, prec0));
        structType.addMember("m1", gluVT.newTypeStruct(subStructType));
        structType.addMember("m2", gluVT.newTypeBasic(type1, prec1));

        res.addStructType(subSubStructType);
        res.addStructType(subStructType);
        res.addStructType(structType);

        res.addUniform(new Uniform("u_var" + nameSuffix, gluVT.newTypeStruct(structType)));

        return res;
    };

    /**
     * @param {string} nameSuffix
     * @return {UniformCollection}
     */
    UniformCollection.prototype.multipleBasic = function(nameSuffix) {
        if (nameSuffix === undefined) nameSuffix = '';
        /** @type {Array.<deqpUtils.DataType>} */ var types = [deqpUtils.DataType.FLOAT, deqpUtils.DataType.INT_VEC3, deqpUtils.DataType.UINT_VEC4, deqpUtils.DataType.FLOAT_MAT3, deqpUtils.DataType.BOOL_VEC2];
        /** @type {UniformCollection} */ var res = new UniformCollection();

        for (var i = 0; i < types.length; i++)
        {
            /** @type {UniformCollection} */ var sub = this.basic(types[i], "_" + i + nameSuffix);
            sub.moveContents(res);
        }

        return res;
    };

    /**
     * @param {string} nameSuffix
     * @return {UniformCollection}
     */
    UniformCollection.prototype.multipleBasicArray = function(nameSuffix) {
        if (nameSuffix === undefined) nameSuffix = '';
        /** @type {Array.<deqpUtils.DataType>} */ var types = [deqpUtils.DataType.FLOAT, deqpUtils.DataType.INT_VEC3, deqpUtils.DataType.BOOL_VEC2];
        /** @type {UniformCollection} */ var res = new UniformCollection();

        for (var i = 0; i < types.length; i++)
        {
            /** @type {UniformCollection} */ var sub = this.basicArray(types[i], "_" + i + nameSuffix);
            sub.moveContents(res);
        }

        return res;
    };

    /**
     * @param {string} nameSuffix
     * @return {UniformCollection}
     */
    UniformCollection.prototype.multipleNestedArraysStructs = function(nameSuffix) {
        if (nameSuffix === undefined) nameSuffix = '';
        /** @type {Array.<deqpUtils.DataType>} */ var types0 = [deqpUtils.DataType.FLOAT, deqpUtils.DataType.INT, deqpUtils.DataType.BOOL_VEC4];
        /** @type {Array.<deqpUtils.DataType>} */ var types1 = [deqpUtils.DataType.FLOAT_VEC4, deqpUtils.DataType.INT_VEC4, deqpUtils.DataType.BOOL];
        /** @type {UniformCollection} */ var res = new UniformCollection();

        DE_STATIC_ASSERT(types0.length == types1.length);

        for (var i = 0; i < types0.length; i++)
        {
            /** @type {UniformCollection} */ var sub = this.nestedArraysStructs(types0[i], types1[i], "_" + i + nameSuffix);
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
            /** @type {Uniform} */ var uniform = new Uniform("u_var" + i, deqpUtils.VarType());

            // \note Discard uniforms that would cause number of samplers to exceed MAX_NUM_SAMPLER_UNIFORMS.
            do
            {
                structTypes.clear();
                uniform.type = "u_var" + i, generateRandomType(3, structIdx, structTypes, rnd);
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
                    result.val.floatV[i] = sampler.val.samplerV.fillColor.floatV[i];
                break;
            case deqpUtils.DataType.UINT_VEC4:
                for (var i = 0; i < 4; i++)
                    result.val.uintV[i] = sampler.val.samplerV.fillColor.uintV[i];
                break;
            case deqpUtils.DataType.INT_VEC4:
                for (var i = 0; i < 4; i++)
                    result.val.intV[i] = sampler.val.samplerV.fillColor.intV[i];
                break;
            case deqpUtils.DataType.FLOAT:
                result.val.floatV[0] = sampler.val.samplerV.fillColor.floatV[0];
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
        result.val.intV[0] = sampler.val.samplerV.unit;

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
            result.val.floatV[i*cols + j] = original.val.floatV[j*rows + i];

        return result;
    };

    /**
     * @param {VarValue} value
     * @return {string}
     */
    var shaderVarValueStr = function(value) {
        /** @type {number} */ var numElems = deqpUtils.getDataTypeScalarSize(value.type);
        /** @type {string} */ var result;

        if (numElems > 1)
            result += deqpUtils.getDataTypeName(value.type) + "(";

        for (var i = 0; i < numElems; i++)
        {
            if (i > 0)
                result += ", ";

            if (deqpUtils.isDataTypeFloatOrVec(value.type) || deqpUtils.isDataTypeMatrix(value.type))
                result += value.val.floatV[i].toFixed(2);
            else if (deqpUtils.isDataTypeIntOrIVec((value.type)))
                result += value.val.intV[i];
            else if (deqpUtils.isDataTypeUintOrUVec((value.type)))
                result += value.val.uintV[i] + "u";
            else if (deqpUtils.isDataTypeBoolOrBVec((value.type)))
                result += value.val.boolV[i] ? "true" : "false";
            else if (deqpUtils.isDataTypeSampler((value.type)))
                result += shaderVarValueStr(getSamplerFillValue(value));
            else
                DE_ASSERT(false);
        }

        if (numElems > 1)
            result += ")";

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
            result += "(";

        for (var i = 0; i < numElems; i++)
        {
            if (i > 0)
                result += ", ";

            if (deqpUtils.isDataTypeFloatOrVec(value.type) || deqpUtils.isDataTypeMatrix(value.type))
                result += value.val.floatV[i].toFixed(2);
            else if (deqpUtils.isDataTypeIntOrIVec((value.type)))
                result += value.val.intV[i];
            else if (deqpUtils.isDataTypeUintOrUVec((value.type)))
                result += value.val.uintV[i];
            else if (deqpUtils.isDataTypeBoolOrBVec((value.type)))
                result += value.val.boolV[i] ? "true" : "false";
            else if (deqpUtils.isDataTypeSampler((value.type)))
                result += value.val.samplerV.unit;
            else
                DE_ASSERT(false);
        }

        if (numElems > 1)
            result += ")";

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
                result.val.floatV[i] = rnd.getFloat(-10.0, 10.0);
        }
        else if (deqpUtils.isDataTypeIntOrIVec(type))
        {
            for (var i = 0; i < numElems; i++)
                result.val.intV[i] = rnd.getInt(-10, 10);
        }
        else if (deqpUtils.isDataTypeUintOrUVec(type))
        {
            for (var i = 0; i < numElems; i++)
                result.val.uintV[i] = rnd.getInt(0, 10);
        }
        else if (deqpUtils.isDataTypeBoolOrBVec(type))
        {
            for (var i = 0; i < numElems; i++)
                result.val.boolV[i] = rnd.getBool();
        }
        else if (deqpUtils.isDataTypeSampler(type))
        {
            /** @type {deqpUtils.DataType} */ var texResultType = getSamplerLookupReturnType(type);
            /** @type {deqpUtils.DataType} */ var texResultScalarType = deqpUtils.getDataTypeScalarType(texResultType);
            /** @type {number} */ var texResultNumDims = deqpUtils.getDataTypeScalarSize(texResultType);

            result.val.samplerV.unit = samplerUnit;

            for (var i = 0; i < texResultNumDims; i++)
            {
                switch (texResultScalarType)
                {
                    case deqpUtils.DataType.FLOAT: result.val.samplerV.fillColor.floatV[i] = rnd.getFloat(0.0, 1.0); break;
                    case deqpUtils.DataType.INT: result.val.samplerV.fillColor.intV[i] = rnd.getInt(-10, 10); break;
                    case deqpUtils.DataType.UINT: result.val.samplerV.fillColor.uintV[i] = rnd.getInt(0, 10); break;
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
                result.val.floatV[i] = 0.0;
        }
        else if (deqpUtils.isDataTypeIntOrIVec(type))
        {
            for (var i = 0; i < numElems; i++)
                result.val.intV[i] = 0;
        }
        else if (deqpUtils.isDataTypeUintOrUVec(type))
        {
            for (var i = 0; i < numElems; i++)
                result.val.uintV[i] = 0;
        }
        else if (deqpUtils.isDataTypeBoolOrBVec(type))
        {
            for (var i = 0; i < numElems; i++)
                result.val.boolV[i] = false;
        }
        else if (deqpUtils.isDataTypeSampler(type))
        {
            /** @type {deqpUtils.DataType} */ var texResultType = getSamplerLookupReturnType(type);
            /** @type {deqpUtils.DataType} */ var texResultScalarType = deqpUtils.getDataTypeScalarType(texResultType);
            /** @type {number} */ var texResultNumDims    = deqpUtils.getDataTypeScalarSize(texResultType);

            result.val.samplerV.unit = 0;

            for (var i = 0; i < texResultNumDims; i++)
            {
                switch (texResultScalarType)
                {
                    case deqpUtils.DataType.FLOAT: result.val.samplerV.fillColor.floatV[i] = 0.12 * i; break;
                    case deqpUtils.DataType.INT: result.val.samplerV.fillColor.intV[i] = -2 + i; break;
                    case deqpUtils.DataType.UINT: result.val.samplerV.fillColor.uintV[i] = 4 + i; break;
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
        /** @type {number} */ var size            = deqpUtils.getDataTypeScalarSize(a.type);
        /** @type {number} */ var floatThreshold    = 0.05;

        DE_ASSERT(a.type == b.type);

        if (deqpUtils.isDataTypeFloatOrVec(a.type) || deqpUtils.isDataTypeMatrix(a.type))
        {
            for (var i = 0; i < size; i++)
                if (Math.abs(a.val.floatV[i] - b.val.floatV[i]) >= floatThreshold)
                    return false;
        }
        else if (deqpUtils.isDataTypeIntOrIVec(a.type))
        {
            for (var i = 0; i < size; i++)
                if (a.val.intV[i] != b.val.intV[i])
                    return false;
        }
        else if (deqpUtils.isDataTypeUintOrUVec(a.type))
        {
            for (var i = 0; i < size; i++)
                if (a.val.uintV[i] != b.val.uintV[i])
                    return false;
        }
        else if (deqpUtils.isDataTypeBoolOrBVec(a.type))
        {
            for (var i = 0; i < size; i++)
                if (a.val.boolV[i] != b.val.boolV[i])
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
        /** @type {deqpUtils.DataType} */ var targetType    = size == 1 ? targetScalarType : deqpUtils.getDataTypeVector(targetScalarType, size);
        /** @type {VarValue} */ var result = new VarValue();
        result.type = targetType;

        switch (targetScalarType)
        {
            case deqpUtils.DataType.INT:
                for (var i = 0; i < size; i++)
                {
                    if (boolValue.val.boolV[i])
                    {
                        result.val.intV[i] = rnd.getInt(-10, 10);
                        if (result.val.intV[i] == 0)
                            result.val.intV[i] = 1;
                    }
                    else
                        result.val.intV[i] = 0;
                }
                break;

            case deqpUtils.DataType.UINT:
                for (var i = 0; i < size; i++)
                {
                    if (boolValue.val.boolV[i])
                        result.val.uintV[i] = rnd.getInt(1, 10);
                    else
                        result.val.uintV[i] = 0;
                }
                break;

            case deqpUtils.DataType.FLOAT:
                for (var i = 0; i < size; i++)
                {
                    if (boolValue.val.boolV[i])
                    {
                        result.val.floatV[i] = rnd.getFloat(-10.0, 10.0);
                        if (result.val.floatV[i] == 0.0)
                            result.val.floatV[i] = 1.0;
                    }
                    else
                        result.val.floatV[i] = 0;
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
            case CaseShaderType.CASESHADERTYPE_VERTEX: return "vertex";
            case CaseShaderType.CASESHADERTYPE_FRAGMENT: return "fragment";
            case CaseShaderType.CASESHADERTYPE_BOTH: return "both";
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
        return (new deRandom.Random(seed)).getInt(0, CaseShaderType.CASESHADERTYPE_LAST-1);
    };

    //UniformCase definitions

    /**
     * @enum Feature
     */
    var Feature = {
        // ARRAYUSAGE_ONLY_MIDDLE_INDEX: only middle index of each array is used in shader. If not given, use all indices.
        ARRAYUSAGE_ONLY_MIDDLE_INDEX: 1<<0,

        // UNIFORMFUNC_VALUE: use pass-by-value versions of uniform assignment funcs, e.g. glUniform1f(), where possible. If not given, use pass-by-pointer versions.
        UNIFORMFUNC_VALUE: 1<<1,

        // MATRIXMODE_ROWMAJOR: pass matrices to GL in row major form. If not given, use column major.
        MATRIXMODE_ROWMAJOR: 1<<2,

        // ARRAYASSIGN: how basic-type arrays are assigned with glUniform*(). If none given, assign each element of an array separately.
        ARRAYASSIGN_FULL: 1<<3, //!< Assign all elements of an array with one glUniform*().
        ARRAYASSIGN_BLOCKS_OF_TWO: 1<<4, //!< Assign two elements per one glUniform*().

        // UNIFORMUSAGE_EVERY_OTHER: use about half of the uniforms. If not given, use all uniforms (except that some array indices may be omitted according to ARRAYUSAGE).
        UNIFORMUSAGE_EVERY_OTHER: 1<<5,

        // BOOLEANAPITYPE: type used to pass booleans to and from GL api. If none given, use float.
        BOOLEANAPITYPE_INT: 1<<6,
        BOOLEANAPITYPE_UINT: 1<<7,

        // UNIFORMVALUE_ZERO: use zero-valued uniforms. If not given, use random uniform values.
        UNIFORMVALUE_ZERO: 1<<8,

        // ARRAY_FIRST_ELEM_NAME_NO_INDEX: in certain API functions, when referring to the first element of an array, use just the array name without [0] at the end.
        ARRAY_FIRST_ELEM_NAME_NO_INDEX: 1<<9
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
    var BasicUniform = function(type_, isUsedInShader_, finalValue_, rootName_, elemNdx_, rootSize_) {
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
    BasicUniform.prototype.findWithName = function(vec, name) {
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
        DE_ASSERT(minSize <= maxSize);
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
    BasicUniformReportGL.prototype.findWithName = function(vec, name) {
        for (var i = 0; i < vec.length; i++) //vector<BasicUniformReportGL>::const_iterator it = vec.begin(); it != vec.end(); it++)
        {
            if (vec[i].name == name)
                return vec[i];
        }
        return undefined;
    }

    /**
     * UniformCase class, inherits from TestCase class
     * @param {string} name
     * @param {string} description
     * @param {deMath.deUint32} seed
     * @return {UniformCase}
     */
    var UniformCase = function(name, description, seed) { // \note Randomizes caseType, uniformCollection and features.
        tcuTestCase.DeqpTest.call(this, name, description);

        /** @type {deMath.deUint32} */ this.m_features = randomFeatures(seed);
        /** @type {UniformCollection} (SharedPtr) */ this.m_uniformCollection = UniformCollection.random(seed);

        /** @type {CaseShaderType} */ this.m_caseShaderType = randomCaseShaderType(seed);

        /** @type {gluTexture.Texture2D} */ this.m_textures2d = new gluTexture.Texture2D();
        /** @type {gluTexture.TextureCube} */ this.m_texturesCube = new gluTexture.TextureCube();
        /** @type {Array.<deMath.deUint32>} */ this.m_filledTextureUnits = [];
    };

    UniformCase.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    UniformCase.prototype.constructor = UniformCase;

    /**
     * UniformCase new_B. Creates a UniformCase
     * @param {string} name
     * @param {string} description
     * @param {CaseShaderType} caseShaderType
     * @param {UniformCollection} description (SharedPtr)
     * @param {deMath.deUint32} features
     * @return {UniformCase}
     */
    UniformCase.new_B = function(name, description, caseShaderType, uniformCollection, features) {
        var uniformCase = new UniformCase(name, description, 0);
        uniformCase.m_features = features;
        uniformCase.m_uniformCollection = uniformCollection;
        uniformCase.m_caseShaderType = caseShaderType;

        return uniformCase;
    };

    /**
     * UniformCase new_A. Creates a UniformCase
     * @param {string} name
     * @param {string} description
     * @param {CaseShaderType} caseShaderType
     * @param {UniformCollection} description (SharedPtr)
     * @return {UniformCase}
     */
    UniformCase.new_A = function(name, description, caseShaderType, uniformCollection) {
        var uniformCase = new UniformCase(name, description, 0);
        uniformCase.m_features = 0;
        uniformCase.m_uniformCollection = uniformCollection;
        uniformCase.m_caseShaderType = caseShaderType;

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

        /** @type {deRandom.Random} */ rnd = new deRandom.Random(seed);

        /** @type {deMath.deUint32} */ var result = 0;

        var ARRAY_CHOICE = function(ARR) {ARR[rnd.getInt(0, ARR.length-1)];};

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
            testFailedOptions('' + vertexTexUnitsRequired + " vertex texture units required, " + vertexTexUnitsSupported + " supported", true);
        if (fragmentTexUnitsRequired > fragmentTexUnitsSupported)
            testFailedOptions('' + fragmentTexUnitsRequired + " fragment texture units required, " + fragmentTexUnitsSupported + " supported", true);
        if (combinedTexUnitsRequired > combinedTexUnitsSupported)
            testFailedOptions('' + combinedTexUnitsRequired + " combined texture units required, " + combinedTexUnitsSupported + " supported", true);
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
            /** @type {VarValue} */ var value = this.m_features & Feature.UNIFORMVALUE_ZERO ? generateZeroVarValue(type)
                                                : deqpUtils.isDataTypeSampler(type) ? generateRandomVarValue(type, rnd, samplerUnitCounter++)
                                                : generateRandomVarValue(varType.getBasicType(), rnd);

            basicUniformsDst.push(new BasicUniform(varName, varType.getBasicType(), isActive, value));
            basicUniformReportsDst.push(new BasicUniformReportRef(varName, varType.getBasicType(), isActive));
        }
        else if (varType.isArrayType())
        {
            /** @type {number} */ var size            = varType.getArraySize();
            /** @type {string} */ var arrayRootName    = '' + varName + '[0]';
            /** @type {Array.<boolean>} */ var isElemActive;

            for (var elemNdx = 0; elemNdx < varType.getArraySize(); elemNdx++)
            {
                /** @type {boolean} */ var indexedName = '' + varName + "[" + elemNdx + "]";
                /** @type {boolean} */ var isCurElemActive = isParentActive &&
                                                  (this.m_features & Feature.UNIFORMUSAGE_EVERY_OTHER ? basicUniformsDst.size() % 2 == 0 : true) &&
                                                  (this.m_features & Feature.ARRAYUSAGE_ONLY_MIDDLE_INDEX ? elemNdx == Math.floor(size/2) : true);

                isElemActive.push(isCurElemActive);

                if (varType.getElementType().isBasicType())
                {
                    // \note We don't want separate entries in basicUniformReportsDst for elements of basic-type arrays.
                    /** @type {deqpUtils.DataType} */ var elemBasicType    = varType.getElementType().getBasicType();
                    /** @type {VarValue} */ var value = this.m_features & Feature.UNIFORMVALUE_ZERO ? generateZeroVarValue(elemBasicType)
                                                        : deqpUtils.isDataTypeSampler(elemBasicType) ? generateRandomVarValue(elemBasicType, rnd, samplerUnitCounter++)
                                                        : generateRandomVarValue(elemBasicType, rnd);

                    basicUniformsDst.push(new BasicUniform(indexedName, elemBasicType, isCurElemActive, value, arrayRootName, elemNdx, size));
                }
                else
                    generateBasicUniforms(basicUniformsDst, basicUniformReportsDst, varType.getElementType(), indexedName, isCurElemActive, samplerUnitCounter, rnd);
            }

            if (varType.getElementType().isBasicType())
            {
                /** @type {number} */ var minSize;
                for (minSize = varType.getArraySize(); minSize > 0 && !isElemActive[minSize-1]; minSize--);

                basicUniformReportsDst.push(new BasicUniformReportRef(arrayRootName, minSize, size, varType.getElementType().getBasicType(), isParentActive && minSize > 0));
            }
        }
        else
        {
            DE_ASSERT(varType.isStructType());

            /** @type {gluVT.StructType} */ var structType = varType.getStructPtr();

            for (int i = 0; i < structType.getNumMembers(); i++)
            {
                /** @type {gluVT.StructMember} */ var member = structType.getMember(i);
                /** @type {string} */ var memberFullName = '' + varName + "." + member.getName();

                generateBasicUniforms(basicUniformsDst, basicUniformReportsDst, member.getType(), memberFullName, isParentActive, samplerUnitCounter, rnd);
            }
        }
    };

    /**
     * @param {string} dst
     * @return {string}
     */
    UniformCase.prototype.writeUniformDefinitions = function(dst) {
        for (var i = 0; i < this.m_uniformCollection.getNumStructTypes(); i++)
            dst += deqpUtils.declare(this.holam_uniformCollection->getStructType(i)) << ";\n";

        for (var i = 0; i < this.m_uniformCollection.getNumUniforms(); i++)
            dst += "uniform " + deqpUtils.declare(this.m_uniformCollection.getUniform(i).type, this.m_uniformCollection.getUniform(i).name) + ";\n";

        dst += "\n";

        {
            //TODO: Check if new operator is needed in dataTypeEquals
            var compareFuncs =
            [
                { requiringTypes: [deqpUtils.isDataTypeFloatOrVec, deqpUtils.isDataTypeMatrix], definition: "mediump float compare_float    (mediump float a, mediump float b)  { return abs(a - b) < 0.05 ? 1.0 : 0.0; }"},
                { requiringTypes: [dataTypeEquals(deqpUtils.DataType.FLOAT_VEC2).exec, dataTypeIsMatrixWithNRows(2).exec], definition: "mediump float compare_vec2     (mediump vec2 a, mediump vec2 b)    { return compare_float(a.x, b.x)*compare_float(a.y, b.y); }"},
                { requiringTypes: [dataTypeEquals(deqpUtils.DataType.FLOAT_VEC3).exec, dataTypeIsMatrixWithNRows(3).exec], definition: "mediump float compare_vec3     (mediump vec3 a, mediump vec3 b)    { return compare_float(a.x, b.x)*compare_float(a.y, b.y)*compare_float(a.z, b.z); }"},
                { requiringTypes: [dataTypeEquals(deqpUtils.DataType.FLOAT_VEC4).exec, dataTypeIsMatrixWithNRows(4).exec], definition: "mediump float compare_vec4     (mediump vec4 a, mediump vec4 b)    { return compare_float(a.x, b.x)*compare_float(a.y, b.y)*compare_float(a.z, b.z)*compare_float(a.w, b.w); }"},
                { requiringTypes: [dataTypeEquals(deqpUtils.DataType.FLOAT_MAT2).exec, dataTypeEquals(deqpUtils.DataType.INVALID).exec], definition: "mediump float compare_mat2     (mediump mat2 a, mediump mat2 b)    { return compare_vec2(a[0], b[0])*compare_vec2(a[1], b[1]); }"},
                { requiringTypes: [dataTypeEquals(deqpUtils.DataType.FLOAT_MAT2X3).exec, dataTypeEquals(deqpUtils.DataType.INVALID).exec], definition: "mediump float compare_mat2x3   (mediump mat2x3 a, mediump mat2x3 b){ return compare_vec3(a[0], b[0])*compare_vec3(a[1], b[1]); }"},
                { requiringTypes: [dataTypeEquals(deqpUtils.DataType.FLOAT_MAT2X4).exec, dataTypeEquals(deqpUtils.DataType.INVALID).exec], definition: "mediump float compare_mat2x4   (mediump mat2x4 a, mediump mat2x4 b){ return compare_vec4(a[0], b[0])*compare_vec4(a[1], b[1]); }"},
                { requiringTypes: [dataTypeEquals(deqpUtils.DataType.FLOAT_MAT3X2).exec, dataTypeEquals(deqpUtils.DataType.INVALID).exec], definition: "mediump float compare_mat3x2   (mediump mat3x2 a, mediump mat3x2 b){ return compare_vec2(a[0], b[0])*compare_vec2(a[1], b[1])*compare_vec2(a[2], b[2]); }"},
                { requiringTypes: [dataTypeEquals(deqpUtils.DataType.FLOAT_MAT3).exec, dataTypeEquals(deqpUtils.DataType.INVALID).exec], definition: "mediump float compare_mat3     (mediump mat3 a, mediump mat3 b)    { return compare_vec3(a[0], b[0])*compare_vec3(a[1], b[1])*compare_vec3(a[2], b[2]); }"},
                { requiringTypes: [dataTypeEquals(deqpUtils.DataType.FLOAT_MAT3X4.exec), dataTypeEquals(deqpUtils.DataType.INVALID).exec], definition: "mediump float compare_mat3x4   (mediump mat3x4 a, mediump mat3x4 b){ return compare_vec4(a[0], b[0])*compare_vec4(a[1], b[1])*compare_vec4(a[2], b[2]); }"},
                { requiringTypes: [dataTypeEquals(deqpUtils.DataType.FLOAT_MAT4X2).exec, dataTypeEquals(deqpUtils.DataType.INVALID).exec], definition: "mediump float compare_mat4x2   (mediump mat4x2 a, mediump mat4x2 b){ return compare_vec2(a[0], b[0])*compare_vec2(a[1], b[1])*compare_vec2(a[2], b[2])*compare_vec2(a[3], b[3]); }"},
                { requiringTypes: [dataTypeEquals(deqpUtils.DataType.FLOAT_MAT4X3).exec, dataTypeEquals(deqpUtils.DataType.INVALID).exec], definition: "mediump float compare_mat4x3   (mediump mat4x3 a, mediump mat4x3 b){ return compare_vec3(a[0], b[0])*compare_vec3(a[1], b[1])*compare_vec3(a[2], b[2])*compare_vec3(a[3], b[3]); }"},
                { requiringTypes: [dataTypeEquals(deqpUtils.DataType.FLOAT_MAT4).exec, dataTypeEquals(deqpUtils.DataType.INVALID).exec], definition: "mediump float compare_mat4     (mediump mat4 a, mediump mat4 b)    { return compare_vec4(a[0], b[0])*compare_vec4(a[1], b[1])*compare_vec4(a[2], b[2])*compare_vec4(a[3], b[3]); }"},
                { requiringTypes: [dataTypeEquals(deqpUtils.DataType.INT).exec, dataTypeEquals(deqpUtils.DataType.INVALID).exec], definition: "mediump float compare_int      (mediump int a, mediump int b)      { return a == b ? 1.0 : 0.0; }"},
                { requiringTypes: [dataTypeEquals(deqpUtils.DataType.INT_VEC2).exec, dataTypeEquals(deqpUtils.DataType.INVALID).exec], definition: "mediump float compare_ivec2    (mediump ivec2 a, mediump ivec2 b)  { return a == b ? 1.0 : 0.0; }"},
                { requiringTypes: [dataTypeEquals(deqpUtils.DataType.INT_VEC3).exec, dataTypeEquals(deqpUtils.DataType.INVALID).exec], definition: "mediump float compare_ivec3    (mediump ivec3 a, mediump ivec3 b)  { return a == b ? 1.0 : 0.0; }"},
                { requiringTypes: [dataTypeEquals(deqpUtils.DataType.INT_VEC4).exec, dataTypeEquals(deqpUtils.DataType.INVALID).exec], definition: "mediump float compare_ivec4    (mediump ivec4 a, mediump ivec4 b)  { return a == b ? 1.0 : 0.0; }"},
                { requiringTypes: [dataTypeEquals(deqpUtils.DataType.UINT).exec, dataTypeEquals(deqpUtils.DataType.INVALID).exec], definition: "mediump float compare_uint     (mediump uint a, mediump uint b)    { return a == b ? 1.0 : 0.0; }"},
                { requiringTypes: [dataTypeEquals(deqpUtils.DataType.UINT_VEC2).exec, dataTypeEquals(deqpUtils.DataType.INVALID).exec], definition: "mediump float compare_uvec2    (mediump uvec2 a, mediump uvec2 b)  { return a == b ? 1.0 : 0.0; }"},
                { requiringTypes: [dataTypeEquals(deqpUtils.DataType.UINT_VEC3).exec, dataTypeEquals(deqpUtils.DataType.INVALID).exec], definition: "mediump float compare_uvec3    (mediump uvec3 a, mediump uvec3 b)  { return a == b ? 1.0 : 0.0; }"},
                { requiringTypes: [dataTypeEquals(deqpUtils.DataType.UINT_VEC4).exec, dataTypeEquals(deqpUtils.DataType.INVALID).exec], definition: "mediump float compare_uvec4    (mediump uvec4 a, mediump uvec4 b)  { return a == b ? 1.0 : 0.0; }"},
                { requiringTypes: [dataTypeEquals(deqpUtils.DataType.BOOL).exec, dataTypeEquals(deqpUtils.DataType.INVALID).exec], definition: "mediump float compare_bool     (bool a, bool b)                    { return a == b ? 1.0 : 0.0; }"},
                { requiringTypes: [dataTypeEquals(deqpUtils.DataType.BOOL_VEC2).exec, dataTypeEquals(deqpUtils.DataType.INVALID).exec], definition: "mediump float compare_bvec2    (bvec2 a, bvec2 b)                  { return a == b ? 1.0 : 0.0; }"},
                { requiringTypes: [dataTypeEquals(deqpUtils.DataType.BOOL_VEC3).exec, dataTypeEquals(deqpUtils.DataType.INVALID).exec], definition: "mediump float compare_bvec3    (bvec3 a, bvec3 b)                  { return a == b ? 1.0 : 0.0; }"},
                { requiringTypes: [dataTypeEquals(deqpUtils.DataType.BOOL_VEC4).exec, dataTypeEquals(deqpUtils.DataType.INVALID).exec], definition: "mediump float compare_bvec4    (bvec4 a, bvec4 b)                  { return a == b ? 1.0 : 0.0; }"}
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
                    dst += compareFuncs[compFuncNdx].definition + "\n";
            }
        }

        return dst;
    };

    /*void UniformCase::writeUniformCompareExpr (std::ostringstream& dst, const BasicUniform& uniform) const
    {
        if (deqpUtils.isDataTypeSampler(uniform.type))
            dst << "compare_" << deqpUtils.getDataTypeName(getSamplerLookupReturnType(uniform.type)) << "(texture(" << uniform.name << ", vec" << getSamplerNumLookupDimensions(uniform.type) << "(0.0))";
        else
            dst << "compare_" << deqpUtils.getDataTypeName(uniform.type) << "(" << uniform.name;

        dst << ", " << shaderVarValueStr(uniform.finalValue) << ")";
    }

    void UniformCase::writeUniformComparisons (std::ostringstream& dst, const vector<BasicUniform>& basicUniforms, const char* const variableName) const
    {
        for (int i = 0; i < (int)basicUniforms.size(); i++)
        {
            const BasicUniform& unif = basicUniforms[i];

            if (unif.isUsedInShader)
            {
                dst << "\t" << variableName << " *= ";
                writeUniformCompareExpr(dst, basicUniforms[i]);
                dst << ";\n";
            }
            else
                dst << "\t// UNUSED: " << basicUniforms[i].name << "\n";
        }
    }

    string UniformCase::generateVertexSource (const vector<BasicUniform>& basicUniforms) const
    {
        const bool            isVertexCase = m_caseShaderType == CASESHADERTYPE_VERTEX || m_caseShaderType == CASESHADERTYPE_BOTH;
        std::ostringstream    result;

        result << "#version 300 es\n"
                  "in highp vec4 a_position;\n"
                  "out mediump float v_vtxOut;\n"
                  "\n";

        if (isVertexCase)
            writeUniformDefinitions(result);

        result << "\n"
                  "void main (void)\n"
                  "{\n"
                  "    gl_Position = a_position;\n"
                  "    v_vtxOut = 1.0;\n";

        if (isVertexCase)
            writeUniformComparisons(result, basicUniforms, "v_vtxOut");

        result << "}\n";

        return result.str();
    }

    string UniformCase::generateFragmentSource (const vector<BasicUniform>& basicUniforms) const
    {
        const bool            isFragmentCase = m_caseShaderType == CASESHADERTYPE_FRAGMENT || m_caseShaderType == CASESHADERTYPE_BOTH;
        std::ostringstream    result;

        result << "#version 300 es\n"
                  "in mediump float v_vtxOut;\n"
                  "\n";

        if (isFragmentCase)
            writeUniformDefinitions(result);

        result << "\n"
                  "layout(location = 0) out mediump vec4 dEQP_FragColor;\n"
                  "\n"
                  "void main (void)\n"
                  "{\n"
                  "    mediump float result = v_vtxOut;\n";

        if (isFragmentCase)
            writeUniformComparisons(result, basicUniforms, "result");

        result << "    dEQP_FragColor = vec4(result, result, result, 1.0);\n"
                  "}\n";

        return result.str();
    }

    void UniformCase::setupTexture (const VarValue& value)
    {
        // \note No handling for samplers other than 2D or cube.

        enableLogging(false);

        DE_ASSERT(getSamplerLookupReturnType(value.type) == deqpUtils.DataType.FLOAT_VEC4);

        const int                        width            = 32;
        const int                        height            = 32;
        const tcu::Vec4                    color            = vec4FromPtr(&value.val.samplerV.fillColor.floatV[0]);

        if (value.type == deqpUtils.DataType.SAMPLER_2D)
        {
            deqpUtils.Texture2D* texture        = new deqpUtils.Texture2D(m_context.getRenderContext(), GL_RGBA, GL_UNSIGNED_BYTE, width, height);
            tcu::Texture2D& refTexture    = texture->getRefTexture();
            m_textures2d.push_back(texture);

            refTexture.allocLevel(0);
            fillWithColor(refTexture.getLevel(0), color);

            GLU_CHECK_CALL(glActiveTexture(GL_TEXTURE0 + value.val.samplerV.unit));
            m_filledTextureUnits.push_back(value.val.samplerV.unit);
            texture->upload();
            GLU_CHECK_CALL(glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE));
            GLU_CHECK_CALL(glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE));
            GLU_CHECK_CALL(glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST));
            GLU_CHECK_CALL(glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST));
        }
        else if (value.type == deqpUtils.DataType.SAMPLER_CUBE)
        {
            DE_ASSERT(width == height);

            deqpUtils.TextureCube* texture        = new deqpUtils.TextureCube(m_context.getRenderContext(), GL_RGBA, GL_UNSIGNED_BYTE, width);
            tcu::TextureCube& refTexture    = texture->getRefTexture();
            m_texturesCube.push_back(texture);

            for (int face = 0; face < (int)tcu::CUBEFACE_LAST; face++)
            {
                refTexture.allocLevel((tcu::CubeFace)face, 0);
                fillWithColor(refTexture.getLevelFace(0, (tcu::CubeFace)face), color);
            }

            GLU_CHECK_CALL(glActiveTexture(GL_TEXTURE0 + value.val.samplerV.unit));
            m_filledTextureUnits.push_back(value.val.samplerV.unit);
            texture->upload();
            GLU_CHECK_CALL(glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE));
            GLU_CHECK_CALL(glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE));
            GLU_CHECK_CALL(glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_MIN_FILTER, GL_NEAREST));
            GLU_CHECK_CALL(glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_MAG_FILTER, GL_NEAREST));

        }
        else
            DE_ASSERT(false);

        enableLogging(true);
    }

    bool UniformCase::getActiveUniforms (vector<BasicUniformReportGL>& basicUniformReportsDst, const vector<BasicUniformReportRef>& basicUniformReportsRef, const deUint32 programGL)
    {
        TestLog&            log                        = m_testCtx.getLog();
        GLint                numActiveUniforms        = 0;
        GLint                uniformMaxNameLength    = 0;
        vector<char>        nameBuffer;
        bool                success                    = true;

        GLU_CHECK_CALL(glGetProgramiv(programGL, GL_ACTIVE_UNIFORMS, &numActiveUniforms));
        log << TestLog::Message << "// Number of active uniforms reported: " << numActiveUniforms << TestLog::EndMessage;
        GLU_CHECK_CALL(glGetProgramiv(programGL, GL_ACTIVE_UNIFORM_MAX_LENGTH, &uniformMaxNameLength));
        log << TestLog::Message << "// Maximum uniform name length reported: " << uniformMaxNameLength << TestLog::EndMessage;
        nameBuffer.resize(uniformMaxNameLength);

        for (int unifNdx = 0; unifNdx < numActiveUniforms; unifNdx++)
        {
            GLsizei                    reportedNameLength    = 0;
            GLint                    reportedSize        = -1;
            GLenum                    reportedTypeGL        = GL_NONE;

            GLU_CHECK_CALL(glGetActiveUniform(programGL, (GLuint)unifNdx, (GLsizei)uniformMaxNameLength, &reportedNameLength, &reportedSize, &reportedTypeGL, &nameBuffer[0]));

            const deqpUtils.DataType        reportedType        = deqpUtils.getDataTypeFromGLType(reportedTypeGL);
            const string            reportedNameStr        (&nameBuffer[0]);

            TCU_CHECK_MSG(reportedType != deqpUtils.DataType.LAST, "Invalid uniform type");

            log << TestLog::Message << "// Got name = " << reportedNameStr << ", name length = " << reportedNameLength << ", size = " << reportedSize << ", type = " << deqpUtils.getDataTypeName(reportedType) << TestLog::EndMessage;

            if ((GLsizei)reportedNameStr.length() != reportedNameLength)
            {
                log << TestLog::Message << "// FAILURE: wrong name length reported, should be " << reportedNameStr.length() << TestLog::EndMessage;
                success = false;
            }

            if (!deStringBeginsWith(reportedNameStr.c_str(), "gl_")) // Ignore built-in uniforms.
            {
                int referenceNdx;
                for (referenceNdx = 0; referenceNdx < (int)basicUniformReportsRef.size(); referenceNdx++)
                {
                    if (basicUniformReportsRef[referenceNdx].name == reportedNameStr)
                        break;
                }

                if (referenceNdx >= (int)basicUniformReportsRef.size())
                {
                    log << TestLog::Message << "// FAILURE: invalid non-built-in uniform name reported" << TestLog::EndMessage;
                    success = false;
                }
                else
                {
                    const BasicUniformReportRef& reference = basicUniformReportsRef[referenceNdx];

                    DE_ASSERT(reference.type != deqpUtils.DataType.LAST);
                    DE_ASSERT(reference.minSize >= 1 || (reference.minSize == 0 && !reference.isUsedInShader));
                    DE_ASSERT(reference.minSize <= reference.maxSize);

                    if (BasicUniformReportGL::findWithName(basicUniformReportsDst, reportedNameStr.c_str()) != basicUniformReportsDst.end())
                    {
                        log << TestLog::Message << "// FAILURE: same uniform name reported twice" << TestLog::EndMessage;
                        success = false;
                    }

                    basicUniformReportsDst.push_back(BasicUniformReportGL(reportedNameStr.c_str(), reportedNameLength, reportedSize, reportedType, unifNdx));

                    if (reportedType != reference.type)
                    {
                        log << TestLog::Message << "// FAILURE: wrong type reported, should be " << deqpUtils.getDataTypeName(reference.type) << TestLog::EndMessage;
                        success = false;
                    }
                    if (reportedSize < reference.minSize || reportedSize > reference.maxSize)
                    {
                        log << TestLog::Message
                            << "// FAILURE: wrong size reported, should be "
                            << (reference.minSize == reference.maxSize ? de::toString(reference.minSize) : "in the range [" + de::toString(reference.minSize) + ", " + de::toString(reference.maxSize) + "]")
                            << TestLog::EndMessage;

                        success = false;
                    }
                }
            }
        }

        for (int i = 0; i < (int)basicUniformReportsRef.size(); i++)
        {
            const BasicUniformReportRef& expected = basicUniformReportsRef[i];
            if (expected.isUsedInShader && BasicUniformReportGL::findWithName(basicUniformReportsDst, expected.name.c_str()) == basicUniformReportsDst.end())
            {
                log << TestLog::Message << "// FAILURE: uniform with name " << expected.name << " was not reported by GL" << TestLog::EndMessage;
                success = false;
            }
        }

        return success;
    }

    bool UniformCase::getActiveUniformsiv (vector<BasicUniformReportGL>& basicUniformReportsDst, const vector<BasicUniformReportRef>& basicUniformReportsRef, const deUint32 programGL)
    {
        TestLog&                log                = m_testCtx.getLog();
        vector<string>            queryNames        (basicUniformReportsRef.size());
        vector<const char*>        queryNamesC        (basicUniformReportsRef.size());
        vector<GLuint>            uniformIndices    (basicUniformReportsRef.size());
        vector<deUint32>        validUniformIndices; // This shall have the same contents, and in same order, as uniformIndices, but with GL_INVALID_INDEX entries removed.
        bool                    success            = true;

        for (int i = 0; i < (int)basicUniformReportsRef.size(); i++)
        {
            const string& name = basicUniformReportsRef[i].name;
            queryNames[i]    = m_features & Feature.ARRAY_FIRST_ELEM_NAME_NO_INDEX && name[name.size()-1] == ']' ? beforeLast(name, '[') : name;
            queryNamesC[i]    = queryNames[i].c_str();
        }

        GLU_CHECK_CALL(glGetUniformIndices(programGL, (GLsizei)basicUniformReportsRef.size(), &queryNamesC[0], &uniformIndices[0]));

        for (int i = 0; i < (int)uniformIndices.size(); i++)
        {
            if (uniformIndices[i] != GL_INVALID_INDEX)
                validUniformIndices.push_back(uniformIndices[i]);
            else
            {
                if (basicUniformReportsRef[i].isUsedInShader)
                {
                    log << TestLog::Message << "// FAILURE: uniform with name " << basicUniformReportsRef[i].name << " received GL_INVALID_INDEX" << TestLog::EndMessage;
                    success = false;
                }
            }
        }

        if (!validUniformIndices.empty())
        {
            vector<GLint> uniformNameLengthBuf    (validUniformIndices.size());
            vector<GLint> uniformSizeBuf        (validUniformIndices.size());
            vector<GLint> uniformTypeBuf        (validUniformIndices.size());

            GLU_CHECK_CALL(glGetActiveUniformsiv(programGL, (GLsizei)validUniformIndices.size(), &validUniformIndices[0], GL_UNIFORM_NAME_LENGTH,    &uniformNameLengthBuf[0]));
            GLU_CHECK_CALL(glGetActiveUniformsiv(programGL, (GLsizei)validUniformIndices.size(), &validUniformIndices[0], GL_UNIFORM_SIZE,            &uniformSizeBuf[0]));
            GLU_CHECK_CALL(glGetActiveUniformsiv(programGL, (GLsizei)validUniformIndices.size(), &validUniformIndices[0], GL_UNIFORM_TYPE,            &uniformTypeBuf[0]));

            {
                int validNdx = -1; // Keeps the corresponding index to validUniformIndices while unifNdx is the index to uniformIndices.
                for (int unifNdx = 0; unifNdx < (int)uniformIndices.size(); unifNdx++)
                {
                    if (uniformIndices[unifNdx] == GL_INVALID_INDEX)
                        continue;

                    validNdx++;

                    const BasicUniformReportRef&    reference            = basicUniformReportsRef[unifNdx];
                    const int                        reportedIndex        = validUniformIndices[validNdx];
                    const int                        reportedNameLength    = (int)uniformNameLengthBuf[validNdx];
                    const int                        reportedSize        = (int)uniformSizeBuf[validNdx];
                    const deqpUtils.DataType                reportedType        = deqpUtils.getDataTypeFromGLType((deUint32)uniformTypeBuf[validNdx]);

                    TCU_CHECK_MSG(reportedType != deqpUtils.DataType.LAST, "Invalid uniform type");

                    log << TestLog::Message
                        << "// Got name length = " << reportedNameLength
                        << ", size = " << reportedSize
                        << ", type = " << deqpUtils.getDataTypeName(reportedType)
                        << " for the uniform at index " << reportedIndex << " (" << reference.name << ")"
                        << TestLog::EndMessage;

                    DE_ASSERT(reference.type != deqpUtils.DataType.LAST);
                    DE_ASSERT(reference.minSize >= 1 || (reference.minSize == 0 && !reference.isUsedInShader));
                    DE_ASSERT(reference.minSize <= reference.maxSize);
                    basicUniformReportsDst.push_back(BasicUniformReportGL(reference.name.c_str(), reportedNameLength, reportedSize, reportedType, reportedIndex));

                    if (reportedNameLength != (int)reference.name.length() + 1)
                    {
                        log << TestLog::Message << "// FAILURE: wrong name length reported, should be " << reference.name.length() + 1 << TestLog::EndMessage;
                        success = false;
                    }

                    if (reportedType != reference.type)
                    {
                        log << TestLog::Message << "// FAILURE: wrong type reported, should be " << deqpUtils.getDataTypeName(reference.type) << TestLog::EndMessage;
                        success = false;
                    }

                    if (reportedSize < reference.minSize || reportedSize > reference.maxSize)
                    {
                        log << TestLog::Message
                            << "// FAILURE: wrong size reported, should be "
                            << (reference.minSize == reference.maxSize ? de::toString(reference.minSize) : "in the range [" + de::toString(reference.minSize) + ", " + de::toString(reference.maxSize) + "]")
                            << TestLog::EndMessage;

                        success = false;
                    }
                }
            }
        }

        return success;
    }

    bool UniformCase::uniformVsUniformsivComparison (const vector<BasicUniformReportGL>& uniformResults, const vector<BasicUniformReportGL>& uniformsivResults)
    {
        TestLog&    log            = m_testCtx.getLog();
        bool        success        = true;

        for (int uniformResultNdx = 0; uniformResultNdx < (int)uniformResults.size(); uniformResultNdx++)
        {
            const BasicUniformReportGL&                            uniformResult        = uniformResults[uniformResultNdx];
            const string&                                        uniformName            = uniformResult.name;
            const vector<BasicUniformReportGL>::const_iterator    uniformsivResultIt    = BasicUniformReportGL::findWithName(uniformsivResults, uniformName.c_str());

            if (uniformsivResultIt != uniformsivResults.end())
            {
                const BasicUniformReportGL& uniformsivResult = *uniformsivResultIt;

                log << TestLog::Message << "// Checking uniform " << uniformName << TestLog::EndMessage;

                if (uniformResult.index != uniformsivResult.index)
                {
                    log << TestLog::Message << "// FAILURE: glGetActiveUniform() and glGetUniformIndices() gave different indices for uniform " << uniformName << TestLog::EndMessage;
                    success = false;
                }
                if (uniformResult.nameLength + 1 != uniformsivResult.nameLength)
                {
                    log << TestLog::Message << "// FAILURE: glGetActiveUniform() and glGetActiveUniformsiv() gave incompatible name lengths for uniform " << uniformName << TestLog::EndMessage;
                    success = false;
                }
                if (uniformResult.size != uniformsivResult.size)
                {
                    log << TestLog::Message << "// FAILURE: glGetActiveUniform() and glGetActiveUniformsiv() gave different sizes for uniform " << uniformName << TestLog::EndMessage;
                    success = false;
                }
                if (uniformResult.type != uniformsivResult.type)
                {
                    log << TestLog::Message << "// FAILURE: glGetActiveUniform() and glGetActiveUniformsiv() gave different types for uniform " << uniformName << TestLog::EndMessage;
                    success = false;
                }
            }
            else
            {
                log << TestLog::Message << "// FAILURE: uniform " << uniformName << " was reported active by glGetActiveUniform() but not by glGetUniformIndices()" << TestLog::EndMessage;
                success = false;
            }
        }

        for (int uniformsivResultNdx = 0; uniformsivResultNdx < (int)uniformsivResults.size(); uniformsivResultNdx++)
        {
            const BasicUniformReportGL&                            uniformsivResult    = uniformsivResults[uniformsivResultNdx];
            const string&                                        uniformsivName        = uniformsivResult.name;
            const vector<BasicUniformReportGL>::const_iterator    uniformsResultIt    = BasicUniformReportGL::findWithName(uniformsivResults, uniformsivName.c_str());

            if (uniformsResultIt == uniformsivResults.end())
            {
                log << TestLog::Message << "// FAILURE: uniform " << uniformsivName << " was reported active by glGetUniformIndices() but not by glGetActiveUniform()" << TestLog::EndMessage;
                success = false;
            }
        }

        return success;
    }

    bool UniformCase::getUniforms (vector<VarValue>& valuesDst, const vector<BasicUniform>& basicUniforms, const deUint32 programGL)
    {
        TestLog&    log            = m_testCtx.getLog();
        bool        success        = true;

        for (int unifNdx = 0; unifNdx < (int)basicUniforms.size(); unifNdx++)
        {
            const BasicUniform&        uniform        = basicUniforms[unifNdx];
            const string            queryName    = m_features & Feature.ARRAY_FIRST_ELEM_NAME_NO_INDEX && uniform.elemNdx == 0 ? beforeLast(uniform.name, '[') : uniform.name;
            const int                location    = glGetUniformLocation(programGL, queryName.c_str());
            const int                size        = deqpUtils.getDataTypeScalarSize(uniform.type);
            VarValue                value;

            deMemset(&value, 0xcd, sizeof(value)); // Initialize to known garbage.

            if (location == -1)
            {
                value.type = deqpUtils.DataType.INVALID;
                valuesDst.push_back(value);
                if (uniform.isUsedInShader)
                {
                    log << TestLog::Message << "// FAILURE: " << uniform.name << " was used in shader, but has location -1" << TestLog::EndMessage;
                    success = false;
                }
                continue;
            }

            value.type = uniform.type;

            DE_STATIC_ASSERT(sizeof(GLint) == sizeof(value.val.intV[0]));
            DE_STATIC_ASSERT(sizeof(GLuint) == sizeof(value.val.uintV[0]));
            DE_STATIC_ASSERT(sizeof(GLfloat) == sizeof(value.val.floatV[0]));

            if (deqpUtils.isDataTypeFloatOrVec(uniform.type) || deqpUtils.isDataTypeMatrix(uniform.type))
                GLU_CHECK_CALL(glGetUniformfv(programGL, location, &value.val.floatV[0]));
            else if (deqpUtils.isDataTypeIntOrIVec(uniform.type))
                GLU_CHECK_CALL(glGetUniformiv(programGL, location, &value.val.intV[0]));
            else if (deqpUtils.isDataTypeUintOrUVec(uniform.type))
                GLU_CHECK_CALL(glGetUniformuiv(programGL, location, &value.val.uintV[0]));
            else if (deqpUtils.isDataTypeBoolOrBVec(uniform.type))
            {
                if (m_features & Feature.BOOLEANAPITYPE_INT)
                {
                    GLU_CHECK_CALL(glGetUniformiv(programGL, location, &value.val.intV[0]));
                    for (int i = 0; i < size; i++)
                        value.val.boolV[i] = value.val.intV[i] != 0;
                }
                else if (m_features & Feature.BOOLEANAPITYPE_UINT)
                {
                    GLU_CHECK_CALL(glGetUniformuiv(programGL, location, &value.val.uintV[0]));
                    for (int i = 0; i < size; i++)
                        value.val.boolV[i] = value.val.uintV[i] != 0;
                }
                else // Default: use float.
                {
                    GLU_CHECK_CALL(glGetUniformfv(programGL, location, &value.val.floatV[0]));
                    for (int i = 0; i < size; i++)
                        value.val.boolV[i] = value.val.floatV[i] != 0.0f;
                }
            }
            else if (deqpUtils.isDataTypeSampler(uniform.type))
            {
                GLint unit = -1;
                GLU_CHECK_CALL(glGetUniformiv(programGL, location, &unit));
                value.val.samplerV.unit = unit;
            }
            else
                DE_ASSERT(false);

            valuesDst.push_back(value);

            log << TestLog::Message << "// Got " << uniform.name << " value " << apiVarValueStr(value) << TestLog::EndMessage;
        }

        return success;
    }

    bool UniformCase::checkUniformDefaultValues (const vector<VarValue>& values, const vector<BasicUniform>& basicUniforms)
    {
        TestLog&    log            = m_testCtx.getLog();
        bool        success        = true;

        DE_ASSERT(values.size() == basicUniforms.size());

        for (int unifNdx = 0; unifNdx < (int)basicUniforms.size(); unifNdx++)
        {
            const BasicUniform&        uniform        = basicUniforms[unifNdx];
            const VarValue&            unifValue    = values[unifNdx];
            const int                valSize        = deqpUtils.getDataTypeScalarSize(uniform.type);

            log << TestLog::Message << "// Checking uniform " << uniform.name << TestLog::EndMessage;

            if (unifValue.type == deqpUtils.DataType.INVALID) // This happens when glGetUniformLocation() returned -1.
                continue;

    #define CHECK_UNIFORM(VAR_VALUE_MEMBER, ZERO)                                                                                                \
        do                                                                                                                                        \
        {                                                                                                                                        \
            for (int i = 0; i < valSize; i++)                                                                                                    \
            {                                                                                                                                    \
                if (unifValue.val.VAR_VALUE_MEMBER[i] != ZERO)                                                                                    \
                {                                                                                                                                \
                    log << TestLog::Message << "// FAILURE: uniform " << uniform.name << " has non-zero initial value" << TestLog::EndMessage;    \
                    success = false;                                                                                                            \
                }                                                                                                                                \
            }                                                                                                                                    \
        } while (false)

            if (deqpUtils.isDataTypeFloatOrVec(uniform.type) || deqpUtils.isDataTypeMatrix(uniform.type))
                CHECK_UNIFORM(floatV, 0.0f);
            else if (deqpUtils.isDataTypeIntOrIVec(uniform.type))
                CHECK_UNIFORM(intV, 0);
            else if (deqpUtils.isDataTypeUintOrUVec(uniform.type))
                CHECK_UNIFORM(uintV, 0);
            else if (deqpUtils.isDataTypeBoolOrBVec(uniform.type))
                CHECK_UNIFORM(boolV, false);
            else if (deqpUtils.isDataTypeSampler(uniform.type))
            {
                if (unifValue.val.samplerV.unit != 0)
                {
                    log << TestLog::Message << "// FAILURE: uniform " << uniform.name << " has non-zero initial value" << TestLog::EndMessage;
                    success = false;
                }
            }
            else
                DE_ASSERT(false);

    #undef CHECK_UNIFORM
        }

        return success;
    }

    void UniformCase::assignUniforms (const vector<BasicUniform>& basicUniforms, deUint32 programGL, Random& rnd)
    {
        TestLog&                log                = m_testCtx.getLog();
        const bool                transpose        = (m_features & Feature.MATRIXMODE_ROWMAJOR) != 0;
        const GLboolean            transposeGL        = transpose ? GL_TRUE : GL_FALSE;
        const deqpUtils.DataType        boolApiType        = m_features & Feature.BOOLEANAPITYPE_INT    ? deqpUtils.DataType.INT
                                                : m_features & Feature.BOOLEANAPITYPE_UINT    ? deqpUtils.DataType.UINT
                                                :                                              deqpUtils.DataType.FLOAT;

        for (int unifNdx = 0; unifNdx < (int)basicUniforms.size(); unifNdx++)
        {
            const BasicUniform&        uniform                = basicUniforms[unifNdx];
            const bool                isArrayMember        = uniform.elemNdx >= 0;
            const string            queryName            = m_features & Feature.ARRAY_FIRST_ELEM_NAME_NO_INDEX && uniform.elemNdx == 0 ? beforeLast(uniform.name, '[') : uniform.name;
            const int                numValuesToAssign    = !isArrayMember                                    ? 1
                                                        : m_features & Feature.ARRAYASSIGN_FULL                ? (uniform.elemNdx == 0            ? uniform.rootSize    : 0)
                                                        : m_features & Feature.ARRAYASSIGN_BLOCKS_OF_TWO    ? (uniform.elemNdx % 2 == 0        ? 2                    : 0)
                                                        : /* Default: assign array elements separately */      /*1;

            DE_ASSERT(numValuesToAssign >= 0);
            DE_ASSERT(numValuesToAssign == 1 || isArrayMember);

            if (numValuesToAssign == 0)
            {
                log << TestLog::Message << "// Uniform " << uniform.name << " is covered by another glUniform*v() call to the same array" << TestLog::EndMessage;
                continue;
            }

            const int            location            = glGetUniformLocation(programGL, queryName.c_str());
            const int            typeSize            = deqpUtils.getDataTypeScalarSize(uniform.type);
            const bool            assignByValue        = m_features & Feature.UNIFORMFUNC_VALUE && !deqpUtils.isDataTypeMatrix(uniform.type) && numValuesToAssign == 1;
            vector<VarValue>    valuesToAssign;

            for (int i = 0; i < numValuesToAssign; i++)
            {
                const string    curName = isArrayMember ? beforeLast(uniform.rootName, '[') + "[" + de::toString(uniform.elemNdx+i) + "]" : uniform.name;
                VarValue        unifValue;

                if (isArrayMember)
                {
                    const vector<BasicUniform>::const_iterator elemUnif = BasicUniform::findWithName(basicUniforms, curName.c_str());
                    if (elemUnif == basicUniforms.end())
                        continue;
                    unifValue = elemUnif->finalValue;
                }
                else
                    unifValue = uniform.finalValue;

                const VarValue apiValue = deqpUtils.isDataTypeBoolOrBVec(unifValue.type)    ? getRandomBoolRepresentation(unifValue, boolApiType, rnd)
                                        : deqpUtils.isDataTypeSampler(unifValue.type)    ? getSamplerUnitValue(unifValue)
                                        : unifValue;

                valuesToAssign.push_back(deqpUtils.isDataTypeMatrix(apiValue.type) && transpose ? getTransposeMatrix(apiValue) : apiValue);

                if (deqpUtils.isDataTypeBoolOrBVec(uniform.type))
                    log << TestLog::Message << "// Using type " << deqpUtils.getDataTypeName(boolApiType) << " to set boolean value " << apiVarValueStr(unifValue) << " for " << curName << TestLog::EndMessage;
                else if (deqpUtils.isDataTypeSampler(uniform.type))
                    log << TestLog::Message << "// Texture for the sampler uniform " << curName << " will be filled with color " << apiVarValueStr(getSamplerFillValue(uniform.finalValue)) << TestLog::EndMessage;
            }

            DE_ASSERT(!valuesToAssign.empty());

            if (deqpUtils.isDataTypeFloatOrVec(valuesToAssign[0].type))
            {
                if (assignByValue)
                {
                    const float* const ptr = &valuesToAssign[0].val.floatV[0];

                    switch (typeSize)
                    {
                        case 1: GLU_CHECK_CALL(glUniform1f(location, ptr[0]));                            break;
                        case 2: GLU_CHECK_CALL(glUniform2f(location, ptr[0], ptr[1]));                    break;
                        case 3: GLU_CHECK_CALL(glUniform3f(location, ptr[0], ptr[1], ptr[2]));            break;
                        case 4: GLU_CHECK_CALL(glUniform4f(location, ptr[0], ptr[1], ptr[2], ptr[3]));    break;
                        default:
                            DE_ASSERT(false);
                    }
                }
                else
                {
                    vector<float> buffer(valuesToAssign.size() * typeSize);
                    for (int i = 0; i < (int)buffer.size(); i++)
                        buffer[i] = valuesToAssign[i / typeSize].val.floatV[i % typeSize];

                    DE_STATIC_ASSERT(sizeof(GLfloat) == sizeof(buffer[0]));
                    switch (typeSize)
                    {
                        case 1: GLU_CHECK_CALL(glUniform1fv(location, (GLsizei)valuesToAssign.size(), &buffer[0])); break;
                        case 2: GLU_CHECK_CALL(glUniform2fv(location, (GLsizei)valuesToAssign.size(), &buffer[0])); break;
                        case 3: GLU_CHECK_CALL(glUniform3fv(location, (GLsizei)valuesToAssign.size(), &buffer[0])); break;
                        case 4: GLU_CHECK_CALL(glUniform4fv(location, (GLsizei)valuesToAssign.size(), &buffer[0])); break;
                        default:
                            DE_ASSERT(false);
                    }
                }
            }
            else if (deqpUtils.isDataTypeMatrix(valuesToAssign[0].type))
            {
                DE_ASSERT(!assignByValue);

                vector<float> buffer(valuesToAssign.size() * typeSize);
                for (int i = 0; i < (int)buffer.size(); i++)
                    buffer[i] = valuesToAssign[i / typeSize].val.floatV[i % typeSize];

                DE_STATIC_ASSERT(sizeof(GLfloat) == sizeof(buffer[0]));
                switch (uniform.type)
                {
                    case deqpUtils.DataType.FLOAT_MAT2:        GLU_CHECK_CALL(glUniformMatrix2fv    (location, (GLsizei)valuesToAssign.size(), transposeGL, &buffer[0])); break;
                    case deqpUtils.DataType.FLOAT_MAT3:        GLU_CHECK_CALL(glUniformMatrix3fv    (location, (GLsizei)valuesToAssign.size(), transposeGL, &buffer[0])); break;
                    case deqpUtils.DataType.FLOAT_MAT4:        GLU_CHECK_CALL(glUniformMatrix4fv    (location, (GLsizei)valuesToAssign.size(), transposeGL, &buffer[0])); break;
                    case deqpUtils.DataType.FLOAT_MAT2X3:    GLU_CHECK_CALL(glUniformMatrix2x3fv    (location, (GLsizei)valuesToAssign.size(), transposeGL, &buffer[0])); break;
                    case deqpUtils.DataType.FLOAT_MAT2X4:    GLU_CHECK_CALL(glUniformMatrix2x4fv    (location, (GLsizei)valuesToAssign.size(), transposeGL, &buffer[0])); break;
                    case deqpUtils.DataType.FLOAT_MAT3X2:    GLU_CHECK_CALL(glUniformMatrix3x2fv    (location, (GLsizei)valuesToAssign.size(), transposeGL, &buffer[0])); break;
                    case deqpUtils.DataType.FLOAT_MAT3X4:    GLU_CHECK_CALL(glUniformMatrix3x4fv    (location, (GLsizei)valuesToAssign.size(), transposeGL, &buffer[0])); break;
                    case deqpUtils.DataType.FLOAT_MAT4X2:    GLU_CHECK_CALL(glUniformMatrix4x2fv    (location, (GLsizei)valuesToAssign.size(), transposeGL, &buffer[0])); break;
                    case deqpUtils.DataType.FLOAT_MAT4X3:    GLU_CHECK_CALL(glUniformMatrix4x3fv    (location, (GLsizei)valuesToAssign.size(), transposeGL, &buffer[0])); break;
                    default:
                        DE_ASSERT(false);
                }
            }
            else if (deqpUtils.isDataTypeIntOrIVec(valuesToAssign[0].type))
            {
                if (assignByValue)
                {
                    const deInt32* const ptr = &valuesToAssign[0].val.intV[0];

                    switch (typeSize)
                    {
                        case 1: GLU_CHECK_CALL(glUniform1i(location, ptr[0]));                            break;
                        case 2: GLU_CHECK_CALL(glUniform2i(location, ptr[0], ptr[1]));                    break;
                        case 3: GLU_CHECK_CALL(glUniform3i(location, ptr[0], ptr[1], ptr[2]));            break;
                        case 4: GLU_CHECK_CALL(glUniform4i(location, ptr[0], ptr[1], ptr[2], ptr[3]));    break;
                        default:
                            DE_ASSERT(false);
                    }
                }
                else
                {
                    vector<deInt32> buffer(valuesToAssign.size() * typeSize);
                    for (int i = 0; i < (int)buffer.size(); i++)
                        buffer[i] = valuesToAssign[i / typeSize].val.intV[i % typeSize];

                    DE_STATIC_ASSERT(sizeof(GLint) == sizeof(buffer[0]));
                    switch (typeSize)
                    {
                        case 1: GLU_CHECK_CALL(glUniform1iv(location, (GLsizei)valuesToAssign.size(), &buffer[0])); break;
                        case 2: GLU_CHECK_CALL(glUniform2iv(location, (GLsizei)valuesToAssign.size(), &buffer[0])); break;
                        case 3: GLU_CHECK_CALL(glUniform3iv(location, (GLsizei)valuesToAssign.size(), &buffer[0])); break;
                        case 4: GLU_CHECK_CALL(glUniform4iv(location, (GLsizei)valuesToAssign.size(), &buffer[0])); break;
                        default:
                            DE_ASSERT(false);
                    }
                }
            }
            else if (deqpUtils.isDataTypeUintOrUVec(valuesToAssign[0].type))
            {
                if (assignByValue)
                {
                    const deUint32* const ptr = &valuesToAssign[0].val.uintV[0];

                    switch (typeSize)
                    {
                        case 1: GLU_CHECK_CALL(glUniform1ui(location, ptr[0]));                            break;
                        case 2: GLU_CHECK_CALL(glUniform2ui(location, ptr[0], ptr[1]));                    break;
                        case 3: GLU_CHECK_CALL(glUniform3ui(location, ptr[0], ptr[1], ptr[2]));            break;
                        case 4: GLU_CHECK_CALL(glUniform4ui(location, ptr[0], ptr[1], ptr[2], ptr[3]));    break;
                        default:
                            DE_ASSERT(false);
                    }
                }
                else
                {
                    vector<deUint32> buffer(valuesToAssign.size() * typeSize);
                    for (int i = 0; i < (int)buffer.size(); i++)
                        buffer[i] = valuesToAssign[i / typeSize].val.intV[i % typeSize];

                    DE_STATIC_ASSERT(sizeof(GLuint) == sizeof(buffer[0]));
                    switch (typeSize)
                    {
                        case 1: GLU_CHECK_CALL(glUniform1uiv(location, (GLsizei)valuesToAssign.size(), &buffer[0])); break;
                        case 2: GLU_CHECK_CALL(glUniform2uiv(location, (GLsizei)valuesToAssign.size(), &buffer[0])); break;
                        case 3: GLU_CHECK_CALL(glUniform3uiv(location, (GLsizei)valuesToAssign.size(), &buffer[0])); break;
                        case 4: GLU_CHECK_CALL(glUniform4uiv(location, (GLsizei)valuesToAssign.size(), &buffer[0])); break;
                        default:
                            DE_ASSERT(false);
                    }
                }
            }
            else if (deqpUtils.isDataTypeSampler(valuesToAssign[0].type))
            {
                if (assignByValue)
                    GLU_CHECK_CALL(glUniform1i(location, uniform.finalValue.val.samplerV.unit));
                else
                {
                    const GLint unit = uniform.finalValue.val.samplerV.unit;
                    GLU_CHECK_CALL(glUniform1iv(location, (GLsizei)valuesToAssign.size(), &unit));
                }
            }
            else
                DE_ASSERT(false);
        }
    }

    bool UniformCase::compareUniformValues (const vector<VarValue>& values, const vector<BasicUniform>& basicUniforms)
    {
        TestLog&    log            = m_testCtx.getLog();
        bool        success        = true;

        for (int unifNdx = 0; unifNdx < (int)basicUniforms.size(); unifNdx++)
        {
            const BasicUniform&        uniform        = basicUniforms[unifNdx];
            const VarValue&            unifValue    = values[unifNdx];

            log << TestLog::Message << "// Checking uniform " << uniform.name << TestLog::EndMessage;

            if (unifValue.type == deqpUtils.DataType.INVALID) // This happens when glGetUniformLocation() returned -1.
                continue;

            if (!apiVarValueEquals(unifValue, uniform.finalValue))
            {
                log << TestLog::Message << "// FAILURE: value obtained with glGetUniform*() for uniform " << uniform.name << " differs from value set with glUniform*()" << TestLog::EndMessage;
                success = false;
            }
        }

        return success;
    }

    bool UniformCase::renderTest (const vector<BasicUniform>& basicUniforms, const ShaderProgram& program, Random& rnd)
    {
        TestLog&                    log                = m_testCtx.getLog();
        const tcu::RenderTarget&    renderTarget    = m_context.getRenderTarget();
        const int                    viewportW        = de::min(renderTarget.getWidth(),    MAX_RENDER_WIDTH);
        const int                    viewportH        = de::min(renderTarget.getHeight(),    MAX_RENDER_HEIGHT);
        const int                    viewportX        = rnd.getInt(0, renderTarget.getWidth()        - viewportW);
        const int                    viewportY        = rnd.getInt(0, renderTarget.getHeight()    - viewportH);
        tcu::Surface                renderedImg        (viewportW, viewportH);

        // Assert that no two samplers of different types have the same texture unit - this is an error in GL.
        for (int i = 0; i < (int)basicUniforms.size(); i++)
        {
            if (deqpUtils.isDataTypeSampler(basicUniforms[i].type))
            {
                for (int j = 0; j < i; j++)
                {
                    if (deqpUtils.isDataTypeSampler(basicUniforms[j].type) && basicUniforms[i].type != basicUniforms[j].type)
                        DE_ASSERT(basicUniforms[i].finalValue.val.samplerV.unit != basicUniforms[j].finalValue.val.samplerV.unit);
                }
            }
        }

        for (int i = 0; i < (int)basicUniforms.size(); i++)
        {
            if (deqpUtils.isDataTypeSampler(basicUniforms[i].type) && std::find(m_filledTextureUnits.begin(), m_filledTextureUnits.end(), basicUniforms[i].finalValue.val.samplerV.unit) == m_filledTextureUnits.end())
            {
                log << TestLog::Message << "// Filling texture at unit " << apiVarValueStr(basicUniforms[i].finalValue) << " with color " << shaderVarValueStr(basicUniforms[i].finalValue) << TestLog::EndMessage;
                setupTexture(basicUniforms[i].finalValue);
            }
        }

        GLU_CHECK_CALL(glViewport(viewportX, viewportY, viewportW, viewportH));

        {
            static const float position[] =
            {
                -1.0f, -1.0f, 0.0f, 1.0f,
                -1.0f, +1.0f, 0.0f, 1.0f,
                +1.0f, -1.0f, 0.0f, 1.0f,
                +1.0f, +1.0f, 0.0f, 1.0f
            };
            static const deUint16 indices[] = { 0, 1, 2, 2, 1, 3 };

            const int posLoc = glGetAttribLocation(program.getProgram(), "a_position");
            glEnableVertexAttribArray(posLoc);
            glVertexAttribPointer(posLoc, 4, GL_FLOAT, GL_FALSE, 0, &position[0]);
            GLU_CHECK_CALL(glDrawElements(GL_TRIANGLES, DE_LENGTH_OF_ARRAY(indices), GL_UNSIGNED_SHORT, &indices[0]));
        }

        deqpUtils.readPixels(m_context.getRenderContext(), viewportX, viewportY, renderedImg.getAccess());

        int numFailedPixels = 0;
        for (int y = 0; y < renderedImg.getHeight(); y++)
        {
            for (int x = 0; x < renderedImg.getWidth(); x++)
            {
                if (renderedImg.getPixel(x, y) != tcu::RGBA::white)
                    numFailedPixels += 1;
            }
        }

        if (numFailedPixels > 0)
        {
            log << TestLog::Image("RenderedImage", "Rendered image", renderedImg);
            log << TestLog::Message << "FAILURE: image comparison failed, got " << numFailedPixels << " non-white pixels" << TestLog::EndMessage;
            return false;
        }
        else
        {
            log << TestLog::Message << "Success: got all-white pixels (all uniforms have correct values)" << TestLog::EndMessage;
            return true;
        }
    }

    UniformCase::IterateResult UniformCase::iterate (void)
    {
        Random                            rnd                (deStringHash(getName()) ^ (deUint32)m_context.getTestContext().getCommandLine().getBaseSeed());
        TestLog&                        log                = m_testCtx.getLog();
        vector<BasicUniform>            basicUniforms;
        vector<BasicUniformReportRef>    basicUniformReportsRef;

        {
            int samplerUnitCounter = 0;
            for (int i = 0; i < (int)m_uniformCollection->getNumUniforms(); i++)
                generateBasicUniforms(basicUniforms, basicUniformReportsRef, m_uniformCollection->getUniform(i).type, m_uniformCollection->getUniform(i).name.c_str(), true, samplerUnitCounter, rnd);
        }

        const string                    vertexSource    = generateVertexSource(basicUniforms);
        const string                    fragmentSource    = generateFragmentSource(basicUniforms);
        const ShaderProgram                program            (m_context.getRenderContext(), deqpUtils.makeVtxFragSources(vertexSource, fragmentSource));

        log << program;

        if (!program.isOk())
        {
            m_testCtx.setTestResult(QP_TEST_RESULT_FAIL, "Compile failed");
            return tcuTestCase.stateMachine.IterateResult.STOP;
        }

        GLU_CHECK_CALL(glUseProgram(program.getProgram()));

        const bool success = test(basicUniforms, basicUniformReportsRef, program, rnd);
        m_testCtx.setTestResult(success ? QP_TEST_RESULT_PASS    : QP_TEST_RESULT_FAIL,
                                success ? "Passed"                : "Failed");

        return tcuTestCase.stateMachine.IterateResult.STOP;
    };*/

    /**
     */
    var init = function(){};

    /**
     * Create and execute the test cases
     */
    var run = function() {
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
