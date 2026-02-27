
import asyncio
from playwright.async_api import async_playwright
import json

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        print("Navigating to app root...")
        try:
            await page.goto("http://localhost:3000", timeout=15000)
            print("Root page loaded.")
        except Exception as e:
            print(f"Failed to load root page: {e}")
            await browser.close()
            return

        # Inject data
        # We need to construct the JSON string for the cache correctly.
        # The key in the cache dict is "test-song-id".
        # The Song object also has id "test-song-id".

        # Create a Python dictionary first
        mock_song = {
            "id": "test-song-id",
            "title": "Wonderwall (Test)",
            "artist": "Oasis",
            "key": "Em",
            "content": ("Em G D A7\n" * 50),
            "chords": {
                "guitar": ("Em G D A7\n" * 50)
            }
        }

        mock_cache = { "test-song-id": mock_song }
        mock_history = ["test-song-id"]

        # Serialize to JSON strings
        cache_json = json.dumps(mock_cache)
        history_json = json.dumps(mock_history)

        print("Injecting Cache and History into LocalStorage...")

        # Use page.evaluate with arguments to avoid string escaping hell
        await page.evaluate("""([cache, history]) => {
            localStorage.setItem('acordesai_songs_cache', cache);
            localStorage.setItem('acordesai_history', history);
        }""", [cache_json, history_json])

        print("Reloading to apply localStorage...")
        await page.reload()

        # Debug: Screenshot home page to see if "Historial" is visible
        await page.screenshot(path="debug_home.png")

        # Try finding "Historial" button/link.
        # It might be in the mobile bottom bar or desktop header.
        # Let's use a more robust locator if text fails.
        # But text should work if language is Spanish as in code.

        print("Clicking Historial...")
        try:
            # Click on any element with text "Historial"
            await page.click("text=Historial", timeout=5000)
        except Exception as e:
            print(f"Failed to click Historial: {e}")
            await browser.close()
            return

        # Wait for the song to appear in list
        print("Waiting for history item...")
        try:
            await page.wait_for_selector("text=Wonderwall (Test)", timeout=5000)
        except:
             print("Song not found in history list.")
             await page.screenshot(path="debug_history_list.png")
             await browser.close()
             return

        # Click the song to load it
        print("Clicking song...")
        await page.click("text=Wonderwall (Test)")

        # Now we should be in Song Detail
        print("Waiting for song detail...")
        try:
            await page.wait_for_selector("text=Wonderwall (Test)", timeout=10000)
        except:
             print("Song detail load failed.")
             await page.screenshot(path="debug_song_detail_fail.png")
             await browser.close()
             return

        # 5. Measure initial scroll position
        initial_scroll_y = await page.evaluate("window.scrollY")
        print(f"Initial Scroll Y: {initial_scroll_y}")

        # 6. Find and Click the 'Autoscroll' button
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
            # 10. Take final screenshot
            await page.screenshot(path="verification_success.png")
            print("Screenshot saved to verification_success.png")
        else:
            print("VERIFICATION FAILED: Page did not scroll.")
            await page.screenshot(path="verification_failed_scroll.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
