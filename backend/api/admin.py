from django.contrib import admin
from .models import List, Block, Folder, Tag

# Register your models here.
admin.site.register(List)
admin.site.register(Block)
admin.site.register(Folder)
admin.site.register(Tag)
