$("#submit-email").click(function(e){
	if ($('#age-confirm').prop('checked') === false) {
		alert('Please verify you are over 21')
	} else {
		e.preventDefault();
		var form = {
			email : document.getElementById("email").value,
			source: 'untappd'
		}

		heap.identify({ email : email });

		$.post("/api/addToMailchimp",form,
			function(data){
				console.log(data);
				if (data === 'error'){
					alert('Please enter a valid email');
				} else if (data === 'success') {
					window.location= "/";
				} else {
					alert('Something went wrong - please try again')
				}
			}
		);
	}
});