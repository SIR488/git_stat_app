import requests
from django.shortcuts import redirect
from django.conf import settings


def github_login(request):
    """Перенаправление на GitHub"""
    github_auth_url = 'https://github.com/login/oauth/authorize'
    
    # Базовый scope - repo (для приватных репозиториев) и user (для инфо)
    scope = 'repo'# user
    
    auth_url = f"{github_auth_url}?client_id={settings.GITHUB_CLIENT_ID}&redirect_uri={settings.GITHUB_REDIRECT_URI}&scope={scope}"
    return redirect(auth_url)

def github_callback(request):
    """Обработка callback - получаем токен и возвращаем на главную"""
    code = request.GET.get('code')
    
    if not code:
        return redirect('/')  # Просто возвращаем на главную если нет кода
    
    # Получаем токен
    token_url = 'https://github.com/login/oauth/access_token'
    data = {
        'client_id': settings.GITHUB_CLIENT_ID,
        'client_secret': settings.GITHUB_CLIENT_SECRET,
        'code': code,
        'redirect_uri': settings.GITHUB_REDIRECT_URI
    }
    
    headers = {'Accept': 'application/json'}
    response = requests.post(token_url, data=data, headers=headers)
    
    if response.status_code == 200:
        access_token =  response.json().get('access_token')
        
        if access_token:
            # Сохраняем токен в сессии
            request.session['github_token'] = access_token
            
            # Опционально: получаем логин пользователя
            headers = {'Authorization': f'token {access_token}'}
            user_response = requests.get('https://api.github.com/user', headers=headers)
            if user_response.status_code == 200:
                user_data = user_response.json()
                request.session['github_user'] = user_data.get('login')

    # Всегда возвращаем на главную страницу
    return redirect('/')



def logout_view(request):
    # Очищаем все GitHub данные из сессии
    #session_keys = ['github_token', 'github_user', 'github_user_data']
    request.session.flush()
    return redirect('/')  # Возвращаем на главную