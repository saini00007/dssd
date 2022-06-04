from django.shortcuts import render
import website.handlers as website_handlers
from django.views.generic import View
from website.redirection_dict import redirection_dict, new_dict
from django.shortcuts import redirect
from django.urls import reverse
# Create your views here.
import os
from django.conf import settings
from django.http import HttpResponse

class HomeView(View):
    def get(self, request, *args, **kwargs):
        return website_handlers.home_renderer(request)
