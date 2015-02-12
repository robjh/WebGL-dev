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


define(function() {
    'use strict';

    /**
    * VarType types enum
    * @enum {number}
    */
    var Type = {
       TYPE_BASIC: 0,
       TYPE_ARRAY: 1,
       TYPE_STRUCT: 2
    };

    Type.TYPE_LAST = Object.keys(Type).length;

    /**
    * TypeArray struct
    * @param {VarType} elementType
    * @param {number} arraySize
    */
    var TypeArray = function(elementType, arraySize) {
       /** @type {VarType} */ this.elementType = elementType;
       /** @type {number} */ this.size = arraySize;
    };

    /**
    * VarType class
    */
    var VarType = function() {
       /** @type {Type} */ this.m_type = Type.TYPE_LAST;
       /** @type {deInt32.deUint32} */ this.m_flags = 0;

       /*
        * m_data used to be a 'Data' union in C++. Using a var is enough here.
        * it will contain any necessary value.
        */
       /** @type {(deqpUtils.DataType|TypeArray|StructType)} */
       this.m_data = undefined;
    };

    /**
    * Creates a basic type VarType. Use this after the constructor call.
    * @param {deqpUtils.DataType} basicType
    * @param {deInt32.deUint32} flags
    * @return {VarType} The currently modified object
    */
    VarType.prototype.VarTypeBasic = function(basicType, flags) {
       this.m_type = Type.TYPE_BASIC;
       this.m_flags = flags;
       this.m_data = basicType;

       return this;
    };

    /**
    * Creates an array type VarType. Use this after the constructor call.
    * @param {VarType} elementType
    * @param {number} arraySize
    * @return {VarType} The currently modified object
    */
    VarType.prototype.VarTypeArray = function(elementType, arraySize) {
       this.m_type = Type.TYPE_ARRAY;
       this.m_flags = 0;
       this.m_data = new TypeArray(elementType, arraySize);

       return this;
    };

    /**
    * Creates a struct type VarType. Use this after the constructor call.
    * @param {StructType} structPtr
    * @return {VarType} The currently modified object
    */
    VarType.prototype.VarTypeStruct = function(structPtr) {
       this.m_type = Type.TYPE_STRUCT;
       this.m_flags = 0;
       this.m_data = structPtr;

       return this;
    };

    /** isBasicType
    * @return {boolean} true if the VarType represents a basic type.
    **/
    VarType.prototype.isBasicType = function() {
       return this.m_type == Type.TYPE_BASIC;
    };

    /** isArrayType
    * @return {boolean} true if the VarType represents an array.
    **/
    VarType.prototype.isArrayType = function() {
       return this.m_type == Type.TYPE_ARRAY;
    };

    /** isStructType
    * @return {boolean} true if the VarType represents a struct.
    **/
    VarType.prototype.isStructType = function() {
       return this.m_type == Type.TYPE_STRUCT;
    };

    /** getFlags
    * @return {deUint32} returns the flags of the VarType.
    **/
    VarType.prototype.getFlags = function() {
       return this.m_flags;
    };

    /** getBasicType
    * @return {deqpUtils.DataType} returns the basic data type of the VarType.
    **/
    VarType.prototype.getBasicType = function() {
       return this.m_data;
    };

    /** getElementType
    * @return {VarType} returns the VarType of the element in case of an Array.
    **/
    VarType.prototype.getElementType = function() {
       return this.m_data.elementType;
    };

    /** getArraySize
    * (not to be confused with a javascript array)
    * @return {number} returns the size of the array in case it is an array.
    **/
    VarType.prototype.getArraySize = function() {
       return this.m_data.size;
    };

    /** getStruct
    * @return {StructType} returns the structure when it is a StructType.
    **/
    VarType.prototype.getStruct = function() {
       return this.m_data;
    };

    /**
     * Creates a basic type VarType.
     * @param {deqpUtils.DataType} basicType
     * @param {deInt32.deUint32} flags
     * @return {VarType}
     */
    var newTypeBasic = function(basicType, flags) {
       return new VarType().VarTypeBasic(basicType, flags);
    };

    /**
    * Creates an array type VarType.
    * @param {VarType} elementType
    * @param {number} arraySize
    * @return {VarType}
    */
    var newTypeArray = function(elementType, arraySize) {
       return new VarType().VarTypeArray(elementType, arraySize);
    };

    /**
    * Creates a struct type VarType.
    * @param {StructType} structPtr
    * @return {VarType}
    */
    var newTypeStruct = function(structPtr) {
        return new VarType().VarTypeStruct(structPtr);
    };


    return {
        Type: Type,
        VarType: VarType,
        newTypeBasic: newTypeBasic,
        newTypeArray: newTypeArray,
        newTypeStruct: newTypeStruct
    };
});
