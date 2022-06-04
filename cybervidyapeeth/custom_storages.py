from .setting_files.base import STATICFILES_LOCATION, MEDIAFILES_LOCATION
from storages.backends.s3boto3 import S3Boto3Storage


class StaticStorage(S3Boto3Storage):
    location = STATICFILES_LOCATION


class MediaStorage(S3Boto3Storage):
    location = MEDIAFILES_LOCATION