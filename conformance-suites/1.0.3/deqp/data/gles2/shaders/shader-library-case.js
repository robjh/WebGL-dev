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
var shaderLibraryCase = (function() {
	'use strict';

	var runTestCases = function() {
		var state = stateMachine.getState();
		if (!state.index)
			state.index = 0;

		var pre = state.pre;
		if (!pre) {
			pre = state.pre = document.createElement('pre');
			document.body.appendChild(pre);
		}
	
		var line = document.createElement('div');
		var text = document.createTextNode(state.testCases[state.index]);
		var decl = document.createElement('span');
		decl.className = "line_num";
		decl.textContent = 'Line ' + (state.index + 1);
	
		line.appendChild(decl);
		line.appendChild(text);
		pre.appendChild(line);

		++state.index;
		if (state.index < state.testCases.length)
			stateMachine.runCallback(runTestCases);
		else
			stateMachine.terminate(true);
	};

	return {
		runTestCases: runTestCases
	};

}());
