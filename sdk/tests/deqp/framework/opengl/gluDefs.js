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
goog.provide('framework.opengl.gluDefs');
goog.require('framework.opengl.gluTextureUtil');
goog.require('framework.common.tcuTexture');
goog.require('framework.common.tcuCompressedTexture');
goog.require('framework.delibs.debase.deMath');


goog.scope(function() {

var gluDefs = framework.opengl.gluDefs;
var gluTextureUtil = framework.opengl.gluTextureUtil;
var tcuTexture = framework.common.tcuTexture;
var tcuCompressedTexture = framework.common.tcuCompressedTexture;
var deMath = framework.delibs.debase.deMath;

    

    gluDefs.DE_NULL = null;

    /**
     * Might be useful.
     * Constant false.
     */
    gluDefs.deGetFalse = function() {
        return false;
    };

    /**
     * Might be useful.
     * Constant true.
     */
    gluDefs.deGetTrue = function() {
        return true;
    };

    /**
     * @param {string} message
     */
    gluDefs.OutOfMemoryError = function(message) {
        this.message = message;
        this.name = 'gluDefs.OutOfMemoryError';
    };

    /**
     * @param {number} error
     * @param {string} message
     */
    gluDefs.Error = function(error, message) {
        this.message = message;
        this.name = 'gluDefs.Error ' + error;
    };

    /**
     * @param {WebGLRenderingContext} context
     * @param {string} msg
     */
    gluDefs.checkError = function(context, msg) {
        gluDefs.checkErrorCode(context.getError(), msg);
    };

    /**
     * @param {deMath.deUint32} err
     * @param {string} msg
     */
    gluDefs.checkErrorCode = function(err, msg) {
        if (err != gl.NO_ERROR)
        {
            /** @type {string} */ var msgStr = '';
            if (msg)
                msgStr += msg + ': ';

            msgStr += 'gl.getError() returned ' + /*getErrorStr*/(err); //TODO: Check if we'll implement getErrorStr(err)

            if (err == gl.OUT_OF_MEMORY)
                throw new gluDefs.OutOfMemoryError(msgStr);
            else
                throw new gluDefs.Error(err, msgStr);
        }
    };

    // Functions for checking API errors.
    gluDefs.GLU_EXPECT_NO_ERROR = function(ERR, MSG)   {gluDefs.checkErrorCode(ERR, MSG)};
    gluDefs.GLU_CHECK_ERROR = function(ERR)            {gluDefs.GLU_EXPECT_NO_ERROR(ERR, gluDefs.DE_NULL)};
    gluDefs.GLU_CHECK_MSG = function(MSG)              {gluDefs.GLU_EXPECT_NO_ERROR(function() {return gl.getError();}, MSG)};
    gluDefs.GLU_CHECK = function()                     {gluDefs.GLU_CHECK_MSG(gluDefs.DE_NULL)};
    gluDefs.GLU_CHECK_CALL_ERROR = function(CALL, ERR) {CALL(); gluDefs.GLU_EXPECT_NO_ERROR(ERR, CALL.toString()); };
    gluDefs.GLU_CHECK_CALL = function(CALL)            {CALL(); gluDefs.GLU_EXPECT_NO_ERROR(function() {return gl.getError();}, CALL.toString()); };

    
});
