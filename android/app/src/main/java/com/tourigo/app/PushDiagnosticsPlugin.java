package com.tourigo.app;

import android.content.Context;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.firebase.FirebaseApp;

import java.util.List;

@CapacitorPlugin(name = "PushDiagnostics")
public class PushDiagnosticsPlugin extends Plugin {

    @PluginMethod
    public void getStatus(PluginCall call) {
        JSObject result = new JSObject();
        Context context = getContext();

        int googleAppIdResourceId = context
            .getResources()
            .getIdentifier("google_app_id", "string", context.getPackageName());
        boolean hasGoogleAppId = googleAppIdResourceId != 0;

        boolean initialized = false;
        String error = null;

        try {
            List<FirebaseApp> firebaseApps = FirebaseApp.getApps(context);
            initialized = !firebaseApps.isEmpty();

            if (!initialized && hasGoogleAppId) {
                FirebaseApp firebaseApp = FirebaseApp.initializeApp(context);
                initialized = firebaseApp != null;
            }
        } catch (Exception exception) {
            error = exception.getMessage();
        }

        result.put("configured", hasGoogleAppId);
        result.put("initialized", initialized);
        if (error != null && !error.isBlank()) {
            result.put("error", error);
        }

        call.resolve(result);
    }
}
