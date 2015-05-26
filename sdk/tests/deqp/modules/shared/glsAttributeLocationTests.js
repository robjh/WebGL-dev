/*-------------------------------------------------------------------------
 * drawElements Quality Program OpenGL (ES) Module
 * -----------------------------------------------
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
 *//*!
 * \file
 * \brief Attribute location tests
 *//*--------------------------------------------------------------------*/

'use strict';
goog.provide('functional.gles3.glsAttributeLocationTests');
goog.require('framework.common.tcuTestCase');
goog.require('modules.shared.glsFboUtil');

goog.scope(function() {

	var glsAttributeLocationTests = modules.shared.glsAttributeLocationTests;
	var tcuTestCase = framework.common.tcuTestCase;
	var glsFboUtil = modules.shared.glsFboUtil;

	var DE_ASSERT = function(x) {
        if (!x)
            throw new Error('Assert failed');
    };

    /**
     * @param{glsFboUtil.Map} bindings
     * @param{string} attrib
     * @return {?number}
     */
    glsAttributeLocationTests.getBoundLocation = function(bindings, attrib) {
		/** @type{?number} */ var value = bindings.getValue(attrib);
		return (value == null ? glsAttributeLocationTests.LocationEnum.UNDEF : value);
	}

	/**
	 * @param{Array<*>} arr
	 * @param{number} newSize
	 * @param{*} defaultValue
	 * @return{Array<*>}
	 */
	glsAttributeLocationTests.resizeArray = function(arr, newSize, defaultValue) {
		/** @type{boolean} */ var increase = arr.length < newSize;
		/** @type{number} */ var i = 0;
		if (increase) {
			for (i = arr.length; i < newSize; i++) {
				arr[i] = defaultValue;
			}
		} else {
			arr.length = newSize;
		}

		return arr;
	}

	/**
	 * @param{Array<Attribute>} attributes
	 * @param{glsFboUtil.Map} bindings
	 * @return{boolean}
	 */
	glsAttributeLocationTests.hasAttributeAliasing = function(attributes, bindings) {
		/** @type{Array<boolean>} */ var reservedSpaces;

		/** @type{number} */ var location;
		/** @type{number} */ var size;

		for (var attribNdx = 0; attribNdx < attributes.length; attribNdx++)	{
			location	= glsAttributeLocationTests.getBoundLocation(bindings, attributes[attribNdx].getName());
			size		= attributes[attribNdx].getType().getLocationSize();

			if (location != glsAttributeLocationTests.LocationEnum.UNDEF) {
				if (reservedSpaces.length < location + size)
					glsAttributeLocationTests.resizeArray(reservedSpaces, location + size, false);

				for (var i = 0; i < size; i++) {
					if (reservedSpaces[location + i])
						return true;

					reservedSpaces[location + i] = true;
				}
			}
		}

		return false;
	}

	/**
	 * TODO
	 * @param{*} renderCtx
	 */
	glsAttributeLocationTests.getMaxAttributeLocations = function(/* glu::RenderContext& */ renderCtx) {
		// const glw::Functions& gl = renderCtx.getFunctions();
		// /** @type{number} */ var maxAttribs;

		// gl.getIntegerv(GL_MAX_VERTEX_ATTRIBS, &maxAttribs);
		// GLU_EXPECT_NO_ERROR(gl.getError(), "glGetIntegerv()");

		// return maxAttribs;
	}

	/**
	 * @param{Array<Attribute>} attributes
	 * @return{string}
	 */
	glsAttributeLocationTests.generateAttributeDefinitions = function(attributes) {
		/** @type{string} */ var src = '';
		/** @type{number} */ var i = 0;

		for (i = 0; i < attributes.length; i++)	{
			if (attributes[i].getLayoutLocation() != glsAttributeLocationTests.LocationEnum.UNDEF)	
				src += ("layout(location = " + attributes[i].getLayoutLocation() + ") ");

			src += '${VTX_INPUT} mediump ';
			src	+= (attributes[i].getType().getName() + ' ');
			src	+= attributes[i].getName()
			src	+= (attributes[i].getArraySize() != glsAttributeLocationTests.ArrayEnum.NOT ? 
				'[' + attributes[i].getArraySize() + ']' : '');
			src += ';\n';
		}

		return src;
	}


	/**
	 * @constructor
	 * @param{string} name
	 * @param{number} locationSize
	 * @param{number} typeEnum
	 */
	glsAttributeLocationTests.AttribType = function(name, locationSize, typeEnum) {
		/** @type{string} */ this.m_name = name;
		/** @type{number} */ this.m_locationSize = locationSize;
		/** @type{number} */ this.m_glTypeEnum = typeEnum;
	};

	/**
	 * @return{string}
	 */
	glsAttributeLocationTests.AttribType.prototype.getName = function() {
		return this.m_name;
	};

	/**
	 * @return{number}
	 */
	glsAttributeLocationTests.AttribType.prototype.getLocationSize = function() {
		return this.m_locationSize;
	};

	/**
	 * @return{number}
	 */
	glsAttributeLocationTests.AttribType.prototype.getGLTypeEnum = function() {
		return this.m_glTypeEnum;
	};

	/**
	 * @enum{number}
	 */
	glsAttributeLocationTests.ConstCond = {
		ALWAYS : 0,
		NEVER : 1
	};

	/**
	 * @constructor
	 * @param{string} name
	 * @param{boolean} negate
	 */
	glsAttributeLocationTests.Cond = function(name, negate) {
		/** @type{boolean} */ this.m_negate = negate;
		/** @type{string} */ this.m_name = name;
	};

	/**
	 * @param{glsAttributeLocationTests.ConstCond} cond
	 * @return{glsAttributeLocationTests.Cond}
	 */
	glsAttributeLocationTests.NewCondWithEnum = function(cond) {
		var condObj = new glsAttributeLocationTests.Cond();
		condObj.m_name = '__always__';
		condObj.m_negate = (cond != glsAttributeLocationTests.ConstCond.NEVER);

		DE_ASSERT(cond == glsAttributeLocationTests.ConstCond.ALWAYS 
			|| cond == glsAttributeLocationTests.ConstCond.NEVER);

		return condObj;
	};

	/**
	 * @param{glsAttributeLocationTests.Cond} other
	 * @return{boolean}
	 */
	glsAttributeLocationTests.Cond.prototype.equals = function(other) {
		return (this.m_negate == other.m_negate && this.n_name == other.n_name);
	};

	/**
	 * @param{glsAttributeLocationTests.Cond} other
	 * @return{boolean}
	 */
	glsAttributeLocationTests.Cond.prototype.notEquals = function(other) {
		return (!this.equals(other));
	};

	/**
	 * @return{string} 
	 */
	glsAttributeLocationTests.Cond.prototype.getName = function() {
		return this.m_name;
	};

	/**
	 * @return{boolean} 
	 */
	glsAttributeLocationTests.Cond.prototype.getNegate = function() {
		return this.m_negate;
	};

	/**
	 * @enum{number}
	 */
	glsAttributeLocationTests.LocationEnum = {
		UNDEF: -1
	};

	/**
	 * @enum{number}
	 */
	glsAttributeLocationTests.ArrayEnum = {
		NOT: -1
	};

	/**
	 * @constructor
	 * @param{glsAttributeLocationTests.AttribType} type
	 * @param{string} name
	 * @param{number=} layoutLocation
	 * @param{glsAttributeLocationTests.Con=} cond
	 * @param{number=} arraySize
	 */
	glsAttributeLocationTests.Attribute = function(type, name, layoutLocation, cond, arraySize) {
		/** @type{glsAttributeLocationTests.AttribType} */ this.m_type = type;
		/** @type{string} */ this.m_name = name;
		/** @type{number} */ this.m_layoutLocation = layoutLocation || glsAttributeLocationTests.LocationEnum.UNDEF;
		/** @type{glsAttributeLocationTests.Cond} */ this.m_cond = cond || 
								glsAttributeLocationTests.NewCondWithEnum(glsAttributeLocationTests.ConstCond.ALWAYS);
		/** @type{number} */ this.m_arraySize = arraySize || glsAttributeLocationTests.ArrayEnum.NOT;
	};

	/**
	 * @return{glsAttributeLocationTests.AttribType} 
	 */
	glsAttributeLocationTests.Cond.prototype.getType = function() {
		return this.m_type;
	};

	/**
	 * @return{String} 
	 */
	glsAttributeLocationTests.Cond.prototype.getName = function() {
		return this.m_name;
	};

	/**
	 * @return{number} 
	 */
	glsAttributeLocationTests.Cond.prototype.getLayoutLocation = function() {
		return this.m_layoutLocation;
	};

	/**
	 * @return{glsAttributeLocationTests.Cond} 
	 */
	glsAttributeLocationTests.Cond.prototype.getCondition = function() {
		return this.m_cond;
	};

	/**
	 * @return{number} 
	 */
	glsAttributeLocationTests.Cond.prototype.getArraySize = function() {
		return this.m_arraySize;
	};

	/**
	 * @constructor
	 * @param{string} attribute
	 * @param{number} location
	 */
	glsAttributeLocationTests.Bind = function(attribute, location) {
		/** @type{string} */ this.m_attribute = attribute;
		/** @type{number} */ this.m_location = location;
	};

	/**
	 * @return{string}
	 */
	glsAttributeLocationTests.Bind.prototype.getAttributeName = function() {
		return this.m_attribute;
	};

	/**
	 * @return{number}
	 */
	glsAttributeLocationTests.Bind.prototype.getLocation = function() {
		return this.m_location;
	};

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
	 * @param{glsAttributeLocationTests.AttribType} type
	 * @param {number=} arraySize
	 */
	glsAttributeLocationTests.BindAttributeTest = function(name, desc, type, arraySize) {
		tcuTestCase.DeqpTest.call(this, name, desc);
		/** @type{*} */ this.m_renderCtx = renderCtx;
		/** @type{glsAttributeLocationTests.AttribType} */ this.m_type = type;
		/** @type{number} */ this.m_arraySize = arraySize || glsAttributeLocationTests.ArrayEnum.NOT;
	};

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
	 * @param{TestContext} testCtx
	 * @param{RenderContext} renderCtx
	 * @param{glsAttributeLocationTests.AttribType} type
	 * @param {number=} arraySize
	 */
	glsAttributeLocationTests.BindMaxAttributesTest = function(name, desc, testCtx, renderCtx, type, arraySize) {
		tcuTestCase.DeqpTest.call(this, name, desc);
		/** @type{*} */ this.m_renderCtx = renderCtx;
		/** @type{glsAttributeLocationTests.AttribType} */ this.m_type = type;
		/** @type{number} */ this.m_arraySize = arraySize || glsAttributeLocationTests.ArrayEnum.NOT;
	};

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
	 * @param{TestContext} testCtx
	 * @param{RenderContext} renderCtx
	 * @param{glsAttributeLocationTests.AttribType} type
	 * @param{number=} offset
	 * @param {number=} arraySize
	 */
	glsAttributeLocationTests.BindAliasingAttributeTest = function(name, desc, testCtx, renderCtx, type, offset, arraySize) {
		tcuTestCase.DeqpTest.call(this, name, desc);
		/** @type{*} */ this.m_renderCtx = renderCtx;
		/** @type{glsAttributeLocationTests.AttribType} */ this.m_type = type;
		/** @type{number} */ this.m_offset = offset || 0;
		/** @type{number} */ this.m_arraySize = arraySize || glsAttributeLocationTests.ArrayEnum.NOT;
	};

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
	 * @param{TestContext} testCtx
	 * @param{RenderContext} renderCtx
	 * @param{glsAttributeLocationTests.AttribType} type
	 * @param {number=} arraySize
	 */
	glsAttributeLocationTests.BindMaxAliasingAttributeTest = function(name, desc, testCtx, renderCtx, type, arraySize) {
		tcuTestCase.DeqpTest.call(this, name, desc);
		/** @type{*} */ this.m_renderCtx = renderCtx;
		/** @type{glsAttributeLocationTests.AttribType} */ this.m_type = type;
		/** @type{number} */ this.m_arraySize = arraySize || glsAttributeLocationTests.ArrayEnum.NOT;
	};

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
	 * @param{TestContext} testCtx
	 * @param{RenderContext} renderCtx
	 * @param{glsAttributeLocationTests.AttribType} type
	 * @param {number=} arraySize
	 */
	glsAttributeLocationTests.BindInactiveAliasingAttributeTest = function(name, desc, testCtx, renderCtx, type, arraySize) {
		tcuTestCase.DeqpTest.call(this, name, desc);
		/** @type{*} */ this.m_renderCtx = renderCtx;
		/** @type{glsAttributeLocationTests.AttribType} */ this.m_type = type;
		/** @type{number} */ this.m_arraySize = arraySize || glsAttributeLocationTests.ArrayEnum.NOT;
	};


	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
	 * @param{TestContext} testCtx
	 * @param{RenderContext} renderCtx
	 * @param{glsAttributeLocationTests.AttribType} type
	 * @param {number=} arraySize
	 */
	glsAttributeLocationTests.BindHoleAttributeTest = function(name, desc, testCtx, renderCtx, type, arraySize) {
		tcuTestCase.DeqpTest.call(this, name, desc);
		/** @type{*} */ this.m_renderCtx = renderCtx;
		/** @type{glsAttributeLocationTests.AttribType} */ this.m_type = type;
		/** @type{number} */ this.m_arraySize = arraySize || glsAttributeLocationTests.ArrayEnum.NOT;
	};

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
	 * @param{TestContext} testCtx
	 * @param{RenderContext} renderCtx
	 */
	glsAttributeLocationTests.PreAttachBindAttributeTest = function(name, desc, testCtx, renderCtx) {
		tcuTestCase.DeqpTest.call(this, name, desc);
		/** @type{*} */ this.m_renderCtx = renderCtx;
	};

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
	 * @param{TestContext} testCtx
	 * @param{RenderContext} renderCtx
	 */
	glsAttributeLocationTests.PreLinkBindAttributeTest = function(name, desc, testCtx, renderCtx) {
		tcuTestCase.DeqpTest.call(this, name, desc);
		/** @type{*} */ this.m_renderCtx = renderCtx;
	};

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
	 * @param{TestContext} testCtx
	 * @param{RenderContext} renderCtx
	 */
	glsAttributeLocationTests.PostLinkBindAttributeTest = function(name, desc, testCtx, renderCtx) {
		tcuTestCase.DeqpTest.call(this, name, desc);
		/** @type{*} */ this.m_renderCtx = renderCtx;
	};

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
	 * @param{TestContext} testCtx
	 * @param{RenderContext} renderCtx
	 */
	glsAttributeLocationTests.BindReattachAttributeTest = function(name, desc, testCtx, renderCtx) {
		tcuTestCase.DeqpTest.call(this, name, desc);
		/** @type{*} */ this.m_renderCtx = renderCtx;
	};

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
	 * @param{TestContext} testCtx
	 * @param{RenderContext} renderCtx
	 * @param{glsAttributeLocationTests.AttribType} type
	 * @param {number=} arraySize
	 */
	glsAttributeLocationTests.LocationAttributeTest = function(name, desc, testCtx, renderCtx, type, arraySize) {
		tcuTestCase.DeqpTest.call(this, name, desc);
		/** @type{*} */ this.m_renderCtx = renderCtx;
		/** @type{glsAttributeLocationTests.AttribType} */ this.m_type = type;
		/** @type{number} */ this.m_arraySize = arraySize || glsAttributeLocationTests.ArrayEnum.NOT;
	};

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
	 * @param{TestContext} testCtx
	 * @param{RenderContext} renderCtx
	 * @param{glsAttributeLocationTests.AttribType} type
	 * @param {number=} arraySize
	 */
	glsAttributeLocationTests.LocationMaxAttributesTest = function(name, desc, testCtx, renderCtx, type, arraySize) {
		tcuTestCase.DeqpTest.call(this, name, desc);
		/** @type{*} */ this.m_renderCtx = renderCtx;
		/** @type{glsAttributeLocationTests.AttribType} */ this.m_type = type;
		/** @type{number} */ this.m_arraySize = arraySize || glsAttributeLocationTests.ArrayEnum.NOT;
	};

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
	 * @param{TestContext} testCtx
	 * @param{RenderContext} renderCtx
	 * @param{glsAttributeLocationTests.AttribType} type
	 * @param {number=} arraySize
	 */
	glsAttributeLocationTests.LocationHoleAttributeTest = function(name, desc, testCtx, renderCtx, type, arraySize) {
		tcuTestCase.DeqpTest.call(this, name, desc);
		/** @type{*} */ this.m_renderCtx = renderCtx;
		/** @type{glsAttributeLocationTests.AttribType} */ this.m_type = type;
		/** @type{number} */ this.m_arraySize = arraySize || glsAttributeLocationTests.ArrayEnum.NOT;
	};

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
	 * @param{TestContext} testCtx
	 * @param{RenderContext} renderCtx
	 * @param{glsAttributeLocationTests.AttribType} type
	 * @param {number=} arraySize
	 */
	glsAttributeLocationTests.MixedAttributeTest = function(name, desc, testCtx, renderCtx, type, arraySize) {
		tcuTestCase.DeqpTest.call(this, name, desc);
		/** @type{*} */ this.m_renderCtx = renderCtx;
		/** @type{glsAttributeLocationTests.AttribType} */ this.m_type = type;
		/** @type{number} */ this.m_arraySize = arraySize || glsAttributeLocationTests.ArrayEnum.NOT;
	};

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
	 * @param{TestContext} testCtx
	 * @param{RenderContext} renderCtx
	 * @param{glsAttributeLocationTests.AttribType} type
	 * @param {number=} arraySize
	 */
	glsAttributeLocationTests.MixedMaxAttributesTest = function(name, desc, testCtx, renderCtx, type, arraySize) {
		tcuTestCase.DeqpTest.call(this, name, desc);
		/** @type{*} */ this.m_renderCtx = renderCtx;
		/** @type{glsAttributeLocationTests.AttribType} */ this.m_type = type;
		/** @type{number} */ this.m_arraySize = arraySize || glsAttributeLocationTests.ArrayEnum.NOT;
	};

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
	 * @param{TestContext} testCtx
	 * @param{RenderContext} renderCtx
	 * @param{glsAttributeLocationTests.AttribType} type
	 * @param {number=} arraySize
	 */
	glsAttributeLocationTests.MixedHoleAttributeTest = function(name, desc, testCtx, renderCtx, type, arraySize) {
		tcuTestCase.DeqpTest.call(this, name, desc);
		/** @type{*} */ this.m_renderCtx = renderCtx;
		/** @type{glsAttributeLocationTests.AttribType} */ this.m_type = type;
		/** @type{number} */ this.m_arraySize = arraySize || glsAttributeLocationTests.ArrayEnum.NOT;
	};

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
	 * @param{TestContext} testCtx
	 * @param{RenderContext} renderCtx
	 */
	glsAttributeLocationTests.BindRelinkAttributeTest = function(name, desc, testCtx, renderCtx) {
		tcuTestCase.DeqpTest.call(this, name, desc);
		/** @type{*} */ this.m_renderCtx = renderCtx;
	};

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
	 * @param{TestContext} testCtx
	 * @param{RenderContext} renderCtx
	 * @param{glsAttributeLocationTests.AttribType} type
	 * @param {number=} arraySize
	 */
	glsAttributeLocationTests.BindRelinkHoleAttributeTest = function(name, desc, testCtx, renderCtx, type, arraySize) {
		tcuTestCase.DeqpTest.call(this, name, desc);
		/** @type{*} */ this.m_renderCtx = renderCtx;
		/** @type{glsAttributeLocationTests.AttribType} */ this.m_type = type;
		/** @type{number} */ this.m_arraySize = arraySize || glsAttributeLocationTests.ArrayEnum.NOT;
	};

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
	 * @param{TestContext} testCtx
	 * @param{RenderContext} renderCtx
	 * @param{glsAttributeLocationTests.AttribType} type
	 * @param {number=} arraySize
	 */
	glsAttributeLocationTests.MixedRelinkHoleAttributeTest = function(name, desc, testCtx, renderCtx, type, arraySize) {
		tcuTestCase.DeqpTest.call(this, name, desc);
		/** @type{*} */ this.m_renderCtx = renderCtx;
		/** @type{glsAttributeLocationTests.AttribType} */ this.m_type = type;
		/** @type{number} */ this.m_arraySize = arraySize || glsAttributeLocationTests.ArrayEnum.NOT;
	};

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
	 * @param{TestContext} testCtx
	 * @param{RenderContext} renderCtx
	 */
	glsAttributeLocationTests.PreAttachMixedAttributeTest = function(name, desc, testCtx, renderCtx) {
		tcuTestCase.DeqpTest.call(this, name, desc);
		/** @type{*} */ this.m_renderCtx = renderCtx;
	};

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
	 * @param{TestContext} testCtx
	 * @param{RenderContext} renderCtx
	 */
	glsAttributeLocationTests.PreLinkMixedAttributeTest = function(name, desc, testCtx, renderCtx) {
		tcuTestCase.DeqpTest.call(this, name, desc);
		/** @type{*} */ this.m_renderCtx = renderCtx;
	};

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
	 * @param{TestContext} testCtx
	 * @param{RenderContext} renderCtx
	 */
	glsAttributeLocationTests.PostLinkMixedAttributeTest = function(name, desc, testCtx, renderCtx) {
		tcuTestCase.DeqpTest.call(this, name, desc);
		/** @type{*} */ this.m_renderCtx = renderCtx;
	};

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
	 * @param{TestContext} testCtx
	 * @param{RenderContext} renderCtx
	 */
	glsAttributeLocationTests.MixedReattachAttributeTest = function(name, desc, testCtx, renderCtx) {
		tcuTestCase.DeqpTest.call(this, name, desc);
		/** @type{*} */ this.m_renderCtx = renderCtx;
	};

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
	 * @param{TestContext} testCtx
	 * @param{RenderContext} renderCtx
	 */
	glsAttributeLocationTests.MixedRelinkAttributeTest = function(name, desc, testCtx, renderCtx) {
		tcuTestCase.DeqpTest.call(this, name, desc);
		/** @type{*} */ this.m_renderCtx = renderCtx;
	};

});
