"""
URL configuration for git_stat_app project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from . import main_logic, oauth

urlpatterns = [
    path('admin/', admin.site.urls),
    path('',main_logic.main_page),
    path('search_user/',main_logic.func),
    path('update_user/',main_logic.update_stats),

    path('repos/<str:repo_name>/', main_logic.get_repo_stats),
    path('conts/<str:repo_name>/<str:cont_name>/', main_logic.get_cont_stats),

    path('login/', oauth.github_login, name='github_login'),
    path('auth/github/callback/', oauth.github_callback, name='github_callback'),
    path('logout/', oauth.logout_view, name='logout'),
]
