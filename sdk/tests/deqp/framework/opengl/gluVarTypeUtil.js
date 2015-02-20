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

define(['framework/opengl/gluVarType.js'], function(gluVarType) {
    'use strict';
	
	// VarType subtype path utilities.
	var VarTypeComponent = (function(type_, index_) {
		
		this.type  = null;
		this.index = VarTypeComponent.s_Type.length;
		
		if (typeof(type_) != 'undefined' && typeof(index) != 'undefined') {
			this.type  = type_;
			this.index = index_;
		}
		
		this.is = (function(other) {
			return this.type == other.type && this.index == other.index;
		});
		this.isnt = (function(other) {
			return this.type != other.type || this.index != other.index;
		});
	});
	VarTypeComponent.s_Type = {
		STRUCT_MEMBER:     0,
		ARRAY_ELEMENT:     1,
		MATRIX_COLUMN:     2,
		VECTOR_COMPONENT:  3
	};

	
	
	// basic usage:
	// 	for (var i = new BasicTypeIterator(type) ; !i.end() ; i.next()) {
	// 		var j = i.getType();
	// 	}
	
	var SubTypeIterator = (function() {
		
		var m_type = null;  // const VarType*
		var m_path = [];    // TypeComponentVector
		
		this.__construct = (function(type) {
			if (type) {
				m_type = type;
				this.findNext();
			}
		});
		
		var removeTraversed = (function() {
			
			while (m_path.length) {
				var curComp     = m_path[m_path.length - 1]; // VarTypeComponent&
				var parentType  = getVarType(m_type, m_path, 0, m_path.length-1); // VarType // TODO: getVarType
				
				if (curComp.type == VarTypeComponent.s_Type.MATRIX_COLUMN) {
					if (!isDataTypeMatrix(parentType.getBasicType())) {
						throw new Error('Isn\'t a matrix.');
					}
					if (curComp.index+1 < getDataTypeMatrixNumColumns(parentType.getBasicType())) {
						break;
					}
						
				} else if (curComp.type == VarTypeComponent.s_Type.VECTOR_COMPONENT) {
					if (!isDataTypeVector(parentType.getBasicType())) {
						throw new Error('Isn\'t a vector.');
					}
					if (curComp.index+1 < getDataTypeScalarSize(parentType.getBasicType())) {
						break;
					}
						
				} else if (curComp.type == VarTypeComponent.s_Type.ARRAY_ELEMENT) {
					if (!parentType.isArrayType()) {
						throw new Error('Isn\'t an array.');
					}
					if (curComp.index+1 < parentType.getArraySize()) {
						break;
					}
						
				} else if (curComp.type == VarTypeComponent.s_Type.STRUCT_MEMBER) {
					if (!parentType.isStructType()) {
						throw new Error('Isn\'t a struct.');
					}
					if (curComp.index+1 < parentType.getStructPtr()->getNumMembers()) {
						break;
					}
						
				}

				m_path.pop();
				
			}
			
		});
		
		var findNext = (function() {
			
			if (m_path.length) {
				// Increment child counter in current level.
				var curComp = m_path[m_path.length - 1]; // VarTypeComponent&
				curComp.index += 1;
			}
			
			for (;;) {
				
				var curType = getVarType(m_type, m_path); // VarType

				if (this.IsExpanded(curType))
					break;

				// Recurse into child type.
				if (curType.isBasicType()) {
					var basicType = curType.getBasicType(); // DataType

					if (isDataTypeMatrix(basicType)) {
						m_path.push(VarTypeComponent(VarTypeComponent.s_Type.MATRIX_COLUMN, 0));
						
					} else if (isDataTypeVector(basicType)) {
						m_path.push(VarTypeComponent(VarTypeComponent.s_Type.VECTOR_COMPONENT, 0));
						
					} else {
						throw new Error("Can't expand scalars - IsExpanded() is buggy.");
						
					}
					
				} else if (curType.isArrayType()) {
					m_path.push(VarTypeComponent(VarTypeComponent.s_Type.ARRAY_ELEMENT, 0));
					
				} else if (curType.isStructType()) {
					m_path.push(VarTypeComponent(VarTypeComponent.s_Type.STRUCT_MEMBER, 0));
					
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
			if (!m_path.empty()) {
				// Remove traversed nodes.
				removeTraversed();

				if (!m_path.empty())
					findNext();
				else
					m_type = null; // Unset type to signal end.
			} else {
				if (!IsExpanded(getVarType(m_type, m_path))) {
					throw new Error("First type was already expanded.");
				}
				m_type = DE_NULL;
			}
		});
		
		this.isExpanded = null;
		
	});
	
	var BasicTypeIterator = (function(type) {
		this.isExpanded = (function () {
			return type.isBasicType();
		});
		this.__construct(type);
	});
	BasicTypeIterator.prototype = new SubTypeIterator();
	
	var VectorTypeIterator = (function(type) {
		this.isExpanded = (function () {
			return type.isBasicType() && isDataTypeScalarOrVector(type.getBasicType()); 
		});
		this.__construct(type);
	});
	VectorTypeIterator.prototype = new SubTypeIterator();
	
	var ScalarTypeIterator = (function(type) {
		this.isExpanded = (function () {
			return type.isBasicType() && isDataTypeScalar(type.getBasicType());
		});
		this.__construct(type);
	});
	ScalarTypeIterator.prototype = new SubTypeIterator();
	
	
	var inBounds = (function(x,a,b) { return a <= x && x < b; });
	
	var isValidTypePath = (function(type, array, begin, end) {
	
		if (typeof(begin) == 'undefined') { begin = 0;            }
		if (typeof(end)   == 'undefined') { begin = array.length; }
	
		var curType  = type; // const VarType*
		var pathIter = begin; // Iterator

		// Process struct member and array element parts of path.
		while (pathIter != end) {
			var element = array[pathIter];
			
			if (element.type == VarTypeComponent.s_Type.STRUCT_MEMBER) {
			
				if (!curType.isStructType() || !inBounds(element.index, 0, curType.getStruct().getNumMembers())) {
					return false;
				}

				curType = curType.getStruct().getMember(element.index).getType();
			
			
			} else if (element.type == VarTypeComponent.s_Type.ARRAY_ELEMENT) {
				if (
					!curType.isArrayType() ||
					(
						curType.getArraySize() != gluVarType.UNSIZED_ARRAY &&
						inBounds(element.index, 0, curType->getArraySize())
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
				pathIter->type == VarTypeComponent.s_Type.MATRIX_COLUMN ||
				pathIter->type == VarTypeComponent.s_Type.VECTOR_COMPONENT
			)) {
				throw new Error("Not a matrix or a vector");
			}

			// Current type should be basic type.
			if (!curType.isBasicType()) {
				return false;
			}

			var basicType = curType.getBasicType(); // DataType

			if (array[pathIter].type == VarTypeComponent.s_Type.MATRIX_COLUMN)
			{
				if (!isDataTypeMatrix(basicType)) {
					return false;
				}

				basicType = getDataTypeFloatVec(getDataTypeMatrixNumRows(basicType));
				++pathIter;
			}

			if (pathIter != end && array[pathIter].type == VarTypeComponent.s_Type.VECTOR_COMPONENT)
			{
				if (!isDataTypeVector(basicType))
					return false;

				basicType = getDataTypeScalarType(basicType);
				++pathIter;
			}
		}

		return pathIter == end;
	});
	
	
	
	var getVarType = (function(type, array, start, end) {
		
		if (typeof(start) == 'undefined') { start = 0;            }
		if (typeof(end)   == 'undefined') { end   = array.length; }
		
		if (!isValidTypePath(type, array, start, end)) {
			throw new Error("Type is invalid");
		}
		
		var curType  = type; // const VarType*
		var element  = null; // Iterator
		var pathIter = 0;
		
		// Process struct member and array element parts of path.
		for (var pathIter = start ; pathIter != end ; ++pathIter) {
			element = array[pathIter];
			
			if (element.type == VarTypeComponent.s_Type.STRUCT_MEMBER) {
				curType = curType.getStruct().getMember(element.index).getType();
				
			} else if (element.type == VarTypeComponent.s_Type.ARRAY_ELEMENT) {
				curType = curType.getElementType();
				
			} else {
				break;
				
			}
		}
		
		if (pathIter != end) {
		
			var basicType = curType.getBasicType(); // DataType
			var precision = curType.getPrecision(); // Precision

			if (element.type == VarTypeComponent.s_Type.MATRIX_COLUMN) {
				basicType = getDataTypeFloatVec(getDataTypeMatrixNumRows(basicType));
				element = array[++pathIter];
			}

			if (pathIter != end && pathIter->type == VarTypeComponent.s_Type.VECTOR_COMPONENT) {
				basicType = getDataTypeScalarType(basicType);
				element = array[++pathIter];
			}
			
			if (pathIter != end) {
				throw new Error();
			}
			return VarType(basicType, precision);
		} else {
			return new VarType(curType);
		}
	});
	
	return {
		BasicTypeIterator:  BasicTypeIterator,
		VectorTypeIterator: VectorTypeIterator,
		ScalarTypeIterator: ScalarTypeIterator,
		
		getVarType: getVarType
	};
	
});
