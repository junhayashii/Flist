from rest_framework import serializers
from .models import Block, List, Folder

class FolderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Folder
        fields = '__all__'

class ListSerializer(serializers.ModelSerializer):
    folder = FolderSerializer(read_only=True)
    folder_id = serializers.PrimaryKeyRelatedField(
        queryset=Folder.objects.all(), source='folder', write_only=True, allow_null=True, required=False
    )
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