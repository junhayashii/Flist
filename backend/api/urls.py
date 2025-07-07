from rest_framework.routers import DefaultRouter
from .views import BlockViewSet, ListViewSet, FolderViewSet, TagViewSet

router = DefaultRouter()
router.register(r'blocks', BlockViewSet, basename='block')
router.register(r'lists', ListViewSet, basename='list')
router.register(r'folders', FolderViewSet, basename='folder')
router.register(r'tags', TagViewSet, basename='tag')

urlpatterns = router.urls