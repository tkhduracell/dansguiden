package feality.dans;

import android.content.res.Configuration;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onResume() {
        super.onResume();
        int nightModeFlags = getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK;
        WebView webView = this.bridge.getWebView();

        if (nightModeFlags == Configuration.UI_MODE_NIGHT_YES) {
            webView.evaluateJavascript("document.body.classList.toggle('dark', true);", null);
        } else {
            webView.evaluateJavascript("document.body.classList.toggle('dark', false);", null);
        }
    }

}
