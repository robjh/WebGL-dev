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
goog.provide('modules.shared.glsBuiltinPrecisionTests');
goog.require('framework.common.tcuTestCase');
goog.require('framework.opengl.gluShaderProgram');
goog.require('framework.opengl.gluShaderUtil');
goog.require('framework.common.tcuInterval');
goog.require('framework.common.tcuFloatFormat');
goog.require('framework.delibs.debase.deRandom');
goog.require('modules.shared.glsShaderExecUtil');
goog.require('framework.opengl.simplereference.sglrGLContext');
goog.require('framework.delibs.debase.deMath');
goog.require('framework.delibs.debase.deUtil');
goog.require('framework.opengl.gluVarType');


goog.scope(function() {

    var glsBuiltinPrecisionTests = modules.shared.glsBuiltinPrecisionTests;
    var tcuTestCase = framework.common.tcuTestCase;
    var gluShaderProgram = framework.opengl.gluShaderProgram;
    var gluShaderUtil = framework.opengl.gluShaderUtil;
    var tcuInterval = framework.common.tcuInterval;
    var tcuFloatFormat = framework.common.tcuFloatFormat;
    var deRandom = framework.delibs.debase.deRandom;
    var glsShaderExecUtil = modules.shared.glsShaderExecUtil;
    var sglrGLContext = framework.opengl.simplereference.sglrGLContext;
    var deMath = framework.delibs.debase.deMath;
    var deUtil = framework.delibs.debase.deUtil;
    var gluVarType = framework.opengl.gluVarType;


    var DE_ASSERT = function(x) {
        if (!x)
            throw new Error('Assert failed');
    };

var setParentClass = function(child, parent) {
    child.prototype = Object.create(parent.prototype);
    child.prototype.constructor = child;
};

// public:
// 	Interval			roundOut		(const Interval& x, bool roundUnderOverflow) const;
// 	double				round			(double d, bool upward) const;
// 	double				roundOut		(double d, bool upward, bool roundUnderOverflow) const;
// 	Interval			convert			(const Interval& x) const;
//
// 	std::string			floatToHex		(double x) const;
// 	std::string 		intervalToHex	(const Interval& interval) const;
//
// 	static FloatFormat	nativeFloat		(void);
// 	static FloatFormat	nativeDouble	(void);


    /**
     TREE OF HERITAGE
     ---------- Signature
     Signature (struct)
        uses . Traits<>
            <void>
            <bool,float,int>
                ScalarTraits
            <Matrix<T,Rows,Cols>,vector<T,size>>
                ContainerTraits
        uses . Tuple4<>


     */

    /**
     * @param{number} value
     * @return {boolean}
     */
    glsBuiltinPrecisionTests.isFloat = function(value) {
        return value % 1 !== 0;
 	};

    /**
     * @constructor
     * @param{*=} t
     */
    glsBuiltinPrecisionTests.Void = function(t) {
        this.isVoid = true;
	};

    /**
     * @param {*} fmt
     * @param {number} val
     * @return {string}
     */
    var valueToString = function(fmt, val) {
        //TODO: Change to use doPrintValue instead.
        return val.toString();
        //return val.doPrintValue(fmt, val);
    };

    /**
     * @param {*} fmt
     * @param {tcuInterval.Interval} ival
     * @return {string}
     */
    var intervalToString = function(fmt, ival) {
        return ival.toString();
    };

    /**
     * @constructor
     * @param{string=} R
     * @param{string=} P0
     * @param{string=} P1
     * @param{string=} P2
     * @param{string=} P3
     */
    glsBuiltinPrecisionTests.Signature = function (R, P0, P1, P2, P3) {
        this.Ret = R;
        this.Arg0 = P0 === undefined ? 'void' : P0;
        this.Arg1 = P1 === undefined ? 'void' : P1;
        this.Arg2 = P2 === undefined ? 'void' : P2;
        this.Arg3 = P3 === undefined ? 'void' : P3;

        this.IRet = glsBuiltinPrecisionTests.Traits.traitsFactory(R);
        this.IArg0 = glsBuiltinPrecisionTests.Traits.traitsFactory(P0);
        this.IArg1 = glsBuiltinPrecisionTests.Traits.traitsFactory(P1);
        this.IArg2 = glsBuiltinPrecisionTests.Traits.traitsFactory(P2);
        this.IArg3 = glsBuiltinPrecisionTests.Traits.traitsFactory(P3);

        this.Args = new glsBuiltinPrecisionTests.Tuple4(this.Arg0, this.Arg1, this.Arg2, this.Arg3);
        this.IArgs = new glsBuiltinPrecisionTests.Tuple4(this.IArg0, this.IArg1, this.IArg2, this.IArg3);
        this.ArgExprs = new glsBuiltinPrecisionTests.Tuple4(this.IArg0, this.IArg1, this.IArg2, this.IArg3);
    };

    /** @typedef {Array<glsBuiltinPrecisionTests.FuncBase>} */
    glsBuiltinPrecisionTests.FuncSet;

    /**
     * @typedef {glsBuiltinPrecisionTests.Tuple4}
     */
    glsBuiltinPrecisionTests.ParamNames;

    /**
     * @constructor
     * @param{*} A0
     * @param{*} A1
     * @param{*} A2
     * @param{*} A3
     */
    glsBuiltinPrecisionTests.Tuple4 = function(A0, A1, A2, A3) {
        this.a = A0 === undefined ? 'void' : A0;
        this.b = A1 === undefined ? 'void' : A1;
        this.c = A2 === undefined ? 'void' : A2;
        this.d = A3 === undefined ? 'void' : A3;
    };

    /**
     * Returns true for all other types except Void
     * @param{*} T
     */
    glsBuiltinPrecisionTests.isTypeValid = function(T) {
        if (T === 'void')
            return false;
        return true;
    };


    /**
     * template <typename In>
     * Returns true for all other types except Void
     * @param{*} In
     * @return{number}
     */
    glsBuiltinPrecisionTests.numInputs = function(In) {
    	return (!glsBuiltinPrecisionTests.isTypeValid(In.In0) ? 0 :
    			!glsBuiltinPrecisionTests.isTypeValid(In.In1) ? 1 :
    			!glsBuiltinPrecisionTests.isTypeValid(In.In2) ? 2 :
    			!glsBuiltinPrecisionTests.isTypeValid(In.In3) ? 3 :
    			4);
    };

    /**
     * template <typename Out>
     * Returns true for all other types except Void
     * @param{*} Out
     * @return{number}
     */
    glsBuiltinPrecisionTests.numOutputs = function(Out) {
        return (!glsBuiltinPrecisionTests.isTypeValid(Out.Out0) ? 0 :
                !glsBuiltinPrecisionTests.isTypeValid(Out.Out1) ? 1 :
                2);
    };

    /**
     * template<typename In0_ = Void, typename In1_ = Void, typename In2_ = Void, typename In3_ = Void>
     * @constructor
     * @param{*} In0_
     * @param{*} In1_
     * @param{*} In2_
     * @param{*} In3_
     */
    glsBuiltinPrecisionTests.InTypes = function(In0_, In1_, In2_, In3_) {
        this.In0 = In0_ === undefined ? 'void' : In0_;
        this.In1 = In1_ === undefined ? 'void' : In1_;
        this.In2 = In2_ === undefined ? 'void' : In2_;
        this.In3 = In3_ === undefined ? 'void' : In3_;
    };

    /**
     * template<typename Out0_, typename Out1_ = Void>
     * @constructor
     * @param{*} Out0_
     * @param{*} Out1_
     */
    glsBuiltinPrecisionTests.OutTypes = function(Out0_, Out1_) {
        this.Out0 = Out0_ === undefined ? 'void' : Out0_;
        this.Out1 = Out1_ === undefined ? 'void' : Out1_;
    };

    /**
     * @constructor
     */
    glsBuiltinPrecisionTests.Environment = function() {
        /** @type{Object} */ this.m_map = {};
    };

    /**
     * @param{glsBuiltinPrecisionTests.Variable} variable
     * @param{*} value
     */
    glsBuiltinPrecisionTests.Environment.prototype.bind = function(variable, value) {
        this.m_map[variable.getName()] = deUtil.clone(value);
    };

    /**
     * @param{glsBuiltinPrecisionTests.Variable} variable
     * @return{*}
     */
    glsBuiltinPrecisionTests.Environment.prototype.lookup = function(variable) {
    	return this.m_map[variable.getName()];
    };

    /**
     * @constructor
     * @param{tcuFloatFormat.FloatFormat} format_
     * @param{gluShaderUtil.precision} floatPrecision_
     * @param{glsBuiltinPrecisionTests.Environment} env_
     * @param{number?} callDepth_
     */
    glsBuiltinPrecisionTests.EvalContext = function (format_, floatPrecision_, env_, callDepth_) {
		this.format = format_;
		this.floatPrecision = floatPrecision_;
		this.env = env_;
		this.callDepth = callDepth_ === undefined ? 0 : callDepth_;
    };

    /**
     * @param{string} T typename
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{*} value
     * @return{tcuInterval.Interval}
     */
     glsBuiltinPrecisionTests.convert = function(T, fmt, value) {
    	return glsBuiltinPrecisionTests.Traits.traitsFactory(T).doConvert(fmt, value);
    };

    /**
     * Returns true if every element of `ival` contains the corresponding element of `value`.
     * @param{string} T typename
     * @param{*} ival
     * @param{*} value
     * @return{boolean}
     */
     glsBuiltinPrecisionTests.contains = function(T, ival, value) {
    	return glsBuiltinPrecisionTests.Traits.traitsFactory(T).doContains(ival, value);
    };


    /**
     * @param{string} typename
     * @constructor
     */
    glsBuiltinPrecisionTests.Traits = function(typename) {
        this.typename = typename;
    };

    /**
     * @param{string=} typename
     */
    glsBuiltinPrecisionTests.Traits.traitsFactory = function(typename) {
        switch (typename) {
            case 'array' : return new glsBuiltinPrecisionTests.ContainerTraits('float');
            case 'boolean' : return new glsBuiltinPrecisionTests.TraitsBool();
            case 'float' :  return new glsBuiltinPrecisionTests.TraitsFloat();
            case 'int' :  return new glsBuiltinPrecisionTests.TraitsInt();
            case 'void' :  return new glsBuiltinPrecisionTests.TraitsVoid();
            default: return null;
        }
    };

    glsBuiltinPrecisionTests.round = function(T, fmt, value) {
        var traits = glsBuiltinPrecisionTests.Traits.traitsFactory(T);
        return traits.doRound(fmt, value);
    }

    /**
     * cast the input typed array to correct type
     * @param {string} T
     * @param{goog.TypedArray} input
     * @return{goog.TypedArray}
     */
    glsBuiltinPrecisionTests.cast = function(T, input) {
        var traits = glsBuiltinPrecisionTests.Traits.traitsFactory(T);
        return traits.doCast(input);
    }

    /**
     * @constructor
     * @extends{glsBuiltinPrecisionTests.Traits}
     */
    glsBuiltinPrecisionTests.TraitsVoid = function() {
        glsBuiltinPrecisionTests.Traits.call(this, 'void');
    };

    setParentClass(glsBuiltinPrecisionTests.TraitsVoid, glsBuiltinPrecisionTests.Traits);

    /**
     * @param{*} value
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.TraitsVoid.prototype.doMakeIVal = function(value) {
        return new tcuInterval.Interval();
    };
  
    /**
     * @param{*} value1
     * @param{*} value2
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.TraitsVoid.prototype.doUnion = function(value1, value2) {
        return new tcuInterval.Interval();
    };

    /**
     * @param{*} value
     * @return {boolean}
     */
    glsBuiltinPrecisionTests.TraitsVoid.prototype.doContains = function(value) {
        return true;
    };

    /**
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{tcuInterval.Interval} ival
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.TraitsVoid.prototype.doConvert = function(fmt, ival) {
        return new tcuInterval.Interval();
    };

    /**
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{*} ival
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.TraitsVoid.prototype.doRound = function(fmt, ival) {
        return new tcuInterval.Interval();
    };

    /**
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{*} ival
     */
    glsBuiltinPrecisionTests.TraitsVoid.prototype.doPrintIVal = function(fmt, ival) {
        return '()';
    };

    /**
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{*} value
     */
    glsBuiltinPrecisionTests.TraitsVoid.prototype.doPrintValue = function(fmt, value) {
        return '()';
    };

    /**
     * @constructor
     * @extends{glsBuiltinPrecisionTests.Traits}
     * @param{string} typename
     */
    glsBuiltinPrecisionTests.ScalarTraits = function(typename) {
        glsBuiltinPrecisionTests.Traits.call(this, typename);
        /** type{tcuInterval.Interval} */ this.iVal;
    };

    glsBuiltinPrecisionTests.ScalarTraits.prototype = Object.create(glsBuiltinPrecisionTests.Traits.prototype);
    glsBuiltinPrecisionTests.ScalarTraits.prototype.constructor = glsBuiltinPrecisionTests.ScalarTraits;

    /**
     * @param{*} value
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.ScalarTraits.prototype.doMakeIVal = function(value) {
		// Thankfully all scalar types have a well-defined conversion to `double`,
		// hence Interval can represent their ranges without problems.
		return new tcuInterval.Interval(/** @type {number} */ (value));
	};

    /**
     * @param{tcuInterval.Interval} a
     * @param{tcuInterval.Interval} b
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.ScalarTraits.prototype.doUnion	= function(a, b) {
		return a.operatorOrBinary(b);
	}

    /**
     * @param{tcuInterval.Interval} a
     * @param{number} value
     * @return{boolean}
     */
    glsBuiltinPrecisionTests.ScalarTraits.prototype.doContains = function(a, value)	{
		return a.contains(new tcuInterval.Interval(value));
	};

    /**
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{tcuInterval.Interval} ival
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.ScalarTraits.prototype.doConvert = function(fmt, ival)	{
		return fmt.convert(ival);
	};

    /**
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{number} value
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.ScalarTraits.prototype.doRound	= function(fmt, value) {
		return fmt.roundOut(new tcuInterval.Interval(value), false);//TODO cast to double
	};



    /**
     * @constructor
     * @extends{glsBuiltinPrecisionTests.ScalarTraits}
     */
    glsBuiltinPrecisionTests.TraitsFloat = function() {
        glsBuiltinPrecisionTests.ScalarTraits.call(this, 'float');
    };

    glsBuiltinPrecisionTests.TraitsFloat.prototype = Object.create(glsBuiltinPrecisionTests.ScalarTraits.prototype);
    glsBuiltinPrecisionTests.TraitsFloat.prototype.constructor = glsBuiltinPrecisionTests.TraitsFloat;

    /**
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{tcuInterval.Interval} ival
     */
    glsBuiltinPrecisionTests.TraitsFloat.prototype.doPrintIVal = function(fmt, ival) {
		return fmt.intervalToHex(ival);
	};

    /**
     * @param{goog.TypedArray} input
     * @return{goog.TypedArray}
     */
    glsBuiltinPrecisionTests.TraitsFloat.prototype.doCast = function(input) {
        return new Float32Array(input.buffer);
    };

    /**
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{number} value
     */
    glsBuiltinPrecisionTests.TraitsFloat.prototype.doPrintValue	= function(fmt, value) {
		return fmt.floatToHex(value);
	};

    /**
     * @constructor
     * @extends{glsBuiltinPrecisionTests.ScalarTraits}
     */
    glsBuiltinPrecisionTests.TraitsBool = function() {
        glsBuiltinPrecisionTests.ScalarTraits.call(this, 'boolean');
    };

    glsBuiltinPrecisionTests.TraitsBool.prototype = Object.create(glsBuiltinPrecisionTests.ScalarTraits.prototype);
    glsBuiltinPrecisionTests.TraitsBool.prototype.constructor = glsBuiltinPrecisionTests.TraitsBool;

    /**
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{tcuInterval.Interval} ival
     */
    glsBuiltinPrecisionTests.TraitsBool.prototype.doPrintIVal = function(fmt, ival) {
        /** type{string} */ var os = '{';
        var ifalse = new tcuInterval.Interval(0);
        var itrue = new tcuInterval.Interval(1);
		if (ival.contains(ifalse))
			os += 'false';
		if (ival.contains(ifalse) && ival.contains(itrue))
			os += ', ';
		if (ival.contains(itrue))
			os += 'true';
		os += '}';
        return os;
	};

    /**
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{boolean} value
     */
    glsBuiltinPrecisionTests.TraitsBool.prototype.doPrintValue	= function(fmt, value) {
		return value ? 'true' : 'false';
	};



    /**
     * @constructor
     * @extends{glsBuiltinPrecisionTests.ScalarTraits}
     */
    glsBuiltinPrecisionTests.TraitsInt = function() {
        glsBuiltinPrecisionTests.ScalarTraits.call(this, 'int');
    };

    glsBuiltinPrecisionTests.TraitsInt.prototype = Object.create(glsBuiltinPrecisionTests.ScalarTraits.prototype);
    glsBuiltinPrecisionTests.TraitsInt.prototype.constructor = glsBuiltinPrecisionTests.TraitsInt;

    /**
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{tcuInterval.Interval} ival
     */
    glsBuiltinPrecisionTests.TraitsInt.prototype.doPrintIVal = function(fmt, ival) {
		return '[' + (ival.lo()) + ', ' + (ival.hi()) + ']';
	};

    /**
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{number} value
     */
    glsBuiltinPrecisionTests.TraitsInt.prototype.doPrintValue	= function(fmt, value) {
		return value.toString(10);
	};




    /**
     * Common traits for containers, i.e. vectors and matrices.
     * T is the container type itself, I is the same type with interval elements.
     * template <typename T, typename I>
     * @constructor
     * @extends{glsBuiltinPrecisionTests.Traits}
     * @param{string} elementType
     */
    glsBuiltinPrecisionTests.ContainerTraits = function(elementType) {
        glsBuiltinPrecisionTests.Traits.call(this, 'container');
        this.elementType = elementType;
        this.subTraits = glsBuiltinPrecisionTests.Traits.traitsFactory(elementType);
    };

    glsBuiltinPrecisionTests.ContainerTraits.prototype = Object.create(glsBuiltinPrecisionTests.Traits.prototype);
    glsBuiltinPrecisionTests.ContainerTraits.prototype.constructor = glsBuiltinPrecisionTests.ContainerTraits;

    // typedef typename	T::Element		Element;
    // typedef				I				IVal;

    /**
     * @param{Array<number>} value can be a vector or matrix
     * @return{Array<*>}
     */
    glsBuiltinPrecisionTests.ContainerTraits.prototype.doMakeIVal = function(value) {
    	/** @type{Array<*>}	*/ var ret = [];

		for (var ndx = 0; ndx < value.length; ++ndx)
			ret[ndx] = this.subTraits.doMakeIVal(value[ndx]);

		return ret;
	};

    /**
     * @param{Array<*>} a
     * @param{Array<*>} b
     * @return{Array<*>}
     */
    glsBuiltinPrecisionTests.ContainerTraits.prototype.doUnion = function (a, b) {
    	/** @type{Array<*>}	*/ var ret = [];

		for (var ndx = 0; ndx < a.length; ++ndx)
			ret[ndx] = this.subTraits.doUnion(a[ndx], b[ndx]);

		return ret;
	};

    /**
     * @param{Array<*>} ival
     * @param{*} value
     * @return{boolean}
     */
    glsBuiltinPrecisionTests.ContainerTraits.prototype.doContains = function(ival, value) {
		for (var ndx = 0; ndx < value.length; ++ndx)
			if (!this.subTraits.doContains(ival[ndx], value[ndx]))
				return false;

		return true;
	};

    /**
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{Array<*>} ival
     */
    glsBuiltinPrecisionTests.ContainerTraits.prototype.doPrintIVal = function(fmt, ival) {
		/** @type{string} */ var os = '(';

		for (var ndx = 0; ndx < ival.length; ++ndx)	{
			if (ndx > 0)
				os += ', ';
			os += ival[ndx].doPrintIVal(fmt, ival[ndx]);
		}

		os += ')';
        return os;
	};

    /**
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{Array<*>} value
     */
    glsBuiltinPrecisionTests.ContainerTraits.prototype.doPrintValue	= function(fmt, value) {
		/** @type{string} */ var os = this.elementType + '(';

		for (var ndx = 0; ndx < value.length; ++ndx)
		{
			if (ndx > 0)
				os += ', ';

			os += value[ndx].doPrintValue(fmt, value[ndx]);
		}

		os += ')';
        return os;
	};

    /**
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{Array<*>} value
     * @return{Array<*>}
     */
    glsBuiltinPrecisionTests.ContainerTraits.prototype.doConvert = function(fmt, value) {
		/** @type{Array<*>}	*/ var ret = [];

		for (var ndx = 0; ndx < value.length; ++ndx)
			ret[ndx] = this.subTraits.doConvert(fmt, value[ndx]);

		return ret;
	};

    /**
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{Array<*>} value
     * @return{Array<*>}
     */
    glsBuiltinPrecisionTests.ContainerTraits.prototype.doRound = function(fmt, value) {
    	/** @type{Array<*>}	*/ var ret;

		for (var ndx = 0; ndx < value.length; ++ndx)
			ret[ndx] = this.subTraits.doRound(fmt, value[ndx]);

		return ret;
	};




    /**
     * This is needed for container-generic operations.
     * We want a scalar type T to be its own "one-element vector".
     * @constructor
     * @param{*} T typename
     */
    glsBuiltinPrecisionTests.ContainerOf = function(T) {
        this.Container = T;
    };

