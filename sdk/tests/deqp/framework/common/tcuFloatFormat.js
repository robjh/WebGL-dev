/*-------------------------------------------------------------------------
 * drawElements Quality Program Tester Core
 * ----------------------------------------
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
 * \brief Adjustable-precision floating point operations.
 *//*--------------------------------------------------------------------*/
 'use strict';
 goog.provide('framework.common.tcuFloatFormat');
 goog.require('framework.delibs.debase.deMath');

 goog.scope(function() {

     var tcuFloatFormat = framework.common.tcuFloatFormat;
     var deMath = framework.delibs.debase.deMath;

     /**
      * @enum{number}
      */
     tcuFloatFormat.YesNoMaybe = {
         NO : 0,
 	    MAYBE : 1,
 	    YES : 2
     };

     /**
      * @constructor
      * @param{number} minExp
      * @param{number} maxExp
      * @param{number} fractionBits
      * @param{boolean} exactPrecision
      * @param{tcuFloatFormat.YesNoMaybe=} hasSubnormal
      * @param{tcuFloatFormat.YesNoMaybe=} hasInf
      * @param{tcuFloatFormat.YesNoMaybe=} hasNaN
      */
     tcuFloatFormat.FloatFormat = function (minExp, maxExp, fractionBits, exactPrecision, hasSubnormal, hasInf, hasNaN) {
         // /** @type{number} */ var exponentShift (int exp) const;
     	// Interval			clampValue		(double d) const;

     	/** @type{number} */ this.m_minExp = minExp;			// Minimum exponent, inclusive
     	/** @type{number} */ this.m_maxExp = maxExp;			// Maximum exponent, inclusive
     	/** @type{number} */ this.m_fractionBits = fractionBits;		// Number of fractional bits in significand
     	/** @type{tcuFloatFormat.YesNoMaybe} */ this.m_hasSubnormal = hasSubnormal === undefined ? tcuFloatFormat.YesNoMaybe.MAYBE : hasSubnormal;		// Does the format support denormalized numbers?
     	/** @type{tcuFloatFormat.YesNoMaybe} */ this.m_hasInf = hasInf === undefined ? tcuFloatFormat.YesNoMaybe.MAYBE : hasInf;;			// Does the format support infinities?
     	/** @type{tcuFloatFormat.YesNoMaybe} */ this.m_hasNaN = hasNaN === undefined ? tcuFloatFormat.YesNoMaybe.MAYBE : hasNaN;;			// Does the format support NaNs?
     	/** @type{boolean} */ this.m_exactPrecision = exactPrecision;	// Are larger precisions disallowed?
     	/** @type{number} */ this.m_maxValue; //= (deLdExp(1.0, maxExp) +
 			// deLdExp(double((1ull << fractionBits) - 1), maxExp - fractionBits));			// Largest representable finite value.
     };

     /**
      * @return{number}
      */
     tcuFloatFormat.FloatFormat.prototype.getMinExp = function () {
     	return this.m_minExp;
     };

     /**
      * @return{number}
      */
     tcuFloatFormat.FloatFormat.prototype.getMaxExp = function () {
     	return this.m_minExp;
     };

     /**
      * @return{number}
      */
     tcuFloatFormat.FloatFormat.prototype.getMaxValue = function () {
     	return this.m_maxValue;
     };

     /**
      * @return{number}
      */
     tcuFloatFormat.FloatFormat.prototype.getFractionBits = function () {
     	return this.m_fractionBits;
     };

     /**
      * @return{tcuFloatFormat.YesNoMaybe}
      */
     tcuFloatFormat.FloatFormat.prototype.hasSubnormal = function () {
     	return this.m_hasSubnormal;
     };

     /**
      * @return{tcuFloatFormat.YesNoMaybe}
      */
     tcuFloatFormat.FloatFormat.prototype.hasSubnormal = function () {
     	return this.m_hasSubnormal;
     };

     /**
      * @return{number} x
      * @return{number} count
      */
     tcuFloatFormat.FloatFormat.prototype.ulp = function(double x, double count) {
 	    /** @type{number} */ var exp = 0;
 	    /** @type{number} */ var frac = deFractExp(deAbs(x), &exp);

 	    if (deIsNaN(frac))
 		    return TCU_NAN;
 	    else if (deIsInf(frac))
 		    return deLdExp(1.0, m_maxExp - m_fractionBits);
 	    else if (frac == 1.0) {
     		// Harrison's ULP: choose distance to closest (i.e. next lower) at binade
     		// boundary.
     		--exp;
 	    } else if (frac == 0.0)
 		    exp = m_minExp;

     	// ULP cannot be lower than the smallest quantum.
     	exp = Math.max(exp, m_minExp);

 	    {
     		const double		oneULP	= deLdExp(1.0, exp - m_fractionBits);
     		ScopedRoundingMode	ctx		(DE_ROUNDINGMODE_TO_POSITIVE_INF);

     		return oneULP * count;
 	   }
    };

});
