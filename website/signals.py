import website.models as website_models
from django.dispatch import receiver
from django.db.models.signals import m2m_changed, post_save, pre_delete, pre_save
import unicodedata
from django.template.defaultfilters import filesizeformat



@receiver(post_save, sender=website_models.UploadedFile)
def file_uploaded(sender, **kwargs):
    is_created = kwargs['created']
    if is_created:
        uploaded_file = kwargs['instance']
        file = uploaded_file.uploaded_file
        uploaded_file.size = unicodedata.normalize('NFKD', filesizeformat(
            file.size)).encode('ascii', 'ignore')
        uploaded_file.url = file.url
        uploaded_file.size = uploaded_file.size.decode("utf-8")
        uploaded_file.save()