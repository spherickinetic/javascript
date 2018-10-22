(function(){
	window.addEventListener("load",init);

	function init(){
		var menuToggleButton = new ToggleButton({
												DOMElement:"menuToggleButton",
												elementToEffect:"menuWrap",
												classToAdd:"openMenu"
												});

		var colourFilterToggleButton = new ToggleButton({
												DOMElement:"colourFilterToggleButton",
												elementToEffect:"colourFilter",
												classToAdd:"openFilter"
												});

		var sizeFfilterToggleButton = new ToggleButton({
												DOMElement:"sizeFilterToggleButton",
												elementToEffect:"sizeFilter",
												classToAdd:"openFilter"
												});
	}

	function ToggleButton(setup){
		this.DOMElement = document.getElementsByClassName(setup.DOMElement);
		this.elementToEffect = document.getElementsByClassName(setup.elementToEffect)[0];
		this.classToAdd = setup.classToAdd;
		this.toggleState = false;

		for(var i = 0; i < this.DOMElement.length; i += 1){
			this.DOMElement[i].addEventListener("click",this);
		}
	}

	ToggleButton.prototype.handleEvent = function(event){
		switch(event.type){
			case "click":
				this.toggleButton();
			break;
		}
	};

	ToggleButton.prototype.toggleButton = function(){
		if(this.toggleState){
			this.elementToEffect.className = this.elementToEffect.className.replace(new RegExp(this.classToAdd,'g'),'');
		}else{
			this.elementToEffect.className += " "+this.classToAdd;
		}
		this.toggleState = !this.toggleState;
	};
}());