import requests
from datetime import datetime
from .models import *
from django.shortcuts import render
from .secrets import my_tocken

def get_info(username: str, tocken):
    may_be_dev = Developer.objects.filter(name='Fista6k')
    if len(may_be_dev)!=0:
        return may_be_dev[0]
    
    head = {'Authorization': tocken}
    response = requests.get(f"https://api.github.com/users/{username}/repos", headers = head)
    developer = Developer()
    developer.name = username
    developer.commit_year=[0]*13
    developer.link = f"https://github.com/{username}"
    developer.tech_stack = dict()

    repository_data = response.json()
    repositories = list()
    for current_repo in repository_data:
        repo = Repository()
        repo.name = current_repo["name"]
        repo.link = current_repo["html_url"]
        repo.created_at = current_repo["created_at"]
        repo.updated_at = current_repo["updated_at"]
        repo.forks_count = current_repo["forks_count"]
        repo.stars = current_repo["stargazers_count"]
        repo.commit_month = [0]*6

        response = requests.get(f"https://api.github.com/repos/{username}/{repo.name}/languages", headers = head)
        repo.tech_stack = response.json()
        for key, value in repo.tech_stack.items():
            if key in developer.tech_stack:
                developer.tech_stack[key]+=value
            else:
                developer.tech_stack[key]=value

        response = requests.get(f"https://api.github.com/repos/{username}/{repo.name}/contributors", headers = head)
        contributors_data = response.json()
        contributors = dict()
        for current_contributor in contributors_data:
            contributor = Contributor()
            contributor.name = current_contributor["login"]
            contributor.link = current_contributor["html_url"]
            contributor.commit_count = current_contributor["contributions"]
            repo.commit_count += contributor.commit_count
            contributor.repository_name = repo.name
            contributor.commit_month = [0]*6
            contributors[contributor.name] = contributor
        
        developer.commit_count += repo.commit_count
        response = requests.get(f"https://api.github.com/repos/{username}/{repo.name}/commits", headers = head)
        commits_data = response.json()   

        for current_commit in commits_data:
            date_str = current_commit["commit"]["committer"]["date"]
            dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            dt_now = datetime.now()
            month_index = (dt_now.year - dt.year)*12 + dt_now.month - dt.month
            if month_index < 6:
                contributor = contributors[current_commit["committer"]["login"]]
                contributor.commit_month[month_index]+=1
                repo.commit_month[month_index]+=1
            developer.commit_year[month_index]+=1
        repo.developer_name = username
        repositories.append(repo)

    developer.save()
    return developer


def func(request):
    tocken = my_tocken
    return render(request, 'index.html',
                  {'data': get_info('Fista6k', tocken)})


def func2(request):
    return render(request, 'index copy.html',
                  {'data': Developer.objects.all()})