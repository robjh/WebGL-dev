define([], function() {
    'use strict';
	
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
				var curComp     = m_path.back(); // VarTypeComponent&
				var parentType  = getVarType(*m_type, m_path.begin(), m_path.end()-1); // VarType
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
				// NOTE: this logic seems backwards to me, but it's whats in the C++
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
	
	
	return {
		BasicTypeIterator:  BasicTypeIterator,
		VectorTypeIterator: VectorTypeIterator,
		ScalarTypeIterator: ScalarTypeIterator
	};
	
});
