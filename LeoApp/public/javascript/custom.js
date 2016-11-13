(function(){
	$(document).ready(function(){

		$(".paginations").customPaginate({

			 itemsToPaginate:".post",
			 activeClass:"active"

		});
	});
}())


jQuery.validator.setDefaults({
    debug: false,
  success: "valid"
});
$( "#headerUpload" ).validate({
  rules: {
    articleHeader: {
      required: true,
      extension: "png|jpe?g|gif"
    }
  }
});

$("#signup").validate({
  rules:{
    password:{
      minLength: 7
    }
  }
});