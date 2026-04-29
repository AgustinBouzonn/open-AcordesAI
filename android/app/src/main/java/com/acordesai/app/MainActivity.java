package com.acordesai.app;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.ValueCallback;

import com.getcapacitor.BridgeActivity;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class MainActivity extends BridgeActivity {

    private static final Pattern URL_PATTERN = Pattern.compile("https?://\\S+");

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        handleSharedIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleSharedIntent(intent);
    }

    private void handleSharedIntent(Intent intent) {
        if (intent == null) return;
        String url = null;

        String action = intent.getAction();
        String type = intent.getType();
        if (Intent.ACTION_SEND.equals(action) && type != null && type.startsWith("text/")) {
            String shared = intent.getStringExtra(Intent.EXTRA_TEXT);
            if (shared != null) url = extractFirstUrl(shared);
        } else if (Intent.ACTION_VIEW.equals(action)) {
            Uri data = intent.getData();
            if (data != null) {
                String s = data.toString();
                if (looksLikeImportTarget(s)) url = s;
            }
        }

        if (url != null) deliverSharedUrl(url);
    }

    private boolean looksLikeImportTarget(String url) {
        return url != null && (
            url.contains("cifraclub.com") ||
            url.contains("ultimateguitar.com") ||
            url.contains("cifraspot.com")
        );
    }

    private String extractFirstUrl(String text) {
        Matcher m = URL_PATTERN.matcher(text);
        if (m.find()) {
            String candidate = m.group();
            return looksLikeImportTarget(candidate) ? candidate : candidate;
        }
        return null;
    }

    private void deliverSharedUrl(final String url) {
        final String escaped = jsonString(url);
        final String script =
            "window.__acordesaiSharedUrl=" + escaped + ";" +
            "window.dispatchEvent(new CustomEvent('acordesai-shared-url',{detail:" + escaped + "}));";
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                if (bridge == null || bridge.getWebView() == null) return;
                bridge.getWebView().evaluateJavascript(script, new ValueCallback<String>() {
                    @Override public void onReceiveValue(String value) { /* noop */ }
                });
            }
        });
    }

    private String jsonString(String s) {
        StringBuilder sb = new StringBuilder("\"");
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '"':  sb.append("\\\""); break;
                case '\\': sb.append("\\\\"); break;
                case '\n': sb.append("\\n"); break;
                case '\r': sb.append("\\r"); break;
                case '\t': sb.append("\\t"); break;
                default:
                    if (c < 0x20) sb.append(String.format("\\u%04x", (int) c));
                    else sb.append(c);
            }
        }
        sb.append("\"");
        return sb.toString();
    }
}
