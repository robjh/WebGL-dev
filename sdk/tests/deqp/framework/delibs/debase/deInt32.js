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

define(function() {
'use strict';

    /* Dummy type. TODO: check if it will be necessary */
    var deUint32 = function() {};

    var deInRange32 = function(a, mn, mx) {
        return (a >= mn) && (a <= mx);
    };

    var deInBounds32 = function(a, mn, mx) {
        return (a >= mn) && (a < mx);
    };
/*--------------------------------------------------------------------*//*!
 * \brief Check if a value is a power-of-two.
 * \param a Input value.
 * \return True if input is a power-of-two value, false otherwise.
 *
 * \note Also returns true for zero.
 *//*--------------------------------------------------------------------*/
var deIsPowerOfTwo32 = function(a)
{
    return ((a & (a - 1)) == 0);
};


    return {
        deInRange32: deInRange32,
        deInBounds32: deInBounds32,
        deIsPowerOfTwo32: deIsPowerOfTwo32
    };
});

