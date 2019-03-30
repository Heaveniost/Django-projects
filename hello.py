import sys 
from django.conf.urls import url 
from django.http import HttpResponse 
from django.conf import settings 


# 视图
def index(request):
    return HttpResponse('Hello World')


# 路由
urlpatterns = (
    url(r'^$', index),
    )


# 设置
settings.configure(
    DEBUG = True,
    SECRET_KEY = 'This is a secret key',
    ROOT_URLCONF = __name__,
    MIDDLEWARE_CLASSES = (
        'django.middleware.common.CommonMiddleware',
        'django.middleware.csrf.CsrfViewMiddleware',
        'django.middleware.clickjacking.XFrameOptionsMiddleware',
    ),

)

# 运行 manage.py
if __name__ == '__main__':
    from django.core.management import execute_from_command_line

    execute_from_command_line(sys.argv)


'''
Django 视图 路由 设置文件 启动
Flask  初始化 路由 启动 

from flask import Flask 
app = Flask(__name__)

@app.route('/')
def index():
    return '<h1>Hello World</h1>'

if __name__ == '__main__':
    app.run(debug=True)
'''
