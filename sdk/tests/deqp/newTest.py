import sys, os

html_body = '''<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
"http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>WebGL {test_name} Conformance Tests</title>
<link rel="stylesheet" href="../../../resources/js-test-style.css"/>
<script src="../../../js/js-test-pre.js"></script>
<script src="../../../js/webgl-test-utils.js"></script>

<script src="../../../closure-library/closure/goog/base.js"></script>
<script src="../../deqp-deps.js"></script>
<script>goog.require('functional.gles3.{module_name}');</script>
</head>
<body>
<div id="description"></div>
<div id="console"></div>
<canvas id="canvas" width="256" height="256"> </canvas>
<script>
var wtu = WebGLTestUtils;
var gl = wtu.create3DContextWithWrapperThatThrowsOnGLError('canvas', {{preserveDrawingBuffer: true}}, 2);

gl.getError();
    try {{
        functional.gles3.{module_name}.run(gl);
    }}
    catch(err)
    {{
        bufferedLogToConsole(err);
    }}

</script>
</body>
</html>
'''

js_header = '''/*-------------------------------------------------------------------------
 * drawElements Quality Program OpenGL ES Utilities
 * ------------------------------------------------
 *
 * Copyright 2014 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

'use strict';
'''
js_body = """goog.provide('functional.gles3.{module_name}');
goog.require('framework.common.tcuTestCase');

goog.scope(function() {{
	var {module_name} = functional.gles3.{module_name};
    var tcuTestCase = framework.common.tcuTestCase;

    /**
    * @constructor
    * @extends {{tcuTestCase.DeqpTest}}
    */
    {module_name}.{test_constructor} = function() {{
        tcuTestCase.DeqpTest.call(this, 'NAME', 'DESCRIPTION'); // TODO: replace NAME and DESCRIPTION
    }};

    {module_name}.{test_constructor}.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    {module_name}.{test_constructor}.prototype.constructor = {module_name}.{test_constructor};

    {module_name}.{test_constructor}.prototype.init = function() {{

    }};

    /**
    * Run test
    * @param {{WebGL2RenderingContext}} context
    */
    {module_name}.run = function(context) {{
    	gl = context;
    	//Set up Test Root parameters
    	var state = tcuTestCase.runner;
    	state.setRoot(new {module_name}.{test_constructor}());

    	//Set up name and description of this test series.
    	setCurrentTestName(state.testCases.fullName());
    	description(state.testCases.getDescription());

    	try {{
    		//Run test cases
    		tcuTestCase.runTestCases();
    	}}
    	catch (err) {{
    		testFailedOptions('Failed to {module_name}.run tests', false);
    		tcuTestCase.runner.terminate();
    	}}
    }};

}});"""


def new_test(test, module):
    base_dir = os.path.join(os.getcwd(),'functional','gles3')
    main_test_name = module.replace('es3f','')
    with open( os.path.join(base_dir, module+".js"),'w') as f:
        f.write(js_header)
        f.write(js_body.format(module_name=module, test_constructor=main_test_name))

    html_name = main_test_name.replace('Tests','').lower()
    with open(os.path.join(base_dir, html_name+".html"),'w') as f:
        f.write(html_body.format(test_name=test, module_name=module))

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print 'Usage: newTest.py "Test Name" moduleName\n'
        print 'example: python newTest.py "Shader Struct" es3fShaderStructTests\n'
        print 'This will create shaderstruct.html and es3fShaderStructTests.js in functional/gles3/\n'
    else:
        new_test(sys.argv[1], sys.argv[2])
