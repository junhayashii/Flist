from django.db import models

# Create your models here.

class Block(models.Model):
    html = models.TextField(blank=True)
    type = models.CharField(max_length=20, default="text")
    order = models.FloatField(default=0.0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order']

class Task(models.Model):
    block = models.ForeignKey(Block, on_delete=models.CASCADE, related_name="task")
    title = models.CharField(max_length=255)
    is_done = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title