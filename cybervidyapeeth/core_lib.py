from django.http import HttpResponse
import json
import logging
import traceback
import inspect
from bson import ObjectId
from PIL import Image
from PIL.ExifTags import TAGS
import boto3
import datetime
import os

def return_multi_key_json_response(keys, values, http_response=True):
    data = dict(zip(keys, values))
    if http_response is True:
        return HttpResponse(json.dumps(data))
    else:
        return data

def generate_unique_object_id():
    return str(ObjectId())

def get_current_date_time_str_for_filename():
    current_time = datetime.datetime.now()
    current_year = str(current_time.year)
    current_month = str(current_time.month)
    current_day = str(current_time.day)
    current_hour = str(current_time.hour)
    current_minute = str(current_time.minute)
    current_second = str(current_time.second)
    return current_year + '/' + current_month + '/' + current_day + '/' + current_hour + '/' + \
           current_minute + '/' + current_second


def upload_file_to(instance, filename):
    filename = filename.replace('+', 'plus').replace(' ', '_')
    return get_current_date_time_str_for_filename() + '/' + filename


def resize_uploaded_image_to_width(image, width):
    image_width = image.size[0]
    image_height = image.size[1]
    height = int(width * image_height / image_width)
    image = image.resize((width, height), Image.ANTIALIAS)
    return image


def create_thumbnail_from_image_url(image_url, size):
    try:
        image_dir_name = 'media/editor_images/'
        if not os.path.exists(image_dir_name):
            os.makedirs(image_dir_name)
        parsed_url = urlparse(image_url)
        image_type = parsed_url.path.split('/')[-1].split('.')[-1]
        thumbnail_name = image_dir_name + generate_unique_object_id() + '.' + image_type

        download_image_command = 'wget --user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; ' \
                                 'rv:21.0) Gecko/20100101 Firefox/21.0" -O "' + thumbnail_name + \
                                 '" "' + image_url + '"'

        os.system(download_image_command)
        img = Image.open(thumbnail_name)

        # img = create_thumbnail_from_uploaded_image(img, size)
        # img.save(thumbnail_name)

        thumbnail_width = size[0]
        thumbnail_height = size[1]

        new_height = int(thumbnail_width / img.size[0] * img.size[1])

        if new_height < thumbnail_height:
            new_height = thumbnail_height
            new_width = int(new_height / img.size[1] * img.size[0])
            img = img.resize((new_width, new_height), Image.ANTIALIAS)

            image_width = img.size[0]
            image_height = img.size[1]
            box = (int(image_width / 2 - thumbnail_width / 2), 0,
                   int(image_width / 2 + thumbnail_width / 2), image_height)
            img = img.crop(box)
        else:
            # Here image height is enough for resize according to aspect ratio
            img = img.resize((thumbnail_width, new_height), Image.ANTIALIAS)
            image_width = img.size[0]
            image_height = img.size[1]

            box = (0, int(image_height / 2 - thumbnail_height / 2),
                   image_width, int(image_height / 2 + thumbnail_height / 2))
            img = img.crop(box)

        img.save(thumbnail_name)

        upload_file_to_s3(thumbnail_name)
        thumbnail_full_url = settings.MEDIA_URL.partition('/media')[0] + '/' + thumbnail_name
        os.remove(thumbnail_name)

        thumbnail_path = thumbnail_name.replace("media/", "")

        return thumbnail_path, thumbnail_full_url

    except Exception as ex:
        handle_exception(exception_object=ex, raise_exception=True, print_exception=True)



def float_to_integer(float_no):
    try:

        if float_no is None or str(float_no).strip() == "":
            return 0

        if float_no == 0:
            return 0
        if float_no/int(float_no) == 1:
            return int(float_no)
        else:
            return round(float_no, 2)
    except ZeroDivisionError:
        return float_no


def get_exif(image):
    ret = dict()
    try:
        info = image._getexif()
    except:
        info = None
    if info:
        for tag, value in info.items():
            decoded = TAGS.get(tag, tag)
            ret[decoded] = value
    return ret


def adjust_image_orientation(image):
    image_format = image.format
    try:
        info = get_exif(image)
    except:
        info = None
    if info:
        try:
            orientation = info['Orientation']
            image_width = image.size[0]
            image_height = image.size[1]
            # http://stackoverflow.com/questions/17821945/how-to-preserve-image-quality-when-rotating-with-pil
            if orientation == vajiramandravi_config.RIGHT_SIDE_TOP and image_width > image_height:
                image = image.rotate(-90, resample=Image.BICUBIC, expand=True)
            elif orientation == vajiramandravi_config.LEFT_SIDE_BOTTOM and image_width > image_height:
                image = image.rotate(90, resample=Image.BICUBIC, expand=True)
            elif orientation == vajiramandravi_config.BOTTOM_RIGHT_SIDE:
                image = image.rotate(180, resample=Image.BICUBIC, expand=True)
            image.format = image_format
        except:
            pass
    return image



# def handle_exception(exception_object=None, raise_exception=False, print_exception=False, http_response=True,
#                      rest_response=False):
#     errors = dict()
#     errors['__all__'] = list()

#     logger = logging.getLogger(__name__)
#     logger.error(traceback.format_exc())

#     if print_exception is True and IS_PRODUCTION_SERVER is False:
#         print(traceback.format_exc())
#         errors['__all__'].append(str(exception_object))
#     else:
#         errors['__all__'].append("Something Went Wrong")

#     try:
#         # Print last function argument
#         frames = inspect.trace()
#         argvalues = inspect.getargvalues(frames[-1][0])
#         if 'request' in argvalues.locals:
#             _request = argvalues.locals['request']
#             logger.info("Request USER:{}, POST:{}, GET:{}, Function Args:{}".format(
#                 _request.user, _request.POST, _request.GET, inspect.formatargvalues(*argvalues)))
#         else:
#             logger.error('Function Args: %s', inspect.formatargvalues(*argvalues))
#     except Exception as ex:
#         logger.exception(ex)

#     if raise_exception is True and exception_object is not None:
#         raise exception_object

#     if rest_response is True:
#         return return_multi_key_json_rest_response(['errors'], [errors], rest_response,
#                                                    response_status=status.HTTP_500_INTERNAL_SERVER_ERROR)
#     elif http_response is True:
#         return return_multi_key_json_response(['errors'], [errors], http_response)
#     else:
#         return return_multi_key_json_response(['errors'], [errors], http_response=False)

