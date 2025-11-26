const resistance = 0.99;
const ticks = 82;
const tntMomentum = 0.5889496322464138;

const tntVectors = {
	NW: [tntMomentum, tntMomentum],
	NE: [-tntMomentum, tntMomentum],
	SW: [tntMomentum, -tntMomentum],
	SE: [-tntMomentum, -tntMomentum]
};

// initial pos, now dynamic
let px0 = 0;
let pz0 = 0;

function coordinate2config(x, z) {
	const sumFactor = (1 - Math.pow(resistance, ticks)) / (1 - resistance);
	// required initial momentum
	const imx = (x - px0) / sumFactor;
	const imz = (z - pz0) / sumFactor;
	// TNT momentum vectors
	// East: +X, South: +Z, West: -X, North: -Z
	let direction = '';
	const angle = Math.atan2(imz, imx) * 180 / Math.PI;
	if (angle >= -45 && angle < 45) direction = '东';
	else if (angle >= 45 && angle < 135) direction = '南';
	else if (angle >= 135 || angle < -135) direction = '西';
	else direction = '北';
	// Choose two TNT directions to solve for n1, n2
	// imx = n1 * NW[0] + n2 * NE[0]
	// imz = n1 * NW[1] + n2 * NE[1]
	// NW: [-a, -a], NE: [a, -a]
	const a = tntMomentum;
	// imx = -a * n1 + a * n2, imz = -a * n1 - a * n2
	// n1 = -(imz + imx)  / 2a, n2 = -(imz - imx) / 2a
	let n1 = Math.abs((imz + imx) / (2 * a)); // NW
	let n2 = Math.abs((imz - imx) / (2 * a)); // NE
	return [direction, n1, n2];
}

function config2coordinate(direction, n1, n2) {
	const sumFactor = (1 - Math.pow(resistance, ticks)) / (1 - resistance);
	const a = tntMomentum;
	let imx, imz;
	// Use TNT vectors based on direction
	switch (direction) {
		case '东':
			// SW + NW
			imx = a * n1 + a * n2;
			imz = a * n1 + -a * n2;
			break;
		case '南':
			imx = a * n1 - a * n2;
			imz = a * n1 + a * n2;
			break;
		case '西':
			imx = -a * n1 - a * n2;
			imz = -a * n1 + a * n2;
			break;
		case '北':
			imx = -a * n1 + a * n2;
			imz = -a * n1 + -a * n2;
			break;
		default:
			// fallback to North
			imx = a * n1 - a * n2;
			imz = -a * n1 + -a * n2;
	}
	// Convert back to coordinates
	const x = imx * sumFactor + px0;
	const z = imz * sumFactor + pz0;
	return [x, z];
}



document.addEventListener('DOMContentLoaded', function() {
	// 珍珠投掷处 input fields
	const px0Input = document.getElementById('input-px0');
	const pz0Input = document.getElementById('input-pz0');

	// Update px0 and pz0 when input changes
	// Integer-only enforcement
	let lastPx0 = 0;
	let lastPz0 = 1;
	px0Input.addEventListener('input', function() {
		let val = px0Input.value;
		if (/^-?\d+$/.test(val)) {
			px0 = parseInt(val, 10);
			lastPx0 = px0;
		} else {
			px0Input.value = lastPx0;
		}
	});
	pz0Input.addEventListener('input', function() {
		let val = pz0Input.value;
		if (/^-?\d+$/.test(val)) {
			pz0 = parseInt(val, 10);
			lastPz0 = pz0;
		} else {
			pz0Input.value = lastPz0;
		}
	});

	const form = document.getElementById('calc-form');
	const resultsDiv = document.getElementById('results');

	form.addEventListener('submit', function(e) {
		e.preventDefault();
		const x = parseFloat(document.getElementById('input-x').value);
		const z = parseFloat(document.getElementById('input-z').value);
		if (isNaN(x) || isNaN(z)) {
			resultsDiv.style.display = 'none';
			return;
		}
		const results = coordinate2config(x, z);
		resultsDiv.innerHTML = `
			<div class="result-item">方向: ${results[0]}</div>
			<div class="result-item">TNT数量(西/北侧): ${results[1]}</div>
			<div class="result-item">TNT数量(东/南侧): ${results[2]}</div>
		`;
		resultsDiv.style.display = 'block';
	});

	// Reverse form event listener
	const reverseForm = document.getElementById('reverse-form');
	const reverseResultsDiv = document.getElementById('reverse-results');

	reverseForm.addEventListener('submit', function(e) {
		e.preventDefault();
		const direction = document.getElementById('input-direction').value;
		const n1 = parseFloat(document.getElementById('input-n1').value);
		const n2 = parseFloat(document.getElementById('input-n2').value);
		if (isNaN(n1) || isNaN(n2)) {
			reverseResultsDiv.style.display = 'none';
			return;
		}
		const coords = config2coordinate(direction, n1, n2);
		reverseResultsDiv.innerHTML = `
			<div class="result-item">X 坐标: ${coords[0]}</div>
			<div class="result-item">Z 坐标: ${coords[1]}</div>
		`;
		reverseResultsDiv.style.display = 'block';
	});
});
