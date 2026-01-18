import requests
from datetime import datetime
from .models import *
from django.shortcuts import render
from django.http import JsonResponse

def get_info(username: str, token, private: bool):
    may_be_dev = Developer.objects.filter(name=username)
    if len(may_be_dev)!=0:
        for dev in may_be_dev:
            if dev.private == private:
                developer = dev
                repositories = Repository.objects.filter(developer_name=developer.name, private=private)
                repo_names = [x.name for x in repositories]
                return developer,repo_names
    
    head = {}
    response = None
    if token != '':
        head = {'Authorization': f'token {token}'}
        response = requests.get('https://api.github.com/user/repos', headers=head)
    else:
        response = requests.get(f"https://api.github.com/users/{username}/repos")

    if response.status_code == 404:
        return "Not Found"
    if response.status_code == 403:
        return "Forbidden"

    developer = Developer()
    developer.name = username
    developer.commit_year=[0]*13
    developer.link = f"https://github.com/{username}"
    developer.tech_stack = dict()
    developer.private = private

    repository_data = response.json()
    repo_names = []
    for current_repo in repository_data:
        if current_repo["private"] == True and not private: continue
        repo = Repository()
        repo.name = current_repo["name"]
        repo.link = current_repo["html_url"]
        repo.created_at = current_repo["created_at"]
        repo.updated_at = current_repo["updated_at"]
        repo.forks_count = current_repo["forks_count"]
        repo.stars = current_repo["stargazers_count"]
        repo.commit_month = [0]*13
        repo.developer_name = username
        repo.private = private

        repo_names.append(repo.name)

        if current_repo["size"] == 0:
            repo.save()
            continue

        response = requests.get(f"https://api.github.com/repos/{username}/{repo.name}/languages", headers = head)
        if response.status_code == 403:
            return "Forbidden"
        repo.tech_stack = response.json()
        for key, value in repo.tech_stack.items():
            if key in developer.tech_stack:
                developer.tech_stack[key]+=value
            else:
                developer.tech_stack[key]=value

        contributors = dict()   
        
        response = requests.get(f"https://api.github.com/repos/{username}/{repo.name}/commits", headers = head)
        if response.status_code == 403:
            return "Forbidden"
        commits_data = response.json()   

        for current_commit in commits_data:
            if current_commit["committer"] is None: continue
            date_str = current_commit["commit"]["author"]["date"]
            dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            dt_now = datetime.now()
            month_index = (dt_now.year - dt.year)*12 + dt_now.month - dt.month
            login = current_commit["author"]["login"]
            if login == 'web-flow': continue

            if login not in contributors:
                contributor = Contributor()
                contributor.name = login
                contributor.link = f"https://github.com/{login}"
                contributor.repository_name = repo.name
                contributor.commit_month = [0]*13
                contributors[login] = contributor

            contributor = contributors[login]
            contributor.commit_count+=1
            if month_index < 13:    
                contributor.commit_month[month_index]+=1
                repo.commit_month[month_index]+=1

            if login == username:#вот тут добавил if///////////////////////////////////////////
                developer.commit_year[month_index]+=1
            
               
        for contributor in contributors.values():
            repo.commit_count += contributor.commit_count
            contributor.private = private
            contributor.save()

        developer.commit_count += repo.commit_count
        repo.save()
    
    developer.save()
    return developer, repo_names


def main_page(request):
    return render(request, 'main.html')

def func(request):
    token = request.session.get('github_token', '')
    github_user = request.session.get('github_user', None)
    username = request.GET.get('username')
    private = github_user == username
    data = get_info(username, token, private)
    if data == "Not Found":
        return render(request, 'main.html',
                  {'error': "Not Found"})
    if data == "Forbidden":
        return render(request, 'main.html',
                  {'error': "Сорян, апишка ограничена"})

    developer, repo_names = data    
    return render(request, 'statistics.html',
                  {'developer': developer, 'repositories': repo_names})



def get_repo_stats(request, repo_name):
    repos = Repository.objects.filter(name=repo_name)
    repo = None
    for repoi in repos:
        if repoi.private and repoi.developer_name != request.session.get('github_user', None):
            continue
        repo = repoi
        if repoi.private and repoi.developer_name == request.session.get('github_user', None):
            break
        
    if repo is None:return

    contributors = Contributor.objects.filter(repository_name=repo.name)
    cont_names = [x.name for x in contributors]
    data = {
            'repo': {
                'name': repo.name,
                'link': repo.link,
                'created_at':repo.created_at,
                'updated_at':repo.updated_at,
                'forks_count': repo.forks_count,
                'stars': repo.stars,
                'tech_stack': repo.tech_stack,
                'commits': repo.commit_count,
                'commit_month':repo.commit_month

            },
            'contributors': cont_names
        }
    return JsonResponse(data)



def get_cont_stats(request, repo_name, cont_name):
    repos = Repository.objects.filter(name=repo_name)
    repo = None
    for repoi in repos:
        if repoi.private and repoi.developer_name != request.session.get('github_user', None):
            continue
        repo = repoi
        if repoi.private and repoi.developer_name == request.session.get('github_user', None):
            break
        
    if repo is None:return


    cont = Contributor.objects.filter(repository_name=repo_name, name=cont_name,private = repo.private)[0]
    data = {
            'contributor': {
                'name': cont.name,
                'link': cont.link,
                'commits': cont.commit_count,
                'commit_month':cont.commit_month
            },
        }
    return JsonResponse(data)