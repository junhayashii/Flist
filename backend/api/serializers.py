from rest_framework import serializers
from .models import Block, List, Folder, Tag

class FolderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Folder
        fields = ['id', 'title', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class ListSerializer(serializers.ModelSerializer):
    folder = FolderSerializer(read_only=True)
    folder_id = serializers.PrimaryKeyRelatedField(
        queryset=Folder.objects.none(), source='folder', write_only=True, allow_null=True, required=False
    )
    
    class Meta:
        model = List
        fields = ['id', 'title', 'folder', 'folder_id', 'sort_order', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # ユーザーのフォルダーのみを選択肢として提供
        if 'context' in kwargs and 'request' in kwargs['context']:
            user = kwargs['context']['request'].user
            if user.is_authenticated:
                self.fields['folder_id'].queryset = Folder.objects.filter(user=user)

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']
        read_only_fields = ['id']

class BlockSerializer(serializers.ModelSerializer):
    child_blocks = serializers.SerializerMethodField()
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(), many=True, write_only=True, required=False, source='tags')

    class Meta:
        model = Block
        fields = ['id', 'list', 'parent_block', 'html', 'type', 'order', 'child_blocks', 'due_date', 'is_done', 'is_pinned', 'tags', 'tag_ids', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_child_blocks(self, obj):
        return BlockSerializer(obj.child_blocks.all(), many=True, context=self.context).data

    def create(self, validated_data):
        tags = validated_data.pop('tags', [])
        block = super().create(validated_data)
        if tags:
            block.tags.set(tags)
        return block

    def update(self, instance, validated_data):
        tags = validated_data.pop('tags', None)
        block = super().update(instance, validated_data)
        if tags is not None:
            block.tags.set(tags)
        return block