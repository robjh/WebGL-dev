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

define(['framework/common/tcuSurface', 'framework/delibs/debase/deMath' ], function(tcuSurface, deMath) {

var displayResultPane = function(id, width, height) {
	displayResultPane.counter = displayResultPane.counter || 0;
	var i = displayResultPane.counter++;
	var elem = document.getElementById(id);
	var span = document.createElement("span");
	elem.appendChild(span);
	span.innerHTML = '<table><tr><td>Result</td><td>Reference</td><td>Error mask</td></tr>' +
							'<tr><td><canvas id="result' + i + '" width=' + width + ' height=' + height +'</td><td><canvas id="reference' + i +'" width=' + width + ' height=' + height +'</td><td><canvas id="diff' + i +'" width=' + width + ' height=' + height +'</td>' +
					 '</table>';
	var canvasResult = document.getElementById('result' + i);
	var ctxResult = canvasResult.getContext('2d');
	var canvasRef = document.getElementById('reference' + i);
	var ctxRef = canvasRef.getContext('2d');
	var canvasDiff = document.getElementById('diff' + i);
	var ctxDiff = canvasDiff.getContext('2d');
	return [ctxResult, ctxRef, ctxDiff];
};

var displayImages = function(result, reference, diff) {
	var createImage = function(ctx, src) {
		var w = src.getWidth();
		var h = src.getHeight();
		var imgData = ctx.createImageData(w, h);
		var index = 0;
		for (var y = 0; y < h; y++) {
			for (var x = 0; x < w; x++)	{
				var	pixel = src.getPixelInt(x, y, 0);
				for (var i = 0; i < 4; i++) {
					imgData.data[index] = pixel[i];
					index = index + 1;
				}
			}
		}
		return imgData;
	};
	var w = result.getWidth();
	var h = result.getHeight();

	var contexts = displayResultPane('console', w, h);
	contexts[0].putImageData(createImage(contexts[0], result), 0, 0);
	contexts[1].putImageData(createImage(contexts[1], reference), 0, 0);
	if (diff)
		contexts[2].putImageData(createImage(contexts[2], diff), 0, 0);
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
	var errorMask = new tcuSurface.Surface(width, height);

	var				maxDiff				= [0, 0, 0, 0];
	var				pixelBias			= [0, 0, 0, 0];
	var				pixelScale			= [1, 1, 1, 1];

	assertMsgOptions(result.getWidth() == width && result.getHeight() == height && result.getDepth() == depth,
		'Reference and result images have different dimensions', false, true);


	for (var z = 0; z < depth; z++)	{
		for (var y = 0; y < height; y++) {
			for (var x = 0; x < width; x++)	{
			var	refPix		= reference.getPixelInt(x, y, z);
				var	cmpPix		= result.getPixelInt(x, y, z);

				var	diff		= deMath.absDiff(refPix, cmpPix);
				var	isOk		= deMath.boolAll(deMath.lessThanEqual(diff, threshold));


				maxDiff = deMath.max(maxDiff, diff);
				var color = [0, 255, 0, 255];
				if (!isOk)
					color = [255, 0, 0, 255];
				errorMask.setPixel(x, y, color);
			}
		}
	}

	var compareOk = deMath.boolAll(deMath.lessThanEqual(maxDiff, threshold));

	if (!compareOk) {
		debug("Image comparison failed: max difference = " + maxDiff + ", threshold = " + threshold);
		displayImages(result, reference, errorMask.getAccess());
	}

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