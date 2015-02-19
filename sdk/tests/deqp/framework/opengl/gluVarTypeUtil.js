define([], function() {
    'use strict';
	
	// VarType subtype path utilities.
	var VarTypeComponent = (function(type_, index_) {
		
		this.type  = null;
		this.index = 4;
		
		if (typeof(type_) != 'undefined' && typeof(index) != 'undefined') {
			this.type =  type_;
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

	
	
	template <typename Iterator>
	VarType getVarType (const VarType& type, Iterator begin, Iterator end)
	{
		TCU_CHECK(isValidTypePath(type, begin, end));

		const VarType*	curType		= &type;
		Iterator		pathIter	= begin;

		// Process struct member and array element parts of path.
		while (pathIter != end)
		{
			if (pathIter->type == VarTypeComponent::STRUCT_MEMBER)
				curType = &curType->getStructPtr()->getMember(pathIter->index).getType();
			else if (pathIter->type == VarTypeComponent::ARRAY_ELEMENT)
				curType = &curType->getElementType();
			else
				break;

			++pathIter;
		}

		if (pathIter != end)
		{
			DataType	basicType	= curType->getBasicType();
			Precision	precision	= curType->getPrecision();

			if (pathIter->type == VarTypeComponent::MATRIX_COLUMN)
			{
				basicType = getDataTypeFloatVec(getDataTypeMatrixNumRows(basicType));
				++pathIter;
			}

			if (pathIter != end && pathIter->type == VarTypeComponent::VECTOR_COMPONENT)
			{
				basicType = getDataTypeScalarType(basicType);
				++pathIter;
			}

			DE_ASSERT(pathIter == end);
			return VarType(basicType, precision);
		}
		else
			return VarType(*curType);
	}
	
	
	// basic usage:
	// 	for (var i = new BasicTypeIterator(type) ; !i.end() ; i.next()) {
	// 		var j = i.getType();
	// 	}
	
	var SubTypeIterator = (function() {
		
		var m_type; // const VarType*
		var m_path = []; // TypeComponentVector
		
		this.__construct = (function(type) {
		
		});
		
		var removeTraversed = (function() {
			
			while (m_path.length) {
				var curComp     = this.m_path[this.m_path.length - 1]; // VarTypeComponent&
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

				this.m_path.pop();
				
			}
			
		});
		
		var findNext = (function() {
			
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
	
	
	// TODO: find VarType
	var getVarType = (function(var type, array, start, end) { 
		
		if (typeof(start) == 'undefined') {
			start = 0;
		}
		if (typeof(end) == 'undefined') {
			end = array.length;
		}
		
		if (!isValidTypePath(type, begin, end)) {
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
		}
		else
			return new VarType(curType);
		
	});
	
	return {
		BasicTypeIterator:  BasicTypeIterator,
		VectorTypeIterator: VectorTypeIterator,
		ScalarTypeIterator: ScalarTypeIterator,
		
		getVarType: getVarType
	};
	
});
