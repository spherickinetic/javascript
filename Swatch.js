(function(){
	window.addEventListener("load",init);

	function init(){
		var swatches = document.getElementsByClassName("swatch");
		for (var i = 0; swatches[i]; i += 1){
			swatches[i] = new Swatch(swatches[i]);
		}
	}

	function Swatch(DOMelement){
		this.DOMelement = DOMelement;
		this.colour = DOMelement.classList[1];
		this.image = DOMelement.parentNode.parentNode.previousElementSibling.firstElementChild;
		this.styleID = DOMelement.parentNode.parentNode.lastElementChild.innerHTML;
		this.overlay = this.image.nextElementSibling;

		DOMelement.addEventListener("click",this);
		this.image.addEventListener("load",this.showImage.bind(this),false);
	}

	Swatch.prototype.handleEvent = function(event){
		switch(event.type){
			case "click":
				event.preventDefault();
				if(!/selected/g.test(this.DOMelement.className)){
					this.hideImage();
					this.setSession(this.styleID, this.colour);
					this.changeClass();
				}
			break;
		}
	};

	Swatch.prototype.hideImage = function(){
		this.overlay.style.opacity = 1;
		setTimeout(this.switchImage.bind(this),500);
	};

	Swatch.prototype.switchImage = function(){
		this.image.src = this.image.src.slice(0,this.image.src.lastIndexOf('/')) + '/' + this.colour + '.jpg';
	};

	Swatch.prototype.showImage = function(){
		this.overlay.style.opacity = 0;
	};

	Swatch.prototype.setSession = function(styleID, colour){
		xmlhttp = new XMLHttpRequest();
		xmlhttp.open("GET", "scripts/php/setSession.php?variable=styleIDColour" + styleID + "&value=" + colour, true);
		xmlhttp.send();
	};

	Swatch.prototype.changeClass = function(){
		var listOfSwatches = this.DOMelement.parentNode.children,
			numberOfTheseSwatches = listOfSwatches.length;

		for(var i = 0; i < numberOfTheseSwatches; i += 1){
			listOfSwatches[i].className = listOfSwatches[i].className.replace(/ selected/g,'');
		}
		this.DOMelement.className += " selected";
	};

}());