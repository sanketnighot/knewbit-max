#!/usr/bin/env python3
"""
Quick test script for Knewbit Max Backend API
Run this to verify your API endpoints are working properly.
"""

import requests
import json
from typing import Dict, Any


def test_health_endpoint(base_url: str = "http://localhost:8000") -> bool:
    """Test the health endpoint"""
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            print("✅ Health endpoint: OK")
            return True
        else:
            print(f"❌ Health endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health endpoint error: {e}")
        return False


def test_root_endpoint(base_url: str = "http://localhost:8000") -> bool:
    """Test the root endpoint"""
    try:
        response = requests.get(f"{base_url}/")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Root endpoint: {data.get('message', 'OK')}")
            return True
        else:
            print(f"❌ Root endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Root endpoint error: {e}")
        return False


def test_ai_tutor_endpoint(
    base_url: str = "http://localhost:8000", jwt_token: str = None
) -> bool:
    """Test the AI tutor endpoint (requires JWT token)"""
    if not jwt_token:
        print("⚠️  AI Tutor endpoint: Skipped (no JWT token provided)")
        return True

    try:
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {jwt_token}",
        }

        payload = {
            "user_message": "What is artificial intelligence?",
            "course_id": "test-course",
            "chat_history": [],
        }

        response = requests.post(f"{base_url}/ai-tutor", json=payload, headers=headers)

        if response.status_code == 200:
            data = response.json()
            print(
                f"✅ AI Tutor endpoint: Response received ({len(data.get('response', ''))} chars)"
            )
            return True
        elif response.status_code == 429:
            print("⚠️  AI Tutor endpoint: Rate limited (this is normal)")
            return True
        else:
            print(f"❌ AI Tutor endpoint failed: {response.status_code}")
            if response.status_code == 401:
                print("   (Check your JWT token)")
            return False
    except Exception as e:
        print(f"❌ AI Tutor endpoint error: {e}")
        return False


def test_docs_endpoint(base_url: str = "http://localhost:8000") -> bool:
    """Test that Swagger docs are accessible"""
    try:
        response = requests.get(f"{base_url}/docs")
        if response.status_code == 200:
            print("✅ Swagger docs: Accessible")
            return True
        else:
            print(f"❌ Swagger docs failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Swagger docs error: {e}")
        return False


def main():
    """Run all API tests"""
    print("🚀 Testing Knewbit Max Backend API\n")

    base_url = "http://localhost:8000"
    jwt_token = None  # Add your JWT token here for full testing

    # Get JWT token from environment or prompt
    import os

    jwt_token = os.getenv("JWT_TOKEN")

    if not jwt_token:
        print("💡 Tip: Set JWT_TOKEN environment variable for full testing")
        print("   export JWT_TOKEN='your_jwt_token_here'\n")

    tests = [
        test_health_endpoint,
        test_root_endpoint,
        lambda: test_ai_tutor_endpoint(base_url, jwt_token),
        test_docs_endpoint,
    ]

    passed = 0
    total = len(tests)

    for test in tests:
        if test():
            passed += 1
        print()

    print(f"📊 Test Results: {passed}/{total} tests passed")

    if passed == total:
        print("🎉 All tests passed! Your API is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the output above.")

    print(f"\n📖 Visit {base_url}/docs for interactive API documentation")


if __name__ == "__main__":
    main()
