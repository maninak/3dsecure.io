'use strict';

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
 * Enumerated variable for use with `setPaddingSlanted()`.
 */
var PAD = { TOP: 'paddingTop', BOTTOM: 'paddingBottom' };

/**
 * For an element with slanted background, set its bottom padding correctly, accounting for browser width.
 * 
 * Example:
 * var el = document.querySelector('section.js-bottom-padding');
 * setPaddingBottomSlanted(el, 160, 5); // executes on page load to initialize
 * window.addEventListener('resize', function() { setPaddingBottomSlanted(fel, 160, 5); });
 * 
 * @param {{}} el A reference to the DOM element to which the padding will be applied
 * @param {{TOP, BOTTOM}} padPosition The side of the element where the padding should be applied
 * @param {Number} desiredPadding The padding desired for the element in pixels
 * @param {Number} slantAngle The angle of the slanted side in degrees
 */
function setPaddingSlanted(el, padPosition, desiredPadding, slantAngle) {
  // right-angle trigonometry says "opposite_side = attached_side * tan(angle)"
  var slantHeight = window.innerWidth * Math.tan(getRadiansFromDegrees(slantAngle));
  el.style[padPosition] = desiredPadding - (slantHeight / 2);
}

/**
 * Scroll the page until the DOM element with the specified Id comes into view
 * 
 * Example:
 * <a onclick="smoothScroll('info')">
 * 
 * @param {String} elId The id of the DOM element towards which to scroll the page
 * @param {String} position The position of the element to towards which to scroll. Can be `'middle'`. Defaults to top.
 */
function smoothScrollToId(elId, position) {
  function currentYPosition() {
    // Firefox, Chrome, Opera, Safari
    if (self.pageYOffset) { return self.pageYOffset; }
    // Internet Explorer 6 - standards mode
    else if (document.documentElement && document.documentElement.scrollTop) {
      return document.documentElement.scrollTop;
    }
    // Internet Explorer 6, 7 and 8
    else if (document.body.scrollTop) { return document.body.scrollTop; }
    else { return 0; }
  }

  function elYPosition(elId) {
    var el = document.getElementById(elId);

    // if so specified, calculate element position so as to scroll to its middle
    // if not specified, default to scrolling to the element's top
    var y;
    if (position === 'middle') {
      y = el.offsetTop + (el.clientHeight / 2) - (window.innerHeight / 2);
    }
    else {
      y = el.offsetTop;
    }

    var node = el;
    while ((node.offsetParent) && (node.offsetParent != document.body)) {
      node = node.offsetParent;
      y += node.offsetTop;
    }
    
    return y;
  }

  var startY = currentYPosition();
  var stopY = elYPosition(elId);
  var distance = (stopY > startY) ? stopY - startY : startY - stopY;
  
  if (distance < 100) { 
    scrollTo(0, stopY);
    return; 
  } 
    
  var speed = Math.round(distance / 100); 
  if (speed >= 20) { speed = 20; } 
    
  var step = Math.round(distance / 25); 
  var leapY = (stopY > startY) ? startY + step : startY - step; 
  var timer = 0; 
    
  if (stopY > startY) { 
    for (var i = startY; i < stopY; i += step) { 
      setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
      document.dispatchEvent(new Event('scroll')); 
      leapY += step;
      if (leapY > stopY) { leapY = stopY; }
      timer++;
    }
  }
  else if (stopY <= startY) {
    for (var i = startY; i > stopY; i -= step) { 
      setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
      leapY -= step;
      if (leapY < stopY) { leapY = stopY; }
      timer++;
    }
  }
}



/*-----------------------------*\
 *  Navbar
\*-----------------------------*/

var navbarEl = document.querySelector('section.navbar');
var navbarHeight = navbarEl.clientHeight;
var prevTime = 0;
var prevY = document.body.scrollTop; // init with distance of viewport's top from webpages's top
var minScrollSpeed = 0.75; // speed in px/sec, less than which navbar will not be pushed around
var minTimeBetweenScrolls = 50; // minimum time between navbar state re-evaluation (performance)
var ctaButtonEl = document.querySelector('.navbar__wrap__cta a');
var isNavbarAttached = true;

function setNavbarVisible() {
  navbarEl.classList.remove('js-navbar--hidden');
  navbarEl.classList.add('js-navbar--visible');
}

function setNavbarHidden() {
  navbarEl.classList.remove('js-navbar--visible');
  navbarEl.classList.add('js-navbar--hidden');
}

function setNavbarAttached() {
  navbarEl.classList.remove('js-navbar--detached');
  navbarEl.classList.add('js-navbar--attached');
  ctaButtonEl.classList.remove('btn--accent');
  ctaButtonEl.classList.add('btn--outline');
  isNavbarAttached = true;
}

function setNavbarDetached() {
  navbarEl.classList.remove('js-navbar--attached');
  navbarEl.classList.add('js-navbar--detached');
  ctaButtonEl.classList.remove('btn--outline');
  ctaButtonEl.classList.add('btn--accent');
  isNavbarAttached = false;
}

/**
 * When invoked upon each scroll event, it evaluates whether the navbar CSS state should be updated
 * and does it if so.
 * 
 * It instantly hides the navbar on downward scroll. On upward scrolls the navbar is hidden only
 * if user scrolled fast enough (requires assured intention from user and provides affordance until
 * then).
 * 
 * Example:
 * window.addEventListener('scroll', function(event) { evaluateNavbarState(event); });
 * 
 * @param {{}} event The latest scroll event
 */
function evaluateNavbarState(event) {
  var newTime = event.timeStamp;
  var newY = document.body.scrollTop;

  if ((!isNavbarAttached) && (newY > 0)) {} // performance optimization
  else if (newY > 0) { setNavbarDetached(); }
  else { setNavbarAttached(); }

  // if scrolling events come too often, avoid further processing until some time has passed
  if ((newTime - prevTime) < minTimeBetweenScrolls) { return; } // performance optimization
  
  var scrollSpeed = (newY - prevY) / (newTime - prevTime);

  // If viewport is not past navbar, enforce that it's visible
  if (newY <= navbarHeight) { setNavbarVisible(); }
  // If user scrolled downwards and is past the navbar, instantly hide it
  else if (scrollSpeed > 0) { setNavbarHidden(); }
  // Else if user scrolled upwards and fast, bring navbar into viewport
  else if ((scrollSpeed) <= (- minScrollSpeed)) { setNavbarVisible(); }

  prevTime = newTime;
  prevY = newY;
}



/*-----------------------------*\
 *  Event listeners
\*-----------------------------*/

window.addEventListener('scroll', function(event) { evaluateNavbarState(event); });



/*-----------------------------*\
 *  Initializations
\*-----------------------------*/

evaluateNavbarState(new Event(''));
