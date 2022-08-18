from django.contrib import admin
from website.models import *
# Register your models here.


class AdminActiveScriptStyleVersion(admin.ModelAdmin):
    list_display = ['id', 'version_no']



class AdminUploadedFile(admin.ModelAdmin):
    list_display = ['id', 'filename', 'uploaded_file', 'upload_date', 'size', 'url', 'resize_image']
    readonly_fields = []
    list_filter = []
    search_fields = ('filename', 'id',)


class AdminHomepageSlider(admin.ModelAdmin):
    list_display = ['title','sequence', 'is_active']



class AdminHomepageTicker(admin.ModelAdmin):
    list_display = ['title','created_on','is_active']




admin.site.register( ActiveScriptStyleVersion, AdminActiveScriptStyleVersion)

admin.site.register(UploadedFile, AdminUploadedFile)
admin.site.register(HomepageSlider, AdminHomepageSlider)
admin.site.register(HomepageTicker, AdminHomepageTicker)