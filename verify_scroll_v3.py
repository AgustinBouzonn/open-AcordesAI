
import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # 1. Start the app (wait for initial load)
        print("Navigating to app root...")
        try:
            await page.goto("http://localhost:3000", timeout=15000)
            print("Root page loaded.")
        except Exception as e:
            print(f"Failed to load root page: {e}")
            await browser.close()
            return

        # 2. Inject mock song data directly into localStorage
        # The app uses 'acordesai_songs_cache' key.
        # We need to construct a valid Song object JSON string.

        mock_song_json = """
        {
            "test-song-id": {
                "id": "test-song-id",
                "title": "Wonderwall (Test)",
                "artist": "Oasis",
                "key": "Em",
                "content": "Em G D A7\\nAnd all the roads we have to walk are winding\\nAnd all the lights that lead us there are blinding\\n\\n[Chorus]\\nC D Em\\nBecause maybe\\nEm C Em G\\nYou're gonna be the one that saves me\\nAnd after all\\nYou're my wonderwall\\n\\n(Repeat x10 for scroll length)\\nEm G D A7\\nEm G D A7\\nEm G D A7\\nEm G D A7\\nEm G D A7\\nEm G D A7\\nEm G D A7\\nEm G D A7\\nEm G D A7\\nEm G D A7\\n",
                "chords": {
                    "guitar": "Em G D A7\\nAnd all the roads we have to walk are winding\\nAnd all the lights that lead us there are blinding\\n\\n[Chorus]\\nC D Em\\nBecause maybe\\nEm C Em G\\nYou're gonna be the one that saves me\\nAnd after all\\nYou're my wonderwall\\n\\n(Repeat x10 for scroll length)\\nEm G D A7\\nEm G D A7\\nEm G D A7\\nEm G D A7\\nEm G D A7\\nEm G D A7\\nEm G D A7\\nEm G D A7\\nEm G D A7\\nEm G D A7\\n"
                }
            }
        }
        """

        print("Injecting localStorage mock data...")
        await page.evaluate(f"localStorage.setItem('acordesai_songs_cache', `{mock_song_json}`)")

        # 3. Navigate directly to the song URL
        # The app uses HashRouter, so the URL structure is /#/song/:id
        print("Navigating to song detail page...")
        await page.goto("http://localhost:3000/#/song/test-song-id")

        # 4. Wait for song content to appear
        print("Waiting for song content...")
        try:
            # Look for the title or artist we injected
            await page.wait_for_selector("text=Wonderwall (Test)", timeout=10000)
            print("Song loaded successfully.")
        except Exception as e:
            print(f"Song failed to load: {e}")
            await page.screenshot(path="verification_failed_song_load.png")
            await browser.close()
            return

        # 5. Measure initial scroll position
        initial_scroll_y = await page.evaluate("window.scrollY")
        print(f"Initial Scroll Y: {initial_scroll_y}")

        # 6. Find and Click the 'Autoscroll' button
        # The button text is "Autoscroll" initially
        print("Clicking Autoscroll...")
        try:
            await page.click("text=Autoscroll")
        except Exception as e:
            print(f"Autoscroll button not found: {e}")
            await page.screenshot(path="verification_failed_no_button.png")
            await browser.close()
            return

        # 7. Wait to allow scrolling to happen
        print("Waiting 5 seconds for scroll...")
        await asyncio.sleep(5)

        # 8. Measure new scroll position
        new_scroll_y = await page.evaluate("window.scrollY")
        print(f"New Scroll Y: {new_scroll_y}")

        # 9. Verification Logic
        if new_scroll_y > initial_scroll_y:
            print("VERIFICATION PASSED: Page scrolled down.")
        else:
            print("VERIFICATION FAILED: Page did not scroll.")

        # 10. Take final screenshot
        await page.screenshot(path="verification_result.png")
        print("Screenshot saved to verification_result.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
