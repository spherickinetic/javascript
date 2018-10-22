	window.onload = function() {
		
		const audioElement = document.getElementById('audio');
		
		const audioContext = new AudioContext();
	
		const track = audioContext.createMediaElementSource(audioElement);
		const gainNode = audioContext.createGain();
		const analyser = audioContext.createAnalyser();

		track.connect(gainNode).connect(analyser).connect(audioContext.destination);

		const volumeControl = document.querySelector('#volume');
		volumeControl.addEventListener('input', () => {gainNode.gain.value = this.value;});


	analyser.fftSize = 512;

	const bufferLength = analyser.frequencyBinCount;
	console.log(bufferLength);

	let dataArray = new Uint8Array(bufferLength);







	let canvas = document.getElementById("canvas");
	canvas.width = 400;
	canvas.height = 400;
	let ctx = canvas.getContext("2d");

	const WIDTH = canvas.width;
	const HEIGHT = canvas.height;

	let barWidth = (WIDTH / bufferLength) * 1;
	let barHeight;
	let x = 0;

	function renderFrame() {
	  requestAnimationFrame(renderFrame);

	  x = 0;

	  analyser.getByteFrequencyData(dataArray);

	  ctx.fillStyle = "rgba(0,0,0,0.01)";
	  ctx.fillRect(0, 0, WIDTH, HEIGHT);

	  for (let i = 0; i < bufferLength; i++) {
		barHeight = dataArray[i];
		
		let r = barHeight + (25 * (i/bufferLength));
		let g = 250 * (i/bufferLength);
		let b = 50;

		ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
		ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

		x += barWidth + 1;
	  }
	}
	renderFrame();
};