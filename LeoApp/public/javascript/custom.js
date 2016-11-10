(function(){
	$(document).ready(function(){

		$(".paginations").customPaginate({

			 itemsToPaginate:".post",
			 activeClass:"active"

		});
	});
}())

function getExtension(filename) {
    var parts = filename.split('.');
    return parts[parts.length - 1];
}

function isImage(filename) {
    var ext = getExtension(filename);
    switch (ext.toLowerCase()) {
    case 'jpg':
    case 'gif':
    case 'bmp':
    case 'png':
        //etc
        return true;
    }
    return false;
}

$(function() {
    $('headerUpload').submit(function() {
        function failValidation(msg) {
            alert(msg); // just an alert for now but you can spice this up later
            return false;
        }

        var file = $('#file');
        var imageChosen = $('#type-1').is(':checked');
        if (imageChosen && !isImage(file.val())) {
            return failValidation('Please select a valid image');
        }

        alert('Valid file!');
        return false; // prevent form submitting anyway - remove this in your environment
    });

});