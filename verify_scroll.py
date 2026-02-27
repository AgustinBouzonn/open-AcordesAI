
import asyncio
from playwright.async_api import async_playwright
import time

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        print("Navigating to app...")
        # Assuming the app is running on localhost:5173
        try:
            await page.goto("http://localhost:5173", timeout=10000)
        except Exception as e:
            print(f"Failed to navigate: {e}")
            await browser.close()
            return

        print("Page loaded. Searching for a song...")

        # Simulate search to get to SongViewer
        await page.fill('input[placeholder="Canción o artista..."]', "Wonderwall")
        await page.press('input[placeholder="Canción o artista..."]', "Enter")

        # Wait for results or direct navigation (mocking might be needed if no API key)
        # For verification of UI changes without API key, we might need to inject state or mock
        # However, we can check if the SongViewer component renders controls

        # Since we don't have a real backend/API key in this environment,
        # we might just check if the app shell loads and we can navigate to a route.
        # But let's try to hit a song route directly if possible or mock the state.

        # Inject mock data into localStorage to simulate a loaded song
        mock_song = {
            "id": "test-song",
            "title": "Test Song",
            "artist": "Test Artist",
            "key": "C",
            "content": "C G Am F\nTest lyrics and chords",
            "chords": {"guitar": "C G Am F\nTest lyrics and chords"}
        }

        await page.evaluate(f"""
            localStorage.setItem('acordesai_songs_cache', JSON.stringify({{"test-song": {mock_song}}}));
        """)

        print("Navigating to song detail...")
        await page.goto("http://localhost:5173/#/song/test-song")

        # Wait for SongViewer to load
        try:
            await page.wait_for_selector("text=Test Song", timeout=5000)
            print("Song loaded.")
        except:
            print("Song did not load correctly.")
            await page.screenshot(path="verification_failed.png")
            await browser.close()
            return

        # Test AutoScroll
        print("Testing AutoScroll button...")
        # Find the autoscroll button. It might be 'Autoscroll' or 'PlayCircle' icon
        # In the code: <span>{autoScrollSpeed > 0 ? 'Pausar' : 'Autoscroll'}</span>

        # Get initial scroll position
        initial_scroll = await page.evaluate("window.scrollY")

        await page.click("text=Autoscroll")

        # Wait a bit for scroll to happen
        time.sleep(2)

        # Get new scroll position
        new_scroll = await page.evaluate("window.scrollY")

        print(f"Initial scroll: {initial_scroll}, New scroll: {new_scroll}")

        if new_scroll > initial_scroll:
            print("Auto-scroll is working!")
        else:
            print("Auto-scroll did NOT move the page.")

        await page.screenshot(path="verification_success.png")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
