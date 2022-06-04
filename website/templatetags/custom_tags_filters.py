from django import template
from django.template.defaultfilters import stringfilter
import json
import math
register = template.Library()


@register.filter
@stringfilter
def upto(value, delimiter=None):
    return value.split(delimiter)[0]


upto.is_safe = True


@register.filter(name='get_char_from_num')
def get_char_from_num(value):
    if value > 10:
        return value
    else:
        char_list = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
    return char_list[value - 1]


@register.filter(name='multiply')
def multiply(value, arg):
    return math.floor(value * arg)



@register.filter(name='percentage')
def percentage(value, arg):
    return math.floor((value/arg)*100)


@register.filter
def subtract(value, arg):
    return value - arg


@register.filter(name='times')
def times(number):
    return range(number)
