(function(){
	window.addEventListener("load",init);

	function init(){
		var slider = new Slider({DOMElement:"sidebar"});
	}

	function Slider(setup){
		this.DOMElement = document.getElementsByClassName(setup.DOMElement)[0];
		this.topLimit = document.getElementsByClassName("content")[0].offsetTop;
		window.addEventListener("scroll",this);
		window.addEventListener("resize",this);
	}

	Slider.prototype.handleEvent = function(event){
	    switch(event.type){
	    	case "scroll":
	    		this.scrollEvent();
	    	break;
	    	case "resize":
	    		this.resizeEvent();
	    	break;
	    }
	};

	Slider.prototype.scrollEvent = function(){
		if(window.scrollY > this.topLimit){
			this.DOMElement.style.top = window.scrollY - this.topLimit + "px";
		}else{
			this.DOMElement.style.top = 0;
		}
	};

	Slider.prototype.resizeEvent = function(){
		if(window.innerWidth < 600){
			window.removeEventListener("scroll",this);
		}else{
			window.addEventListener("scroll",this);
		}
	};
}());