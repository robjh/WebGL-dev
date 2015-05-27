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
goog.provide('functional.gles3.es3fApiCase');
goog.require('framework.opengl.gluStrUtil');
goog.require('framework.common.tcuTestCase');

goog.scope(function() {

    var es3fApiCase = functional.gles3.es3fApiCase;
    var gluStrUtil  = framework.opengl.gluStrUtil;
    var tcuTestCase = framework.common.tcuTestCase;

    /**
    * Base class for all the API tests.
    * @constructor
    * @extends {tcuTestCase.DeqpTest}
    * @param {string} name
    * @param {string} desc
    */
    es3fApiCase.ApiCase = function(name, desc, gl) {
        gl = gl || window.gl;
        if (this.test === undefined) {
            throw new Error('Unimplemented virtual function: es3fApiCase.ApiCase.test')
        }
        tcuTestCase.DeqpTest.call(this, name, desc);
        
        this.m_gl = gl;
        this.m_pass = true;
        this.m_comment = this.name + ' ' + this.description;
        
    };
    
    es3fApiCase.ApiCase.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    es3fApiCase.ApiCase.prototype.constructor = es3fApiCase.ApiCase;
    
    es3fApiCase.ApiCase.prototype.iterate = function() {
        
        this.test();
        
        if (this.m_pass)
            testPassed(this.m_comment);
        else
            testFailedOptions(this.m_comment, true);
            
        return tcuTestCase.IterateResult.STOP;
    };
    
    /**
    * @param {Array<number>|number} expected
    */
    es3fApiCase.ApiCase.prototype.expectError = function(expected) {
        if (expected.constructor === Number) 
            expected = [expected];
            
        var err = this.m_gl.getError();
        
        if (expected.indexOf(err) === -1) {
            
            var msg = 'expected ';
            
            if (expected.length > 1)
                msg += 'one of ';
            
            for (var i = 0, l = expected.length ; i < l ; ++i) {
            //    msg += gluStrUtil.getErrorStr(expected[i]);
                msg += expected[i];
                    
                if (i < l - 2)
                    msg += ', ';
                else if (i == l - 2)
                    msg += ' or ';
                else
                    msg += '.';
            }
                
            bufferedLogToConsole(msg);
                
            if (this.m_pass) {
                this.m_comment = msg;
                this.m_pass = false;
            }
        
        }
        
    };
    
    /**
    * Base class for all the API tests.
    * @constructor
    * @extends {es3fApiCase.ApiCase}
    * @param {string} name
    * @param {string} desc
    * @param {function(this:es3fApiCase.ApiCaseCallback)} callback
    */
    es3fApiCase.ApiCaseCallback = function(name, desc, gl, callback) {
        this.test = callback;
        es3fApiCase.ApiCase.call(this, name, desc, gl);
    };
    es3fApiCase.ApiCaseCallback.prototype = Object.create(es3fApiCase.ApiCase.prototype);
    es3fApiCase.ApiCaseCallback.prototype.constructor = es3fApiCase.ApiCaseCallback;
    
/*
    es3fApiCase.ApiCase.prototype.expectError // (error) or (error0, error1)
    es3fApiCase.ApiCase.prototype.getSupportedExtensions // (number numSupportedValues, number extension, [number] values )
    es3fApiCase.ApiCase.prototype.checkBooleans // (char value, char expected);
//*/
});
