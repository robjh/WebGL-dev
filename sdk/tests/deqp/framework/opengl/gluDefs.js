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

define([
    'framework/opengl/gluTextureUtil' ,
    'framework/common/tcuTexture',
    'framework/common/tcuCompressedTexture',
    'framework/delibs/debase/deMath'], function(
        gluTextureUtil, 
        tcuTexture, 
        tcuCompressedTexture, 
        deMath) {

    'use strict';

    var DE_NULL = null;

    /**
     * Might be useful.
     * Constant false.
     */
    var deGetFalse = function() {
        return false;
    };

    /**
     * Might be useful.
     * Constant true.
     */
    var deGetTrue = function() {
        return true;
    };

    /**
     * @param {string} message
     */
    var OutOfMemoryError = function(message) {
        this.message = message;
        this.name = 'OutOfMemoryError';
    };

    /**
     * @param {number} error
     * @param {string} message
     */
    var Error = function(error, message) {
        this.message = message;
        this.name = 'Error ' + error;
    };

    /**
     * @param {WebGLRenderingContext} context
     * @param {string} msg
     */
    var checkError = function(context, msg) {
        checkErrorCode(context.getError(), msg);
    };

    /**
     * @param {deMath.deUint32} err
     * @param {string} msg
     */
    var checkErrorCode = function(err, msg) {
        if (err != gl.NO_ERROR)
        {
            /** @type {string} */ var msgStr = '';
            if (msg)
                msgStr += msg + ': ';

            msgStr += 'gl.getError() returned ' + /*getErrorStr*/(err); //TODO: Check if we'll implement getErrorStr(err)

            if (err == gl.OUT_OF_MEMORY)
                throw new OutOfMemoryError(msgStr);
            else
                throw new Error(err, msgStr);
        }
    };

    // Functions for checking API errors.
    var GLU_EXPECT_NO_ERROR = function(ERR, MSG)   {checkErrorCode(ERR(), MSG)};
    var GLU_CHECK_ERROR = function(ERR)            {GLU_EXPECT_NO_ERROR(ERR, DE_NULL)};
    var GLU_CHECK_MSG = function(MSG)              {GLU_EXPECT_NO_ERROR(function() {return gl.getError();}, MSG)};
    var GLU_CHECK = function()                     {GLU_CHECK_MSG(DE_NULL)};
    var GLU_CHECK_CALL_ERROR = function(CALL, ERR) {CALL(); GLU_EXPECT_NO_ERROR(ERR, CALL.toString()); };
    var GLU_CHECK_CALL = function(CALL)            {CALL(); GLU_EXPECT_NO_ERROR(function() {return gl.getError();}, CALL.toString()); };

    return {
        GLU_CHECK_CALL: GLU_CHECK_CALL
    };
});
