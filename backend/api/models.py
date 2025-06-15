from django.db import models

# Create your models here.

class Folder(models.Model):
    title = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
    
class List(models.Model):
    title = models.CharField(max_length=255)
    folder = models.ForeignKey(Folder, on_delete=models.SET_NULL, related_name="lists", null=True, blank=True)
    sort_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
    
class Block(models.Model):
    list = models.ForeignKey(List, on_delete=models.CASCADE, related_name="blocks", null=True, blank=True)
    parent_block = models.ForeignKey('self', on_delete=models.CASCADE, related_name="child_blocks", null=True, blank=True)
    html = models.TextField(blank=True)
    type = models.CharField(max_length=20, default="text")
    order = models.FloatField(default=0.0)

    due_date = models.DateTimeField(null=True, blank=True)
    is_done = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order']