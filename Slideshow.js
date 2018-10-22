(function(){
	window.addEventListener("load",init);

	function init(){
		var sshow = new Slideshow("slideshow", 4000);
	}

	function Slideshow(slideshowID,timer){
		this.slideshow = document.getElementsByClassName(slideshowID)[0];
		this.slides = this.slideshow.getElementsByClassName("slides");
		for(var i=0; this.slides[i]; i+=1)
		{
			this.slides[i].addEventListener("webkitAnimationEnd",this.prependSlide.bind(this));
			this.slides[i].addEventListener("animationend",this.prependSlide.bind(this));
		}
		this.timer=setInterval(this.slide.bind(this),timer);
	};

	Slideshow.prototype.handleEvent = function(event){
		switch(event.type){
			case "click":
			console.log("slideshow Clicked!");
			break;
		}
	};

	Slideshow.prototype.slide = function(){
		this.slides[this.slides.length-1].classList.add("slide");
	};

	Slideshow.prototype.prependSlide = function(){
		this.slideshow.insertBefore(this.slides[this.slides.length-1],this.slides[0]);
		this.slides[0].classList.remove("slide");
	};

}());
