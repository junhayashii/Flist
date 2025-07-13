from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('api/accounts/', include('accounts.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
else:
    # 本番はNginxなどが静的ファイルを配信すべき
    pass

# SPAのindex.htmlにフォールバックするルールは最後に置く（ただし静的ファイルは除く）
from django.views.generic import TemplateView
from django.urls import re_path

urlpatterns += [
    re_path(r'^(?!static/|api/|admin/|assets/).*$', TemplateView.as_view(template_name="index.html")),
]
