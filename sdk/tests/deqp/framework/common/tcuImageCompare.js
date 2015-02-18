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

var addCanvas = function(id, width, height) {
	var elem = document.getElementById(id);
	var canvas = document.createElement("canvas");
	elem.appendChild(canvas);
	canvas.width = width;
	canvas.height = height;
	var ctx = canvas.getContext('2d');
	return ctx;
};

var displayImage = function(/*const ConstPixelBufferAccess&*/ image) {
	var w = image.getWidth();
	var h = image.getHeight();
	var ctx = addCanvas('console', w, h);
	var imgData = ctx.createImageData(w, h);
	var index = 0;
	for (var y = 0; y < h; y++) {
		for (var x = 0; x < w; x++)	{	
			var	pixel = image.getPixelInt(x, y, 0);
			for (var i = 0; i < 4; i++) {
				imgData.data[index] = pixel[i]; 
				index = index + 1;
			}
		}
	}
	ctx.putImageData(imgData, 0, 0);
};

/*--------------------------------------------------------------------*//*!
 * \brief Per-pixel threshold-based comparison
 *
 * This compare computes per-pixel differences between result and reference
 * image. Comparison fails if any pixels exceed the given threshold value.
 *
 * This comparison can be used for integer- and fixed-point texture formats.
 * Difference is computed in integer space.
 *
 * On failure error image is generated that shows where the failing pixels
 * are.
 *
 * \param log			Test log for results
 * \param imageSetName	Name for image set when logging results
 * \param imageSetDesc	Description for image set
 * \param reference		Reference image
 * \param result		Result image
 * \param threshold		Maximum allowed difference
 * \param logMode		Logging mode
 * \return true if comparison passes, false otherwise
 *//*--------------------------------------------------------------------*/
var intThresholdCompare = function(/*const char* */imageSetName, /*const char* */imageSetDesc, /*const ConstPixelBufferAccess&*/ reference, /*const ConstPixelBufferAccess&*/ result, /*const UVec4&*/ threshold, /*CompareLogMode*/ logMode) {
	var					width				= reference.getWidth();
	var					height				= reference.getHeight();
	var					depth				= reference.getDepth();
	// TextureLevel		errorMaskStorage	(TextureFormat(TextureFormat::RGB, TextureFormat::UNORM_INT8), width, height, depth);
	// PixelBufferAccess	errorMask			= errorMaskStorage.getAccess();
	var				maxDiff				= [0, 0, 0, 0];
	var				pixelBias			= [0, 0, 0, 0];
	var				pixelScale			= [1, 1, 1, 1];

	assertMsgOptions(result.getWidth() == width && result.getHeight() == height && result.getDepth() == depth,
		'Reference and result images have different dimension', false, true);

	
	for (var z = 0; z < depth; z++)	{
		for (var y = 0; y < height; y++) {
			for (var x = 0; x < width; x++)	{	
			var	refPix		= reference.getPixelInt(x, y, z);
				var	cmpPix		= result.getPixelInt(x, y, z);

				var	diff		= refPix.absDiff(cmpPix);
				var	isOk		= diff.lessThanEqual(threshold).boolAll();


				maxDiff = maxDiff.max(diff);

				// errorMask.setPixel(isOk ? IVec4(0, 0xff, 0, 0xff) : IVec4(0xff, 0, 0, 0xff), x, y, z);
			}
		}
	}

	var compareOk = maxDiff.lessThanEqual(threshold).boolAll();

	if (!compareOk) {
		debug('Result image');
		displayImage(result);
		debug('<br>Reference image');
		displayImage(reference);
		debug('<br>Images differ');
	}

	// if (!compareOk || logMode == COMPARE_LOG_EVERYTHING)
	// {
	// 	// All formats except normalized unsigned fixed point ones need remapping in order to fit into unorm channels in logged images.
	// 	if (tcu::getTextureChannelClass(reference.getFormat().type)	!= tcu::TEXTURECHANNELCLASS_UNSIGNED_FIXED_POINT ||
	// 		tcu::getTextureChannelClass(result.getFormat().type)	!= tcu::TEXTURECHANNELCLASS_UNSIGNED_FIXED_POINT)
	// 	{
	// 		computeScaleAndBias(reference, result, pixelScale, pixelBias);
	// 		log << TestLog::Message << "Result and reference images are normalized with formula p * " << pixelScale << " + " << pixelBias << TestLog::EndMessage;
	// 	}

	// 	if (!compareOk)
	// 		log << TestLog::Message << "Image comparison failed: max difference = " << maxDiff << ", threshold = " << threshold << TestLog::EndMessage;

	// 	log << TestLog::ImageSet(imageSetName, imageSetDesc)
	// 		<< TestLog::Image("Result",		"Result",		result,		pixelScale, pixelBias)
	// 		<< TestLog::Image("Reference",	"Reference",	reference,	pixelScale, pixelBias)
	// 		<< TestLog::Image("ErrorMask",	"Error mask",	errorMask)
	// 		<< TestLog::EndImageSet;
	// }
	// else if (logMode == COMPARE_LOG_RESULT)
	// {
	// 	if (result.getFormat() != TextureFormat(TextureFormat::RGBA, TextureFormat::UNORM_INT8))
	// 		computePixelScaleBias(result, pixelScale, pixelBias);

	// 	log << TestLog::ImageSet(imageSetName, imageSetDesc)
	// 		<< TestLog::Image("Result",		"Result",		result,		pixelScale, pixelBias)
	// 		<< TestLog::EndImageSet;
	// }

	return compareOk;
};

/*--------------------------------------------------------------------*//*!
 * \brief Per-pixel threshold-based comparison
 *
 * This compare computes per-pixel differences between result and reference
 * image. Comparison fails if any pixels exceed the given threshold value.
 *
 * On failure error image is generated that shows where the failing pixels
 * are.
 *
 * \param log			Test log for results
 * \param imageSetName	Name for image set when logging results
 * \param imageSetDesc	Description for image set
 * \param reference		Reference image
 * \param result		Result image
 * \param threshold		Maximum allowed difference
 * \param logMode		Logging mode
 * \return true if comparison passes, false otherwise
 *//*--------------------------------------------------------------------*/
var pixelThresholdCompare = function(/*const char* */imageSetName, /*const char* */imageSetDesc, /*const Surface&*/ reference, /*const Surface&*/ result, /*const RGBA&*/ threshold, /*CompareLogMode*/ logMode) {
	return intThresholdCompare(imageSetName, imageSetDesc, reference.getAccess(), result.getAccess(), threshold, logMode);
};

return {
	pixelThresholdCompare: pixelThresholdCompare
};

});