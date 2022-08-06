from django.urls import path,re_path
from . import views
from django.views.generic import TemplateView
#####  import statements above

app_name = 'website'

urlpatterns=[
	path(r'', views.HomeView.as_view(), name='home'),
	path(r'about-cyberversity/', \
		TemplateView.as_view(template_name='website/about_cyberversity.html'), name='about_cyberversity'),
	path(r'advisory-board/', \
		TemplateView.as_view(template_name='website/advisory_board.html'), name='advisory_board'),

	path(r'leadership/', \
		TemplateView.as_view(template_name='website/leadership.html'), name='leadership'),

	path(r'contactus/', \
		TemplateView.as_view(template_name='website/contactus.html'), name='contactus'),
 
	path(r'courses/', \
		TemplateView.as_view(template_name='website/courses.html'), name='courses'),
  
	path(r'corporate-trainings/', \
		TemplateView.as_view(template_name='website/corporate_trainings.html'), name='corporate_trainings'),
 
	path(r'internships/', \
		TemplateView.as_view(template_name='website/internships.html'), name='internships'),
 
	path(r'research/', \
		TemplateView.as_view(template_name='website/inner_page_template.html'), name='research'),
 
	path(r'education/', \
		TemplateView.as_view(template_name='website/inner_page_template.html'), name='education'),
 
	path(r'event/', \
		TemplateView.as_view(template_name='website/inner_page_template.html'), name='event'),
 
	path(r'courses/course-name/', \
		TemplateView.as_view(template_name='website/course_detail.html'), name='course_detail'),



	path(r'courses/advance-diploma-in-cyber-defense/', \
		TemplateView.as_view(template_name='website/advance_diploma_in_cyber_defense.html'), name='advance_diploma_in_cyber_defense'),


	path(r'courses/pg-diploma-in-cyber-defense/', \
		TemplateView.as_view(template_name='website/pg_diploma_in_cyber_defense.html'), name='pg_diploma_in_cyber_defense'),




	path(r'training/cyber-rakshak-beginner/', \
		TemplateView.as_view(template_name='website/cyber_rakshak_beginner.html'), name='cyber_rakshak_beginner'),



	path(r'partners/', \
		TemplateView.as_view(template_name='website/inner_page_template.html'), name='partners'),

    
	path(r'placements/', \
		TemplateView.as_view(template_name='website/inner_page_template.html'), name='placements'),

    
 
    

]

