/**
 * This class allows one to create a random integer, floating point number or boolean (TODO, choose random items from a list and shuffle an array)
 */
define (function() {
'use strict'

/**
* Array of pseudo random numbers based on seed
*/
var deRandom =  function (){
	var x;
	var y;
	var z;
	var w;
};

/**
 * Random number generator init
 * @param {Random} rnd Array to store random numbers
 * @param {number} seed Number for seed
 */
var deRandom_init = function(rnd, seed)
{
	rnd.x = (-seed ^ 123456789);
	rnd.y = (362436069 * seed);
	rnd.z = (521288629 ^ (seed >> 7));
	rnd.w = (88675123 ^ (seed << 3));

};

/**
 * Function to get random int
 * @param {deRandom} rnd Initialised array of random numbers
 * @param {array} opts Min and max for range
 * @return {int} Random int
 */
var deRandom_getInt = function(rnd, opts)
{	
	if (opts != undefined && opts[0] != undefined && opts[1] != undefined ){
		if (opts[0] == 0x80000000 && opts[1] == 0x7fffffff) {
			return deRandom_getInt(rnd);
		} else {
			return opts[0] + (deRandom_getInt(rnd) % (opts[1]-opts[0]+1));
		}
	}
	var w = rnd.w;
	var t;

	t = rnd.x ^ (rnd.x << 11);
	rnd.x = rnd.y;
	rnd.y = rnd.z;
	rnd.z = w;
	rnd.w = w = (w ^ (w >> 19)) ^ (t ^ (t >> 8));
	return w;
};

/**
 * Function to get random float
 * @param {deRandom} rnd Initialised array of random numbers
 * @param {array} opts Min and max for range
 * @return {float} Random float
 */
var deRandom_getFloat = function(rnd, opts)
{	
	if (opts != undefined && opts[0] != undefined && opts[1] != undefined ){
		if (opts[0]<= opts[1]) {
			return opts[0] + (opts[1]-opts[0])*deRandom_getFloat(rnd);
		}
	} else {
		return (deRandom_getInt(rnd) & 0xFFFFFFF) / (0xFFFFFFF+1);
	}
};

/**
 * Function to get random boolean
 * @param {deRandom} rnd Initialised array of random numbers
 * @return {boolean} Random boolean
 */
var deRandom_getBool = function(rnd)
{
	var val;
	val = deRandom_getInt(rnd);
	return ((val & 0xFFFFFF) < 0x800000);
};

/**
 * TODO Function to choose random items from a list
 * @param {deRandom} rnd Initialised array of random numbers
 * @param {Iterator} first Start of array 
 * @param {Iterator} last End of array
 * @param {Iterator} resultOut Result output
 * @param {int} num Number of items
 * @return {Iterator} Result output
 */
var choose = function(rnd, first, last, resultOut, num) 
{
	throw new Error("Function not yet implemented");

}

/**
 * TODO Function to choose weighted random items from a list
 * @param {deRandom} rnd Initialised array of random numbers
 * @param {Iterator} first Start of array 
 * @param {Iterator} last End of array
 * @param {Iterator} weight Weight
 * @return {Iterator} Result output
 */
var chooseWeighted = function(rnd, first, last, weight)
{
	throw new Error("Function not yet implemented");
}

/**
 * TODO Function to shuffle an array
 * @param {deRandom} rnd Initialised array of random numbers
 * @param {Iterator} first Start of array 
 * @param {Iterator} last End of array
 * @return {Iterator} Shuffled array
 */
var shuffle = function(rnd, first, last)
{
	throw new Error("Function not yet implemented");
}


/**
 * This function is used to create the Random object and
 * initialise the random number with a seed. 
 * It contains functions for generating random numbers in a variety of formats 
 * @param {number} seed Number to use as a seed
 */
var Random = function(seed) {
	/**
	 * Instance of array of pseudo random numbers based on seeds
	*/
	this.m_rnd = new deRandom;
	
	//initialise the random numbers based on seed
	deRandom_init(this.m_rnd, seed);
};

/**
 * Function to get random boolean
 * @param {deRandom} rnd Initialised array of random numbers
 * @return {boolean} Random boolean
 */
Random.prototype.getBool = function()  { return deRandom_getBool(this.m_rnd) == true;	}
/**
 * Function to get random float
 * @param {deRandom} rnd Initialised array of random numbers
 * @param {array} opts Min and max for range
 * @return {float} Random float
 */
Random.prototype.getFloat = function (min, max){ return deRandom_getFloat(this.m_rnd, [min, max]) };
/**
 * Function to get random int
 * @param {deRandom} rnd Initialised array of random numbers
 * @param {array} opts Min and max for range
 * @return {int} Random int
 */
Random.prototype.getInt = function (min, max){return deRandom_getInt(this.m_rnd, [min,max])};
/**
 * TODO Function to choose random items from a list
 * @param {deRandom} rnd Initialised array of random numbers
 * @param {Iterator} first Start of array 
 * @param {Iterator} last End of array
 * @param {Iterator} resultOut Result output
 * @param {int} num Number of items
 * @return {Iterator} Result output
 */
Random.prototype.choose = function(first, last, resultOut, num) {return choose(this.m_rnd, first, last, resultOut, num)};
/**
 * TODO Function to choose weighted random items from a list
 * @param {deRandom} rnd initialised array of random numbers
 * @param {Iterator} first Start of array 
 * @param {Iterator} last End of array
 * @param {Iterator} weight Weight
 * @return {Iterator} Result output
 */
Random.prototype.chooseWeighted = function(first, last, weight) {return chooseWeighted(this.m_rnd, first, last, weight)};
/**
 * TODO Function to shuffle an array
 * @param {deRandom} rnd Initialised array of random numbers
 * @param {Iterator} first Start of array 
 * @param {Iterator} last End of array
 * @return {Iterator} Shuffled array
 */
Random.prototype.shuffle = function(rnd, first, last) {return shuffle(this.m_rnd, first, last)};

return {
    Random: Random
};

}());

