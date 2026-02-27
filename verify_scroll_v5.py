
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

        # 2. Mock storageService by intercepting calls or modifying state?
        # The best way in React functional components without window exposure is hard.
        # But we know `getSongData` in `App.tsx` calls `getCachedSong` from `storageService`.
        # `getCachedSong` reads from localStorage 'acordesai_songs_cache'.

        # The issue might be that the component `App` reads `cached` on `loadSong` call.
        # `loadSong` is triggered by click on search result or URL param?
        # URL param: The `App` component does NOT seem to have a `useEffect` that loads from URL ID on mount!
        # Let's check `App.tsx`...

        # `App.tsx` has:
        #   useEffect(() => {
        #     const path = location.pathname;
        #     if (path === '/') setActiveTab('HOME');
        #     ...
        #     else if (path.startsWith('/song/')) setActiveTab('SONG_DETAIL');
        #   }, [location]);

        # But `setCurrentSong` is NOT called based on URL!
        # `renderSongDetail` checks `if (!currentSong) return <div>Error loading song.</div>;`

        # THIS IS A BUG IN THE APP (or feature gap): Refreshing a song page breaks it if not in state?
        # Actually, `App.tsx` does not have logic to re-hydrate `currentSong` from URL ID on mount.
        # It only loads when `loadSong` is called (which sets state).

        # So to test, we must:
        # 1. Load Home
        # 2. Simulate a Search OR
        # 3. Simulate a Click on "Trending" or "History"

        # Let's use the Trending list which is always there.
        # "Lamento Boliviano - Enanitos Verdes" is in `TRENDING_SEARCHES`.

        # However, clicking trending triggers `handleSearch` -> `navigate('/search')` -> `searchSongs(API)`.
        # This requires API key.

        # Alternative: The `History` or `Favorites` lists read from LocalStorage!
        # If we inject into History or Favorites in LocalStorage, it should appear in those tabs.
        # Then clicking it triggers `loadSong` which checks cache FIRST.

        mock_song = {
            "id": "test-song-id",
            "title": "Wonderwall (Test)",
            "artist": "Oasis",
            "key": "Em",
            "content": "Em G D A7\\nLine 1\\nLine 2\\nLine 3\\nLine 4\\nLine 5\\nLine 6\\nLine 7\\nLine 8\\nLine 9\\nLine 10\\nLine 11\\nLine 12\\nLine 13\\nLine 14\\nLine 15\\nLine 16\\nLine 17\\nLine 18\\nLine 19\\nLine 20",
            "chords": {
                "guitar": "Em G D A7\\nLine 1\\nLine 2\\nLine 3\\nLine 4\\nLine 5\\nLine 6\\nLine 7\\nLine 8\\nLine 9\\nLine 10\\nLine 11\\nLine 12\\nLine 13\\nLine 14\\nLine 15\\nLine 16\\nLine 17\\nLine 18\\nLine 19\\nLine 20"
            }
        }

        mock_cache = { "test-song-id": mock_song }
        mock_history = ["test-song-id"]

        import json

        print("Injecting Cache and History into LocalStorage...")
        await page.evaluate(f"""
            localStorage.setItem('acordesai_songs_cache', JSON.stringify({json.dumps(mock_cache)}));
            localStorage.setItem('acordesai_history', JSON.stringify({json.dumps(mock_history)}));
        """)

        # Reload to ensure App reads fresh from storage on mount/render
        # (Though `getHistorySongsFull` reads cache dynamically)
        print("Reloading...")
        await page.reload()

        # Navigate to History tab
        print("Navigating to History...")
        await page.click("text=Historial")

        # Wait for the song to appear in list
        print("Waiting for history item...")
        await page.wait_for_selector("text=Wonderwall (Test)", timeout=5000)

        # Click the song to load it
        print("Clicking song...")
        await page.click("text=Wonderwall (Test)")

        # Now we should be in Song Detail and `currentSong` should be set from cache
        print("Waiting for song detail...")
        await page.wait_for_selector("text=Wonderwall (Test)", timeout=5000)

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
        else:
            print("VERIFICATION FAILED: Page did not scroll.")

        # 10. Take final screenshot
        await page.screenshot(path="verification_result.png")
        print("Screenshot saved to verification_result.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
