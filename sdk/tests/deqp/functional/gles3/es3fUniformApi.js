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
    'framework/opengl/gluVarType',
    'framework/common/tcuTestCase',
    'framework/common/tcuTexture',
    'framework/delibs/debase/deMath',
    'framework/delibs/debase/deRandom'], function(
        deqpUtils,
        gluVT,
        deqpTests,
        tcuTexture,
        deMath,
        deRandom) {
    'use strict';

    /** @callback dataTypePredicate
     * @param {deqpUtils.DataType}
     * @return {boolean}
     */
    var dataTypePredicate;

    /** @type {number} */ var MAX_RENDER_WIDTH = 32;
    /** @type {number} */ var MAX_RENDER_HEIGHT = 32;
    /** @type {number} */ var MAX_NUM_SAMPLER_UNIFORMS = 16;

    /** @type {Array.<deqpUtils.DataType>} */ var s_testDataTypes =
    [
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
     * @param {deqpUtils.DataType} t
     * @return {boolean}
     */
    var dataTypeIsMatrixWithNRows = function(t) {
        return deqpUtils.isDataTypeMatrix(t) && deqpUtils.getDataTypeMatrixNumRows(t) == N;
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
        /** @type {Array.{Uniform}} */ this.m_uniforms = [];
        /** @type {Array.<gluVT.StructType>} */ this.m_structTypes = [];
        

    private:
        // \note Copying these would be cumbersome, since deep-copying both m_uniforms and m_structTypes
        // would mean that we'd need to update pointers from uniforms to point to the new structTypes.
        // When the same UniformCollection is needed in several places, a SharedPtr is used instead.
                                    UniformCollection    (const UniformCollection&); // Not allowed.
        UniformCollection&            operator=            (const UniformCollection&); // Not allowed.
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
        return getSamplerTypes().length > 1;
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

        /** @type {gluVT.StructType} */ var structType = new StructType("structType" + nameSuffix);
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
        /** @type {UniformCollection} */ var res = basicStruct(type0, type1, containsArrays, nameSuffix);
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
            /** @type {UniformCollection} */ var sub = basic(types[i], ("_" + i + nameSuffix);
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
            /** @type {UniformCollection} */ var sub = basicArray(types[i], "_" + i + nameSuffix);
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

        DE_STATIC_ASSERT(types0.length) == types1.length);

        for (var i = 0; i < types0.length; i++)
        {
            /** @type {UniformCollection} */ var sub = nestedArraysStructs(types0[i], types1[i], "_" + i + nameSuffix);
            sub.moveContents(res);
        }

        return res;
    };

    /**
     * @param {deMath.deUint32} seed
     * @return {UniformCollection}
     */
    UniformCollection.prototype.random = function(seed) {
        /** @type {deRandom.Random} */ var rnd = new deRandom.Random(seed);
        /** @type {number} */ var numUniforms    = rnd.getInt(1, 5);
        /** @type {number} */ var structIdx    = 0;
        /** @type {UniformCollection} */ var res = new UniformCollection();

        for (var i = 0; i < numUniforms; i++)
        {
            /** @type {Array.<gluVT.StructType>} */ var structTypes = [];
            /** @type {Uniform} */ var uniform = new Uniform("u_var" + i, deqpUtils.VarType());

            // \note Discard uniforms that would cause number of samplers to exceed MAX_NUM_SAMPLER_UNIFORMS.
            do
            {
                structTypes.clear();
                uniform.type = (("u_var" + i, generateRandomType(3, structIdx, structTypes, rnd));
            } while (res.getNumSamplers() + getNumSamplersInType(uniform.type) > MAX_NUM_SAMPLER_UNIFORMS);

            res.addUniform(uniform);
            for (var j = 0; j < structTypes.length; j++)
                res.addStructType(structTypes[j]);
        }

        return res;
    };

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
