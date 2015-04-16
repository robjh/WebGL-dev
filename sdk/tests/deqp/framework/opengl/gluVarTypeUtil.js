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
goog.provide('framework.opengl.gluVarTypeUtil');
goog.require('framework.opengl.gluVarType');
goog.require('framework.opengl.gluShaderUtil');


goog.scope(function() {

var gluVarTypeUtil = framework.opengl.gluVarTypeUtil;
var gluVarType = framework.opengl.gluVarType;
var gluShaderUtil = framework.opengl.gluShaderUtil;
    

    gluVarTypeUtil.isNum = (function(c) { return /^[0-9]$/ .test(c); });
    gluVarTypeUtil.isAlpha = (function(c) { return /^[a-zA-Z]$/ .test(c); });
    gluVarTypeUtil.isIdentifierChar = (function(c) { return /^[a-zA-Z0-9_]$/.test(c); });
    gluVarTypeUtil.array_op_equivalent = (function(arr1, arr2) {
        if (arr1.length != arr2.length) return false;
        for (var i = 0; i < arr1.length; ++i) {
            if (arr1[i].isnt(arr2[1])) return false;
        }
        return true;
    });

    /**
     * gluVarTypeUtil.VarTokenizer class.
     * @param {string} str
     * @return {Object}
     */
    gluVarTypeUtil.VarTokenizer = (function(str) {

        var m_str = str;
        var m_token = gluVarTypeUtil.VarTokenizer.s_Token.length;
        var m_tokenStart = 0;
        var m_tokenLen = 0;

        this.getToken = (function() { return m_token; });
        this.getIdentifier = (function() { return m_str.substr(m_tokenStart, m_tokenLen); });
        this.getNumber = (function() { return parseInt(this.getIdentifier()); });
        this.getCurrentTokenStartLocation = (function() { return m_tokenStart; });
        this.getCurrentTokenEndLocation = (function() { return m_tokenStart + m_tokenLen; });

        this.advance = (function() {

            if (m_token == gluVarTypeUtil.VarTokenizer.s_Token.END) {
                throw new Error('No more tokens.');
            }

            m_tokenStart += m_tokenLen;
            m_token = gluVarTypeUtil.VarTokenizer.s_Token.LAST;
            m_tokenLen = 1;

            if (m_tokenStart >= m_str.length) {
                m_token = gluVarTypeUtil.VarTokenizer.s_Token.END;

            } else if (m_str[m_tokenStart] == '[') {
                m_token = gluVarTypeUtil.VarTokenizer.s_Token.LEFT_BRACKET;

            } else if (m_str[m_tokenStart] == ']') {
                m_token = gluVarTypeUtil.VarTokenizer.s_Token.RIGHT_BRACKET;

            } else if (m_str[m_tokenStart] == '.') {
                m_token = gluVarTypeUtil.VarTokenizer.s_Token.PERIOD;

            } else if (gluVarTypeUtil.isNum(m_str[m_tokenStart])) {
                m_token = gluVarTypeUtil.VarTokenizer.s_Token.NUMBER;
                while (gluVarTypeUtil.isNum(m_str[m_tokenStart + m_tokenLen])) {
                    m_tokenLen += 1;
                }

            } else if (gluVarTypeUtil.isIdentifierChar(m_str[m_tokenStart])) {
                m_token = gluVarTypeUtil.VarTokenizer.s_Token.IDENTIFIER;
                while (gluVarTypeUtil.isIdentifierChar(m_str[m_tokenStart + m_tokenLen])) {
                    m_tokenLen += 1;
                }

            } else {
                throw new Error('Unexpected character');
            }

        });

        this.advance();

    });
    gluVarTypeUtil.VarTokenizer.s_Token = {
        IDENTIFIER: 0,
        LEFT_BRACKET: 1,
        RIGHT_BRACKET: 2,
        PERIOD: 3,
        NUMBER: 4,
        END: 5
    };
    gluVarTypeUtil.VarTokenizer.s_Token.length = Object.keys(gluVarTypeUtil.VarTokenizer.s_Token).length;

    /**
     * VarType subtype path utilities class.
     * @param {gluVarTypeUtil.VarTypeComponent.s_Type} type_
     * @param {number} index_
     * @return {Object}
     */
    gluVarTypeUtil.VarTypeComponent = (function(type_, index_) {

        this.type = null;
        this.index = gluVarTypeUtil.VarTypeComponent.s_Type.length;

        if (typeof(type_) != 'undefined' && typeof(index_) != 'undefined') {
            this.type = type_;
            this.index = index_;
        }

        this.is = (function(other) {
            return this.type == other.type && this.index == other.index;
        });
        this.isnt = (function(other) {
            return this.type != other.type || this.index != other.index;
        });
    });

    /**
     * @enum
     */
    gluVarTypeUtil.VarTypeComponent.s_Type = {
        STRUCT_MEMBER: 0,
        ARRAY_ELEMENT: 1,
        MATRIX_COLUMN: 2,
        VECTOR_COMPONENT: 3
    };
    gluVarTypeUtil.VarTypeComponent.s_Type.length = Object.keys(gluVarTypeUtil.VarTypeComponent.s_Type).length;

    /**
     * Type path formatter.
     * @param {gluVarType.VarType} type_
     * @param {Array.<gluVarTypeUtil.VarTypeComponent>} path_
     * @return {Object}
     */
    gluVarTypeUtil.TypeAccessFormat = (function(type_, path_) {
        this.type = type_;
        this.path = path_;
    });

    gluVarTypeUtil.TypeAccessFormat.prototype.toString = function() {
        var curType = this.type;
        var str = '';

        for (var i = 0; i < this.path.length; i++) {
            var iter = this.path[i];
            switch (iter.type) {
                case gluVarTypeUtil.VarTypeComponent.s_Type.ARRAY_ELEMENT:
                    curType = curType.getElementType(); // Update current type.
                    // Fall-through.

                case gluVarTypeUtil.VarTypeComponent.s_Type.MATRIX_COLUMN:
                case gluVarTypeUtil.VarTypeComponent.s_Type.VECTOR_COMPONENT:
                    str += '[' + iter.index + ']';
                    break;

                case gluVarTypeUtil.VarTypeComponent.s_Type.STRUCT_MEMBER:
                {
                    var member = curType.getStruct().getMember(i);
                    str += '.' + member.getName();
                    curType = member.getType();
                    break;
                }

                default:
                   throw new Error('Unrecognized type:' + iter.type);
            }
        }

        return str;
    };

    /** gluVarTypeUtil.SubTypeAccess
     * @param {gluVarType.VarType} type
     * @return {gluVarTypeUtil.SubTypeAccess | gluVarTypeUtil.array_op_equivalent | boolean}
     */
    gluVarTypeUtil.SubTypeAccess = (function(type) {

        this.m_type = null; // VarType
        this.m_path = [];   // TypeComponentVector

        var helper = (function(type, ndx) {
            this.m_path.push(new gluVarTypeUtil.VarTypeComponent(type, ndx));
            if (!this.isValid()) {
                throw new Error;
            }
            return this;
        });

        this.member = (function(ndx) { return helper(gluVarTypeUtil.VarTypeComponent.s_Type.STRUCT_MEMBER); });
        this.element = (function(ndx) { return helper(gluVarTypeUtil.VarTypeComponent.s_Type.ARRAY_ELEMENT); });
        this.column = (function(ndx) { return helper(gluVarTypeUtil.VarTypeComponent.s_Type.MATRIX_COLUMN); });
        this.component = (function(ndx) { return helper(gluVarTypeUtil.VarTypeComponent.s_Type.VECTOR_COMPONENT); });
        this.parent = (function() {
            if (this.m_path.empty()) {
                throw new Error;
            }
            this.m_path.pop();
            return this;
        });

        this.isValid = (function() { return gluVarTypeUtil.isValidTypePath(this.m_type, this.m_path); });
        this.getType = (function() { return gluVarTypeUtil.getVarType(this.m_type, this.m_path); });
        this.getPath = (function() { return this.m_path; });
        this.empty = (function() { return this.m_path.empty(); });
        this.is = (function(other) {
            return (
                gluVarTypeUtil.array_op_equivalent(this.m_path, other.m_path) &&
                this.m_type.is(other.m_type)
            );
        });
        this.isnt = (function(other) {
            return (
                !gluVarTypeUtil.array_op_equivalent(this.m_path, other.m_path) ||
                this.m_type.isnt(other.m_type)
            );
        });

    });

    /**
     * Subtype iterator parent class.
     * basic usage for all child classes:
     *     for (var i = new gluVarTypeUtil.BasicTypeIterator(type) ; !i.end() ; i.next()) {
     *         var j = i.getType();
     *     }
     * To inherit from this base class, use this outside the child's definition:
     *     ChildClass.prototype = new gluVarTypeUtil.SubTypeIterator();
     * @return {Object}
     */
    gluVarTypeUtil.SubTypeIterator = (function() {

        var m_type = null;  // const VarType*
        var m_path = [];    // TypeComponentVector

        var removeTraversed = (function() {

            while (m_path.length) {
                var curComp = m_path[m_path.length - 1]; // gluVarTypeUtil.VarTypeComponent&
                var parentType = gluVarTypeUtil.getVarType(m_type, m_path, 0, m_path.length - 1); // VarType

                if (curComp.type == gluVarTypeUtil.VarTypeComponent.s_Type.MATRIX_COLUMN) {
                    if (!deqpUtils.isDataTypeMatrix(parentType.getBasicType())) {
                        throw new Error('Isn\'t a matrix.');
                    }
                    if (curComp.index + 1 < deqpUtils.getDataTypeMatrixNumColumns(parentType.getBasicType())) {
                        break;
                    }

                } else if (curComp.type == gluVarTypeUtil.VarTypeComponent.s_Type.VECTOR_COMPONENT) {
                    if (!deqpUtils.isDataTypeVector(parentType.getBasicType())) {
                        throw new Error('Isn\'t a vector.');
                    }
                    if (curComp.index + 1 < deqpUtils.getDataTypeScalarSize(parentType.getBasicType())) {
                        break;
                    }

                } else if (curComp.type == gluVarTypeUtil.VarTypeComponent.s_Type.ARRAY_ELEMENT) {
                    if (!parentType.isArrayType()) {
                        throw new Error('Isn\'t an array.');
                    }
                    if (curComp.index + 1 < parentType.getArraySize()) {
                        break;
                    }

                } else if (curComp.type == gluVarTypeUtil.VarTypeComponent.s_Type.STRUCT_MEMBER) {
                    if (!parentType.isStructType()) {
                        throw new Error('Isn\'t a struct.');
                    }
                    if (curComp.index + 1 < parentType.getStruct().getNumMembers()) {
                        break;
                    }

                }

                m_path.pop();
            }

        });

        this.findNext = (function() {

            if (m_path.length > 0) {
                // Increment child counter in current level.
                var curComp = m_path[m_path.length - 1]; // gluVarTypeUtil.VarTypeComponent&
                curComp.index += 1;
            }

            for (;;) {

                var curType = gluVarTypeUtil.getVarType(m_type, m_path); // VarType

                if (this.isExpanded(curType))
                    break;

                // Recurse into child type.
                if (curType.isBasicType()) {
                    var basicType = curType.getBasicType(); // DataType

                    if (deqpUtils.isDataTypeMatrix(basicType)) {
                        m_path.push(new gluVarTypeUtil.VarTypeComponent(gluVarTypeUtil.VarTypeComponent.s_Type.MATRIX_COLUMN, 0));

                    } else if (deqpUtils.isDataTypeVector(basicType)) {
                        m_path.push(new gluVarTypeUtil.VarTypeComponent(gluVarTypeUtil.VarTypeComponent.s_Type.VECTOR_COMPONENT, 0));

                    } else {
                        throw new Error('Cant expand scalars - isExpanded() is buggy.');
                    }

                } else if (curType.isArrayType()) {
                    m_path.push(new gluVarTypeUtil.VarTypeComponent(gluVarTypeUtil.VarTypeComponent.s_Type.ARRAY_ELEMENT, 0));

                } else if (curType.isStructType()) {
                    m_path.push(new gluVarTypeUtil.VarTypeComponent(gluVarTypeUtil.VarTypeComponent.s_Type.STRUCT_MEMBER, 0));

                } else {
                    throw new Error();
                }
            }

        });

        this.end = (function() {
            return (m_type == null);
        });

        // equivelant to operator++(), doesnt return.
        this.next = (function() {
            if (m_path.length > 0) {
                // Remove traversed nodes.
                removeTraversed();

                if (m_path.length > 0)
                    this.findNext();
                else
                    m_type = null; // Unset type to signal end.
            } else {
                if (!this.isExpanded(gluVarTypeUtil.getVarType(m_type, m_path))) {
                    throw new Error('First type was already expanded.');
                }
                m_type = null;
            }
        });

        this.getType = (function() {
            return gluVarTypeUtil.getVarType(m_type, m_path);
        });
        this.getPath = (function() {
            return m_path;
        });

        this.toString = function() {
            var x = new gluVarTypeUtil.TypeAccessFormat(m_type, m_path);
            return x.toString();
        };

        this.__construct = (function(type) {
            if (type) {
                m_type = type;
                this.findNext();
            }
        });

        this.isExpanded = null;

    });

    /** gluVarTypeUtil.BasicTypeIterator
     * @param {gluVarType.VarType} type
     * @return {gluVarType.Type}
     */
    gluVarTypeUtil.BasicTypeIterator = (function(type) {
        this.isExpanded = (function(type) {
            return type.isBasicType();
        });
        this.__construct(type);
    });
    gluVarTypeUtil.BasicTypeIterator.prototype = new gluVarTypeUtil.SubTypeIterator();

    /** gluVarTypeUtil.VectorTypeIterator
     * @param {gluVarType.VarType} type
     * @return {gluVarType.Type}
     */
    gluVarTypeUtil.VectorTypeIterator = (function(type) {
        this.isExpanded = (function(type) {
            return type.isBasicType() && deqpUtils.isDataTypeScalarOrVector(type.getBasicType());
        });
        this.__construct(type);
    });
    gluVarTypeUtil.VectorTypeIterator.prototype = new gluVarTypeUtil.SubTypeIterator();

    /** gluVarTypeUtil.ScalarTypeIterator
     * @param {gluVarType.VarType} type
     * @return {gluVarType.Type}
     */
    gluVarTypeUtil.ScalarTypeIterator = (function(type) {
        this.isExpanded = (function(type) {
            return type.isBasicType() && deqpUtils.isDataTypeScalar(type.getBasicType());
        });
        this.__construct(type);
    });
    gluVarTypeUtil.ScalarTypeIterator.prototype = new gluVarTypeUtil.SubTypeIterator();

    gluVarTypeUtil.inBounds = (function(x, a, b) { return a <= x && x < b; });

    /** gluVarTypeUtil.isValidTypePath
     * @param {gluVarType.VarType} type
     * @param {Array.<gluVarTypeUtil.VarTypeComponent>} array
     * @param {number} begin
     * @param {number} end
     * @return {boolean}
     */
    gluVarTypeUtil.isValidTypePath = (function(type, array, begin, end) {

        if (typeof(begin) == 'undefined') {begin = 0;}
        if (typeof(end) == 'undefined') {begin = array.length;}

        var curType = type; // const VarType*
        var pathIter = begin; // Iterator

        // Process struct member and array element parts of path.
        while (pathIter != end) {
            var element = array[pathIter];

            if (element.type == gluVarTypeUtil.VarTypeComponent.s_Type.STRUCT_MEMBER) {

                if (!curType.isStructType() || !gluVarTypeUtil.inBounds(element.index, 0, curType.getStruct().getNumMembers())) {
                    return false;
                }

                curType = curType.getStruct().getMember(element.index).getType();

            } else if (element.type == gluVarTypeUtil.VarTypeComponent.s_Type.ARRAY_ELEMENT) {
                if (
                    !curType.isArrayType() ||
                    (
                        curType.getArraySize() != gluVarType.UNSIZED_ARRAY &&
                        !gluVarTypeUtil.inBounds(element.index, 0, curType.getArraySize())
                    )
                ) {
                    return false;
                }

                curType = curType.getElementType();
            } else {
                break;
            }

            ++pathIter;
        }

        if (pathIter != end) {
            if (!(
                array[pathIter].type == gluVarTypeUtil.VarTypeComponent.s_Type.MATRIX_COLUMN ||
                array[pathIter].type == gluVarTypeUtil.VarTypeComponent.s_Type.VECTOR_COMPONENT
            )) {
                throw new Error('Not a matrix or a vector');
            }

            // Current type should be basic type.
            if (!curType.isBasicType()) {
                return false;
            }

            var basicType = curType.getBasicType(); // DataType

            if (array[pathIter].type == gluVarTypeUtil.VarTypeComponent.s_Type.MATRIX_COLUMN)
            {
                if (!deqpUtils.isDataTypeMatrix(basicType)) {
                    return false;
                }

                basicType = deqpUtils.getDataTypeFloatVec(deqpUtils.getDataTypeMatrixNumRows(basicType));
                ++pathIter;
            }

            if (pathIter != end && array[pathIter].type == gluVarTypeUtil.VarTypeComponent.s_Type.VECTOR_COMPONENT)
            {
                if (!deqpUtils.isDataTypeVector(basicType))
                    return false;

                basicType = deqpUtils.getDataTypeScalarType(basicType);
                ++pathIter;
            }
        }

        return pathIter == end;
    });

    /** gluVarTypeUtil.getVarType
     * @param {gluVarType.VarType} type
     * @param {Array.<gluVarTypeUtil.VarTypeComponent>} array
     * @param {number} start
     * @param {number} end
     * @return {gluVarType.VarType}
     */
    gluVarTypeUtil.getVarType = (function(type, array, start, end) {

        if (typeof(start) == 'undefined') {start = 0;}
        if (typeof(end) == 'undefined') {end = array.length;}

        if (!gluVarTypeUtil.isValidTypePath(type, array, start, end)) {
            throw new Error('Type is invalid');
        }

        var curType = type; // const VarType*
        var element = null; // Iterator
        var pathIter = 0;

        // Process struct member and array element parts of path.
        for (pathIter = start; pathIter != end; ++pathIter) {
            element = array[pathIter];

            if (element.type == gluVarTypeUtil.VarTypeComponent.s_Type.STRUCT_MEMBER) {
                curType = curType.getStruct().getMember(element.index).getType();

            } else if (element.type == gluVarTypeUtil.VarTypeComponent.s_Type.ARRAY_ELEMENT) {
                curType = curType.getElementType();

            } else {
                break;

            }
        }

        if (pathIter != end) {

            var basicType = curType.getBasicType(); // DataType
            var precision = curType.getPrecision(); // Precision

            if (element.type == gluVarTypeUtil.VarTypeComponent.s_Type.MATRIX_COLUMN) {
                basicType = deqpUtils.getDataTypeFloatVec(deqpUtils.getDataTypeMatrixNumRows(basicType));
                element = array[++pathIter];
            }

            if (pathIter != end && pathIter.type == gluVarTypeUtil.VarTypeComponent.s_Type.VECTOR_COMPONENT) {
                basicType = deqpUtils.getDataTypeScalarType(basicType);
                element = array[++pathIter];
            }

            if (pathIter != end) {
                throw new Error();
            }
            return gluVarType.newTypeBasic(basicType, precision);
        } else {
            /* TODO: Original code created an object copy. We are returning reference to the same object */
            return curType;
        }
    });

    gluVarTypeUtil.parseVariableName = (function(nameWithPath) {
        var tokenizer = new gluVarTypeUtil.VarTokenizer(nameWithPath);
        if (tokenizer.getToken() != gluVarTypeUtil.VarTokenizer.s_Token.IDENTIFIER) {
            throw new Error('Not an identifier.');
        }
        return tokenizer.getIdentifier();
    });

    // returns an array (TypeComponentVector& path)
    // params: const char*, const VarType&
    gluVarTypeUtil.parseTypePath = (function(nameWithPath, type) {

        var tokenizer = new gluVarTypeUtil.VarTokenizer(nameWithPath);

        if (tokenizer.getToken() == gluVarTypeUtil.VarTokenizer.s_Token.IDENTIFIER) {
            tokenizer.advance();
        }

        var path = [];

        while (tokenizer.getToken() != gluVarTypeUtil.VarTokenizer.s_Token.END) {

            var curType = gluVarTypeUtil.getVarType(type, path);

            if (tokenizer.getToken() == gluVarTypeUtil.VarTokenizer.s_Token.PERIOD) {

                tokenizer.advance();
                if (tokenizer.getToken() != gluVarTypeUtil.VarTokenizer.s_Token.IDENTIFIER) {
                    throw new Error();
                }
                if (!curType.isStructType()) {
                    throw new Error('Invalid field selector');
                }

                // Find member.
                var memberName = tokenizer.getIdentifier();
                var ndx = 0;
                for (; ndx < curType.getStruct().getSize(); ++ndx) {

                    if (memberName == curType.getStruct().getMember(ndx).getName()) {
                        break;
                    }

                }
                if (ndx >= curType.getStruct().getSize()) {
                    throw new Error('Member not found in type: ' + memberName);
                }

                path.push(gluVarTypeUtil.VarTypeComponent(gluVarTypeUtil.VarTypeComponent.s_Type.STRUCT_MEMBER, ndx));
                tokenizer.advance();

            } else if (tokenizer.getToken() == gluVarTypeUtil.VarTokenizer.s_Token.LEFT_BRACKET) {

                tokenizer.advance();
                if (tokenizer.getToken() != gluVarTypeUtil.VarTokenizer.s_Token.TOKEN_NUMBER) {
                    throw new Error();
                }

                var ndx = tokenizer.getNumber();

                if (curType.isArrayType()) {
                    if (!gluVarTypeUtil.inBounds(ndx, 0, curType.getArraySize())) throw new Error;
                    path.push(gluVarTypeUtil.VarTypeComponent(gluVarTypeUtil.VarTypeComponent.s_Type.ARRAY_ELEMENT, ndx));

                } else if (curType.isBasicType() && deqpUtils.isDataTypeMatrix(curType.getBasicType())) {
                    if (!gluVarTypeUtil.inBounds(ndx, 0, deqpUtils.getDataTypeMatrixNumColumns(curType.getBasicType()))) throw new Error;
                    path.push(gluVarTypeUtil.VarTypeComponent(gluVarTypeUtil.VarTypeComponent.s_Type.MATRIX_COLUMN, ndx));

                } else if (curType.isBasicType() && deqpUtils.isDataTypeVector(curType.getBasicType())) {
                    if (!gluVarTypeUtil.inBounds(ndx, 0, deqpUtils.getDataTypeScalarSize(curType.getBasicType()))) throw new Error;
                    path.push(gluVarTypeUtil.VarTypeComponent(gluVarTypeUtil.VarTypeComponent.s_Type.VECTOR_COMPONENT, ndx));

                } else {
                    //TCU_FAIL
                    throw new Error('Invalid subscript');
                }

                tokenizer.advance();
                if (tokenizer.getToken() != gluVarTypeUtil.VarTokenizer.s_Token.RIGHT_BRACKET) {
                    throw new Error('Expected token RIGHT_BRACKET');
                }
                tokenizer.advance();

            } else {
                // TCU_FAIL
                throw new Error('Unexpected token');
            }
        }

        return path;

    });

    

});
