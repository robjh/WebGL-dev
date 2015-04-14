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

    /**
    * Add a push_unique function to Array. Will insert only if there is no equal element.
    * @param {Array} array Any array
    * @param {Object} object Any object
    */
    var dePushUniqueToArray = function(array, object) {
        //Simplest implementation
        for (var i = 0; i < array.length; i++) {
            if (object.equals !== undefined)
                if (object.equals(array[i]))
                    return undefined;
            else if (object === array[i])
                return undefined;
        }

        array.push(object);
    };

    return {
        dePushUniqueToArray: dePushUniqueToArray
    };
});