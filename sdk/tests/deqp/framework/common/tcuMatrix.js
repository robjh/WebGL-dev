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
 define([], function()  {
    'use strict';

    var DE_ASSERT = function(x) {
        if (!x)
            throw new Error('Assert failed');
    };

    /**
     * @constructor
     * @param {Array} matrix
     */
    var Matrix = function(matrix) {
        this.matrix = matrix;
        for (row = 0; row < matrix.length; row++)
            DE_ASSERT(matrix[row].length == matrix.length);
    };

    Matrix.prototype.set = function(x,y, value) {
        this.array[x][y] = value;
    }

    Matrix.prototype.get = function(x, y) {
        return this.array[x][y];
    }

    var Mat3 = function(m3Matrix) {
        DE_ASSERT(m3Matrix.length == 3);
        Matrix.call(this, m3Matrix);
    };

    Mat3.prototype.operator = function(){}

    Mat3.prototype.multiply = functon(){}
};