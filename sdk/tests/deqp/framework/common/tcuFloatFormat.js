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
 goog.require('framework.common.tcuInterval');

 goog.scope(function() {

     var tcuFloatFormat = framework.common.tcuFloatFormat;
     var deMath = framework.delibs.debase.deMath;
     var tcuInterval = framework.common.tcuInterval;

     /**
      * @param{tcuFloatFormat.YesNoMaybe} choice
      * @param{tcuInterval.Interval} no
      * @param{tcuInterval.Interval} yes
      * @return{tcuFloatFormat.YesNoMaybe}
      */
    tcuFloatFormat.chooseInterval = function(choice, no, yes) {
    	switch (choice)
    	{
    		case tcuFloatFormat.YesNoMaybe.NO:	return no;
    		case tcuFloatFormat.YesNoMaybe.YES:	return yes;
    		case tcuFloatFormat.YesNoMaybe.MAYBE:	return no.operatorOrBinary(yes);
    		default: throw new Error(!"Impossible case");
    	}
    	return new tcuInterval.Interval();
    };

    /**
     * @param{number} maxExp
     * @param{number} fractionBits
     * @return{number}
     */
    tcuFloatFormat.computeMaxValue = function(maxExp, fractionBits) {
    	return 0;
        // (deLdExp(1.0, maxExp) +   			deLdExp(double((1ull << fractionBits) - 1), maxExp - fractionBits));
    };

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
      * @param{number} x
      * @param{number} count
      * @return{number}
      */
     tcuFloatFormat.FloatFormat.prototype.ulp = function(x, count) {
 	    /** @type{number} */ var exp = 0;
 	    /** @type{number} */ var frac = deFractExp(deAbs(x), exp);

 	    if (isNaN(frac))
 		    return NaN;
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
     		/** @type{number} */ var oneULP	= deLdExp(1.0, exp - m_fractionBits);
     	// 	ScopedRoundingMode	ctx		(DE_ROUNDINGMODE_TO_POSITIVE_INF);

     		return oneULP * count;
 	   }
    };

    /**
     * Return the difference between the given nominal exponent and
     * the exponent of the lowest significand bit of the
     * representation of a number with this format.
     * For normal numbers this is the number of significand bits, but
     * for subnormals it is less and for values of exp where 2^exp is too
     * small to represent it is <0
     * @param{number} exp
     * @return{number}
     */
    tcuFloatFormat.FloatFormat.prototype.exponentShift = function(exp) {
    	return m_fractionBits - Math.max(this.m_minExp - exp, 0);
    };

    /**
     * @param{number} d
     * @param{boolean} upward
     * @return{number}
     */
    tcuFloatFormat.FloatFormat.prototype.round = function(d, upward) {
    	/** @type{number} */ var exp = 0;
    	/** @type{tcuInterval.Interval} */ var	frac		= deFractExp(d, exp);
    	/** @type{tcuInterval.Interval} */ var		shift		= exponentShift(exp);
    	/** @type{tcuInterval.Interval} */ var	shiftFrac	= deLdExp(frac, shift);
    	/** @type{tcuInterval.Interval} */ var	roundFrac	= upward ? Math.ceil(shiftFrac) : Math.floor(shiftFrac);

    	return deLdExp(roundFrac, exp - shift);
    };

    /**
     * Return the range of numbers that `d` might be converted to in the
     * floatformat, given its limitations with infinities, subnormals and maximum
     * exponent.
     * @param{number} d
     * @return{tcuInterval.interval}
     */
     tcuFloatFormat.FloatFormat.prototype.clampValue = function(d) {
    	/** @type{number} */ var	rSign		= deSign(d);
    	/** @type{number} */ var	rExp		= 0;

    	// DE_ASSERT(!isNaN(d));

    	deFractExp(d, rExp);
    	if (rExp < m_minExp)
    		return chooseInterval(m_hasSubnormal, rSign * 0.0, d);
    	else if (deIsInf(d) || rExp > m_maxExp)
    		return chooseInterval(m_hasInf, rSign * getMaxValue(), rSign * Number.POSITIVE_INFINITY);

    	return new tcuInterval.Interval(d);
    };

    /**
     * @param{tcuInterval.Interval} x
     * @param{boolean} roundUnderOverflow
     * @return{tcuInterval.Interval}
     */
    tcuFloatFormat.FloatFormat.prototype.roundOut = function(x, roundUnderOverflow){
    	/** @type{tcuInterval.Interval} */ var ret = x.nan();

    	if (!x.empty())
    		ret.operatorOrAddBinary(new tcuInterval.Interval(this.roundOut(x.lo(), false, roundUnderOverflow),
    						this.roundOut(x.hi(), true, roundUnderOverflow)));
    	return ret;
    };

    //! Return the range of numbers that might be used with this format to
    //! represent a number within `x`.
    /**
     * @param{tcuInterval.Interval} x
     * @return{tcuInterval.Interval}
     */
    tcuFloatFormat.FloatFormat.prototype.convert = function(x) {
    	/** @type{tcuInterval.Interval} */ var ret = new tcuInterval.Interval();
    	/** @type{tcuInterval.Interval} */ var tmp = x;

    	if (x.hasNaN())	{
    		// If NaN might be supported, NaN is a legal return value
    		if (m_hasNaN != tcuFloatFormat.YesNoMaybe.NO)
    			ret.operatorOrAssignBinary(NaN);

    		// If NaN might not be supported, any (non-NaN) value is legal,
    		// _subject_ to clamping. Hence we modify tmp, not ret.
    		if (m_hasNaN != tcuFloatFormat.YesNoMaybe.YES)
    			tmp = tcuInterval.unbounded();
    	}

    	// Round both bounds _inwards_ to closest representable values.
    	if (!tmp.empty())
    		ret.operatorOrAssignBinary(
                this.clampValue(this.round(tmp.lo(), true)).operatorOrBinary(
                    this.clampValue(this.round(tmp.hi(), false))));

    	// If this format's precision is not exact, the (possibly out-of-bounds)
    	// original value is also a possible result.
    	if (!m_exactPrecision)
    		ret.operatorOrAssignBinary(x);

    	return ret;
    };

    /**
     * @param{number} x
     * @return{string}
     */
    tcuFloatFormat.FloatFormat.prototype.floatToHex	= function(x){
    	if (isNaN(x))
    		return 'NaN';
    	else if (deIsInf(x))
    		return (x < 0.0 ? '-' : '+') + ('inf');
    	else if (x == 0.0) // \todo [2014-03-27 lauri] Negative zero
    		return '0.0';

    	/** @type{number} */ var	exp			= 0;
    	/** @type{number} */ var	frac		= deFractExp(deAbs(x), exp);
    	/** @type{number} */ var	shift		= exponentShift(exp);
    	/** @type{number} */ var	bits		= deUint64(deLdExp(frac, shift));
    	/** @type{number} */ var	whole		= bits >> m_fractionBits;
    	/** @type{number} */ var	fraction	= bits & ((deUint64(1) << m_fractionBits) - 1);
    	/** @type{number} */ var	exponent	= exp + m_fractionBits - shift;
    	/** @type{number} */ var	numDigits	= (m_fractionBits + 3) / 4;
    	/** @type{number} */ var	aligned		= fraction << (numDigits * 4 - m_fractionBits);
    	/** @type{string} */ var	oss = '';

        // TODO
    	// oss + (x < 0 ? '-' : '')
    	// 	+ '0x' + whole + '.'
    	// 	+ std::hex + std::setw(numDigits) + std::setfill('0') + aligned
    	// 	+ 'p' + std::dec + std::setw(0) + exponent;

    	return oss;
    };

    /**
     * @param{tcuInterval.Interval} interval
     * @return{string}
     */
    tcuFloatFormat.FloatFormat.prototype.intervalToHex = function(interval) {
    	if (interval.empty())
    		return interval.hasNaN() ? '{ NaN }' : '{}';

    	else if (interval.lo() == interval.hi())
    		return ((interval.hasNaN() ? '{ NaN, ' : '{ ') +
    				this.floatToHex(interval.lo()) + ' }');
    	else if (interval == tcuInterval.unbounded(true))
    		return '<any>';

    	return ((interval.hasNaN() ? '{ NaN } | ' : '') +
    			'[' + this.floatToHex(interval.lo()) + ', ' + this.floatToHex(interval.hi()) + ']');
    };

	// static FloatFormat	nativeFloat		(void);
	// static FloatFormat	nativeDouble	(void);

    /**
     * @param{*} t
     * @return{tcuFloatFormat.FloatFormat}
     */
    tcuFloatFormat.FloatFormat.prototype.nativeFormat = function(/* template */t) {
    	// typedef std::numeric_limits<T>
        /** @type{?} */ var Limits;

    	if(Limits.radix == 2) {
            throw new Error('Radix must 2');
        }

    	return new tcuFloatFormat.FloatFormat(Limits.min_exponent - 1,	// These have a built-in offset of one
    					   Limits.max_exponent - 1,
    					   Limits.digits - 1,			// don't count the hidden bit
    					   Limits.has_denorm != denorm_absent, //std::denorm_absent
    					   Limits.has_infinity ? tcuFloatFormat.YesNoMaybe.YES : tcuFloatFormat.YesNoMaybe.NO,
    					   Limits.has_quiet_NaN ? tcuFloatFormat.YesNoMaybe.YES : tcuFloatFormat.YesNoMaybe.NO,
    					   ((Limits.has_denorm == denorm_present) ? tcuFloatFormat.YesNoMaybe.YES : //denorm_present
    						(Limits.has_denorm == denorm_absent) ? tcuFloatFormat.YesNoMaybe.NO : //denorm_absent
    						tcuFloatFormat.YesNoMaybe.MAYBE));
    };

    // FloatFormat	FloatFormat::nativeFloat (void)
    // {
    // 	return nativeFormat<float>();
    // }
    //
    // FloatFormat	FloatFormat::nativeDouble (void)
    // {
    // 	return nativeFormat<double>();
    // }

});
