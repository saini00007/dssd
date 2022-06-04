from django.shortcuts import render, redirect


def home_renderer(request):
	cv = dict()
	cv['home'] = True

	return render(request, "website/home.html", {'cv': cv})
