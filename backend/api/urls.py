from rest_framework.routers import DefaultRouter
from .views import BlockViewSet, ListViewSet, FolderViewSet

router = DefaultRouter()
router.register(r'blocks', BlockViewSet)
router.register(r'lists', ListViewSet)
router.register(r'folders', FolderViewSet)

urlpatterns = router.urls