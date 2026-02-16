from playwright.sync_api import sync_playwright, expect
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
    page.on("pageerror", lambda exc: print(f"PAGE ERROR: {exc}"))

    print("Navigating to http://localhost:3000/#/favorites ...")
    try:
        # Navigate directly to favorites
        page.goto("http://localhost:3000/#/favorites", timeout=10000)
    except Exception as e:
        print(f"Error navigating: {e}")
        page.screenshot(path="error_screenshot.png")
        browser.close()
        return

    # Check for Favorites element
    print("Checking for 'Mis Favoritos'...")
    try:
        expect(page.get_by_text("Mis Favoritos")).to_be_visible(timeout=5000)
        print("Favorites page loaded successfully.")
    except Exception as e:
        print(f"Favorites page element not found: {e}")
        page.screenshot(path="favorites_fail.png")
        browser.close()
        return

    # Take screenshot
    print("Taking screenshot of favorites page...")
    page.screenshot(path="verification_favorites.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
