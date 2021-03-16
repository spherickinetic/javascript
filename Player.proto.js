let Player = (function() {
	function Player() {
		this.init();
	};
	
	Player.prototype = {
		init: function() {
			this.audioContext = this._createAudioContext();
			this.analyser = this._createAnalyser();
			this._build();
			this.playing = false;
		},
		_createAudioContext: function(){
			return new AudioContext();
		},
		_createAnalyser: function(){
			if(this.audioContext){
				return this.audioContext.createAnalyser();
			}
		},
		_build: function(){
			this._dom = {};

			this._dom.playButton = document.getElementById("playButton");
			this._dom.visButton = document.getElementById("visButton");
			this._dom.scrubberBox = document.getElementById("scrubberBox");
			this._dom.scrubber = document.getElementById("scrubber");
			this.scrubberContext = this._dom.scrubber.getContext("2d");
			this._dom.elapsed = document.getElementById("elapsed");
			this._dom.library = document.getElementById("library");
			this._dom.libraryInput = document.getElementById("libraryInput");
			this._dom.libraryResults = document.getElementById("libraryResults");
			this._dom.playlist = document.getElementById("playlist");

			this._dom.settings = document.getElementsByClassName("setting");
			this.settings = {};
			this.settings.randomColour = true;

			this.gainMaster = this.audioContext.createGain();
			this.gainMaster.gain.value = 0.5;


			this._dom.nowPlaying = document.createElement("h1");
			this._dom.nowPlaying.id = "nowPlaying";
			document.body.appendChild(this._dom.nowPlaying);

			this._dom.analyserCanvas = document.createElement("canvas");
			this._dom.analyserCanvas.width = 1200;
			this._dom.analyserCanvas.height = 400;
			this._dom.analyserCanvas.id = "analyserCanvas";
			this.analyserCanvasContext = this._dom.analyserCanvas.getContext("2d");
			this.analyserCanvasContext.strokeStyle = '#F00';
			this.analyserCanvasContext.fillStyle = "rgba(0,0,0,0.1)";
			document.body.appendChild(this._dom.analyserCanvas);

			this.colours = {'r':255,'g':255,'b':255,'a':1};


			this.visualisations = [
				this._coolCircles,
				this._invisibleBars,
				this._circleBars,
				this._nextVis,
			];


			this._buildEventListeners();
		},
		_buildEventListeners(){
			for(let i = 0; i < this._dom.settings.length; i++ ){
				this._dom.settings[i].addEventListener("input",()=>{
					this.colours[this._dom.settings[i].id] = this._dom.settings[i].value;
					this._setColour();
				},false);
			}
			
			this._dom.visButton.addEventListener("click",()=>{
				let f = this.visualisations[Math.floor(Math.random()*this.visualisations.length)];
				this._drawAnalyser = f.bind(this);
			},false);

			this._dom.playButton.addEventListener('click',()=>{
				if(!this.playing){
					this._playTrack();
					this._dom.playButton.textContent = 'Pause';
				}
				else{
					this._pauseTrack();
					this._dom.playButton.textContent = 'Play';
				}
			},false);

			this._dom.libraryInput.addEventListener("input",(evt)=>{
				this._searchLibrary(evt)
			},false);
		},
		_setColour: function(){
			if(this.settings.randomColour)
			{
				this.colours.r = Math.random()*255;
				this.colours.g = Math.random()*255;
				this.colours.b = Math.random()*255;
			}
			this.analyserCanvasContext.strokeStyle = 'rgb('+this.colours.r+','+this.colours.g+','+this.colours.b+')';
		},
		_searchLibrary(evt){
			if(this._dom.libraryInput.value.length >= 2){
				let url = 'http://localhost/jukebox/scripts/php/rpc.php';
				let formData = new FormData();

				formData.append('search_string', this._dom.libraryInput.value);
				formData.append('rpc_file','searchLibrary.php');

				fetch(url, {
					mode: 'no-cors',
					method: 'POST',
					body:formData
				})
				.then(response => { return(response.json()); })
				.then(results => { this._buildSearchResults(results['RESULTS']);})
				// .catch(response => { console.log(response.text()); })
			}
		},
		_buildSearchResults($results){
			while(this._dom.libraryResults.firstChild){
				this._dom.libraryResults.firstChild.remove();
			}
			for (let i = 0; i < $results.length; i++){
				let result = document.createElement("li");
				result.textContent = $results[i].title;
				result.classList.add("libraryResult");
				result.addEventListener("click",()=>{this._addToPlaylist("http://localhost/jukebox/res/"+$results[i].title+".mp3");},false);
				this._dom.libraryResults.appendChild(result);
			}
		},
		_addToPlaylist: function(trackname){
			let trackToAdd = document.createElement("li");
			trackToAdd.addEventListener("click",()=>{this._loadTrack(trackToAdd.dataset.url);},false);
			trackToAdd.textContent = trackname;
			trackToAdd.dataset.url = trackname;
			this._dom.playlist.appendChild(trackToAdd);
		},
		_loadTrack(url){
			this.elapsedTime = 0;
			this.scrubberContext.clearRect(0,0,this._dom.scrubber.width,this._dom.scrubber.height);
			this._dom.playButton.disabled = true;
			if(this.playing){
				this._stopTrack();
			}

			fetch(url).then((response) => {
				return response.arrayBuffer();
			  }).then((buffer) => {
				return this.audioContext.decodeAudioData(buffer);
			  }).then((trackBuffer) => {
				  this.currentTrack = trackBuffer;
				  this._dom.playButton.disabled = false;
			  }).then(()=>{
				  this.elapsedTimer = setInterval(()=>{
						this._dom.elapsed.textContent = this._convertToHMS(this._calculateElapsedTime());
					},100);
				  this._createScrubber(this.currentTrack);
			  });
		},
		_convertToHMS(timeInSeconds){
			return new Date(timeInSeconds * 1000).toISOString().substr(11, 10);
		},
		_createScrubber(buffer){
			let decibelArray = [],
				pcmData = buffer.getChannelData(0),
				total = 0,
				chunkSize = pcmData.length/100;

			for(let j = 0; j < 100; j++)
			{
				for (let i = 0; i < chunkSize; i++)
				{
					total += Math.abs(pcmData[parseInt(i+j*chunkSize)]);
				}
				decibelArray[j] = Math.sqrt(total / chunkSize);
				total = 0;
			}

			for (let x = 1; x < 100; x++) {
				this.scrubberContext.fillStyle = "#6EF0FF";
				this.scrubberContext.fillRect(x * (this._dom.scrubber.width / 100), 133, 2, decibelArray[x] * -150);
				this.scrubberContext.fillStyle = "#336A70";
				this.scrubberContext.fillRect(x * (this._dom.scrubber.width / 100), 140, 2, decibelArray[x] * 75);
			  }

			this._dom.scrubber.addEventListener("click",(evt) => {
				this._calculateSeek(evt);
			}, false);
			
			this.percentageTimer = setInterval(()=>{
				this._drawProgressBar();
			},100);
		},
		_drawProgressBar(){
			this.scrubberContext.fillStyle = "#F00";
			this.scrubberContext.fillRect(
				0,
				135,
				(this._calculateElapsedTime() / this.currentTrack.duration) * 1000,
				3
			);
			this.scrubberContext.fillStyle = "#000";
			this.scrubberContext.fillRect((this._calculateElapsedTime() / this.currentTrack.duration) * 1000,135,this._dom.scrubber.width,3);
		},
		_calculateSeek(evt){
			let scrubberRect = this._dom.scrubber.getBoundingClientRect();
			let seekPct = (evt.clientX - scrubberRect.x) / 10;
			let seekTime = seekPct / 100 * this.currentTrack.duration;
			this._stopTrack();
			this.elapsedTime = seekTime;
			this._playTrack();
		},
		_playTrack(){
			this.startedAt = this.audioContext.currentTime;
			this.source = this.audioContext.createBufferSource();
			this.source.addEventListener("ended",()=>{this._stopTrack();},false);
			this.source.buffer = this.currentTrack;
			this.source
				.connect(this.analyser)
				.connect(this.gainMaster)
				.connect(this.audioContext.destination);

			this.source.start(0, this.elapsedTime);
			this._setupAnalyser();
			this._drawAnalyser();
			this.playing = true;
		},


		_setupAnalyser: function(){
			this.analyser.fftSize = 1024;
			this.analyser.floatTimeDomainData = new Float32Array(this.analyser.frequencyBinCount);
			this.analyser.byteTimeDomainData = new Uint8Array(this.analyser.frequencyBinCount);
			this.analyser.floatFrequencyData = new Float32Array(this.analyser.frequencyBinCount);
			this.analyser.byteFrequencyData = new Uint8Array(this.analyser.frequencyBinCount);

			this._setColour();
		},

		_getAnalyserData: function(){
			this.analyser.getFloatTimeDomainData(this.analyser.floatTimeDomainData);
			this.analyser.getByteTimeDomainData(this.analyser.byteTimeDomainData);
			this.analyser.getFloatFrequencyData(this.analyser.floatFrequencyData);
			this.analyser.getByteFrequencyData(this.analyser.byteFrequencyData);
		},


        _invisibleBars: function(){
			this.clearCanvas();
			this._getAnalyserData();

                for (let x = 0; x < this.analyser.frequencyBinCount; x++) {
					
                    this.analyserCanvasContext.fillRect(
                        x * (this._dom.analyserCanvas.width / this.analyser.frequencyBinCount),
                        this._dom.analyserCanvas.height,
                        2,
                        this.analyser.byteFrequencyData[x]/-2);
                }
                let bassArray = this.analyser.byteFrequencyData.slice(0,4);
                let bassArraySum = bassArray.reduce((a,b)=>a+b);
                let bassArrayAvg = bassArraySum / 4;
                this.analyserCanvasContext.beginPath();
                this.analyserCanvasContext.moveTo(0,this._dom.analyserCanvas.height - bassArrayAvg);
                this.analyserCanvasContext.lineTo(this._dom.analyserCanvas.width,this._dom.analyserCanvas.height - bassArrayAvg);
				this.analyserCanvasContext.stroke();
				
				if(this.playing);
					requestAnimationFrame(()=>{this._drawAnalyser();});
        },

_circleBars: function(){
	this.clearCanvas();
	this._getAnalyserData();

    theta = (180 * (Math.PI/180))/this.analyser.frequencyBinCount;
    //radius = 100;
	let bassArraySum = this.analyser.byteFrequencyData.reduce((a,b)=>a+b);
	let radius = (bassArraySum / 255)+50;
	this.analyserCanvasContext.beginPath();

	for (let x = 0; x < this.analyser.frequencyBinCount; x++){
		coss = Math.cos(theta*x);
		sinn = Math.sin(theta*x);
		this.analyserCanvasContext.moveTo((radius*-coss)+500,(radius*-sinn)+200);
		this.analyserCanvasContext.lineTo(
			(radius + this.analyser.byteFrequencyData[x]/2)*-coss + 500,
            (radius + this.analyser.byteFrequencyData[x]/2)*-sinn + 200,
        )
        this.analyserCanvasContext.moveTo((radius*coss)+500,(radius*sinn)+200);
        this.analyserCanvasContext.lineTo(
            (radius + this.analyser.byteFrequencyData[x]/2)*coss + 500,
            (radius + this.analyser.byteFrequencyData[x]/2)*sinn + 200,
        )
    }
	this.analyserCanvasContext.stroke();
	this.analyserCanvasContext.drawImage(
		this._dom.analyserCanvas,
		0,
		0,
		this._dom.analyserCanvas.width,
		this._dom.analyserCanvas.height,
		-3,
		-3,
		this._dom.analyserCanvas.width+6,
		this._dom.analyserCanvas.height+6
	);
	if(this.playing);
		requestAnimationFrame(()=>{this._drawAnalyser();});
},


_nextVis: function(){
	this.clearCanvas();		
	this._getAnalyserData();
	this.analyserCanvasContext.beginPath();
	for (let i = 0; i < this.analyser.frequencyBinCount; i++){			
		const x = i*2.5;
		const y = (0.5 + this.analyser.floatTimeDomainData[i]) * this._dom.analyserCanvas.height;
		if (i == 0)
			this.analyserCanvasContext.moveTo(x, y)
		else
			this.analyserCanvasContext.lineTo(x, y)
	}
	this.analyserCanvasContext.stroke();
	this.analyserCanvasContext.drawImage(
		this._dom.analyserCanvas,
		0,
		0,
		this._dom.analyserCanvas.width,
		this._dom.analyserCanvas.height,
		-3,
		-3,
		this._dom.analyserCanvas.width+6,
		this._dom.analyserCanvas.height+6
	);
	if(this.playing);
		requestAnimationFrame(()=>{this._drawAnalyser();});
},


_drawAnalyser: function(){
	this._coolCircles();
},

	clearCanvas: function(){
		this._setColour();
		this.analyserCanvasContext.fillRect(0, 0, this._dom.analyserCanvas.width, this._dom.analyserCanvas.height);
        //this.analyserCanvasContext.clearRect(0, 0, this._dom.analyserCanvas.width, this._dom.analyserCanvas.height);
	},




		_calculateElapsedTime(){
			if(!this.playing){
				return this.elapsedTime.toFixed(1);
			}else{
				return (this.elapsedTime + this.audioContext.currentTime - this.startedAt).toFixed(1);
			}
		},
		_calculatePercentageCompletion(){
			return (this.elapsedTime / this.currentTrack.duration) * 100
		},
		_pauseTrack(){
			this._stopTrack();
			this.elapsedTime = this.elapsedTime + this.audioContext.currentTime - this.startedAt;
		},
		_stopTrack(){
			this.playing = false;
			this.source.stop(0);
		},
		_loopTrack(){

		},
		_randomTrack(){

		},
		_volumeMute(){

		},
		_volumeUp(){

		},
		_volumeDown(){

		},

		_coolCircles: function(){
			this.clearCanvas();
		    let theta = (360 * (Math.PI/180))/this.analyser.frequencyBinCount;
			let radius = 100;
			this._getAnalyserData();
			this.analyserCanvasContext.beginPath();

			for (let i = 0; i < this.analyser.frequencyBinCount; i++) {
				coss = Math.cos(theta*i);
				sinn = Math.sin(theta*i);
		
				this.analyserCanvasContext.lineTo(
									((radius + this.analyser.byteTimeDomainData[i])*coss)+500,
									((radius + this.analyser.byteTimeDomainData[i])*sinn)+200
				)
			}
			this.analyserCanvasContext.stroke();

			if(this.playing);
				requestAnimationFrame(()=>{this._drawAnalyser();});
		}
	};
 
	return Player;
}());


let player = new Player();