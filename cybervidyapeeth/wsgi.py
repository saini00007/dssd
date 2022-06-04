"""
WSGI config for cybervidyapeeth project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.0/howto/deployment/wsgi/
"""

# import os

# from django.core.wsgi import get_wsgi_application

# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cybervidyapeeth.settings')

# application = get_wsgi_application()



import os
from cybervidyapeeth.production_setup import IS_PRODUCTION_SERVER

from django.core.wsgi import get_wsgi_application

if not IS_PRODUCTION_SERVER:
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "cybervidyapeeth.setting_files.local")
else:
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "cybervidyapeeth.setting_files.production")

application = get_wsgi_application()
