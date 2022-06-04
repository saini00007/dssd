# from cybervidyapeeth.core_lib import handle_exception

from website.models import ActiveScriptStyleVersion

# def website_common_data(request):
# 	try:
# 		cv['top_bar_announcements'] = TopBarAnnouncement.objects.filter(is_active=True)
# 		request.top_bar_announcements = top_bar_announcements

# 		context_variable = dict()
# 		context_variable['context_variable'] = cv
# 		return context_variable

# 	except Exception as e:
# 		print("Error")

def website_common_data(request):
		context_variable = dict()
		context_variable['context_variable'] = dict()
		# context_variable['context_variable']['top_bar_announcements'] = TopBarAnnouncement.objects.filter(is_active=True)
		active_version = ActiveScriptStyleVersion.objects.all()
		try:
			modal = Modal.objects.filter(is_active=True).order_by('-created_on')[0]
			context_variable['context_variable']['modal'] = modal
		except Exception as e:
			pass
		if active_version:
			context_variable['context_variable']['activescriptstyleversion'] = active_version[0].version_no
		return context_variable