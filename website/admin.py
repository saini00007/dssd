from django.contrib import admin
from website.models import *
# Register your models here.


class AdminActiveScriptStyleVersion(admin.ModelAdmin):
    list_display = ['id', 'version_no']





admin.site.register( ActiveScriptStyleVersion, AdminActiveScriptStyleVersion)

