/*
** Copyright (c) 2012 The Khronos Group Inc.
**
** Permission is hereby granted, free of charge, to any person obtaining a
** copy of this software and/or associated documentation files (the
** "Materials"), to deal in the Materials without restriction, including
** without limitation the rights to use, copy, modify, merge, publish,
** distribute, sublicense, and/or sell copies of the Materials, and to
** permit persons to whom the Materials are furnished to do so, subject to
** the following conditions:
**
** The above copyright notice and this permission notice shall be included
** in all copies or substantial portions of the Materials.
**
** THE MATERIALS ARE PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
** EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
** MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
** IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
** CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
** TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
** MATERIALS OR THE USE OR OTHER DEALINGS IN THE MATERIALS.
*/
var shaderLibrary = (function() {
	'use strict';
	
	
	var generateTestCases = function() {
		stateMachine.getState().testCases = stateMachine.getState().testFile.match(/[^\r\n]+/g);
		return true;
	};

	var processTestFile = function() {
		if (generateTestCases()) {
			stateMachine.runCallback(shaderLibraryCase.runTestCases);
		} else {
			terminate(false);
		}
	};


	
	/* Parser class */
	var Parser = function() {
		
		
	/* public members */
		this.parse = function() {
			
		};
		
	/* private members */
		
		var m_curPtr;
		
		var parseError         = function(errorStr) {
			// throws an exception
//			throw "Parser error: " + errorStr + " near " + m_curPtr.substr(0, 80);
		};
		var parseFloatLiteral  = function(str) {
			return parseFloat(str);
		};
		var parseIntLiteral    = function(str) {
			return parseInt(str);
		};
		var parseStringLiteral = function(str) {
		
			// strip quotes, replace \n and \t with nl and tabs respectively
			var endchar = str.substr(0,1);
			var index_end = 0;
			do {
				index_end = str.indexOf(endchar, index_end + 1);
			} while(index_end >= 0 && str.charAt(index_end - 1) == '\\');
			
			if (index_end <= 0) {
				index_end = str.length;
			}
			
			return str
				.substr(1, index_end - 1)
				.replace("\\n", '\n')
				.replace("\\t", '\t');
			
		};
		var parseShaderSource  = function(str) {
			
		};
		var advanceToken       = function() {
			
		};
	//	var advanceToken       = function(tokenAssumed) {
	//		
	//	};
		var assumeToken        = function(token) {
			
		};
		var mapDataTypeToken   = function(token) {
			
		};
		var getTokenName       = function(token) {
			
		};
		
//		var parseValueElement  = function(DataType dataType, ShaderCase::Value& result);
//		var parseValue         = function(ShaderCase::ValueBlock& valueBlock);
//		var parseValueBlock    = function(ShaderCase::ValueBlock& valueBlock);
//		var parseShaderCase    = function(vector<tcu::TestNode*>& shaderNodeList);
//		var parseShaderGroup   = function(vector<tcu::TestNode*>& shaderNodeList);

		// uncomment to expose private functions
		(function(obj) {
			obj.priv = {
				m_curPtr:           m_curPtr,
				
				parseError:         parseError,
				parseFloatLiteral:  parseFloatLiteral,
				parseIntLiteral:    parseIntLiteral,
				parseStringLiteral: parseStringLiteral,
				parseShaderSource:  parseShaderSource,
				advanceToken:       advanceToken,
				assumeToken:        assumeToken,
				mapDataTypeToken:   mapDataTypeToken,
				getTokenName:       getTokenName,
				
//				parseValueElement:  parseValueElement,
//				parseValue:         parseValue,
//				parseValueBlock:    parseValueBlock,
//				parseShaderCase:    parseShaderCase,
//				parseShaderGroup:   parseShaderGroup,
				
				none: false
			};
		}(this));
		//*/
	};



	return {
		Parser:          Parser,
		processTestFile: processTestFile
	};

}());
