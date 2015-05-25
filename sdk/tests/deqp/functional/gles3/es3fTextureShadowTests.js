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
goog.provide('functional.gles3.es3fTextureShadowTests');
goog.require('framework.common.tcuTestCase');
goog.require('modules.shared.glsTextureTestUtil');
goog.require('framework.opengl.gluShaderUtil');

goog.scope(function() {

var es3fTextureShadowTests = functional.gles3.es3fTextureShadowTests;
var tcuTestCase  = framework.common.tcuTestCase;
var glsTextureTestUtil = modules.shared.glsTextureTestUtil;
var gluShaderUtil = framework.opengl.gluShaderUtil;
    
    es3fTextureShadowTests.version = '300 es';
    
    /**
     * @constructor
     * @struct
     */
    es3fTextureShadowTests.Format = function() {
        /** @type {string} */ this.name;
        /** @type {number} */ this.format;
    };
    
    /**
     * @constructor
     * @struct
     */
    es3fTextureShadowTests.Filter = function() {
        /** @type {string} */ this.name;
        /** @type {number} */ this.minFilter;
        /** @type {number} */ this.magFilter;
    };
    
    /**
     * @constructor
     * @struct
     */
    es3fTextureShadowTests.CompareFunc = function() {
        /** @type {string} */ this.name;
        /** @type {number} */ this.func;
    };
    
    /**
     * @constructor
     * @extends {tcuTestCase.DeqpTest}
     */
    es3fTextureShadowTests.Texture2DShadowCase = function (name, desc, minFilter, magFilter, wrapS, wrapT, format, width, height, compareFunc) {
        tcuTestCase.DeqpTest.call(this, name, desc);
        this.m_minFilter = minFilter;
        this.m_magFilter = magFilter;
        this.m_wrapS = wrapS;
        this.m_wrapT = wrapT;
        this.m_format = format;
        this.m_width = width;
        this.m_height = height;
        this.m_compareFunc = compareFunc;
        this.m_renderer = new glsTextureTestUtil.TextureRenderer(es3fTextureShadowTests.version, gluShaderUtil.precision.PRECISION_HIGHP);
        this.m_caseNdx = 0;
    }
    
    es3fTextureShadowTests.Texture2DShadowCase.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    es3fTextureShadowTests.Texture2DShadowCase.prototype.constructor = es3fTextureShadowTests.Texture2DShadowCase;
    
    es3fTextureShadowTests.Texture2DShadowCase.prototype.init = function() {
        
        // Create 2 textures.
		m_textures.reserve(2);
		m_textures.push_back(new glu::Texture2D(m_context.getRenderContext(), m_format, m_width, m_height));
		m_textures.push_back(new glu::Texture2D(m_context.getRenderContext(), m_format, m_width, m_height));
    }
    
    es3fTextureShadowTests.init = function() {
        /** @type {Array<es3fTextureShadowTests.Format>} */ var formats = [];
        formats[0] = new es3fTextureShadowTests.Format();
        formats[0].name = 'depth_component16';
        formats[0].format = gl.DEPTH_COMPONENT16;
        formats[1] = new es3fTextureShadowTests.Format();
        formats[1].name = 'depth_component32f';
        formats[1].format = gl.DEPTH_COMPONENT32F;
        formats[2] = new es3fTextureShadowTests.Format();
        formats[2].name = 'depth24_stencil8';
        formats[2].format = gl.DEPTH24_STENCIL8;
        
        /** @type {Array<es3fTextureShadowTests.Filter>} */ var filters = [];
        filters[0] = new es3fTextureShadowTests.Filter();
        filters[0].name = 'nearest';
        filters[0].minFilter = gl.NEAREST;
        filters[0].magFilter = gl.NEAREST;
        filters[1] = new es3fTextureShadowTests.Filter();
        filters[1].name = 'linear';
        filters[1].minFilter = gl.LINEAR;
        filters[1].magFilter = gl.LINEAR;
        filters[2] = new es3fTextureShadowTests.Filter();
        filters[2].name = 'nearest_mipmap_nearest';
        filters[2].minFilter = gl.NEAREST_MIPMAP_NEAREST;
        filters[2].magFilter = gl.LINEAR;
        filters[3] = new es3fTextureShadowTests.Filter();
        filters[3].name = 'linear_mipmap_nearest';
        filters[3].minFilter = gl.LINEAR_MIPMAP_NEAREST;
        filters[3].magFilter = gl.LINEAR;
        filters[4] = new es3fTextureShadowTests.Filter();
        filters[4].name = 'nearest_mipmap_linear';
        filters[4].minFilter = gl.NEAREST_MIPMAP_LINEAR;
        filters[4].magFilter = gl.LINEAR;
        filters[5] = new es3fTextureShadowTests.Filter();
        filters[5].name = 'linear_mipmap_linear';
        filters[5].minFilter = gl.LINEAR_MIPMAP_LINEAR;
        filters[5].magFilter = gl.LINEAR;
        
        /** @type {Array<es3fTextureShadowTests.CompareFunc>} */ var compareFuncs = [];
        compareFuncs[0] = new es3fTextureShadowTests.CompareFunc();
        compareFuncs[0].name = 'less_or_equal';
        compareFuncs[0].func = gl.LEQUAL;
        compareFuncs[1] = new es3fTextureShadowTests.CompareFunc();
		compareFuncs[1].name = 'greater_or_equal';	
        compareFuncs[1].func = gl.GEQUAL;
        compareFuncs[2] = new es3fTextureShadowTests.CompareFunc();
		compareFuncs[2].name = 'less';
        compareFuncs[2].func = gl.LESS;
        compareFuncs[3] = new es3fTextureShadowTests.CompareFunc();
		compareFuncs[3].name = 'greater';
        compareFuncs[3].func = gl.GREATER;
        compareFuncs[4] = new es3fTextureShadowTests.CompareFunc();
		compareFuncs[4].name = 'equal';
        compareFuncs[4].func = gl.EQUAL;
        compareFuncs[5] = new es3fTextureShadowTests.CompareFunc();
		compareFuncs[5].name = 'not_equal';
        compareFuncs[5].func = gl.NOTEQUAL;
        compareFuncs[6] = new es3fTextureShadowTests.CompareFunc();
		compareFuncs[6].name = 'always';
        compareFuncs[6].func = gl.ALWAYS;
        compareFuncs[7] = new es3fTextureShadowTests.CompareFunc();
		compareFuncs[7].name = 'never';
        compareFuncs[7].func = gl.NEVER;
        
        var state = tcuTestCase.runner;
        /** @type {tcuTestCase.DeqpTest} */ var testGroup = state.testCases;
        
        var group2D = tcuTestCase.newTest('2d', '2D texture shadow lookup tests');
        testGroup.addChild(group2D);
        
        for (var filterNdx = 0; filterNdx < filters.length; filterNdx++)
        {
            var filterGroup = tcuTestCase.newTest(filters[filterNdx].name, '');
            group2D.addChild(filterGroup);
            
            for (var compareNdx = 0; compareNdx < compareFuncs.length; compareNdx++)
            {
                for (var formatNdx = 0; formatNdx < formats.length; formatNdx++)
                {
                    /** @type {number} */ var minFilter = filters[filterNdx].minFilter;
                    /** @type {number} */ var magFilter = filters[filterNdx].magFilter;
                    /** @type {number} */ var format = formats[formatNdx].format;
                    /** @type {number} */ var compareFunc = compareFuncs[compareNdx].func;
                    /** @type {number} */ var wrapS = gl.REPEAT;
                    /** @type {number} */ var wrapT = gl.REPEAT;
                    /** @type {number} */ var width = 32;
                    /** @type {number} */ var height = 64;
                    /** @type {string} */ var name = compareFuncs[compareNdx].name + '_' +formats[formatNdx].name;
                    
                    filterGroup.addChild(new es3fTextureShadowTests.Texture2DShadowCase(name, '', minFilter, magFilter, wrapS, wrapT, format, width, height, compareFunc));
                }
            }
        }
    }

    es3fTextureShadowTests.run = function(context) {
        gl = context;
        //Set up Test Root parameters
        var testName = 'texture_shadow';
        var testDescription = 'Texture Shadow Test';
        var state = tcuTestCase.runner;

        state.testName = testName;
        state.testCases = tcuTestCase.newTest(testName, testDescription, null);

        //Set up name and description of this test series.
        setCurrentTestName(testName);
        description(testDescription);

        try {
            //Create test cases
            es3fTextureShadowTests.init();
            //Run test cases
            tcuTestCase.runTestCases();
        }
        catch (err) {
            bufferedLogToConsole(err);
            tcuTestCase.runner.terminate();
        }
    };
});