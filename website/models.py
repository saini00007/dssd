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



class Modal(models.Model):
	id = models.CharField(max_length=24, primary_key=True, default=core_lib.generate_unique_object_id)
	title = models.CharField(max_length=255, blank=True, null=True)
	image = models.FileField(upload_to=core_lib.upload_file_to)
	target_link = models.URLField(max_length=500)
	show_interval_in_seconds = models.FloatField(default=0.05)
	cookie_name = models.CharField(max_length=100)
	is_active = models.BooleanField(default=False)
	created_on = models.DateTimeField(auto_now_add=True)
	size = models.CharField(max_length=50, blank=True, null=True)
	url = models.CharField(max_length=255, blank=True, null=True)
	resize_image = models.BooleanField(default=False)

	def save(self, *args, **kwargs):

		if not self.size:
			image = self.image.file
			file_name = image.name
			self.filename = file_name.split('/')[-1]
			extension = file_name.split(".")[-1]
			# if image.content_type in ['image/jpeg', 'image/png']:
			if extension=="jpeg" or extension=="jpg" or extension=="png":
				img = Image.open(self.image.file)
				img = core_lib.resize_uploaded_image_to_width(img, width=980)
				img = core_lib.adjust_image_orientation(img)
				img.save(file_name, quality=90, optimize=True)
				self.image = File(open(file_name, 'rb'))
				os.remove(file_name)
			self.size="10"
		super(Modal, self).save(*args, **kwargs)

class UploadedFile(models.Model):
	id = models.CharField(default=core_lib.generate_unique_object_id, max_length=24, primary_key=True)
	filename = models.CharField(max_length=255, blank=True, null=True)
	uploaded_file = models.FileField(upload_to=core_lib.upload_file_to)
	upload_date = models.DateTimeField(default=timezone.now)
	size = models.CharField(max_length=50, blank=True, null=True)
	url = models.CharField(max_length=255, blank=True, null=True)
	resize_image = models.BooleanField(default=False)

	def __str__(self):
		return self.filename

	@staticmethod
	def get_uploaded_file_by_id(file_id):
		try:
			return UploadedFile.objects.get(id=file_id)
		except UploadedFile.DoesNotExist:
			return None

	class Meta:
		ordering = ['upload_date']

	def save(self, *args, **kwargs):

		if not self.size:
			uploaded_file = self.uploaded_file.file
			file_name = uploaded_file.name
			self.filename = file_name.split('/')[-1]
			extension = file_name.split(".")[-1]
			# if uploaded_file.content_type in ['image/jpeg', 'image/png']:
			if extension=="jpeg" or extension=="jpg" or extension=="png":
				img = Image.open(self.uploaded_file.file)
				if self.resize_image is True:
					img = core_lib.resize_uploaded_image_to_width(img, width=980)
				img = core_lib.adjust_image_orientation(img)
				img.save(file_name, quality=90, optimize=True)
				self.uploaded_file = File(open(file_name, 'rb'))
				os.remove(file_name)

		super(UploadedFile, self).save(*args, **kwargs)



class HomepageTicker(models.Model):
	id = models.CharField(default=core_lib.generate_unique_object_id, primary_key=True, max_length=24)
	title = models.CharField(max_length=200)
	link = models.CharField(max_length=400,blank=True, null=True)
	created_on = models.DateTimeField(auto_now_add=True)
	updated_on = models.DateTimeField(auto_now=True)
	is_active = models.BooleanField(default=True)

	def __str__(self):
		return self.title


class HomepageSlider(models.Model):
	id = models.CharField(default=core_lib.generate_unique_object_id, primary_key=True, max_length=24)
	sequence = models.IntegerField(unique=True)
	slide = models.FileField(upload_to=core_lib.upload_file_to)
	slide_square = models.FileField(upload_to=core_lib.upload_file_to,blank=True, null=True)
	title = models.CharField(max_length=200)
	
	link = models.CharField(max_length=400,blank=True, null=True)
	created_on = models.DateTimeField(auto_now_add=True)
	updated_on = models.DateTimeField(auto_now=True)
	is_active = models.BooleanField(default=True)
	def __str__(self):
		return self.title
