from playwright.sync_api import sync_playwright

def verify_app():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        page.on("console", lambda msg: print(f"Browser console: {msg.text}"))
        page.on("pageerror", lambda err: print(f"Browser error: {err}"))

        try:
            print("Navigating to home...")
            page.goto("http://localhost:3000/")

            # Wait for content
            page.wait_for_selector("h1", timeout=10000)

            # Verify Home Page content
            title = page.locator("h1").text_content()
            print(f"Page title: {title}")
            assert "Toca lo que quieras" in title

            # Verify Trending Searches
            trending = page.locator("text=Tendencias Hoy")
            assert trending.is_visible()

            # Verify a trending item exists (e.g. Wonderwall)
            wonderwall = page.locator("text=Wonderwall")
            assert wonderwall.is_visible()

            print("Home page verified.")

            # Take screenshot of Home
            page.screenshot(path="verification/home.png")
            print("Screenshot saved to verification/home.png")

            # Navigate to Favorites
            print("Navigating to Favorites...")
            # We don't have a direct link in the UI visible on mobile without menu maybe?
            # Layout component likely has navigation.
            # But I can just go to URL directly since it's a SPA with HashRouter?
            # App uses HashRouter. So it should be /#/favorites

            page.goto("http://localhost:3000/#/favorites")
            page.wait_for_selector("h2", timeout=5000)

            fav_title = page.locator("h2").text_content()
            print(f"Favorites title: {fav_title}")
            assert "Mis Favoritos" in fav_title

            # Take screenshot of Favorites
            page.screenshot(path="verification/favorites.png")
            print("Screenshot saved to verification/favorites.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_app()
