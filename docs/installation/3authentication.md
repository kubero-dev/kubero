# Authentication
The UI has a built-in authentication to restrict access. All methods can be used simultaneously.

## local
This may fit for single users and very small teams. The authentication credentials are stored in the environment variable KUBERO_USERS as a base64 encoded string.

> ⚠️ **Warning** <br>
> Do not use this example credentials

**1) create an encrypted password**
```
PASSWORD=asdf &&
SALT=asdf &&
echo -n $PASSWORD | openssl dgst -sha256 -hmac $SALT
```

**2) create a JSON file with the encrypted password. For example users.json**
```json
[
  {
    "id": 1,
    "method": "local",
    "username": "asdf",
    "password": "8a8423ba78c8f3da60a602493663c1cdc248a89541b12980e292399c0f0cad21",
    "insecure": false
    "apitoken": "asdf",
  },
  {
    "id": 2,
    "method": "local",
    "username": "qwer",
    "password": "qwer",
    "insecure": true,
    "apitoken": "asdf",
  }
]
```
**3) encode the created file to base64**
```
cat users.json | base64
```

**4) put the env var in your secrets.yaml and apply it**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: kubero-secrets
type: Opaque
data:
    ...
    ...
stringData:
    KUBERO_USERS: "WwogIHsKICAgICJpZCI6IDEsCiAgICAibWV0aG9kIjogImxvY2FsIiwKICAgICJ1c2VybmFtZSI6ICJhc2RmIiwKICAgICJwYXNzd29yZCI6ICI4YTg0MjNiYTc4YzhmM2RhNjBhNjAyNDkzNjYzYzFjZGMyNDhhODk1NDFiMTI5ODBlMjkyMzk5YzBmMGNhZDIxIiwKICAgICJpbnNlY3VyZSI6IGZhbHNlCiAgfSwKICB7CiAgICAiaWQiOiAyLAogICAgIm1ldGhvZCI6ICJsb2NhbCIsCiAgICAidXNlcm5hbWUiOiAicXdlciIsCiAgICAicGFzc3dvcmQiOiAicXdlciIsCiAgICAiaW5zZWN1cmUiOiB0cnVlCiAgfQpd"
    ...
    ...
```

```bash
kubectl apply -f secrets.yaml -n kubero
```

## github
If you have already have a Github team and want to grant access to them, use this section.

## Oauth2 (gitea)
This should fit all other usecases.