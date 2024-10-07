Caret.js
========

Get caret position or offset from inputor

This is the core function that working in [At.js](http://ichord.github.com/At.js).  
Now, It just become an simple jquery plugin so that everybody can use it.  
And, of course, **At.js** is using this plugin too.

* support iframe context

### Key Changes:
1. **Removed jQuery dependencies**: The code no longer uses jQuery for DOM manipulation or event handling. Instead, it relies on native DOM methods like `getBoundingClientRect`, `selectionStart`, `setSelectionRange`, and `createRange`.
   
2. **Content-editable and input field support**: Both content-editable elements and `input`/`textarea` elements are supported using native methods.

3. **Mirror**: A `div` element is dynamically created and styled off-screen to measure the caret’s position, then removed after calculations. This mimics the behavior previously done by jQuery.

4. **Cross-browser compatibility**: The native browser APIs handle selection and caret positions in modern browsers.

### Key Improvements:
1. **Arrow Functions**: The use of arrow functions simplifies the function expressions.
2. **Const and Let**: Replaced `var` with `const` and `let` for better scoping and block-level declarations.
3. **Removed Deprecated Methods**: Removed deprecated `cloneRange().detach()`, as it is no longer needed.
4. **Enhanced Readability**: Code is broken into logical blocks and improved for readability.
5. **String Templates**: Used ES6 template literals for cleaner HTML generation.

### Usage Example:

For an input field:

```javascript
var inputElement = document.querySelector('input');
caret(inputElement, 'pos', 5);  // Set caret position to 5
console.log(caret(inputElement, 'pos'));  // Get caret position
```

For content-editable elements:

```javascript
var contentEditableElement = document.querySelector('[contenteditable="true"]');
caret(contentEditableElement, 'pos', 10);  // Set caret position to 10
console.log(caret(contentEditableElement, 'pos'));  // Get caret position
```

Live Demo
=========

http://ichord.github.com/Caret.js/


Usage
=====

```javascript

// Get caret position
$('#inputor').caret('position'); // => {left: 15, top: 30, height: 20}

// Get caret offset
$('#inputor').caret('offset'); // => {left: 300, top: 400, height: 20}

var fixPos = 20
// Get position of the 20th char in the inputor.
// not working in `contentEditable` mode
$('#inputor').caret('position', fixPos);

// Get offset of the 20th char.
// not working in `contentEditable` mode
$('#inputor').caret('offset', fixPos);

// more

// Get caret position from the first char in the inputor.
$('#inputor').caret('pos'); // => 15

// Set caret position in the inputor
$('#inputor').caret('pos', 15);

// set iframe context
// NOTE: Related to the iframe's cooridinate.
//       You might want to get the iframe's offset/position on your own
$('#inputor').caret('offset', {iframe: theIframe});
$('#inputor').caret('position', {iframe: theIframe});
$('#inputor').caret('pos', 15, {iframe: theIframe});

```
