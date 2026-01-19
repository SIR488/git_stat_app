from django.contrib import admin
from .models import Developer, Repository, Contributor

# Для Developer
@admin.register(Developer)
class DeveloperAdmin(admin.ModelAdmin):
    list_display = ('name', 'private', 'commit_count', 'link')  # list_display
    search_fields = ('name',)  # search_fields
    list_filter = ('private',)  # можно добавить фильтр для удобства

# Для Repository
@admin.register(Repository)
class RepositoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'developer_name', 'private', 'stars', 'forks_count')
    search_fields = ('name', 'developer_name')
    list_filter = ('private',)

# Для Contributor
@admin.register(Contributor)
class ContributorAdmin(admin.ModelAdmin):
    list_display = ('name', 'repository_name', 'commit_count', 'private')
    search_fields = ('name', 'repository_name')
    list_filter = ('private',)