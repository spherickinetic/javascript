let Modal = (function() {
    function Modal() {
        this._dom = {};
        this._buildDom();
        this.init();
    };
    
    Modal.prototype = {
        init: function() {
            this.closeModal();
            document.body.appendChild(this._dom.modalCover);
        },
        _buildDom: function(){
            this._dom.modalCover = document.createElement("div");
            this._dom.modalCover.classList.add("modalCover");
            this._dom.modalContent = document.createElement("div");
            this._dom.modalContent.classList.add("modalContent");
            this._dom.modalClose = document.createElement("div");
            this._dom.modalClose.classList.add("modalClose");
            this._dom.modalClose.textContent = "x";
            this._createModal();
        },
        _createModal: function(){
            this._dom.modalCover.appendChild(this._dom.modalContent);
            this._dom.modalCover.appendChild(this._dom.modalClose);
            this._addListeners();
        },
        _clearContent: function(){
            while(this._dom.modalContent.lastChild){
                this._dom.modalContent.removeChild(this._dom.modalContent.lastChild);
            }
        },
        openModal: function(){
            this._dom.modalCover.classList.remove("novis");
            this._dom.modalCover.classList.add("vis");
        },
        closeModal: function(){
            this._dom.modalCover.classList.remove("vis");
            this._dom.modalCover.classList.add("novis");
            this._clearContent();
        },
        _addListeners: function(){
            this._dom.modalClose.addEventListener("click",() => {this.closeModal();},false);
        }

    };
 
    return Modal;
}());