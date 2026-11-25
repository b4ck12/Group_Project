"""Custom exceptions for the gmaps package."""

from __future__ import annotations


class GoogleMapsError(RuntimeError):
    """Base exception for Google Maps client errors."""


class GoogleMapsBlockedError(GoogleMapsError):
    """Raised when Google Maps blocks an internal RPC."""
