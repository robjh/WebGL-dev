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

	var isWhitespace = function(char) {
		return /^[ \t\r\n]+$/.test(char);
	};
	var isEOL = function(char) {
		return /^[\r\n]+$/.test(char);
	};
	var isAlpha = function(char) {
		return /^[a-zA-Z]$/.test(char);
	};
	var isNumeric = function(char) {
		return /^[0-9]$/.test(char);
	};
	var isCaseNameChar = function(char) {
		return /^[a-zA-Z0-9_\-\.]$/.test(char);
	};

	// removes however many indents there are on the first line from all lines.
	var removeExtraIndentation = function(str) {
		return removeExtraIndentationArray(
			str.split(/\r\n|\r|\n/)
		).join('\n');
	};
	
	var removeExtraIndentationArray = function(arr) {
		var output = [];
		
		if (arr.length) {
			
			var numIndentChars = 0;
			for (var i = 0 ; i < arr[0].length && isWhitespace(arr[0].charAt(i)) ; ++i) {
				numIndentChars += arr[0].charAt(i) == '\t' ? 4 : 1;
			}
			
			for (var i = 0 ; i < arr.length ; ++i) {
				var removed = 0;
				var j;
				for (j = 0 ; removed < numIndentChars && j < arr[i].length ; ++j) {
					removed += (arr[i].charAt(j) == '\t' ? 4 : 1);
				}
				
				output.push(arr[i].substr(j, arr[i].length - j));
			}
			
		}
		
		return output;
	};
	
	
	var de_assert = function(condition) {
		if (!condition) {
			throw Error();
		}
	};
	
	
	/**
	 * @private
	 */
	var parseStringLiteralHelper = function(str, endstr) {
		
		// isolate the string
		var index_end = 0;
		do {
			index_end = str.indexOf(endstr, index_end + 1);
		} while(index_end >= 0 && str.charAt(index_end - 1) == '\\');
		
		if (index_end <= 0) {
			index_end = str.length;
		}
		
		// strip quotes, replace \n and \t with nl and tabs respectively
		return str
			.substr(endstr.length, index_end - endstr.length)
			.replace("\\n", '\n')
			.replace("\\t", '\t')
			.replace(/\\/g, '');
		
	};
	
	/**
	 * Parser class
	 * @constructor
	 */
	var Parser = function() {
		
		
	/* public members */
		this.parse = function() {
			
		};
		
	/* private members */
		
		var m_input;
		var m_curPtr;
		var m_curToken;
		var m_curTokenStr;
		
		/**
		 * The Token constants
		 * @enum {number}
		 */
		var Token = {
			TOKEN_INVALID:        0,
			TOKEN_EOF:            1,
			TOKEN_STRING:         2,
			TOKEN_SHADER_SOURCE:  3,
		
			TOKEN_INT_LITERAL:    4,
			TOKEN_FLOAT_LITERAL:  5,
		
			// identifiers
			TOKEN_IDENTIFIER:     6,
			TOKEN_TRUE:           7,
			TOKEN_FALSE:          8,
			TOKEN_DESC:           9,
			TOKEN_EXPECT:        10,
			TOKEN_GROUP:         11,
			TOKEN_CASE:          12,
			TOKEN_END:           13,
			TOKEN_VALUES:        14,
			TOKEN_BOTH:          15,
			TOKEN_VERTEX:        26,
			TOKEN_FRAGMENT:      17,
			TOKEN_UNIFORM:       18,
			TOKEN_INPUT:         19,
			TOKEN_OUTPUT:        20,
			TOKEN_FLOAT:         21,
			TOKEN_FLOAT_VEC2:    22,
			TOKEN_FLOAT_VEC3:    23,
			TOKEN_FLOAT_VEC4:    24,
			TOKEN_FLOAT_MAT2:    25,
			TOKEN_FLOAT_MAT2X3:  26,
			TOKEN_FLOAT_MAT2X4:  27,
			TOKEN_FLOAT_MAT3X2:  28,
			TOKEN_FLOAT_MAT3:    29,
			TOKEN_FLOAT_MAT3X4:  30,
			TOKEN_FLOAT_MAT4X2:  31,
			TOKEN_FLOAT_MAT4X3:  32,
			TOKEN_FLOAT_MAT4:    33,
			TOKEN_INT:           34,
			TOKEN_INT_VEC2:      35,
			TOKEN_INT_VEC3:      36,
			TOKEN_INT_VEC4:      37,
			TOKEN_UINT:          38,
			TOKEN_UINT_VEC2:     39,
			TOKEN_UINT_VEC3:     40,
			TOKEN_UINT_VEC4:     41,
			TOKEN_BOOL:          42,
			TOKEN_BOOL_VEC2:     43,
			TOKEN_BOOL_VEC3:     44,
			TOKEN_BOOL_VEC4:     45,
			TOKEN_VERSION:       46,
		
			// symbols
			TOKEN_ASSIGN:        47,
			TOKEN_PLUS:          48,
			TOKEN_MINUS:         49,
			TOKEN_COMMA:         50,
			TOKEN_VERTICAL_BAR:  51,
			TOKEN_SEMI_COLON:    52,
			TOKEN_LEFT_PAREN:    53,
			TOKEN_RIGHT_PAREN:   54,
			TOKEN_LEFT_BRACKET:  55,
			TOKEN_RIGHT_BRACKET: 56,
			TOKEN_LEFT_BRACE:    57,
			TOKEN_RIGHT_BRACE:   58,
		
			TOKEN_LAST:          59
		}
		
		var resolveTokenName   = function(id) {
			for (var name in Token) {
				if (Token[name] == id) return name;
			}
			return "TOKEN_UNKNOWN";
		};
		
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
			// find delimitor
			var endchar = str.substr(0,1);
			return parseStringLiteralHelper(str, endchar);
		};
		var parseShaderSource  = function(str) {
			// similar to parse literal, delimitors are two double quotes ("")
			return removeExtraIndentation(
				parseStringLiteralHelper(str, '""')
			);
		};
		
		
		var advanceTokenWorker = function() {
			
			// Skip old token
			m_curPtr += m_curTokenStr.length;
			
			// Reset token (for safety).
			m_curToken    = Token.TOKEN_INVALID;
			m_curTokenStr = "";
			
			// Eat whitespace & comments while they last.
			for (;;) {
				
				while (isWhitespace(m_input.charAt(m_curPtr))) ++m_curPtr;
				
				// check for EOL comment
				if (m_input.charAt(m_curPtr) == "#") {
					// if m_input is to be an array of lines then this probably wont work very well
					while (
						m_curPtr < m_input.length &&
						!isEOL(m_input.charAt(m_curPtr))
					) ++m_curPtr;
				} else {
					break;
				}
				
			}
			
			if (m_curPtr >= m_input.length) {
			
				m_curToken = Token.TOKEN_EOF;
				m_curTokenStr = "<EOF>";
				
			} else if (isAlpha(m_input.charAt(m_curPtr))) {
				
				for (
					var end = m_curPtr + 1;
					isCaseNameChar(m_input.charAt(end));
					++end
				);
				
				m_curTokenStr = m_input.substr(m_curPtr, end - m_curPtr);
				
				m_curToken = (function() {
					// consider reimplementing with a binary search
					switch (m_curTokenStr) {
						case "true":       return Token.TOKEN_TRUE;
						case "false":      return Token.TOKEN_FALSE;
						case "desc":       return Token.TOKEN_DESC;
						case "expect":     return Token.TOKEN_EXPECT;
						case "group":      return Token.TOKEN_GROUP;
						case "case":       return Token.TOKEN_CASE;
						case "end":        return Token.TOKEN_END;
						case "values":     return Token.TOKEN_VALUES;
						case "both":       return Token.TOKEN_BOTH;
						case "vertex":     return Token.TOKEN_VERTEX;
						case "fragment":   return Token.TOKEN_FRAGMENT;
						case "uniform":    return Token.TOKEN_UNIFORM;
						case "input":      return Token.TOKEN_INPUT;
						case "output":     return Token.TOKEN_OUTPUT;
						case "float":      return Token.TOKEN_FLOAT;
						case "vec2":       return Token.TOKEN_FLOAT_VEC2;
						case "vec3":       return Token.TOKEN_FLOAT_VEC3;
						case "vec4":       return Token.TOKEN_FLOAT_VEC4;
						case "mat2":       return Token.TOKEN_FLOAT_MAT2;
						case "mat2x3":     return Token.TOKEN_FLOAT_MAT2X3;
						case "mat2x4":     return Token.TOKEN_FLOAT_MAT2X4;
						case "mat3x2":     return Token.TOKEN_FLOAT_MAT3X2;
						case "mat3":       return Token.TOKEN_FLOAT_MAT3;
						case "mat3x4":     return Token.TOKEN_FLOAT_MAT3X4;
						case "mat4x2":     return Token.TOKEN_FLOAT_MAT4X2;
						case "mat4x3":     return Token.TOKEN_FLOAT_MAT4X3;
						case "mat4":       return Token.TOKEN_FLOAT_MAT4;
						case "int":        return Token.TOKEN_INT;
						case "ivec2":      return Token.TOKEN_INT_VEC2;
						case "ivec3":      return Token.TOKEN_INT_VEC3;
						case "ivec4":      return Token.TOKEN_INT_VEC4;
						case "uint":       return Token.TOKEN_UINT;
						case "uvec2":      return Token.TOKEN_UINT_VEC2;
						case "uvec3":      return Token.TOKEN_UINT_VEC3;
						case "uvec4":      return Token.TOKEN_UINT_VEC4;
						case "bool":       return Token.TOKEN_BOOL;
						case "bvec2":      return Token.TOKEN_BOOL_VEC2;
						case "bvec3":      return Token.TOKEN_BOOL_VEC3;
						case "bvec4":      return Token.TOKEN_BOOL_VEC4;
						case "version":    return Token.TOKEN_VERSION;
						default:           return Token.TOKEN_IDENTIFIER;
					}
				}());
				
			} else if (isNumeric(m_input.charAt(m_curPtr))) {
			
				var p = m_curPtr;
				while (isNumeric(m_input.charAt(p))) ++p;
				
				if (m_input.charAt(p) == '.') { // float
					
					++p;
					while (isNumeric(m_input.charAt(p))) ++p;
					
					if (m_input.charAt(p) == 'e' || m_input.charAt(p) == 'E') {
						
						++p;
						if (m_input.charAt(p) == '+' || m_input.charAt(p) == '-') ++p;
						
						de_assert(p < m_input.length && isNumeric(m_input.charAt(p)));
						while (isNumeric(m_input.charAt(p))) ++p;
						
					}
					
					m_curToken = Token.TOKEN_FLOAT_LITERAL;
					m_curTokenStr = m_input.substr(m_curPtr, p - m_curPtr);
					
				} else {
				
					m_curToken = Token.TOKEN_INT_LITERAL;
					m_curTokenStr = m_input.substr(m_curPtr, p - m_curPtr);
					
				}
			
			} else if (m_input.charAt(m_curPtr) == '"' && m_input.charAt(m_curPtr + 1) == '"') { // shader source
			
				var p = m_curPtr + 2;
				
				while (m_input.charAt(p) != '"' || m_input.charAt(p + 1) != '"') {
					de_assert(p < m_input.length);
					if (m_input.charAt(p) == '\\') {
						de_assert(p+1 < m_input.length);
						p += 2;
					} else {
						++p;
					}
				}
				p += 2;
				
				m_curToken = Token.TOKEN_SHADER_SOURCE;
				m_curTokenStr = m_input.substr(m_curPtr, p - m_curPtr);
				
			} else if (m_input.charAt(m_curPtr) == '"' || m_input.charAt(m_curPtr) == "'") {
				
				var delimitor = m_input.charAt(m_curPtr);
				var p = m_curPtr + 1;
				
				while (m_input.charAt(p) != delimitor) {
					
					de_assert(p < m_input.length);
					if (m_input.charAt(p) == '\\') {
						de_assert(p+1 < m_input.length);
						p += 2;
					} else {
						++p;
					}
					
				}
				++p;
				
				m_curToken = Token.TOKEN_STRING;
				m_curTokenStr = m_input.substr(m_curPtr, p - m_curPtr);

			} else {
			
				m_curTokenStr = m_input.charAt(m_curPtr);
				m_curToken = (function() {
					// consider reimplementing with a binary search
					switch (m_curTokenStr) {
						case "=": return Token.TOKEN_ASSIGN;
						case "+": return Token.TOKEN_PLUS;
						case "-": return Token.TOKEN_MINUS;
						case ",": return Token.TOKEN_COMMA;
						case "|": return Token.TOKEN_VERTICAL_BAR;
						case ";": return Token.TOKEN_SEMI_COLON;
						case "(": return Token.TOKEN_LEFT_PAREN;
						case ")": return Token.TOKEN_RIGHT_PAREN;
						case "[": return Token.TOKEN_LEFT_BRACKET;
						case "]": return Token.TOKEN_RIGHT_BRACKET;
						case "{": return Token.TOKEN_LEFT_BRACE;
						case "}": return Token.TOKEN_RIGHT_BRACE;
						
						default:  return Token.TOKEN_INVALID;
					}
				}());
				
			}
			
		};
		
		var advanceTokenTester = function(input, current_index) {
			m_input = input;
			m_curPtr = current_index;
			m_curTokenStr = "";
			advanceTokenWorker();
			return {
				idType: m_curToken,
				name:   resolveTokenName(m_curToken),
				value:  m_curTokenStr
			};
		};
		
		var advanceToken       = function(tokenAssumed) {
			if (typeof(tokenAssumed) == "undefined") {
				assumeToken(tokenAssumed);
			}
			advanceTokenWorker();
		};
		var assumeToken        = function(token) {
			if (m_curToken != token) {
				
			}
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
				advanceTokenTester: advanceTokenTester,
				assumeToken:        assumeToken,
				mapDataTypeToken:   mapDataTypeToken,
				getTokenName:       getTokenName,
				
				Token:              Token,
				
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
		Parser:                 Parser,
		isWhitespace:           isWhitespace,
		removeExtraIndentation: removeExtraIndentation,
		processTestFile:        processTestFile
	};

}());
