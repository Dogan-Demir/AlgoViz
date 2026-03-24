"""
Serializers for run data.
"""

from rest_framework import serializers


class CreateRunSerializer(serializers.Serializer):
    algorithmId = serializers.CharField()
    input = serializers.DictField()


class RunMetadataSerializer(serializers.Serializer):
    runId = serializers.CharField()
    algorithmId = serializers.CharField()
    input = serializers.DictField()
    totalSteps = serializers.IntegerField()
    createdAt = serializers.CharField()
    algorithm = serializers.DictField()


class RunControlSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=["pause", "resume"])
