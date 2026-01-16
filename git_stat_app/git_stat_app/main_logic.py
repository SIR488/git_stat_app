import requests
from datetime import datetime
from .models import *
from django.shortcuts import render
#from .secrets import my_token

def get_info(username: str, token):
    may_be_dev = Developer.objects.filter(name=username)
    if len(may_be_dev)!=0:
        developer = may_be_dev[0]
        repositories = Repository.objects.filter(developer_name=developer.name)
        repo_contributors = dict()
        for repo in repositories:
            repo_contributors[repo] = Contributor.objects.filter(repository_name=repo.name)
        return developer, list(repo_contributors.items())
    head = {}
    if token != '':
        head = {'Authorization': f'Bearer {token}'}
    response = requests.get(f"https://api.github.com/users/{username}/repos", headers = head)
    if response.status_code == 404:
        return "Not Found"
    if response.status_code == 403:
        return "Forbidden"

    developer = Developer()
    developer.name = username
    developer.commit_year=[0]*13
    developer.link = f"https://github.com/{username}"
    developer.tech_stack = dict()

    repository_data = response.json()
    repo_contributors = dict()
    for current_repo in repository_data:
        repo = Repository()
        repo.name = current_repo["name"]
        repo.link = current_repo["html_url"]
        repo.created_at = current_repo["created_at"]
        repo.updated_at = current_repo["updated_at"]
        repo.forks_count = current_repo["forks_count"]
        repo.stars = current_repo["stargazers_count"]
        repo.commit_month = [0]*6

        if current_repo["size"] == 0:
            repo.save()
            repo_contributors[repo] = []#попправить тут
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
            try:
                if current_commit["committer"] is None: continue
            except:
                raise Exception(commits_data)
            date_str = current_commit["commit"]["author"]["date"]
            dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            dt_now = datetime.now()
            month_index = (dt_now.year - dt.year)*12 + dt_now.month - dt.month     
            login = current_commit["committer"]["login"]
            if login == 'web-flow': continue
            if month_index < 6:
                if login in contributors:
                    contributor = contributors[login]

                    contributor.commit_month[month_index]+=1
                else:
                    contributor = Contributor()
                    contributor.name = login
                    contributor.link = f"https://github.com/{login}"
                    contributor.repository_name = repo.name
                    contributor.commit_month = [0]*6
                    contributors[login] = contributor

                    contributor.commit_month[month_index]+=1
                
                repo.commit_month[month_index]+=1

            if login == username:#вот тут добавил if///////////////////////////////////////////
                developer.commit_year[month_index]+=1

               
        for contributor in contributors.values():
            contributor.commit_count = sum(contributor.commit_month)
            repo.commit_count += contributor.commit_count
            contributor.save()

        developer.commit_count += repo.commit_count
        repo.developer_name = username
        repo.save()
        repo_contributors[repo] = contributors.values()

    developer.save()
    return developer, list(repo_contributors.items())


def main_page(request):
    return render(request, 'main.html')

def func(request):
    #token = my_token
    username = request.GET.get('username')#'Fista6k'
    data = get_info(username,'')#, token
    if data == "Not Found":
        return render(request, 'main.html',
                  {'error': "Not Found"})
    if data == "Forbidden":
        return render(request, 'main.html',
                  {'error': "Сорян, апишка ограничена"})
    developer, repo_contributors = data
    return render(request, 'index.html',
                  {'developer': developer, 'repo_contributors': repo_contributors})


def func2(request):
    return render(request, 'index copy.html',
                  {'data': Developer.objects.all()})