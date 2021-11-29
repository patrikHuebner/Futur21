let uid = 0;


const dragDropEvent = (event_normal, event_alpha) => {
	document.addEventListener("dragover", function (event) {
		event.preventDefault();
	});

	// Main drop area
	document.addEventListener('drop', ignoreDrop, false);
	addDragBehavior(document.body, 'dropTarget', 'dropTarget_visible')

	// Normal area
	addDragBehavior(document.getElementById('dropTarget_normal'), 'dropTarget_normal', 'dropTarget_active')
	document.getElementById('dropTarget_normal').addEventListener('drop', (e) => { event_normal(e) }, false);

	// Alpha area
	addDragBehavior(document.getElementById('dropTarget_alpha'), 'dropTarget_alpha', 'dropTarget_active')
	document.getElementById('dropTarget_alpha').addEventListener('drop', (e) => { event_alpha(e) }, false);
}

function ignoreDrop(e) {
	e.stopPropagation();
	e.preventDefault();
	return false;
}

function addDragBehavior(container, target, className) {
	let dragTimer = null;

	container.addEventListener('dragover', dragBehavior, false);

	function dragBehavior() {
		clearTimeout(dragTimer);
		dragTimer = setTimeout(() => {
			document.getElementById(target).classList.remove(className);
		}, 50);

		document.getElementById(target).classList.add(className);
	}
}


const simulateClick = (elem) => {
	// Create our event (with options)
	var evt = new MouseEvent("click", {
		bubbles: true,
		cancelable: true,
		view: window,
	});
	// If cancelled, don't dispatch our event
	var canceled = !elem.dispatchEvent(evt);
};


const getUID = () => {
	uid++;
	return uid;
}

const radians = (angle) => {
	return angle * (Math.PI / 180);
};

const lerp = (min, max, amount) => {
	return min + amount * (max - min);
};

const map = (value, start1, stop1, start2, stop2) => {
	return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

const random = (min, max) => {
	if (Object.prototype.toString.call(min) === '[object Array]') return min[~~(Math.random() * min.length)];

	if (typeof max !== 'number') {
		max = min || 1;
		min = 0;
	}

	return min + Math.random() * (max - min);
};

const hexToRgbA = (hex, opacity) => {
	var c;
	if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
		c = hex.substring(1).split('');
		if (c.length == 3) {
			c = [c[0], c[0], c[1], c[1], c[2], c[2]];
		}
		c = '0x' + c.join('');
		return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + opacity + ')';
	}
	throw new Error('Bad Hex');
}

const rgbaChangeOpacity = (hex, opacity) => {
	return hex.replace(/rgba?(\(\s*\d+\s*,\s*\d+\s*,\s*\d+)(?:\s*,.+?)?\)/, 'rgba$1,' + opacity + ')');
}


/**
 * By Ken Fyrstenberg Nilsen
 *
 * drawImageProp(context, image [, x, y, width, height [,offsetX, offsetY]])
 *
 * If image and context are only arguments rectangle will equal canvas
*/
const drawImageProp = (ctx, img, x, y, w, h, offsetX, offsetY) => {
	if (arguments.length === 2) {
		x = y = 0;
		w = ctx.canvas.width;
		h = ctx.canvas.height;
	}

	// default offset is center
	offsetX = typeof offsetX === "number" ? offsetX : 0.5;
	offsetY = typeof offsetY === "number" ? offsetY : 0.5;

	// keep bounds [0.0, 1.0]
	if (offsetX < 0) offsetX = 0;
	if (offsetY < 0) offsetY = 0;
	if (offsetX > 1) offsetX = 1;
	if (offsetY > 1) offsetY = 1;

	var iw = img.width,
		ih = img.height,
		r = Math.min(w / iw, h / ih),
		nw = iw * r,   // new prop. width
		nh = ih * r,   // new prop. height
		cx, cy, cw, ch, ar = 1;

	// decide which gap to fill    
	if (nw < w) ar = w / nw;
	if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;  // updated
	nw *= ar;
	nh *= ar;

	// calc source rectangle
	cw = iw / (nw / w);
	ch = ih / (nh / h);

	cx = (iw - cw) * offsetX;
	cy = (ih - ch) * offsetY;

	// make sure source rectangle is valid
	if (cx < 0) cx = 0;
	if (cy < 0) cy = 0;
	if (cw > iw) cw = iw;
	if (ch > ih) ch = ih;

	// fill image in dest. rectangle
	ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
}

export { getUID, radians, lerp, map, random, hexToRgbA, rgbaChangeOpacity, dragDropEvent, simulateClick, drawImageProp }