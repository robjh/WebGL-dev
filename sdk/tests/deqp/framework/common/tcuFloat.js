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

define(['framework/delibs/debase/deInt32'], function(deInt32)  {
'use strict';

var DE_ASSERT = function(x) {
    if (!x)
        throw new Error('Assert failed');
};

var EndianType = function() {
    return {
        LITTLE: 0,
        BIG: 1
    };
};

var checkEndianness = function() {
    var a = new ArrayBuffer(2);
    var b = new Uint8Array(a);
    var c = new Uint16Array(a);
    b[0] = 0xa1;
    b[1] = 0xb2;
    if (c[0] == 0xb2a1) return EndianType.LITTLE;
    if (c[0] == 0xa1b2) return EndianType.BIG;
    else throw new Error('Something crazy just happened');
};

var Endianness = checkEndianness();

/**
 * Converts a byte array to a number
 * @param {Uint8Array} array
 * @return {number}
 */
var arrayToNumber = function(array) {
    var result = 0;

    for (var ndx = 0; ndx < array.length; ndx++)
    {
        result += array[ndx] * Math.pow(256, ndx);
    }

    return result;
};

/**
 * Fills a byte array with a number
 * @param {Uint8Array} array Output array (already resized)
 * @param {number} number
 */
var numberToArray = function(array, number) {
    for (var byteNdx = 0; byteNdx < array.length; byteNdx++)
    {
        var acumzndx = !byteNdx ? number : Math.floor(number / Math.pow(256, byteNdx));
        array[byteNdx] = acumzndx & 0xFF;
    }
};

var getBitRange = function(array, firstNdx, lastNdx) {
    var bitSize = lastNdx - firstNdx;
    var byteSize = Math.floor(bitSize / 8) + ((bitSize % 8) > 0 ? 1 : 0);

    var buffer = new ArrayBuffer(byteSize);
    var outArray = new Uint8Array(buffer);

    for (var bitNdx = firstNdx; bitNdx < lastNdx; bitNdx++)
    {
        var sourceByte = Math.floor(bitNdx / 8);
        var sourceBit = Math.floor(bitNdx % 8);

        var destByte = Math.floor((bitNdx - firstNdx) / 8);
        var destBit = Math.floor((bitNdx - firstNdx) % 8);

        var sourceBitValue = (array[sourceByte] & Math.pow(2, sourceBit)) != 0 ? 1 : 0;

        outArray[destByte] = outArray[destByte] | (Math.pow(2, destBit) * sourceBitValue);
    }

    return arrayToNumber(outArray);
};

var BinaryOp = {
    AND: 0,
    OR: 1
};

var doNativeBinaryOp = function(valueA, valueB, operation) {
    switch (operation)
    {
    case BinaryOp.AND:
        return valueA & valueB;
    case BinaryOp.OR:
        return valueA | valueB;
    }
};

var binaryOp = function(valueA, valueB, binaryOp) {
    var valueABitSize = Math.floor(Math.log2(valueA) + 1);
    var valueBBitSize = Math.floor(Math.log2(valueB) + 1);
    var bitsSize = Math.max(valueABitSize, valueBBitSize);

    if (bitsSize <= 32)
        return doNativeBinaryOp(valueA, valueB, binaryOp);

    var valueAByteSize = Math.floor(valueABitSize / 8) + ((valueABitSize % 8) > 0 ? 1 : 0);
    var valueBByteSize = Math.floor(valueBBitSize / 8) + ((valueBBitSize % 8) > 0 ? 1 : 0);
    var byteSize = Math.floor(bitsSize / 8) + ((bitsSize % 8) > 0 ? 1 : 0);

    var valueABuffer = new ArrayBuffer(valueAByteSize);
    var valueBBuffer = new ArrayBuffer(valueBByteSize);
    var buffer = new ArrayBuffer(byteSize);

    var inArrayA = new Uint8Array(valueABuffer);
    var inArrayB = new Uint8Array(valueBBuffer);
    var outArray = new Uint8Array(buffer);

    numberToArray(inArrayA, valueA);
    numberToArray(inArrayB, valueB);
    var largestArray = inArrayA.length > inArrayB.length ? inArrayA : inArrayB;

    var minLength = Math.min(inArrayA.length, inArrayB.length);

    for (var byteNdx = 0; byteNdx < minLength; byteNdx++)
    {
        outArray[byteNdx] = doNativeBinaryOp(inArrayA[byteNdx], inArrayB[byteNdx], binaryOp);
    }

    while (byteNdx < byteSize)
    {
        outArray[byteNdx] = largestArray[byteNdx];
        byteNdx++;
    }

    return arrayToNumber(outArray);
};

var binaryNot = function(value) {
    var bitsSize = Math.floor(Math.log2(value) + 1);

    /*if (bitsSize <= 32)
        return ~value;*/

    var byteSize = Math.floor(bitsSize / 8) + ((bitsSize % 8) > 0 ? 1 : 0);

    var inBuffer = new ArrayBuffer(byteSize);
    var inArray = new Uint8Array(inBuffer);

    var buffer = new ArrayBuffer(byteSize);
    var outArray = new Uint8Array(buffer);

    numberToArray(inArray, value);

    for (var byteNdx = 0; byteNdx < byteSize; byteNdx++)
    {
        outArray[byteNdx] = ~inArray[byteNdx];
    }

    return arrayToNumber(outArray);
};

/**
 * Shifts the given value steps bits to the left
 * This function should be used if the expected value will be wider than 64-bits
 * Instead of returning a value, as the widest in Javascript is 64 bits, it fills a byte buffer
 * @param {number} value
 * @param {number} steps
 * @param {ArrayBuffer} storageBuffer The output will be written here.
 */
var shiftLeftArray = function(value, steps, storageBuffer)
{
    var totalBitsRequired = Math.floor(Math.log2(value) + 1) + steps;

    if (totalBitsRequired < 32)
        return value << steps;

    var totalBytesRequired = Math.floor(totalBitsRequired / 8) + ((totalBitsRequired % 8) > 0 ? 1 : 0);

    DE_ASSERT(storageBuffer.length >= totalBytesRequired);

    var inBuffer = new ArrayBuffer(totalBytesRequired);
    var inArray = new Uint8Array(inBuffer);

    var buffer = storageBuffer;
    var outArray = new Uint8Array(buffer);

    numberToArray(inArray, value);

    for (var bitNdx = 0; bitNdx < totalBitsRequired; bitNdx++)
    {
        var sourceByte = Math.floor(bitNdx / 8);
        var sourceBit = Math.floor(bitNdx % 8);
        var newbitNdx = bitNdx + steps;
        var correspondingByte = Math.floor(newbitNdx / 8);
        var correspondingBit = Math.floor(newbitNdx % 8);
        var bitValue = (inArray[sourceByte] & Math.pow(2, sourceBit)) != 0 ? 1 : 0;
        outArray[correspondingByte] = outArray[correspondingByte] | (Math.pow(2, correspondingBit) * bitValue);
    }
};

/**
 * Shifts the given value steps bits to the left
 * This function should be used if the expected value will be wider than 64-bits
 * Instead of returning a value, as the widest in Javascript is 64 bits, it fills a byte buffer
 * @param {number} value
 * @param {number} steps
 * @param {ArrayBuffer} storageBuffer The output will be written here.
 */
var shiftLeft = function(value, steps)
{
    var totalBitsRequired = Math.floor(Math.log2(value) + 1) + steps;


    if (totalBitsRequired < 32)
        return value << steps;

    totalBitsRequired = totalBitsRequired > 64 ? 64 : totalBitsRequired; //No more than 64-bits

    var totalBytesRequired = Math.floor(totalBitsRequired / 8) + ((totalBitsRequired % 8) > 0 ? 1 : 0);

    var inBuffer = new ArrayBuffer(totalBytesRequired);
    var inArray = new Uint8Array(inBuffer);

    var buffer = new ArrayBuffer(totalBytesRequired);
    var outArray = new Uint8Array(buffer);

    numberToArray(inArray, value);

    for (var bitNdx = 0; bitNdx < totalBitsRequired; bitNdx++)
    {
        var sourceByte = Math.floor(bitNdx / 8);
        var sourceBit = Math.floor(bitNdx % 8);
        var newbitNdx = bitNdx + steps;
        var correspondingByte = Math.floor(newbitNdx / 8);
        var correspondingBit = Math.floor(newbitNdx % 8);
        var bitValue = (inArray[sourceByte] & Math.pow(2, sourceBit)) != 0 ? 1 : 0;
        outArray[correspondingByte] = outArray[correspondingByte] | (Math.pow(2, correspondingBit) * bitValue);
    }

    return arrayToNumber(outArray);
};

/**
 * Shifts the given value steps bits to the right
 * If the shift operation exceeds 64 bits, overflown bits are lost.
 * The reason for this function is, JS will automatically
 * convert numbers to 32 bits after shift operations.
 * @param {number} value
 * @param {number} steps
 * @return {number} 64 bit binary value
 */
var shiftRight = function(value, steps)
{
    var totalBitsRequired = Math.floor(Math.log2(value) + 1); //additional bits not needed (will be 0) + steps;

    if (totalBitsRequired < 32)
        return value >> steps;

    var totalBytesRequired = Math.floor(totalBitsRequired / 8) + ((totalBitsRequired % 8) > 0 ? 1 : 0);

    var inBuffer = new ArrayBuffer(totalBytesRequired);
    var inArray = new Uint8Array(inBuffer);

    var buffer = new ArrayBuffer(totalBytesRequired);
    var outArray = new Uint8Array(buffer);

    numberToArray(inArray, value);

    for (var bitNdx = totalBitsRequired - 1; bitNdx >= steps; bitNdx--)
    {
        var sourceByte = Math.floor(bitNdx / 8);
        var sourceBit = Math.floor(bitNdx % 8);
        var newbitNdx = bitNdx - steps;
        var correspondingByte = Math.floor(newbitNdx / 8);
        var correspondingBit = Math.floor(newbitNdx % 8);
        var bitValue = (inArray[sourceByte] & Math.pow(2, sourceBit)) != 0 ? 1 : 0;
        outArray[correspondingByte] = outArray[correspondingByte] | (Math.pow(2, correspondingBit) * bitValue);
    }

    return arrayToNumber(outArray);
};

var FloatFlags = {
    FLOAT_HAS_SIGN: (1 << 0),
    FLOAT_SUPPORT_DENORM: (1 << 1)
};

var FloatDescription = function(exponentBits, mantissaBits, exponentBias, flags) {
    this.ExponentBits = exponentBits;
    this.MantissaBits = mantissaBits;
    this.ExponentBias = exponentBias;
    this.Flags = flags;

    this.totalBitSize = 1 + this.ExponentBits + this.MantissaBits;
    this.totalByteSize = Math.floor(this.totalBitSize / 8) + ((this.totalBitSize % 8) > 0 ? 1 : 0);
};

/**
 * @param {number} sign
 * @return {deFloat}
 */
FloatDescription.prototype.zero = function(sign) {
    return newDeFloatFromParameters(
        shiftLeft((sign > 0 ? 0 : 1), (this.ExponentBits + this.MantissaBits)),
        new FloatDescription(this.ExponentBits, this.MantissaBits, this.ExponentBias, this.Flags)
    );
};

/**
 * @param {number} sign
 * @return {deFloat}
 */
FloatDescription.prototype.inf = function(sign) {
    return newDeFloatFromParameters(((sign > 0 ? 0 : 1) << (this.ExponentBits + this.MantissaBits)) |
        shiftLeft(((1 << this.ExponentBits) - 1), this.MantissaBits), //Unless using very large exponent types, native shift is safe here, i guess.
        new FloatDescription(this.ExponentBits, this.MantissaBits, this.ExponentBias, this.Flags)
    );
};

/**
 * @return {deFloat}
 */
FloatDescription.prototype.nan = function() {
    return newDeFloatFromParameters(shiftLeft(1, (this.ExponentBits + this.MantissaBits)) - 1,
        new FloatDescription(this.ExponentBits, this.MantissaBits, this.ExponentBias, this.Flags)
    );
};

FloatDescription.prototype.construct = function(sign, exponent, mantissa) {
    // Repurpose this otherwise invalid input as a shorthand notation for zero (no need for caller to care about internal representation)
    /** @type {boolean} */ var isShorthandZero = exponent == 0 && mantissa == 0;

    // Handles the typical notation for zero (min exponent, mantissa 0). Note that the exponent usually used exponent (-ExponentBias) for zero/subnormals is not used.
    // Instead zero/subnormals have the (normally implicit) leading mantissa bit set to zero.

    /** @type {boolean} */ var isDenormOrZero = (exponent == 1 - this.ExponentBias) && (shiftRight(mantissa, this.MantissaBits) == 0);
    /** @type {number} */ var s = shiftLeft((sign < 0 ? 1 : 0), (this.ExponentBits + this.MantissaBits));
    /** @type {number} */ var exp = (isShorthandZero || isDenormOrZero) ? 0 : exponent + this.ExponentBias;

    DE_ASSERT(sign == +1 || sign == -1);
    DE_ASSERT(isShorthandZero || isDenormOrZero || shiftRight(mantissa, this.MantissaBits) == 1);
    DE_ASSERT((exp >> this.ExponentBits) == 0); //Native shift is safe

    return newDeFloatFromParameters(
        binaryOp(
            binaryOp(
                s,
                shiftLeft(exp, this.MantissaBits),
                BinaryOp.OR
            ),
            binaryOp(
                mantissa,
                shiftLeft(1, this.MantissaBits) - 1,
                BinaryOp.AND
            ),
            BinaryOp.OR
        ),
        new FloatDescription(this.ExponentBits, this.MantissaBits, this.ExponentBias, this.Flags)
    );
};

FloatDescription.prototype.constructBits = function(sign, exponent, mantissaBits) {
    /** @type {number} */ var signBit = sign < 0 ? 1 : 0;
    /** @type {number} */ var exponentBits = exponent + this.ExponentBias;

    DE_ASSERT(sign == +1 || sign == -1);
    DE_ASSERT((exponentBits >> this.ExponentBits) == 0);
    DE_ASSERT(shiftRight(mantissaBits >> this.MantissaBits) == 0);

    return newDeFloatFromParameters(
        binaryOp(
            binaryOp(
                shiftLeft(
                    signBit,
                    this.ExponentBits + this.MantissaBits
                ),
                shiftLeft(exponentBits, this.MantissaBits),
                BinaryOp.OR
            ),
            mantissaBits,
            BinaryOp.OR
        ),
        new FloatDescription(this.ExponentBits, this.MantissaBits, this.ExponentBias, this.Flags)
    );
};

/**
 * @param {deFloat} other Other float to convert to this format description.
 * @return {deFloat} converted deFloat
 */
FloatDescription.prototype.convert = function(other) {
    var otherExponentBits = other.description.ExponentBits;
    var otherMantissaBits = other.description.MantissaBits;
    var otherExponentBias = other.description.ExponentBias;
    var otherFlags = other.description.Flags;

    if (!(this.Flags & FloatFlags.FLOAT_HAS_SIGN) && other.sign() < 0)
    {
        // Negative number, truncate to zero.
        return this.zero(+1);
    }
    else if (other.isInf())
    {
        return this.inf(other.sign());
    }
    else if (other.isNaN())
    {
        return this.nan();
    }
    else if (other.isZero())
    {
        return this.zero(other.sign());
    }
    else
    {
        /** @type {number} */ var eMin = 1 - this.ExponentBias;
        /** @type {number} */ var eMax = ((1 << this.ExponentBits) - 2) - this.ExponentBias;

        /** @type {number} */ var s = shiftLeft(other.signBit(), (this.ExponentBits + this.MantissaBits)); // \note Not sign, but sign bit.
        /** @type {number} */ var e = other.exponent();
        /** @type {number} */ var m = other.mantissa();

        // Normalize denormalized values prior to conversion.
        while (!binaryOp(m, shiftLeft(1, otherMantissaBits), BinaryOp.AND))
        {
            m = shiftLeft(m, 1);
            e -= 1;
        }

        if (e < eMin)
        {
            // Underflow.
            if ((this.Flags & FloatFlags.FLOAT_SUPPORT_DENORM) && (eMin - e - 1 <= this.MantissaBits))
            {
                // Shift and round (RTE).
                /** @type {number} */ var bitDiff = (otherMantissaBits - this.MantissaBits) + (eMin - e);
                /** @type {number} */ var half = shiftLeft(1, (bitDiff - 1)) - 1;
                /** @type {number} */ var bias = binaryOp(shiftRight(m, bitDiff), 1, BinaryOp.AND);

                return newDeFloatFromParameters(
                    binaryOp(
                        s,
                        shiftRight(
                            m + half + bias,
                            bitDiff
                        ),
                        BinaryOp.OR
                    ),
                    new FloatDescription(this.ExponentBits, this.MantissaBits, this.ExponentBias, this.Flags)
                );
            }
            else
                return this.zero(other.sign());
        }
        else
        {
            // Remove leading 1.
            m = binaryOp(m, binaryNot(shiftLeft(1, otherMantissaBits)), BinaryOp.AND);

            if (this.MantissaBits < otherMantissaBits)
            {
                // Round mantissa (round to nearest even).
                /** @type {number} */ var bitDiff = otherMantissaBits - this.MantissaBits;
                /** @type {number} */ var half = shiftLeft(1, (bitDiff - 1)) - 1;
                /** @type {number} */ var bias = binaryOp(shiftRight(m, bitDiff), 1, BinaryOp.AND);

                m = shiftRight(m + half + bias, bitDiff);

                if (binaryOp(m, shiftLeft(1, this.MantissaBits), BinaryOp.AND))
                {
                    // Overflow in mantissa.
                    m = 0;
                    e += 1;
                }
            }
            else
            {
                /** @type {number} */ var bitDiff = this.MantissaBits - otherMantissaBits;
                m = shiftLeft(m, bitDiff);
            }

            if (e > eMax)
            {
                // Overflow.
                return this.inf(other.sign());
            }
            else
            {
                DE_ASSERT(deInt32.deInRange32(e, eMin, eMax));
                DE_ASSERT(binaryOp((e + this.ExponentBias), binaryNot(shiftLeft(1, this.ExponentBits) - 1), BinaryOp.AND) == 0);
                DE_ASSERT(binaryOp(m, binaryNot(shiftLeft(1, this.MantissaBits) - 1), BinaryOp.AND) == 0);

                return newDeFloatFromParameters(
                    binaryOp(
                        binaryOp(
                            s,
                            shiftLeft(
                                e + this.ExponentBias,
                                this.MantissaBits
                            ),
                            BinaryOp.OR
                        ),
                        m,
                        BinaryOp.OR
                    ),
                    new FloatDescription(this.ExponentBits, this.MantissaBits, this.ExponentBias, this.Flags)
                );
            }
        }
    }
};

/**
 * deFloat class - Empty constructor, builds a 32 bit float by default
 */
var deFloat = function() {
    this.description = new FloatDescription(8, 23, 127, FloatFlags.FLOAT_HAS_SIGN | FloatFlags.FLOAT_SUPPORT_DENORM);

    this.buffer = new ArrayBuffer(this.description.totalByteSize);
    this.array = new Uint8Array(this.buffer);

    this.m_value = 0;
};

/**
 * deFloatNumber - To be used immediately after constructor
 * Builds a 32-bit deFloat based on a 64-bit JS number.
 * @param {number} jsnumber
 */
deFloat.prototype.deFloatNumber = function(jsnumber) {
    var view32 = new DataView(this.buffer);
    view32.setFloat32(0, jsnumber, true); //little-endian
    this.m_value = view32.getFloat32(0, true); //little-endian

    return this;
};

var newDeFloatFromNumber = function(jsnumber) {
    return new deFloat().deFloatNumber(jsnumber);
};

/**
 * deFloatBuffer - To be used immediately after constructor
 * Builds a 32-bit or less deFloat based on a buffer with parameters.
 * @param {ArrayBuffer} buffer
 * @param {FloatDescription} description
 */
deFloat.prototype.deFloatBuffer = function(buffer, description) {
    this.buffer = buffer;
    this.array = new Uint8Array(this.buffer);

    this.m_value = arrayToNumber(this.array);

    return this;
};

var newDeFloatFromBuffer = function(buffer, description) {
    return new deFloat().deFloatBuffer(buffer, description);
};

/**
 * Initializes a deFloat from the given number,
 * with the specified format parameters as description.
 * It does not perform any conversion.
 * @param {number} jsnumber
 * @param {Floatdescription} description
 * @return {deFloat}
 **/
deFloat.prototype.deFloatParameters = function(jsnumber, description) {
    this.m_value = jsnumber;
    this.description = description;

    this.buffer = new ArrayBuffer(this.description.totalByteSize);
    this.array = new Uint8Array(this.buffer);

    numberToArray(this.array, jsnumber);

    return this;
};

var newDeFloatFromParameters = function(jsnumber, description) {
    return new deFloat().deFloatParameters(jsnumber, description);
};

deFloat.prototype.bits = function() {return arrayToNumber(this.array);};
/** @return {number} */
deFloat.prototype.signBit = function() {
    return getBitRange(this.array, this.description.totalBitSize - 1, this.description.totalBitSize);
    //return (this.m_value >> (this.description.ExponentBits + this.description.MantissaBits)) & 1;
};
/** @return {number} */
deFloat.prototype.exponentBits = function() {
    return getBitRange(this.array, this.description.MantissaBits, this.description.MantissaBits + this.description.ExponentBits);
    //return (this.m_value >> this.description.MantissaBits) & ((1 << this.description.ExponentBits) - 1);
};
/** @return {number} */
deFloat.prototype.mantissaBits = function() {
    return getBitRange(this.array, 0, this.description.MantissaBits);
    //return this.m_value & ((1 << this.description.MantissaBits) - 1);
};
/** @return {number} */
deFloat.prototype.sign = function() {
    var sign = this.signBit();
    var signvalue = sign ? -1 : 1;
    return signvalue;
    //return this.signBit() ? -1 : 1;
};
/** @return {number} */
deFloat.prototype.exponent = function() {return this.isDenorm() ? 1 - this.description.ExponentBias : this.exponentBits() - this.description.ExponentBias;};
/** @return {number} */
deFloat.prototype.mantissa = function() {return this.isZero() || this.isDenorm() ? this.mantissaBits() : binaryOp(this.mantissaBits(), shiftLeft(1, this.description.MantissaBits), BinaryOp.OR);};
/** @return {boolean} */
deFloat.prototype.isInf = function() {return this.exponentBits() == ((1 << this.description.ExponentBits) - 1) && this.mantissaBits() == 0;};
/** @return {boolean} */
deFloat.prototype.isNaN = function() {return this.exponentBits() == ((1 << this.description.ExponentBits) - 1) && this.mantissaBits() != 0;};
/** @return {boolean} */
deFloat.prototype.isZero = function() {return this.exponentBits() == 0 && this.mantissaBits() == 0;};
/** @return {boolean} */
deFloat.prototype.isDenorm = function() {return this.exponentBits() == 0 && this.mantissaBits() != 0;};

/**
 * @param {number} sign
 * @return {deFloat}
 */
deFloat.prototype.zero = function(sign) {
    return this.description.zero(sign);
};

/**
 * @param {number} sign
 * @return {deFloat}
 */
deFloat.prototype.inf = function(sign) {
    return this.description.inf(sign);
};

/**
 * @return {deFloat}
 */
deFloat.prototype.nan = function() {
    return this.description.nan();
};

deFloat.prototype.construct = function(sign, exponent, mantissa) {
    return this.description.construct(sign, exponent, mantissa);
};

deFloat.prototype.constructBits = function(sign, exponent, mantissaBits) {
    return this.description.constructBits(sign, exponent, mantissaBits);
};

deFloat.prototype.getValue = function() {
    var mymantissa = this.mantissa();
    var myexponent = this.exponent();
    var sign = this.sign();

    var value = mymantissa / Math.pow(2, this.description.MantissaBits) * Math.pow(2, myexponent);

    if (this.description.Flags | FloatFlags.FLOAT_HAS_SIGN != 0)
        value = value * sign;

    return value;
};

var newFloat10 = function(value) {
    var other32 = new deFloat().deFloatNumber(value);
    var description10 = new FloatDescription(5, 5, 15, 0);
    return description10.convert(other32);
};

var newFloat11 = function(value) {
    var other32 = new deFloat().deFloatNumber(value);
    var description11 = new FloatDescription(5, 6, 15, 0);
    return description11.convert(other32);
};

var newFloat16 = function(value) {
    var other32 = new deFloat().deFloatNumber(value);
    var description16 = new FloatDescription(5, 10, 15, FloatFlags.FLOAT_HAS_SIGN | FloatFlags.FLOAT_SUPPORT_DENORM);
    return description16.convert(other32);
};

var newFloat32 = function(value) {
    return new deFloat().deFloatNumber(value);
};

return {
    FloatFlags: FloatFlags,
    FloatDescription: FloatDescription,
    deFloat: deFloat,
    newDeFloatFromNumber: newDeFloatFromNumber,
    newDeFloatFromBuffer: newDeFloatFromBuffer,
    newDeFloatFromParameters: newDeFloatFromParameters,
    newFloat10: newFloat10,
    newFloat11: newFloat11,
    newFloat16: newFloat16,
    newFloat32: newFloat32
};

});
