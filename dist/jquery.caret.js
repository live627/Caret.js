((root, factory) => {
	if (typeof define === 'function' && define.amd) {
		define([], () => (root.returnExportsGlobal = factory()));
	} else if (typeof exports === 'object') {
		module.exports = factory();
	} else {
		root.caret = factory();
	}
})(this, () => {
	"use strict";

	const pluginName = 'caret';
	let oDocument = document;
	let oWindow = window;

	class EditableCaret {
		constructor(inputor) {
			this.inputor = inputor;
			this.domInputor = inputor;
		}

		setPos(pos) {
			const sel = oWindow.getSelection();
			if (sel) {
				let offset = 0, found = false;

				const findPosition = (pos, parent) => {
					for (const node of parent.childNodes) {
						if (found) break;

						if (node.nodeType === 3) {
							if (offset + node.length >= pos) {
								found = true;
								const range = oDocument.createRange();
								range.setStart(node, pos - offset);
								sel.removeAllRanges();
								sel.addRange(range);
								break;
							} else {
								offset += node.length;
							}
						} else {
							findPosition(pos, node);
						}
					}
				};

				findPosition(pos, this.domInputor);
			}
			return this.domInputor;
		}

		getPosition() {
			const offset = this.getOffset();
			const inputorOffset = this.inputor.getBoundingClientRect();
			return {
				left: offset.left - inputorOffset.left,
				top: offset.top - inputorOffset.top
			};
		}

		getPos() {
			const range = this.range();
			if (range) {
				const clonedRange = range.cloneRange();
				clonedRange.selectNodeContents(this.domInputor);
				clonedRange.setEnd(range.endContainer, range.endOffset);
				return clonedRange.toString().length;
			}
		}

		getOffset() {
			const range = this.range();
			if (range) {
				let offset;
				if (range.endOffset - 1 > 0 && range.endContainer !== this.domInputor) {
					const clonedRange = range.cloneRange();
					clonedRange.setStart(range.endContainer, range.endOffset - 1);
					clonedRange.setEnd(range.endContainer, range.endOffset);
					const rect = clonedRange.getBoundingClientRect();
					offset = {
						height: rect.height,
						left: rect.left + rect.width,
						top: rect.top
					};
				}

				if (!offset || offset.height === 0) {
					const clonedRange = range.cloneRange();
					const shadowCaret = oDocument.createTextNode("|");
					clonedRange.insertNode(shadowCaret);
					const rect = clonedRange.getBoundingClientRect();
					offset = {
						height: rect.height,
						left: rect.left,
						top: rect.top
					};
					shadowCaret.remove();
				}
				return offset;
			}
		}

		range() {
			const sel = oWindow.getSelection();
			return sel && sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
		}
	}

	class InputCaret {
		constructor(inputor) {
			this.inputor = inputor;
			this.domInputor = inputor;
		}

		getPos() {
			return this.domInputor.selectionStart;
		}

		setPos(pos) {
			this.domInputor.setSelectionRange(pos, pos);
			return this.domInputor;
		}

		getOffset(pos) {
			const offset = this.inputor.getBoundingClientRect();
			const position = this.getPosition(pos);
			return {
				left: offset.left + position.left - this.inputor.scrollLeft,
				top: offset.top + position.top - this.inputor.scrollTop,
				height: position.height
			};
		}

		getPosition(pos = this.getPos()) {
			const format = value => value
				.replace(/<|>|`|"|&/g, '?')
				.replace(/\r\n|\r|\n/g, "<br/>")
				.replace(/\s/g, '&nbsp;');

			const html = `
				<span style="position: relative; display: inline;">${format(this.inputor.value.slice(0, pos))}</span>
				<span id="caret" style="position: relative; display: inline;">|</span>
				<span style="position: relative; display: inline;">${format(this.inputor.value.slice(pos))}</span>
			`;
			const mirror = new Mirror(this.inputor);
			return mirror.create(html).rect();
		}
	}

	class Mirror {
		constructor(inputor) {
			this.inputor = inputor;
		}

		mirrorCss() {
			return {
				position: 'absolute',
				left: -9999,
				top: 0,
				zIndex: -20000
			};
		}

		create(html) {
			const mirror = document.createElement('div');
			Object.assign(mirror.style, this.mirrorCss());
			mirror.innerHTML = html;
			this.inputor.after(mirror);
			return {
				rect: () => {
					const flag = mirror.querySelector("#caret");
					const pos = flag.getBoundingClientRect();
					mirror.remove();
					return {
						left: pos.left,
						top: pos.top,
						height: flag.offsetHeight
					};
				}
			};
		}
	}

	const Utils = {
		contentEditable: inputor => !!(inputor.contentEditable && inputor.contentEditable === 'true')
	};

	const methods = {
		pos(pos) {
			return pos !== undefined ? this.setPos(pos) : this.getPos();
		},
		position(pos) {
			return this.getPosition(pos);
		},
		offset(pos) {
			return this.getOffset(pos);
		}
	};

	return (inputor, method, value) => {
		const caret = Utils.contentEditable(inputor) ? new EditableCaret(inputor) : new InputCaret(inputor);
		if (methods[method]) {
			return methods[method].apply(caret, [value]);
		} else {
			throw new Error(`Method ${method} does not exist on caret`);
		}
	};
});
