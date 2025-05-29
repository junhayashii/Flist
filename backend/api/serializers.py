from rest_framework import serializers
from .models import Block, List

class ListSerializer(serializers.ModelSerializer):
    class Meta:
        model = List
        fields = '__all__'

class BlockSerializer(serializers.ModelSerializer):
    child_blocks = serializers.SerializerMethodField()

    class Meta:
        model = Block
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_child_blocks(self, obj):
        return BlockSerializer(obj.child_blocks.all(), many=True).data