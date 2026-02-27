
import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # 1. Start the app
        print("Navigating to app...")
        try:
            await page.goto("http://localhost:3000", timeout=10000)
            print("Page loaded successfully.")
        except Exception as e:
            print(f"Failed to load page: {e}")
            await browser.close()
            return

        # 2. Inject mock data for a song to bypass API call
        # Mocking a song with ID 'test-song'
        mock_song_data = {
            "id": "test-song",
            "title": "Test Song for Scrolling",
            "artist": "Test Artist",
            "key": "C",
            "content": "C G Am F\nTest lyrics and chords\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6\nLine 7\nLine 8\nLine 9\nLine 10\nLine 11\nLine 12\nLine 13\nLine 14\nLine 15\nLine 16\nLine 17\nLine 18\nLine 19\nLine 20",
            "chords": {"guitar": "C G Am F\nTest lyrics and chords\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6\nLine 7\nLine 8\nLine 9\nLine 10\nLine 11\nLine 12\nLine 13\nLine 14\nLine 15\nLine 16\nLine 17\nLine 18\nLine 19\nLine 20"}
        }

        # We need to set this in localStorage before the component mounts or trigger a reload
        # But since we are on the page, let's inject and navigate
        print("Injecting mock data...")
        await page.evaluate(f"""
            const song = {mock_song_data};
            const cache = {{ [song.id]: song }};
            localStorage.setItem('acordesai_songs_cache', JSON.stringify(cache));
        """)

        # 3. Navigate to the song detail page
        print("Navigating to song detail...")
        await page.goto("http://localhost:3000/#/song/test-song")

        # 4. Wait for song title to appear
        try:
            await page.wait_for_selector("text=Test Song for Scrolling", timeout=5000)
            print("Song detail loaded.")
        except Exception as e:
            print(f"Failed to find song title: {e}")
            await page.screenshot(path="verification_failed_load.png")
            await browser.close()
            return

        # 5. Measure initial scroll position
        initial_scroll = await page.evaluate("window.scrollY")
        print(f"Initial scroll Y: {initial_scroll}")

        # 6. Click 'Autoscroll' button
        # The button text changes based on state: "Autoscroll" -> "Pausar"
        # Let's find button by text "Autoscroll"
        print("Activating autoscroll...")
        try:
            await page.click("text=Autoscroll")
        except Exception as e:
             print(f"Could not find Autoscroll button: {e}")
             await page.screenshot(path="verification_failed_button.png")
             await browser.close()
             return

        # 7. Wait for a few seconds to let scroll happen
        print("Waiting for scroll...")
        await asyncio.sleep(3)

        # 8. Measure new scroll position
        new_scroll = await page.evaluate("window.scrollY")
        print(f"New scroll Y: {new_scroll}")

        # 9. Verify scroll position changed
        if new_scroll > initial_scroll:
            print("SUCCESS: Page scrolled automatically.")
        else:
            print("FAILURE: Page did not scroll.")

        # 10. Take screenshot
        await page.screenshot(path="verification_success.png")
        print("Screenshot saved to verification_success.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
