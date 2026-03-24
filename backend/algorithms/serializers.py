"""
Serializers for algorithm data.
"""

from rest_framework import serializers


class ComplexitySerializer(serializers.Serializer):
    time = serializers.DictField()
    space = serializers.CharField()


class PseudocodeLineSerializer(serializers.Serializer):
    line = serializers.IntegerField()
    code = serializers.CharField()
    indent = serializers.IntegerField()


class AlgorithmListSerializer(serializers.Serializer):
    id = serializers.CharField()
    name = serializers.CharField()
    category = serializers.CharField()
    description = serializers.CharField()
    complexity = ComplexitySerializer()


class AlgorithmDetailSerializer(AlgorithmListSerializer):
    pseudocode = PseudocodeLineSerializer(many=True)
