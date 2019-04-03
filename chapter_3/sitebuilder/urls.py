from django.conf.urls import url 
from .views import page


urlpatterns = (
	url(r'^$', page, name='homepage'),
	url(r'^(?P<slug>[\w./-]+)/$', page, name='page'),
)