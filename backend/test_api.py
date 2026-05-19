import asyncio
import httpx

async def test_gemini_api():
    base_url = "http://localhost:8000/api"
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        print("Registering user...")
        res = await client.post(f"{base_url}/auth/register", json={
            "email": "testuser@example.com",
            "password": "testpassword123"
        })
        if res.status_code == 400 and "already registered" in res.text:
            print("User already registered, logging in...")
        else:
            res.raise_for_status()

        print("Logging in...")
        res = await client.post(f"{base_url}/auth/login", json={
            "email": "testuser@example.com",
            "password": "testpassword123"
        })
        res.raise_for_status()
        token = res.json()["access_token"]
        
        print("Generating plan using Gemini API...")
        headers = {"Authorization": f"Bearer {token}"}
        plan_request = {
            "event_type": "Corporate Retreat",
            "location": "Mountain Lodge",
            "date": "2026-10-15",
            "time": "09:00",
            "guest_count": 50,
            "budget": 10000,
            "theme_preference": "Nature and Team Building",
            "special_notes": "We need a robust itinerary and realistic budget."
        }
        res = await client.post(f"{base_url}/plan/generate", json=plan_request, headers=headers)
        if res.status_code == 200:
            print("Successfully generated plan!")
            print(res.json())
        else:
            print(f"Failed to generate plan. Status: {res.status_code}")
            print(res.text)

if __name__ == "__main__":
    asyncio.run(test_gemini_api())
