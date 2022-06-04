#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
# import os
# import sys


# def main():
#     """Run administrative tasks."""
#     os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cybervidyapeeth.settings')
#     try:
#         from django.core.management import execute_from_command_line
#     except ImportError as exc:
#         raise ImportError(
#             "Couldn't import Django. Are you sure it's installed and "
#             "available on your PYTHONPATH environment variable? Did you "
#             "forget to activate a virtual environment?"
#         ) from exc
#     execute_from_command_line(sys.argv)


# if __name__ == '__main__':
#     main()


# !/usr/bin/env python
import os
import sys
from cybervidyapeeth.production_setup import IS_PRODUCTION_SERVER

if __name__ == '__main__':
    if not IS_PRODUCTION_SERVER:
        os.environ.setdefault("DJANGO_SETTINGS_MODULE", "cybervidyapeeth.setting_files.local")
    else:
        os.environ.setdefault("DJANGO_SETTINGS_MODULE", "cybervidyapeeth.setting_files.production")

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)
