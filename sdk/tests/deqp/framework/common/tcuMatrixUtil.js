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
goog.provide('framework.common.tcuMatrixUtil');
goog.require('framework.common.tcuMatrix');

goog.scope(function() {

    var tcuMatrixUtil = framework.common.tcuMatrixUtil;
	var tcuMatrix = framework.common.tcuMatrix;

    /**
     * @param {number} len
     * @param {Array<number>} translation
     */
    tcuMatrixUtil.translationMatrix = function(len, translation)
    {
        var res = new tcuMatrix.Matrix(len+1, len+1);
        for (var row = 0; row < len; row++)
            res.set(row,len, translation[row]);
        return res;
    };

});