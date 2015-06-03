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
goog.provide('framework.common.tcuLogImage');
goog.require('framework.common.tcuTexture');

goog.scope(function() {

var tcuLogImage = framework.common.tcuLogImage;
var tcuTexture = framework.common.tcuTexture;

/**
 * @param {tcuTexture.ConstPixelBufferAccess} src
 */
tcuLogImage.createImage = function(ctx, src) {
    var w = src.getWidth();
    var h = src.getHeight();
    var pixelSize = src.getFormat().getPixelSize();
    var imgData = ctx.createImageData(w, h);
    var index = 0;
    for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
            var pixel = src.getPixelInt(x, h - y - 1, 0);
            for (var i = 0; i < pixelSize; i++) {
                imgData.data[index] = pixel[i];
                index = index + 1;
            }
            if (pixelSize < 4)
                imgData.data[index++] = 255;
        }
    }
    return imgData;
};

/**
 * @param {string} name
 * @param {string} description
 * @param {tcuTexture.ConstPixelBufferAccess} image
 * @param {Array<number>=} scale
 * @param {Array<number>=} bias
 */ 
tcuLogImage.logImage = function(name, description, image, scale, bias) {
    var elem = document.getElementById('console');
    var span = document.createElement('span');
    var info = name + ' ' + description + '<br>    ' + image;
    if (scale)
        info += '<br>    Scale: ' + scale;
    if (bias)
        info += '<br>    Bias: ' + bias;
    tcuLogImage.logImage.counter = tcuLogImage.logImage.counter || 0;
    var i = tcuLogImage.logImage.counter++;
    var width = image.getWidth();
    var height = image.getHeight();

    elem.appendChild(span);
    span.innerHTML = info + '<br>    <canvas id="logImage' + i + '" width=' + width + ' height=' + height + '></canvas><br>';

    var imageCanvas = document.getElementById('logImage' + i);
    var ctx = imageCanvas.getContext('2d');
    var data = tcuLogImage.createImage(ctx, image);
    ctx.putImageData(data, 0, 0);
};

});