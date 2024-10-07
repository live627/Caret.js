(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define([], function () {
			return (root.returnExportsGlobal = factory());
		});
	} else if (typeof exports === 'object') {
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like environments that support module.exports,
		// like Node.
		module.exports = factory();
	} else {
		root.caret = factory();
	}
}(this, function () {

	"use strict";

	var EditableCaret, InputCaret, Mirror, Utils, discoveryIframeOf, methods, oDocument, oFrame, oWindow, pluginName, setContextBy;

	pluginName = 'caret';

	EditableCaret = function(inputor) {
		this.inputor = inputor;
		this.domInputor = this.inputor;
	};

	EditableCaret.prototype.setPos = function(pos) {
		var fn, found, offset, sel;
		if (sel = oWindow.getSelection()) {
			offset = 0;
			found = false;
			(fn = function(pos, parent) {
				var node, range;
				var childNodes = parent.childNodes;
				for (var i = 0; i < childNodes.length; i++) {
					node = childNodes[i];
					if (found) break;
					if (node.nodeType === 3) {
						if (offset + node.length >= pos) {
							found = true;
							range = oDocument.createRange();
							range.setStart(node, pos - offset);
							sel.removeAllRanges();
							sel.addRange(range);
							break;
						} else {
							offset += node.length;
						}
					} else {
						fn(pos, node);
					}
				}
			})(pos, this.domInputor);
		}
		return this.domInputor;
	};

	EditableCaret.prototype.getPosition = function() {
		var offset = this.getOffset();
		var inputorOffset = this.inputor.getBoundingClientRect();
		offset.left -= inputorOffset.left;
		offset.top -= inputorOffset.top;
		return offset;
	};

	EditableCaret.prototype.getPos = function() {
		var clonedRange, pos, range;
		if (range = this.range()) {
			clonedRange = range.cloneRange();
			clonedRange.selectNodeContents(this.domInputor);
			clonedRange.setEnd(range.endContainer, range.endOffset);
			pos = clonedRange.toString().length;
			clonedRange.detach();
			return pos;
		}
	};

	EditableCaret.prototype.getOffset = function() {
		var clonedRange, offset, range, rect, shadowCaret;
		if (oWindow.getSelection && (range = this.range())) {
			if (range.endOffset - 1 > 0 && range.endContainer !== this.domInputor) {
				clonedRange = range.cloneRange();
				clonedRange.setStart(range.endContainer, range.endOffset - 1);
				clonedRange.setEnd(range.endContainer, range.endOffset);
				rect = clonedRange.getBoundingClientRect();
				offset = {
					height: rect.height,
					left: rect.left + rect.width,
					top: rect.top
				};
				clonedRange.detach();
			}
			if (!offset || (offset != null ? offset.height : void 0) === 0) {
				clonedRange = range.cloneRange();
				shadowCaret = oDocument.createTextNode("|");
				clonedRange.insertNode(shadowCaret);
				clonedRange.selectNode(shadowCaret);
				rect = clonedRange.getBoundingClientRect();
				offset = {
					height: rect.height,
					left: rect.left,
					top: rect.top
				};
				shadowCaret.remove();
				clonedRange.detach();
			}
		}
		return offset;
	};

	EditableCaret.prototype.range = function() {
		var sel;
		if (!oWindow.getSelection) {
			return;
		}
		sel = oWindow.getSelection();
		if (sel.rangeCount > 0) {
			return sel.getRangeAt(0);
		} else {
			return null;
		}
	};

	InputCaret = function(inputor) {
		this.inputor = inputor;
		this.domInputor = this.inputor;
	};

	InputCaret.prototype.getPos = function() {
		return this.domInputor.selectionStart;
	};

	InputCaret.prototype.setPos = function(pos) {
		var inputor = this.domInputor;
		if (inputor.setSelectionRange) {
			inputor.setSelectionRange(pos, pos);
		}
		return inputor;
	};

	InputCaret.prototype.getOffset = function(pos) {
		var offset, position;
		var inputor = this.inputor;
		offset = inputor.getBoundingClientRect();
		position = this.getPosition(pos);
		return {
			left: offset.left + position.left - inputor.scrollLeft,
			top: offset.top + position.top - inputor.scrollTop,
			height: position.height
		};
	};

	InputCaret.prototype.getPosition = function(pos) {
		var at_rect, html, mirror;
		var inputor = this.inputor;

		var format = function(value) {
			value = value.replace(/<|>|`|"|&/g, '?').replace(/\r\n|\r|\n/g, "<br/>");
			if (/firefox/i.test(navigator.userAgent)) {
				value = value.replace(/\s/g, '&nbsp;');
			}
			return value;
		};

		if (pos === undefined) {
			pos = this.getPos();
		}
		var startRange = inputor.value.slice(0, pos);
		var endRange = inputor.value.slice(pos);
		html = "<span style='position: relative; display: inline;'>" + format(startRange) + "</span>";
		html += "<span id='caret' style='position: relative; display: inline;'>|</span>";
		html += "<span style='position: relative; display: inline;'>" + format(endRange) + "</span>";
		mirror = new Mirror(inputor);
		at_rect = mirror.create(html).rect();
		return at_rect;
	};

	Mirror = function(inputor) {
		this.inputor = inputor;
	};

	Mirror.prototype.mirrorCss = function() {
		var css = {
			position: 'absolute',
			left: -9999,
			top: 0,
			zIndex: -20000
		};
		return css;
	};

	Mirror.prototype.create = function(html) {
		var mirror = document.createElement('div');
		mirror.style = this.mirrorCss();
		mirror.innerHTML = html;
		this.inputor.after(mirror);
		return {
			rect: function() {
				var flag = mirror.querySelector("#caret");
				var pos = flag.getBoundingClientRect();
				mirror.remove();
				return {
					left: pos.left,
					top: pos.top,
					height: flag.offsetHeight
				};
			}
		};
	};

	Utils = {
		contentEditable: function(inputor) {
			return !!(inputor.contentEditable && inputor.contentEditable === 'true');
		}
	};

	methods = {
		pos: function(pos) {
			if (pos !== undefined) {
				return this.setPos(pos);
			} else {
				return this.getPos();
			}
		},
		position: function(pos) {
			return this.getPosition(pos);
		},
		offset: function(pos) {
			return this.getOffset(pos);
		}
	};

	oDocument = document;
	oWindow = window;

	return function(inputor, method, value) {
		var caret;
		if (methods[method]) {
			caret = Utils.contentEditable(inputor) ? new EditableCaret(inputor) : new InputCaret(inputor);
			return methods[method].apply(caret, [value]);
		} else {
			throw new Error("Method " + method + " does not exist on caret");
		}
	};
}));
