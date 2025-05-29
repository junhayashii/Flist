from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from django.db import models
from .models import Block, List
from .serializers import BlockSerializer, ListSerializer

class ListViewSet(viewsets.ModelViewSet):
    queryset = List.objects.all()
    serializer_class = ListSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['title']

class BlockViewSet(viewsets.ModelViewSet):
    queryset = Block.objects.all()
    serializer_class = BlockSerializer
    filter_backends = [DjangoFilterBackend]

    def get_queryset(self):
        queryset = Block.objects.all()
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
            max_order = Block.objects.aggregate(models.Max('order'))['order__max'] or 0
            order = max_order + 1
        serializer.save(order=order)