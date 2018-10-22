	(function(){

		let dropArea = document.getElementsByClassName('dropArea')[0];

		[
			'dragenter',
			'dragover',
			'dragleave',
			'drop'
		].forEach(eventName => {
			dropArea.addEventListener(eventName, event => {event.preventDefault();event.stopPropagation();}, false)
		});

		[
			'dragenter',
			'dragover'
		].forEach(eventName => {
			dropArea.addEventListener(eventName, event => {dropArea.classList.add('highlight');}, false)
		});

		[
			'dragleave',
			'drop'
		].forEach(eventName => {
			dropArea.addEventListener(eventName, event => {dropArea.classList.remove('highlight');}, false)
		});

		dropArea.addEventListener('drop', event => {handleFiles(event.dataTransfer.files);}, false);

		function handleFiles(files) {
			([...files]).forEach(uploadFile);
		}

		function uploadFile(file) {
			let url = 'upload.php';
			let formData = new FormData();

			formData.append('file', file);

			fetch(url, {
				method: 'POST',
				body: formData
			})
			.then(response => { console.log(response.text()); })
			.catch(response => { console.log(response.text()); })
		}

	})();