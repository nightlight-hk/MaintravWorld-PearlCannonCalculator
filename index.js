const resistance = 0.99;
const ticks = 82;
const tntMomentum = 0.5889496322464138;

// initial pos
const px0 = 0;
const pz0 = 1;

function coordinate2config(x, z) {
	const sumFactor = (1 - Math.pow(resistance, ticks)) / (1 - resistance);
	// required initial momentum
	const imx = (x - px0) / sumFactor;
	const imz = (z - pz0) / sumFactor;
	// TNT momentum vectors
	const tntVectors = {
		NW: [-tntMomentum, -tntMomentum],
		NE: [tntMomentum, -tntMomentum],
		SW: [-tntMomentum, tntMomentum],
		SE: [tntMomentum, tntMomentum]
	};
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

// Reverse function: config2coordinate(direction, n1, n2) => [x, z]
function config2coordinate(direction, n1, n2) {
	const sumFactor = (1 - Math.pow(resistance, ticks)) / (1 - resistance);
	const a = tntMomentum;
	let imx, imz;
	// Use TNT vectors based on direction
	switch (direction) {
		case '东': // East: +X
			// Use NE and SE: NE [a, -a], SE [a, a]
			// imx = a*n1 + a*n2, imz = -a*n1 + a*n2
			imx = a * n1 + a * n2;
			imz = -a * n1 + a * n2;
			break;
		case '南': // South: +Z
			// Use SE and SW: SE [a, a], SW [-a, a]
			// imx = a*n1 - a*n2, imz = a*n1 + a*n2
			imx = a * n1 - a * n2;
			imz = a * n1 + a * n2;
			break;
		case '西': // West: -X
			// Use NW and SW: NW [-a, -a], SW [-a, a]
			// imx = -a*n1 - a*n2, imz = -a*n1 + a*n2
			imx = -a * n1 - a * n2;
			imz = -a * n1 + a * n2;
			break;
		case '北': // North: -Z
			// Use NW and NE: NW [-a, -a], NE [a, -a]
			// imx = -a*n1 + a*n2, imz = -a*n1 - a*n2
			imx = -a * n1 + a * n2;
			imz = -a * n1 - a * n2;
			break;
		default:
			// fallback to North
			imx = -a * n1 + a * n2;
			imz = -a * n1 - a * n2;
	}
	// Convert back to coordinates
	const x = imx * sumFactor + px0;
	const z = imz * sumFactor + pz0;
	return [x, z];
}



document.addEventListener('DOMContentLoaded', function() {
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
