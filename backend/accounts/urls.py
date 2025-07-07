from django.urls import path
from .views import CustomAuthToken, UserRegistrationView, UserLogoutView, UserProfileView

urlpatterns = [
    path('login/', CustomAuthToken.as_view(), name='login'),
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('logout/', UserLogoutView.as_view(), name='logout'),
    path('profile/', UserProfileView.as_view(), name='profile'),
]
