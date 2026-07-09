from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet
from rest_framework.mixins import CreateModelMixin, RetrieveModelMixin, UpdateModelMixin
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import (
    ChangePasswordSerializer,
    ForgotPasswordSerializer,
    LoginSerializer,
    RegisterSerializer,
    ResetPasswordSerializer,
    UserProfileSerializer,
    UserUpdateSerializer,
)


class AuthViewSet(CreateModelMixin, GenericViewSet):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def get_permissions(self):
        if self.action in ["register", "login", "forgot_password", "reset_password"]:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        serializers_map = {
            "register": RegisterSerializer,
            "login": LoginSerializer,
            "profile": UserProfileSerializer,
            "update_profile": UserUpdateSerializer,
            "change_password": ChangePasswordSerializer,
            "forgot_password": ForgotPasswordSerializer,
            "reset_password": ResetPasswordSerializer,
        }
        return serializers_map.get(self.action, self.serializer_class)

    @action(detail=False, methods=["post"])
    def register(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "success": True,
                "message": "Registration successful",
                "data": {
                    "user": UserProfileSerializer(user).data,
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                },
                "errors": [],
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["post"])
    def login(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        return Response(
            {
                "success": True,
                "message": "Login successful",
                "data": serializer.validated_data,
                "errors": [],
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["post"])
    def logout(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except Exception:
            pass
        return Response(
            {
                "success": True,
                "message": "Logout successful",
                "data": None,
                "errors": [],
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["get"])
    def profile(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(
            {
                "success": True,
                "message": "Profile retrieved",
                "data": serializer.data,
                "errors": [],
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["patch"])
    def update_profile(self, request):
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {
                "success": True,
                "message": "Profile updated successfully",
                "data": UserProfileSerializer(request.user).data,
                "errors": [],
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["post"])
    def change_password(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save()
        return Response(
            {
                "success": True,
                "message": "Password changed successfully",
                "data": None,
                "errors": [],
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["post"])
    def forgot_password(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        try:
            user = User.objects.get(email=email)
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            reset_url = f"{request.build_absolute_uri('/api/v1/accounts/reset-password/')}?uid={uid}&token={token}"
            html_message = render_to_string(
                "emails/forgot_password.html",
                {"user": user, "reset_url": reset_url},
            )
            send_mail(
                subject="Password Reset Request",
                message=f"Use this link to reset your password: {reset_url}",
                html_message=html_message,
                from_email=None,
                recipient_list=[email],
            )
        except User.DoesNotExist:
            pass
        return Response(
            {
                "success": True,
                "message": "If the email exists, a password reset link has been sent",
                "data": None,
                "errors": [],
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["post"])
    def reset_password(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        uid = request.query_params.get("uid")
        token = serializer.validated_data["token"]
        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(
                {
                    "success": False,
                    "message": "Invalid reset link",
                    "data": None,
                    "errors": [{"field": "token", "message": "Invalid or expired token"}],
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not default_token_generator.check_token(user, token):
            return Response(
                {
                    "success": False,
                    "message": "Invalid or expired reset link",
                    "data": None,
                    "errors": [{"field": "token", "message": "Invalid or expired token"}],
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        user.set_password(serializer.validated_data["password"])
        user.save()
        return Response(
            {
                "success": True,
                "message": "Password reset successful",
                "data": None,
                "errors": [],
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["post"])
    def refresh_token(self, request):
        refresh = request.data.get("refresh")
        if not refresh:
            return Response(
                {
                    "success": False,
                    "message": "Refresh token is required",
                    "data": None,
                    "errors": [{"field": "refresh", "message": "This field is required"}],
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            token = RefreshToken(refresh)
            return Response(
                {
                    "success": True,
                    "message": "Token refreshed",
                    "data": {
                        "access": str(token.access_token),
                        "refresh": str(token),
                    },
                    "errors": [],
                },
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response(
                {
                    "success": False,
                    "message": "Invalid refresh token",
                    "data": None,
                    "errors": [{"field": "refresh", "message": str(e)}],
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )


class UserViewSet(RetrieveModelMixin, UpdateModelMixin, GenericViewSet):
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer

    def get_queryset(self):
        return User.objects.filter(is_active=True)

    @action(detail=True, methods=["post"])
    def deactivate(self, request, pk=None):
        user = self.get_object()
        user.is_active = False
        user.save()
        return Response(
            {
                "success": True,
                "message": "User deactivated",
                "data": UserProfileSerializer(user).data,
                "errors": [],
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"])
    def activate(self, request, pk=None):
        user = self.get_object()
        user.is_active = True
        user.save()
        return Response(
            {
                "success": True,
                "message": "User activated",
                "data": UserProfileSerializer(user).data,
                "errors": [],
            },
            status=status.HTTP_200_OK,
        )
