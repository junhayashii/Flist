from rest_framework.routers import DefaultRouter
from .views import BlockViewSet, ListViewSet

router = DefaultRouter()
router.register(r'blocks', BlockViewSet)
router.register(r'lists', ListViewSet)

urlpatterns = router.urls