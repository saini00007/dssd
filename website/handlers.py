from django.shortcuts import render, redirect
from website.models import HomepageSlider, HomepageTicker
from django.shortcuts import get_object_or_404


def home_renderer(request):
	cv = dict()
	cv['home'] = True

	# This should return 
	# Polls
	# Announcements {'type':'', title':'', 'link':''}
	# Top bar items {'title':'', 'link':''}

	homepage_sliders = HomepageSlider.objects.filter(is_active=True).order_by('sequence')
	cv['homepage_sliders'] = homepage_sliders

	homepage_tickers = HomepageTicker.objects.filter(is_active=True).order_by('-created_on')
	cv['homepage_tickers'] = homepage_tickers

	return render(request, "website/home.html", {'cv': cv})
	
