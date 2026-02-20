from playwright.sync_api import sync_playwright, expect
import time
import json

def verify_autoscroll():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Create context to bypass permissions or modify storage if needed
        context = browser.new_context()
        page = context.new_page()

        # 1. Load the app to initialize local storage context
        try:
            page.goto("http://localhost:3000/")
            # Wait for app to be ready (e.g. title or root element)
            expect(page.locator("#root")).to_be_visible(timeout=5000)
        except Exception as e:
            print(f"Failed to load page: {e}")
            return

        # 2. Inject mock song into localStorage (Cache AND Favorites)
        mock_content = "C G Am F\n" * 100 # Ensure it's long enough to scroll
        mock_song = {
            "id": "test-song",
            "title": "Test Song",
            "artist": "Test Artist",
            "key": "C",
            "content": mock_content,
            "chords": { "guitar": mock_content }
        }

        songs_cache = { "test-song": mock_song }
        favorites = ["test-song"]

        # Pass data safely via argument
        page.evaluate("""(data) => {
            localStorage.setItem('acordesai_songs_cache', JSON.stringify(data.cache));
            localStorage.setItem('acordesai_favorites', JSON.stringify(data.favorites));
        }""", {"cache": songs_cache, "favorites": favorites})
        print("Injected mock song into localStorage (Cache + Favorites)")

        # 3. Reload to ensure the app picks up the new localStorage state
        page.reload()

        # 4. Navigate to Favorites via UI (to ensure App state is correct)
        page.goto("http://localhost:3000/#/favorites")

        # 5. Click the song in Favorites list
        try:
            # Wait for song card
            song_card = page.get_by_text("Test Song")
            song_card.click()
            print("Clicked song in favorites")
        except Exception as e:
            print(f"Could not find song in favorites: {e}")
            page.screenshot(path="/home/jules/verification/failed_favorites.png")
            browser.close()
            return

        # 6. Wait for song detail view
        try:
            expect(page.get_by_role("heading", name="Test Song")).to_be_visible(timeout=5000)
            print("Song loaded successfully via Favorites")
        except AssertionError:
            print("Song did not load. Check screenshot.")
            page.screenshot(path="/home/jules/verification/failed_load_via_fav.png")
            browser.close()
            return

        # 7. Check initial scroll position
        initial_scroll = page.evaluate("window.scrollY")
        print(f"Initial scroll: {initial_scroll}")

        # 8. Click Autoscroll
        try:
            autoscroll_btn = page.get_by_text("Autoscroll", exact=True)
            autoscroll_btn.click()
            print("Clicked Autoscroll")
        except Exception as e:
            print(f"Could not find Autoscroll button: {e}")
            page.screenshot(path="/home/jules/verification/failed_click.png")
            browser.close()
            return

        # 9. Wait for scroll
        time.sleep(2)

        # 10. Check new scroll position
        new_scroll = page.evaluate("window.scrollY")
        print(f"New scroll: {new_scroll}")

        if new_scroll > initial_scroll:
            print("SUCCESS: Page scrolled automatically!")
        else:
            print("FAILURE: Page did not scroll.")

        # 11. Take screenshot
        page.screenshot(path="/home/jules/verification/autoscroll_success.png")

        browser.close()

if __name__ == "__main__":
    verify_autoscroll()
