from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, BlockViewSet

router = DefaultRouter()
router.register(r'tasks', TaskViewSet)
router.register(r'blocks', BlockViewSet)

urlpatterns = router.urls