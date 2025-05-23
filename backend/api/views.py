from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from django.db import models
from .models import Task, Block
from .serializers import TaskSerializer, BlockSerializer

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all().order_by('-created_at')
    serializer_class = TaskSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['block']

class BlockViewSet(viewsets.ModelViewSet):
    queryset = Block.objects.all().order_by('order')
    serializer_class = BlockSerializer

    def perform_create(self, serializer):
        order = serializer.validated_data.get("order")
        if order is None:
            max_order = Block.objects.aggregate(models.Max('order'))['order__max'] or 0
            order = max_order + 1
        serializer.save(order=order)
