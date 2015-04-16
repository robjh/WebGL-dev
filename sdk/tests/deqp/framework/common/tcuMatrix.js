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
     * @param {Array<number>} matrix
     */
    var Matrix = function(matrix) {
        this.matrix = matrix;
        for (row = 0; row < matrix.length; row++)
            DE_ASSERT(matrix[row].length == matrix.length);
    };

    Matrix.prototype.set = function(x,y, value) {
        this.matrix[x][y] = value;
    };

    Matrix.prototype.get = function(x, y) {
        return this.matrix[x][y];
    };

    /**
     * @constructor
     * @param {Array<number>} m3Matrix
     */
    var Mat3 = function(m3Matrix) {
        DE_ASSERT(m3Matrix.length == 3);
        Matrix.call(this, m3Matrix);
    };

    Mat3.prototype = Object.create(Matrix.prototype);
    Mat3.prototype.constructor = Mat3;

    // Multiplication of two matrices.
    Mat3.prototype.multiply = function(matrixA, matrixB) {
        var res = new Mat3([[0,0,0],[0,0,0],[0,0,0]]);
        var v = 0;
        for (row = 0; row < matrixA.length; row++)
            for (col = 0; col < matrixB[row].length; col++)
            {
                for (ndx = 0; ndx < matrixA[row]; ndx++)
                    v += matrixA.get(row, ndx) * matrixB.get(ndx, col);
                res.set(row, col, v);
            }
        return res;
    };
});