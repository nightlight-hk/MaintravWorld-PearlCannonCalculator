
function calculate(x, z) {

	const resistance = 0.99;
	const ticks = 82;
	// initial pos
	const px0 = 0;
	const pz0 = 1;
	const sumFactor = (1 - Math.pow(resistance, ticks)) / (1 - resistance);
	// required initial momentum
	const imx = (x - px0) / sumFactor;
	const imz = (z - pz0) / sumFactor;

	// TNT momentum vectors
	const tntVectors = {
		NW: [-0.5889496322464138, -0.5889496322464138],
		NE: [0.5889496322464138, -0.5889496322464138],
		SW: [-0.5889496322464138, 0.5889496322464138],
		SE: [0.5889496322464138, 0.5889496322464138]
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
	const a = 0.5889496322464138;

	// imx = -a * n1 + a * n2, imz = -a * n1 - a * n2
	// n1 = -(imz + imx)  / 2a, n2 = -(imz - imx) / 2a

	let n1 = Math.abs((imz + imx) / (2 * a)); // NW
	let n2 = Math.abs((imz - imx) / (2 * a)); // NE

	return [direction, n1, n2];
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
		const results = calculate(x, z);
		resultsDiv.innerHTML = `
			<div class="result-item">方向: ${results[0]}</div>
			<div class="result-item">TNT数量(西/北侧): ${results[1]}</div>
			<div class="result-item">TNT数量(东/南侧): ${results[2]}</div>
		`;
		resultsDiv.style.display = 'block';
	});
});
