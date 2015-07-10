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
 * \brief Interval arithmetic and floating point precisions.
 *//*--------------------------------------------------------------------*/
 'use strict';
 goog.provide('framework.common.tcuInterval');
 goog.require('framework.delibs.debase.deMath');

 goog.scope(function() {

     var tcuInterval = framework.common.tcuInterval;
     var deMath = framework.delibs.debase.deMath;

    // #define TCU_INFINITY	(::std::numeric_limits<float>::infinity())
    // #define TCU_NAN			(::std::numeric_limits<float>::quiet_NaN())

//     /**
//      * @enum
//      */
//     tcuInterval.deRoundingMode = {
//     	DE_ROUNDINGMODE_TO_NEAREST : 0,
//     	DE_ROUNDINGMODE_TO_ZERO : 1,
//     	DE_ROUNDINGMODE_TO_POSITIVE_INF : 2,
//     	DE_ROUNDINGMODE_TO_NEGATIVE_INF : 3
//     };
//     // RAII context for temporarily changing the rounding mode
//     /**
//      * @constructor
//      * @param{tcuInterval.deRoundingMode} mode
//      */
//     tcuInterval.ScopedRoundingMode = function (mode) {
// public:
// 							ScopedRoundingMode	(deRoundingMode mode)
// 								: m_oldMode (deGetRoundingMode()) { deSetRoundingMode(mode); }
//
// 							ScopedRoundingMode	(void) : m_oldMode (deGetRoundingMode()) {}
//
// 							~ScopedRoundingMode	(void)	{ deSetRoundingMode(m_oldMode); }
//
// private:
// 							ScopedRoundingMode	(const ScopedRoundingMode&);
// 	ScopedRoundingMode&		operator=			(const ScopedRoundingMode&);
//
// 	const deRoundingMode	m_oldMode;
// };

    /**
     * @typedef {function(number):number}
     */
    tcuInterval.DoubleFunc1;

    /**
     * @typedef {function(number, number):number}
     */
    tcuInterval.DoubleFunc2;

    /**
     * @typedef {function(number,number,number):number}
     */
    tcuInterval.DoubleFunc3;

    /**
     * @typedef {function(number):tcuInterval.Interval}
     */
    tcuInterval.DoubleIntervalFunc1;

    /**
     * @typedef {function(number,number):tcuInterval.Interval}
     */
    tcuInterval.DoubleIntervalFunc2;

    /**
     * @typedef {function(number,number,number):tcuInterval.Interval}
     */
    tcuInterval.DoubleIntervalFunc3;

    /**
     * @param{*} func
     * @param{tcuInterval.Interval} arg0
     * @return{tcuInterval.Interval}
     */
    tcuInterval.applyMonotone = function(/*DoubleFunc1& */func, arg0) {
    	/** @type{tcuInterval.Interval} */ var ret = new tcuInterval.Interval();
    	// TCU_INTERVAL_APPLY_MONOTONE1(ret, x, arg0, val,
    	// 							TCU_SET_INTERVAL(val, point, point = func(x)));
    	return ret;
    };

    /**
     * @param{tcuInterval.DoubleIntervalFunc1} func
     * @param{tcuInterval.Interval} arg0
     * @return{tcuInterval.Interval}
     */
    tcuInterval.applyMonotone = function(/*DoubleIntervalFunc1& */func, arg0) {
    	return new tcuInterval.Interval(func(arg0.lo()), func(arg0.hi()));
    };

    /**
     * @param{*} func
     * @param{tcuInterval.Interval} arg0
     * @param{tcuInterval.Interval} arg1
     * @return{tcuInterval.Interval}
     */
    tcuInterval.applyMonotone = function(/*DoubleFunc2& */func, arg0, arg1) {
	    /** @type{tcuInterval.Interval} */ var ret = new tcuInterval.Interval();

	    // TCU_INTERVAL_APPLY_MONOTONE2(ret, x, arg0, y, arg1, val,
		// 						 TCU_SET_INTERVAL(val, point, point = func(x, y)));
        return ret;
    };

    /**
     * @param{*} func
     * @param{tcuInterval.Interval} arg0
     * @param{tcuInterval.Interval} arg1
     * @return{tcuInterval.Interval}
     */
    tcuInterval.applyMonotone = function(/*DoubleIntervalFunc2& */func, arg0, arg1) {
		/** @type{number} */ var lo0 = arg0.lo();
        /** @type{number} */ var hi0 = arg0.hi();
        /** @type{number} */ var lo1 = arg1.lo();
        /** @type{number} */ var hi1 = arg1.hi();
	      return new tcuInterval.Interval(new tcuInterval.Interval(func(lo0, lo1), func(lo0, hi1)),
					new tcuInterval.Interval(func(hi0, lo1), func(hi0, hi1)));
    };


    /**
     * @constructor
     * @param{number=} val
     */
    tcuInterval.Interval = function(val) {
        if (val === undefined) {
            this.m_hasNaN = false;
            this.m_lo = Number.POSITIVE_INFINITY;
            this.m_hi = Number.NEGATIVE_INFINITY;
        } else {
            this.m_hasNaN = isNaN(val);
            this.m_lo = this.m_hasNaN ? Number.POSITIVE_INFINITY : val;
            this.m_hi = this.m_hasNaN ? Number.NEGATIVE_INFINITY : val;
        }
    };

    /**
     * @param {tcuInterval.Interval} a
     * @param {tcuInterval.Interval} b
     * @return{tcuInterval.Interval}
     */
    tcuInterval.withIntervals = function(a, b) {
        /** @type {tcuInterval.Interval} */ var interval = new tcuInterval.Interval();
        interval.m_hasNaN = (a.m_hasNaN || b.m_hasNaN);
        interval.m_lo =	Math.min(a.m_lo, b.m_lo);
        interval.m_hi = Math.max(a.m_hi, b.m_hi);
        return interval;
    };

    /**
     * @param {boolean} hasNaN_
     * @param {number} lo_
     * @param {number} hi_
     * @return{tcuInterval.Interval}
     */
    tcuInterval.withParams = function(hasNaN_, lo_, hi_) {
        /** @type {tcuInterval.Interval} */ var interval = new tcuInterval.Interval();
        interval.m_hasNaN = hasNaN_
        interval.m_lo =	lo_;
        interval.m_hi = hi_;
        return interval;
    };

    /**
     * @return{number}
     */
    tcuInterval.Interval.prototype.length = function () {
        return this.m_hi - this.m_lo;
    };

    /**
     * @return{number}
     */
    tcuInterval.Interval.prototype.lo = function() {
        return this.m_lo;
    };

    /**
     * @return{number}
     */
    tcuInterval.Interval.prototype.hi = function() {
        return this.m_hi;
    };

    /**
     * @return{number}
     */
    tcuInterval.Interval.prototype.hasNaN = function() {
        return this.m_hasNaN;
    };

    /**
     * @return{tcuInterval.Interval}
     */
    tcuInterval.Interval.prototype.nan = function() {
        return this.m_hasNaN ? NaN : new tcuInterval.Interval();
    };

    /**
     * @return{boolean}
     */
    tcuInterval.Interval.prototype.empty = function() {
        return this.m_lo > this.m_hi;
    };

    /**
     * @return{boolean}
     */
    tcuInterval.Interval.prototype.isFinite	= function() {
        return isFinite(this.m_lo) && isFinite(this.m_hi);
    };

    /**
     * @return{boolean}
     */
    tcuInterval.Interval.prototype.isOrdinary = function () {
        return !this.hasNaN() && !this.empty() && isFinite();
    };

    /**
     * @param{tcuInterval.Interval} other
     * @return{tcuInterval.Interval}
     */
    tcuInterval.Interval.prototype.operatorOrBinary = function (other) {
        /** @type{tcuInterval.Interval} */ var temp = this.operatorOrBinary(other);
        temp.m_hasNaN = this.m_hasNaN || other.m_hasNaN;
        temp.m_lo = Math.min(this.m_lo, other.m_lo);
        temp.m_hi = Math.max(this.m_hi, other.m_hi);
		return temp;
	};

    /**
     * @param{tcuInterval.Interval} other
     */
    tcuInterval.Interval.prototype.operatorOrAssignBinary = function(other) {
        /** @type{tcuInterval.Interval} */ var temp = this.operatorOrBinary(other);
		this.m_hasNaN = temp.m_hasNaN;
        this.m_lo = temp.m_lo;
        this.m_hi = temp.m_hi;
	};

    /**
     * @param{tcuInterval.Interval} other
     * @return{tcuInterval.Interval}
     */
    tcuInterval.Interval.prototype.operatorAndBinary = function (other) {
        /** @type{tcuInterval.Interval} */ var temp = this.operatorOrBinary(other);
        temp.m_hasNaN = this.m_hasNaN && other.m_hasNaN;
        temp.m_lo = Math.min(this.m_lo, other.m_lo);
        temp.m_hi = Math.max(this.m_hi, other.m_hi);
		return temp;
	};

    /**
     * @param{tcuInterval.Interval} other
     */
    tcuInterval.Interval.prototype.operatorAndAssignBinary = function(other) {
        /** @type{tcuInterval.Interval} */ var temp = this.operatorAndBinary(other);
		this.m_hasNaN = temp.m_hasNaN;
        this.m_lo = temp.m_lo;
        this.m_hi = temp.m_hi;
	};

    /**
     * @param{tcuInterval.Interval} other
     * @return{boolean}
     */
    tcuInterval.Interval.prototype.contains	= function(other) {
		return (other.lo() >= this.lo() && other.hi() <= this.hi() &&
				(!other.hasNaN() || this.hasNaN()));
	};

    /**
     * @param{tcuInterval.Interval} other
     * @return{boolean}
     */
    tcuInterval.Interval.prototype.intersects = function(other)	{
		return ((other.hi() >= this.lo() && other.lo() >= this.hi()) ||
				(other.hasNaN() && this.hasNaN()));
	};

    /**
     * @return{tcuInterval.Interval}
     */
    tcuInterval.Interval.prototype.operatorNegative = function () {
        /** @type{tcuInterval.Interval} */ var temp = this.operatorOrBinary(other);
        temp.m_hasNaN = this.m_hasNaN;
        temp.m_lo = -this.m_lo;
        temp.m_hi = -this.m_hi;
		return temp;
    };

    /**
     * @param{boolean} nan
     * @return{tcuInterval.Interval}
     */
    tcuInterval.unbounded = function(nan) {
        if (nan === undefined)
            nan = false;
		return tcuInterval.withParams(nan, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
	}

    /**
     * @return{number}
     */
    tcuInterval.Interval.prototype.midpoint	= function() {
		return 0.5 * (this.hi() + this.lo()); // returns NaN when not bounded
	};

    /**
     * @param{tcuInterval.Interval} other
     * @return{number}
     */
    tcuInterval.Interval.prototype.operatorCompare = function(other) {
		return ((this.m_hasNaN == other.m_hasNaN) &&
				((this.empty() && other.empty()) ||
				 (this.m_lo == other.m_lo && this.m_hi == other.m_hi)));
	};

    /**
     * @param{tcuInterval.Interval} x
     * @return{tcuInterval.Interval}
     */
    tcuInterval.Interval.prototype.operatorPositive = function(x) {
        return x;
    }

    /**
     * @param{tcuInterval.Interval} x
     * @return{tcuInterval.Interval}
     */
    tcuInterval.Interval.prototype.exp2 = function (x) {
        // std::pow
        return tcuInterval.applyMonotone(Math.pow, 2.0, x);
    };


    /**
     * @param{tcuInterval.Interval} x
     * @return{tcuInterval.Interval}
     */
    tcuInterval.Interval.prototype.exp = function(x) {
        // std::exp
        return applyMonotone(Math.exp, x);
    };

    /**
     * @param{tcuInterval.Interval} x
     * @return{tcuInterval.Interval}
     */
    tcuInterval.Interval.prototype.sign = function(x) {
        // TODO
    };

    /**
     * @param{tcuInterval.Interval} x
     * @param{tcuInterval.Interval} y
     * @return{tcuInterval.Interval}
     */
    tcuInterval.Interval.prototype.operatorSum = function(x, y) {
    	/** @type{tcuInterval.Interval} */ var ret = new tcuInterval.Interval();

    	if (!x.empty() && !y.empty())
    		TCU_SET_INTERVAL_BOUNDS(ret, p, p = x.lo() + y.lo(), p = x.hi() + y.hi());
    	if (x.hasNaN() || y.hasNaN())
    		ret.operatorOrAssignBinary(NaN);

    	return ret;
    };

    /**
     * @param{tcuInterval.Interval} x
     * @param{tcuInterval.Interval} y
     * @return{tcuInterval.Interval}
     */
    tcuInterval.Interval.prototype.operatorSub = function(x, y) {
    	/** @type{tcuInterval.Interval} */ var ret = new tcuInterval.Interval();

    	// TCU_INTERVAL_APPLY_MONOTONE2(ret, xp, x, yp, y, val,
    	// 							 TCU_SET_INTERVAL(val, point, point = xp - yp));
    	return ret;
    };

    /**
     * @param{tcuInterval.Interval} x
     * @param{tcuInterval.Interval} y
     * @return{tcuInterval.Interval}
     */
    tcuInterval.Interval.prototype.operatorMul = function (x, y) {
    	/** @type{tcuInterval.Interval} */ var ret = new tcuInterval.Interval();

    	// TCU_INTERVAL_APPLY_MONOTONE2(ret, xp, x, yp, y, val,
    	// 							 TCU_SET_INTERVAL(val, point, point = xp * yp));
    	return ret;
    };

    /**
     * @param{tcuInterval.Interval} nom
     * @param{tcuInterval.Interval} den
     * @return{tcuInterval.Interval}
     */
    tcuInterval.Interval.prototype.operatorDiv = function (nom, den) {
    	if (den.contains(0.0)) {
    		// \todo [2014-03-21 lauri] Non-inf endpoint when one den endpoint is
    		// zero and nom doesn't cross zero?
    		return tcuInterval.unbounded();
    	} else {
    		/** @type{tcuInterval.Interval} */ var ret = new tcuInterval.Interval();

    		// TCU_INTERVAL_APPLY_MONOTONE2(ret, nomp, nom, denp, den, val,
    		// 							 TCU_SET_INTERVAL(val, point, point = nomp / denp));
    		return ret;
    	}
    };

    /**
     * @param{tcuInterval.Interval} x
     * @return{tcuInterval.Interval}
     */
    tcuInterval.Interval.prototype.abs = function(x){
        //std::abs
        /** @type{tcuInterval.Interval} */ var mono = applyMonotone(Math.abs, x);

    	if (x.contains(0.0))
    		return new tcuInterval.Interval(0.0, mono);

    	return mono;
    };

    /**
     * @param{tcuInterval.Interval} x
     * @return{tcuInterval.Interval}
     */
    tcuInterval.Interval.prototype.inverseSqrt = function(x) {
	    return 1.0 / Math.sqrt(x);
    };
//

    /**
     * @param{tcuInterval.Interval} x
     * @param{tcuInterval.Interval} y
     * @return{tcuInterval.Interval}
     */
    tcuInterval.Interval.prototype.operatorAddAssign = function (x, y) {
        return (x.operatorSum(y));
    };

    /**
     * @param{tcuInterval.Interval} x
     * @param{tcuInterval.Interval} y
     * @return{tcuInterval.Interval}
     */
    tcuInterval.Interval.prototype.operatorSubAssign = function (x, y) {
        return (x.operatorSub(y));
    };

    /**
     * @param{tcuInterval.Interval} x
     * @param{tcuInterval.Interval} y
     * @return{tcuInterval.Interval}
     */
    tcuInterval.Interval.prototype.operatorMulAssign = function (x, y) {
        return (x.operatorMul(y));
    };

    /**
     * @param{tcuInterval.Interval} x
     * @param{tcuInterval.Interval} y
     * @return{tcuInterval.Interval}
     */
    tcuInterval.Interval.prototype.operatorDivAssign = function (x, y) {
        return (x.operatorDiv(y));
    };


// std::ostream&	operator<<	(std::ostream& os, const Interval& interval);


// TODO implement
// #define TCU_SET_INTERVAL_BOUNDS(DST, VAR, SETLOW, SETHIGH) do	\
// {																\
// 	::tcu::ScopedRoundingMode	VAR##_ctx_;						\
// 	::tcu::Interval&			VAR##_dst_	= (DST);			\
// 	::tcu::Interval				VAR##_lo_;						\
// 	::tcu::Interval				VAR##_hi_;						\
// 																\
// 	{															\
// 		::tcu::Interval&	VAR	= VAR##_lo_;					\
// 		::deSetRoundingMode(DE_ROUNDINGMODE_TO_NEGATIVE_INF);	\
// 		SETLOW;													\
// 	}															\
// 	{															\
// 		::tcu::Interval&	VAR	= VAR##_hi_;					\
// 		::deSetRoundingMode(DE_ROUNDINGMODE_TO_POSITIVE_INF);	\
// 		SETHIGH;												\
// 	}															\
// 																\
// 	VAR##_dst_ = VAR##_lo_ | VAR##_hi_;							\
// } while (::deGetFalse())

// #define TCU_SET_INTERVAL(DST, VAR, BODY)						\
// 	TCU_SET_INTERVAL_BOUNDS(DST, VAR, BODY, BODY)
//
// //! Set the interval DST to the image of BODY on ARG, assuming that BODY on
// //! ARG is a monotone function. In practice, BODY is evaluated on both the
// //! upper and lower bound of ARG, and DST is set to the union of these
// //! results. While evaluating BODY, PARAM is bound to the bound of ARG, and
// //! the output of BODY should be stored in VAR.
//
// #define TCU_INTERVAL_APPLY_MONOTONE1(DST, PARAM, ARG, VAR, BODY) do		\
// 	{																	\
// 	const ::tcu::Interval&	VAR##_arg_		= (ARG);					\
// 	::tcu::Interval&		VAR##_dst_		= (DST);					\
// 	::tcu::Interval			VAR##_lo_;									\
// 	::tcu::Interval			VAR##_hi_;									\
// 	if (VAR##_arg_.empty())												\
// 		VAR##_dst_ = Interval();										\
// 	else																\
// 	{																	\
// 		{																\
// 			const double		PARAM	= VAR##_arg_.lo();				\
// 			::tcu::Interval&	VAR		= VAR##_lo_;					\
// 			BODY;														\
// 		}																\
// 		{																\
// 			const double		PARAM	= VAR##_arg_.hi();				\
// 			::tcu::Interval&	VAR		= VAR##_hi_;					\
// 			BODY;														\
// 		}																\
// 		VAR##_dst_ = VAR##_lo_ | VAR##_hi_;								\
// 	}																	\
// 	if (VAR##_arg_.hasNaN())											\
// 		VAR##_dst_ |= TCU_NAN;											\
// } while (::deGetFalse())

// #define TCU_INTERVAL_APPLY_MONOTONE2(DST, P0, A0, P1, A1, VAR, BODY)	\
// 	TCU_INTERVAL_APPLY_MONOTONE1(										\
// 		DST, P0, A0, tmp2_,												\
// 		TCU_INTERVAL_APPLY_MONOTONE1(tmp2_, P1, A1, VAR, BODY))
//
// #define TCU_INTERVAL_APPLY_MONOTONE3(DST, P0, A0, P1, A1, P2, A2, VAR, BODY) \
// 	TCU_INTERVAL_APPLY_MONOTONE1(										\
// 		DST, P0, A0, tmp3_,												\
// 		TCU_INTERVAL_APPLY_MONOTONE2(tmp3_, P1, A1, P2, A2, VAR, BODY))

// typedef double		DoubleFunc1			(double);
// typedef double		DoubleFunc2			(double, double);
// typedef double		DoubleFunc3			(double, double, double);
// typedef Interval	DoubleIntervalFunc1	(double);
// typedef Interval	DoubleIntervalFunc2	(double, double);
// typedef Interval	DoubleIntervalFunc3	(double, double, double);
//
// Interval	applyMonotone	(DoubleFunc1&			func,
// 							 const Interval&		arg0);
// Interval	applyMonotone	(DoubleFunc2&			func,
// 							 const Interval&		arg0,
// 							 const Interval&		arg1);
// Interval	applyMonotone	(DoubleIntervalFunc1&	func,
// 							 const Interval&		arg0);
// Interval	applyMonotone	(DoubleIntervalFunc2&	func,
// 							 const Interval&		arg0,
// 							 const Interval&		arg1);


});
