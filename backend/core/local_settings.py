from .settings import DATABASES as BASE_DATABASES

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DATABASES["default"].get("NAME", "db.sqlite3"),
    }
}
