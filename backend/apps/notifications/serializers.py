from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source="member.full_name", read_only=True)

    class Meta:
        model = Notification
        fields = [
            "id", "member", "member_name",
            "notification_type", "channel",
            "subject", "message", "status",
            "sent_at", "error_message",
            "created_at",
        ]
        read_only_fields = ["id", "sent_at", "created_at"]


class NotificationCreateSerializer(serializers.Serializer):
    member_ids = serializers.ListField(child=serializers.UUIDField())
    notification_type = serializers.ChoiceField(choices=Notification.TYPE_CHOICES)
    channel = serializers.ChoiceField(choices=Notification.CHANNEL_CHOICES)
    subject = serializers.CharField()
    message = serializers.CharField()
