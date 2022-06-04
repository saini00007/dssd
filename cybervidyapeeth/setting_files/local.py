from .base import *


# AMAZON S3 SETTINGS
AWS_ACCESS_KEY_ID = "AKIAJHX3UKHSPKKWXFAA"
AWS_SECRET_ACCESS_KEY = "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"
AWS_S3_SECURE_URLS = True       # use https instead of http
AWS_QUERYSTRING_AUTH = False     # don't add complex authentication-related query parameters for requests
REGION_NAME = "us-east-1"
AWS_S3_HOST = "s3.%s.amazonaws.com" % REGION_NAME
AWS_STORAGE_BUCKET_NAME = 'vajiramandravi-test'
AWS_S3_CUSTOM_DOMAIN = '%s.%s' % (AWS_STORAGE_BUCKET_NAME, AWS_S3_HOST)
MEDIA_URL = "https://%s/%s/" % (AWS_S3_CUSTOM_DOMAIN, MEDIAFILES_LOCATION)
DEFAULT_FILE_STORAGE = 'cybervidyapeeth.custom_storages.MediaStorage'
AWS_S3_REGION_NAME = REGION_NAME
AWS_S3_SIGNATURE_VERSION = 's3v4'
AWS_S3_OBJECT_PARAMETERS = {"ACL": "public-read"}


DEBUG = True
DJANGO_DEBUG_TOOLBAR = True

if DJANGO_DEBUG_TOOLBAR:
    INSTALLED_APPS += (
        'debug_toolbar',
        'template_timings_panel',
    )
    MIDDLEWARE += (
        'debug_toolbar.middleware.DebugToolbarMiddleware',
    )
    DEBUG_TOOLBAR_PANELS = [
        'debug_toolbar.panels.versions.VersionsPanel',
        'debug_toolbar.panels.timer.TimerPanel',
        'debug_toolbar.panels.settings.SettingsPanel',
        'debug_toolbar.panels.headers.HeadersPanel',
        'debug_toolbar.panels.request.RequestPanel',
        'debug_toolbar.panels.sql.SQLPanel',
        'debug_toolbar.panels.staticfiles.StaticFilesPanel',
        'debug_toolbar.panels.templates.TemplatesPanel',
        'debug_toolbar.panels.cache.CachePanel',
        'debug_toolbar.panels.signals.SignalsPanel',
        'debug_toolbar.panels.logging.LoggingPanel',
        'debug_toolbar.panels.redirects.RedirectsPanel',
        'template_timings_panel.panels.TemplateTimings.TemplateTimings',
        'debug_toolbar.panels.sql.SQLPanel',
    ]

    DEBUG_TOOLBAR_CONFIG = {
        'JQUERY_URL': '',
    }



DATABASES = {
    # 'default': {
    #     'ENGINE': 'django.db.backends.sqlite3',
    #     'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    # }

    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'cybervidyapeeth_db',
        'USER': 'cybervidyapeeth',
        'PASSWORD': 'cybervidyapeeth',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# create DATABASE cybervidyapeeth_db;
# CREATE USER cybervidyapeeth WITH PASSWORD 'cybervidyapeeth';
# GRANT ALL PRIVILEGES ON DATABASE cybervidyapeeth_db TO cybervidyapeeth;