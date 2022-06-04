var debug=false;


function createCookie(name, value, days) {
    var expires;

    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    } else {
        expires = "";
    }
    document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + expires + "; path=/";
}

function readCookie(name) {
    var nameEQ = encodeURIComponent(name) + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name, "", -1);
}



$(window).scroll(function(){
	if($('.main_navbar').hasClass('homepage')){
	  if ($(this).scrollTop() > 50) {
	    $('.main_navbar').removeClass("ontop");
	  } else {
	    $('.main_navbar').addClass("ontop");
	  }
	}



});

$(document).ready(function(){
	$('.main_navbar a[href="'+window.location.pathname+'"]').addClass('active');
});


$(document).ready(function(){
	var max_height=0;
	var height_group={};
	$('.match_height.source_height').each(function(){
		// if ($(this).height() > max_height){
		// 	max_height = $(this).height();
		// }
		height_group[$(this).attr('data-height-group')]=$(this).height();
	});
	$('.match_height.destination_height').each(function(){
		var matched_height = height_group[$(this).attr('data-height-group')];
		if($(this).attr('data-subtract-height-of-element-id')){
			var to_be_subtracted_height = $('#'+$(this).attr('data-subtract-height-of-element-id')).height();
			console.log(to_be_subtracted_height);
			console.log($('#announcement_header'));
			console.log($('#announcement_header').height());
			console.log($('#announcement_header').offsetHeight);
			calculated_height = matched_height-to_be_subtracted_height;
		} else{
			calculated_height=matched_height;
		}
		$(this).height(calculated_height);
	});
});


function getUrlParameter(sParam){
	var sPageURL = window.location.search.substring(1);
		var sURLVariables = sPageURL.split('&');
		for (var i = 0; i < sURLVariables.length; i++) 
		{
		    var sParameterName = sURLVariables[i].split('=');
		    if (sParameterName[0] == sParam) 
		    {
		        return sParameterName[1];
		    }
		}
}    


