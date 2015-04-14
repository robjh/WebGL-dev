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

/**
 * @enum
 */
var FaceType = {
    FACETYPE_FRONT: 0,
    FACETYPE_BACK: 1
};

/**
 * @enum
 */
var IndexType = {
    INDEXTYPE_UINT8: 0,
    INDEXTYPE_UINT16: 1,
    INDEXTYPE_UINT32: 2
};

/**
 * @enum
 */
var ProvokingVertex = {
    PROVOKINGVERTEX_FIRST: 1,
    PROVOKINGVERTEX_LAST: 2           // \note valid value, "last vertex", not last of enum
};

return {
    FaceType: FaceType,
    IndexType: IndexType,
    ProvokingVertex: ProvokingVertex
};

});