from django.shortcuts import render, redirect
from . import main_logic

def main_page(request):
    return render(request, 'main.html')


def get_info(request):
    token = request.session.get('github_token', '')
    github_user = request.session.get('github_user', None)
    username = request.GET.get('username')
    private = github_user == username
    data = main_logic.search_user(username, token, private)
    if data == "Not Found":
        return render(request, 'main.html',
                  {'error': "Not Found"})
    if data == "Forbidden":
        return render(request, 'main.html',
                  {'error': "Сорян, апишка ограничена"})

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