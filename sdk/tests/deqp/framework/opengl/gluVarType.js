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

'use strict';
goog.provide('framework.opengl.gluVarType');
goog.require('framework.opengl.gluShaderUtil');


goog.scope(function() {

var gluVarType = framework.opengl.gluVarType;
var gluShaderUtil = framework.opengl.gluShaderUtil;
    

    var DE_ASSERT = function(x) {
        if (!x)
            throw new Error('Assert failed');
    };

    /**
    * gluVarType.VarType types enum
    * @enum {number}
    */
    gluVarType.Type = {
       TYPE_BASIC: 0,
       TYPE_ARRAY: 1,
       TYPE_STRUCT: 2
    };

    /**
    * gluVarType.TypeArray struct
    * @param {gluVarType.VarType} elementType
    * @param {number} arraySize
    */
    gluVarType.TypeArray = function(elementType, arraySize) {
       /** @type {gluVarType.VarType} */ this.elementType = elementType;
       /** @type {number} */ this.size = arraySize;
    };

    /**
    * gluVarType.VarType class
    */
    gluVarType.VarType = function() {
       /** @type {gluVarType.Type} */ this.m_type = undefined;
       /** @type {deMath.deUint32} */ this.m_flags = 0;

       /*
        * m_data used to be a 'Data' union in C++. Using a var is enough here.
        * it will contain any necessary value.
        */
       /** @type {(deqpUtils.DataType|gluVarType.TypeArray|gluVarType.StructType)} */
       this.m_data = undefined;
    };

    gluVarType.VarType.UNSIZED_ARRAY = -1;

    /**
    * Creates a basic type gluVarType.VarType. Use this after the constructor call.
    * @param {deqpUtils.DataType} basicType
    * @param {deMath.deUint32} flags
    * @return {gluVarType.VarType} The currently modified object
    */
    gluVarType.VarType.prototype.VarTypeBasic = function(basicType, flags) {
       this.m_type = gluVarType.Type.TYPE_BASIC;
       this.m_flags = flags;
       this.m_data = basicType;

       return this;
    };

    /**
    * Creates an array type gluVarType.VarType. Use this after the constructor call.
    * @param {gluVarType.VarType} elementType
    * @param {number} arraySize
    * @return {gluVarType.VarType} The currently modified object
    */
    gluVarType.VarType.prototype.VarTypeArray = function(elementType, arraySize) {
       this.m_type = gluVarType.Type.TYPE_ARRAY;
       this.m_flags = 0;
       this.m_data = new gluVarType.TypeArray(elementType, arraySize);

       return this;
    };

    /**
    * Creates a struct type gluVarType.VarType. Use this after the constructor call.
    * @param {gluVarType.StructType} structPtr
    * @return {gluVarType.VarType} The currently modified object
    */
    gluVarType.VarType.prototype.VarTypeStruct = function(structPtr) {
       this.m_type = gluVarType.Type.TYPE_STRUCT;
       this.m_flags = 0;
       this.m_data = structPtr;

       return this;
    };

    /** isBasicType
    * @return {boolean} true if the gluVarType.VarType represents a basic type.
    */
    gluVarType.VarType.prototype.isBasicType = function() {
       return this.m_type == gluVarType.Type.TYPE_BASIC;
    };

    /** isArrayType
    * @return {boolean} true if the gluVarType.VarType represents an array.
    */
    gluVarType.VarType.prototype.isArrayType = function() {
       return this.m_type == gluVarType.Type.TYPE_ARRAY;
    };

    /** isStructType
    * @return {boolean} true if the gluVarType.VarType represents a struct.
    */
    gluVarType.VarType.prototype.isStructType = function() {
       return this.m_type == gluVarType.Type.TYPE_STRUCT;
    };

    /** getFlags
    * @return {deUint32} returns the flags of the gluVarType.VarType.
    */
    gluVarType.VarType.prototype.getFlags = function() {
       return this.m_flags;
    };

    /** getBasicType
    * @return {deqpUtils.DataType} returns the basic data type of the gluVarType.VarType.
    */
    gluVarType.VarType.prototype.getBasicType = function() {
       return this.m_data;
    };

    /** getElementType
    * @return {gluVarType.VarType} returns the gluVarType.VarType of the element in case of an Array.
    */
    gluVarType.VarType.prototype.getElementType = function() {
       return this.m_data.elementType;
    };

    /** getArraySize
    * (not to be confused with a javascript array)
    * @return {number} returns the size of the array in case it is an array.
    */
    gluVarType.VarType.prototype.getArraySize = function() {
       return this.m_data.size;
    };

    /** getStruct
    * @return {gluVarType.StructType} returns the structure when it is a gluVarType.StructType.
    */
    gluVarType.VarType.prototype.getStruct = function() {
       return this.m_data;
    };

    /** getPrecision
    * @return {gluVarType.StructType} returns the precision flag name.
    */
    gluVarType.VarType.prototype.getPrecision = function() {
        return this.m_flags;
     };

    /**
    * getScalarSize
    * @return {number} size of the scalar
    */
    gluVarType.VarType.prototype.getScalarSize = function() {
        switch (this.m_type)
        {
            case gluVarType.Type.TYPE_BASIC:
            {
                return deqpUtils.getDataTypeScalarSize(this.getBasicType());
            }

            // TODO: check implementation below: return m_data.array.elementType->getScalarSize()*m_data.array.size;
            case gluVarType.Type.TYPE_ARRAY:
            {
                /** @type {gluVarType.TypeArray} */ var m_data = this.m_data;
                return m_data.elementType.getScalarSize() * m_data.size;
            }

            case gluVarType.Type.TYPE_STRUCT:
            {
                var size = 0;

                /** @type {gluVarType.StructType} */ var struct = this.m_data;

                // TODO: check loop conditions below
                // for (gluVarType.StructType::ConstIterator iter = m_data.structPtr->begin(); iter != m_data.structPtr->end(); iter++)
                for (var iter = 0; struct.m_members[iter] < struct.getSize; iter++)
                    size += struct.getMember(iter).m_type.getScalarSize();
                return size;
            }

            default:
                // DE_ASSERT(false);
                return 0;
        }
    };

    /**
    * is
    * @return {bool} returns true if the current object is equivalent to other.
    */
    gluVarType.VarType.prototype.is = function(other) {
        if (this.m_type != other.m_type)
            return false;

        switch (this.m_type)
        {
            case gluVarType.Type.TYPE_BASIC:
                return this.m_data.type == other.m_data.type &&
                       this.m_data.precision == other.m_data.precision;

            case gluVarType.Type.TYPE_ARRAY:
                return this.m_data.elementType == other.m_data.elementType &&
                       this.m_data.size == other.m_data.size;

            case gluVarType.Type.TYPE_STRUCT:
                return this.m_data === other.m_data;

            default:
            //    DE_ASSERT(false);
                return false;
        }
    };

    /**
    * isnt
    * @return {bool} returns true if the current object is not equivalent to other.
    */
    gluVarType.VarType.prototype.isnt = function(other) {
        return !(this.is(other));
    };

    /**
     * Creates a basic type gluVarType.VarType.
     * @param {deqpUtils.DataType} basicType
     * @param {deMath.deUint32} flags
     * @return {gluVarType.VarType}
     */
    gluVarType.newTypeBasic = function(basicType, flags) {
       return new gluVarType.VarType().VarTypeBasic(basicType, flags);
    };

    /**
    * Creates an array type gluVarType.VarType.
    * @param {gluVarType.VarType} elementType
    * @param {number} arraySize
    * @return {gluVarType.VarType}
    */
    gluVarType.newTypeArray = function(elementType, arraySize) {
       return new gluVarType.VarType().VarTypeArray(elementType, arraySize);
    };

    /**
    * Creates a struct type gluVarType.VarType.
    * @param {gluVarType.StructType} structPtr
    * @return {gluVarType.VarType}
    */
    gluVarType.newTypeStruct = function(structPtr) {
        return new gluVarType.VarType().VarTypeStruct(structPtr);
    };

    /**
     * gluVarType.StructMember class
     */
     gluVarType.StructMember = function() {
        /** @type {string} */ this.m_name;
        /** @type {gluVarType.VarType} */ this.m_type;
        /** @type {deMath.deUint32} */ // this.m_flags = 0; // only in glsUniformBlockCase
     };

     /**
      * Creates a gluVarType.StructMember. Use this after the constructor call.
      * @param {string} name
      * @param {gluVarType.VarType} type
      * @return {gluVarType.StructMember} The currently modified object
      */
      gluVarType.StructMember.prototype.Constructor = function(name, type) {
         this.m_type = type;
         this.m_name = name;
         // this.m_flags = flags; // only in glsUniformBlockCase

         return this;
      };

      /** getName
       * @return {string} name of the gluVarType.StructMember object.
       */
      gluVarType.StructMember.prototype.getName = function() {
          return this.m_name;
       };

      /** getType
       * @return {string} type of the gluVarType.StructMember object.
       */
      gluVarType.StructMember.prototype.getType = function() {
           return this.m_type;
        };

      /**  only in glsUniformBlockCase! getFlags
      * @return {deMath.deUint32} the flags in the member
      */
      gluVarType.StructMember.prototype.getFlags = function() { return this.m_flags; };

      /**
       * Creates a gluVarType.StructMember.
       * @param {string} name
       * @param {gluVarType.VarType} type
       * @return {gluVarType.StructMember}
       */
       gluVarType.newStructMember = function(name, type) {
           return new gluVarType.StructMember().Constructor(name, type);
       };

     /**
      * gluVarType.StructType class
      */
      gluVarType.StructType = function() {
         /** @type {string} */ this.m_typeName = undefined;
         /** @type {Array.<gluVarType.StructMember>} */ this.m_members = [];
      };

    /**
     * Creates a gluVarType.StructType. Use this after the constructor call.
     * @param {string} name
     * @return {gluVarType.StructType} The currently modified object
     */
      gluVarType.StructType.prototype.Constructor = function(name) {
          /** @type {string}*/ this.m_typeName = this.setTypeName(name);
          return this;
     };

     /** hasTypeName
      * Checks if the gluVarType.StructType m_typeName is defined
      * @return {boolean}
      **/
      gluVarType.StructType.prototype.hasTypeName = function() {
         return (this.m_typeName !== 'undefined');
     };

     /** setTypeName
      * @param {string} name
      * @return {string} returns gluVarType.StructType.m_typeName
      **/
      gluVarType.StructType.prototype.setTypeName = function(name) {
         return this.m_typeName = name;
     };

     /** getTypeName
     * @return {string}
     **/
     gluVarType.StructType.prototype.getTypeName = function() {
         return this.m_typeName;
     };

     /** getNumMembers
     * @return {number}
     **/
     gluVarType.StructType.prototype.getNumMembers = function() {
         return this.m_members.length;
     };

     /** getMember
     * @param {number} memberNdx The index of the member to retrieve.
     * @return {gluVarType.StructMember}
     **/
     gluVarType.StructType.prototype.getMember = function(memberNdx) {
         if (memberNdx >= 0 && memberNdx < this.m_members.length)
             return this.m_members[memberNdx];
         else {
             bufferedLogToConsole('Error: Invalid member index for StructTypes members');
             return undefined;
         }
     };

     /** getSize
     * @return {number} The size of the m_members array.
     **/
     gluVarType.StructType.prototype.getSize = function() {
         return this.m_members.length;
     };

     /** addMember
     * @param {string} name
     * @param {gluVarType.VarType} type
     **/
     gluVarType.StructType.prototype.addMember = function(name, type) {
        var member = gluVarType.newStructMember(name, type);
         this.m_members.push(member);
     };

     /**
      * Creates a gluVarType.StructType.
      * @param {string} name
      * @return {gluVarType.StructType}
      */
      gluVarType.newStructType = function(name) {
          return new gluVarType.StructType().Constructor(name);
      };

      /**
       * @param {number} level
       * @return {string}
       */
    gluVarType.indent = function(level) {
        /** @type {string} */ var str = '';
        for (var i = 0; i < level; i++)
            str += '\t';
        return str;
    };

    /**
     * @param {gluVarType.VarType} varType
     * @param {string} name
     * @param {number} level
     * @return {string}
     */
    gluVarType.declareVariable = function(varType, name, level) {
        /** @type {string} */ var str = '';
        /** @type {gluVarType.VarType} */ var type = varType;
        /** @type {gluVarType.VarType} */ var curType = type;
        /** @type {Array.<number>} */ var arraySizes = [];

        // Handle arrays.
        while (curType.isArrayType())
        {
            arraySizes.push(curType.getArraySize());
            curType = curType.getElementType();
        }

        if (curType.isBasicType())
        {
            if (curType.getPrecision() !== undefined)
                str += deqpUtils.getPrecisionName(curType.getPrecision()) + ' ';
            str += deqpUtils.getDataTypeName(curType.getBasicType());
        }
        else if (curType.isStructType())
        {
            /** @type {gluVarType.StructType} */ var structPtr = curType.getStruct();

            if (structPtr.hasTypeName())
                str += structPtr.getTypeName();
            else
                str += gluVarType.declareStructType(structPtr, level); // Generate inline declaration.
        }
        else
            DE_ASSERT(false);

        str += ' ' + name;

        // Print array sizes.
        for (var size = 0; size < arraySizes.length; size++)//std::vector<int>::const_iterator sizeIter = arraySizes.begin(); sizeIter != arraySizes.end(); sizeIter++)
        {
            /** @type {number} */ var arrSize = arraySizes[size];
            if (arrSize == gluVarType.VarType.UNSIZED_ARRAY)
                str += '[]';
            else
                str += '[' + arrSize + ']';
        }

        return str;
    };

    /**
     * @param {gluVarType.StructType} structType
     * @param {number} level
     * @return {string}
     */
    gluVarType.declareStructType = function(structType, level_) {
        /** @type {string} */ var str = 'struct';
        var level = level_ || 0;

        // gluVarType.Type name is optional.
        if (structType.hasTypeName())
            str += ' ' + structType.getTypeName();

        str += '\n' + gluVarType.indent(level) + '{\n';

        for (var memberNdx = 0; memberNdx < structType.getSize(); memberNdx++)//gluVarType.StructType::ConstIterator memberIter = decl.structPtr->begin(); memberIter != decl.structPtr->end(); memberIter++)
        {
            /** @type {gluVarType.StructMember} */ var memberIter = structType.getMember(memberNdx);
            str += gluVarType.indent(level + 1);
            str += gluVarType.declareVariable(memberIter.getType(), memberIter.getName(), level + 1) + ';\n';
        }

        str += gluVarType.indent(level) + '}';

        return str;
    };

    
});
