from django.db import models
from django.utils import timezone
from cybervidyapeeth import core_lib
from PIL import Image
from django.core.files import File
import os



class ActiveScriptStyleVersion(models.Model):
	id = models.CharField(max_length=24, primary_key=True, default=core_lib.generate_unique_object_id)
	version_no = models.CharField(max_length=100)

	def __str__(self):
			return self.version_no
