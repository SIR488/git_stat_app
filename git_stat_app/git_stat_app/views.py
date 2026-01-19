from django.shortcuts import render, redirect
from . import main_logic
from .models import *


def main_page(request):
    return render(request, 'main.html')


def get_info(request):
    token = request.session.get('github_token', '')
    github_user = request.session.get('github_user', None)
    username = request.GET.get('username')
    private = github_user == username and token != ''


    may_be_dev = Developer.objects.filter(name=username)
    if len(may_be_dev)!=0:
        for dev in may_be_dev:
            if dev.private == private:
                developer = dev
                repositories = Repository.objects.filter(developer_name=developer.name, private=private)
                repo_names = [x.name for x in repositories]
                return render(request, 'statistics.html', {'developer': developer, 'repositories': repo_names})


    data = main_logic.search_user(username, token, private)
    if data == "Not Found":
        return render(request, 'main.html',
                  {'error': "Not Found"})
    if data == "Forbidden":
        return render(request, 'main.html',
                  {'error': "API Githab ограничена количеством запросов, можете авторизироваться для увеличения лимита"})

    developer, repo_names = data    
    return render(request, 'statistics.html',
                  {'developer': developer, 'repositories': repo_names})


def update_stats(request):
    github_user = request.session.get('github_user', None)
    username = request.GET.get('username')
    if not username:      
        return redirect('/')
    private = github_user == username
    main_logic.delete_data(username, private)
    print(username, private)
    return redirect(f'/search_user/?username={username}')