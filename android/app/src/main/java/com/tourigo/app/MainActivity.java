package com.tourigo.app;

import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(PushDiagnosticsPlugin.class);
        super.onCreate(savedInstanceState);
    }

    @Override
    public void onBackPressed() {
        Bridge bridge = getBridge();
        WebView webView = bridge != null ? bridge.getWebView() : null;

        if (webView != null && webView.canGoBack()) {
            webView.goBack();
            return;
        }

        super.onBackPressed();
    }
}
