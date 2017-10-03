/*-----------------------------*\
 *  Utilities
\*-----------------------------*/

/**
 * Returns a number whose value is limited to the given range.
 *
 * Example: limit the output of this computation to between 0 and 255
 * (x * 255).clamp(0, 255)
 *
 * @param {Number} min The lower boundary of the output range
 * @param {Number} max The upper boundary of the output range
 * @returns A number in the range [min, max]
 * @type Number
 */
Number.prototype.clamp = function(min, max) {
  return Math.min(Math.max(this, min), max);
};

/**
 * Converts an angle from degrees into radians.
 * 
 * Example:
 * Math.tan(getRadiansFromDegrees(5));
 * 
 * @param {Number} degrees The angle in degrees
 * @returns The angle in radians
 * @type Number
 */
function getRadiansFromDegrees(degrees) { return degrees * (Math.PI / 180); } 

/**
 * For an element with slanted background, set its bottom padding correctly, accounting for browser width.
 * 
 * Example:
 * var el = document.querySelector('section.js-bottom-padding');
 * setPaddingBottomSlanted(el, 160, 5); // executes on page load to initialize
 * window.addEventListener('resize', function() { setPaddingBottomSlanted(fel, 160, 5); });
 * 
 * @param {Object} el A reference to the DOM element to which the padding will be applied
 * @param {Number} desiredPadding The padding desired for the element in pixels
 * @param {Number} slantAngle The angle of the slanted side in degrees
 */
function setPaddingBottomSlanted(el, desiredPadding, slantAngle) {
  // right-angle triangle trigonometry says "opposite_side = attached_side * tan(angle)"
  var slantHeight = window.innerWidth * Math.tan(getRadiansFromDegrees(slantAngle));
  el.style.paddingBottom = desiredPadding - (slantHeight / 2);
}



/*-----------------------------*\
 *  Initialization
\*-----------------------------*/

/*
    Set correct bottom padding for `Features` section
*/
var featuresSectionEl = document.querySelector('section.js-bottom-padding');
setPaddingBottomSlanted(featuresSectionEl, 160, 5); // executes on page load to initialize
window.addEventListener('resize', function() { setPaddingBottomSlanted(featuresSectionEl, 160, 5); });

/*
    Set correct top padding for `3DS-benefits` section
*/
