# Dansguiden


## Secrets

    gcloud --project=dansguiden-... secrets versions access latest --secret="GOOGLE_PLAY_KEYSTORE" --out-file=android/google_play_keystore
    gcloud --project=dansguiden-... secrets versions access latest --secret="GOOGLE_PLAY_KEYSTORE_SETTINGS" --out-file=android/google_play_keystore.properties
