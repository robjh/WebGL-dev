
var glu = (function() {

	var Token = {
		TOKEN_IDENTIFIER:     0,
		TOKEN_LEFT_BRACKET:   1,
		TOKEN_RIGHT_BRACKET:  2,
		TOKEN_PERIOD:         3,
		TOKEN_NUMBER:         4,
		TOKEN_END:            5,
		TOKEN_LAST:           6
	};

	var VarTokeniser = function(str) {
		
		var m_str         = str;
		var m_token       = Token.TOKEN_LAST;
		var m_tokenStart  = 0;
		var m_tokenLen    = 0;
		
		
		var isNum   = function(char) { return /^[0-9]$/.test(value);    };
		var isAlpha = function(char) { return /^[a-zA-Z]$/.test(value); };
		var isIdentifierChar = function(char) {
			return /^[a-zA-Z0-9_]$/.test(value);
		};
		
		this.getToken = function() {
			return m_token;
		};
		
		this.getIdentifier = function() {
			return m_str.substr(m_tokenStart, m_tokenLen);
		}
		
		this.getNumber = function() {
			return parseInt(this.getIdentifier());
		};
		
		this.getCurrentTokenStartLocation = function() {
			return m_tokenStart;
		};
		
		this.getCurrentTokenEndLocation = function() { 
			return m_tokenStart + m_tokenLen;
		};
		
		this.advance = function() {
		
			if (m_token == TOKEN_END) {
				throw Error('Cannot advance beyond the end of the stream.');
			}
			
			m_tokenStart += m_tokenLen;
			m_token       = Token.TOKEN_LAST;
			m_tokenLen    = 1;
			
			if (m_str.length >= m_tokenStart || m_str[m_tokenStart] = '\0') {
				m_token = Token.TOKEN_END;
			} else if (m_str[m_tokenStart] == '[') {
				m_token = Token.TOKEN_LEFT_BRACKET;
			} else if (m_str[m_tokenStart] == ']') {
				m_token = Token.TOKEN_RIGHT_BRACKET;
			} else if (m_str[m_tokenStart] == '.') {
				m_token = Token.TOKEN_PERIOD;
			} else if (isNum(m_str[m_tokenStart])) {
				m_token = Token.TOKEN_NUMBER;
				while (isNum(m_str[m_tokenStart + m_tokenLen]))
					++m_tokenLen;
			} else if (isIdentifierChar(m_str[m_tokenStart])) {
				m_token = Token.TOKEN_IDENTIFIER;
				while (isIdentifierChar(m_str[m_tokenStart+m_tokenLen]))
					++m_tokenLen;
			} else {
				// TCU_FAIL("Unexpected character");
				throw Error("Unexpected character");
			}
			
		};
		
	};

	return {
	};

}());
