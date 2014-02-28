var defaultURL = false;

//show loading graphic

function showLoader(id) {
	$('#' + id + ' img').fadeIn('slow');
}

//hdie loading graphic

function hideLoader(id) {
	$('#' + id + ' img').fadeOut('slow');
}

//function to check load state of each frame

function allLoaded() {
	var results = [];
	$('iframe').each(function () {
		if (!$(this).data('loaded')) {
			results.push(false)
		}
	});
	var result = (results.length > 0) ? false : true;
	return result;
};

function loadPage($frame, url) {
	if (url.substr(0, 7) !== 'http://' && url.substr(0, 8) !== 'https://' && url.substr(0, 7) !== 'file://') {
		url = 'http://' + window.location.hostname + '/' +url;
	}
	$('iframe').not($frame).each(function () {
		showLoader($(this).parent().attr('id'));
	})
	$('iframe').not($frame).data('loaded', false);
	$('iframe').not($frame).attr('src', url);
	window.history.pushState(null, null, '?' + url);
}

$('.frame').each(function () {
	showLoader($(this).attr('id'))
});

function getlastmod(URL) {
	var http=new XMLHttpRequest();
	http.open('HEAD',URL,false);
	http.send(null);
	if (http.status!=200) {return undefined}
	var str = http.getResponseHeader('Last-modified');

	// str = str.replace(/^[^0-9]+/gi,"");  // delete characters until first digit encountered
	// var len = str.length;
	// str = str.substring(0, len - 13);  // delete the final 13 characters
	// var strsplit = str.split(" ");
	var reformatted =  str;
	return reformatted;
}

//when document loads
$(document).ready(function () {

	if (defaultURL) loadPage('', defaultURL);

	//query string
	var qsArray = window.location.href.split('?');
	var qs = qsArray[qsArray.length - 1];

	if (qs != '' && qsArray.length > 1) {
		$('#url input[type=text]').val(qs);
		loadPage('', qs);
	}

	//set slidable div width
	$('#frames #inner').css('width', function () {
		var width = 0;
		$('.frame').each(function () {
			width += $(this).outerWidth() + 20
		});
		return width;
	});

	//add event handlers for options radio buttons
	$('input[type=radio]').change(function () {
		$frames = $('#frames');
		$inputs = $('input[type=radio]:checked').val();

		if ($inputs == '1') {
			$frames.addClass('widthOnly');
		} else {
			$frames.removeClass('widthOnly');
		}
	});

	//when the url textbox is used
	$('form').submit(function () {
		loadPage('', $('#url input[type=text]').val());
		return false;
	});

	$('#files').change(function (e) {
		var $select = $(this);
		//$select.find('option').removeAttr('selected');
		var selectedVal = $select.find('option:selected').val();
		if (selectedVal != '') {
			//$select.find('option:selected').attr('selected','selected');
			loadPage('', selectedVal);
		}
	});

	//when frame loads
	$('iframe').load(function () {

		var $this = $(this);
		var url = '';
		var error = false;

		try {
			url = $this.contents().get(0).location.href;
		} catch (e) {
			error = true;
			if ($('#url input[type=text]').val() != '') {
				url = $('#url input[type=text]').val();
			} else {
				url = defaultURL;
			}
		}

		//load other pages with the same URL
		if (allLoaded()) {
			if (error) {
				alert('Browsers prevent navigation from inside iframes across domains.\nPlease use the textbox at the top for external sites.');
				loadPage('', defaultURL);
			} else {
				loadPage($this, url);
			}
		}

		//when frame loads, hide loader graphic
		else {
			error = false;
			hideLoader($(this).parent().attr('id'));
			$(this).data('loaded', true);
		}
	});

	var supportsSvg = function() {
	  return !! document.createElementNS &&
	         !! document.createElementNS(SVG.ns,'svg').createSVGRect
	};
	if ( !supportsSvg ) {
		$('img[src*="svg"]').attr('src', function() {
			return $(this).attr('src').replace('.svg', '.png');
		});
	}

	//$('.project-title .last-modified').html(document.lastModified);

});
