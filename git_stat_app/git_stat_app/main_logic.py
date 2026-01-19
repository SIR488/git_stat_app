import requests
from datetime import datetime
from .models import *
from django.http import JsonResponse


def search_user(username: str, token, private: bool):    
    head = {}
    response = None
    if token != '':
        head = {'Authorization': f'token {token}'}
    if private:
        response = requests.get('https://api.github.com/user/repos', headers=head)
    else:
        response = requests.get(f"https://api.github.com/users/{username}/repos", headers=head)

    if response.status_code == 404:
        return "Not Found"
    if response.status_code == 403:
        print(response.json())
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
        repo.commit_year = [0]*13
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
                contributor.commit_year = [0]*13
                contributors[login] = contributor

            contributor = contributors[login]
            if month_index < 13:    
                contributor.commit_year[month_index]+=1
                repo.commit_year[month_index]+=1

            if login == username:#считаем для developer
                developer.commit_year[month_index]+=1
            
        for contributor in contributors.values():
            contributor.commit_count = sum(contributor.commit_year)
            repo.commit_count += contributor.commit_count
            contributor.private = private
            contributor.save()

        developer.commit_count += repo.commit_count
        repo.save()

    developer.save()
    return developer, repo_names


def delete_data(username, private):
    may_be_dev = Developer.objects.filter(name=username)
    if len(may_be_dev)!=0:
        for dev in may_be_dev:
            if dev.private == private:
                developer = dev
                repositories = Repository.objects.filter(developer_name=developer.name, private=private)
                for repo in repositories:
                    Contributor.objects.filter(repository_name=repo.name, private = private).delete()
                repositories.delete()
                developer.delete()


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

    contributors = Contributor.objects.filter(repository_name=repo.name,private = repo.private)
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
                'commit_year':repo.commit_year

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

    contibutor = Contributor.objects.filter(repository_name=repo_name, name=cont_name,private = repo.private)[0]
    data = {
            'contributor': {
                'name': contibutor.name,
                'link': contibutor.link,
                'commits': contibutor.commit_count,
                'commit_year':contibutor.commit_year
            },
        }
    return JsonResponse(data)