//     class ExprBase;
// class ExpandContext;
// class Statement;
// class StatementP;
// class FuncBase;

    /**
     * @constructor
     */
    glsBuiltinPrecisionTests.Statement = function() {

    };


    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     */
    glsBuiltinPrecisionTests.Statement.prototype.execute = function(ctx) {
        this.doExecute(ctx);
    };

    /**
     * @return {string}
     */
    glsBuiltinPrecisionTests.Statement.prototype.print = function() {
        return this.doPrint();             
    };

    glsBuiltinPrecisionTests.Statement.prototype.toString = function() {
        return this.print();             
    };

    /**
     * Output the functions that this expression refers to
     * @param{glsBuiltinPrecisionTests.FuncSet} dst
     * 
     */
    glsBuiltinPrecisionTests.Statement.prototype.getUsedFuncs = function(dst) {
        this.doGetUsedFuncs(dst);
    };

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     */
    glsBuiltinPrecisionTests.Statement.prototype.doExecute = function(ctx) {
        throw new Error('Virtual function. Please override.');
    };

    /**
     * @return {string}
     */
    glsBuiltinPrecisionTests.Statement.prototype.doPrint = function() {
        throw new Error('Virtual function. Please override.');
    };

    /**
     * Output the functions that this expression refers to
     * @param{glsBuiltinPrecisionTests.FuncSet} dst
     * 
     */
    glsBuiltinPrecisionTests.Statement.prototype.doGetUsedFuncs = function(dst) {
        throw new Error('Virtual function. Please override.');
    };

    /**
     * @constructor
     * @extends {glsBuiltinPrecisionTests.Statement}
     * @param {glsBuiltinPrecisionTests.Variable} variable
     * @param {glsBuiltinPrecisionTests.ApplyVar} value
     * @param {boolean} isDeclaration
     */
    glsBuiltinPrecisionTests.VariableStatement = function(variable, value, isDeclaration) {
        this.m_variable = variable;
        this.m_value = value;
        this.m_isDeclaration = isDeclaration;

    };

    setParentClass(glsBuiltinPrecisionTests.VariableStatement, glsBuiltinPrecisionTests.Statement);

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     */
    glsBuiltinPrecisionTests.VariableStatement.prototype.doExecute = function(ctx) {
        ctx.env.bind(this.m_variable, this.m_value.evaluate(ctx));
    };

    /**
     * @return {string}
     */
    glsBuiltinPrecisionTests.VariableStatement.prototype.doPrint = function() {
        var os = '';
        if (this.m_isDeclaration)
            os += gluVarType.declareVariable(gluVarType.getVarTypeOf(this.m_variable.T),
                        this.m_variable.getName());
        else
            os += this.m_variable.getName();

        os += " = " + this.m_value.printExpr() + ";\n";

        return os;
    };

    /**
     * Output the functions that this expression refers to
     * @param{glsBuiltinPrecisionTests.FuncSet} dst
     * 
     */
    glsBuiltinPrecisionTests.VariableStatement.prototype.doGetUsedFuncs = function(dst) {
        this.m_value.getUsedFuncs(dst);
    };

    /**
     * @constructor
     * @param{*} typename
     */
    glsBuiltinPrecisionTests.ExprP = function(typename) {
        this.T = typename;
    };

    /**
     * template <typename T>
     * typedef typename Expr<T>::IVal IVal;
     * @constructor
     * @extends{glsBuiltinPrecisionTests.ExprP}
     * @param{*} typename
     * @param{string} name
     */
    glsBuiltinPrecisionTests.Variable = function(typename, name) {
        glsBuiltinPrecisionTests.ExprP.call(this, typename);
        this.m_name = name;
    };

    setParentClass(glsBuiltinPrecisionTests.Variable, glsBuiltinPrecisionTests.ExprP);

    /**
     * @return{string}
     */
    glsBuiltinPrecisionTests.Variable.prototype.getName = function() {
        return this.m_name;
    };

    /**
     * @return {string}
     */
    glsBuiltinPrecisionTests.Variable.prototype.doPrintExpr = function() {
        return this.m_name;
    };

    glsBuiltinPrecisionTests.Variable.prototype.toString = function() {
        return this.doPrintExpr();
    };

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @return{tcuInterval.Interval} IVal
     */
    glsBuiltinPrecisionTests.Variable.prototype.doEvaluate = function(ctx) {
        return ctx.env.lookup(this);
	};

    /**
     * @constructor
     * @param{*} typename
     */
    glsBuiltinPrecisionTests.VariableP = function(typename) {
        this.T = typename;
    };

    /**
     * @constructor
     * @param{*} typename
     */
    glsBuiltinPrecisionTests.DefaultSampling = function(typename) {
        this.T = typename;
    };


    /**
     * Common base class for all expressions regardless of their type.
     * @constructor
     */
    glsBuiltinPrecisionTests.ExprBase = function() {};

    /**
     * @return {string}
     */
    glsBuiltinPrecisionTests.ExprBase.prototype.printExpr = function (){
        return this.doPrintExpr();
    };

    glsBuiltinPrecisionTests.ExprBase.prototype.toString = function () {
        return this.printExpr();
    };

    /**
     * @return {string}
     */
    glsBuiltinPrecisionTests.ExprBase.prototype.doPrintExpr = function (){
        throw new Error('Virtual function. Please override.');
    };

    /**
     * Output the functions that this expression refers to
     * @param{glsBuiltinPrecisionTests.FuncSet} dst
     * 
     */
    glsBuiltinPrecisionTests.ExprBase.prototype.getUsedFuncs = function(/*FuncSet&*/ dst) {
		this.doGetUsedFuncs(dst);
	};

    /**
     * Output the functions that this expression refers to
     * @param{glsBuiltinPrecisionTests.FuncSet} dst
     * 
     */
    glsBuiltinPrecisionTests.ExprBase.prototype.doGetUsedFuncs = function(/*FuncSet&*/ dst) {
        throw new Error('Virtual function. Please override.');
    };

    /**
     * Type-specific operations for an expression representing type T.
     * @constructor
     * @extends{glsBuiltinPrecisionTests.ExprBase}
     * @param{*} T template <typename T>
     */
    glsBuiltinPrecisionTests.Expr = function(T) {
        glsBuiltinPrecisionTests.ExprBase.call(this);
        this.typename = T;
    };

    setParentClass(glsBuiltinPrecisionTests.Expr, glsBuiltinPrecisionTests.ExprBase);

    /**
     * Type-specific operations for an expression representing type T.
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     */
    glsBuiltinPrecisionTests.Expr.prototype.evaluate = function(ctx) {
        return this.doEvaluate(ctx);
    };

    /**
     * Type-specific operations for an expression representing type T.
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     */
    glsBuiltinPrecisionTests.Expr.prototype.doEvaluate = function(ctx) {
        throw new Error('Virtual function. Please override.');
    };

    /**
     * @constructor
     * @extends {glsBuiltinPrecisionTests.Expr}
     */
    glsBuiltinPrecisionTests.Apply = function(T, func, arg0, arg1, arg2, arg3) {
        glsBuiltinPrecisionTests.Expr.call(this, T);
        this.m_func = func;
        /** @type {glsBuiltinPrecisionTests.Tuple4} */ this.m_args;
        if (arg0 instanceof glsBuiltinPrecisionTests.Tuple4)
            this.m_args = /** @type {glsBuiltinPrecisionTests.Tuple4} */ (arg0);
        else
            this.m_args = new glsBuiltinPrecisionTests.Tuple4(arg0, arg1, arg2, arg3);
    };

    setParentClass(glsBuiltinPrecisionTests.Apply, glsBuiltinPrecisionTests.Expr);

    /**
     * @return {string}
     */
    glsBuiltinPrecisionTests.Apply.prototype.doPrintExpr = function() {
        var args = [this.m_args.a, this.m_args.b, this.m_args.c, this.m_args.d];
        return this.m_func.print(args);
    };

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @return{tcuInterval.Interval}
     */    
    glsBuiltinPrecisionTests.Apply.prototype.doEvaluate = function(ctx) {
        return this.m_func.apply(ctx,
                    this.m_args.a.evaluate(ctx), this.m_args.b.evaluate(ctx),
                    this.m_args.c.evaluate(ctx), this.m_args.d.evaluate(ctx));
    };

    /**
     * @param{glsBuiltinPrecisionTests.FuncSet} dst
     */
    glsBuiltinPrecisionTests.Apply.prototype.doGetUsedFuncs = function(dst) {
        this.m_func.getUsedFuncs(dst);
        this.m_args.a.getUsedFuncs(dst);
        this.m_args.b.getUsedFuncs(dst);
        this.m_args.c.getUsedFuncs(dst);
        this.m_args.d.getUsedFuncs(dst);
    };

    /**
     * @constructor
     * @extends {glsBuiltinPrecisionTests.Apply}
     */
    glsBuiltinPrecisionTests.ApplyVar = function(T, func, arg0, arg1, arg2, arg3) {
        glsBuiltinPrecisionTests.Apply.call(this, T, func, arg0, arg1, arg2, arg3);
    };

    setParentClass(glsBuiltinPrecisionTests.ApplyVar, glsBuiltinPrecisionTests.Apply);

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @return{tcuInterval.Interval}
     */    
    glsBuiltinPrecisionTests.ApplyVar.prototype.doEvaluate = function(ctx) {
        return this.m_func.apply(ctx,
                    ctx.env.lookup(this.m_args.a), ctx.env.lookup(this.m_args.b),
                    ctx.env.lookup(this.m_args.c), ctx.env.lookup(this.m_args.d));
    };



    /***********************************************************************/
    /**

    ---------- Func classes -----------
    FuncBase

       Func
           PrimitiveFunc
               FloatFunc1
                   CFloatFunc1
                       TrigFunc
                           Sin, Cos
                       ArcTrigFunc
                           ASin, ACos, ATan
                       ExpFunc
                           Exp, Exp2
                       LogFunc
                           Log, Log2
                       PreciseFunc1
                           Abs, Sign, Floor, Trunc, RoundEven, Ceil,
                   InverseSqrt
                   Round
               FloatFunc2
                   InfixOperator
                       Add, Mul, Div, Sub
                   CFloatFunc2
                       ATan2
                       PreciseFunc2
                           Min, Max, Step
               FloatFunc3
                   Clamp
               Modf
           DerivedFunc
               DEFINE_DERIVED_FLOAT1 . Sqrt, Radians, Degrees, Tan, Sinh, Cosh,
                   Tanh, ASinh, ACosh, ATanh, Fract
               DEFINE_DERIVED_FLOAT2 . Pow, Mod,
               DEFINE_DERIVED_FLOAT3 . Mix
               (different extends)SmoothStep, Length, Distance, Dot, Cross, Normalize, FaceForward
                   Reflect, Refract,

               CompWiseFunc
                   CompMatFuncBase
                       CompMatFunc
                           MatrixCompMult
               OuterProduct
               Transpose
   Determinant
   Inverse
   */
    /**
     * @constructor
     */
    glsBuiltinPrecisionTests.FuncBase = function () {};

    /**
     * @return{string}
     */
    glsBuiltinPrecisionTests.FuncBase.prototype.getName = function () {
        return '';
    };

    /**
     * @return{string}
     */
    glsBuiltinPrecisionTests.FuncBase.prototype.getRequiredExtension = function() {
        return '';
    };

    /**
     * @param {Array<glsBuiltinPrecisionTests.ExprBase>} args
     * @return {string}
     */
    glsBuiltinPrecisionTests.FuncBase.prototype.print = function (args) {
        return '';
    };

    /**
     * Index of output parameter, or -1 if none of the parameters is output.
     * @return{number}
     */
    glsBuiltinPrecisionTests.FuncBase.prototype.getOutParamIndex = function () {
        return -1;
    };

    /**
     * @return {string}
     */
    glsBuiltinPrecisionTests.FuncBase.prototype.printDefinition = function () {
	    return this.doPrintDefinition();
	};

    /**
     * @return {string}
     */
    glsBuiltinPrecisionTests.FuncBase.prototype.doPrintDefinition = function () {
        throw new Error('Virtual function. Please override.');
    };

    /**
     * typedef set<const FuncBase*> FuncSet;
     * @param{glsBuiltinPrecisionTests.FuncSet} dst
     */
    glsBuiltinPrecisionTests.FuncBase.prototype.getUsedFuncs = function(dst) {
		this.doGetUsedFuncs(dst);
	};

    /**
     *
     */
    glsBuiltinPrecisionTests.FuncBase.prototype.doGetUsedFuncs = function(dst) {};

    /*************************************/
    /**
     * \brief Function objects.
     *
     * Each Func object represents a GLSL function. It can be applied to interval
     * arguments, and it returns the an interval that is a conservative
     * approximation of the image of the GLSL function over the argument
     * intervals. That is, it is given a set of possible arguments and it returns
     * the set of possible values.
     *
     * @constructor
     * @extends{glsBuiltinPrecisionTests.FuncBase}
     * @param{glsBuiltinPrecisionTests.Signature} Sig_ template <typename Sig_>
     */
    glsBuiltinPrecisionTests.Func = function(Sig_) {
        glsBuiltinPrecisionTests.FuncBase.call(this);
    	this.Sig = Sig_;
    	this.Ret = this.Sig.Ret;
    	this.Arg0 = this.Sig.Arg0;
    	this.Arg1 = this.Sig.Arg1;
    	this.Arg2 = this.Sig.Arg2;
    	this.Arg3 = this.Sig.Arg3;
    	this.IRet = this.Sig.IRet;
    	this.IArg0 = this.Sig.IArg0;
    	this.IArg1 = this.Sig.IArg1;
    	this.IArg2 = this.Sig.IArg2;
    	this.IArg3 = this.Sig.IArg3;
    	this.Args = this.Sig.Args;
    	this.IArgs = this.Sig.IArgs;
    	this.ArgExprs = this.Sig.ArgExprs;
    };

    glsBuiltinPrecisionTests.Func.prototype = Object.create(glsBuiltinPrecisionTests.FuncBase.prototype);
    glsBuiltinPrecisionTests.Func.prototype.constructor = glsBuiltinPrecisionTests.Func;

    /**
     * @param{Array<glsBuiltinPrecisionTests.ExprBase>} args
     * @return {string}
     */
    glsBuiltinPrecisionTests.Func.prototype.print = function(args) {
	    return this.doPrint(args);
	};

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @param{*} Iarg0
     * @param{*} Iarg1
     * @param{*} Iarg2
     * @param{*} Iarg3
     * @return{*} IRet
     */
    glsBuiltinPrecisionTests.Func.prototype.apply = function(ctx, Iarg0, Iarg1 ,Iarg2 ,Iarg3){
        var arg0 = Iarg0 === undefined ? this.IArg0() : Iarg0;
        var arg1 = Iarg1 === undefined ? this.IArg1() : Iarg1;
        var arg2 = Iarg2 === undefined ? this.IArg2() : Iarg2;
        var arg3 = Iarg3 === undefined ? this.IArg3() : Iarg3;
		return this.applyArgs(ctx, new glsBuiltinPrecisionTests.Tuple4(arg0, arg1, arg2, arg3));
	};

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @param{glsBuiltinPrecisionTests.Tuple4} args
     * @return{*} IRet
     */
    glsBuiltinPrecisionTests.Func.prototype.applyArgs = function (ctx, args) {
		return this.doApply(ctx, args);
	};

    // TODO
	// ExprP<Ret>			operator()		(const ExprP<Arg0>&		arg0 = voidP(),
	// 									 const ExprP<Arg1>&		arg1 = voidP(),
	// 									 const ExprP<Arg2>&		arg2 = voidP(),
	// 									 const ExprP<Arg3>&		arg3 = voidP())		const;

    /**
     * @return{glsBuiltinPrecisionTests.ParamNames}
     */
    glsBuiltinPrecisionTests.Func.prototype.getParamNames = function() {
		return this.doGetParamNames();
	};

    // protected:
	// virtual IRet		doApply			(const EvalContext&, const IArgs&) const = 0;

    /**
     * @param{Array<glsBuiltinPrecisionTests.ExprBase>} args
     * @return {string}
     */
    glsBuiltinPrecisionTests.Func.prototype.doPrint = function (args) {
		/** type{string} */ var os = this.getName() + '(';

        // TODO: fix the generics
        for (var i = 0 ; i < args.length; i++) 
    		if (glsBuiltinPrecisionTests.isTypeValid(args[i])) {
                if (i != 0)
                    os += ', ';
    			os += args[i];
            }

		os += ')';

        return os;
	};

    /**
     * @return{glsBuiltinPrecisionTests.ParamNames} args
     */
    glsBuiltinPrecisionTests.Func.prototype.doGetParamNames = function() {
		/** @type{glsBuiltinPrecisionTests.ParamNames} */ var names = new glsBuiltinPrecisionTests.Tuple4("a", "b", "c", "d");
		return names;
	};

    /**
     * @constructor
     * @extends{glsBuiltinPrecisionTests.Func}
     * @param{glsBuiltinPrecisionTests.Signature} Sig template <typename Sig>
     *
     */
    glsBuiltinPrecisionTests.PrimitiveFunc = function(Sig) {
        glsBuiltinPrecisionTests.Func.call(this, Sig);
        this.Ret = Sig.Ret;
        this.ArgExprs = Sig.ArgExprs;
    };

    glsBuiltinPrecisionTests.PrimitiveFunc.prototype = Object.create(glsBuiltinPrecisionTests.Func.prototype);
    glsBuiltinPrecisionTests.PrimitiveFunc.prototype.constructor = glsBuiltinPrecisionTests.PrimitiveFunc;

    /**
     * @constructor
     * @extends{glsBuiltinPrecisionTests.PrimitiveFunc}
     *
     */
    glsBuiltinPrecisionTests.FloatFunc1 = function () {
        var sig = new glsBuiltinPrecisionTests.Signature('float', 'float');
        glsBuiltinPrecisionTests.PrimitiveFunc.call(this, sig);
    };

    glsBuiltinPrecisionTests.FloatFunc1.prototype = Object.create(glsBuiltinPrecisionTests.PrimitiveFunc.prototype);
    glsBuiltinPrecisionTests.FloatFunc1.prototype.constructor = glsBuiltinPrecisionTests.FloatFunc1;

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @param{glsBuiltinPrecisionTests.Tuple4} iargs
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.FloatFunc1.prototype.doApply =	function(ctx, iargs) {
        var a = /** @type {tcuInterval.Interval} */ (iargs.a);
		return this.applyMonotone(ctx, a);
	};

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @param{tcuInterval.Interval} iarg0
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.FloatFunc1.prototype.applyMonotone	= function(ctx, iarg0) {
		/** @type{tcuInterval.Interval} */ var ret = new tcuInterval.Interval();

        /**
         * @param {number=} x
         * @param {number=} y
         * @return {tcuInterval.Interval}
         */
        var body = function(x, y) {
            x = x || 0;
            return this.applyPoint(ctx, x);
        };
        ret =  tcuInterval.applyMonotone1(iarg0, body);

		ret.operatorOrAssignBinary(this.innerExtrema(ctx, iarg0));

		ret.operatorAndAssignBinary(this.getCodomain().operatorOrBinary(new tcuInterval.Interval(NaN)));

		return ctx.format.convert(ret);
	};

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @param{tcuInterval.Interval} iargs
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.FloatFunc1.prototype.innerExtrema = function(ctx, iargs)	{
		return new tcuInterval.Interval(); // empty interval, i.e. no extrema
	};

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @param{number} arg0
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.FloatFunc1.prototype.applyPoint = function(ctx, arg0) {
		var exact = this.applyExact(arg0);
		var prec = new tcuInterval.Interval(this.precision(ctx, exact, arg0));

		var a = new tcuInterval.Interval(exact);
        var b = tcuInterval.withIntervals(prec.operatorNegative(), prec);
        return tcuInterval.Interval.operatorSum(a, b);
	};

    /**
     * @param{number} x
     * @return {number}
     */
    glsBuiltinPrecisionTests.FloatFunc1.prototype.applyExact = function(x)	{
        //TODO
		throw new Error("Internal error. Cannot apply");
	};

    /**
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.FloatFunc1.prototype.getCodomain = function() {
		return tcuInterval.unbounded(true);
	};

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @param{number} x
     * @param{number} y
     * @return{number}
     */
    glsBuiltinPrecisionTests.FloatFunc1.prototype.precision	= function(ctx, x, y) {
        return 0;
    };

    /**
     * @constructor
     * @extends{glsBuiltinPrecisionTests.FloatFunc1}
     * @param{string} name
     * @param{tcuInterval.DoubleFunc1} func
     */
    glsBuiltinPrecisionTests.CFloatFunc1 = function(name, func) {
        glsBuiltinPrecisionTests.FloatFunc1.call(this);
        /** @type{string} */ this.m_name = name;
        /** @type{tcuInterval.DoubleFunc1} */this.m_func = func;
    };

    glsBuiltinPrecisionTests.CFloatFunc1.prototype = Object.create(glsBuiltinPrecisionTests.FloatFunc1.prototype);
    glsBuiltinPrecisionTests.CFloatFunc1.prototype.constructor = glsBuiltinPrecisionTests.CFloatFunc1;

    /**
     * @return{string}
     */
    glsBuiltinPrecisionTests.CFloatFunc1.prototype.getName = function() {
        return this.m_name;
    };

    /**
     * @param{number} x
     * @return{number}
     */
    glsBuiltinPrecisionTests.CFloatFunc1.prototype.applyExact = function(x) {
        return this.m_func(x);
    };

    /**
     * PrimitiveFunc<Signature<float, float, float> >
     * @constructor
     * @extends{glsBuiltinPrecisionTests.PrimitiveFunc}
     */
    glsBuiltinPrecisionTests.FloatFunc2 = function() {
        /** @type{glsBuiltinPrecisionTests.Signature} */ var Sig = new glsBuiltinPrecisionTests.Signature('float', 'float', 'float');
        glsBuiltinPrecisionTests.PrimitiveFunc.call(this, Sig);
    };

    glsBuiltinPrecisionTests.FloatFunc2.prototype = Object.create(glsBuiltinPrecisionTests.PrimitiveFunc.prototype);
    glsBuiltinPrecisionTests.FloatFunc2.prototype.constructor = glsBuiltinPrecisionTests.FloatFunc2;

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @param{glsBuiltinPrecisionTests.Tuple4} iargs
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.FloatFunc2.prototype.doApply = function(ctx, iargs) {
        var a = /** @type {tcuInterval.Interval} */ (iargs.a);
        var b = /** @type {tcuInterval.Interval} */ (iargs.b);        
		return this.applyMonotone(ctx, a, b);
	};

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @param{tcuInterval.Interval} xi
     * @param{tcuInterval.Interval} yi
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.FloatFunc2.prototype.applyMonotone	= function(ctx, xi, yi) {
		/** @type{tcuInterval.Interval} */ var ret = new tcuInterval.Interval();

		// TCU_INTERVAL_APPLY_MONOTONE2(reti, x, xi, y, yi, ret,
		// 							 TCU_SET_INTERVAL(ret, point,
		// 											  point = this.applyPoint(ctx, x, y)));

        /**
         * @param {number=} x
         * @param {number=} y
         * @return {tcuInterval.Interval}
         */
        var body = function(x, y) {
            x = x || 0;
            y = y || 0;
            return this.applyPoint(ctx, x, y);
        };
        ret =  tcuInterval.applyMonotone2(xi, yi, body.bind(this));

        ret.operatorOrAssignBinary(this.innerExtrema(ctx, xi, yi));

        ret.operatorAndAssignBinary(this.getCodomain().operatorOrBinary(new tcuInterval.Interval(NaN)));

        return ctx.format.convert(ret);
	};

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @param{tcuInterval.Interval} xi
     * @param{tcuInterval.Interval} yi
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.FloatFunc2.prototype.innerExtrema = function(ctx, xi, yi) {
		return new tcuInterval.Interval(); // empty interval, i.e. no extrema
	};

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @param{number} x
     * @param{number} y
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.FloatFunc2.prototype.applyPoint = function(ctx, x, y) {
		/** @type{number} */ var exact	= this.applyExact(x, y);
		/** @type{tcuInterval.Interval} */ var prec	= this.precision(ctx, exact, x, y);

        var a = new tcuInterval.Interval(exact);
        var b = tcuInterval.withIntervals(prec.operatorNegative(), prec);
        return tcuInterval.Interval.operatorSum(a, b);
	};

    /**
     * @param{number} x
     * @param{number} y
     * @return{number}
     */
    glsBuiltinPrecisionTests.FloatFunc2.prototype.applyExact = function(x, y) {
		throw new Error('Internal error. Cannot apply');
	};

    /**
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.FloatFunc2.prototype.getCodomain = function() {
		return tcuInterval.unbounded(true);
	};

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @param{number} ret
     * @param{number} x
     * @param{number} y
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.FloatFunc2.prototype.precision = function(ctx, ret, x,	y) {
        return new tcuInterval.Interval();
    };

    /**
     * @constructor
     * @extends{glsBuiltinPrecisionTests.FloatFunc2}
     * @param{string} name
     * @param{tcuInterval.DoubleFunc2} func
     */
    glsBuiltinPrecisionTests.CFloatFunc2 = function(name, func){
        glsBuiltinPrecisionTests.FloatFunc2.call(this);
    	/** @type{string} */ this.m_name = name;
    	/** @type{tcuInterval.DoubleFunc2} */ this.m_func = func;
    };

    glsBuiltinPrecisionTests.CFloatFunc2.prototype = Object.create(glsBuiltinPrecisionTests.FloatFunc2.prototype);
    glsBuiltinPrecisionTests.CFloatFunc2.prototype.constructor = glsBuiltinPrecisionTests.CFloatFunc2;

    /**
     * @return{string}
     */
    glsBuiltinPrecisionTests.CFloatFunc2.prototype.getName = function()	{
        return this.m_name;
    };

    /**
     * @param{number} x
     * @param{number} y
     * @return{number}
     */
    glsBuiltinPrecisionTests.CFloatFunc2.prototype.applyExact = function(x, y) {
        return this.m_func(x, y);
    };

    /**
     * @constructor
     * @extends{glsBuiltinPrecisionTests.FloatFunc2}
     */
    glsBuiltinPrecisionTests.InfixOperator = function(){
        glsBuiltinPrecisionTests.FloatFunc2.call(this);
    };

    glsBuiltinPrecisionTests.InfixOperator.prototype = Object.create(glsBuiltinPrecisionTests.FloatFunc2.prototype);
    glsBuiltinPrecisionTests.InfixOperator.prototype.constructor = glsBuiltinPrecisionTests.InfixOperator;

    /**
     * @return{string}
     */
    glsBuiltinPrecisionTests.InfixOperator.prototype.getSymbol = function() {
        glsBuiltinPrecisionTests.FloatFunc2.call(this);
        return '';
    };

    /**
     * @param{Array<glsBuiltinPrecisionTests.ExprBase>} args
     * @return{string}
     */
    glsBuiltinPrecisionTests.InfixOperator.prototype.doPrint = function(args) {
		return '(' + args[0] + ' ' + this.getSymbol() + ' ' + args[1] + ')';
	};

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @param{number} x
     * @param{number} y
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.InfixOperator.prototype.applyPoint = function(ctx, x, y) {
		/** @type{number} */ var exact = this.applyExact(x, y);

		// Allow either representable number on both sides of the exact value,
		// but require exactly representable values to be preserved.
		return ctx.format.roundOut(new tcuInterval.Interval(exact), isFinite(x) && isFinite(y));
	};

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @param{number} x
     * @param{number} y
     * @param{number} z
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.InfixOperator.prototype.precision = function(ctx, x, y, z)	{
		return new tcuInterval.Interval(0);
	};

 //    /**
 //     * Signature<float, float, float, float>
 //     * @constructor
 //     * @extends{glsBuiltinPrecisionTests.PrimitiveFunc}
 //     */
 //    glsBuiltinPrecisionTests.FloatFunc3 = function() {
 //        /** @type{glsBuiltinPrecisionTests.Signature} */ var sig = new glsBuiltinPrecisionTests.Signature('float', 'float', 'float', 'float');
 //        glsBuiltinPrecisionTests.PrimitiveFunc.call(this, sig);
 //    };

 //    glsBuiltinPrecisionTests.FloatFunc3.prototype = Object.create(glsBuiltinPrecisionTests.PrimitiveFunc.prototype);
 //    glsBuiltinPrecisionTests.FloatFunc3.prototype.constructor = glsBuiltinPrecisionTests.FloatFunc3;

 //    /**
 //     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
 //     * @param{glsBuiltinPrecisionTests.Tuple4} iargs
 //     * @return{tcuInterval.Interval}
 //     */
 //    glsBuiltinPrecisionTests.FloatFunc3.prototype.doApply = function (ctx, iargs) {
 //        var a = /** @type {tcuInterval.Interval} */ (iargs.a);
 //        var b = /** @type {tcuInterval.Interval} */ (iargs.b);        
 //        var c = /** @type {tcuInterval.Interval} */ (iargs.c);        
 //        return this.applyMonotone(ctx, a, b, c);
	// };

 //    /**
 //     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
 //     * @param{tcuInterval.Interval} xi
 //     * @param{tcuInterval.Interval} yi
 //     * @param{tcuInterval.Interval} zi
 //     * @return{tcuInterval.Interval}
 //     */
 //    glsBuiltinPrecisionTests.FloatFunc3.prototype.applyMonotone	= function(ctx, xi, yi, zi) {
	// 	/** @type{tcuInterval.Interval} */ var reti = new tcuInterval.Interval();
	// 	TCU_INTERVAL_APPLY_MONOTONE3(reti, x, xi, y, yi, z, zi, ret,
	// 								 TCU_SET_INTERVAL(ret, point,
	// 												  point = this.applyPoint(ctx, x, y, z)));
	// 	return ctx.format.convert(reti);
	// };

 //    /**
 //     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
 //     * @param{tcuInterval.Interval} xi
 //     * @param{tcuInterval.Interval} yi
 //     * @param{tcuInterval.Interval} zi
 //     * @return{tcuInterval.Interval}
 //     */
 //    glsBuiltinPrecisionTests.FloatFunc3.prototype.applyPoint = function(ctx, xi, yi, zi) {
	// 	/** @type{number} */ var exact	= this.applyExact(x, y, z);
	// 	/** @type{number} */ var prec	= this.precision(ctx, exact, x, y, z);
	// 	return new tcuInterval.Interval(-prec, prec).operatorSum(exact);
	// };

 //    /**
 //     * @param{number} x
 //     * @param{number} y
 //     * @param{number} z
 //     * @return{tcuInterval.Interval}
 //     */
 //    glsBuiltinPrecisionTests.FloatFunc3.prototype.applyExact = function(x, y, z) {
	// 	TCU_THROW(InternalError, "Cannot apply");
	// };

 //    /**
 //     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
 //     * @param{number} result
 //     * @param{number} x
 //     * @param{number} y
 //     * @param{number} z
 //     * @return{number}
 //     */
 //    glsBuiltinPrecisionTests.FloatFunc3.prototype.precision	= function(ctx, result, x, y, z) {
 //        return 0;
 //    };

    /**
     * @constructor
     * @extends{glsBuiltinPrecisionTests.InfixOperator}
     */
    glsBuiltinPrecisionTests.Add = function() {
        glsBuiltinPrecisionTests.InfixOperator.call(this);
    };

    glsBuiltinPrecisionTests.Add.prototype = Object.create(glsBuiltinPrecisionTests.InfixOperator.prototype);
    glsBuiltinPrecisionTests.Add.prototype.constructor = glsBuiltinPrecisionTests.Add;

    /**
     * @returns{string}
     */
    glsBuiltinPrecisionTests.Add.prototype.getName = function()	{
        return 'add';
    };

    /**
     * @returns{string}
     */
    glsBuiltinPrecisionTests.Add.prototype.getSymbol = function()	{
        return '+';
    };

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @param{glsBuiltinPrecisionTests.Tuple4} iargs
     * @returns{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.Add.prototype.doApply = function(ctx, iargs) {
        var a = /** @type {tcuInterval.Interval} */ (iargs.a);
        var b = /** @type {tcuInterval.Interval} */ (iargs.b);        
		// Fast-path for common case
		if (iargs.a.isOrdinary() && iargs.b.isOrdinary()) {
			/** type{tcuInterval.Interval} */ var ret;
			ret = tcuInterval.setIntervalBounds(
                function(dummy) {
                    return iargs.a.lo() + iargs.b.lo();
                },
                function(dummy) {
                    return iargs.a.hi() + iargs.b.hi();
                });
			return ctx.format.convert(ctx.format.roundOut(ret, true));
		}
		return this.applyMonotone(ctx, a, b);
	};

    /**
     * @param{number} x
     * @param{number} y
     * @returns{number}
     */
    glsBuiltinPrecisionTests.Add.prototype.applyExact = function(x, y) {
        return x + y;
    };


    /************************************/

    /**
     * template<typename In>
     * @constructor
     * @param{*} In
     */
    glsBuiltinPrecisionTests.Inputs = function(In) {
    	// vector<typename In::In0>	in0;
    	// vector<typename In::In1>	in1;
    	// vector<typename In::In2>	in2;
    	// vector<typename In::In3>	in3;
        this.in0 = [];
        this.in1 = [];
        this.in2 = [];
        this.in3 = [];
    };

    /**
     * template<typename Out>
     * @constructor
     * @param{number} size
     * @param{*} Out
     */
    glsBuiltinPrecisionTests.Outputs = function(size, Out) {
    	// Outputs	(size_t size) : out0(size), out1(size) {}
    	this.out0 = [];
    	this.out1 = [];
    };


    /**
     * template<typename In, typename Out>
     * @constructor
     * @param{*} In
     * @param{*} Out
     */
     glsBuiltinPrecisionTests.Variables = function(In, Out) {
    	this.in0 = new glsBuiltinPrecisionTests.VariableP(In.In0);
        this.in1 = new glsBuiltinPrecisionTests.VariableP(In.In1);
        this.in2 = new glsBuiltinPrecisionTests.VariableP(In.In2);
        this.in3 = new glsBuiltinPrecisionTests.VariableP(In.In3);
        this.out0 = new glsBuiltinPrecisionTests.VariableP(Out.Out0);
        this.out1 = new glsBuiltinPrecisionTests.VariableP(Out.Out1);
    };


    /**
     * template<typename Sig>
     * @constructor
     * @param{glsBuiltinPrecisionTests.Func} func_
     * @param{glsBuiltinPrecisionTests.GenFunc} func2_
     * @param{glsBuiltinPrecisionTests.GenFunc} func3_
     * @param{glsBuiltinPrecisionTests.GenFunc} func4_
     */
    glsBuiltinPrecisionTests.GenFuncs = function(func_, func2_, func3_, func4_) {
        this.func = func_;
        this.func2 = func2_;
        this.func3 = func3_;
        this.func4 = func4_;
    	// GenFuncs (const Func<Sig>&			func_,
    	// 		  const GenFunc<Sig, 2>&	func2_,
    	// 		  const GenFunc<Sig, 3>&	func3_,
    	// 		  const GenFunc<Sig, 4>&	func4_)
    	// 	: func	(func_)
    	// 	, func2	(func2_)
    	// 	, func3	(func3_)
    	// 	, func4	(func4_)
    	// {}
        //
    	// const Func<Sig>&		func;
    	// const GenFunc<Sig, 2>&	func2;
    	// const GenFunc<Sig, 3>&	func3;
    	// const GenFunc<Sig, 4>&	func4;
    };


    /**
     * template<typename F>
     * @constructor
     * @param{*} F
     * @return{glsBuiltinPrecisionTests.GenFuncs}
     */
    glsBuiltinPrecisionTests.makeVectorizedFuncs = function(F) {
    	return new glsBuiltinPrecisionTests.GenFuncs(
                new F(),
                new glsBuiltinPrecisionTests.VectorizedFunc(new F()),
                new glsBuiltinPrecisionTests.VectorizedFunc(new F()),
                new glsBuiltinPrecisionTests.VectorizedFunc(new F()));

        // <typename F::Sig>
        // (instance<F>(),
    	// instance<VectorizedFunc<F, 2> >(),
    	// instance<VectorizedFunc<F, 3> >(),
    	// instance<VectorizedFunc<F, 4> >());
    };


    /**
     * template <typename T>
     * @constructor
     * @param{*} T
     */
    glsBuiltinPrecisionTests.Sampling = function(T) {
        this.typename = T;
    };

    /**
     * @param{*} T
     * @return {glsBuiltinPrecisionTests.Sampling}
     */
    glsBuiltinPrecisionTests.SamplingFactory = function(T) {
        switch(T) {
            case 'boolean' : return new glsBuiltinPrecisionTests.DefaultSamplingBool(T)
            case 'float' : return new glsBuiltinPrecisionTests.DefaultSamplingFloat(T);
            case 'int' : return new glsBuiltinPrecisionTests.DefaultSamplingInt(T);
        }
        if (T instanceof Array) {
            if (T.length > 0 && T[0] instanceof Array) {
                return new glsBuiltinPrecisionTests.DefaultSamplingMatrix(T);
            } else {
                return new glsBuiltinPrecisionTests.DefaultSamplingVector(T);
            }
        }
        return new glsBuiltinPrecisionTests.DefaultSamplingVoid(T);
    };

    /**
     * template <typename T>
     * @param{*} T
     * @param{FloatFormat} fmt
     * @param{Array<*>} arr
     */
    glsBuiltinPrecisionTests.Sampling.prototype.genFixeds = function(fmt, arr){};

    /**
     * template <typename T>
     * @param{*} T
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{gluShaderUtil.precision} precision
     * @param{debase.deRandom} random
     * @return{*}
     */
    glsBuiltinPrecisionTests.Sampling.prototype.genRandom = function(T, fmt, precision, random){
        return T;
    };

    /**
     * @return{number}
     */
    glsBuiltinPrecisionTests.Sampling.prototype.getWeight = function() {
        return 0.0;
    };

    /**
     * template <>  :  public Sampling<Void>
     * @constructor
     * @extends{glsBuiltinPrecisionTests.Sampling}
     * @param{typename} T
     */
     glsBuiltinPrecisionTests.DefaultSamplingVoid = function(T) {
         glsBuiltinPrecisionTests.Sampling.call(this, T);
     };

     glsBuiltinPrecisionTests.DefaultSamplingVoid.prototype = Object.create(glsBuiltinPrecisionTests.Sampling.prototype);
     glsBuiltinPrecisionTests.DefaultSamplingVoid.prototype.constructor = glsBuiltinPrecisionTests.DefaultSamplingVoid;

    /**
     * template <>  :  public Sampling<Void>
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{Array<number>} dst
     */
    glsBuiltinPrecisionTests.DefaultSamplingVoid.prototype.genFixeds = function(fmt, dst) {
        dst.push(NaN);
    };

    /**
     * template <>  :  public Sampling<bool>
     * @constructor
     * @extends{glsBuiltinPrecisionTests.Sampling}
     * @param{*} T
     */
    glsBuiltinPrecisionTests.DefaultSamplingBool = function(T) {
        glsBuiltinPrecisionTests.Sampling.call(this, T);
    };

    glsBuiltinPrecisionTests.DefaultSamplingBool.prototype = Object.create(glsBuiltinPrecisionTests.Sampling.prototype);
    glsBuiltinPrecisionTests.DefaultSamplingBool.prototype.constructor = glsBuiltinPrecisionTests.DefaultSamplingBool;

    /**
     * template <>  :  public Sampling<bool>
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{Array<Boolean} dst
     */
    glsBuiltinPrecisionTests.DefaultSamplingBool.prototype.genFixeds = function(fmt, dst) {
		dst.push(true);
		dst.push(false);
	};

    /**
     * template <>  :  public Sampling<int>
     * @constructor
     * @extends{glsBuiltinPrecisionTests.Sampling}
     * @param{typename} T
     */
    glsBuiltinPrecisionTests.DefaultSamplingInt = function(T) {
        glsBuiltinPrecisionTests.Sampling.call(this, T);
    };

    glsBuiltinPrecisionTests.DefaultSamplingInt.prototype = Object.create(glsBuiltinPrecisionTests.Sampling.prototype);
    glsBuiltinPrecisionTests.DefaultSamplingInt.prototype.constructor = glsBuiltinPrecisionTests.DefaultSamplingInt;

    /**
     * template <>  :  public Sampling<int>
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{gluShaderUtil.precision} prec
     * @param{debase.deRandom} rnd
     * @return{number}
     */
    glsBuiltinPrecisionTests.DefaultSamplingInt.prototype.genRandom = function(fmt, prec, rnd) {
		/** @type{number} */ var exp = rnd.getInt(0, getNumBits(prec)-2);
		/** @type{number} */ var sign = rnd.getBool() ? -1 : 1;

		return sign * rnd.getInt(0, 1 << exp);
	};

    /**
     * template <>  :  public Sampling<int>
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{Array<number>} dst
     */
    glsBuiltinPrecisionTests.DefaultSamplingInt.prototype.genFixeds = function(fmt, dst) {
		dst.push(0);
		dst.push(-1);
		dst.push(1);
	};

    /**
     * template <>  :  public Sampling<int>
     * @return{number}
     */
    glsBuiltinPrecisionTests.DefaultSamplingInt.prototype.getWeight = function(){
        return 1.0;
    };

    /**
     * template <>  :  public Sampling<int>
     * @param{gluShaderUtil.precision} prec
     * @return{number}
     */
    glsBuiltinPrecisionTests.DefaultSamplingInt.prototype.getNumBits = function(prec) {
		switch (prec) {
			case gluShaderUtil.precision.PRECISION_LOWP: return 8;
			case gluShaderUtil.precision.PRECISION_MEDIUMP: return 16;
			case gluShaderUtil.precision.PRECISION_HIGHP: return 32;
			default:
				DE_ASSERT(false);
				return 0;
		}
	};

    /**
     * template <>  :  public Sampling<float>
     * @constructor
     * @extends{glsBuiltinPrecisionTests.Sampling}
     * @param{typename} T
     */
    glsBuiltinPrecisionTests.DefaultSamplingFloat = function(T){
        glsBuiltinPrecisionTests.Sampling.call(this, T);
    };

    glsBuiltinPrecisionTests.DefaultSamplingFloat.prototype = Object.create(glsBuiltinPrecisionTests.Sampling.prototype);
    glsBuiltinPrecisionTests.DefaultSamplingFloat.prototype.constructor = glsBuiltinPrecisionTests.DefaultSamplingFloat;

    /**
     * Generate a random float from a reasonable general-purpose distribution.
     * template <>  :  public Sampling<float>
     * @param{tcuFloatFormat.FloatFormat} format
     * @param{gluShaderUtil.precision} prec
     * @param{deRandom.Random} rnd
     */
    glsBuiltinPrecisionTests.DefaultSamplingFloat.prototype.genRandom = function(format, prec, rnd) {
    	/** type{number} */ var minExp			= format.getMinExp();
    	/** type{number} */ var maxExp			= format.getMaxExp();
    	/** type{boolean} */ var haveSubnormal	= format.hasSubnormal() != tcuFloatFormat.YesNoMaybe.NO;

    	// Choose exponent so that the cumulative distribution is cubic.
    	// This makes the probability distribution quadratic, with the peak centered on zero.
    	/** type{number} */ var minRoot			= deMath.deCbrt(minExp - 0.5 - (haveSubnormal ? 1.0 : 0.0));
    	/** type{number} */ var maxRoot			= deMath.deCbrt(maxExp + 0.5);
    	/** type{number} */ var fractionBits	= format.getFractionBits();
    	/** type{number} */ var exp				= deMath.rint(Math.pow(rnd.getFloat(minRoot, maxRoot),
    															3.0));
    	/** type{number} */ var base			= 0.0; // integral power of two
    	/** type{number} */ var quantum			= 0.0; // smallest representable difference in the binade
    	/** type{number} */ var significand		= 0.0; // Significand.

    	// DE_ASSERT(fractionBits < std::numeric_limits<float>::digits);

    	// Generate some occasional special numbers
    	switch (rnd.getInt(0, 64)) {
    		case 0: 	return 0;
    		case 1:		return Number.POSITIVE_INFINITY;
    		case 2:		return Number.NEGATIVE_INFINITY;
    		case 3:		return NaN;
    		default:	break;
    	}

    	if (exp >= minExp) {
    		// Normal number
    		base = deMath.deFloatLdExp(1.0, exp);
    		quantum = deMath.deFloatLdExp(1.0, exp - fractionBits);
    	} else {
    		// Subnormal
    		base = 0.0;
    		quantum = deMath.deFloatLdExp(1.0, minExp - fractionBits);
    	}

    	switch (rnd.getInt(0, 16)) {
    		case 0: // The highest number in this binade, significand is all bits one.
    			significand = base - quantum;
    			break;
    		case 1: // Significand is one.
    			significand = quantum;
    			break;
    		case 2: // Significand is zero.
    			significand = 0.0;
    			break;
    		default: // Random (evenly distributed) significand.
    		{
    			/** type{number} */ var intFraction = rnd.getInt() & ((1 << fractionBits) - 1);
    			significand = intFraction * quantum;
    		}
    	}

    	// Produce positive numbers more often than negative.
    	return (rnd.getInt(0,3) == 0 ? -1.0 : 1.0) * (base + significand);
    };

    /**
     * Generate a standard set of floats that should always be tested.
     * template <>  :  public Sampling<float>
     * @param{tcuFloatFormat.FloatFormat} format
     * @param{Array<number>} dst
     */
    glsBuiltinPrecisionTests.DefaultSamplingFloat.prototype.genFixeds = function (format, dst) {
    	/** @type{number} */ var minExp			= format.getMinExp();
    	/** @type{number} */ var maxExp			= format.getMaxExp();
    	/** @type{number} */ var fractionBits	= format.getFractionBits();
        // DE_INLINE double	deMath.deCbrt	(double a)	{ return deSign(a) * dePow(deAbs(a), 1.0 / 3.0); }
        // DE_INLINE double	deSign				(double x)						{ return deIsNaN(x) ? x : (double)((x > 0.0) - (x < 0.0)); }
    	/** @type{number} */ var minQuantum		= deMath.deFloatLdExp(1.0, minExp - fractionBits);
    	/** @type{number} */ var minNormalized	= deMath.deFloatLdExp(1.0, minExp);
    	/** @type{number} */ var maxQuantum		= deMath.deFloatLdExp(1.0, maxExp - fractionBits);

    	// NaN
    	dst.push(NaN);
    	// Zero
    	dst.push(0.0);

    	for (var sign = -1; sign <= 1; sign += 2) {
    		// Smallest subnormal
    		dst.push(sign * minQuantum);

    		// Largest subnormal
    		dst.push(sign * (minNormalized - minQuantum));

    		// Smallest normalized
    		dst.push(sign * minNormalized);

    		// Next smallest normalized
    		dst.push(sign * (minNormalized + minQuantum));

    		dst.push(sign * 0.5);
    		dst.push(sign * 1.0);
    		dst.push(sign * 2.0);

    		// Largest number
    		dst.push(sign * (deMath.deFloatLdExp(1.0, maxExp) +
    							  (deMath.deFloatLdExp(1.0, maxExp) - maxQuantum)));

    		dst.push(sign * Number.POSITIVE_INFINITY);
    	}
    };

    /**
     * template <typename T, int Size>
     * @constructor
     * @extends{glsBuiltinPrecisionTests.Sampling}
     * @param{*} T
     * @param{number} size
     */
    glsBuiltinPrecisionTests.DefaultSamplingVector = function(T, size){
        glsBuiltinPrecisionTests.Sampling.call(this, T);
        this.size = size;
    };

    glsBuiltinPrecisionTests.DefaultSamplingVector.prototype = Object.create(glsBuiltinPrecisionTests.Sampling.prototype);
    glsBuiltinPrecisionTests.DefaultSamplingVector.prototype.constructor = glsBuiltinPrecisionTests.DefaultSamplingVector;

    /**
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{gluShaderUtil.precision} prec
     * @param{deRandom.Random} rnd
     * @return{Array<*>}
     */
    glsBuiltinPrecisionTests.DefaultSamplingVector.prototype.genRandom = function(fmt, prec, rnd) {
		/* @type{Array<*>} */ var ret = [];

		for (var ndx = 0; ndx < this.size; ++ndx)
			ret[ndx] = glsBuiltinPrecisionTests.SamplingFactory(this.typename).genRandom(fmt, prec, rnd);

		return ret;
	};

    /**
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{Array<*>} dst
     */
    glsBuiltinPrecisionTests.DefaultSamplingVector.prototype.genFixeds = function(fmt, dst) {
		/** @type{Array<*>} */ scalars = [];

		glsBuiltinPrecisionTests.SamplingFactory(this.typename).genFixeds(fmt, scalars);

		for (var scalarNdx = 0; scalarNdx < scalars.length; ++scalarNdx)
			dst.push([scalars[scalarNdx]]);
	};

    /**
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{Array<*>} dst
     */
    glsBuiltinPrecisionTests.DefaultSamplingVector.prototype.getWeight = function() {
		return Math.pow(glsBuiltinPrecisionTests.SamplingFactory(this.typename).getWeight(), this.size);
	};

    /**
     * template <typename T, int Rows, int Columns>
     * @constructor
     * @extends{glsBuiltinPrecisionTests.Sampling}
     * @param{*} T
     * @param{number} rows
     * @param{number} cols
     */
    glsBuiltinPrecisionTests.DefaultSamplingMatrix = function(T, rows, cols){
        glsBuiltinPrecisionTests.Sampling.call(this, T);
        this.rows = rows;
        this.cols = cols;
    };

    glsBuiltinPrecisionTests.DefaultSamplingMatrix.prototype = Object.create(glsBuiltinPrecisionTests.Sampling.prototype);
    glsBuiltinPrecisionTests.DefaultSamplingMatrix.prototype.constructor = glsBuiltinPrecisionTests.DefaultSamplingMatrix;

// template <typename T, int Rows, int Columns>
// class DefaultSampling<Matrix<T, Rows, Columns> > : public Sampling<Matrix<T, Rows, Columns> >
// {
// public:
// 	typedef Matrix<T, Rows, Columns>		Value;
//
    /**
     * template <typename T, int Rows, int Columns>
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{gluShaderUtil.precision} prec
     * @param{deRandom.Random} rnd
     * @return{Array<Array<*>>}
     */
    glsBuiltinPrecisionTests.DefaultSamplingMatrix.prototype.genRandom = function(fmt, prec, rnd) {
        /** @type{Array<Array<*>>} */ var ret =[[]];

    	for (var rowNdx = 0; rowNdx < this.rows; ++rowNdx)
    		for (var colNdx = 0; colNdx < this.cols; ++colNdx)
    			ret[rowNdx][colNdx] = glsBuiltinPrecisionTests.SamplingFactory(this.typename).genRandom(fmt, prec, rnd);

    	return ret;
    };

    /**
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{Array<*>} dst
     */
    glsBuiltinPrecisionTests.DefaultSamplingMatrix.prototype.genFixeds = function(fmt, dst)	{
		/** @type{Array<*>} */ var scalars = [];

		glsBuiltinPrecisionTests.SamplingFactory(this.typename).genFixeds(fmt, scalars);

		for (var scalarNdx = 0; scalarNdx < scalars.length; ++scalarNdx)
			dst.push([scalars[scalarNdx]]);

		if (this.cols == this.rows)	{
			var	mat	= [[0.0]];
			var	x = new this.typename(1.0);
			mat[0][0] = x;
			for (var ndx = 0; ndx < this.cols; ++ndx) {
				mat[Columns-1-ndx][ndx] = x;
				x *= T(2.0);
			}
			dst.push(mat);
		}
	};

    /**
     * @return{number}
     */
    glsBuiltinPrecisionTests.DefaultSamplingMatrix.prototype.getWeight = function()	{
		return Math.pow(glsBuiltinPrecisionTests.SamplingFactory(this.typename).getWeight(), this.rows * this.cols);
    };


    /**
     * template<typename In>
     * @constructor
     * @extends{glsBuiltinPrecisionTests.Samplings}
     * @param{In} In
     */
     glsBuiltinPrecisionTests.Samplings = function(In) {
        this.in0 = glsBuiltinPrecisionTests.SamplingFactory(In.In0);
        this.in1 = glsBuiltinPrecisionTests.SamplingFactory(In.In1);
        this.in2 = glsBuiltinPrecisionTests.SamplingFactory(In.In2);
        this.in3 = glsBuiltinPrecisionTests.SamplingFactory(In.In3);
    };


    /**
     * template<typename In>
     * @param{*} In
     * @constructor
     * @extends{glsBuiltinPrecisionTests.Samplings}
     */
     glsBuiltinPrecisionTests.DefaultSamplings = function(In) {
    	glsBuiltinPrecisionTests.Samplings.call(this,In);
    };

    /**
     * @constructor
     * @extends{tcuTestCase.DeqpTest}
     * @param{glsBuiltinPrecisionTests.Context} context
     * @param{string} name
     * @param{string} extension
     */
    glsBuiltinPrecisionTests.PrecisionCase = function(context, name, extension) {
        /** @type{string} */ this.m_extension = extension === undefined ? '' : extension;
        /** @type{glsBuiltinPrecisionTests.Context} */ this.m_ctx	= context;
        /** @type{*} */ this.m_status;
		/** @type{*} */ this.m_rnd	= new deRandom.Random(); //	(0xdeadbeefu + context.testContext.getCommandLine().getBaseSeed())
		/** @type{*} */ this.m_extension = extension;
        tcuTestCase.DeqpTest.call(this, name, extension);
    };

    glsBuiltinPrecisionTests.PrecisionCase.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    glsBuiltinPrecisionTests.PrecisionCase.prototype.constructor = glsBuiltinPrecisionTests.PrecisionCase;

    /**
     * @return{glsBuiltinPrecisionTests.RenderContext}
     */
    glsBuiltinPrecisionTests.PrecisionCase.prototype.getRenderContext = function() {
        return this.m_ctx.renderContext;
    };

    /**
     * @return{tcuFloatFormat.FloatFormat}
     */
    glsBuiltinPrecisionTests.PrecisionCase.prototype.getFormat = function() {
        return this.m_ctx.floatFormat;
    };

	// TestLog&			log				(void) const 			{ return m_testCtx.getLog(); }
	// virtual void		runTest			(void) = 0;


    /**
     * template <typename In, typename Out>
     * @param{glsBuiltinPrecisionTests.Variables} variables Variables<In, Out>
     * @param{glsBuiltinPrecisionTests.Inputs} inputs Inputs<In>
     * @param{glsBuiltinPrecisionTests.Statement} stmt
     */
    glsBuiltinPrecisionTests.PrecisionCase.prototype.testStatement = function(variables, inputs, stmt){
    	// using namespace ShaderExecUtil;
        //
    	// typedef typename 	In::In0		In0;
    	// typedef typename 	In::In1		In1;
    	// typedef typename 	In::In2		In2;
    	// typedef typename 	In::In3		In3;
    	// typedef typename 	Out::Out0	Out0;
    	// typedef typename 	Out::Out1	Out1;

    	/** @type{tcuFloatFormat.FloatFormat} */ var fmt = this.getFormat();
    	/** @type{number} */ var inCount = glsBuiltinPrecisionTests.numInputs(this.In);
    	/** @type{number} */ var outCount = glsBuiltinPrecisionTests.numOutputs(this.Out);
    	/** @type{number} */ var numValues = (inCount > 0) ? inputs.in0.length : 1;
    	/** @type{tcuFloatFormat.FloatFormat} */ var highpFmt = this.m_ctx.highpFormat;
        var outputs = [];
    	/** @type{number} */ var maxMsgs		= 100;
    	/** @type{number} */ var numErrors	= 0;
        /** @type {glsShaderExecUtil.ShaderSpec} */ var spec = new glsShaderExecUtil.ShaderSpec();
    	/** @type{glsBuiltinPrecisionTests.Environment} */ var env = new glsBuiltinPrecisionTests.Environment(); 		// Hoisted out of the inner loop for optimization.

    	switch (inCount) {
    		case 4: DE_ASSERT(inputs.in3.length == numValues);
    		case 3: DE_ASSERT(inputs.in2.length == numValues);
    		case 2: DE_ASSERT(inputs.in1.length == numValues);
    		case 1: DE_ASSERT(inputs.in0.length == numValues);
    		default: break;
    	}

        // TODO: print this to Log
    	// Print out the statement and its definitions
    	// log() << TestLog::Message << "Statement: " << stmt << TestLog::EndMessage;
    	// {
    	// 	ostringstream	oss;
    	// 	FuncSet			funcs;
        //
    	// 	stmt.getUsedFuncs(funcs);
    	// 	for (FuncSet::const_iterator it = funcs.begin(); it != funcs.end(); ++it)
    	// 	{
    	// 		(*it).printDefinition(oss);
    	// 	}
    	// 	if (!funcs.empty())
    	// 		log() << TestLog::Message << "Reference definitions:\n" << oss.str()
    	// 			  << TestLog::EndMessage;
    	// }

    	// Initialize ShaderSpec from precision, variables and statement.

		spec.globalDeclarations = "precision " + gluShaderUtil.getPrecisionName(this.m_ctx.precision) + " float;\n"

    	if (this.m_extension.length > 0)
    		spec.globalDeclarations = '#extension ' + this.m_extension + ' : require\n';

    	spec.inputs = [];

    	switch (inCount) {
    		case 4: spec.inputs[3] = this.makeSymbol(variables.in3);
    		case 3:	spec.inputs[2] = this.makeSymbol(variables.in2);
    		case 2:	spec.inputs[1] = this.makeSymbol(variables.in1);
    		case 1:	spec.inputs[0] = this.makeSymbol(variables.in0);
    		default: break;
    	}

    	spec.outputs = [];

    	switch (outCount) {
    		case 2:	spec.outputs[1] = this.makeSymbol(variables.out1);
    		case 1:	spec.outputs[0] = this.makeSymbol(variables.out0);
    		default: break;
    	}

    	spec.source = stmt;

    	// Run the shader with inputs.
		/** @type{glsShaderExecUtil.ShaderExecutor} */
        var executor = glsShaderExecUtil.createExecutor(this.m_ctx.shaderType, spec);
		/** @type{Array<*>} */ var inputArr	=
		[
			inputs.in0, inputs.in1, inputs.in2, inputs.in3
		];

		// executor.log(log());
		if (!executor.isOk())
			TCU_FAIL("Shader compilation failed");

		executor.useProgram();
		var outputArray = executor.execute(numValues, inputArr);

        switch (outCount) {
            case 2:
                outputs[1] = glsBuiltinPrecisionTests.cast(this.Out.Out1, outputArray[1]);
            case 1:
                outputs[0] = glsBuiltinPrecisionTests.cast(this.Out.Out0, outputArray[0]);
            default: break;
        }

    	// Initialize environment with dummy values so we don't need to bind in inner loop.

        /** @type{tcuInterval.Interval} */ var in0 = new tcuInterval.Interval();
        /** @type{tcuInterval.Interval} */ var in1 = new tcuInterval.Interval();
        /** @type{tcuInterval.Interval} */ var in2 = new tcuInterval.Interval();
        /** @type{tcuInterval.Interval} */ var in3 = new tcuInterval.Interval();
        /** @type{tcuInterval.Interval} */ var reference0 = new tcuInterval.Interval();
        /** @type{tcuInterval.Interval} */ var reference1 = new tcuInterval.Interval();

		env.bind(variables.in0, in0);
		env.bind(variables.in1, in1);
		env.bind(variables.in2, in2);
		env.bind(variables.in3, in3);
		env.bind(variables.out0, reference0);
		env.bind(variables.out1, reference1);

    	// For each input tuple, compute output reference interval and compare
    	// shader output to the reference.
    	for (var valueNdx = 362; valueNdx < numValues; valueNdx++) {
    		/** @type{boolean} */ var result = true;
            var msg = '';
    		/** @type{tcuInterval.Interval} */ var reference0 = new tcuInterval.Interval();
    		/** @type{tcuInterval.Interval} */ var reference1 = new tcuInterval.Interval();

    		var in0_ = glsBuiltinPrecisionTests.convert(this.Arg0, fmt, glsBuiltinPrecisionTests.round(this.Arg0, fmt, inputs.in0[valueNdx]));
    		var in1_ = glsBuiltinPrecisionTests.convert(this.Arg1, fmt, glsBuiltinPrecisionTests.round(this.Arg1, fmt, inputs.in1[valueNdx]));
    		var in2_ = glsBuiltinPrecisionTests.convert(this.Arg2, fmt, glsBuiltinPrecisionTests.round(this.Arg2, fmt, inputs.in2[valueNdx]));
    		var in3_ = glsBuiltinPrecisionTests.convert(this.Arg3, fmt, glsBuiltinPrecisionTests.round(this.Arg3, fmt, inputs.in3[valueNdx]));

            env.bind(variables.in0, in0_);
            env.bind(variables.in1, in1_);
            env.bind(variables.in2, in2_);
            env.bind(variables.in3, in3_);

			stmt.execute(new glsBuiltinPrecisionTests.EvalContext(fmt, this.m_ctx.precision, env));

    		switch (outCount) {
    			case 2:
    				reference1 = glsBuiltinPrecisionTests.convert(this.Out.Out1, highpFmt, env.lookup(variables.out1));
    				if (!glsBuiltinPrecisionTests.contains(this.Out.Out1, reference1, outputs[1][valueNdx])) {
                        msg = 'Shader output 1 (' + outputs[1][valueNdx] + ') is outside acceptable range: ' + reference1;
                        result = false;
                    }
    			case 1:
                    reference0 = glsBuiltinPrecisionTests.convert(this.Out.Out0, highpFmt, env.lookup(variables.out0));
                    if (!glsBuiltinPrecisionTests.contains(this.Out.Out0, reference0, outputs[0][valueNdx])) {
                        msg = 'Shader output 0 (' + outputs[0][valueNdx] + ') is outside acceptable range: ' + reference0;
                        result = false;
                    }
    			default: break;
    		}

    		if (!result)
    			++numErrors;

    		if (!result && numErrors <= maxMsgs) {
    			/** @type{string} */ var builder = '';

    			builder += (result ? 'Passed' : 'Failed') + '\n' + msg + '\n sample:\n';

    			if (inCount > 0) {
    				builder += '\t' + variables.in0.getName() + ' = '
    						+ valueToString(highpFmt, inputs.in0[valueNdx]) + '\n';
    			}

    			if (inCount > 1) {
    				builder += '\t' + variables.in1.getName() + ' = '
    						+ valueToString(highpFmt, inputs.in1[valueNdx]) + '\n';
    			}

    			if (inCount > 2) {
    				builder += '\t' + variables.in2.getName() + ' = '
    						+ valueToString(highpFmt, inputs.in2[valueNdx]) + '\n';
    			}

    			if (inCount > 3) {
    				builder += '\t' + variables.in3.getName() + ' = '
    						+ valueToString(highpFmt, inputs.in3[valueNdx]) + '\n';
    			}

    			if (outCount > 0) {
    				builder += '\t' + variables.out0.getName() + ' = '
    						+ valueToString(highpFmt, outputs[0][valueNdx]) + '\n'
    						+ '\tExpected range: '
    						+ intervalToString(highpFmt, reference0) + '\n';
    			}

    			if (outCount > 1) {
    				builder += '\t' + variables.out1.getName() + ' = '
    						+ valueToString(highpFmt, outputs[1][valueNdx]) + '\n'
    						+ '\tExpected range: '
    						+ intervalToString(highpFmt, reference1) + '\n';
    			}

    			bufferedLogToConsole(builder);
    		}
    	}

    	if (numErrors > maxMsgs) {
    		bufferedLogToConsole('(Skipped ' + (numErrors - maxMsgs) + ' messages.)');
    	}

    	if (numErrors == 0)	{
    		testPassed('All ' + numValues + ' inputs passed.');
    	} else {
    		testFailed('' + numErrors + '/' + numValues + ' inputs failed.');
    	}
    };

    /**
     * template <typename In, typename Out>
     * @param{glsBuiltinPrecisionTests.Variable} variable Variable<T>
     * @param{glsBuiltinPrecisionTests.Inputs} inputs Inputs<In>
     * @return{glsShaderExecUtil.Symbol}
     */
    glsBuiltinPrecisionTests.PrecisionCase.prototype.makeSymbol = function (variable) {
		return new glsShaderExecUtil.Symbol(variable.getName(), gluVarType.getVarTypeOf(variable.T, this.m_ctx.precision));
	};

    /**
     * template <typename T>
     * @param{*} val1
     * @param{*} val2
     * @return{boolean}
     */
    glsBuiltinPrecisionTests.inputLess = function (val1, val2) {
        if (val1 === undefined || val2 === undefined) {
            return false;
        }

        if (typeof val1 == 'number' && glsBuiltinPrecisionTests.isFloat(val1)) {
            return glsBuiltinPrecisionTests.inputLessFloat(val1, val2);
        } else if (Array.isArray(val1)) {
            if (Array.isArray(val1[0])) {
                return glsBuiltinPrecisionTests.InputLessMatrix(val1, val2);
            } else {
                return glsBuiltinPrecisionTests.inputLessVector(val1, val2);
            }
        }
	    return false;
    };

    /**
     * @param{number} val1
     * @param{number} val2
     * @return{boolean}
     */
    glsBuiltinPrecisionTests.inputLessFloat = function(val1, val2) {
    	if (isNaN(val1))
    	   return false;
    	if (isNaN(val2))
    		return true;
    	return val1 < val2;
    };

    /**
     * @param{Array<number>} val1
     * @param{Array<number>} val2
     * @return{boolean}
     */
    glsBuiltinPrecisionTests.inputLessVector = function(val1, val2) {
		for (var ndx = 0; ndx < val1.length; ++ndx) {
			if (glsBuiltinPrecisionTests.inputLessFloat(vec1[ndx], vec2[ndx]))
				return true;
			if (glsBuiltinPrecisionTests.inputLessFloat(vec2[ndx], vec1[ndx]))
				return false;
		}
		return false;
    };

    /**
     * @param{Arrray<Array<number>>} mat1
     * @param{Arrray<Array<number>>} mat2
     * @return{boolean}
     */
    glsBuiltinPrecisionTests.InputLessMatrix = function(mat1, mat2) {
		for (var col = 0; col < mat1.length; ++col)	{
			if (glsBuiltinPrecisionTests.inputLessVector(mat1[col], mat2[col]))
				return true;
			if (glsBuiltinPrecisionTests.inputLessVector(mat2[col], mat1[col]))
				return false;
		}
		return false;
	};

    /**
     * template <typename In>
     * @constructor
     * @extends{glsBuiltinPrecisionTests.Tuple4}
     * @param{*} in0
     * @param{*} in1
     * @param{*} in2
     * @param{*} in3
     */
    glsBuiltinPrecisionTests.InTuple = function(in0, in1, in2, in3){
        glsBuiltinPrecisionTests.Tuple4.call(this, in0, in1, in2, in3);
    };

    glsBuiltinPrecisionTests.InTuple.prototype = Object.create(glsBuiltinPrecisionTests.Tuple4.prototype);
    glsBuiltinPrecisionTests.InTuple.prototype.constructor = glsBuiltinPrecisionTests.InTuple;

    /**
     * template <typename In>
     * InputLess<InTuple<In> >
     * @constructor
     * @extends{glsBuiltinPrecisionTests.Tuple4}
     * @param{*} In
     */
    glsBuiltinPrecisionTests.InputLess = function(in1, in2) {
        if (glsBuiltinPrecisionTests.inputLess(in1.a, in2.a))
			return true;
		if (glsBuiltinPrecisionTests.inputLess(in2.a, in1.a))
			return false;
		if (glsBuiltinPrecisionTests.inputLess(in1.b, in2.b))
			return true;
		if (glsBuiltinPrecisionTests.inputLess(in2.b, in1.b))
			return false;
		if (glsBuiltinPrecisionTests.inputLess(in1.c, in2.c))
			return true;
		if (glsBuiltinPrecisionTests.inputLess(in2.c, in1.c))
			return false;
		if (glsBuiltinPrecisionTests.inputLess(in1.d, in2.d))
			return true;
		return false;
    };

    /**
     * template<typename In>: return Inputs<In>
     * @param{*} In
     * @param{glsBuiltinPrecisionTests.Samplings} samplings Samplings<In>
     * @param{tcuFloatFormat.FloatFormat} floatFormat
     * @param{gluShaderUtil.precision} intPrecision
     * @param{number} numSamples
     * @param{deRandom.Random} rnd
     * @return{glsBuiltinPrecisionTests.Inputs}
     */
    glsBuiltinPrecisionTests.generateInputs = function (In, samplings, floatFormat, intPrecision, numSamples, rnd){
    	/*Inputs<In>*/ var ret = new glsBuiltinPrecisionTests.Inputs(In);
    	/*Inputs<In>*/ var fixedInputs = new glsBuiltinPrecisionTests.Inputs(In);
    	// set<InTuple<In>, InputLess<InTuple<In> > >	seenInputs;
        /** @type{Array<glsBuiltinPrecisionTests.InTuple,glsBuiltinPrecisionTests.InputLess>} */
        var seenInputs = [];

    	samplings.in0.genFixeds(floatFormat, fixedInputs.in0);
    	samplings.in1.genFixeds(floatFormat, fixedInputs.in1);
    	samplings.in2.genFixeds(floatFormat, fixedInputs.in2);
    	samplings.in3.genFixeds(floatFormat, fixedInputs.in3);

    	for (var ndx0 = 0; ndx0 < fixedInputs.in0.length; ++ndx0) {
    		for (var ndx1 = 0; ndx1 < fixedInputs.in1.length; ++ndx1) {
    			for (var ndx2 = 0; ndx2 < fixedInputs.in2.length; ++ndx2) {
    				for (var ndx3 = 0; ndx3 < fixedInputs.in3.length; ++ndx3) {
    					var tuple = new glsBuiltinPrecisionTests.InTuple(fixedInputs.in0[ndx0],
    												 fixedInputs.in1[ndx1],
    												 fixedInputs.in2[ndx2],
    												 fixedInputs.in3[ndx3]);

    					seenInputs.push(tuple);
    					ret.in0.push(tuple.a);
    					ret.in1.push(tuple.b);
    					ret.in2.push(tuple.c);
    					ret.in3.push(tuple.d);
    				}
    			}
    		}
    	}

    	for (var ndx = 0; ndx < numSamples; ++ndx) {
    		var in0 = samplings.in0.genRandom(floatFormat, intPrecision, rnd);
    		var in1 = samplings.in1.genRandom(floatFormat, intPrecision, rnd);
    		var in2 = samplings.in2.genRandom(floatFormat, intPrecision, rnd);
    		var in3 = samplings.in3.genRandom(floatFormat, intPrecision, rnd);
    		var tuple = new glsBuiltinPrecisionTests.InTuple(in0, in1, in2, in3);

    		// if (de::contains(seenInputs, tuple))
    		// 	continue;

    		seenInputs.push(tuple);
    		ret.in0.push(in0);
    		ret.in1.push(in1);
    		ret.in2.push(in2);
    		ret.in3.push(in3);
    	}

    	return ret;
    };


    /**
     * @constructor
     * @extends{glsBuiltinPrecisionTests.PrecisionCase}
     * @param{string} name
     * @param{glsBuiltinPrecisionTests.FuncBase} func
     */
    glsBuiltinPrecisionTests.FuncCaseBase = function(context, name, func) {
        glsBuiltinPrecisionTests.PrecisionCase.call(this, context, name, func.getRequiredExtension());
    };

    glsBuiltinPrecisionTests.FuncCaseBase.prototype = Object.create(glsBuiltinPrecisionTests.PrecisionCase.prototype);
    glsBuiltinPrecisionTests.FuncCaseBase.prototype.constructor = glsBuiltinPrecisionTests.FuncCaseBase;

    glsBuiltinPrecisionTests.FuncCaseBase.prototype.iterate = function() {

        assertMsgOptions(!(this.m_extension !== undefined && this.m_extension.trim() !== '')
            && !sglrGLContext.isExtensionSupported(gl, this.m_extension),
                'Unsupported extension: ' + this.m_extension, false, true);

	    this.runTest();

	    // m_status.setTestContextResult(m_testCtx);
	    return tcuTestCase.IterateResult.STOP;
    };



    /**
     * template <typename Sig>
     * @constructor
     * @extends{glsBuiltinPrecisionTests.FuncCaseBase}
     * @param{glsBuiltinPrecisionTests.Signature} Sig_
     * @param{glsBuiltinPrecisionTests.Context} context
     * @param{string} name
     * @param{glsBuiltinPrecisionTests.FuncBase} extension
     */
    glsBuiltinPrecisionTests.FuncCase = function(context, name, func) {
        glsBuiltinPrecisionTests.FuncCaseBase.call(this, context, name, func);
        this.Sig = func.Sig;
        // this.CaseFunc = new glsBuiltinPrecisionTests.Func(func.Sig);
        this.m_func = func;
        this.Ret = func.Sig.Ret;
        this.Arg0 = func.Sig.Arg0;
        this.Arg1 = func.Sig.Arg1;
        this.Arg2 = func.Sig.Arg2;
        this.Arg3 = func.Sig.Arg3;
        this.In = new glsBuiltinPrecisionTests.InTypes(this.Arg0, this.Arg1, this.Arg2, this.Arg3);
        this.Out = new glsBuiltinPrecisionTests.OutTypes(this.Ret);
    };

    glsBuiltinPrecisionTests.FuncCase.prototype = Object.create(glsBuiltinPrecisionTests.FuncCaseBase.prototype);
    glsBuiltinPrecisionTests.FuncCase.prototype.constructor = glsBuiltinPrecisionTests.FuncCase;

    /**
     * Samplings<In>
     * @return{glsBuiltinPrecisionTests.Samplings}
     */
    glsBuiltinPrecisionTests.FuncCase.prototype.getSamplings = function()	{
        return new glsBuiltinPrecisionTests.DefaultSamplings(this.In);
    };

    /**
     * template <typename Sig>
     * @param{glsBuiltinPrecisionTests.Signature} Sig_
     */
    glsBuiltinPrecisionTests.FuncCase.prototype.runTest = function(Sig_) {
        /** @type{glsBuiltinPrecisionTests.Inputs} */ var inputs = (glsBuiltinPrecisionTests.generateInputs(
                                                    this.In,
                                                    this.getSamplings(),
    												this.m_ctx.floatFormat,
    												this.m_ctx.precision,
    												this.m_ctx.numRandoms,
    												this.m_rnd));

        var variables = new glsBuiltinPrecisionTests.Variables(this.In, this.Out);
    	// Variables<In, Out>	variables;
        //
    	variables.out0	= new glsBuiltinPrecisionTests.Variable(this.Ret, "out0");
    	variables.out1	= new glsBuiltinPrecisionTests.Variable(glsBuiltinPrecisionTests.Void, "out1");
    	variables.in0	= new glsBuiltinPrecisionTests.Variable(this.Arg0, "in0");
    	variables.in1	= new glsBuiltinPrecisionTests.Variable(this.Arg1, "in1");
    	variables.in2	= new glsBuiltinPrecisionTests.Variable(this.Arg2, "in2");
    	variables.in3	= new glsBuiltinPrecisionTests.Variable(this.Arg3, "in3");
        

		var	expr	= glsBuiltinPrecisionTests.applyVar(this.m_func,
									   variables.in0, variables.in1,
									   variables.in2, variables.in3);
		var	stmt	= glsBuiltinPrecisionTests.variableAssignment(variables.out0, expr);
    
		this.testStatement(variables, inputs, stmt);
    };

    /**
     * template <typename Sig>
     * return ExprP<typename Sig::Ret>
     * @param{glsBuiltinPrecisionTests.Func} func
     * @param{glsBuiltinPrecisionTests.VariableP} arg0
     * @param{glsBuiltinPrecisionTests.VariableP} arg1
     * @param{glsBuiltinPrecisionTests.VariableP} arg2
     * @param{glsBuiltinPrecisionTests.VariableP} arg3
     * @return{glsBuiltinPrecisionTests.ApplyVar}
     */
    glsBuiltinPrecisionTests.applyVar = function(func, arg0, arg1, arg2, arg3) {
        return new glsBuiltinPrecisionTests.ApplyVar(func.Sig, func, arg0, arg1, arg2, arg3)
    };

    /**
     * @param {glsBuiltinPrecisionTests.Variable} variable
     * @param {glsBuiltinPrecisionTests.ApplyVar} value
     * @param {boolean} isDeclaration
     */
    glsBuiltinPrecisionTests.variableStatement = function(variable, value, isDeclaration) {
        return new glsBuiltinPrecisionTests.VariableStatement(variable, value, isDeclaration);
    };

    /**
     * @param {glsBuiltinPrecisionTests.Variable} variable
     * @param {glsBuiltinPrecisionTests.ApplyVar} value
     */
    glsBuiltinPrecisionTests.variableAssignment = function(variable, value) {
        return glsBuiltinPrecisionTests.variableStatement(variable, value, false);
    };




    /**
     * @constructor
     */
    glsBuiltinPrecisionTests.CaseFactories = function() {};

    /**
     * @return{Array<glsBuiltinPrecisionTests.CaseFactory>}
     */
    glsBuiltinPrecisionTests.CaseFactories.prototype.getFactories = function (){};

    /**
     * @constructor
     * @extends{glsBuiltinPrecisionTests.CaseFactories}
     */
    glsBuiltinPrecisionTests.BuiltinFuncs = function() {
        /** @type{Array<glsBuiltinPrecisionTests.CaseFactory>} */ this.m_factories = [];
    };

    glsBuiltinPrecisionTests.BuiltinFuncs.prototype = Object.create(glsBuiltinPrecisionTests.CaseFactories.prototype);
    glsBuiltinPrecisionTests.BuiltinFuncs.prototype.constructor = glsBuiltinPrecisionTests.BuiltinFuncs;

    /**
     * @return{Array<glsBuiltinPrecisionTests.CaseFactory>}
     */
	glsBuiltinPrecisionTests.BuiltinFuncs.prototype.getFactories = function() {
		return this.m_factories.slice();
	};

    /**
     * @return{glsBuiltinPrecisionTests.CaseFactories} fact
     */
	glsBuiltinPrecisionTests.BuiltinFuncs.prototype.addFactory = function(fact)	{
		this.m_factories.push(fact);
	};

    /**
     * template <typename Sig>
     * @param{glsBuiltinPrecisionTests.Context} context
     * @param{string} name
     * @param{glsBuiltinPrecisionTests.Signature} Sig_
     * @param{glsBuiltinPrecisionTests.Func} func
     * @param{glsBuiltinPrecisionTests.PrecisionCase}
     */
    glsBuiltinPrecisionTests.createFuncCase = function(context, name, func) {
    	switch (func.getOutParamIndex()) {
    		case -1:
    			return new glsBuiltinPrecisionTests.FuncCase(context, name, func);
    		// case 1:
    		// 	return new InOutFuncCase<Sig>(context, name, func);
    		default:
    			throw new Error(!"Impossible");
    	}
    	return null;
    };


    /**
     * @constructor
     */
    glsBuiltinPrecisionTests.CaseFactory = function () {};

    /**
     * @return{string}
     */
    glsBuiltinPrecisionTests.CaseFactory.prototype.getName = function	() {
        return '';
    };

    /**
     * @return{string}
     */
    glsBuiltinPrecisionTests.CaseFactory.prototype.getDesc = function	() {
        return '';
    };

    /**
     * template <typename Sig_, int Size>
     * public PrimitiveFunc<Signature<
     *	typename ContainerOf<typename Sig_::Ret, Size>::Container,
     *	typename ContainerOf<typename Sig_::Arg0, Size>::Container,
     *	typename ContainerOf<typename Sig_::Arg1, Size>::Container,
     *	typename ContainerOf<typename Sig_::Arg2, Size>::Container,
     *	typename ContainerOf<typename Sig_::Arg3, Size>::Container> >
     * @constructor
     * @extends{glsBuiltinPrecisionTests.PrimitiveFunc}
     * @param{glsBuiltinPrecisionTests.Signature} Sig_
     * @param{glsBuiltinPrecisionTests.Func} scalarFunc
     */
    glsBuiltinPrecisionTests.GenFunc = function(scalarFunc, Sig_) {
        glsBuiltinPrecisionTests.PrimitiveFunc.call(this, scalarFunc.Sig);
        this.m_func = scalarFunc;
    };

    glsBuiltinPrecisionTests.GenFunc.prototype = Object.create(glsBuiltinPrecisionTests.PrimitiveFunc.prototype);
    glsBuiltinPrecisionTests.GenFunc.prototype.constructor = glsBuiltinPrecisionTests.GenFunc;

    /**
     * @return{string}
     */
    glsBuiltinPrecisionTests.GenFunc.prototype.getName = function() {
       return this.m_func.getName();
    };

    /**
     * @return{number}
     */
    glsBuiltinPrecisionTests.GenFunc.prototype.getOutParamIndex = function() {
       return this.m_func.getOutParamIndex();
    };

    /**
     * @return{string}
     */
    glsBuiltinPrecisionTests.GenFunc.prototype.getRequiredExtension = function() {
       return this.m_func.getRequiredExtension();
    };

    /**
     * @param{Array<glsBuiltinPrecisionTests.ExprBase>} args
     */
    glsBuiltinPrecisionTests.GenFunc.prototype.doPrint = function(/*ostream& os,*/ args) {
       return this.m_func.print(/*os,*/ args);
    };

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @param{glsBuiltinPrecisionTests.Tuple4} iargs
     * @return{*}
     */
    glsBuiltinPrecisionTests.GenFunc.prototype.doApply = function(/*ostream& os,*/ args) {
        /** @type{Array<*>} */ var ret = [];

        for (var ndx = 0; ndx < Size; ++ndx) {
            ret[ndx] = this.m_func.apply(this.ctx, iargs.a[ndx], iargs.b[ndx], iargs.c[ndx], iargs.d[ndx]);
        }

        return ret;
    };

    /**
     * @param{glsBuiltinPrecisionTests.FuncSet} dst
     * @param{glsBuiltinPrecisionTests.Tuple4} iargs
     * @return{*}
     */
    glsBuiltinPrecisionTests.GenFunc.prototype.doGetUsedFuncs = function(dst, iargs) {
    	this.m_func.getUsedFuncs(dst);
    };

    /**
     * template <typename F, int Size>
     * @constructor
     * @extends{glsBuiltinPrecisionTests.GenFunc}
     * @param{*} F typename
     */
     glsBuiltinPrecisionTests.VectorizedFunc = function(F) {
         glsBuiltinPrecisionTests.GenFunc.call(this, F);
    };

    glsBuiltinPrecisionTests.VectorizedFunc.prototype = Object.create(glsBuiltinPrecisionTests.GenFunc.prototype);
    glsBuiltinPrecisionTests.VectorizedFunc.prototype.constructor = glsBuiltinPrecisionTests.VectorizedFunc;

    /**
     * template<typename Sig>
     * @constructor
     * @param{glsBuiltinPrecisionTests.Func} func_
     * @param{glsBuiltinPrecisionTests.GenFunc} func2_
     * @param{glsBuiltinPrecisionTests.GenFunc} func3_
     * @param{glsBuiltinPrecisionTests.GenFunc} func4_
     */
    glsBuiltinPrecisionTests.GenFuncs = function(func_, func2_, func3_, func4_) {
        this.func = func_;
        this.func2 = func2_;
        this.func3 = func3_;
        this.func4 = func4_;
    };

    /**
     * template <typename Sig>
     * @constructor
     * @extends{glsBuiltinPrecisionTests.CaseFactory}
     * @param{glsBuiltinPrecisionTests.Signature} Sig_
     * @param{glsBuiltinPrecisionTests.GenFuncs} funcs
     * @param{string} name
     */
    glsBuiltinPrecisionTests.GenFuncCaseFactory = function (Sig_, funcs, name) {
        glsBuiltinPrecisionTests.CaseFactory.call(this);
        this.Sig = Sig_;
        this.m_funcs = funcs;
        this.m_name = name;
    };

    glsBuiltinPrecisionTests.GenFuncCaseFactory.prototype = Object.create(glsBuiltinPrecisionTests.CaseFactory.prototype);
    glsBuiltinPrecisionTests.GenFuncCaseFactory.prototype.constructor = glsBuiltinPrecisionTests.GenFuncCaseFactory;

    /**
     * template <typename Sig>
     * @param{glsBuiltinPrecisionTests.Context} ctx
     * @return{tcuTestCase.DeqpTest}
     */
    glsBuiltinPrecisionTests.GenFuncCaseFactory.prototype.createCase = function(ctx) {
        /** @type {tcuTestCase.DeqpTest} */
        var group = tcuTestCase.newTest(ctx.name, ctx.name);
		group.addChild(glsBuiltinPrecisionTests.createFuncCase(ctx, 'scalar', this.m_funcs.func));
		group.addChild(glsBuiltinPrecisionTests.createFuncCase(ctx, 'vec2', this.m_funcs.func2));
		group.addChild(glsBuiltinPrecisionTests.createFuncCase(ctx, 'vec3', this.m_funcs.func3));
		group.addChild(glsBuiltinPrecisionTests.createFuncCase(ctx, 'vec4', this.m_funcs.func4));

		return group;
	};

    /**
     * @return{string}
     */
    glsBuiltinPrecisionTests.GenFuncCaseFactory.prototype.getName = function() {
		return this.m_name;
	};

    /**
     * @return{string}
     */
    glsBuiltinPrecisionTests.GenFuncCaseFactory.prototype.getDesc = function() {
		return "Function '" + this.m_funcs.func.getName() + "'";
	};

    /**
     * @constructor
     * @param{string} name_
     * @param{glsBuiltinPrecisionTests.FloatFormat} floatFormat_
     * @param{glsBuiltinPrecisionTests.FloatFormat} highpFormat_
     * @param{gluShaderUtil.precision} precision_
     * @param{gluShaderProgram.shaderType} shaderType_
     * @param{number} numRandoms_
     */
    glsBuiltinPrecisionTests.Context = function(name_, floatFormat_, highpFormat_, precision_, shaderType_, numRandoms_) {
        /** @type{string} */ this.name = name_ ;
        /** @type{glsBuiltinPrecisionTests.FloatFormat} */ this.floatFormat = floatFormat_;
        /** @type{glsBuiltinPrecisionTests.FloatFormat} */ this.highpFormat =highpFormat_;
        /** @type{gluShaderUtil.precision} */ this.precision = precision_;
        /** @type{gluShaderProgram.shaderType} */ this.shaderType = shaderType_;
        /** @type{number} */ this.numRandoms = numRandoms_;
    };

    /**
     * @constructor
     * @param{glsBuiltinPrecisionTests.FloatFormat} highp_
     * @param{glsBuiltinPrecisionTests.FloatFormat} mediump_
     * @param{glsBuiltinPrecisionTests.FloatFormat} lowp_
     * @param{Array<gluShaderProgram.shaderType>} shaderTypes_
     * @param{number} numRandoms_
     */
    glsBuiltinPrecisionTests.PrecisionTestContext = function(highp_, mediump_, lowp_, shaderTypes_, numRandoms_) {
        /** @type{Array<gluShaderProgram.shaderType>} */ this.shaderTypes = shaderTypes_;
        /** @type{Array<glsBuiltinPrecisionTests.FloatFormat>} */ this.formats = [];
        this.formats[gluShaderUtil.precision.PRECISION_HIGHP] = highp_;
        this.formats[gluShaderUtil.precision.PRECISION_MEDIUMP] = mediump_;
        this.formats[gluShaderUtil.precision.PRECISION_LOWP] = lowp_;
        /** @type{number} */ this.numRandoms = numRandoms_;
    };

    /**
     * @param{glsBuiltinPrecisionTests.PrecisionTestContext} ctx
     * @param{glsBuiltinPrecisionTests.CaseFactory} factory
     * @return {tcuTestCase.DeqpTest}
     */
    glsBuiltinPrecisionTests.createFuncGroup = function (ctx, factory) {
        /** @type{tcuTestCase.DeqpTest} */ var group = new tcuTestCase.newTest(factory.getName(), factory.getDesc());

	    for (var precNdx in gluShaderUtil.precision) {
    		/** @type{gluShaderUtil.precision} */ var precision = gluShaderUtil.precision[precNdx];
    		/** @type{string} */ var precName = gluShaderUtil.getPrecisionName(precision);
    		/** @type{glsBuiltinPrecisionTests.FloatFormat} */ var fmt	= ctx.formats[precision];
    		/** @type{glsBuiltinPrecisionTests.FloatFormat} */ var highpFmt = ctx.formats[gluShaderUtil.precision.PRECISION_HIGHP];

    		for (var shaderNdx in ctx.shaderTypes)
    		{
    			/** @type{gluShaderProgram.shaderType} */ var shaderType = ctx.shaderTypes[shaderNdx];
    			/** @type{string} */ var shaderName	= gluShaderProgram.getShaderTypeName(shaderType);
    			/** @type{string} */ var name = precName + '_' + shaderName;
    			/** @type{glsBuiltinPrecisionTests.Context} */ var caseCtx = new glsBuiltinPrecisionTests.Context(name, fmt, highpFmt,
    											 precision, shaderType, ctx.numRandoms);

    			group.addChild(factory.createCase(caseCtx));
    		}
	    }

	    return group;
    };

    /**
     * @param{glsBuiltinPrecisionTests.CaseFactories} cases
     * @param{Array<gluShaderProgram.shaderType>} shaderTypes
     * @param{tcuTestCase.DeqpTest} dstGroup
     * @return {tcuTestCase.DeqpTest}
     */
    glsBuiltinPrecisionTests.addBuiltinPrecisionTests = function(cases, shaderTypes, dstGroup) {
	    /** @type{glsBuiltinPrecisionTests.FloatFormat} */ var highp	= new tcuFloatFormat.FloatFormat(-126, 127, 23, true,
												 tcuFloatFormat.YesNoMaybe.MAYBE,	// subnormals
												 tcuFloatFormat.YesNoMaybe.YES,		// infinities
												 tcuFloatFormat.YesNoMaybe.MAYBE);	// NaN
	    // \todo [2014-04-01 lauri] Check these once Khronos bug 11840 is resolved.
	    /** @type{glsBuiltinPrecisionTests.FloatFormat} */ var mediump = new tcuFloatFormat.FloatFormat(-13, 13, 9, false);
	    // A fixed-point format is just a floating point format with a fixed
	    // exponent and support for subnormals.
	    /** @type{glsBuiltinPrecisionTests.FloatFormat} */ var lowp	= new tcuFloatFormat.FloatFormat(0, 0, 7, false, tcuFloatFormat.YesNoMaybe.YES);
	    /** @type{glsBuiltinPrecisionTests.PrecisionTestContext} */ var ctx	= new glsBuiltinPrecisionTests.PrecisionTestContext(highp, mediump, lowp,
												 shaderTypes, 16384);

	    for (var ndx = 0; ndx < cases.getFactories().length; ++ndx)
		    dstGroup.addChild(glsBuiltinPrecisionTests.createFuncGroup(ctx, cases.getFactories()[ndx]));
    };

    /**
     * @param{*} T typename
     * @return{*}
     */
    glsBuiltinPrecisionTests.instance = function(T) {
	    /** type{*} */ var s_instance = new T();
    	return s_instance;
    };


    /**
     * template <typename F>
     * @param {*} F typename
     * @param {glsBuiltinPrecisionTests.BuiltinFuncs} funcs
     * @param {string=} name
     */
    glsBuiltinPrecisionTests.addScalarFactory = function(F, funcs, name) {
    	if (name === undefined)
    		name = glsBuiltinPrecisionTests.instance(F).getName();

        funcs.addFactory(new glsBuiltinPrecisionTests.GenFuncCaseFactory(F.Sig, glsBuiltinPrecisionTests.makeVectorizedFuncs(F), name));
    }

    /**
     * @return {glsBuiltinPrecisionTests.CaseFactories}
     */
    glsBuiltinPrecisionTests.createES3BuiltinCases = function() {
    	/** @type{glsBuiltinPrecisionTests.CaseFactories} */ var funcs = new glsBuiltinPrecisionTests.BuiltinFuncs();

    	glsBuiltinPrecisionTests.addScalarFactory(glsBuiltinPrecisionTests.Add,funcs);
	// addScalarFactory<Sub>(*funcs);
	// addScalarFactory<Mul>(*funcs);
	// addScalarFactory<Div>(*funcs);
    //
	// addScalarFactory<Radians>(*funcs);
	// addScalarFactory<Degrees>(*funcs);
	// addScalarFactory<Sin>(*funcs);
	// addScalarFactory<Cos>(*funcs);
	// addScalarFactory<Tan>(*funcs);
	// addScalarFactory<ASin>(*funcs);
	// addScalarFactory<ACos>(*funcs);
	// addScalarFactory<ATan2>(*funcs, "atan2");
	// addScalarFactory<ATan>(*funcs);
	// addScalarFactory<Sinh>(*funcs);
	// addScalarFactory<Cosh>(*funcs);
	// addScalarFactory<Tanh>(*funcs);
	// addScalarFactory<ASinh>(*funcs);
	// addScalarFactory<ACosh>(*funcs);
	// addScalarFactory<ATanh>(*funcs);
    //
	// addScalarFactory<Pow>(*funcs);
	// addScalarFactory<Exp>(*funcs);
	// addScalarFactory<Log>(*funcs);
	// addScalarFactory<Exp2>(*funcs);
	// addScalarFactory<Log2>(*funcs);
	// addScalarFactory<Sqrt>(*funcs);
	// addScalarFactory<InverseSqrt>(*funcs);
    //
	// addScalarFactory<Abs>(*funcs);
	// addScalarFactory<Sign>(*funcs);
	// addScalarFactory<Floor>(*funcs);
	// addScalarFactory<Trunc>(*funcs);
	// addScalarFactory<Round>(*funcs);
	// addScalarFactory<RoundEven>(*funcs);
	// addScalarFactory<Ceil>(*funcs);
	// addScalarFactory<Fract>(*funcs);
	// addScalarFactory<Mod>(*funcs);
	// funcs.addFactory(createSimpleFuncCaseFactory<Modf>());
	// addScalarFactory<Min>(*funcs);
	// addScalarFactory<Max>(*funcs);
	// addScalarFactory<Clamp>(*funcs);
	// addScalarFactory<Mix>(*funcs);
	// addScalarFactory<Step>(*funcs);
	// addScalarFactory<SmoothStep>(*funcs);
    //
	// funcs.addFactory(SharedPtr<const CaseFactory>(new TemplateFuncCaseFactory<Length>()));
	// funcs.addFactory(SharedPtr<const CaseFactory>(new TemplateFuncCaseFactory<Distance>()));
	// funcs.addFactory(SharedPtr<const CaseFactory>(new TemplateFuncCaseFactory<Dot>()));
	// funcs.addFactory(createSimpleFuncCaseFactory<Cross>());
	// funcs.addFactory(SharedPtr<const CaseFactory>(new TemplateFuncCaseFactory<Normalize>()));
	// funcs.addFactory(SharedPtr<const CaseFactory>(new TemplateFuncCaseFactory<FaceForward>()));
	// funcs.addFactory(SharedPtr<const CaseFactory>(new TemplateFuncCaseFactory<Reflect>()));
	// funcs.addFactory(SharedPtr<const CaseFactory>(new TemplateFuncCaseFactory<Refract>()));
    //
    //
	// funcs.addFactory(SharedPtr<const CaseFactory>(new MatrixFuncCaseFactory<MatrixCompMult>()));
	// funcs.addFactory(SharedPtr<const CaseFactory>(new MatrixFuncCaseFactory<OuterProduct>()));
	// funcs.addFactory(SharedPtr<const CaseFactory>(new MatrixFuncCaseFactory<Transpose>()));
	// funcs.addFactory(SharedPtr<const CaseFactory>(new SquareMatrixFuncCaseFactory<Determinant>()));
	// funcs.addFactory(SharedPtr<const CaseFactory>(new SquareMatrixFuncCaseFactory<Inverse>()));

    	return funcs;
    };

});
