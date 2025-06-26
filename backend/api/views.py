from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from django.db import models
from .models import Block, List, Folder, Tag
from .serializers import BlockSerializer, ListSerializer, FolderSerializer, TagSerializer

class TagViewSet(viewsets.ModelViewSet):
    serializer_class = TagSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

    def get_queryset(self):
        return Tag.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class FolderViewSet(viewsets.ModelViewSet):
    serializer_class = FolderSerializer
    
    def get_queryset(self):
        return Folder.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
class ListViewSet(viewsets.ModelViewSet):
    serializer_class = ListSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['title']

    def get_queryset(self):
        return List.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class BlockViewSet(viewsets.ModelViewSet):
    serializer_class = BlockSerializer
    filter_backends = [DjangoFilterBackend]

    def get_queryset(self):
        queryset = Block.objects.filter(user=self.request.user)
        params = self.request.query_params

        block_type = params.get('type')
        list_id = params.get('list_id')
        parent_block = params.get('parent_block')

        if block_type:
            queryset = queryset.filter(type=block_type)

        if parent_block is not None:
            queryset = queryset.filter(parent_block=parent_block)
        elif parent_block == '':
            queryset = queryset.filter(parent_block__isnull=True)

        if list_id == 'none':
            queryset = queryset.filter(list__isnull=True)
        elif list_id:
            try:
                queryset = queryset.filter(list_id=int(list_id))
            except (ValueError, TypeError):
                pass

        return queryset.order_by('order')

    def perform_create(self, serializer):
        order = serializer.validated_data.get("order")
        if order is None:
            max_order = Block.objects.filter(user=self.request.user).aggregate(models.Max('order'))['order__max'] or 0
            order = max_order + 1
        serializer.save(user=self.request.user, order=order)