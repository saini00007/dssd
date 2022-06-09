from .base import *



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