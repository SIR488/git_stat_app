from django.db import models


class Developer(models.Model):
    name = models.CharField(max_length=255)
    link = models.TextField()
    tech_stack = models.JSONField()
    commit_count = models.IntegerField(default=0)
    commit_year = models.JSONField()


class Repository(models.Model):
    developer_name = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    link = models.TextField()
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    forks_count = models.IntegerField()
    stars = models.IntegerField()
    tech_stack = models.JSONField(default=dict())
    commit_count = models.IntegerField(default=0)
    commit_month = models.JSONField()



class Contributor(models.Model):
    repository_name = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    link = models.TextField()
    commit_count = models.IntegerField(default=0)
    commit_month = models.JSONField()